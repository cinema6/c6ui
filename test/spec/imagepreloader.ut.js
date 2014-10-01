define(['imagepreloader/imagepreloader'], function(imagepreloaderImagepreloader) {
    'use strict';

    describe('c6ImagePreloader', function() {
        var c6ImagePreloader,
            loadImagesAsync = true,
            $rootScope,
            images = [],
            imageCreateSpy,
            $window = {
                location: {
                    origin: 'http://localhost:9000'
                },
                Image: function() {
                    var self = this,
                        eventHandlers = {},
                        src = null;

                    imageCreateSpy();

                    this._triggerEvent = function(name) {
                        (eventHandlers[name] || []).forEach(function(handler) {
                            handler({ target: self });
                        });
                    };

                    this.addEventListener = function(name, fn, bool) {
                        if (!eventHandlers[name]) {
                            eventHandlers[name] = [];
                        }

                        eventHandlers[name].push(fn);
                    };

                    this.removeEventListener = function(name, fn, bool) {
                        (eventHandlers[name] || []).forEach(function(handler, index, handlers) {
                            if (handler === fn) {
                                handler.slice(handlers.indexOf(handler), 1);
                            }
                        });
                    };

                    this.complete = !loadImagesAsync;

                    Object.defineProperty(this, 'src', {
                        get: function() {
                          return src;
                        },
                        set: function(value) {
                          src = $window.location.origin + '/' + value;
                          return src;
                        }
                    });

                    images.push(this);
                }
            };

        beforeEach(function() {
            module(imagepreloaderImagepreloader.name, function($provide) {
                $provide.value('$window', $window);
            });

            inject(function($injector) {
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                $rootScope = $injector.get('$rootScope');
            });

            imageCreateSpy = jasmine.createSpy();
            images.length = 0;
            loadImagesAsync = true;
        });

        it('should exist', function() {
            expect(c6ImagePreloader).toBeDefined();
        });

        describe('load method', function() {
            it('should create an image for every url passed in', function() {
                var urlsToLoad = ['foo/test.jpg', 'foo/image.jpg', 'foo/nyancat.gif'];

                c6ImagePreloader.load(urlsToLoad);

                expect(imageCreateSpy.callCount).toBe(3);

                urlsToLoad.forEach(function(url) {
                    var matchingSrc,
            fullUrl = $window.location.origin + '/' + url;

                    images.forEach(function(image) {
                        if (image.src === fullUrl) {
                            matchingSrc = image.src;
                        }
                    });

                    expect(fullUrl).toBe(matchingSrc);
                });
            });

            it('should return a promise that resolves when the images finish loading', function() {
                var promiseSpy = jasmine.createSpy();

                $rootScope.$apply(function() {
                    c6ImagePreloader.load(['foo/test.jpg', 'demos/heavyrain.jpg']).then(promiseSpy);
                });

                expect(promiseSpy).not.toHaveBeenCalled();

                images[0]._triggerEvent('load');

                expect(promiseSpy).not.toHaveBeenCalled();

                images[1]._triggerEvent('load');

                expect(promiseSpy).toHaveBeenCalled();
            });

            it('should resolve the returned promise if "load" never fires but complete is true', function() {
                var promiseSpy = jasmine.createSpy('load promise');
                loadImagesAsync = false;

                $rootScope.$apply(function() {
                    c6ImagePreloader.load(['foo/test.jpg', 'demos/heavyrain.jpg']).then(promiseSpy);
                });

                expect(promiseSpy).toHaveBeenCalled();
            });

            it('should reject the promise if images rturn errors', function() {
                var promiseSpy = jasmine.createSpy('load promise'),
                    rejectSpy = jasmine.createSpy('reject promise'),
                    imageUrls = [];

                $rootScope.$apply(function() {
                    c6ImagePreloader.load(['foo/test.jpg', 'demos/heavyrain.jpg']).then(promiseSpy, rejectSpy);
                });

                expect(rejectSpy).not.toHaveBeenCalled();

                images[0]._triggerEvent('error');

                expect(rejectSpy).not.toHaveBeenCalled();

                images[1]._triggerEvent('error');

                angular.forEach(['foo/test.jpg', 'demos/heavyrain.jpg'], function(url) {
                    imageUrls.push($window.location.origin + '/' + url);
                });

                expect(rejectSpy).toHaveBeenCalledWith(imageUrls);
            });
        });
    });
});
