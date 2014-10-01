define(['browser/info'], function(browserInfo) {
    'use strict';

    describe('c6BrowserInfo', function() {
        var c6BrowserInfo,
            c6BrowserInfoProvider,
            c6UserAgent,
            Modernizr,
            $log,
            $window,
            $injector,
            providerPrivate,
            _private;

        beforeEach(function() {
            Modernizr = {
                touch: 'touch',
                canvas: 'canvas',
                localstorage: 'localstorage',
                cors: true,
                prefixed: jasmine.createSpy('modernizr prefixed').andReturn(function() {})
            };

            $window = {
                Modernizr: Modernizr,
                screen: {
                    width: 0,
                    height: 0
                },
                navigator: {
                    mimeTypes: []
                },
                ActiveXObject: function() { throw new Error(); }
            };

            c6UserAgent = {
                app: {
                    name: null,
                    version: null
                },
                device: {
                    isIPhone: function() { return false; },
                    isIPod: function() { return false; },
                    isIPad: function() { return false; },
                    isIOS: function() { return this.isIPhone() || this.isIPod() || this.isIPad(); },
                    isMobile: function() { return false; }
                },
                os: {
                    name: null,
                    version: null
                }
            };

            module(browserInfo.name, function($provide, _c6BrowserInfoProvider_) {
                $provide.value('$window', $window);
                $provide.value('c6UserAgent', c6UserAgent);
                c6BrowserInfoProvider = _c6BrowserInfoProvider_;
                providerPrivate = _c6BrowserInfoProvider_._private();
            });

            inject(function(_c6BrowserInfo_, _$log_, _$injector_) {
                c6BrowserInfo = _c6BrowserInfo_;
                _private = _c6BrowserInfo_._private();
                $log = _$log_;
                $injector = _$injector_;
            });
        });

        it('should exist', function() {
            expect(c6BrowserInfo).toBeDefined();
        });

        describe('provider', function() {
            describe('methods', function() {
                describe('@public', function() {
                    describe('setModernizr(modernizr)', function() {
                        var Modernizr,
                            result;

                        beforeEach(function() {
                            Modernizr = {};

                            result = c6BrowserInfoProvider.setModernizr(Modernizr);
                        });

                        it('should be chainable', function() {
                            expect(result).toBe(c6BrowserInfoProvider);
                        });

                        it('should set the private Modernizr property', function() {
                            expect(providerPrivate.Modernizr).toBe(Modernizr);
                        });
                    });

                    describe('augmentProfile(augmenter)', function() {
                        var augmenter,
                            result;

                        beforeEach(function() {
                            augmenter = function() {};

                            result = c6BrowserInfoProvider.augmentProfile(augmenter);
                        });

                        it('should be chainable', function() {
                            expect(result).toBe(c6BrowserInfoProvider);
                        });

                        it('should save a reference to the augmenter function', function() {
                            expect(providerPrivate.profileAugmenter).toBe(augmenter);
                        });
                    });
                });

                describe('@private', function() {
                    describe('_private()', function() {
                        it('should return the private variable', function() {
                            expect(_private).toBeDefined();
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('_private', function() {
                    describe('profileAugmenter', function() {
                        it('should default to angular.noop', function() {
                            expect(providerPrivate.profileAugmenter).toBe(angular.noop);
                        });
                    });
                });
            });

            describe('getting modernizr', function() {
                beforeEach(function() {
                    spyOn($log, 'error');
                });

                it('should log an error if modernizr cannot be found', function() {
                    $window.Modernizr = undefined;

                    c6BrowserInfo = $injector.invoke(c6BrowserInfoProvider.$get);

                    expect($log.error).toHaveBeenCalledWith('Modernizr could not be found. Please make sure it is included or register it with c6BrowserInfoProvider.setModernizr()');
                });

                it('should not log an error if Modernizr can be found', function() {
                    expect($log.error).not.toHaveBeenCalled();
                });
            });
        });

        describe('properties', function() {
            describe('profile', function() {
                it('should be set to the result of the generateProfile() method', function() {
                    expect(angular.equals(c6BrowserInfo.profile, c6BrowserInfo.generateProfile())).toBe(true);
                });
            });
        });

        describe('methods', function() {
            describe('_private', function() {
                describe('modernizr', function() {
                    it('should return an explicitly set Modernizr first', function() {
                        $window.Modernizr = {};
                        providerPrivate.Modernizr = {};

                        expect(_private.modernizr()).toBe(providerPrivate.Modernizr);
                    });

                    it('should fallback to the window\'s modernizr', function() {
                        $window.Modernizr = {};

                        expect(_private.modernizr()).toBe($window.Modernizr);
                    });
                });
            });

            describe('@private', function() {
                describe('_private()', function() {
                    it('should return the _private object', function() {
                        expect(_private).toBeDefined();
                    });
                });
            });

            describe('@public', function() {
                describe('generateProfile()', function() {
                    var profile;

                    describe('on an iOS device running < iOS 7', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.os.name = 'ios';
                            c6UserAgent.os.version = '6.1.4';
                            c6UserAgent.device.isIOS = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        it('should be false', function() {
                            expect(profile.raf).toBe(false);
                        });
                    });

                    describe('on an iOS device running greater than iOS 7', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.os.name = 'ios';
                            c6UserAgent.os.version = '8.1.2';
                            c6UserAgent.device.isIOS = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        it('should be true', function() {
                            expect(profile.raf).toBe(true);
                        });
                    });

                    describe('on an iphone', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.os.version = '6.1.2';
                            c6UserAgent.device.isIPhone = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVideo', function() {
                            it('should be false', function() {
                                expect(profile.inlineVideo).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on an ipod', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.os.version = '6.1.2';
                            c6UserAgent.device.isIPod = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVideo', function() {
                            it('should be false', function() {
                                expect(profile.inlineVideo).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on an iPad', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.os.version = '6.1.2';
                            c6UserAgent.device.isIPad = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVideo', function() {
                            it('should be true', function() {
                                expect(profile.inlineVideo).toBe(true);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on a Kindle Fire', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'silk';

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVideo', function() {
                            it('should be false', function() {
                                expect(profile.inlineVideo).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on desktop safari', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '7';
                            c6UserAgent.os.name = 'mac';

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVideo', function() {
                            it('should be true', function() {
                                expect(profile.inlineVideo).toBe(true);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be true', function() {
                                expect(profile.multiPlayer).toBe(true);
                            });
                        });

                        describe('canvasVideo', function() {
                            describe('mac os 10.6 or less', function() {
                                beforeEach(function() {
                                    c6UserAgent.os.version = '10.6.0';

                                    profile = c6BrowserInfo.generateProfile();
                                });

                                it('should be true', function() {
                                    expect(profile.canvasVideo).toBe(true);
                                });
                            });

                            describe('mac os 10.7 or greater', function() {
                                it('should be false', function() {
                                    c6UserAgent.os.version = '10.7.2';
                                    profile = c6BrowserInfo.generateProfile();
                                    expect(profile.canvasVideo).toBe(false);

                                    c6UserAgent.os.version = '10.8.7';
                                    profile = c6BrowserInfo.generateProfile();
                                    expect(profile.canvasVideo).toBe(false);

                                    c6UserAgent.os.version = '10.9.0';
                                    profile = c6BrowserInfo.generateProfile();
                                    expect(profile.canvasVideo).toBe(false);

                                    c6UserAgent.os.version = '10.10.2';
                                    profile = c6BrowserInfo.generateProfile();
                                    expect(profile.canvasVideo).toBe(false);
                                });
                            });
                        });
                    });

                    describe('on mobile', function() {
                        it('autoplay should be false', function() {
                            c6UserAgent.device.isMobile = function() { return true; }
                            profile = c6BrowserInfo.generateProfile();
                            expect(profile.autoplay).toBe(false);
                        });
                    });

                    describe('if flash is available', function() {
                        it('flash should be set to true', function() {
                            expect(profile.flash).toBe(false);

                            spyOn($window, 'ActiveXObject').andReturn(true);
                            profile = c6BrowserInfo.generateProfile();

                            expect(profile.flash).toBe(true);
                        });
                    });

                    describe('on a small screen', function() {
                        it('should set device to phone', function() {
                            $window.screen.width = 320;
                            $window.screen.height = 480;
                            profile = c6BrowserInfo.generateProfile();
                            expect(profile.device).toBe('phone');
                        });
                    });

                    describe('on a medium screen', function() {
                        beforeEach(function() {
                            $window.screen.width = 1024;
                            $window.screen.height = 768;
                        });

                        it('should set device to tablet if touch is detected', function() {
                            profile = c6BrowserInfo.generateProfile();
                            expect(profile.device).toBe('tablet');
                        });

                        it('should set device to netbook if touch is not detected', function() {
                            Modernizr.touch = false;
                            profile = c6BrowserInfo.generateProfile();
                            expect(profile.device).toBe('netbook');
                        });
                    });

                    describe('on a big screen', function() {
                        it('should set device to desktop', function() {
                            $window.screen.width = 1366;
                            $window.screen.height = 768;
                            profile = c6BrowserInfo.generateProfile();
                            expect(profile.device).toBe('desktop');
                        });
                    });

                    describe('on everything', function() {
                        describe('with a profileAugmenter', function() {
                            var augmenter;

                            beforeEach(function() {
                                spyOn($injector, 'invoke').andCallThrough();

                                augmenter = function() {};
                                providerPrivate.profileAugmenter = augmenter;

                                profile = c6BrowserInfo.generateProfile();
                            });

                            it('should invoke the augmenting function with the injector', function() {
                                expect($injector.invoke).toHaveBeenCalledWith(augmenter, profile);
                            });
                        });

                        describe('touch', function() {
                            it('should use the Modernizr touch test', function() {
                                expect(profile.touch).toBe(Modernizr.touch);
                            });
                        });

                        describe('cors', function() {
                            it('should use the Modernizr cors test', function() {
                                expect(profile.cors).toBe(Modernizr.cors);
                            });
                        });

                        describe('canvas', function() {
                            it('should use the Modernizr canvas test', function() {
                                expect(profile.canvas).toBe(Modernizr.canvas);
                            });
                        });

                        describe('localstorage', function() {
                            it('should use the Modernizr localstorage test', function() {
                                expect(profile.localstorage).toBe(Modernizr.localstorage);
                            });
                        });

                        describe('raf', function() {
                            it('should use the Modernizr prefixed test', function() {
                                expect(Modernizr.prefixed).toHaveBeenCalledWith('requestAnimationFrame', $window);
                            });

                            it('should cast the result to a bool', function() {
                                expect(profile.raf).toBe(true);
                            });
                        });
                    });
                });
            });
        });
    });
});
