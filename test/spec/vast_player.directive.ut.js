define(['videos/vast'], function(vastModule) {
    'use strict';

    describe('<vast-player>', function() {
        var $rootScope,
            $scope,
            $player,
            $compile,
            $timeout,
            $interval,
            $window,
            $http,
            $q,
            c6VideoService,
            c6BrowserInfo,
            VASTService,
            initSpy,
            iface,
            _player,
            scope,
            vastSpy,
            vastObject,
            vastDeferred;

        var VAST = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '',
            '<VAST version="2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="oxml.xsd">',
            '    <Ad id="a73834">',
            '        <InLine>',
            '            <AdSystem version="1.0">Adap.tv</AdSystem>',
            '',
            '            <AdTitle><![CDATA[Adaptv Ad]]></AdTitle>',
            '',
            '            <Error><![CDATA[http://log.adap.tv/log?event=error&lastBid=&errNo=&pricingInfo=&nF=&adSourceTime=&adSourceId=73833&bidId=&afppId=73834&exSId=57916&adSpotId=&pet=preroll&pod=-2&position=-2&marketplaceId=&adPlanId=-2&adaptag=&nap=true&key=alexorlovstestpublisher&buyerId=&campaignId=14168&pageUrl=test.com&adapDetD=&sellRepD=test.com&urlDetMeth=&targDSellRep=1&zid=&url=&id=&duration=&a.geostrings=&uid=3922791298847480813&htmlEnabled=false&width=&height=&context=&categories=&sessionId=&serverRev=402051622&playerRev=&a.rid=&a.cluster=0&rtype=ah&a.ssc=1&a.asn=m1-58&a.profile_id=&p.vw.viewable=-1&a.sdk=&a.sdkType=&a.appReq=0&a.sscCap=0&a.carrier_mcc=&a.carrier_mnc=&a.platformDevice=ONLINE_VIDEO&ipAddressOverride=23.31.224.169&p.vw.active=-1&eov=86007638]]></Error>',
            '',
            '            <Impression><![CDATA[http://qlog.adap.tv/log?3a=adSuccess&51=ZX4madbHHCc_&50=ZX4madbHHCc_&72=&8=&d=&b=-2&53=&2c=&6c=&6d=&28=qUsI3M4M68M_&a8=1zwJCAUlQOU_&25=16242&4b=73834%2C73833&b6=b80ab42f50468aa847de612acf6511c6c3a4ffeae13904174c8e5c16f15d4b72&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Impression>',
            '',
            '            <Impression><![CDATA[http://conversions.adap.tv/conversion/wc?adSourceId=73833&bidId=&afppId=73834&creativeId=16242&exSId=57916&key=alexorlovstestpublisher&a.pvt=0&a.rid=&eov=86007638]]></Impression>',
            '',
            '            <Creatives>',
            '                <Creative>',
            '                    <Linear>',
            '                        <Duration><![CDATA[00:00:15]]></Duration>',
            '',
            '                        <TrackingEvents>',
            '                            <Tracking event="start"><![CDATA[http://log.adap.tv/log?3a=progressDisplay0&25=16242&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Tracking>',
            '',
            '                            <Tracking event="firstQuartile"><![CDATA[http://log.adap.tv/log?3a=progressDisplay25&25=16242&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Tracking>',
            '',
            '                            <Tracking event="midpoint"><![CDATA[http://log.adap.tv/log?3a=progressDisplay50&25=16242&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Tracking>',
            '',
            '                            <Tracking event="thirdQuartile"><![CDATA[http://log.adap.tv/log?3a=progressDisplay75&25=16242&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Tracking>',
            '',
            '                            <Tracking event="complete"><![CDATA[http://log.adap.tv/log?3a=progressDisplay100&25=16242&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1]]></Tracking>',
            '                        </TrackingEvents>',
            '',
            '                        <VideoClicks>',
            '                            <ClickThrough><![CDATA[http://qlog.adap.tv/log?3a=click&d3=&72=&25=16242&6c=&5=73833&14=&2=73834&37=57916&a=&65=preroll&6a=-2&6b=-2&4f=&3=-2&c=&55=true&5c=alexorlovstestpublisher&5b=&18=14168&2e=test.com&2f=&30=test.com&31=&32=1&90=&86=&83=&82=&af=&80=3922791298847480813&42=false&8f=&41=&21=&1b=&76=&77=402051622&67=&d6=&bf=0&74=ah&d5=1&d8=m1-58&ae=&8e=-1&d7=&c0=&c4=0&c5=0&92=&93=&91=ONLINE_VIDEO&45=23.31.224.169&b5=-1&33=86007638&a.cv=1&rUrl=http%3A%2F%2Fwww.adap.tv%2F]]></ClickThrough>',
            '',
            '                            <ClickTracking><![CDATA[http://conversions.adap.tv/conversion/wc?adSourceId=73833&bidId=&afppId=73834&creativeId=16242&exSId=57916&key=alexorlovstestpublisher&a.pvt=0&a.rid=&eov=86007638&a.click=true]]></ClickTracking>',
            '                        </VideoClicks>',
            '',
            '                        <MediaFiles>',
            '                            <MediaFile delivery="progressive" width="320" height="240" bitrate="256" type="video/mp4"><![CDATA[http://cdn.adap.tv/alexorlovstestpublisher/Maze_15_QFCG-12375H_PreRoll_512k_640x360_16-9-040512100356192-12398_9-071813123000638-11481.MP4]]></MediaFile>',
            '                        </MediaFiles>',
            '                        <MediaFiles>',
            '                            <MediaFile delivery="progressive" width="480" height="360" bitrate="4000" type="video/x-flv"><![CDATA[http://cdn.adap.tv/integration_test/Vincent-081110124715584-13503_1-122011141453375-82609.flv]]></MediaFile>',
            '                        </MediaFiles>',
            '                    </Linear>',
            '                </Creative>',
            '                <Creative>',
            '                    <CompanionAds>',
            '                        <Companion width="300" height="250">',
            '                            <IFrameResource>',
            '                                <![CDATA[',
            '                                //ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov',
            '                                ]]>',
            '                            </IFrameResource>',
            '                            <TrackingEvents></TrackingEvents>',
            '                        </Companion>',
            '                    </CompanionAds>',
            '                </Creative>',
            '            </Creatives>',
            '',
            '            <Extensions>',
            '                <Extension type="OneSource creative">',
            '                    <CreativeId><![CDATA[16242]]></CreativeId>',
            '                </Extension>',
            '',
            '                <Extension type="revenue" currency="USD"><![CDATA[ZP05nQqNNzkDnlnN9D9Qjg==]]></Extension>',
            '            </Extensions>',
            '        </InLine>',
            '    </Ad>',
            '</VAST>'
        ].join('\n');

        function C6Video() {
            var self = this,
                eventHandlers = {};

            this.player = {
                play: jasmine.createSpy('player.play()'),
                pause: jasmine.createSpy('player.pause()'),
                load: jasmine.createSpy('player.load()'),
                currentTime: 0,
                ended: false,
                duration: NaN,
                paused: true
            };

            this.fullscreen = jasmine.createSpy('c6Video.fullscreen()');

            this.bufferedPercent = jasmine.createSpy('c6Video.bufferedPercent()')
                .and.returnValue(0);

            this.on = jasmine.createSpy('c6Video.on()')
                .and.callFake(function(event, handler) {
                    var handlers = eventHandlers[event] = (eventHandlers[event] || []);

                    handlers.push(handler);

                    return self;
                });

            this.off = jasmine.createSpy('c6Video.off()')
                .and.callFake(function(event, handler) {
                    var handlers = (eventHandlers[event] || []);

                    handlers.splice(handlers.indexOf(handler), 1);
                });

            this.trigger = function(event) {
                var handlers = (eventHandlers[event] || []);

                $rootScope.$apply(function() {
                    handlers.forEach(function(handler) {
                        handler({ target: self.player }, self);
                    });
                });
            };
        }

        beforeEach(function() {
            module(vastModule.name, function($provide) {
                $provide.factory('c6VideoDirective', function() {
                    return {};
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
                $interval = $injector.get('$interval');
                $window = $injector.get('$window');
                c6BrowserInfo = $injector.get('c6BrowserInfo');
                c6VideoService = $injector.get('c6VideoService');
                VASTService = $injector.get('VASTService');
            });

            $scope = $rootScope.$new();
            $scope.id = '12345';

            spyOn(c6VideoService, 'bestFormat').and.returnValue('video/mp4');
            spyOn($window, 'open');
            spyOn($scope, '$emit').and.callThrough();
            spyOn($http, 'get').and.callFake(function(url, object) {
                return $q.when({ data: object.transformResponse(VAST) });
            });
            vastSpy = jasmine.createSpy('vastSpy');
            $scope.$apply(function() {
                VASTService.getVAST('http://adap.tv/ads').then(vastSpy);
            });
            vastObject = vastSpy.calls.mostRecent().args[0];
            vastDeferred = $q.defer();
            spyOn(VASTService, 'getVAST').and.returnValue(vastDeferred.promise);
            spyOn(vastObject, 'firePixels');
            spyOn(vastObject, 'getVideoSrc').and.callThrough();

            initSpy = jasmine.createSpy('vast-player init');
            $rootScope.$on('<vast-player>:init', initSpy);
            $scope.$apply(function() {
                $player = $compile('<vast-player id="{{id}}" ad-tag="{{adTag}}"></vast-player>')($scope);
            });
            scope = $player.isolateScope();
            iface = initSpy.calls.mostRecent().args[1];
            spyOn(iface, 'emit');
            spyOn(iface, 'play').and.callThrough();
        });

        describe('initialization', function() {
            it('should $emit the iface', function() {
                expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object), iface);
            });

            describe('if the controls attribute is present', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<vast-player id="{{id}} ad-tag="{{adTag}}" controls></vast-player>')($scope);
                    });
                });

                it('should should set "controls" to true', function() {
                    expect($player.isolateScope().controls).toBe(true);
                });
            });

            describe('if the controls attribute is not present', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<vast-player id="{{id}} ad-tag="{{adTag}}"></vast-player>')($scope);
                    });
                });

                it('should should set "controls" to false', function() {
                    expect($player.isolateScope().controls).toBe(false);
                });
            });

            it('should put the iface on the $element', function() {
                expect($player.data('video')).toEqual(iface);
            });

            describe('with an adTag', function() {
                var companionsReady;

                beforeEach(function() {
                    companionsReady = jasmine.createSpy('companionsReady');

                    iface.on('companionsReady', companionsReady);
                });

                it('should call the VASTService', function() {
                    $scope.$apply(function() {
                        $scope.adTag = 'http://adap.tv/ads';
                    });
                    expect(VASTService.getVAST).toHaveBeenCalled();
                });

                it('should emit error on the iface if no video source is returned', function() {
                    vastObject.getVideoSrc.and.returnValue(null);
                    vastDeferred.resolve(vastObject);
                    $scope.$apply(function() {
                        $scope.adTag = 'http://adap.tv/ads';
                    });
                    _player = new C6Video();
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    expect(iface.emit).toHaveBeenCalledWith('ready');
                    expect(iface.emit).toHaveBeenCalledWith('error');
                });

                it('should emit error on the iface if VASTService rejects promise', function() {
                    $scope.$apply(function() {
                        $scope.adTag = 'http://adap.tv/ads';
                    });
                    vastDeferred.reject();
                    $scope.$digest();
                    expect(iface.emit).toHaveBeenCalledWith('ready');
                    expect(iface.emit).toHaveBeenCalledWith('error');
                });
            });
        });

        describe('player events', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $scope.adTag = 'http://adap.tv/ads';
                });

                _player = new C6Video();
            });

            describe('ready', function() {
                it('should not emit ready from iface if no vast response has been received', function() {
                    $scope.$broadcast('c6video-ready', _player);
                    expect(iface.emit).not.toHaveBeenCalledWith('ready');
                });

                it('should not emit ready from iface if c6video is not ready', function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$digest();
                    expect(iface.emit).not.toHaveBeenCalledWith('ready');
                });

                it('should emit ready event when c6Video was ready AND vast is returned', function() {
                    $scope.$broadcast('c6video-ready', _player);
                    expect(iface.emit).not.toHaveBeenCalledWith('ready');

                    vastDeferred.resolve(vastObject);
                    $scope.$digest();
                    $timeout.flush();
                    expect(iface.emit).toHaveBeenCalledWith('ready');
                });

                it('should emit ready event when vast has been returned and c6video ready is fired', function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$digest();
                    $timeout.flush();
                    expect(iface.emit).not.toHaveBeenCalledWith('ready');

                    $scope.$broadcast('c6video-ready', _player);
                    expect(iface.emit).toHaveBeenCalledWith('ready');
                });

                it('should emit loadedmetadata is currentTime and duration is defined', function() {
                    $scope.$broadcast('c6video-ready', _player);
                    _player.trigger('loadedmetadata');
                    expect(iface.emit).toHaveBeenCalledWith('loadedmetadata');
                });

                it('should set readyState to 0', function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();

                    expect(iface.readyState).toBe(0);
                });

                it('should set readyState to 1 when loadedmetadata is fired', function() {
                    $scope.$broadcast('c6video-ready', _player);
                    _player.trigger('loadedmetadata');
                    expect(iface.readyState).toBe(1);
                });

                describe('autoplay attribute', function() {
                    it('should autoplay if browser profile allows it', function() {
                        expect(c6BrowserInfo.profile.autoplay).toBeDefined();
                        expect(iface.play).not.toHaveBeenCalled();
                        $scope.$apply(function() {
                            $player = $compile('<vast-player id="{{id}}" autoplay ad-tag="{{adTag}}"></vast-player>')($scope);
                        });
                        iface = initSpy.calls.mostRecent().args[1];
                        spyOn(iface, 'play');
                        $scope.$broadcast('c6video-ready', _player);
                        expect(iface.play).toHaveBeenCalled();
                    });

                    it('should not autoplay if browser profile does not allow it', function() {
                        expect(c6BrowserInfo.profile.autoplay).toBeDefined();
                        c6BrowserInfo.profile.autoplay = false;
                        expect(iface.play).not.toHaveBeenCalled();
                        $scope.$apply(function() {
                            $player = $compile('<vast-player id="{{id}}" autoplay ad-tag="{{adTag}}"></vast-player>')($scope);
                        });
                        iface = initSpy.calls.mostRecent().args[1];
                        spyOn(iface, 'play');
                        $scope.$broadcast('c6video-ready', _player);
                        expect(iface.play).not.toHaveBeenCalled();
                    });
                });
            });

            describe('play', function() {
                beforeEach(function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                it('should emit play on the iface', function() {
                    _player.trigger('play');
                    expect(iface.emit).toHaveBeenCalledWith('play');
                });

                it('should only fire pixels once', function() {
                    _player.trigger('play');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('impression');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('playing');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('start');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('creativeView');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('loaded');
                    expect(vastObject.firePixels.calls.count()).toBe(5);
                    _player.trigger('play');
                    _player.trigger('play');
                    expect(vastObject.firePixels.calls.count()).toBe(5);
                });

                it('should set readyState to 3', function() {
                    _player.trigger('play');
                    expect(iface.readyState).toBe(3);
                });
            });

            describe('pause', function() {
                beforeEach(function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                it('should emit pause on the iface', function() {
                    _player.trigger('pause');
                    expect(iface.emit).toHaveBeenCalledWith('pause');
                });

                it('should always fire the pause pixel', function() {
                    _player.trigger('pause');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('pause');
                    _player.trigger('pause');
                    expect(vastObject.firePixels).toHaveBeenCalledWith('pause');
                });
            });

            describe('ended', function() {
                it('should emit ended on the iface', function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();

                    _player.trigger('ended');
                    expect(iface.emit).toHaveBeenCalledWith('ended');
                    expect(_player.fullscreen).toHaveBeenCalledWith(false);
                });
            });

            describe('timeupdate', function() {
                beforeEach(function() {
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                it('should emit timeupdate on the iface', function() {
                    _player.trigger('timeupdate');
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate');
                });

                describe('firing quartile pixels', function() {
                    it('firstQuartile should be fired only once when 25% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 10;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('firstQuartile');
                        _player.player.currentTime = 10.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                        _player.player.currentTime = 10.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                    });

                    it('midpoint should be fired only once when 50% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 20;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('midpoint');
                        _player.player.currentTime = 20.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                        _player.player.currentTime = 20.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                    });

                    it('thirdQuartile should be fired only once when 75% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 30;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('thirdQuartile');
                        _player.player.currentTime = 30.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                        _player.player.currentTime = 30.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(1);
                    });
                });

                describe('firing "complete" pixel', function() {
                    beforeEach(function() {
                        _player.player.duration = 60;
                        vastObject.firePixels.calls.reset();
                    });

                    describe('before one second before the end of the video', function() {
                        beforeEach(function() {
                            [1, 4, 7, 19, 34, 55, 58.99999].forEach(function(time) {
                                _player.player.currentTime = time;
                                _player.trigger('timeupdate');
                            });
                        });

                        it('should not fire the complete pixel', function() {
                            expect(vastObject.firePixels).not.toHaveBeenCalledWith('complete');
                        });
                    });

                    describe('one second before the video ends', function() {
                        beforeEach(function() {
                            _player.player.currentTime = 59;
                            _player.trigger('timeupdate');
                        });

                        it('should fire the complete pixel', function() {
                            expect(vastObject.firePixels).toHaveBeenCalledWith('complete');
                        });
                    });

                    describe('after one second before the video ends', function() {
                        beforeEach(function() {
                            _player.player.currentTime = 59.2;
                            _player.trigger('timeupdate');
                        });

                        it('should fire the complete pixel', function() {
                            expect(vastObject.firePixels).toHaveBeenCalledWith('complete');
                        });

                        it('should fire the pixel once', function() {
                            vastObject.firePixels.calls.reset();
                            _player.player.currentTime = 59.5;
                            _player.trigger('timeupdate');

                            expect(vastObject.firePixels).not.toHaveBeenCalledWith('complete');
                        });
                    });
                });
            });
        });

        describe('iface', function() {
            it('should return defaults if no video is loaded', function() {
                expect(iface.currentTime).toBe(0);
                expect(function() {
                    iface.currentTime = 10;
                }).not.toThrow();
                expect(iface.ended).toBe(false);
                expect(iface.duration).toBe(0);
                expect(iface.paused).toBe(true);
                expect(iface.readyState).toBe(-1);
            });

            describe('properties', function() {
                beforeEach(function() {
                    _player = new C6Video();

                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                describe('currentTime', function() {
                    it('getting the property should return the currentTime', function() {
                        _player.player.currentTime = 3;
                        expect(iface.currentTime).toBe(3);
                    });

                    it('setting the prop should set the currTime on the player', function() {
                        iface.currentTime = 5;
                        expect(iface.currentTime).toBe(5);
                        expect(_player.player.currentTime).toBe(5);
                    });
                });

                describe('ended', function() {
                    it('should return the ended prop of the player', function() {
                        _player.player.ended = true;
                        expect(iface.ended).toBe(true);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.ended = true;
                        }).toThrow();
                    });
                });

                describe('duration', function() {
                    it('should return the player duration', function() {
                        _player.player.duration = 30;
                        expect(iface.duration).toBe(30);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.duration = 40;
                        }).toThrow();
                    });
                });

                describe('paused', function() {
                    it('should return the paused prop of player', function() {
                        _player.player.paused = false;
                        expect(iface.paused).toBe(false);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.paused = true;
                        }).toThrow();
                    });
                });

                describe('readyState', function() {
                    it('should return the readyState that is handled by the directive', function() {
                        $scope.$apply(function() {
                            $scope.adTag = 'http://adap.tv/ads';
                        });
                        expect(iface.readyState).toBe(-1);
                        $timeout.flush();
                        expect(iface.readyState).toBe(0);
                        _player.trigger('loadedmetadata');
                        expect(iface.readyState).toBe(1);
                        _player.trigger('play');
                        expect(iface.readyState).toBe(3);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.readyState = 3;
                        }).toThrow();
                    });
                });
            });

            describe('methods', function() {
                beforeEach(function() {
                    _player = new C6Video();
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                describe('play', function() {
                    it('should call play on the video object', function() {
                        iface.play();
                        expect(_player.player.play).toHaveBeenCalled();
                    });

                    it('should reset the state if the ad has already played and completed', function() {
                        _player.trigger('loadedmetadata');
                        expect(iface.readyState).toBe(1);
                        _player.player.ended = true;
                        iface.play();
                        expect(iface.readyState).toBe(-1);
                    });
                });

                describe('pause', function() {
                    it('should call pause on the video object', function() {
                        iface.pause();
                        expect(_player.player.pause).toHaveBeenCalled();
                    });
                });

                describe('load', function() {
                    beforeEach(function() {
                        iface.load();
                    });

                    it('should call load() on the video', function() {
                        expect(_player.player.load).toHaveBeenCalled();
                    });
                });

                describe('pause', function() {
                    it('should call pause on the video object', function() {
                        iface.pause();
                        expect(_player.player.pause).toHaveBeenCalled();
                    });
                });

                describe('getCompanions', function() {
                    it('should return the companion if it exists', function() {
                        $scope.$apply(function() {
                            $scope.adTag = 'http://adap.tv/ads';
                        });
                        var companionObjects = iface.getCompanions();
                        expect(companionObjects[0].adType).toBe('iframe');
                    });

                    it('should return null if there is no companion', function() {
                        spyOn(vastObject, 'getCompanion').and.returnValue(null);
                        $scope.$apply(function() {
                            $player = $compile('<vast-player id="{{id}}" autoplay ad-tag="{{adTag}}"></vast-player>')($scope);
                        });
                        iface = initSpy.calls.mostRecent().args[1];
                        expect(iface.getCompanions()).toBe(null);
                    });
                });

                describe('reload', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.adTag = 'http://adap.tv/ads';
                        });
                    });
                    it('should call the VASTService again', function() {
                        iface.reload();
                        expect(VASTService.getVAST.calls.count()).toBe(2);
                    });

                    it('should fire "complete" pixel, close fullscreen and emit ended', function() {
                        iface.reload();
                        expect(_player.fullscreen).toHaveBeenCalled();
                    });
                });

                describe('minimize()', function() {
                    beforeEach(function() {
                        iface.minimize();
                    });

                    it('should call fullscreen(false)', function() {
                        expect(_player.fullscreen).toHaveBeenCalledWith(false);
                    });
                });
            });
        });

        xdescribe('scope.clickThrough()', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $scope.adTag = 'http://adap.tv/ads';
                });
                _player = new C6Video();
                vastDeferred.resolve(vastObject);
                $scope.$broadcast('c6video-ready', _player);
                $scope.$digest();
                $timeout.flush();
            });

            it('should pause the player if video is playing and open a new window and fire click pixel', function() {
                _player.player.paused = false;

                scope.clickThrough();
                expect(_player.player.pause).toHaveBeenCalled();
                expect($window.open).toHaveBeenCalled();
                expect(vastObject.firePixels).toHaveBeenCalledWith('videoClickTracking');
            });

            it('should play the video if it is currently paused', function() {
                _player.player.paused = true;

                scope.clickThrough();
                expect(_player.player.play).toHaveBeenCalled();
            });

            it('should do nothing if click through url is null.com', function() {
                vastObject.clickThrough[0] = 'http://null.com';

                scope.clickThrough();
                expect($window.open).not.toHaveBeenCalled();
            });

            it('should do nothing if click through url is not defined', function() {
                vastObject.clickThrough = [];

                scope.clickThrough();
                expect($window.open).not.toHaveBeenCalled();
            });
        });

        describe('$watch', function() {
            describe('adTag', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.adTag = 'http://adap.tv/ads';
                    });
                    _player = new C6Video();
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();
                });

                it('should reload the player', function() {
                    $scope.adTag = 'http://someadserver.com/ad';
                    $scope.$digest();
                    expect(VASTService.getVAST.calls.count()).toBe(2);
                });

                it('should reset state', function() {
                    $scope.adTag = 'http://someadserver.com/ad';
                    $scope.$digest();
                    expect(_player.fullscreen).toHaveBeenCalled();
                    expect(iface.readyState).toBe(-1);
                });
            });
        });
    });
});
