(function() {
	'use strict';

	define(['controls/controls'], function() {
		describe('c6Controls', function() {
			describe('the controller', function() {
				var Controller,
					$rootScope,
					$scope,
					$element = [{
						querySelector: function(query) {

						}
					}],
					$document,
					buttons;

				beforeEach(module('c6.ui'));
				beforeEach(inject(function($controller, _$rootScope_, $timeout, c6Computed) {
					$rootScope = _$rootScope_;

					$scope = $rootScope.$new(true);
					$scope.controller = function() {
						return {};
					};
					$scope.buttons = function() {
						return buttons;
					};

					Controller = $controller('C6ControlsController', { $scope: $scope, $element: $element, $document: $document, $timeout: $timeout, c6Computed: c6Computed });
				}));

				it('should exist', function() {
					expect(Controller).toBeDefined();
				});

				describe('controls state', function() {
					describe('hasButton', function() {
						beforeEach(function() { buttons = null; });

						it('should figure out if the given button is enabled', function() {
							expect($scope.state.hasButton('fullscreen')).toBe(false);

							buttons = ['fullscreen'];
							expect($scope.state.hasButton('fullscreen')).toBe(true);

							buttons.push('return');
							expect($scope.state.hasButton('return')).toBe(true);
						});

						it('should just return false if there are no buttons passed into the config', function() {
							expect($scope.state.hasButton).not.toThrow();
							expect($scope.state.hasButton('fullscreen')).toBe(false);
						});
					});

					describe('leftMargin', function() {
						beforeEach(function() { buttons = null; });

						it('should be 22 if there are no buttons on the left side', function() {
							expect($scope.state.leftMargin()).toBe(22);
						});

						it('should add 58 pixels for every button you add to the left', function() {
							buttons = ['return'];
							expect($scope.state.leftMargin()).toBe(58);
						});

						it('should throw an error if you pass in a non-valid button', function() {
							buttons = ['foo'];
							expect($scope.state.leftMargin).toThrow();
						});
					});

					describe('rightMargin', function() {
						beforeEach(function() { buttons = null; });

						it('should be 22 if there are no buttons on the left side', function() {
							expect($scope.state.rightMargin()).toBe(22);
						});

						it('should add 58 pixels for every button you add to the left', function() {
							buttons = ['fullscreen'];
							expect($scope.state.rightMargin()).toBe(58);
						});

						it('should throw an error if you pass in a non-valid button', function() {
							buttons = ['foo'];
							expect($scope.state.rightMargin).toThrow();
						});
					});

					describe('volume tiers', function() {
						beforeEach(function() { $scope.state.volume.playheadPosition = 0 });

						describe('mute', function() {
							it('should be 1 if the controls are muted or the volume is 0', function() {
								expect($scope.state.volume.tiers.mute()).toBe(1);

								$scope.state.volume.playheadPosition = 100;
								$scope.$digest();
								expect($scope.state.volume.tiers.mute()).toBe(0);

								$scope.state.volume.muted = true;
								$scope.$digest();
								expect($scope.state.volume.tiers.mute()).toBe(1);
							});
						});

						describe('low', function() {
							it('should scale between 0 and 1 as the playhead scales between 0 and 33', function() {
								expect($scope.state.volume.tiers.low()).toBe(0);

								$scope.state.volume.playheadPosition = 10;
								$scope.$digest();
								expect($scope.state.volume.tiers.low()).toBe(0.33);

								$scope.state.volume.playheadPosition = 30;
								$scope.$digest();
								expect($scope.state.volume.tiers.low()).toBe(0.99);
							});

							it('should never go above 1', function() {
								$scope.state.volume.playheadPosition = 50;
								$scope.$digest();
								expect($scope.state.volume.tiers.low()).toBe(1);
							});
						});

						describe('med', function() {
							it('should scale between 0 and 1 as the playhead scales between 33 and 66', function() {
								$scope.state.volume.playheadPosition = 33;
								$scope.$digest();
								expect($scope.state.volume.tiers.med()).toBe(0);

								$scope.state.volume.playheadPosition = 43;
								$scope.$digest();
								expect($scope.state.volume.tiers.med()).toBe(0.33);

								$scope.state.volume.playheadPosition = 63;
								$scope.$digest();
								expect($scope.state.volume.tiers.med()).toBe(0.99);
							});

							it('should never go above 1', function() {
								$scope.state.volume.playheadPosition = 75;
								$scope.$digest();
								expect($scope.state.volume.tiers.med()).toBe(1);
							});

							it('should never go below 0', function() {
								expect($scope.state.volume.tiers.med()).toBe(0);
							});
						});

						describe('high', function() {
							it('should scale between 0 and 1 as the playhead scales between 66 and 100', function() {
								$scope.state.volume.playheadPosition = 66;
								$scope.$digest();
								expect($scope.state.volume.tiers.high()).toBe(0);

								$scope.state.volume.playheadPosition = 76;
								$scope.$digest();
								expect($scope.state.volume.tiers.high()).toBe(0.297);

								$scope.state.volume.playheadPosition = 96;
								$scope.$digest();
								expect($scope.state.volume.tiers.high()).toBe(0.957);
							});

							it('should never go below 0', function() {
								expect($scope.state.volume.tiers.high()).toBe(0);
							});
						});
					});
				});
			});
		});
	});
})();
