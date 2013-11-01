(function() {
	'use strict';

	define(['imagepreloader/imagepreloader'], function() {
		describe('c6ImagePreloader', function() {
			var c6ImagePreloader,
				$rootScope,
				images = [],
				imageCreateSpy,
				$window = {
					Image: function() {
						var self = this,
							eventHandlers = {};

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

						images.push(this);
					}
				};

			beforeEach(function() {
				module('c6.ui', function($provide) {
					$provide
						.value('$window', $window);
				});
				inject(function(_c6ImagePreloader_, _$rootScope_) {
					c6ImagePreloader = _c6ImagePreloader_;
					$rootScope = _$rootScope_;
				});

				imageCreateSpy = jasmine.createSpy();
				images.length = 0;
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
						var matchingSrc;

						images.forEach(function(image) {
							if (image.src === url) {
								matchingSrc = image.src;
							}
						});

						expect(url).toBe(matchingSrc);
					});
				});

				it('should return a promise that resolves when the images finish loading', function() {
					var promiseSpy = jasmine.createSpy();

					c6ImagePreloader.load(['foo/test.jpg', 'demos/heavyrain.jpg']).then(promiseSpy);

					expect(promiseSpy).not.toHaveBeenCalled();

					images.forEach(function(image) {
						image._triggerEvent('load');
					});

					expect(promiseSpy).toHaveBeenCalled();
				});
			});
		});
	});
})();
