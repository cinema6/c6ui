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
                paused: true,
                src: null,
                readyState: 0,

                /* constants */
                HAVE_NOTHING: 0,
                HAVE_METADATA: 1,
                HAVE_CURRENT_DATA: 2,
                HAVE_FUTURE_DATA: 3,
                HAVE_ENOUGH_DATA: 4
            };

            this.src = jasmine.createSpy('src()').and.callFake(function(src) {
                this.player.src = src;
            });

            this.fullscreen = jasmine.createSpy('c6Video.fullscreen()');

            this.bufferedPercent = jasmine.createSpy('c6Video.bufferedPercent()')
                .and.returnValue(0);

            this.regenerate = jasmine.createSpy('regenerate()');

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
            spyOn(iface, 'emit').and.callThrough();
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
        });

        describe('player events', function() {
            beforeEach(function() {
                _player = new C6Video();
            });

            describe('error', function() {
                var spy;

                beforeEach(function() {
                    spy = jasmine.createSpy('spy()');

                    iface.on('error', spy);

                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.load();
                    });
                    $scope.$apply(function() {
                        vastDeferred.resolve(vastObject);
                    });
                    _player.player.error = {
                        code: 3
                    };
                    _player.trigger('error');
                });

                it('should emit the error event', function() {
                    expect(spy).toHaveBeenCalled();
                });

                it('should set the error property', function() {
                    expect(iface.error).toEqual(new Error(
                        'HTML5 Video Error: ' + _player.player.error.code
                    ));
                });
            });

            describe('companionsReady', function() {
                var spy;

                beforeEach(function() {
                    spy = jasmine.createSpy('spy()');

                    iface.on('companionsReady', spy);

                    $scope.$apply(function() {
                        scope.$emit('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.load();
                    });
                });

                describe('if the vast object has companions', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            vastDeferred.resolve(vastObject);
                        });
                    });

                    it('should emit the event', function() {
                        expect(spy).toHaveBeenCalled();
                    });

                    it('should only emit the event once', function() {
                        $scope.$apply(function() {
                            iface.play();
                        });
                        expect(spy.calls.count()).toBe(1);
                    });
                });

                describe('if the vast object has no companions', function() {
                    beforeEach(function() {
                        spyOn(vastObject, 'getCompanion').and.returnValue(null);

                        $scope.$apply(function() {
                            vastDeferred.resolve(vastObject);
                        });
                    });

                    it('should not emit the event', function() {
                        expect(spy).not.toHaveBeenCalled();
                    });
                });
            });

            describe('ready', function() {
                it('should emit ready when the video is ready', function() {
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
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
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
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
                        expect(iface.play).not.toHaveBeenCalled();
                        $scope.$digest();
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
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.play();
                    });
                    $scope.$apply(function() {
                        vastDeferred.resolve(vastObject);
                    });
                    _player.trigger('canplay');

                    _player.trigger('play');
                });

                it('should emit play on the iface', function() {
                    expect(iface.emit).toHaveBeenCalledWith('play');
                });

                it('should only fire pixels once', function() {
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
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.play();
                    });
                    $scope.$apply(function() {
                        vastDeferred.resolve(vastObject);
                    });
                    _player.trigger('canplay');

                    _player.trigger('pause');
                });

                it('should emit pause on the iface', function() {
                    expect(iface.emit).toHaveBeenCalledWith('pause');
                });

                it('should always fire the pause pixel', function() {
                    expect(vastObject.firePixels).toHaveBeenCalledWith('pause');

                    vastObject.firePixels.calls.reset();
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
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.play();
                    });
                    $scope.$apply(function() {
                        vastDeferred.resolve(vastObject);
                    });
                    _player.trigger('canplay');
                });

                it('should emit timeupdate on the iface', function() {
                    _player.trigger('timeupdate');
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate');
                });

                describe('firing quartile pixels', function() {
                    it('should not occur if duration is 0', function() {
                        _player.player.duration = 0;
                        _player.player.currentTime = 0;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).not.toHaveBeenCalledWith('firstQuartile');
                        expect(vastObject.firePixels).not.toHaveBeenCalledWith('midpoint');
                        expect(vastObject.firePixels).not.toHaveBeenCalledWith('thirdQuartile');
                    });

                    it('firstQuartile should be fired only once when 25% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 10;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('firstQuartile');
                        vastObject.firePixels.calls.reset();
                        _player.player.currentTime = 10.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                        _player.player.currentTime = 10.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                    });

                    it('midpoint should be fired only once when 50% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 20;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('midpoint');
                        vastObject.firePixels.calls.reset();
                        _player.player.currentTime = 20.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                        _player.player.currentTime = 20.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                    });

                    it('thirdQuartile should be fired only once when 75% of the video has been watched', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 30;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('thirdQuartile');
                        vastObject.firePixels.calls.reset();
                        _player.player.currentTime = 30.1013;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                        _player.player.currentTime = 30.2113;
                        expect(vastObject.firePixels.calls.count()).toBe(0);
                    });

                    it('should fire all quartiles that exist between start and current time', function() {
                        _player.player.duration = 40;
                        _player.player.currentTime = 39;
                        _player.trigger('timeupdate');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('firstQuartile');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('midpoint');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('thirdQuartile');
                        expect(vastObject.firePixels).toHaveBeenCalledWith('complete');
                    });
                });

                describe('firing "complete" pixel', function() {
                    beforeEach(function() {
                        _player.player.duration = 60;
                        vastObject.firePixels.calls.reset();
                    });

                    describe('when duration is 0', function() {
                        it('should not fire', function() {
                            _player.player.duration = 0;
                            _player.player.currentTime = 0;
                            _player.trigger('timeupdate');
                            expect(vastObject.firePixels).not.toHaveBeenCalledWith('complete');
                        });
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
            describe('properties', function() {
                beforeEach(function() {
                    _player = new C6Video();

                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                });

                describe('src', function() {
                    describe('getting', function() {
                        it('should return the ad tag it was set to', function() {
                            expect(iface.src).toBeNull();

                            iface.src = 'http://www.ad.tag.com';
                            expect(iface.src).toBe('http://www.ad.tag.com');

                            iface.src = 'http://www.ad.tag.org';
                            expect(iface.src).toBe('http://www.ad.tag.org');
                        });
                    });

                    describe('setting', function() {
                        var spy;

                        beforeEach(function() {
                            spy = jasmine.createSpy('spy()').and.callFake(function() {
                                expect(iface.src).not.toBeNull();
                            });

                            _player.trigger('loadedmetadata');
                            $scope.$apply(function() {
                                iface.play();
                            });
                            $scope.$apply(function() {
                                vastDeferred.resolve(vastObject);
                            });
                            _player.trigger('canplay');
                            _player.trigger('play');

                            iface.on('ready', spy);

                            iface.src = 'newadtag.com';
                        });

                        it('should reset the player state', function() {
                            expect(iface.readyState).toBe(0);

                            $scope.$apply(function() {
                                iface.play();
                            });
                            vastObject.firePixels.calls.reset();
                            _player.trigger('play');
                            expect(vastObject.firePixels).toHaveBeenCalledWith('playing');
                        });

                        it('should emit ready', function() {
                            expect(spy).toHaveBeenCalled();
                        });
                    });
                });

                describe('error', function() {
                    describe('getting', function() {
                        it('should be null', function() {
                            expect(iface.error).toBeNull();
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.error = new Error();
                            }).toThrow();
                        });
                    });
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
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $player = $compile('<vast-player videoid="abc" adTag=""></vast-player>')($scope);
                        });
                        _player = new C6Video();
                        scope = $player.isolateScope();
                        iface = $player.data('video');
                    });

                    it('should return the readyState that is handled by the directive', function() {
                        expect(iface.readyState).toBe(-1);

                        $scope.$apply(function() {
                            scope.$emit('c6video-ready', _player);
                        });
                        expect(iface.readyState).toBe(0);

                        $scope.$apply(function() {
                            iface.load();
                        });
                        $scope.$apply(function() {
                            vastDeferred.resolve(vastObject);
                        });
                        _player.trigger('canplay');

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
                    var vast;

                    beforeEach(function() {
                        iface.src = 'adtag.org';

                        vast = vastObject;

                        $scope.$apply(function() {
                            iface.load();
                        });
                        $scope.$apply(function() {
                            vastDeferred.resolve(vast);
                        });
                        _player.player.readyState = _player.player.HAVE_FUTURE_DATA;
                        _player.trigger('canplay');

                        VASTService.getVAST.calls.reset();

                        $scope.$apply(function() {
                            iface.play();
                        });
                    });

                    it('should play the video', function() {
                        expect(_player.player.play).toHaveBeenCalled();
                    });

                    it('should not fetch any VAST', function() {
                        expect(VASTService.getVAST).not.toHaveBeenCalled();
                    });

                    describe('if the video has not been loaded yet', function() {
                        beforeEach(function() {
                            vastDeferred = $q.defer();
                            VASTService.getVAST.and.returnValue(vastDeferred.promise);

                            _player.player.play.calls.reset();

                            iface.src = 'new.adtag.org';

                            $scope.$apply(function() {
                                iface.play();
                            });
                        });

                        it('should not play the video', function() {
                            expect(_player.player.play).not.toHaveBeenCalled();
                        });

                        it('should fetch the new VAST', function() {
                            expect(VASTService.getVAST).toHaveBeenCalledWith(iface.src);
                        });

                        describe('when the vast is fetched', function() {
                            beforeEach(function() {
                                _player.src.calls.reset();

                                vast.getVideoSrc.and.returnValue('http://videos.com/my-vid.mp4');

                                $scope.$apply(function() {
                                    vastDeferred.resolve(vast);
                                });
                            });

                            it('should set the player src', function() {
                                expect(_player.src).toHaveBeenCalledWith(vast.getVideoSrc());
                            });

                            it('should play the video', function() {
                                expect(_player.player.play).toHaveBeenCalled();
                            });

                            describe('if called again', function() {
                                beforeEach(function() {
                                    _player.src.calls.reset();
                                    _player.player.play.calls.reset();

                                    $scope.$apply(function() {
                                        iface.play();
                                    });
                                });

                                it('should not set the src again', function() {
                                    expect(_player.src).not.toHaveBeenCalled();
                                });

                                it('should play the video again', function() {
                                    expect(_player.player.play).toHaveBeenCalled();
                                });
                            });
                        });

                        describe('if the vast fails to load', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    vastDeferred.reject(vast);
                                });
                            });

                            it('should not play the video', function() {
                                expect(_player.player.play).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('pause', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            iface.play();
                        });
                        _player.trigger('play');
                        iface.pause();
                    });

                    it('should call pause on the video object', function() {
                        expect(_player.player.pause).toHaveBeenCalled();
                    });

                    describe('if the video has not played yet', function() {
                        beforeEach(function() {
                            _player.player.pause.calls.reset();
                            $scope.$apply(function() {
                                iface.src = 'new-tag.com';
                            });
                            $scope.$apply(function() {
                                iface.pause();
                            });
                        });

                        it('should not pause the video', function() {
                            expect(_player.player.pause).not.toHaveBeenCalled();
                        });

                        it('should regenerate the video', function() {
                            expect(_player.regenerate).toHaveBeenCalled();
                        });
                    });
                });

                describe('load', function() {
                    var errorSpy;

                    beforeEach(function() {
                        errorSpy = jasmine.createSpy('error()');
                        vastDeferred = $q.defer();
                        VASTService.getVAST.and.returnValue(vastDeferred.promise);

                        iface.on('error', errorSpy);

                        iface.src = 'http://i-am-an-adtag.com';
                        $scope.$apply(function() {
                            iface.load();
                        });
                    });

                    it('should request the VAST', function() {
                        expect(VASTService.getVAST).toHaveBeenCalledWith(iface.src);
                    });

                    describe('when the vast is loaded', function() {
                        var vast;

                        beforeEach(function() {
                            vast = vastObject;

                            $scope.$apply(function() {
                                vastDeferred.resolve(vast);
                            });
                        });

                        it('should set the src', function() {
                            expect(_player.src).toHaveBeenCalledWith(vast.getVideoSrc());
                        });
                    });

                    describe('if the vast has no video for the browser', function() {
                        beforeEach(function() {
                            vastObject.getVideoSrc.and.returnValue(null);

                            $scope.$apply(function() {
                                vastDeferred.resolve(vastObject);
                            });
                        });

                        it('should emit the error event', function() {
                            expect(errorSpy).toHaveBeenCalled();
                        });
                    });

                    describe('if the vast fails to load', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                vastDeferred.reject('I FAILED YOU MASTER.');
                            });
                        });

                        it('should emit the error event', function() {
                            expect(errorSpy).toHaveBeenCalled();
                        });

                        it('should set the error property', function() {
                            expect(iface.error).toEqual(new Error(
                                'VAST request failed: ' + JSON.stringify('I FAILED YOU MASTER.')
                            ));
                        });
                    });
                });

                describe('getCompanions', function() {
                    var companions;

                    describe('if there is no VAST', function() {
                        beforeEach(function() {
                            companions = iface.getCompanions();
                        });

                        it('should be null', function() {
                            expect(companions).toBeNull();
                        });
                    });

                    describe('if there is VAST', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                iface.load();
                            });
                        });

                        describe('if the VAST has companions', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    vastDeferred.resolve(vastObject);
                                });

                                companions = iface.getCompanions();
                            });

                            it('should be the companion in an array', function() {
                                expect(companions).toEqual([vastObject.getCompanion()]);
                            });
                        });

                        describe('if the VAST has no companion', function() {
                            beforeEach(function() {
                                spyOn(vastObject, 'getCompanion').and.returnValue(null);

                                $scope.$apply(function() {
                                    vastDeferred.resolve(vastObject);
                                });

                                companions = iface.getCompanions();
                            });

                            it('should be null', function() {
                                expect(companions).toBeNull();
                            });
                        });
                    });
                });

                describe('reload', function() {
                    beforeEach(function() {
                        iface.reload();
                    });

                    it('should regenerate the player', function() {
                        expect(_player.regenerate).toHaveBeenCalled();
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

        describe('scope.clickThrough()', function() {
            beforeEach(function() {
                _player = new C6Video();
                $scope.$apply(function() {
                    $scope.$broadcast('c6video-ready', _player);
                });
                $scope.$apply(function() {
                    iface.load();
                });
                $scope.$apply(function() {
                    vastDeferred.resolve(vastObject);
                });

                _player.player.paused = false;
            });

            it('should pause the player if video is playing and open a new window and fire click pixel', function() {
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

            it('should do nothing if click through url is not defined', function() {
                vastObject.clickThrough = [];

                scope.clickThrough();
                expect($window.open).not.toHaveBeenCalled();
            });

            describe('if controls are present', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<vast-player id="{{id}}" ad-tag="{{adTag}}" controls></vast-player>')($scope);
                    });
                    scope = $player.isolateScope();
                    _player = new C6Video();
                    vastDeferred.resolve(vastObject);
                    $scope.$broadcast('c6video-ready', _player);
                    $scope.$digest();
                    $timeout.flush();

                    _player.player.paused = false;
                    scope.clickThrough();
                });

                it('should not open the clickThrough link', function() {
                    expect($window.open).not.toHaveBeenCalled();
                });
            });

            describe('if the disable-clickthrough attribute is present', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<vast-player id="{{id}}" ad-tag="{{adTag}}" disable-clickthrough></vast-player>')($scope);
                    });
                    iface = $player.data('video');
                    scope = $player.isolateScope();
                    _player = new C6Video();
                    $scope.$apply(function() {
                        $scope.$broadcast('c6video-ready', _player);
                    });
                    $scope.$apply(function() {
                        iface.load();
                    });
                    $scope.$apply(function() {
                        vastDeferred.resolve(vastObject);
                    });

                    _player.player.paused = false;
                    scope.clickThrough();
                });

                it('should not open the clickThrough link', function() {
                    expect($window.open).not.toHaveBeenCalled();
                });
            });
        });

        describe('$watchers', function() {
            describe('adTag', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        scope.$emit('c6video-ready', _player);
                    });

                    $scope.$apply(function() {
                        scope.adTag = 'newtag.com';
                    });
                });

                it('should set the src', function() {
                    expect(iface.src).toBe('newtag.com');
                });
            });
        });
    });
});
