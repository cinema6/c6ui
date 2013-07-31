(function() {
	'use strict';

	angular.module('c6.ui')
		.factory('c6Computed', [function() {
			return function(scope, computingFunction, dependencies) {
				var actualDependencies = [],
					dirty = true,
					cachedValue,
					setDirty = function() {
						dirty = true;
					};

				dependencies.forEach(function(dependency) {
					scope.$watch(dependency, setDirty);

					actualDependencies.push(scope.$eval(dependency));
				});

				return function() {
					if (dirty) {
						dirty = false;

						actualDependencies.length = 0;

						dependencies.forEach(function(dependency) {
							actualDependencies.push(scope.$eval(dependency));
						});

						cachedValue = computingFunction.apply(scope, actualDependencies);
						return cachedValue;
					} else {
						return cachedValue;
					}
				};
			};
		}]);
})();
