(function(angular) {
	'use strict';

	angular.module('c6.ui')
		.service('c6Preload', ['$window', '$q', function($window, $q) {
			var images = [];

			this.load = function(imageUrls) {
				var image,
					imageStatuses = {},
					handleImageLoad = function(event) {
						var ready = true;

						imageStatuses[event.target] = true;

						angular.forEach(imageStatuses, function(ready) {
							if (!ready) { ready = false; }
						});

						if (ready) {
							deferred.resolve();
						}
					},
					deferred = $q.defer();

				angular.forEach(imageUrls, function(imageUrl) {
					image = new $window.Image();
					image.src = imageUrl;

					images.push(image);
					imageStatuses[image] = false;

					image.addEventListener('load', handleImageLoad, false);
				});

				return deferred.promise;
			};

			this.clear = function() {
				angular.forEach(images, function(image) {
					image.src = null;
				});

				images.length = 0;
			};
		}]);
})(window.angular);
