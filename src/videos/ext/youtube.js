define (['angular','../../events/emitter','./lib/youtube','../../browser/info'],
function( angular , eventsEmitter        , youtube       , browserInfo        ) {
    'use strict';

    var forEach = angular.forEach,
        isArray = angular.isArray,
        jqLite = angular.element,
        isDefined = angular.isDefined,
        noop = angular.noop;

    return angular.module('c6.ui.videos.ext.youtube', [eventsEmitter.name, browserInfo.name])
        .config(['$sceDelegateProvider',
        function( $sceDelegateProvider ) {
            $sceDelegateProvider.resourceUrlWhitelist([
                '*://www.youtube.com/**'
            ]);
        }])

        .provider('YouTubeDataService', [function() {
            var apiKey = null;

            function identity(arg) {
                return arg;
            }

            function first(array) {
                return array[0];
            }

            // Example duration: "PT4H6M33S"
            // Further comments show the return value of each step in
            // the chain if this string was passed to this function.
            function durationToSeconds(duration) {
                // Get all numerical parts of duration as an array
                return duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/).slice(1) // ["4", "6", "33"]
                    // If any durations are not specified, default them to 0
                    .map(function(num) {
                        return num || 0;
                    })
                    // Convert strings to numbers
                    .map(parseFloat) // [4, 6, 33]
                    // Reverse the numbers
                    .reverse() // [33, 6, 4]
                    // Now, first item is seconds, second item is
                    // minutes, third item is hours. Convert to seconds:
                    .reduce(function(total, next, index) {
                        var multiplyer = Math.pow(60, index);

                        return total + (next * multiplyer);
                    }, 0); // 14793
            }

            function returnData(response) {
                return response.data;
            }

            function returnItems(data) {
                return data.items;
            }

            function processItem(item) {
                var properties = {
                    'contentDetails.duration': durationToSeconds
                };

                forEach(properties, function(fn, prop) {
                    var parts = prop.split('.'),
                        finalProp = parts.pop(),
                        object = parts.reduce(function(object, part) {
                            return object && object[part];
                        }, item);

                    if (object && object.hasOwnProperty(finalProp)) {
                        object[finalProp] = fn(object[finalProp]);
                    }
                });

                return item;
            }

            function processAllItems(items) {
                return items.map(processItem);
            }

            // Returns a new object with all the props/values of
            // "object" and the props/values of "defs" if "object" does
            // not have that property
            function defaults(defs, object) {
                // Get an array of the properties of the defaults and of
                // the provided object
                return Object.keys(defs).concat(Object.keys(object))
                    // Remove duplicate properties
                    .filter(function(prop, index, self) {
                        return self.indexOf(prop) === index;
                    })
                    .reduce(function(built, prop) {
                        // Create an object that has the default values
                        // if necessary
                        if (object.hasOwnProperty(prop)) {
                            built[prop] = object[prop];
                        } else {
                            built[prop] = defs[prop];
                        }

                        return built;
                    }, {});
            }

            Videos.$inject = ['get','expectResult'];
            function Videos  ( get , expectResult ) {
                this.list = function(config) {
                    var manyVideos = isArray(config.id),
                        // If "part" is not provided, set default to
                        // "snippet"
                        params = defaults({
                            part: 'snippet'
                        }, Object.keys(config).reduce(function(params, prop) {
                            var value = config[prop];

                            // Convert any arrays in the config to a CSV
                            // string
                            params[prop] = isArray(value) ? value.join(',') : value;
                            return params;
                        }, {}));

                    return get('videos', { params: params })
                        .then(returnData)
                        .then(returnItems)
                        .then(processAllItems)
                        .then(manyVideos ? identity : first)
                        .then(manyVideos ? identity : expectResult({
                            code: 404,
                            message: 'No video was found.'
                        }));
                };
            }

            this.apiKey = function(key) {
                /* jshint boss:true */
                return (apiKey = key);
            };

            this.$get = ['$injector','$http','$q',
            function    ( $injector , $http , $q ) {
                var locals = {
                    get: get,
                    expectResult: expectResult
                };

                function expectResult(message) {
                    return function(value) {
                        return isDefined(value) ? value : $q.reject(message);
                    };
                }

                function get(_url, config) {
                    var url = 'https://www.googleapis.com/youtube/v3/' + _url;

                    config.params.key = apiKey;

                    return $http.get(url, config);
                }

                return {
                    videos: $injector.instantiate(Videos, locals)
                };
            }];
        }])

        .directive('youtubePlayer', ['c6EventEmitter','$interval','$compile','YouTubeDataService','c6BrowserInfo',
        function                    ( c6EventEmitter , $interval , $compile , YouTubeDataService , c6BrowserInfo ) {
            var profile = c6BrowserInfo.profile;

            function YouTubePlayerError(code, message) {
                this.name = 'YouTubePlayerError';
                this.code = code || null;
                this.message = message || '';
            }
            YouTubePlayerError.prototype = Object.create(Error.prototype);

            return {
                restrict: 'E',
                scope: {
                    videoid: '@',
                    start: '@',
                    end: '@'
                },
                template: [
                    '<iframe width="100%"',
                    '    height="100%"',
                    '    src="{{url}}"',
                    '    frameborder="0"',
                    '    allowfullscreen>',
                    '</iframe>'
                ].join('\n'),
                compile: function($element) {
                    // Grab the string template for this directive before angular compiles it.
                    var iframeTemplate = $element.html();

                    // Remove the iframe template from the DOM. It will be created when a
                    // VideoPlayer is created.
                    $element.empty();

                    return function postLink(scope, $element, attrs) {
                        var iface = new VideoPlayer(scope.videoid);

                        function VideoPlayer(id) {
                            var self = this,
                                hasPaused = false,
                                currentTimeInterval = null,
                                player = null,
                                seekStartTime = null,
                                publicTime = 0,
                                state;

                            function start() {
                                return parseInt(scope.start) || 0;
                            }

                            function end() {
                                return parseInt(scope.end) || Infinity;
                            }

                            function setupState() {
                                return {
                                    currentTime: 0,
                                    duration: 0,
                                    ended: false,
                                    paused: true,
                                    seeking: false,
                                    readyState: -1,
                                    error: null
                                };
                            }

                            function setError(err) {
                                state.error = err;
                                self.emit('error');
                            }

                            function load(id) {
                                var $iframe;

                                scope.url = 'https://www.youtube.com/embed/' +
                                    id +
                                    '?html5=1&wmode=opaque&rel=0&enablejsapi=1';

                                state = setupState();

                                YouTubeDataService.videos.list({
                                    id: id,
                                    part: ['status', 'contentDetails']
                                }).then(function(metaData) {
                                    state.duration = Math.min(
                                        end(),
                                        metaData.contentDetails.duration
                                    ) - start();

                                    state.readyState = 1;
                                    self.emit('loadedmetadata');

                                    if (!metaData.status.embeddable) {
                                        setError(new YouTubePlayerError(403,
                                            'The video ' + id + ' is not embeddable.'
                                        ));
                                    }
                                }).catch(function(error) {
                                    setError(new YouTubePlayerError(error.code, error.message));
                                });

                                $iframe = $compile(iframeTemplate)(scope, function($iframe) {
                                    $element.append($iframe);
                                });

                                if (player) {
                                    jqLite(player.getIframe()).remove();
                                }

                                player = new youtube.Player($iframe[0], {
                                    events: {
                                        onReady: function onReady() {
                                            state.readyState = 0;
                                            self.emit('ready');

                                            currentTimeInterval = $interval(
                                                function pollCurrentTime() {
                                                    var startTime = start(),
                                                        endTime = end(),
                                                        currentTime = player.getCurrentTime();

                                                    state.currentTime = Math.min(
                                                        Math.max(currentTime - startTime, 0),
                                                        endTime - startTime
                                                    );

                                                    if (currentTime < startTime && !state.paused) {
                                                        return player.seekTo(startTime);
                                                    } else if (currentTime >= endTime && !state.ended) {
                                                        state.ended = true;
                                                        self.emit('ended');
                                                        return player.pauseVideo();
                                                    }

                                                    if (currentTime !== publicTime) {
                                                        publicTime = currentTime;
                                                        self.emit('timeupdate');
                                                    }

                                                    if (state.seeking) {
                                                        if (currentTime !== seekStartTime) {
                                                            state.seeking = false;
                                                            self.emit('seeked');
                                                        }
                                                    }
                                                },
                                                250
                                            );

                                            if (isDefined(attrs.autoplay) && profile.autoplay) {
                                                player.playVideo();
                                            }
                                        },
                                        onStateChange: function onStateChange(event) {
                                            var PlayerState = youtube.PlayerState;

                                            switch (event.data) {
                                            case PlayerState.PLAYING:
                                                if (state.ended) {
                                                    player.seekTo(start());
                                                }

                                                state.ended = false;
                                                state.paused = false;

                                                if (state.readyState < 2) {
                                                    state.readyState = 3;
                                                    self.emit('canplay');
                                                }

                                                if (hasPaused) {
                                                    self.emit('play');
                                                }

                                                self.emit('playing');
                                                break;

                                            case PlayerState.ENDED:
                                                state.paused = true;
                                                state.ended = true;
                                                self.emit('ended');
                                                break;

                                            case PlayerState.PAUSED:
                                                state.paused = true;
                                                self.emit('pause');
                                                hasPaused = true;
                                                break;
                                            }
                                        }
                                    }
                                });

                                $iframe.on('$destroy', function() {
                                    $interval.cancel(currentTimeInterval);
                                    self.emit('destroy');
                                });
                            }

                            Object.defineProperties(this, {
                                currentTime: {
                                    get: function() {
                                        return state.currentTime;
                                    },
                                    set: function(time) {
                                        var adjustedTime = Math.min(
                                            Math.max(start(), start() + time),
                                            end()
                                        );

                                        if (self.readyState < 1) {
                                            throw new Error(
                                                'Can\'t seek video. Haven\'t loaded metadata.'
                                            );
                                        }

                                        seekStartTime = state.currentTime;
                                        state.seeking = true;
                                        self.emit('seeking');
                                        player.seekTo(adjustedTime);
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
                                videoid: {
                                    get: function() {
                                        return id;
                                    }
                                },
                                error: {
                                    get: function() {
                                        return state.error;
                                    }
                                }
                            });

                            this.pause = function() {
                                player.pauseVideo();
                            };

                            this.play = function() {
                                player.playVideo();
                            };

                            this.load = noop;

                            this.reload = function() {
                                return load(scope.videoid);
                            };

                            c6EventEmitter(this);

                            // Whenever the video loaded into the player changes (or is
                            // initialized,) a few things need to happen:
                            //
                            // 1. Set the scope's "url" property to the correct URL to load into
                            //    the iframe.
                            // 2. Create a new iframe (using the string template saved during the
                            //    compile phase.)
                            // 3. Destroy the previous iframe (if there is one.)
                            // 4. Create a new YouTube Player object for the new video.
                            scope.$watch('videoid', load);
                        }

                        $element.data('video', iface);
                        scope.$emit('<youtube-player>:init', iface);
                    };
                }
            };
        }]);
});
