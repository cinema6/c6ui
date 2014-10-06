define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.ui.imagepreloader.imagepreloader', [])
        .service('c6ImagePreloader', ['$window', '$q', '$rootScope',
        function                     ( $window ,  $q ,  $rootScope ) {
            this.load = function(imageUrls) {
                var image,
                    imageStatuses = {},
                    imageErrors = [],
                    handleImageLoad = function(image) {
                        var ready = true;

                        imageStatuses[image.src] = true;

                        angular.forEach(imageStatuses, function(imageReady) {
                            if (!imageReady) { ready = false; }
                        });

                        if(ready) {
                            if(imageErrors.length) {
                                deferred.reject(imageErrors);
                            } else {
                                deferred.resolve();
                            }
                        }
                    },
                    handleImageLoadEvent = function(event) {
                        $rootScope.$apply(function() {
                            handleImageLoad(event.target);
                        });
                    },
                    handleImageLoadError = function(event) {
                        imageErrors.push(event.target.src);

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
                        image.addEventListener('error', handleImageLoadError, false);
                    } else {
                        handleImageLoad(image);
                    }
                });

                return deferred.promise;
            };

        }]);
});
