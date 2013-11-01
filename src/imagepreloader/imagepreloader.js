(function(angular) {
    'use strict';

    angular.module('c6.ui')
        .service('c6ImagePreloader', ['$window', '$q', '$rootScope',
        function                     ( $window ,  $q ,  $rootScope ) {
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
                            $rootScope.$apply(function() { deferred.resolve(); });
                        }
                    },
                    deferred = $q.defer();

                angular.forEach(imageUrls, function(imageUrl) {
                    image = new $window.Image();
                    image.src = imageUrl;

                    imageStatuses[image] = false;

                    image.addEventListener('load', handleImageLoad, false);
                });

                return deferred.promise;
            };
        }]);
})(window.angular);
