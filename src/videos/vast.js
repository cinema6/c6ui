define  (['angular','../events/emitter','../browser/info','./video'     ,'../imagepreloader/imagepreloader'],
function(  angular , eventsEmitter     , browserInfo     , videoService , imagePreloader                   ) {
    'use strict';

    var forEach = angular.forEach,
        isDefined = angular.isDefined;

    return angular.module('c6.ui.videos.vast', [eventsEmitter.name, browserInfo.name, videoService.name, imagePreloader.name])
    .provider('VASTService', [function() {
        var _provider = {
            adTimeout: 3000
        };

        this.adTimeout = function(seconds) {
            _provider.adTimeout = parseFloat(seconds) * 1000;
            return this;
        };

        this.$get = ['$log','$http','$window','c6ImagePreloader','$q','c6VideoService','$timeout',
        function    ( $log , $http , $window , c6ImagePreloader , $q , c6VideoService , $timeout) {
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
                    var type = _type || c6VideoService.bestFormat(
                        this.video.mediaFiles
                            .filter(function(mediaFile) {
                                return (/mp4|webm/).test(mediaFile.type);
                            })
                            .map(function(mediaFile) {
                                return mediaFile.type;
                            })
                    );

                    return this.video.mediaFiles.reduce(function(result, mediaFile) {
                        return mediaFile.type === type ? mediaFile.url : result;
                    }, null);
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

                $timeout(function() {
                    vastDeferred.reject();
                }, _provider.adTimeout);

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

    .directive('vastPlayer', ['VASTService','c6EventEmitter','c6BrowserInfo','$window','$timeout','$document',
    function                 ( VASTService , c6EventEmitter , c6BrowserInfo , $window , $timeout , $document ) {
        $document.find('head').append('<style>vast-player {display:inline-block;}</style>');

        return {
            restrict: 'E',
            template: '<video ng-click="clickThrough()" c6-video id="{{videoid}}" c6-src="adUrl" c6-controls="controls" style="width: 100%;"></video>',
            scope: {
                adTag: '@',
                videoid: '@'
            },
            link: function(scope, $element, attrs) {
                var profile = c6BrowserInfo.profile,
                    c6Video,
                    vastData,
                    iface;

                function VastPlayer() {
                    var self = this,
                        companion = null,
                        readyState,
                        vastEvents,
                        hasStarted,
                        shouldPlay;

                    function setupState() {
                        vastEvents = {};
                        readyState = -1;
                        hasStarted = false;
                        shouldPlay = true;
                    }

                    function emitReady() {
                        readyState = 0;
                        self.emit('ready');

                        if (!scope.adUrl) {
                            self.emit('error');
                        }

                        if (companion) {
                            self.emit('companionsReady');
                        }
                    }

                    function load(adTag) {
                        if (!adTag) { return; }

                        setupState();

                        if (vastData) {
                            vastData.firePixels('complete');
                            c6Video.fullscreen(false);
                            self.emit('ended');
                            vastData = null;
                        }

                        VASTService.getVAST(adTag).then(function(vast) {
                            scope.adUrl = vast.getVideoSrc();
                            companion = vast.getCompanion();
                            vastData = vast;

                            $timeout(function() {
                                if (c6Video) {
                                    emitReady();
                                }
                            });
                        }, function() {
                            self.emit('ready');
                            self.emit('error');
                        });
                    }

                    Object.defineProperties(this, {
                        currentTime: {
                            get: function() {
                                return c6Video ? c6Video.player.currentTime : 0;
                            },
                            set: function(time) {
                                if (!c6Video) { return; }
                                c6Video.player.currentTime = time;
                            }
                        },
                        ended: {
                            get: function() {
                                return c6Video ? c6Video.player.ended : false;
                            }
                        },
                        duration: {
                            get: function() {
                                return c6Video ? c6Video.player.duration : 0;
                            }
                        },
                        paused: {
                            get: function() {
                                return !c6Video || c6Video.player.paused;
                            }
                        },
                        readyState: {
                            get: function() {
                                return readyState;
                            }
                        }
                    });

                    this.play = function() {
                        if (!c6Video) { return; }

                        if (this.ended) {
                            setupState();
                        }

                        c6Video.player.play();
                    };

                    this.pause = function() {
                        if (!c6Video) { return; }
                        c6Video.player.pause();
                    };

                    this.getCompanions = function() {
                        return companion && [companion];
                    };

                    this.reload = function() {
                        load(scope.adTag);
                    };

                    this.load = function() {
                        c6Video.player.load();
                    };

                    c6EventEmitter(this);

                    setupState();

                    scope.$watch('adTag', load);

                    scope.$on('c6video-ready', function(event, video) {
                        if (!shouldPlay) { return; }

                        c6Video = video;

                        c6Video.on('loadedmetadata', function() {
                            readyState = 1;
                            self.emit('loadedmetadata');
                        });

                        c6Video.on('play', function() {
                            if (!hasStarted) {
                                hasStarted = true;
                                vastData.firePixels('impression');
                                vastData.firePixels('loaded');
                                vastData.firePixels('creativeView');
                                vastData.firePixels('start');
                                vastData.firePixels('playing');
                            }
                            readyState = 3;
                            self.emit('play');
                        });

                        c6Video.on('pause', function() {
                            vastData.firePixels('pause');
                            self.emit('pause');
                        });

                        c6Video.on('ended', function() {
                            vastData.firePixels('complete');
                            self.emit('ended');
                            c6Video.fullscreen(false);
                        });

                        c6Video.on('timeupdate', function() {
                            var currTime = Math.round(c6Video.player.currentTime),
                                duration = c6Video.player.duration;

                            if((currTime === Math.round(duration * 0.25)) && !vastEvents.firstQuartile) {
                                vastData.firePixels('firstQuartile');
                                vastEvents.firstQuartile = true;
                            }
                            if((currTime === Math.round(duration * 0.5)) && !vastEvents.midpoint) {
                                vastData.firePixels('midpoint');
                                vastEvents.midpoint = true;
                            }
                            if((currTime === Math.round(duration * 0.75)) && !vastEvents.thirdQuartile) {
                                vastData.firePixels('thirdQuartile');
                                vastEvents.thirdQuartile = true;
                            }

                            self.emit('timeupdate');
                        });

                        if (isDefined(attrs.autoplay) && profile.autoplay) {
                            self.play();
                        }

                        if (vastData) {
                            emitReady();
                        }
                    });
                }

                scope.controls = 'controls' in attrs;

                scope.clickThrough = function() {
                    if (!vastData ||
                        (vastData.clickThrough &&
                            (vastData.clickThrough.length === 0 ||
                            (/null.com/).test(vastData.clickThrough[0])))) { return; }

                    if (c6Video.player.paused) {
                        c6Video.player.play();
                    } else {
                        c6Video.player.pause();
                        $window.open(vastData.clickThrough[0]);
                        vastData.firePixels('videoClickTracking');
                    }
                };

                iface = new VastPlayer();
                $element.data('video', iface);
                scope.$emit('<vast-player>:init', iface);
            }
        };
    }]);
});
