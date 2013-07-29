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

		.controller('C6ControlsController', ['$scope', '$attrs', '$element', '$timeout', function($scope, $attrs, $element, $timeout) {
			var noop = angular.noop,
				delegate = function(method, args) {
					var actualDelegate = ($scope.delegate || function() { return {}; })();

					(actualDelegate[method] || noop).apply(undefined, args);
				},
				state = {
					playing: false,
					playheadPosition: 0,
					showVolumeSliderBox: false,
					seeking: false
				},
				handlePlayheadDrag = function(event) {
					var seeker = angular.element(event.currentTarget),
						position = event.pageX - seeker[0].getBoundingClientRect().left,
						positionPercent = ((position / seeker[0].offsetWidth) * 100),
						percent = function() {
							var leftPercent = Math.max(0, positionPercent - 5);

							return Math.min(((leftPercent * 100) / 90), 100);
						};

					delegate('seek', [percent()]);
				},
				slider = angular.element($element[0].querySelector('.controls__seek')),
				hideVolumeSliderBoxTimeout,
				handle = {
					playPause: function() {
						if (!state.playing) {
							delegate('play');
						} else {
							delegate('pause');
						}
					},
					startSeeking: function() {
						slider.bind('mousemove', handlePlayheadDrag);
						state.seeking = true;
					},
					stopSeeking: function() {
						if (state.seeking) {
							slider.unbind('mousemove', handlePlayheadDrag);
							state.seeking = false;
						}
					},
					showVolumeSliderBox: function() {
						if (hideVolumeSliderBoxTimeout) {
							$timeout.cancel(hideVolumeSliderBoxTimeout);
							hideVolumeSliderBoxTimeout = null;
						}

						state.showVolumeSliderBox = true;
					},
					hideVolumeSliderBox: function() {
						hideVolumeSliderBoxTimeout = $timeout(function() {
							state.showVolumeSliderBox = false;
						}, 500);
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
