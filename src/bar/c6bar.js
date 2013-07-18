(function(){
    'use strict';

    angular.module('c6.ui')
    .directive('c6Bar', [ function() {
        return {
            restrict: 'E',
            templateUrl: 'assets/lib/c6ui/bar/c6bar.html',
            replace: true,
            scope: {}
        };
    }]);

}());
