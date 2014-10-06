define (['angular','../../events/emitter','../../url/urlparser','../video'],
function( angular , eventsEmitter        , urlUrlparser        , video    ) {
    'use strict';

    var isDefined = angular.isDefined;

    return angular.module('c6.ui.videos.ext.dailymotion', [eventsEmitter.name, urlUrlparser.name, video.name])
        .service('DailymotionPlayerService', ['c6EventEmitter','c6UrlParser','$window',
                                              '$rootScope',
        function                             ( c6EventEmitter , c6UrlParser , $window ,
                                               $rootScope ) {
            var players = {};

            function objectWithout(object, props) {
                return Object.keys(object)
                    .filter(function(key) {
                        return props.indexOf(key) < 0;
                    })
                    .reduce(function(result, key) {
                        result[key] = object[key];
                        return result;
                    }, {});
            }

            function objectify(query) {
                function convert(value) {
                    if ((/^(\d+\.?\d+?)$/).test(value)) {
                        return parseFloat(value);
                    }

                    return value;
                }

                return query.split('&')
                    .map(function(pair) {
                        return pair.split('=')
                            .map(decodeURIComponent);
                    })
                    .map(function boolify(pair) {
                        return pair.length === 2 ? pair : [pair[0], true];
                    })
                    .reduce(function(object, pair) {
                        object[pair[0]] = convert(pair[1]);
                        return object;
                    }, {});
            }

            function delegateMessage(event) {
                var hostname = c6UrlParser(event.origin).hostname,
                    data;

                if (hostname !== 'www.dailymotion.com') { return; }

                data = objectify(event.data);

                $rootScope.$apply(function() {
                    players[data.id].emit(data.event, objectWithout(data, ['id', 'event']));
                });
            }

            this.Player = function($iframe) {
                var params = objectify(c6UrlParser($iframe.attr('src')).search);

                if (!params.id) {
                    throw new Error(
                        'Provided iFrame has no id specified in the search params.'
                    );
                }

                if (params.api !== 'postMessage') {
                    throw new Error(
                        'Provided iFrame must have "api" set to "postMessage" in the search params.'
                    );
                }

                this.call = function() {
                    var args = Array.prototype.slice.call(arguments),
                        playerWindow = $iframe.prop('contentWindow');

                    playerWindow.postMessage(args.map(encodeURIComponent).join('='), '*');
                };

                players[params.id] = c6EventEmitter(this);

                $iframe.on('$destroy', function() {
                    delete players[params.id];
                });
            };

            $window.addEventListener('message', delegateMessage, false);
        }])

        .directive('dailymotionPlayer', ['DailymotionPlayerService','$http','c6EventEmitter',
                                         'c6VideoService',
        function                        ( DailymotionPlayerService , $http , c6EventEmitter ,
                                          c6VideoService ) {
            var supportsHTML5Video = !!c6VideoService.bestFormat(['video/mp4']),
                featureParams = supportsHTML5Video ? [['html']] : [];

            function toParams(data) {
                return data.map(function(pair) {
                    return pair.map(encodeURIComponent).join('=');
                }).join('&');
            }

            function link(scope, $element, attrs) {
                function VideoPlayer($iframe) {
                    var self = this,
                        player = null, state = null;

                    function setupState() {
                        return {
                            currentTime: 0,
                            duration: 0,
                            ended: false,
                            error: null,
                            paused: true,
                            readyState: -1,
                            seeking: false
                        };
                    }

                    Object.defineProperties(this, {
                        currentTime: {
                            get: function() {
                                return state.currentTime;
                            },
                            set: function(time) {
                                return player.call('seek', time);
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
                        error: {
                            get: function() {
                                return state.error;
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
                        }
                    });

                    this.pause = function() {
                        return player.call('pause');
                    };

                    this.play = function() {
                        return player.call('play');
                    };

                    scope.$watch('videoid', function(videoid, oldVideoid) {
                        state = setupState();

                        $iframe.attr('src', '//www.dailymotion.com/embed/video/' + videoid +
                            '?' + toParams([
                                ['api', 'postMessage'],
                                ['id', scope.id]
                            ].concat(featureParams))
                        );

                        $http.get(
                            'https://api.dailymotion.com/video/' + videoid +
                            '?' + toParams([['fields', 'duration']])
                        ).then(function(response) {
                            state.readyState = 1;
                            state.duration = response.data.duration;

                            self.emit('loadedmetadata');
                            self.emit('durationchange');
                        });

                        if (videoid === oldVideoid) {
                            player = new DailymotionPlayerService.Player($iframe)
                                .on('apiready', function() {
                                    state.readyState = 0;

                                    self.emit('ready');
                                    if (isDefined(attrs.autoplay)) {
                                        player.call('play');
                                    }
                                })
                                .on('timeupdate', function(data) {
                                    state.currentTime = data.time;

                                    self.emit('timeupdate');
                                })
                                .on('durationchange', function(data) {
                                    var currentDuration = state.duration,
                                        newDuration = data.duration;

                                    state.duration = newDuration;

                                    if (newDuration !== currentDuration) {
                                        self.emit('durationchange');
                                    }
                                })
                                .on('ended', function() {
                                    state.ended = true;

                                    self.emit('ended');
                                })
                                .on('playing', function() {
                                    state.readyState = 3;
                                    state.ended = false;
                                    state.paused = false;

                                    self.emit('play');
                                    self.emit('canplay');
                                })
                                .on('pause', function() {
                                    state.paused = true;

                                    self.emit('pause');
                                })
                                .on('seeking', function() {
                                    state.seeking = true;

                                    self.emit('seeking');
                                })
                                .on('seeked', function() {
                                    state.seeking = false;

                                    self.emit('seeked');
                                });
                        }
                    });

                    c6EventEmitter(this);
                }

                $element.data('video', new VideoPlayer($element.find('iframe')));
            }

            return {
                restrict: 'E',
                template: [
                    '<iframe src="about:blank"',
                    '    width="100%"',
                    '    height="100%"',
                    '    frameborder="0">',
                    '</iframe>'
                ].join('\n'),
                scope: {
                    id: '@',
                    videoid: '@'
                },
                link: link
            };
        }]);
});
