(function(angular) {
    'use strict';

    angular.module('c6.ui')
        .service('c6ImagePreloader', ['$window', '$q', '$rootScope',
        function                     ( $window ,  $q ,  $rootScope ) {
            this.load = function(imageUrls) {
                var image,
                    imageStatuses = {},
                    handleImageLoad = function(image) {
                        var ready = true;

                        imageStatuses[image.src] = true;

                        angular.forEach(imageStatuses, function(imageReady) {
                            if (!imageReady) { ready = false; }
                        });

                        if (ready) {
                            deferred.resolve();
                        }
                    },
                    handleImageLoadEvent = function(event) {
                        $rootScope.$apply(function() {
                            handleImageLoad(event.target);
                        });
                    },
                    deferred = $q.defer();

                angular.forEach(imageUrls, function(imageUrl) {
                    image = new $window.Image();
                    image.src = imageUrl;

                    imageStatuses[image.src] = false;

                    if (!image.complete) {
                        image.addEventListener('load', handleImageLoadEvent, false);
                    } else {
                        handleImageLoad(image);
                    }
                });

                return deferred.promise;
            };
        }]);
})(window.angular);
