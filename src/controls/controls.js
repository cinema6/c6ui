(function() {
	'use strict';

	angular.module('c6.ui')
		.directive('c6ControlsNode', [function() {
			return {
				restrict: 'E',
				scope: {
					model: '&',
					handlers: '&'
				},
				templateUrl: 'assets/lib/c6ui/controls/node.html',
				replace: true,
				link: function(scope, element) {
					scope.$watch('model().position', function(position) {
						element.css('left', position + '%');
					});

					scope.$watch('model().text', function() {
						var width = element.prop('offsetWidth');

						element.css('margin-left', ((width / 2) * -1) + 'px');
					});
				}
			};
		}])

		.directive('c6Controls', [function() {
			return {
				restrict: 'E',
				scope: {
					delegate: '&',
					controller: '&',
					segments: '&',
					nodes: '&',
					buttons: '&'
				},
				templateUrl: 'assets/lib/c6ui/controls/controls.html',
				replace: true,
				controller: 'C6ControlsController'
			};
		}])

		.controller('C6ControlsController', ['$scope', '$element', '$document', '$timeout', 'c6Computed', function($scope, $element, $document, $timeout, c) {
			var noop = angular.noop,
				delegate = function(method, args) {
					var actualDelegate = ($scope.delegate || function() { return {}; })();

					(actualDelegate[method] || noop).apply(undefined, args);
				},
				getCombinedLengthOfPreviousSegments = function(segments, index) {
					var length = 0;

					while (index--) {
						length += segments[index].portion;
					}

					return length;
				},
				getSoundwaveOpacity = function(offset, muted, playheadPosition) {
					return (muted ? 0 : 1) && (Math.max(0, Math.min(1, ((playheadPosition - offset)  * 33) / 1000)));
				},
				volumeTierDependencies = ['state.volume.playheadPosition', 'state.volume.muted'],
				leftButtons = ['return'],
				rightButtons = ['fullscreen'],
				sortedButtons = function(buttons) {
					var sorted = {
						left: [],
						right: []
					};

					buttons.forEach(function(button) {
						if (leftButtons.indexOf(button) !== -1) {
							sorted.left.push(button);
						} else if (rightButtons.indexOf(button) !== -1) {
							sorted.right.push(button);
						} else {
							throw new Error(button + ' is not a valid button... :-(');
						}
					});

					return sorted;
				},
				state = {
					playing: false,
					playheadPosition: 0,
					bufferedPercent: 0,
					hasButton: function(button) {
						return ($scope.buttons() || []).indexOf(button) !== -1;
					},
					leftMargin: c($scope, function() {
						var myButtons = sortedButtons(this.buttons() || []).left;

						return myButtons.length ? (myButtons.length * 58) : 22;
					}, ['buttons().length']),
					rightMargin: c($scope, function() {
						var myButtons = sortedButtons(this.buttons() || []).right;

						return myButtons.length ? (myButtons.length * 58) : 22;
					}, ['buttons().length']),
					volume: {
						show: false,
						seeking: false,
						playheadPosition: 100,
						muted: false,
						tiers: {
							mute: c($scope, function(playheadPosition, muted) {
								if (playheadPosition === 0 || muted) {
									return 1;
								} else {
									return 0;
								}
							}, volumeTierDependencies),
							low: c($scope, function(playheadPosition, muted) {
								return getSoundwaveOpacity(0, muted, playheadPosition);
							}, volumeTierDependencies),
							med: c($scope, function(playheadPosition, muted) {
								return getSoundwaveOpacity(33, muted, playheadPosition);
							}, volumeTierDependencies),
							high: c($scope, function(playheadPosition, muted) {
								return getSoundwaveOpacity(67, muted, playheadPosition);
							}, volumeTierDependencies)
						}
					},
					seeking: false,
					segments: $scope.segments,
					nodes: $scope.nodes,
					pastSegmentsLength: c($scope, function(playheadPosition, segments) {
						var length = 0;

						segments.some(function(segment) {
							if (!(segment.__c6Controls && segment.__c6Controls.active())) {
								length += segment.portion;
							} else {
								return true;
							}
						});

						return length;
					}, ['state.playheadPosition', 'state.segments()'])
				},
				getMousePositionAsSeekbarPercent = function(seeker$, mousePosition) {
					var position = mousePosition - seeker$[0].getBoundingClientRect().left,
						positionPercent = ((position / seeker$[0].offsetWidth) * 100),
						marginsAsPercent = (((state.leftMargin() + state.rightMargin() + 16) / seeker$.prop('offsetWidth')) * 100),
						leftPercent = Math.max(0, positionPercent - (((state.leftMargin() + 8) / seeker$.prop('offsetWidth')) * 100));

					return Math.min(((leftPercent * 100) / (100 - marginsAsPercent)), 100);
				},
				getMousePositionAsVolumeSeekbarPercent = function(seeker$, mousePosition) {
					var position = mousePosition - seeker$[0].getBoundingClientRect().top - $document.find('body').prop('scrollTop'),
						positionPercent = ((position / seeker$.prop('offsetHeight')) * 100),
						topPercent = Math.max(0, positionPercent - 14);

					return Math.abs((Math.min(((topPercent * 100) / 72), 100)) - 100);
				},
				getSegmentAtSeekbarPercent = function(percent) {
					var leftPosition,
						foundSegment;

					state.segments().some(function(segment) {
						leftPosition = segment.__c6Controls && segment.__c6Controls.position.left();

						if ((percent >= leftPosition) && (percent <= (leftPosition + segment.portion))) {
							foundSegment = segment;
							return true;
						}
					});

					return foundSegment;
				},
				getSeekbarPercentAsPercentOfSegment = function(percent, segment) {
					var percentAfterSegmentStart = percent - segment.__c6Controls.position.left();

					return ((percentAfterSegmentStart * 100) / segment.portion);
				},
				handlePlayheadDrag = function(event) {
					var seeker$ = angular.element(event.currentTarget),
						seekbarPercent = getMousePositionAsSeekbarPercent(seeker$, event.pageX),
						segmentMouseIsOver = getSegmentAtSeekbarPercent(seekbarPercent),
						percentOfSegment = getSeekbarPercentAsPercentOfSegment(seekbarPercent, segmentMouseIsOver);

					delegate('seek', [seekbarPercent, segmentMouseIsOver, percentOfSegment]);
				},
				handleVolumePlayheadDrag = function(event) {
					var seeker$ = angular.element(event.currentTarget);

					delegate('volumeSeek', [getMousePositionAsVolumeSeekbarPercent(seeker$, event.pageY)]);
				},
				slider$ = angular.element($element[0].querySelector('.controls__seek')),
				volumeSlider$ = angular.element($element[0].querySelector('.volume__box')),
				waitingForSeekClickToEnd = false,
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
						var seeker$ = angular.element(event.currentTarget).parent(),
							seekbarPercent = getMousePositionAsSeekbarPercent(seeker$, event.pageX),
							segmentMouseIsOver = getSegmentAtSeekbarPercent(seekbarPercent),
							percentOfSegment = getSeekbarPercentAsPercentOfSegment(seekbarPercent, segmentMouseIsOver);

						if (!state.seeking && !angular.element(event.target).hasClass('controls__playhead')) {
							state.seeking = true;
							waitingForSeekClickToEnd = true;
							delegate('seek', [seekbarPercent, segmentMouseIsOver, percentOfSegment]);
							// The next time our controller's progress method is called, we'll leave the "seeking" state.
						}
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
							}, 1000);
						}
					},
					node: {
						click: function(event, model) {
							event.stopPropagation();

							delegate('nodeClicked', [model]);
						}
					}
				},
				nodesSeekbarExpectsToHit = [],
				nodeDetectionSessionInitialized = false,
				controller = $scope.controller;

			controller().play = function() {
				state.playing = true;
			};
			controller().pause = function() {
				state.playing = false;
			};
			controller().progress = function(percent, segment) {
				state.playheadPosition = (function(_percent) {
					if (!segment) {
						return _percent;
					} else {
						return (((segment.portion / 100) * _percent) + segment.__c6Controls.position.left());
					}
				})(percent);

				if (state.seeking) {
					nodesSeekbarExpectsToHit.length = 0;
					nodeDetectionSessionInitialized = false;

					if (waitingForSeekClickToEnd) {
						waitingForSeekClickToEnd = false;
						state.seeking = false;
					}
				} else {
					var nodesToTrash = [];

					if (!nodeDetectionSessionInitialized) {
						state.nodes().forEach(function(node) {
							if (node.position > state.playheadPosition) {
								nodesSeekbarExpectsToHit.push(node);
							}
						});
						nodeDetectionSessionInitialized = true;
					}

					nodesSeekbarExpectsToHit.forEach(function(node) {
						if (node.position <= state.playheadPosition) {
							nodesToTrash.push(node);
							delegate('nodeReached', [node]);
						}
					});

					nodesToTrash.forEach(function(node) {
						nodesSeekbarExpectsToHit.splice(nodesSeekbarExpectsToHit.indexOf(node), 1);
					});
				}
			};
			controller().volumeChange = function(percent) {
				state.volume.playheadPosition = percent;
			};
			controller().muteChange = function(mute) {
				state.volume.muted = mute;
			};
			controller().buffer = function(percent, segment) {
				(segment || state.segments()[0]).bufferedPercent = percent;
			};
			controller().ready = true;

			$scope.$watch('segments()', function(segments) {
				if (segments && segments.length) {
					state.segments = $scope.segments;

					segments.forEach(function(segment, index) {
						if (!segment.__c6Controls) {
							segment.__c6Controls = {
								position: {
									left: function() { return getCombinedLengthOfPreviousSegments(segments, index); },
									width: function() {
										return ((segment.bufferedPercent * segment.portion) / 100);
									}
								},
								active: function() {
									return ((state.playheadPosition >= this.position.left()) && (state.playheadPosition <= (this.position.left() + segment.portion)));
								}
							};
						}
					});
				} else {
					var segment = {
						portion: 100,
						bufferedPercent: 0,
						__c6Controls: {
							position: {
								left: function() { return 0; },
								width: function() { return segment.bufferedPercent; }
							},
							active: function() {
								return true;
							}
						}
					},
					wrappedSegment = [segment];

					state.segments = function() {
						return wrappedSegment;
					};
				}
			});

			// Notify our delegate whenever seeking starts or stops
			$scope.$watch('state.seeking', function(seeking, previousState) {
				if (seeking === true) {
					delegate('seekStart');
				} else if (seeking === false && seeking !== previousState) {
					delegate('seekStop');
				}
			});

			$scope.handle = handle;

			$scope.state = state;
		}]);
})();
