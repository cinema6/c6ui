define (['angular','../events/emitter','../browser/info'],
function( angular , eventsEmitter     , browserInfo      ) {
    'use strict';

    return angular.module('c6.ui.videos.vpaid',[eventsEmitter.name, browserInfo.name])
    .provider('VPAIDService', [function () {
        var _swfUrl;

        this.swfUrl = function(url) {
            _swfUrl = url;

            return this;
        };

        this.$get = ['$q','$window','$rootScope','$interval','$timeout','$log','c6EventEmitter',
        function    ( $q , $window , $rootScope , $interval , $timeout , $log , c6EventEmitter ) {
            var service = {},
                _service = {};

            service.createPlayer = function(id, adTag, vpaidTemplate, $element) {
                _service.VPAIDPlayer = function(id, adTag, vpaidTemplate, $element, $win) {
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

                        function setup(template) {
                            var html,
                                flashvars = '';

                            html = template.replace(/__SWF__/g, _swfUrl);

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
                                    return self.player.getAdProperties ?
                                        self.player.getAdProperties().adCurrentTime : 0;
                                }
                            }
                        });

                        function initTimer() {
                            var check = $interval(function() {
                                    if (self.player.getAdProperties) {
                                        if (self.player.getAdProperties().adCurrentTime > 0 &&
                                            adStarted && adVideoStart) {
                                            actualAdDeferred.resolve();
                                        }
                                    }
                                }, 300);

                            $timeout(function() {
                                adPlayerDeferred.reject();
                                adDeferred.reject();
                                actualAdDeferred.reject();
                                $interval.cancel(check);
                            }, 3000);
                        }

                        self.insertHTML = function() {
                            return setup(vpaidTemplate);
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
                            return self.player.getAdProperties();
                        };

                        self.getDisplayBanners = function() {
                            return self.player.getDisplayBanners();
                        };

                        self.setVolume = function(volume) {
                            self.player.setVolume(volume);
                        };

                        self.resumeAd = function() {
                            return adDeferred.promise.then(function() {
                                self.player.resumeAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.stopAd = function() {
                            self.player.stopAd();
                        };

                        self.isC6VpaidPlayer = function() {
                            return self.player.isCinema6player();
                        };

                        self.getCurrentTime = function() {
                            return self.player.getAdProperties().adCurrentTime;
                        };

                        self.getDuration = function() {
                            return self.player.getAdProperties().adDuration;
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

                return new _service.VPAIDPlayer(id, adTag, vpaidTemplate, $element, $window);
            };

            return service;
        }];
    }])

    .directive('vpaidPlayer', ['c6EventEmitter','$log','VPAIDService','c6BrowserInfo',
    function                  ( c6EventEmitter , $log , VPAIDService , c6BrowserInfo ) {
        var profile = c6BrowserInfo.profile;

        return {
            restrict: 'E',
            template: [
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
            scope: {
                adTag: '@',
                videoid: '@'
            },
            compile: function(element$) {
                var vpaidTemplate = element$.html();

                element$.empty();

                return function postLink(scope, $element, attrs) {
                    var iface;

                    function VpaidPlayer(id, adTag) {
                        var state,
                            playerReady,
                            hasLoadAdBeenCalled,
                            hasStarted,
                            player;

                        function setupState() {
                            state = {
                                paused: true,
                                ended: false,
                                duration: NaN
                            };
                            playerReady = false;
                            hasLoadAdBeenCalled = false;
                            hasStarted = false;
                        }

                        function load(adTag) {
                            if (player) {
                                player.destroy();
                            }

                            setupState();

                            player = VPAIDService.createPlayer(id, adTag, vpaidTemplate, $element);

                            player.on('ready', function() {
                                playerReady = true;

                                iface.emit('ready');

                                player.on('ended', function() {
                                    state.ended = true;
                                    iface.emit('ended', iface);
                                });

                                player.on('play', function() {
                                    state.paused = false;
                                    state.duration = player.getDuration();
                                    iface.emit('play', iface);
                                });

                                player.on('pause', function() {
                                    state.paused = true;
                                    iface.emit('pause', iface);
                                });

                                player.on('companionsReady', function() {
                                    iface.emit('getCompanions', player);
                                });

                                if (angular.isDefined(attrs.autoplay) && profile.autoplay) {
                                    iface.play();
                                }
                            });

                            player.insertHTML().then(function(result) {
                                $log.info(result);
                            }, function(error) {
                                $log.error(error);
                                iface.emit('ended', iface);
                            });
                        }

                        Object.defineProperties(this, {
                            currentTime: {
                                get: function() {
                                    return playerReady ? player.currentTime : 0;
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
                                    return id;
                                }
                            }
                        });

                        this.loadAd = function() {
                            hasLoadAdBeenCalled = true;
                            return player.loadAd();
                        };

                        this.play = function() {
                            if (!hasLoadAdBeenCalled) {
                                iface.loadAd();
                            }

                            if (hasStarted) {
                                return player.resumeAd();
                            } else {
                                hasStarted = true;
                                return player.startAd();
                            }
                        };

                        this.pause = function() {
                            return player.pause();
                        };

                        this.destroy = function() {
                            player.destroy();
                        };

                        this.reload = function() {
                            load(adTag);
                        };

                        c6EventEmitter(this);

                        scope.$watch('adTag', load);
                    }

                    iface = new VpaidPlayer(scope.videoid, scope.adTag);

                    $element.data('video', iface);
                    scope.$emit('<vpaid-player>:init', iface);
                };
            }
        };
    }]);
});