(function() {
	'use strict';
	
	angular.module('c6.ui')
		.directive('c6Controls', [function() {
			return {
				restrict: 'E',
				scope: {
					delegate: '&',
					controller: '&'
				},
				templateUrl: 'assets/lib/c6ui/controls/controls.html',
				replace: true,
				controller: 'C6ControlsController'
			};
		}])

		.controller('C6ControlsController', ['$scope', '$attrs', '$rootScope', '$document', function($scope, $attrs, $rootScope, $document) {
			var delegate = $scope.delegate,
				noop = angular.noop,
				state = {
					playing: false,
					playheadPosition: 0
				},
				handle = {
					playPause: function() {
						state.playing = !state.playing;

						if (state.playing) {
							(delegate().play || noop)();
						} else {
							(delegate().pause || noop)();
						}
					},
					startSeeking: function(event) {
						var handleMouse = function(event) {
							console.log(event);
						},
							slider = angular.element(event.target).parent();

						slider.bind('mousemove', handleMouse);
					},
					stopSeeking: function() {

					}
				},
				controller = $scope.controller;

			controller().play = function() {
				state.playing = true;
			};
			controller().pause = function() {
				state.playing = false;
			};
			controller().progress = 0;

			$scope.$watch('controller().progress', function(progress) {
				state.playheadPosition = ((progress * 90) / 100);
			});

			$scope.handle = handle;

			$scope.state = state;
		}]);
})();
