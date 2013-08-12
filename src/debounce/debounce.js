(function(angular) {
	'use strict';

	angular.module('c6.ui')
		.factory('c6Debounce', ['$timeout', function($timeout) {
			return function(func, debounceTime) {
				var canExecute = true;

				return function() {
					if (canExecute) {
						func.call(this, arguments);
						canExecute = false;
						$timeout(function() {
							canExecute = true;
						}, debounceTime);
					}
				};
			};
		}]);
})(angular);
