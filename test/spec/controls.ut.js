(function() {
	'use strict';

	define(['controls/controls'], function() {
		describe('c6Controls', function() {
			describe('the controller', function() {
				var Controller,
					$rootScope,
					$scope,
					$element,
					$document;

				beforeEach(module('c6.ui'));
				beforeEach(inject(function($controller, _$rootScope_, $timeout, c6Computed) {
					$rootScope = _$rootScope_;
					$scope = $rootScope.$new(true);
					Controller = $controller('C6ControlsController', { $scope: $scope, $element: $element, $document: $document, $timeout: $timeout, c6Computed: c6Computed });
				}));
			});
		});
	});
})();
