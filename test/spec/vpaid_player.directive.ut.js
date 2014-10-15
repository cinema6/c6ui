define(['videos/vpaid'], function(vpaidModule) {
    'use strict';

    describe('<vpaid-player>', function() {
        var $rootScope,
            $scope,
            $player,
            $compile,
            $window,
            $interval,
            c6BrowserInfo,
            VPAIDService;

        var _player,
            _createPlayer,
            iface,
            initSpy;

        beforeEach(function() {
            module(vpaidModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $interval = $injector.get('$interval');
                c6BrowserInfo = $injector.get('c6BrowserInfo');
                VPAIDService = $injector.get('VPAIDService');

                $window = $injector.get('$window');

                $scope = $rootScope.$new();
            });

            spyOn($window,'addEventListener');

            $scope.id = '12345';
            $scope.adTag = 'http://adap.tv/ads';

            _createPlayer = VPAIDService.createPlayer;
            spyOn(VPAIDService, 'createPlayer').and.callFake(function(id, adTag, template, $el) {
                _player = _createPlayer(id, adTag, template, $el);
                return _player;
            });

            initSpy = jasmine.createSpy('vpaid-player init');
            $rootScope.$on('<vpaid-player>:init', initSpy);
            $scope.$apply(function() {
                $player = $compile('<vpaid-player videoid="{{id}}" ad-tag="{{adTag}}"></vpaid-player>')($scope);
            });
            iface = initSpy.calls.mostRecent().args[1];
            spyOn(iface, 'emit');
        });

        describe('initialization', function() {
            it('should $emit an init event with the iface', function() {
                expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object), $player.data('video'));
            });

            it('should embed a flash object', function() {
                var object = $player.find('object');

                expect(object.length).toBe(2);
                expect(object[0].id).toBe('c6VPAIDplayer_ie');
                expect(object[1].id).toBe('c6VPAIDplayer');
            });
        });

        describe('events', function() {
            describe('ready', function() {
                it('should emit ready', function() {
                    _player.emit('ready');

                    expect(iface.emit).toHaveBeenCalledWith('ready');
                });

                it('should not autoplay', function() {
                    spyOn(iface, 'play');
                    spyOn(iface, 'load');

                    _player.emit('ready');

                    expect(iface.play).not.toHaveBeenCalled();
                    expect(iface.load).not.toHaveBeenCalled();
                });

                describe('autoplay attribute', function() {
                    beforeEach(function() {
                        expect(c6BrowserInfo.profile.autoplay).toBeDefined();

                        $scope.$apply(function() {
                            $player = $compile('<vpaid-player autoplay videoid="{{id}}" ad-tag="{{adTag}}"></vpaid-player>')($scope);
                        });

                        iface = initSpy.calls.mostRecent().args[1];
                        spyOn(iface, 'emit');
                        spyOn(iface, 'play');
                    });

                    it('should autoplay if profile allows it', function() {
                        c6BrowserInfo.profile.autoplay = true;
                        _player.emit('ready');

                        expect(iface.play).toHaveBeenCalled();
                    });

                    it('should not autoplay if profile does not allow it', function() {
                        c6BrowserInfo.profile.autoplay = false;
                        _player.emit('ready');

                        expect(iface.play).not.toHaveBeenCalled();
                    });
                });
            });

            describe('ended', function() {
                it('should emit ended', function() {
                    _player.emit('ready');
                    _player.emit('ended');

                    expect(iface.emit).toHaveBeenCalledWith('ended');
                    expect(iface.ended).toBe(true);
                });
            });

            describe('play', function() {
                it('should emit play and set the duration', function() {
                    spyOn(_player, 'getDuration').and.returnValue(30);
                    _player.emit('ready');
                    _player.emit('play');

                    expect(iface.emit).toHaveBeenCalledWith('play');
                    expect(iface.paused).toBe(false);
                    expect(iface.duration).toBe(30);
                });
            });

            describe('canplay', function() {
                it('should emit canplay only once when ad starts playing', function() {
                    spyOn(_player, 'getDuration').and.returnValue(30);
                    _player.emit('ready');
                    _player.emit('play');

                    expect(iface.emit).toHaveBeenCalledWith('canplay');
                    iface.emit.calls.reset();
                    _player.emit('play');

                    expect(iface.emit).not.toHaveBeenCalledWith('canplay');
                });
            });

            describe('pause', function() {
                it('should emit pause', function() {
                    _player.emit('ready');
                    _player.emit('pause');

                    expect(iface.emit).toHaveBeenCalledWith('pause');
                    expect(iface.paused).toBe(true);
                });
            });

            describe('companionsReady', function() {
                it('should emit getCompanions and send the player', function() {
                    _player.emit('ready');
                    _player.emit('companionsReady');

                    expect(iface.emit).toHaveBeenCalledWith('companionsReady');
                });
            });

            describe('timeupdate', function() {
                it('should be emitted every 250ms if the current time has changed', function() {
                    var currTime = 0,
                        mockFlashObject = {
                            getAdProperties: jasmine.createSpy('getAdProperties')
                                .and.callFake(function() { return { adCurrentTime: currTime, adDuration: 10 }; }),
                            isCinema6player: function() { return true; }
                        };

                    spyOn($player[0], 'querySelectorAll').and.returnValue([mockFlashObject]);

                    _player.emit('ready');
                    _player.emit('play');

                    $interval.flush(250);
                    expect(iface.emit).not.toHaveBeenCalledWith('timeupdate');

                    currTime = 2;
                    $interval.flush(250);
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate');
                    iface.emit.calls.reset();

                    currTime = 2;
                    $interval.flush(250);
                    expect(iface.emit).not.toHaveBeenCalledWith('timeupdate');

                    currTime = 3;
                    $interval.flush(250);
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate');
                    iface.emit.calls.reset();

                    currTime = 4;
                    $interval.flush(250);
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate');
                });
            });
        });

        describe('interface', function() {
            describe('methods', function() {
                beforeEach(function() {
                    spyOn(iface, 'load').and.callThrough();
                    spyOn(_player, 'loadAd').and.callThrough();
                    spyOn(_player, 'startAd').and.callThrough();
                    spyOn(_player, 'resumeAd').and.callThrough();
                    spyOn(_player, 'pause').and.callThrough();
                    spyOn(_player, 'destroy').and.callThrough();
                    spyOn(_player, 'getDisplayBanners');
                });

                it('should be available via jqLite .data()', function() {
                    expect($player.data('video')).toEqual(iface);
                });

                describe('play', function() {
                    beforeEach(function() {
                        _player.emit('ready');
                        iface.play();
                    });

                    it('should call startAd() on the player if it hasn\'t already', function() {
                        expect(_player.startAd).toHaveBeenCalled();
                    });

                    it('should call resumeAd() if the player was already started', function() {
                        $scope.$apply(function() {
                            iface.pause();
                            iface.play();
                        });
                        expect(_player.resumeAd).toHaveBeenCalled();
                    });

                    it('should call load if it has not been called yet', function() {
                        expect(iface.load).toHaveBeenCalled();
                    });

                    it('should not call load if it has already been called', function() {
                        iface.play();
                        iface.play();
                        iface.play();
                        expect(iface.load.calls.count()).toBe(1);
                    });
                });

                describe('pause', function() {
                    it('should call pause', function() {
                        _player.emit('ready');
                        iface.pause();
                        expect(_player.pause).toHaveBeenCalled();
                    });
                });

                describe('load', function() {
                    it('should call loadAd() if player is ready', function() {
                        _player.emit('ready');
                        iface.load();
                        expect(_player.loadAd).toHaveBeenCalled();
                    });
                });

                describe('getCompanions', function() {
                    it('should call getCompanions() on the player if it\'s ready', function() {
                        iface.getCompanions();
                        expect(_player.getDisplayBanners).toHaveBeenCalled();
                    });
                });

                describe('reload', function() {
                    it('should destroy current player', function() {
                        spyOn(_player, 'insertHTML');
                        var __player = _player;
                        iface.reload();
                        expect(__player.destroy).toHaveBeenCalled();
                        expect(VPAIDService.createPlayer).toHaveBeenCalled();
                    });
                });
            });

            describe('properties', function() {
                describe('currentTime', function() {
                    it('should return 0 if player is not ready', function() {
                        expect(iface.currentTime).toBe(0);
                    });

                    it('should come from the player when it\'s ready', function() {
                        _player.emit('ready');
                        spyOn($player[0], 'querySelectorAll').and.returnValue([{
                            getAdProperties: function() {
                                return {
                                    adCurrentTime: 20
                                };
                            },
                            isCinema6player: function() {
                                return true;
                            }
                        }]);
                        expect(iface.currentTime).toBe(20);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.currentTime = 10;
                        }).toThrow();
                    });
                });

                describe('duration', function() {
                    it('should return 0 if player is not ready', function() {
                        expect(iface.duration).toBe(0);
                    });

                    it('should return the duration once the ad has loaded', function() {
                        spyOn(_player, 'getDuration').and.returnValue(30);
                        _player.emit('ready');
                        _player.emit('play');

                        expect(iface.duration).toBe(30);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.duration = 10;
                        }).toThrow();
                    });
                });

                describe('paused', function() {
                    it('should be true before the ad starts', function() {
                        expect(iface.paused).toBe(true);
                    });

                    it('should be true if the player is ready and has paused', function() {
                        _player.emit('ready');
                        _player.emit('pause');

                        expect(iface.paused).toBe(true);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.paused = true;
                        }).toThrow();
                    });
                });

                describe('ended', function() {
                    it('should be true before the ad starts', function() {
                        expect(iface.ended).toBe(false);
                    });

                    it('should be true if the player is ready and has paused', function() {
                        _player.emit('ready');
                        _player.emit('ended');

                        expect(iface.ended).toBe(true);
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.ended = true;
                        }).toThrow();
                    });
                });

                describe('videoid', function() {
                    it('should be true before the ad starts', function() {
                        expect(iface.videoid).toBe('12345');
                    });

                    it('should throw an error when setting', function() {
                        expect(function() {
                            iface.videoid = '1231223';
                        }).toThrow();
                    });
                });

                describe('readyState', function() {
                    it('should be -1 by default', function() {
                        expect(iface.readyState).toBe(-1);
                    });

                    it('should be 0 when player is ready', function() {
                        _player.emit('ready');
                        expect(iface.readyState).toBe(0);
                    });

                    it('should be 3 when ad starts playing', function() {
                        spyOn($player[0], 'querySelectorAll').and.returnValue([{
                            getAdProperties: function() {
                                return {
                                    adCurrentTime: 20
                                };
                            },
                            isCinema6player: function() {
                                return true;
                            }
                        }]);

                        _player.emit('ready');
                        _player.emit('play');
                        expect(iface.readyState).toBe(3);
                    });
                });
            });
        });
    });
});