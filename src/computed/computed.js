(function() {
    'use strict';

    angular.module('c6.ui')
        .factory('c6Computed', [function() {
            return function(model, prop, fn, scope, deps) {
                var cached,
                    dirty = true;

                function compute() {
                    var value = fn.call(scope);

                    cached = value;
                    dirty = false;

                    return value;
                }

                function getExpressions(dep) {
                    var parts = dep.split('.@each'),
                        expressions = [],
                        collection = parts[0],
                        length = scope.$eval(collection + '.length');

                    // The first part of the array is the collection.
                    // The second part is the property to watch on
                    // that collection. Because we are processing the
                    // collection right now, get rid of it from the array.
                    parts.shift();

                    // This means there's an @each in there somewhere
                    if (parts.length) {
                         while (length--) {
                            var item = (collection + '[' + length + ']');

                            // Recurse so that many @each are taken care of
                            expressions.push.apply(expressions, getExpressions(item + parts.join('.@each')));
                        }
                    } else {
                        // No @each. Just push the dependency and return.
                        expressions.push(dep);
                    }

                    return expressions;
                }

                function setupWatch(dep) {
                    angular.forEach(getExpressions(dep), function(expression) {
                        scope.$watch(expression, setDirty);
                    });
                }

                function setDirty() {
                    dirty = true;
                }

                angular.forEach(deps, setupWatch);

                Object.defineProperty(model, prop, {
                    get: function() {
                        if (dirty) {
                            return compute();
                        }

                        return cached;
                    },
                    set: function(value) {
                        fn.call(scope, value);
                    }
                });
            };
        }]);
})();
