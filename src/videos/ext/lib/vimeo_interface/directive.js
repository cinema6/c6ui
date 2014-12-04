define (['angular'],
function( angular ) {
    'use strict';

    var noop = angular.noop,
        isDefined = angular.isDefined;

    return function(name, iframeSrc, apiServiceName) {
        factory.$inject = ['c6BrowserInfo', apiServiceName,'c6EventEmitter'];
        function factory  ( c6BrowserInfo , APIService    , c6EventEmitter ) {
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

                        this.minimize = function() {
                            return new Error('The video cannot be minimized.');
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

                            $iframe.attr(
                                'src',
                                iframeSrc
                                    .replace('{videoid}', videoid)
                                    .replace('{id}', scope.id)
                            );

                            // This will only happen on initialization. We'll continue to use this
                            // player object, even as the src of the iframe is changed.
                            if (videoid === lastVideoid) {
                                player = new APIService.Player($iframe);

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
                    scope.$emit('<' + name + '-player>:init', iface);
                }
            };
        }

        return factory;
    };
});
