define(['videos/vpaid'], function(vpaidModule) {
    'use strict';

    describe('VPAIDService', function() {
        var VPAIDService,
            c6EventEmitter,
            $q, $rootScope,
            $interval, $timeout, $log,
            $window, template;

        var isCinema6playerMock = true;

        function MockFlashPlayer() {
            c6EventEmitter(this);

            this.loadAd = jasmine.createSpy('player.loadAd()');
            this.startAd = jasmine.createSpy('player.startAd()');
            this.pauseAd = jasmine.createSpy('player.pause()');
            this.getDisplayBanners = jasmine.createSpy('player.getDisplayBanners()');
            this.setVolume = jasmine.createSpy('player.setVolume()');
            this.resumeAd = jasmine.createSpy('player.resumeAd()');
            this.stopAd = jasmine.createSpy('player.resumeAd()');
            this.isCinema6player = function() { return isCinema6playerMock; };
            this.getAdProperties = jasmine.createSpy('player.getAdProperties()').and.returnValue({
                width: 640,
                height: 360,
                adLinear: true,
                adExpanded: false,
                adRemainingTime: 3,
                adVolume: 50,
                adCurrentTime: 2,
                adDuration: 5
            });
        }

        template = [
            '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" style="width:100%;height:100%;position:absolute;top:0;right:0;bottom:0;left:0;visibility:visible;" id="c6VPAIDplayer_ie">',
            '    <param name="movie" value="__SWF__" />',
            '    <param name="quality" value="high" />',
            '    <param name="bgcolor" value="#000000" />',
            '    <param name="play" value="false" />',
            '    <param name="loop" value="false" />',
            '    <param name="wmode" value="opaque" />',
            '    <param name="scale" value="noscale" />',
            '    <param name="salign" value="lt" />',
            '    <param name="flashvars" value="__FLASHVARS__" />',
            '    <param name="allowScriptAccess" value="always" />',
            '    <param name="allowFullscreen" value="true" />',
            '    <!--[if !IE]>-->',
            '    <object type="application/x-shockwave-flash" data="__SWF__" id="c6VPAIDplayer" style="width:100%;height:100%;position:absolute;top:0;right:0;bottom:0;left:0;">',
            '        <param name="movie" value="__SWF__" />',
            '        <param name="quality" value="high" />',
            '        <param name="bgcolor" value="#000000" />',
            '        <param name="play" value="false" />',
            '        <param name="loop" value="false" />',
            '        <param name="wmode" value="opaque" />',
            '        <param name="scale" value="noscale" />',
            '        <param name="salign" value="lt" />',
            '        <param name="flashvars" value="__FLASHVARS__" />',
            '        <param name="allowScriptAccess" value="always" />',
            '        <param name="allowFullscreen" value="true" />',
            '    </object>',
            '    <!--<![endif]-->',
            '</object>'
        ].join('\n');

        beforeEach(function() {
            module(vpaidModule.name);
            module(function(VPAIDServiceProvider) {
                VPAIDServiceProvider.swfUrl('lib/c6ui/videos/swf/player.swf')
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $window = $injector.get('$window');
                $timeout = $injector.get('$timeout');
                $interval = $injector.get('$interval');
                $log = $injector.get('$log');
                $log.context = function() { return $log; };

                VPAIDService = $injector.get('VPAIDService');

                c6EventEmitter = $injector.get('c6EventEmitter');
            });
        });

        it('should exist', function() {
            expect(VPAIDService).toEqual(jasmine.any(Object));
        });

        describe('createPlayer()', function() {
            var id,
                adTag,
                $element,
                mockFlashPlayer,
                messageHandler,
                player;

            beforeEach(function() {
                id = '12345';
                adTag = 'http://adap.tv/some-ad-tag';
                mockFlashPlayer = new MockFlashPlayer();

                $element = [{
                    querySelectorAll: jasmine.createSpy('$element[0].querySelectorAll()')
                        .and.returnValue([mockFlashPlayer])
                }];
                $element.prepend = jasmine.createSpy('$element.prepend()');

                spyOn($window, 'addEventListener').and.callFake(function(event, listener) {
                    messageHandler = listener;
                });

                player = VPAIDService.createPlayer(id, adTag, template, $element);
            });

            it('should return the flash player object', function() {
                expect(player).toEqual(jasmine.any(Object));
                expect($element.prepend).not.toHaveBeenCalled();
            });

            describe('player methods', function() {
                var success, failure,
                    adResponse, adLoaded, adStarted, adVideoStarted;

                beforeEach(function() {
                    adResponse = {
                        data: '{ "__vpaid__" : { "type" : "onAdResponse", "id" : "12345" } }',
                    };
                    adLoaded = {
                        data: '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "12345" } }',
                    };
                    adStarted = {
                        data: '{ "__vpaid__" : { "type" : "AdStarted", "id" : "12345" } }',
                    },
                    adVideoStarted = {
                        data: '{ "__vpaid__" : { "type" : "AdVideoStart", "id" : "12345" } }',
                    };

                    success = jasmine.createSpy('success spy');
                    failure = jasmine.createSpy('failure spy');
                });

                describe('insertHTML()', function() {
                    it('should insert the template', function() {
                        player.insertHTML();
                        expect($element.prepend).toHaveBeenCalled();
                        expect($element.prepend.calls.mostRecent().args[0]).toMatch('&playerId=12345');
                        expect($element.prepend.calls.mostRecent().args[0]).toMatch('adXmlUrl=http%3A%2F%2Fadap.tv%2Fsome-ad-tag');
                        expect($element.prepend.calls.mostRecent().args[0]).toMatch('lib/c6ui/videos/swf/player.swf');
                    });

                    it('should return a promise', function() {
                        expect(player.insertHTML().then).toBeDefined();
                    });

                    it('should fulfill the promise if the player responds', function() {
                        player.insertHTML().then(success);
                        $interval.flush(200);
                        expect(success).toHaveBeenCalledWith('successfully inserted and loaded player');
                    });

                    it('should reject the promise after 5 seconds if the player doesnt respond', function() {
                        isCinema6playerMock = false;
                        player.insertHTML().then(null, failure);
                        $interval.flush(2000);
                        expect(failure).not.toHaveBeenCalled();
                        $interval.flush(6000);
                        expect(failure).toHaveBeenCalledWith('error, do something');
                        isCinema6playerMock = true;
                    });
                });

                describe('loadAd()', function() {
                    it('should return a promise', function() {
                        expect(player.loadAd().then).toBeDefined();
                    });

                    it('should reject the promise if the ad timer times out', function() {
                        player.loadAd().then(null, failure);
                        player.startAd();

                        $timeout.flush();
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should not call loadAd on the object until onAdResponse has fired', function() {
                        player.loadAd();
                        expect(mockFlashPlayer.loadAd).not.toHaveBeenCalled();
                    });

                    it('should call loadAd() on the flash object after onAdResponse fires', function() {
                        player.loadAd().then(success);
                        messageHandler(adResponse);
                        expect(mockFlashPlayer.loadAd).toHaveBeenCalled();
                    });

                    it('should resolve the promise after AdLoaded is fired', function() {
                        player.loadAd().then(success);
                        messageHandler(adResponse);
                        messageHandler(adLoaded);
                        expect(mockFlashPlayer.loadAd).toHaveBeenCalled();
                        expect(success).toHaveBeenCalled();
                    });

                    it('should call loadAd() immediately if onAdResponse has already fired', function() {
                        messageHandler(adResponse);
                        player.loadAd();
                        $rootScope.$digest();
                        expect(mockFlashPlayer.loadAd).toHaveBeenCalled();
                    });
                });

                describe('startAd()', function() {
                    it('should return a promise', function() {
                        expect(player.startAd().then).toBeDefined();
                    });

                    it('should reject the promise if the ad timer times out', function() {
                        player.startAd().then(null, failure);

                        $timeout.flush();
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should not call startAd() if AdLoaded has not fired', function() {
                        player.startAd();
                        expect(mockFlashPlayer.startAd).not.toHaveBeenCalled();
                    });

                    it('should call startAd() on the flash object after AdLoaded fires', function() {
                        player.startAd();
                        messageHandler(adLoaded);
                        expect(mockFlashPlayer.startAd).toHaveBeenCalled();
                    });

                    it('should call startAd() immediately if AdLoaded has already fired', function() {
                        messageHandler(adLoaded);
                        player.startAd();
                        $rootScope.$digest();
                        expect(mockFlashPlayer.startAd).toHaveBeenCalled();
                    });

                    describe('ad timer', function() {
                        it('should reject all promises after 3 seconds', function() {
                            player.startAd().then(null, failure);

                            $timeout.flush();

                            expect(mockFlashPlayer.startAd).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalled();

                            messageHandler(adResponse);
                            messageHandler(adLoaded);
                            messageHandler(adStarted);

                            expect(mockFlashPlayer.startAd).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalled();
                        });

                        it('should reject the returned promise if the ad has loaded but real ad has not started', function() {
                            messageHandler(adLoaded);
                            messageHandler(adStarted);
                            messageHandler(adVideoStarted);

                            mockFlashPlayer.getAdProperties.and.returnValue({adCurrentTime:0});

                            player.startAd().then(success, failure);

                            $interval.flush(500);
                            $timeout.flush();

                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalled();
                        });

                        it('should resolve if all events fire', function() {
                            player.startAd().then(success, failure);

                            messageHandler(adLoaded);
                            messageHandler(adStarted);
                            messageHandler(adVideoStarted);

                            $interval.flush(500);
                            $timeout.flush();

                            expect(success).toHaveBeenCalled();
                            expect(failure).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('pause()', function() {
                    it('should return a promise', function() {
                        expect(player.pause().then).toBeDefined();
                    });

                    it('should reject the promise if the ad timer times out', function() {
                        player.startAd();
                        player.pause().then(null, failure);

                        $timeout.flush();
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should not call pauseAd() if AdLoaded has not fired', function() {
                        player.pause();
                        expect(mockFlashPlayer.pauseAd).not.toHaveBeenCalled();
                    });

                    it('should call pauseAd() on the flash object after AdLoaded fires', function() {
                        player.pause();
                        messageHandler(adLoaded);
                        expect(mockFlashPlayer.pauseAd).toHaveBeenCalled();
                    });

                    it('should call pauseAd() immediately if AdLoaded has already fired', function() {
                        messageHandler(adLoaded);
                        player.pause();
                        $rootScope.$digest();
                        expect(mockFlashPlayer.pauseAd).toHaveBeenCalled();
                    });
                });

                describe('getAdProperties()', function() {
                    it('should call getAdProperties() on the flash object', function() {
                        player.getAdProperties();
                        expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                    });
                });

                describe('getDisplayBanners()', function() {
                    it('should call getDisplayBanners() on the flash object', function() {
                        player.getDisplayBanners();
                        expect(mockFlashPlayer.getDisplayBanners).toHaveBeenCalled();
                    });
                });

                describe('setVolume()', function() {
                    it('should call setVolume() on the flash object', function() {
                        player.setVolume(100);
                        expect(mockFlashPlayer.setVolume).toHaveBeenCalledWith(100);
                    });
                });

                describe('resumeAd()', function() {
                    it('should return a promise', function() {
                        expect(player.resumeAd().then).toBeDefined();
                    });

                    it('should reject the promise if the ad timer times out', function() {
                        player.startAd();
                        player.pause();
                        player.resumeAd().then(null, failure);

                        $timeout.flush();
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should not call resumeAd() if AdLoaded has not fired', function() {
                        player.resumeAd();
                        expect(mockFlashPlayer.resumeAd).not.toHaveBeenCalled();
                    });

                    it('should call resumeAd() on the flash object after AdLoaded fires', function() {
                        player.resumeAd();
                        messageHandler(adLoaded);
                        expect(mockFlashPlayer.resumeAd).toHaveBeenCalled();
                    });

                    it('should call resumeAd() immediately if AdLoaded has already fired', function() {
                        messageHandler(adLoaded);
                        player.resumeAd();
                        $rootScope.$digest();
                        expect(mockFlashPlayer.resumeAd).toHaveBeenCalled();
                    });
                });

                describe('stopAd()', function() {
                    it('should call stopAd() on the flash object', function() {
                        player.stopAd();
                        expect(mockFlashPlayer.stopAd).toHaveBeenCalled();
                    });
                });

                describe('isC6VpaidPlayer()', function() {
                    it('should call isCinema6player() on the flash object', function() {
                        spyOn(mockFlashPlayer, 'isCinema6player').and.callThrough();
                        player.isC6VpaidPlayer();
                        expect(mockFlashPlayer.isCinema6player).toHaveBeenCalled();
                    });
                });

                describe('getCurrentTime()', function() {
                    it('should call getAdProperties().adCurrentTime on the flash object', function() {
                        var time = player.getCurrentTime();
                        expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                        expect(time).toBe(2);
                    });
                });

                describe('getDuration()', function() {
                    it('should call getAdProperties.adDuration on the flash object', function() {
                        var duration = player.getDuration();
                        expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                        expect(duration).toBe(5);
                    });
                });
            });

            describe('player events', function() {
                beforeEach(function() {
                    spyOn(player, 'emit').and.callThrough();
                });

                describe('ready', function() {
                    it('should emit when isCinema6player returns true', function() {
                        player.insertHTML();
                        $interval.flush(200);
                        expect(player.emit).toHaveBeenCalledWith('ready', player);
                    });

                    it('should not emit if isCinema6player return falsey', function() {
                        isCinema6playerMock = false;
                        player.insertHTML();
                        $interval.flush(200);
                        expect(player.emit).not.toHaveBeenCalled();
                    });
                });

                describe('play', function() {
                    it('should emit when AdStarted is postMessaged', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdStarted", "id" : "12345" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('play', player);
                    });

                    it('should emit when AdPlaying is postMessaged', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdPlaying", "id" : "12345" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('play', player);
                    });

                    it('should not emit when id doesn\'t match', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdStarted", "id" : "wrongId" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('play', player);
                    });

                    it('should not emit when event type is wrong', function() {
                        var message = {};

                        message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('play', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('play', player);

                        message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('play', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('play', player);
                    });
                });

                describe('pause', function() {
                    it('should emit when AdPaused is postMessaged', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdPaused", "id" : "12345" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('pause', player);
                    });

                    it('should not emit when id doesn\'t match', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdPaused", "id" : "wrongId" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('pause', player);
                    });

                    it('should not emit when event type is wrong', function() {
                        var message = {};

                        message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                        message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('pause', player);
                    });
                });

                describe('ended', function() {
                    [
                        {
                            data: '{ "__vpaid__" : { "type" : "AdError", "id" : "12345" } }',
                        },
                        {
                            data: '{ "__vpaid__" : { "type" : "AdStopped", "id" : "12345" } }',
                        },
                        {
                            data: '{ "__vpaid__" : { "type" : "AdVideoComplete", "id" : "12345" } }',
                        },
                        {
                            data: '{ "__vpaid__" : { "type" : "onAllAdsCompleted", "id" : "12345" } }',
                        }
                    ].forEach(function(message) {
                        it('should emit when AdEnded/AdStopped/AdVideoComplete/onAllAdsComplete is postMessaged', function() {
                            messageHandler(message);

                            expect(player.emit).toHaveBeenCalledWith('ended', player);
                        });
                    });

                    it('should not emit when id doesn\'t match', function() {
                        var message = {
                            data: '{ "__vpaid__" : { "type" : "AdVideoComplete", "id" : "wrongId" } }',
                        };

                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('ended', player);
                    });

                    it('should not emit when event type is wrong', function() {
                        var message = {};

                        message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('ended', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('ended', player);

                        message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('ended', player);
                    });
                });

                describe('other VPAID events', function() {
                    it('should be emitted in addition to playerInterface events', function() {
                        var message = {};

                        message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('AdLoaded', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('AdClickThru', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "12345" } }';
                        messageHandler(message);

                        expect(player.emit).toHaveBeenCalledWith('AdError', player);
                    });

                    it('should not be emitted when id doesn\'t match', function() {
                        var message = {};

                        message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "wrongId" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('AdLoaded', player);

                        message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "anotherWrongId" } }';
                        messageHandler(message);

                        expect(player.emit).not.toHaveBeenCalledWith('AdClickThru', player);
                    });
                });
            });
        });
    });
});