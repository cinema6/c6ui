(function() {
    'use strict';

    define(['videos/video'], function() {
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

        beforeEach(function() {
            module(function($provide) {
                $provide.value('$document', mock$Document);
                $provide.value('$element', $element);
            });
            module('c6.ui');
        });

        describe('Service: c6videoService', function() {
            beforeEach(function() {
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

            beforeEach(function() {
                inject(function($rootScope, $controller) {
                    $scope = $rootScope.$new();
                    $scope.$on('c6video-ready', function(event, player) {
                        c6video = player;
                    });
                    c6videoController = $controller('C6VideoController', { $scope: $scope, $element: $element, $attrs: $attrs, c6videoService: c6videoService });
                });
            });

            it('should emit an event when a c6video has been created.', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    expect(c6video).toBeTruthy();
                });
            });

            it('should set the src to a regular file if given a regular file path, extensionless file, or array of srcs and types', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    c6video.src('test/hey/media.mp4');
                    expect(c6video.player.src).toBe('test/hey/media.mp4');

                    c6video.src('test/hey/hello');
                    expect(c6video.player.src).toBe('test/hey/hello.mp4');

                    c6video.src([{"type": "video/mp4", "src": "test/hey/hola.mp4"},{"type": "video/webm", "src": "test/hey/hola.webm"},{"type": "video/ogg", "src": "test/hey/hola.ogg"}]);
                    expect(c6video.player.src).toBe('test/hey/hola.mp4');
                });
            });

            it('should set the src to undefined if you pass in null to the src method.', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    c6video.src(null);
                    expect(c6video.player.src).toBe(undefined);

                    c6video.src('test.mp4');
                    expect(c6video.player.src).toBe('test.mp4');

                    c6video.src(null);
                    expect(c6video.player.src).toBe(undefined);
                });
            });

            it('should calculate the % of the video that has been buffered.', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    expect(c6video.bufferedPercent()).toBe(0.5);
                });
            });

            it('should resize the player.', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    expect(c6video.player.width).toBe(1280);
                    expect(c6video.player.height).toBe(720);

                    c6video.size(800, 600);

                    expect(c6video.player.width).toBe(800);
                    expect(c6video.player.height).toBe(600);
                });
            });

            it('should make the player fullscreen.', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    expect(c6video.fullscreen(true)).toBe(true);
                    expect(c6video.player.requestFullscreen).toHaveBeenCalled();
                });
            });

            it('should make the player exit fullscreen', function() {
                waitsFor(function() {
                    return c6video;
                }, 'never got the player object', 1000);
                runs(function() {
                    expect(c6video.fullscreen(false)).toBe(true);
                    expect(mock$Document[0].cancelFullScreen).toHaveBeenCalled();
                });
            });
        });
    });
})();
