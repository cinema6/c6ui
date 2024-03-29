define  (['angular','../events/emitter','../browser/info','./video'     ,'../imagepreloader/imagepreloader'],
function(  angular , eventsEmitter     , browserInfo     , videoService , imagePreloader                   ) {
    'use strict';

    var forEach = angular.forEach,
        isDefined = angular.isDefined,
        noop = angular.noop,
        toJson = angular.toJson;

    return angular.module('c6.ui.videos.vast', [eventsEmitter.name, browserInfo.name, videoService.name, imagePreloader.name])
    .provider('VASTService', [function() {
        var _provider = {
            adTimeout: 3000
        };

        this.adTimeout = function(seconds) {
            _provider.adTimeout = parseFloat(seconds) * 1000;
            return this;
        };

        this.$get = ['$log','$http','$window','c6ImagePreloader','$q','c6VideoService','$timeout','c6BrowserInfo',
        function    ( $log , $http , $window , c6ImagePreloader , $q , c6VideoService , $timeout , c6BrowserInfo ) {
            var service = {},
                _service = {};

            function getNodeValue(node) {
                return node.firstChild.nodeValue || node.firstChild.firstChild.nodeValue;
            }

            _service.VAST = function(xml) {
                var $ = xml.querySelectorAll.bind(xml),
                    self = this;

                this.video = {
                    duration: _service.getSecondsFromTimestamp( ($('Linear Duration')[0] || $('Video Duration')[0]).childNodes[0].nodeValue),
                    mediaFiles: []
                };

                this.companions = [];
                this.clickThrough = [];
                this.pixels = {
                    // this does not include non-linear tracking
                    errorPixel: [],
                    impression: [],
                    creativeView: [],
                    start: [],
                    firstQuartile: [],
                    midpoint: [],
                    thirdQuartile: [],
                    complete: [],
                    mute: [],
                    unmute: [],
                    pause: [],
                    rewind: [],
                    resume: [],
                    fullscreen: [],
                    expand: [],
                    collapse: [],
                    acceptInvitation: [],
                    close: [],
                    videoClickThrough: [],
                    videoClickTracking: [],
                    videoCustomClick: [],
                    companionCreativeView: [],
                    playing: [],
                    companionDisplay: [],
                    companionClick: [],
                    loaded: [],
                    stopped: [],
                    linearChange: []
                };

                forEach($('MediaFiles MediaFile'), function(mediaFile) {
                    var file = {};

                    forEach(mediaFile.attributes, function(attribute) {
                        file[attribute.name] = attribute.value;
                    });

                    file.url = getNodeValue(mediaFile);

                    self.video.mediaFiles.push(file);
                });

                forEach($('CompanionAds Companion'), function(companion) {
                    // this assumes that there's only one adType in each <Companion>
                    // it also assumes a specific xml structure
                    // might want to do a query for each adType instead

                    var adType,
                        companionNode = companion.firstChild;

                    switch (companionNode.tagName) {
                    case 'IFrameResource':
                        adType = 'iframe';
                        break;
                    case 'StaticResource':
                        adType = 'image';
                        break;
                    case 'HTMLResource':
                        adType = 'html';
                        break;
                    }

                    self.companions.push(['width', 'height'].reduce(function(result, prop) {
                        result[prop] = parseInt(companion.getAttribute(prop), 10);
                        return result;
                    },{
                        adType : adType,
                        fileURI : getNodeValue(companionNode)
                    }));
                });

                forEach($('Error'), function(error) {
                    self.pixels.errorPixel.push(getNodeValue(error));
                });

                forEach($('Impression'), function(impression) {
                    self.pixels.impression.push(getNodeValue(impression));
                });

                forEach(($('Linear Tracking')[0] ? $('Linear Tracking') : $('Tracking')), function(tracking) {
                    var eventName;

                    forEach(tracking.attributes, function(attribute) {
                        if(attribute.name === 'event') {
                            eventName = attribute.value;
                        }
                    });

                    if (self.pixels[eventName]) {
                        self.pixels[eventName].push(getNodeValue(tracking));
                    }
                });

                forEach($('VideoClicks ClickThrough'), function(clickThrough) {
                    self.clickThrough.push(getNodeValue(clickThrough));
                });

                forEach($('VideoClicks ClickTracking'), function(clickTracking) {
                    self.pixels.videoClickTracking.push(getNodeValue(clickTracking));
                });

                forEach($('VideoClicks CustomClick'), function(customClick) {
                    self.pixels.videoCustomClick.push(getNodeValue(customClick));
                });

                forEach($('Companion Tracking'), function(companionTracking) {
                    // creativeView is the only event supported for companion tracking, so no need to read the event attr
                    self.pixels.companionCreativeView.push(getNodeValue(companionTracking));
                });
            };

            _service.VAST.prototype = {
                getVideoSrc: function(_type) {
                    var bestVideo,
                        isPhone = c6BrowserInfo.profile.device === 'phone',
                        type = _type || c6VideoService.bestFormat(
                        this.video.mediaFiles
                            .filter(function(mediaFile) {
                                return (/mp4|webm/).test(mediaFile.type);
                            })
                            .map(function(mediaFile) {
                                return mediaFile.type;
                            })
                    );

                    this.video.mediaFiles
                        .filter(function(mediaFile) {
                            return mediaFile.type === type;
                        })
                        .forEach(function(mediaFile) {
                            var isSmaller;
                            bestVideo = bestVideo || mediaFile;
                            isSmaller = parseInt(mediaFile.bitrate || mediaFile.height, 10) <
                                parseInt(bestVideo.bitrate || bestVideo.height, 10);

                            bestVideo = isPhone ?
                                (isSmaller ? mediaFile : bestVideo) :
                                (isSmaller ? bestVideo : mediaFile);
                        });

                    return bestVideo ? bestVideo.url : null;
                },
                getCompanion: function() {
                    // this just returns the first one
                    // probably want to have some logic here
                    // maybe we want to pass in a size?
                    return this.companions.length ? this.companions[0] : null;
                },
                firePixels: function(event) {
                    $log.info('Event Pixel: ', event);
                    c6ImagePreloader.load(this.pixels[event]);
                }
            };

            _service.getSecondsFromTimestamp = function(timestamp) {
                var timeArray = timestamp.split(':'),
                    total = 0;

                total += parseInt(timeArray[0], 10) * 60 * 60;
                total += parseInt(timeArray[1], 10) * 60;
                total += parseInt(timeArray[2], 10);

                return total;
            };

            _service.getXML = function(string) {
                var parser = new $window.DOMParser();

                return parser.parseFromString(string.replace(/\n/g, '').replace(/>\s+</g, '><'), 'text/xml');
            };

            service.getVAST = function(url) {
                // make an xml container for all the vast responses, including wrappers
                var parser = new $window.DOMParser(),
                    combinedVast = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><container></container>', 'text/xml'),
                    vastDeferred = $q.defer();

                function fetchVAST(url) {
                    function recurse(response) {
                        var vast = response.data,
                            uriNodes = vast.querySelectorAll('VASTAdTagURI');

                        // append the VAST node to the xml container
                        combinedVast.firstChild.appendChild(vast.querySelectorAll('VAST')[0] || vast.querySelectorAll('VideoAdServingTemplate')[0]);

                        if (uriNodes.length > 0) {
                            return fetchVAST(uriNodes[0].firstChild.nodeValue);
                        }

                        if(!combinedVast.querySelectorAll('MediaFiles').length) {
                            return $q.reject('No video ad!');
                        }

                        // after we've recursed through all the wrappers return
                        // the xml container with all the vast data
                        return combinedVast;

                    }

                    return $http.get(url, {
                        transformResponse: _service.getXML,
                        responseType: 'text'
                    }).then(recurse);
                }


                function createVast(vast) {
                    vastDeferred.resolve(new _service.VAST(vast));
                }

                fetchVAST(url).then(createVast);

                if (_provider.adTimeout) {
                    $timeout(function() {
                        vastDeferred.reject('Reqest for VAST timed out.');
                    }, _provider.adTimeout);
                }

                return vastDeferred.promise;
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

    .directive('vastPlayer', ['VASTService','c6EventEmitter','c6BrowserInfo','$window','$document','$q',
    function                 ( VASTService , c6EventEmitter , c6BrowserInfo , $window , $document , $q ) {
        $document.find('head').append('<style>vast-player {display:inline-block;}</style>');

        return {
            restrict: 'E',
            template: '<video ng-click="clickThrough()" c6-video id="{{videoid}}" c6-controls="controls" style="width: 100%;" webkit-playsinline></video>',
            scope: {
                adTag: '@',
                videoid: '@'
            },
            link: function(scope, $element, attrs) {
                var profile = c6BrowserInfo.profile,
                    vastCache = {},
                    video = null, vast = null,
                    iface,
                    disableClickthrough = 'controls' in attrs || 'disableClickthrough' in attrs;

                function VastPlayer() {
                    var self = this,
                        state,
                        src = null;

                    function setupState() {
                        return {
                            vastEvents: {},
                            readyState: -1,
                            error: null,
                            hasStarted: false
                        };
                    }

                    function ready() {
                        state.readyState = 0;
                        self.emit('ready');
                    }

                    function firePixelsOnce(pixel, predicate) {
                        var vastEvents = state.vastEvents;

                        if (predicate() && !vastEvents[pixel]) {
                            vast.firePixels(pixel);
                            vastEvents[pixel] = true;
                        }
                    }

                    function load(src) {
                        function loadFromCache() {
                            var vast = vastCache[src];

                            return vast ? $q.when(vast) : $q.reject(null);
                        }

                        function loadFromVASTService() {
                            function cache(vast) {
                                /* jshint boss:true */
                                return (vastCache[src] = vast);
                            }

                            return VASTService.getVAST(src)
                                .then(cache);
                        }

                        function setState(data) {
                            if (data !== vast && data.getCompanion()) {
                                self.emit('companionsReady');
                            }

                            /* jshint boss:true */
                            return (vast = data);
                        }

                        function setSrc(vast) {
                            var src = vast.getVideoSrc();

                            if (!src) {
                                return $q.reject(vast);
                            }

                            if (src === video.player.src) {
                                return $q.when(video);
                            }

                            video.src(src);
                            return $q.when(video);
                        }

                        return loadFromCache()
                            .catch(loadFromVASTService)
                            .then(setState)
                            .then(setSrc)
                            .catch(function(error) {
                                state.error = new Error(
                                    'VAST request failed: ' + toJson(error)
                                );
                                self.emit('error');
                                return $q.reject(error);
                            });
                    }

                    Object.defineProperties(this, {
                        src: {
                            get: function() {
                                return src;
                            },
                            set: function(value) {
                                src = value;

                                state = setupState();
                                ready();
                            }
                        },
                        error: {
                            get: function() {
                                return state.error;
                            }
                        },
                        currentTime: {
                            get: function() {
                                return video.player.currentTime;
                            },
                            set: function(time) {
                                video.player.currentTime = time;
                            }
                        },
                        ended: {
                            get: function() {
                                return video.player.ended;
                            }
                        },
                        duration: {
                            get: function() {
                                return video.player.duration;
                            }
                        },
                        paused: {
                            get: function() {
                                return video.player.paused;
                            }
                        },
                        readyState: {
                            get: function() {
                                return state.readyState;
                            }
                        }
                    });

                    this.play = function() {
                        load(this.src).then(function(video) {
                            video.player.play();
                        });
                    };

                    this.pause = function() {
                        if (!state.hasStarted) {
                            return video.regenerate();
                        }

                        video.player.pause();
                    };

                    this.getCompanions = function() {
                        var companion = vast && vast.getCompanion();

                        return companion && [companion];
                    };

                    this.reload = function() {
                        video.regenerate();
                    };

                    this.load = function() {
                        load(this.src);
                    };

                    this.minimize = function() {
                        return video.fullscreen(false);
                    };

                    c6EventEmitter(this);

                    state = setupState();

                    scope.$on('c6video-ready', function(event, c6Video) {
                        video = c6Video;

                        c6Video.on('error', function() {
                            state.error = new Error(
                                'HTML5 Video Error: ' + c6Video.player.error.code
                            );
                            self.emit('error');
                        });

                        c6Video.on('loadedmetadata', function() {
                            state.readyState = 1;
                            self.emit('loadedmetadata');
                        });

                        c6Video.on('play', function() {
                            if (!state.hasStarted) {
                                state.hasStarted = true;
                                vast.firePixels('impression');
                                vast.firePixels('loaded');
                                vast.firePixels('creativeView');
                                vast.firePixels('start');
                                vast.firePixels('playing');
                            }
                            state.readyState = 3;
                            self.emit('play');
                        });

                        c6Video.on('pause', function() {
                            vast.firePixels('pause');
                            self.emit('pause');
                        });

                        c6Video.on('ended', function() {
                            self.emit('ended');
                            c6Video.fullscreen(false);
                        });

                        c6Video.on('timeupdate', function() {
                            var player = c6Video.player,
                                currTime = player.currentTime,
                                duration = player.duration;

                            self.emit('timeupdate');

                            if (!duration) { return; }

                            firePixelsOnce('firstQuartile', function() {
                                return currTime >= (duration * 0.25);
                            });

                            firePixelsOnce('midpoint', function() {
                                return currTime >= (duration * 0.5);
                            });

                            firePixelsOnce('thirdQuartile', function() {
                                return currTime >= (duration * 0.75);
                            });

                            firePixelsOnce('complete', function() {
                                return currTime >= (duration - 1);
                            });
                        });

                        scope.$watch('adTag', function(tag) {
                            self.src = tag || null;
                        });

                        if (isDefined(attrs.autoplay) && profile.autoplay) {
                            self.once('ready', function() {
                                self.play();
                            });
                        }
                    });
                }

                scope.controls = 'controls' in attrs;

                scope.clickThrough = disableClickthrough ? noop : function() {
                    if (!(vast && vast.clickThrough && vast.clickThrough.length > 0)) {
                        return;
                    }

                    if (video.player.paused) {
                        video.player.play();
                    } else {
                        video.player.pause();
                        $window.open(vast.clickThrough[0]);
                        vast.firePixels('videoClickTracking');
                    }
                };

                iface = new VastPlayer();
                $element.data('video', iface);
                scope.$emit('<vast-player>:init', iface);
            }
        };
    }]);
});
