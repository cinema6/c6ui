define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.ui.alias.alias', [])
        .directive('c6Alias', [function() {
            return {
                restrict: 'EAC',
                scope: true,
                link: function(scope, element, attrs) {
                    var config = (attrs.c6Alias || '').split(/\s+as\s+/),
                        myProp = config[1] || attrs.as,
                        parentValue = config[0] || attrs.model;

                    scope.$parent.$watch(parentValue, function(model) {
                        scope[myProp] = model;
                    });
                }
            };
        }]);
});
