(function(angular) {
    'use strict';

    angular.module('c6.ui')
        .factory('c6AudioContext', ['$window', function($window) {
            return $window.AudioContext || $window.webkitAudioContext || $window.msAudioContext || $window.mozAudioContext;
        }])

        .service('c6Sfx', ['c6AudioContext', '$http', '$q', '$rootScope', '$window', '$log', function(AudioContext, $http, $q, $rootScope, $window, $log) {
            var context = AudioContext ? new AudioContext() : undefined,
                sounds = [],
                safeApply = function(func) {
                    return $rootScope.$$phase ? func() : $rootScope.$apply(func);
                },
                c6SfxSvc = this,
                C6Sfx = function(config, context) {
                    var self = this,
                        buffer,
                        players = [],
                        activeSources = [],
                        createPlayerInstance = function() {
                            $log.log('creating instance');
                            var instance = new $window.Audio(self.src);
                            players.push(instance);
                            return instance;
                        };

                    this.name = config.name;
                    this.src = (function(src) {
                        var srcArray = src.split('.'),
                            potentialExtension = srcArray[srcArray.length - 1],
                            hasValidExtension = (c6SfxSvc.validFormats.indexOf(c6SfxSvc.formatForExtension(potentialExtension)) !== -1);

                        return hasValidExtension ? src : src + '.' + c6SfxSvc.extensionForFormat(c6SfxSvc.bestFormat());
                    })(config.src);
                    this.isLoaded = false;

                    this.load = function () {
                        if (context) {
                            var me = this,
                                waitForIt = $q.defer();

                            $http({
                                method: 'GET',
                                url: this.src,
                                responseType: 'arraybuffer'
                            }).then(function(response) {
                                context.decodeAudioData(response.data, function(buff) {
                                    buffer = buff;
                                    safeApply(function() {
                                        waitForIt.resolve(me);
                                        me.isLoaded = true;
                                    });
                                });
                            });

                            return waitForIt.promise;
                        } else {
                            players.length = 0;

                            for (var i = 0; i < 3; i++) {
                                createPlayerInstance();
                            }
                        }
                    };

                    this.play = function(config) {
                        if (context) {
                            this.play = function(config) {
                                var source = context.createBufferSource();

                                source.buffer = buffer;
                                source.loop = (config && config.loop) || false;
                                source.onended = function() {
                                    activeSources.splice(activeSources.indexOf(source), 1);
                                };

                                source.connect(context.destination);

                                if (source.start) {
                                    source.start(0);
                                } else if (source.noteOn) {
                                    source.noteOn(0);
                                }

                                activeSources.push(source);
                            };
                            this.play(config);
                        } else {
                            this.play = function(config) {
                                var goodPlayer;

                                players.some(function(player, index) {
                                    if (player.paused || player.ended) {
                                        player.currentTime = 0;
                                        goodPlayer = player;
                                        return true;
                                    } else if (index === players.length - 1) {
                                        goodPlayer = createPlayerInstance();
                                    }
                                });

                                goodPlayer.loop = (config && config.loop) || false;
                                goodPlayer.play();
                            };
                            this.play(config);
                        }
                    };

                    this.stop = function() {
                        if (context) {
                            this.stop = function() {
                                activeSources.forEach(function(source) {
                                    if (source.stop) {
                                        source.stop(0);
                                    } else if (source.noteOff) {
                                        source.noteOff(0);
                                    }
                                });
                                activeSources.length = 0;
                            };
                            this.stop();
                        } else {
                            this.stop = function() {
                                players.forEach(function(player) {
                                    if (!player.paused && !player.ended) {
                                        player.pause();
                                    }
                                });
                            };
                            this.stop();
                        }
                    };

                    // Disable if we don't have the required browser support
                    if ((!context && c6SfxSvc.isMobileSafari) || !$window.Audio) {
                        var noop = angular.noop,
                            isFunction = angular.isFunction;

                        for (var key in this) {
                            if (this.hasOwnProperty(key)) {
                                if (isFunction(this[key])) {
                                    this[key] = noop;
                                }
                            }
                        }
                    }
                };

            this.loadSounds = function(configs) {
                configs.forEach(function(config) {
                    var sfx = new C6Sfx(config, context);
                    sounds.push(sfx);
                    sfx.load();
                });
            };

            this.getSoundByName = function(name) {
                var toReturn;
                sounds.some(function(sound) {
                    if (sound.name === name) {
                        toReturn = sound;
                        return true;
                    }
                });
                return toReturn;
            };

            this.playSound = function(name, config) {
                this.getSoundByName(name).play(config);
            };

            this.stopSound = function(name) {
                this.getSoundByName(name).stop();
            };

            this.bestFormat = function(formats) {
                var goodFormats = [],
                greatFormats = [],
                audio = new $window.Audio();

                if (!formats) {
                    formats = this.validFormats;
                }

                if (!angular.isArray(formats)) {
                    throw new TypeError('You must pass in an array of format strings.');
                }

                formats.forEach(function(format) {
                    var decision = audio.canPlayType(format);

                    if (decision === 'probably') {
                        greatFormats.push(format);
                    } else if (decision === 'maybe') {
                        goodFormats.push(format);
                    }
                });

                audio = null;

                return greatFormats[0] || goodFormats[0];
            };

            this.validFormats = ['audio/mp3', 'audio/ogg'];

            this.extensionForFormat = function(format) {
                return format.split('/').pop();
            };

            this.formatForExtension = function(extension) {
                return 'audio/' + extension;
            };

            this.isMobileSafari = $window.navigator.userAgent.match(/(iPod|iPhone|iPad)/);
        }]);
})(angular);
