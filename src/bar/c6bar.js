(function(){
    'use strict';

    angular.module('c6.ext')
    .directive('c6Bar', [ function() {
        return {
            restrict: 'E',
            templateUrl: 'assets/scripts/ext/bar/c6bar.html',
            replace: true,
            scope: {}
        };
    }]);

}());
