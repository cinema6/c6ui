define (['angular','../events/emitter','../browser/info'],
function( angular , eventsEmitter     , browserInfo      ) {
    'use strict';

    return angular.module('c6.ui.videos.vpaid',[eventsEmitter.name, browserInfo.name])
    .provider('VPAIDService', [function () {
        var _provider = {
            adTimeout: 5000
        };

        this.swfUrl = function(url) {
            _provider.swfUrl = url;
            return this;
        };

        this.adTimeout = function(seconds) {
            _provider.adTimeout = parseFloat(seconds) * 1000;
        };

        this.$get = ['$q','$window','$rootScope','$interval','$timeout','$log','c6EventEmitter',
        function    ( $q , $window , $rootScope , $interval , $timeout , $log , c6EventEmitter ) {
            var service = {},
                _service = {};

            service.createPlayer = function(id, adTag, $element) {
                _service.VPAIDPlayer = function(id, adTag, $element, $win) {
                        var self = this,
                            adPlayerDeferred = $q.defer(),
                            adDeferred = $q.defer(),
                            actualAdDeferred = $q.defer(),
                            adStarted = false,
                            adVideoStart = false;

                        c6EventEmitter(self);

                        function emitReady() {
                            var deferred = $q.defer();

                            var current = 0,
                                limit = 5000,
                                check = $interval(function() {
                                    if(self.player && self.player.isCinema6player()) {
                                        $interval.cancel(check);
                                        self.emit('ready', self);
                                        return deferred.resolve('successfully inserted and loaded player');
                                    } else {
                                        current += 100;
                                        if(current > limit) {
                                            $interval.cancel(check);
                                            $log.error('VPAID player never responded');
                                            return deferred.reject('error, do something');
                                        }
                                    }
                                }, 100);

                            return deferred.promise;
                        }

                        function setup() {
                            var html = [
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
                                ].join('\n'),
                                flashvars = '';

                            html = html.replace(/__SWF__/g, _provider.swfUrl);

                            flashvars += 'adXmlUrl=' + encodeURIComponent(adTag);
                            flashvars += '&playerId=' + encodeURIComponent(id);

                            html = html.replace(/__FLASHVARS__/g, flashvars);

                            $element.prepend(html);

                            return emitReady();
                        }

                        Object.defineProperties(self, {
                            player : {
                                get: function() {
                                    var IEObject = $element[0].querySelectorAll('#c6VPAIDplayer_ie')[0],
                                        nonIEObject = $element[0].querySelectorAll('#c6VPAIDplayer')[0],
                                        val;

                                    try {
                                        val = nonIEObject.isCinema6player();

                                        if (val){ return nonIEObject; }

                                    } catch(e) {}

                                    try {
                                        val = IEObject.isCinema6player();

                                        if (val) { return IEObject; }

                                    } catch(e) {}

                                    return null;
                                }
                            },
                            currentTime : {
                                get: function() {
                                    return self.player && self.player.getAdProperties ?
                                        self.player.getAdProperties().adCurrentTime : 0;
                                }
                            }
                        });

                        function initTimer() {
                            var check = $interval(function() {
                                    if (self.player.getAdProperties) {
                                        if (self.player.getAdProperties().adCurrentTime > 0 ||
                                            adStarted || adVideoStart) {
                                            actualAdDeferred.resolve();
                                        }
                                    }
                                }, 300);

                            $timeout(function() {
                                adPlayerDeferred.reject();
                                adDeferred.reject();
                                actualAdDeferred.reject();
                                $interval.cancel(check);
                            }, _provider.adTimeout);
                        }

                        self.insertHTML = function() {
                            return setup();
                        };

                        self.loadAd = function() {
                            return adPlayerDeferred.promise.then(function() {
                                self.player.loadAd();
                                return adDeferred.promise;
                            });
                        };

                        self.startAd = function() {
                            initTimer();

                            return adDeferred.promise.then(function() {
                                self.player.startAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.pause = function() {
                            return adDeferred.promise.then(function() {
                                self.player.pauseAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.getAdProperties = function() {
                            return self.player ? self.player.getAdProperties() : null;
                        };

                        self.getDisplayBanners = function() {
                            return self.player ? self.player.getDisplayBanners() : null;
                        };

                        self.setVolume = function(volume) {
                            if (!self.player) { return; }
                            self.player.setVolume(volume);
                        };

                        self.resumeAd = function() {
                            return adDeferred.promise.then(function() {
                                self.player.resumeAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.stopAd = function() {
                            return adDeferred.promise.then(function() {
                                self.player.stopAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.isC6VpaidPlayer = function() {
                            return self.player ? self.player.isCinema6player() : false;
                        };

                        self.getCurrentTime = function() {
                            return self.player ? self.player.getAdProperties().adCurrentTime : 0;
                        };

                        self.getDuration = function() {
                            return self.player ? self.player.getAdProperties().adDuration : 0;
                        };

                        self.destroy = function() {
                            if (self.player) {
                                self.player.stopAd();
                                $element[0].removeChild($element[0].childNodes[0]);
                            }

                            $win.removeEventListener('message', handlePostMessage, false);
                        };

                        function handlePostMessage(e) {
                            // this player interface doesn't fire timeupdates
                            // we're relying on the events coming from the Player instead
                            // we have no controls on this player so the only thing time-related
                            // will be firing our own tracking pixels for reporting/analytics
                            try {
                                var data = JSON.parse(e.data);

                                /* jshint camelcase:false */
                                if(!data.__vpaid__ || (data.__vpaid__.id !== id)) { return; }

                                $log.info('EVENT: ', data.__vpaid__.type);

                                switch(data.__vpaid__.type) {
                                case 'onAdResponse':
                                    // we have the Adap swf but no ad
                                    self.emit('adPlayerReady', self);
                                    $rootScope.$apply(function() {
                                        adPlayerDeferred.resolve();
                                    });
                                    break;
                                case 'AdLoaded':
                                    // we SHOULD have the ad, but some people lie
                                    self.emit('adLoaded', self);
                                    $rootScope.$apply(function() {
                                        adDeferred.resolve();
                                    });
                                    break;
                                case 'AdStarted':
                                    // we DEFINITELY have an ACTUAL ad
                                    self.emit('play', self);
                                    adStarted = true;
                                    break;
                                case 'AdVideoStart':
                                    // another event that indicates we should DEFINITELY have an ACTUAL ad
                                    adVideoStart = true;
                                    break;
                                case 'AdPlaying':
                                    self.emit('play', self);
                                    break;
                                case 'AdPaused':
                                    self.emit('pause', self);
                                    break;
                                case 'displayBanners':
                                    self.emit('companionsReady', self);
                                    break;
                                case 'AdError':
                                    self.emit('error', self);
                                    break;
                                case 'AdStopped':
                                case 'AdVideoComplete':
                                case 'onAllAdsCompleted':
                                    self.emit('ended', self);
                                    break;
                                }

                                self.emit(data.__vpaid__.type, self);
                                /* jshint camelcase:true */
                            } catch (err) {}
                        }

                        $win.addEventListener('message', handlePostMessage, false);

                    }; // end _service.VPAIDPlayer()

                return new _service.VPAIDPlayer(id, adTag, $element, $window);
            };

            /* jshint camelcase:false */
            if (window.__karma__) { service._private = _service; }
            /* jshint camelcase:true */

            return service;
        }];

        /* jshint camelcase:false */
        if (window.__karma__) { this._private = _provider; }
        /* jshint camelcase:true */
    }])

    .directive('vpaidPlayer', ['c6EventEmitter','$log','$interval','VPAIDService','c6BrowserInfo',
    function                  ( c6EventEmitter , $log , $interval , VPAIDService , c6BrowserInfo ) {
        var profile = c6BrowserInfo.profile;

        return {
            restrict: 'E',
            scope: {
                adTag: '@',
                videoid: '@'
            },
            link: function(scope, $element, attrs) {
                var iface;

                function VpaidPlayer() {
                    var state,
                        emittedMeta,
                        emittedCanplay,
                        hasLoadAdBeenCalled,
                        currentTimeInterval,
                        publicTime,
                        hasStarted,
                        player;

                    function setupState() {
                        state = {
                            paused: true,
                            ended: false,
                            duration: 0,
                            readyState: -1,
                            error: false
                        };
                        hasLoadAdBeenCalled = false;
                        hasStarted = false;
                        emittedMeta = false;
                        emittedCanplay = false;
                        publicTime = 0;
                    }

                    function load(adTag) {
                        if (!adTag) { return; }

                        if (player) {
                            player.destroy();
                            $interval.cancel(currentTimeInterval);
                        }

                        setupState();

                        player = VPAIDService.createPlayer(scope.videoid, adTag, $element);

                        player.on('ready', function() {
                            state.readyState = 0;

                            iface.emit('ready');

                            player.on('ended', function() {
                                state.ended = true;
                                iface.emit('ended');
                                $interval.cancel(currentTimeInterval);
                            });

                            player.on('play', function() {
                                state.paused = false;
                                state.duration = player.getDuration();
                                state.readyState = 1;
                                if (!emittedMeta) {
                                    emittedMeta = true;
                                    iface.emit('loadedmetadata');
                                }

                                iface.emit('play');
                                state.readyState = 3;
                                if (!emittedCanplay) {
                                    emittedCanplay = true;
                                    iface.emit('canplay');
                                }

                                currentTimeInterval = $interval(
                                    function pollCurrentTime() {
                                        var currentTime = player.currentTime;

                                        if (currentTime !== publicTime) {
                                            publicTime = currentTime;
                                            iface.emit('timeupdate');
                                        }
                                    },
                                    250
                                );
                            });

                            player.on('pause', function() {
                                state.paused = true;
                                iface.emit('pause');
                            });

                            player.on('companionsReady', function() {
                                iface.emit('companionsReady');
                            });

                            player.on('error', function() {
                                iface.emit('error');
                            });

                            if (angular.isDefined(attrs.autoplay) && profile.autoplay) {
                                iface.play();
                            }
                        });

                        player.insertHTML().then(function(result) {
                            $log.info(result);
                        }, function(error) {
                            $log.error(error);
                            iface.emit('error');
                        });
                    }

                    Object.defineProperties(this, {
                        currentTime: {
                            get: function() {
                                return state.readyState > -1 ? player.currentTime : 0;
                            }
                        },
                        duration: {
                            get: function() {
                                return state.duration;
                            }
                        },
                        paused: {
                            get: function() {
                                return state.paused;
                            }
                        },
                        ended: {
                            get: function() {
                                return state.ended;
                            }
                        },
                        videoid: {
                            get: function() {
                                return scope.videoid;
                            }
                        },
                        readyState: {
                            get: function() {
                                return state.readyState;
                            }
                        }
                    });

                    this.load = function() {
                        if (hasLoadAdBeenCalled) { return; }

                        hasLoadAdBeenCalled = true;
                        return player.loadAd();
                    };

                    this.play = function() {
                        if (state.ended) {
                            load(scope.adTag);
                        }

                        iface.load();

                        if (hasStarted) {
                            return player.resumeAd();
                        } else {
                            hasStarted = true;
                            return player.startAd()
                                .catch(function() {
                                    player.destroy();
                                    iface.emit('error');
                                });
                        }
                    };

                    this.pause = function() {
                        return player.pause();
                    };

                    this.getCompanions = function(width, height) {
                        var args = arguments,
                            banners = player.getDisplayBanners();

                        return banners && banners.filter(function(banner) {
                            return args.length !== 2 ||
                                (banner.width === width && banner.height === height);
                        });
                    };

                    this.reload = function() {
                        load(scope.adTag);
                    };

                    this.minimize = function() {
                        return new Error('The video cannot be minimized.');
                    };

                    c6EventEmitter(this);

                    setupState();

                    scope.$watch('adTag', load);
                }

                iface = new VpaidPlayer();

                $element.data('video', iface);
                scope.$emit('<vpaid-player>:init', iface);
            }
        };
    }]);
});
