define (['angular','../../events/emitter','../../url/urlparser','../../browser/info'],
function( angular , eventsEmitter        , urlUrlparser        , browserInfo        ) {
    'use strict';

    var fromJson = angular.fromJson,
        isDefined = angular.isDefined,
        noop = angular.noop;

    return angular.module('c6.ui.videos.ext.vimeo', [eventsEmitter.name, urlUrlparser.name, browserInfo.name])
        .service('VimeoPlayerService', ['$q','$window','$rootScope','c6EventEmitter',
                                        'c6UrlParser',
        function                       ( $q , $window , $rootScope , c6EventEmitter ,
                                         c6UrlParser ) {
            var service = this;

            function delegateMessage(event) {
                var data = event.data,
                    origin = c6UrlParser(event.origin),
                    player;

                if (origin.hostname !== 'player.vimeo.com') { return; }

                data = fromJson(data);

                /* jshint camelcase:false */
                player = service.players[data.player_id];
                /* jshint camelcase:true */

                if (!player) { return; }

                $rootScope.$apply(function() {
                    player._handleMessage(data);
                });
            }

            this.players = {};

            this.Player = function($iframe) {
                var self = this,
                    pending = {},
                    src = c6UrlParser($iframe.attr('src')),
                    id = (src.search.match(/player_id=((\w|-)+)/) || [])[1];

                if (!id) {
                    throw new Error(
                        'Provided iFrame has no player_id specified in the search params.'
                    );
                }

                this._handleMessage = function(data) {
                    var method = data.method,
                        event = data.event,
                        value = data.value;

                    if (method) {
                        pending[method].resolve(value);
                        delete pending[method];
                    }

                    if (event) {
                        this.emit(event, data.data);
                    }
                };

                this.call = function(method, data) {
                    var deferred = pending[method] || $q.defer(),
                        message = {
                            method: method
                        };

                    if (arguments.length > 1) {
                        message.value = data;
                    }

                    $iframe[0].contentWindow.postMessage(
                        angular.toJson(message),
                        '*'
                    );

                    switch (method) {
                    case 'play':
                    case 'pause':
                    case 'seekTo':
                    case 'unload':
                    case 'setColor':
                    case 'setLoop':
                    case 'setVolume':
                        deferred.resolve();
                        break;

                    default:
                        pending[method] = deferred;
                    }

                    return deferred.promise;
                };

                c6EventEmitter(this);

                this.on('newListener', function(event) {
                    if (event.search(
                        /^(ready|newListener|removeListener)$/
                    ) > -1) { return; }

                    self.call('addEventListener', event);
                });

                $iframe.on('$destroy', function() {
                    delete service.players[id];
                });

                service.players[id] = this;
            };

            $window.addEventListener('message', delegateMessage, false);
        }])

        .directive('vimeoPlayer', ['VimeoPlayerService','c6EventEmitter','c6BrowserInfo',
        function                  ( VimeoPlayerService , c6EventEmitter , c6BrowserInfo ) {
            var profile = c6BrowserInfo.profile;

            return {
                restrict: 'E',
                template: [
                    '<iframe id="{{id}}"',
                    '    src="about:blank"',
                    '    width="100%"',
                    '    height="100%"',
                    '    frameborder="0"',
                    '    webkitAllowFullScreen',
                    '    mozallowfullscreen',
                    '    allowFullScreen>',
                    '</iframe>'
                ].join('\n'),
                scope: {
                    videoid: '@',
                    id: '@',
                    start: '@',
                    end: '@'
                },
                link: function(scope, $element, attrs) {
                    var iface = new VideoPlayer($element.find('iframe'));

                    function start() {
                        return parseInt(scope.start) || 0;
                    }

                    function end() {
                        return parseInt(scope.end) || Infinity;
                    }

                    function VideoPlayer($iframe) {
                        var self = this,
                            player = null,
                            state;

                        function setupState() {
                            return {
                                buffered: 0,
                                currentTime: 0,
                                duration: 0,
                                ended: false,
                                paused: true,
                                readyState: -1,
                                seeking: false,
                                error: null
                            };
                        }

                        function addEventListeners(player) {
                            player
                                .once('loadProgress', function() {
                                    state.readyState = 3;
                                    self.emit('canplay');
                                    self.emit('loadstart');
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    if (percent >= 0.25) {
                                        state.readyState = 4;
                                        self.emit('canplaythrough');
                                        player.removeListener('loadProgress', this);
                                    }
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    state.buffered = percent;
                                    self.emit('progress');
                                })
                                .on('finish', function() {
                                    state.ended = true;
                                    self.emit('ended');
                                })
                                .on('pause', function() {
                                    state.paused = true;

                                    self.emit('pause');
                                })
                                .on('play', function() {
                                    if (state.ended) {
                                        player.call('seekTo', start());
                                    }

                                    state.ended = false;
                                    state.paused = false;

                                    self.emit('play');
                                })
                                .on('seek', function() {
                                    state.seeking = false;
                                    self.emit('seeked');
                                })
                                .on('playProgress', function(data) {
                                    var time = parseFloat(data.seconds),
                                        startTime = start(),
                                        endTime = end();

                                    state.currentTime = Math.min(
                                        Math.max(time - start(), 0),
                                        end() - start()
                                    );

                                    if (time < startTime) {
                                        return player.call('seekTo', startTime);
                                    } else if (time >= endTime) {
                                        state.ended = true;
                                        self.emit('ended');
                                        return player.call('pause');
                                    }

                                    self.emit('timeupdate');
                                });
                        }

                        function removeEventListeners(player) {
                            [
                                'loadProgress',
                                'finish',
                                'pause',
                                'play',
                                'seek',
                                'playProgress'
                            ].forEach(function(event) {
                                player.removeAllListeners(event);
                            });
                        }

                        this.play = function() {
                            player.call('play');
                        };

                        this.pause = function() {
                            player.call('pause');
                        };

                        this.load = noop;

                        this.reload = function() {
                            state = setupState();
                            removeEventListeners(player);

                            $iframe.attr('src', $iframe.attr('src'));
                        };

                        Object.defineProperties(this, {
                            buffered: {
                                get: function() {
                                    return state.buffered;
                                }
                            },
                            currentTime: {
                                get: function() {
                                    return state.currentTime;
                                },
                                set: function(time) {
                                    var adjustedTime = Math.min(
                                        Math.max(start() + time, start()),
                                        end()
                                    );

                                    state.seeking = true;
                                    self.emit('seeking');
                                    player.call('seekTo', adjustedTime);
                                }
                            },
                            duration: {
                                get: function() {
                                    return state.duration;
                                }
                            },
                            ended: {
                                get: function() {
                                    return state.ended;
                                }
                            },
                            paused: {
                                get: function() {
                                    return state.paused;
                                }
                            },
                            readyState: {
                                get: function() {
                                    return state.readyState;
                                }
                            },
                            seeking: {
                                get: function() {
                                    return state.seeking;
                                }
                            },
                            error: {
                                get: function() {
                                    return state.error;
                                }
                            }
                        });


                        // When the video loaded into the player changes (or is initialized,) there
                        // are a few steps that need to be taken:
                        //
                        // 1. Reset the state of the player.
                        // 2. Change the src of the iframe to the new embed URL
                        // 3. Create a new Vimeo Player object (only on initialization.)
                        // 4. Remove all non-ready event listeners (if there is already a player.)
                        scope.$watch('videoid', function(videoid, lastVideoid) {
                            state = setupState();

                            $iframe.attr('src', '//player.vimeo.com/video/' +
                                videoid +
                                '?api=1&player_id=' +
                                scope.id);

                            // This will only happen on initialization. We'll continue to use this
                            // player object, even as the src of the iframe is changed.
                            if (videoid === lastVideoid) {
                                player = new VimeoPlayerService.Player($iframe);

                                player.on('ready', function() {
                                    state.readyState = 0;
                                    self.emit('ready');
                                    addEventListeners(player);

                                    player.call('getDuration')
                                        .then(function getDuration(duration) {
                                            state.readyState = 1;
                                            state.duration = (Math.min(end(), duration) -  start());
                                            self.emit('loadedmetadata');
                                        });

                                    if (isDefined(attrs.autoplay) && profile.autoplay) {
                                        player.call('play');
                                    }
                                });
                            } else {
                                // This only happens when the video is changed from one to another.
                                // We remove all the non-ready event listeners (they'll be readded
                                // when the iframe's new page loads and "ready" event is emitted
                                // again.)
                                removeEventListeners(player);
                            }
                        });

                        c6EventEmitter(this);
                    }

                    $element.data('video', iface);
                    scope.$emit('<vimeo-player>:init', iface);
                }
            };
        }]);
});
