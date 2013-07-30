(function() {
	'use strict';
	
	angular.module('c6.ui')
		.directive('c6Controls', [function() {
			return {
				restrict: 'E',
				scope: {
					delegate: '&',
					controller: '&',
					segments: '&'
				},
				templateUrl: 'assets/lib/c6ui/controls/controls.html',
				replace: true,
				controller: 'C6ControlsController'
			};
		}])

		.controller('C6ControlsController', ['$scope', '$attrs', '$element', '$document', '$timeout', function($scope, $attrs, $element, $document, $timeout) {
			var noop = angular.noop,
				delegate = function(method, args) {
					var actualDelegate = ($scope.delegate || function() { return {}; })();

					(actualDelegate[method] || noop).apply(undefined, args);
				},
				state = {
					playing: false,
					playheadPosition: 0,
					bufferedPercent: 0,
					volume: {
						show: false,
						seeking: false,
						playheadPosition: 100,
						levelTier: function() {
							var position = this.playheadPosition,
								muted = this.muted;

							if (position === 0 || muted) {
								return 'Mute';
							} else if (position > 0 && position <= 33) {
								return 'Low';
							} else if (position > 33 && position <= 66) {
								return 'Med';
							} else if (position > 66) {
								return 'High';
							}
						},
						muted: false
					},
					seeking: false,
					segments: []
				},
				getMousePositionAsSeekbarPercent = function(seeker$, mousePosition) {
						var position = mousePosition - seeker$[0].getBoundingClientRect().left,
						positionPercent = ((position / seeker$[0].offsetWidth) * 100),
						leftPercent = Math.max(0, positionPercent - 5);

						return Math.min(((leftPercent * 100) / 90), 100);
				},
				getMousePositionAsVolumeSeekbarPercent = function(seeker$, mousePosition) {
					var position = mousePosition - seeker$[0].getBoundingClientRect().top - $document.find('body').prop('scrollTop'),
						positionPercent = ((position / seeker$.prop('offsetHeight')) * 100),
						topPercent = Math.max(0, positionPercent - 14);

					return Math.abs((Math.min(((topPercent * 100) / 72), 100)) - 100);
				},
				handlePlayheadDrag = function(event) {
					var seeker$ = angular.element(event.currentTarget);

					delegate('seek', [getMousePositionAsSeekbarPercent(seeker$, event.pageX)]);
				},
				handleVolumePlayheadDrag = function(event) {
					var seeker$ = angular.element(event.currentTarget);

					delegate('volumeSeek', [getMousePositionAsVolumeSeekbarPercent(seeker$, event.pageY)]);
				},
				slider$ = angular.element($element[0].querySelector('.controls__seek')),
				volumeSlider$ = angular.element($element[0].querySelector('.volume__box')),
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
						slider$.bind('mousemove', handlePlayheadDrag);
						state.seeking = true;
					},
					seekbarClick: function(event) {
						var seeker$ = angular.element(event.target).parent();

						delegate('seek', [getMousePositionAsSeekbarPercent(seeker$, event.pageX)]);
					},
					stopSeeking: function() {
						if (state.seeking) {
							slider$.unbind('mousemove', handlePlayheadDrag);
							state.seeking = false;
						}
					},
					volume: {
						startSeeking: function() {
							volumeSlider$.bind('mousemove', handleVolumePlayheadDrag);
							state.volume.seeking = true;
						},
						stopSeeking: function() {
							if (state.volume.seeking) {
								volumeSlider$.unbind('mousemove', handleVolumePlayheadDrag);
								state.volume.seeking = false;
							}
						},
						seekbarClick: function(event) {
							var seeker$ = angular.element(event.target).parent();

							delegate('volumeSeek', [getMousePositionAsVolumeSeekbarPercent(seeker$, event.pageY)]);
						},
						muteUnmute: function() {
							if (!state.volume.muted) {
								delegate('mute');
							} else {
								delegate('unmute');
							}
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
				getCombinedLengthOfPreviousSegments = function(segments, index) {
					var length = 0;

					while (index--) {
						length += segments[index].portion;
					}

					return length;
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
			controller().volumeChange = function(percent) {
				state.volume.playheadPosition = percent;
			};
			controller().muteChange = function(mute) {
				state.volume.muted = mute;
			};
			controller().buffer = function(percent, segmentIndex) {
				if (segmentIndex === null || segmentIndex === undefined) {
					segmentIndex = 0;
				}

				state.segments[segmentIndex].bufferedPercent = percent;
			};

			$scope.$watch('segments()', function(segments) {
				if (!segments || !segments.length) {
					var defaultSegment = {
						portion: 100,
						bufferedPercent: 0,
						active: function() {
							return true;
						},
						position: {
							left: 0,
							width: function() {
								return defaultSegment.bufferedPercent;
							}
						}
					};

					state.segments.length = 0;
					state.segments.push(defaultSegment);
				} else {
					var totalPortions = 0;

					state.segments.length = 0;

					segments.forEach(function(segment, index) {
						var finalSegment = {
							portion: segment.portion,
							bufferedPercent: segment.bufferedPercent || 0,
							active: function() {

							},
							position: {
								left: getCombinedLengthOfPreviousSegments(segments, index),
								width: function() {
									return ((finalSegment.bufferedPercent * finalSegment.portion) / 100);
								}
							}
						};

						totalPortions += finalSegment.portion;

						state.segments.push(finalSegment);
					});

					if (totalPortions !== 100) {
						throw new RangeError('The sum of all the portions must equal 100.');
					}
				}

				controller().ready = true;
			}, true);

			$scope.handle = handle;

			$scope.state = state;
		}]);
})();
