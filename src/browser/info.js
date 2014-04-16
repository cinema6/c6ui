(function() {
    'use strict';

    angular.module('c6.ui')
        .provider('c6BrowserInfo', [function() {
            var providerPrivate = {
                    Modernizr: undefined,
                    profileAugmenter: angular.noop
                };

            this.setModernizr = function(modernizr) {
                providerPrivate.Modernizr = modernizr;

                return this;
            };

            this.augmentProfile = function(augmenter) {
                providerPrivate.profileAugmenter = augmenter;

                return this;
            };

            this._private = function() {
                return providerPrivate;
            };

            this.$get = ['c6UserAgent', '$window', '$injector', '$log',
                function( c6UserAgent ,  $window ,  $injector ,  $log ) {
                function C6BrowserInfo() {
                    var _private = {
                            modernizr: function() {
                                return providerPrivate.Modernizr || $window.Modernizr;
                            }
                        },
                        Modernizr = _private.modernizr();

                    if (!Modernizr) {
                        $log.error('Modernizr could not be found. Please make sure it is included or register it with c6BrowserInfoProvider.setModernizr()');
                    }

                    this.generateProfile = function() {
                        var profile = {};

                        profile.inlineVideo = (function() {
                            return !(c6UserAgent.device.isIPhone() || c6UserAgent.device.isIPod() || c6UserAgent.app.name === 'silk');
                        })();

                        profile.multiPlayer = (function() {
                            return !(c6UserAgent.device.isIOS() || c6UserAgent.app.name === 'silk');
                        })();

                        profile.canvasVideo = (function() {
                            var macOSXVersion = (function() {
                                    var version = (c6UserAgent.os.name === 'mac' &&
                                                    (c6UserAgent.os.version) &&
                                                    (c6UserAgent.os.version.match(/(\d+\.\d+)/)));
                                    return (version || null) && version[0] && version[0].split('.');
                                })(),
                                badVersion = true;

                            if (macOSXVersion){
                                macOSXVersion[0] = parseInt(macOSXVersion[0],10);
                                macOSXVersion[1] = parseInt(macOSXVersion[1],10);
                                if (macOSXVersion[0] < 10) {
                                    badVersion = false;
                                } else
                                if ((macOSXVersion[0] === 10) && (macOSXVersion[1] < 7)){
                                    badVersion = false;
                                }
                            }

                            return !(c6UserAgent.device.isIOS() ||
                                    c6UserAgent.app.name === 'silk' ||
                                    c6UserAgent.app.name === 'safari' && badVersion);
                        })();

                        profile.touch = Modernizr && Modernizr.touch;

                        profile.cors = Modernizr && Modernizr.cors;

                        profile.canvas = Modernizr && Modernizr.canvas;

                        profile.localstorage = Modernizr && Modernizr.localstorage;

                        profile.raf = (function() {
                            var majorIOSVersion;

                            if (c6UserAgent.device.isIOS()) {
                                majorIOSVersion = c6UserAgent.os.version.split('.')[0];

                                if (majorIOSVersion < 7) {
                                    return false;
                                }
                            }

                            return Modernizr && !!Modernizr.prefixed('requestAnimationFrame', $window);
                        })();

                        profile.device = (function() {
                            var screen = $window.screen,
                                width = screen.width,
                                height = screen.height,
                                pixels = width * height,
                                touch = profile.touch;

                            if (pixels <= 518400) {
                                return 'phone';
                            } else if (pixels <= 786432) {
                                if (touch) {
                                    return 'tablet';
                                } else {
                                    return 'netbook';
                                }
                            } else {
                                return 'desktop';
                            }
                        })();

                        profile.flash = (function() {
                            try {
                                var flashObject = new $window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');

                                return !!flashObject;
                            } catch(e) {
                                return !!$window.navigator.mimeTypes['application/x-shockwave-flash'];
                            }
                        })();

                        profile.autoplay = !c6UserAgent.device.isMobile();

                        $injector.invoke(providerPrivate.profileAugmenter, profile);

                        return profile;
                    };

                    this.profile = this.generateProfile();

                    this._private = function() {
                        return _private;
                    };
                }

                return new C6BrowserInfo();
            }];
        }]);
})();
