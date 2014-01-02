(function(){

    'use strict';
    angular.module('c6.ui')
    .directive('c6Visible', ['$animate', function($animate) {
        return {
            scope: true,
            link: function(scope, element, attrs) {
                var c6Animate = attrs.c6VisibleAnimate;

                scope.visible = function() {
                    return scope.$eval(attrs.c6Visible);
                };

                scope.$watch('visible()', function(visible) {
                    if (visible) {
                        if (c6Animate) {
                            $animate.addClass(element,c6Animate);
//                            animate.animate('visible', element);
                        } else {
                            element.css('visibility', 'visible');
                        }
                    } else {
                        if (c6Animate) {
                            $animate.removeClass(element,c6Animate);
                            //animate.animate('hidden', element);
                        } else {
                            element.css('visibility', 'hidden');
                        }
                    }
                });
            }
        };
    }]);
}());
