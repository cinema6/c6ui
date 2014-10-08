define(['videos/video'], function(videosVideo) {
    'use strict';

    var c6videoService,
    mock$Document = [{
        createElement: function() {
            return {
                canPlayType: function(format) {
                    switch(format) {
                        case 'video/mp4':
                            return 'probably';
                        case 'video/ogg':
                            return 'probably';
                        case 'video/webm':
                            return 'probably';
                    }
                },
                addEventListener: function() {},
                load: function() {},
                attributes: [
                    { name: 'test', value: 'hey'},
                    { name: 'src', value: ''}
                ],
                parentNode: {
                    replaceChild: function() {}
                },
                setAttribute: function(key, value) {
                    this.attributes = [];
                    this.attributes.push({name: key, value: value});
                }
            };
        },
        cancelFullScreen: jasmine.createSpy()
    }],
    $element = [{
        src: '',
        load: function() {},
        addEventListener: function() {},
        buffered: {
            length: 30,
            start: function(index) {
                return index;
            },
            end: function(index) {
                return index + 1;
            }
        },
        duration: 60,
        width: 1280,
        height: 720,
        requestFullscreen: jasmine.createSpy(),
        attributes: [
            { name: 'test', value: 'hey'},
            { name: 'src', value: ''}
        ],
        parentNode: {
            replaceChild: function() {}
        }
    }];

    describe('Service: c6videoService', function() {
        beforeEach(function() {
            module(function($provide) {
                $provide.value('$document', mock$Document);
                $provide.value('$element', $element);
            });
            module(videosVideo.name);

            inject(function(_c6VideoService_) {
                c6videoService = _c6VideoService_;
            });
        });

        it('should figure out the best format.', function() {
            expect(c6videoService.bestFormat(['video/mp4', 'video/webm', 'video/ogg'])).toBe('video/mp4');
            expect(c6videoService.bestFormat(['video/webm', 'video/ogg'])).toBe('video/webm');
            expect(c6videoService.bestFormat(['video/ogg'])).toBe('video/ogg');
        });

        it('should get the extension of a format.', function() {
            expect(c6videoService.extensionForFormat('video/mp4')).toBe('mp4');
            expect(c6videoService.extensionForFormat('video/webm')).toBe('webm');
            expect(c6videoService.extensionForFormat('video/ogg')).toBe('ogg');
        });

        it('should get the format for an extension.', function() {
            expect(c6videoService.formatForExtension('mp4')).toBe('video/mp4');
            expect(c6videoService.formatForExtension('webm')).toBe('video/webm');
            expect(c6videoService.formatForExtension('ogg')).toBe('video/ogg');
        });
    });

    describe('c6video', function() {
        var c6Video,
            $timeout,
            C6VideoCtrl,
            $rootScope,
            $scope,
            $controller,
            $element,
            $attrs;

        var c6VideoService;

        beforeEach(function() {
            module(function($provide) {
                $provide.value('$document', mock$Document);
                $provide.value('$element', $element);
            });

            module(videosVideo.name, function($provide) {
                $provide.value('c6VideoService', {
                    isChrome: false,
                    bestFormat: jasmine.createSpy('c6VideoService.bestFormat()')
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $timeout = $injector.get('$timeout');

                c6VideoService = $injector.get('c6VideoService');
                $element = {
                    0: {
                        play: jasmine.createSpy('video.play()'),
                        pause: jasmine.createSpy('video.pause()'),
                        addEventListener: jasmine.createSpy('video.addEventListener()')
                            .and.callFake(function(event, handler) {
                                var handlers = $element[0].handlers[event] = $element[0].handlers[event] || [];

                                handlers.push(handler);
                            }),
                        removeEventListener: jasmine.createSpy('video.removeEventListener()')
                            .and.callFake(function(event, handler) {
                                var handlers = $element[0].handlers[event] = $element[0].handlers[event] || [];

                                handlers.splice(handlers.indexOf(handler), 1);
                            }),
                        handlers: {}
                    },
                    length: 1,
                    on: function(event, handler) {
                        this[0].addEventListener(event, handler);
                    },
                    off: function(event, handler) {
                        this[0].removeEventListener(event, handler);
                    },
                    trigger: function(event) {
                        (this[0].handlers[event] || []).forEach(function(handler) {
                            handler({ target: $element[0] });
                        });
                    }
                };
                $attrs = {
                    $observe: jasmine.createSpy('$attrs.$observe()')
                };

                $scope = $rootScope.$new();
            });
        });

        describe('in chrome', function() {
            beforeEach(function() {
                spyOn($scope, '$emit');

                c6VideoService.isChrome = true;
                $element[0].readyState = 4;

                $scope.$apply(function() {
                    C6VideoCtrl = $controller('C6VideoController', {
                        $scope: $scope,
                        $element: $element,
                        $attrs: $attrs
                    });
                });
            });

            it('should not $emit c6video-ready until after the chrome hack is applied', function() {
                expect($scope.$emit).not.toHaveBeenCalledWith('c6video-ready', jasmine.any(Object));

                $element.trigger('canplay');
                $timeout.flush();

                expect($scope.$emit).toHaveBeenCalledWith('c6video-ready', jasmine.any(Object));
            });
        });

        describe('in chrome, if the no-hack attribute is present', function() {
            beforeEach(function() {
                c6VideoService.isChrome = true;
                $element[0].readyState = 4;

                $attrs.noHack = '';

                $scope.$apply(function() {
                    C6VideoCtrl = $controller('C6VideoController', {
                        $scope: $scope,
                        $element: $element,
                        $attrs: $attrs
                    });
                });
            });

            it('should not apply the chrome hack', function() {
                $element.trigger('canplay');

                expect($element[0].play).not.toHaveBeenCalled();
            });
        });
    });

    describe('Controller: C6VideoController', function() {
        var $scope,
        $attrs = {
            $observe: function(prop, callback) {
                if (prop === 'c6Src') {
                    callback($element[0].src);
                }
            }
        },
        c6videoController,
        c6video;

        beforeEach(function(done) {
            module(function($provide) {
                $provide.value('$document', mock$Document);
                $provide.value('$element', $element);
            });
            module(videosVideo.name);

            inject(function($rootScope, $controller) {
                $scope = $rootScope.$new();
                $scope.$on('c6video-ready', function(event, player) {
                    c6video = player;
                    done();
                });
                $scope.$apply(function() {
                    c6videoController = $controller('C6VideoController', { $scope: $scope, $element: $element, $attrs: $attrs, c6videoService: c6videoService });
                });
            });
        });

        it('should emit an event when a c6video has been created.', function() {
            expect(c6video).toBeTruthy();
        });

        it('should set the src to a regular file if given a regular file path, extensionless file, or array of srcs and types', function() {
            c6video.src('test/stupid/uppercase.MP4');
            expect(c6video.player.src).toBe('test/stupid/uppercase.MP4');

            c6video.src('test/another/sTuPiD/video.WEBM');
            expect(c6video.player.src).toBe('test/another/sTuPiD/video.WEBM');

            c6video.src('test/hey/media.mp4');
            expect(c6video.player.src).toBe('test/hey/media.mp4');

            c6video.src('test/hey/hello');
            expect(c6video.player.src).toBe('test/hey/hello.mp4');

            c6video.src([{"type": "video/mp4", "src": "test/hey/hola.mp4"},{"type": "video/webm", "src": "test/hey/hola.webm"},{"type": "video/ogg", "src": "test/hey/hola.ogg"}]);
            expect(c6video.player.src).toBe('test/hey/hola.mp4');
        });

        it('should not set the src to undefined if you pass in null to the src method.', function() {
            c6video.src(null);
            expect(c6video.player.src).toBe('test/hey/hola.mp4');

            c6video.src('test.mp4');
            expect(c6video.player.src).toBe('test.mp4');

            c6video.src(null);
            expect(c6video.player.src).toBe('test.mp4');
        });

        it('should calculate the % of the video that has been buffered.', function() {
            expect(c6video.bufferedPercent()).toBe(0.5);
        });

        it('should resize the player.', function() {
            expect(c6video.player.width).toBe(1280);
            expect(c6video.player.height).toBe(720);

            c6video.size(800, 600);

            expect(c6video.player.width).toBe(800);
            expect(c6video.player.height).toBe(600);
        });

        it('should make the player fullscreen.', function() {
            expect(c6video.fullscreen(true)).toBe(true);
            expect(c6video.player.requestFullscreen).toHaveBeenCalled();
        });

        it('should make the player exit fullscreen', function() {
            expect(c6video.fullscreen(false)).toBe(true);
            expect(mock$Document[0].cancelFullScreen).toHaveBeenCalled();
        });
    });
});
