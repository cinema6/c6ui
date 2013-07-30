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
					volume: {
						show: false,
						seeking: false
					},
					seeking: false
				},
				getMousePositionAsSeekbarPercent = function(seeker) {
						var position = event.pageX - seeker[0].getBoundingClientRect().left,
						positionPercent = ((position / seeker[0].offsetWidth) * 100),
						leftPercent = Math.max(0, positionPercent - 5);

						return Math.min(((leftPercent * 100) / 90), 100);
				},
				getMousePositionAsVolumeSeekbarPercent = function(seeker) {
					console.log(seeker);
				},
				handlePlayheadDrag = function(event) {
					var seeker = angular.element(event.currentTarget);

					delegate('seek', [getMousePositionAsSeekbarPercent(seeker)]);
				},
				handleVolumePlayheadDrag = function(event) {
					var seeker = angular.element(event.currentTarget);

					delegate('volumeSeek', [getMousePositionAsVolumeSeekbarPercent(seeker)]);
				},
				slider = angular.element($element[0].querySelector('.controls__seek')),
				volumeSlider = angular.element($element[0].querySelector('.volume__box')),
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
					seekbarClick: function(event) {
						var seeker = angular.element(event.target).parent();

						delegate('seek', [getMousePositionAsSeekbarPercent(seeker)]);
					},
					stopSeeking: function() {
						if (state.seeking) {
							slider.unbind('mousemove', handlePlayheadDrag);
							state.seeking = false;
						}
					},
					volume: {
						startSeeking: function() {
							volumeSlider.bind('mousemove', handleVolumePlayheadDrag);
							state.volume.seeking = true;
						},
						stopSeeking: function() {

						},
						seekbarClick: function() {

						},
						show: function() {
							if (hideVolumeSliderBoxTimeout) {
								$timeout.cancel(hideVolumeSliderBoxTimeout);
								hideVolumeSliderBoxTimeout = null;
							}

							state.volume.show = true;
						},
						hide: function() {
							hideVolumeSliderBoxTimeout = $timeout(function() {
								state.volume.show = false;
							}, 500);
						}
					}
				},
				controller = $scope.controller;

			controller().play = function() {
				state.playing = true;
			};
			controller().pause = function() {
				state.playing = false;
			};
			controller().progress = function(percent) {
				state.playheadPosition = percent;
			};

			$scope.handle = handle;

			$scope.state = state;
		}]);
})();
