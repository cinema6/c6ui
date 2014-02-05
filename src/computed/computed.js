(function() {
    'use strict';

    angular.module('c6.ui')
        .factory('c6Computed', [function() {
            return function(scope) {
                return function(model, prop, fn, deps) {
                    var cached,
                        dirty = true,
                        watchers = [];

                    function compute() {
                        var value = fn.call(model);

                        cached = value;
                        dirty = false;

                        return value;
                    }

                    function watchCollectionLength(newLength, oldLength) {
                        if (newLength === oldLength) { return; }

                        // Remove all the old $watchers
                        angular.forEach(watchers, function(deregister) {
                            deregister();
                        });
                        watchers.length = 0;

                        // Setup $watchers again
                        angular.forEach(deps, setupWatch);
                    }

                    function getExpressions(dep) {
                        var parts = dep.split('.@each'),
                            expressions = [],
                            collection = parts[0],
                            lengthExpression = (collection + '.length'),
                            length = scope.$eval(lengthExpression);

                        // The first part of the array is the collection.
                        // The second part is the property to watch on
                        // that collection. Because we are processing the
                        // collection right now, get rid of it from the array.
                        parts.shift();

                        // This means there's an @each in there somewhere
                        if (parts.length) {
                            while (length--) {
                                var item = (collection + '[' + length + ']');

                                if (parts.length > 1) {
                                    // Recurse so that many @each are taken care of
                                    expressions.push.apply(expressions, getExpressions(item + parts.join('.@each')));
                                } else {
                                    expressions.push(item + parts[0]);
                                }
                            }

                            // If the size of the collection changes, we need to
                            // setup new $watchers.
                            scope.$watch(lengthExpression, watchCollectionLength);
                        } else {
                            // No @each. Just push the dependency and return.
                            expressions.push(dep);
                        }

                        return expressions;
                    }

                    function setupWatch(dep) {
                        angular.forEach(getExpressions(dep), function(expression) {
                            watchers.push(scope.$watch(expression, setDirty));
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
                            fn.call(model, value);
                        }
                    });
                };
            };
        }]);
})();
