(function() {
	'use strict';

	define(['controls/controls'], function() {
		describe('c6Controls', function() {
			describe('the controller', function() {
				var Controller,
					$rootScope,
					$timeout,
					$scope,
					$element = [{
						querySelector: function(query) {

						}
					}],
					$document,
					buttons,
					segments,
					nodes,
					delegate,
					controller = {};

				beforeEach(module('c6.ui'));
				beforeEach(inject(function($controller, _$rootScope_, _$timeout_, c6Computed) {
					$rootScope = _$rootScope_;
					$timeout = _$timeout_;

					segments = null;
					buttons = null;
					nodes = null;

					$scope = $rootScope.$new(true);
					$scope.delegate = function() {
						return delegate;
					};
					$scope.controller = function() {
						return controller;
					};
					$scope.buttons = function() {
						return buttons;
					};
					$scope.segments = function() {
						return segments;
					};
					$scope.nodes = function() {
						return nodes;
					};

					Controller = $controller('C6ControlsController', { $scope: $scope, $element: $element, $document: $document, $timeout: $timeout, c6Computed: c6Computed });
				}));

				it('should exist', function() {
					expect(Controller).toBeDefined();
				});

				describe('controls state', function() {
					describe('buttonsConfig', function() {
						it('should have an object for every button passed in.', function() {
							expect($scope.state.buttonsConfig().length).toBe(0);

							buttons = ['return'];
							$scope.$digest();
							expect($scope.state.buttonsConfig().length).toBe(1);

							buttons.push('fullscreen');
							$scope.$digest();
							expect($scope.state.buttonsConfig().length).toBe(2);

							buttons.splice(0, 1);
							$scope.$digest();
							expect($scope.state.buttonsConfig().length).toBe(1);

							buttons = null;
							$scope.$digest();
							expect($scope.state.buttonsConfig().length).toBe(0);
						});

						it('should set the configs class property to the button name with the first letter capitalized', function() {
							buttons = ['fullscreen', 'return'];
							$scope.$digest();

							var buttonsConfig = $scope.state.buttonsConfig();

							expect(buttonsConfig[0].class).toBe('Fullscreen');
							expect(buttonsConfig[1].class).toBe('Return');
						});

						it('should put the buttons in an enabled state by default', function() {
							buttons = ['fullscreen', 'return'];
							$scope.$digest();

							$scope.state.buttonsConfig().forEach(function(config) {
								expect(config.disabled).toBe(false);
							});
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
						beforeEach(function() { $scope.state.volume.playheadPosition = 0; });

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

							it('should be 0 if the controls are muted', function() {
								$scope.state.volume.playheadPosition = 50;
								$scope.state.volume.muted = true;
								$scope.$digest();

								expect($scope.state.volume.tiers.low()).toBe(0);
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

							it('should be 0 if the controls are muted', function() {
								$scope.state.volume.playheadPosition = 50;
								$scope.state.volume.muted = true;
								$scope.$digest();

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

							it('should be 0 if the controls are muted', function() {
								$scope.state.volume.playheadPosition = 50;
								$scope.state.volume.muted = true;
								$scope.$digest();

								expect($scope.state.volume.tiers.high()).toBe(0);
							});
						});
					});

					describe('segments', function() {
						beforeEach(function() { segments = null; });

						it('should create a default segment if none are passed in', function() {
							$scope.$digest();

							expect($scope.state.segments().length).toBe(1);
						});

						it('should be "active" if the playhead is in the segment', function() {
							var segmentIsActive = function(segment) {
								segments.forEach(function(thisSegment) {
									if (segment === thisSegment) {
										expect(thisSegment.__c6Controls.active()).toBe(true);
									} else {
										expect(thisSegment.__c6Controls.active()).toBe(false);
									}
								});
							};

							segments = [
								{
									portion: 25,
									bufferedPercent: 100
								},
								{
									portion: 25,
									bufferedPercent: 100
								},
								{
									portion: 30,
									bufferedPercent: 100
								},
								{
									portion: 20,
									bufferedPercent: 100
								}
							];

							$scope.state.playheadPosition = 0;
							$scope.$digest();

							segmentIsActive(segments[0]);

							$scope.state.playheadPosition = 30;
							$scope.$digest();

							segmentIsActive(segments[1]);

							$scope.state.playheadPosition = 75;
							$scope.$digest();

							segmentIsActive(segments[2]);

							$scope.state.playheadPosition = 99;
							$scope.$digest();
							segmentIsActive(segments[3]);
						});

						describe('past segments length', function() {
							it('should be the length of all the segments before the active one', function() {
								segments = [
									{
										portion: 25,
										bufferedPercent: 0
									},
									{
										portion: 25,
										bufferedPercent: 0
									},
									{
										portion: 50,
										bufferedPercent: 0
									}
								];
								$scope.$digest();

								expect($scope.state.pastSegmentsLength()).toBe(0);

								$scope.state.playheadPosition = 30;
								$scope.$digest();
								expect($scope.state.pastSegmentsLength()).toBe(25);

								$scope.state.playheadPosition = 60;
								$scope.$digest();
								expect($scope.state.pastSegmentsLength()).toBe(50);
							});
						});
					});
				});

				describe('handling user events', function() {
					beforeEach(function() {
						delegate = {
							play: jasmine.createSpy(),
							pause: jasmine.createSpy(),
							seek: jasmine.createSpy(),
							mute: jasmine.createSpy(),
							unmute: jasmine.createSpy(),
							nodeClicked: jasmine.createSpy(),
							seekStart: jasmine.createSpy(),
							seekStop: jasmine.createSpy()
						};
					});

					describe('seek', function() {
						it('should notify the delegate when seeking starts and stops', function() {
							expect($scope.delegate().seekStart).not.toHaveBeenCalled();

							$scope.handle.startSeeking();
							$scope.$digest();
							expect($scope.delegate().seekStart).toHaveBeenCalled();

							$scope.state.seekPercent = 50;

							expect($scope.delegate().seekStop).not.toHaveBeenCalled();

							$scope.handle.stopSeeking();
							$scope.$digest();
							expect($scope.delegate().seekStop).toHaveBeenCalled();
						});

						it('should call seekStart and seekStop with the percent seeking stopped at, the segment seeking stopped at and the percent of the segment seeking stopped at.', function() {
							$scope.handle.startSeeking();
							$scope.$digest();
							$scope.state.seekPercent = 50;
							$scope.$digest();
							$scope.handle.stopSeeking();
							$scope.$digest();

							var seekStartArguments = delegate.seekStart.mostRecentCall.args,
								seekStopArguments = delegate.seekStop.mostRecentCall.args;

							expect(typeof seekStartArguments[0]).toBe('number');
							expect(seekStartArguments[1]).toBe($scope.state.segments()[0]);
							expect(typeof seekStartArguments[2]).toBe('number');

							expect(typeof seekStopArguments[0]).toBe('number');
							expect(seekStopArguments[1]).toBe($scope.state.segments()[0]);
							expect(typeof seekStopArguments[2]).toBe('number');
						});

						it('should call seekStart before seek', function() {
							var event = {
								currentTarget: {
									parentNode: {
										getBoundingClientRect: function() {
											return {
												left: 50
											};
										},
										offsetWidth: 600
									}
								},
								pageX: 100
							};

							$scope.$digest();

							segments = [{
								__c6Controls: {
									position: {
										left: function() {
											return 0;
										},
										portion: 100
									}
								}
							}];

							delegate.seek = function() {
								expect($scope.delegate().seekStart).toHaveBeenCalled();
							};

							$scope.handle.seekbarClick(event);
						});

						it('should notify the delegate when seeking starts, but not when seeking ends until the controller\'s progress method is called, when the seekbar is clicked', function() {
							var event = {
								currentTarget: {
									parentNode: {
										getBoundingClientRect: function() {
											return {
												left: 50
											};
										},
										offsetWidth: 600
									}
								},
								target: {},
								pageX: 100
							};

							$scope.$digest();

							$scope.handle.seekbarClick(event);
							$scope.$digest();
							expect($scope.delegate().seekStart).toHaveBeenCalled();
							expect($scope.delegate().seekStop).not.toHaveBeenCalled();
							$timeout.flush();

							$scope.controller().progress(0);
							$scope.$digest();
							expect($scope.delegate().seekStop).toHaveBeenCalled();
						});
					});

					describe('playPause', function() {
						it('should notify the delegate of play/pause depending on the state.', function() {
							expect($scope.delegate().play).not.toHaveBeenCalled();

							$scope.handle.playPause();
							expect($scope.delegate().play).toHaveBeenCalled();
							expect($scope.delegate().pause).not.toHaveBeenCalled();

							$scope.state.playing = true;
							$scope.handle.playPause();
							expect($scope.delegate().pause).toHaveBeenCalled();
						});
					});

					describe('seeking', function() {
						beforeEach(function() {
							$scope.state.seeking = false;
						});

						it('should set the seeking state to true', function() {
							expect($scope.state.seeking).toBe(false);

							$scope.handle.startSeeking();
							expect($scope.state.seeking).toBe(true);
						});
					});

					describe('volume', function() {
						describe('muteUnmute', function() {
							it('should notify the delegate of mute/unmute depending on the state.', function() {
								expect($scope.delegate().mute).not.toHaveBeenCalled();

								$scope.handle.volume.muteUnmute();
								expect($scope.delegate().mute).toHaveBeenCalled();
								expect($scope.delegate().unmute).not.toHaveBeenCalled();

								$scope.state.volume.muted = true;
								$scope.handle.volume.muteUnmute();
								expect($scope.delegate().unmute).toHaveBeenCalled();
							});
						});

						describe('showing/hiding the box', function() {
							it('should immediately show', function() {
								$scope.handle.volume.show();
								expect($scope.state.volume.show).toBe(true);
							});

							it('should wait 1 second before hiding', function() {
								$scope.state.volume.show = true;

								$scope.handle.volume.hide();
								expect($scope.state.volume.show).toBe(true);
								$timeout.flush();
								expect($scope.state.volume.show).toBe(false);
							});
						});
					});

					describe('nodes', function() {
						describe('clicking', function() {
							it('should notify the delegate when one is clicked', function() {
								var event = {
									stopPropagation: function() {}
								};

								nodes = [
									{
										position: 25,
										text: 'hey'
									},
									{
										position: 50,
										text: 'hello'
									},
									{
										position: 75,
										text: 'foo'
									}
								];

								expect($scope.delegate().nodeClicked).not.toHaveBeenCalled();

								$scope.handle.node.click(event, nodes[1]);

								expect($scope.delegate().nodeClicked).toHaveBeenCalledWith(nodes[1]);
							});
						});
					});
				});

				describe('controller methods', function() {
					beforeEach(function() {
						waitsFor(function() {
							return $scope.controller().ready;
						});
					});

					describe('setButtonDisabled', function() {
						beforeEach(function() {
							buttons = ['return', 'fullscreen'];
							$scope.$digest();
						});

						it('should disable and reenable the button', function() {
							$scope.controller().setButtonDisabled('return', true);
							expect($scope.state.buttonsConfig()[0].disabled).toBe(true);

							$scope.controller().setButtonDisabled('fullscreen', true);
							expect($scope.state.buttonsConfig()[1].disabled).toBe(true);

							$scope.controller().setButtonDisabled('return', false);
							expect($scope.state.buttonsConfig()[0].disabled).toBe(false);

							$scope.controller().setButtonDisabled('fullscreen', false);
							expect($scope.state.buttonsConfig()[1].disabled).toBe(false);
						});
					});


					describe('play', function() {
						it('should set the state to playing', function() {
							expect($scope.state.playing).toBe(false);

							$scope.controller().play();
							expect($scope.state.playing).toBe(true);
						});
					});

					describe('pause', function() {
						it('should set the state to not playing', function() {
							$scope.state.playing = true;

							$scope.controller().pause();
							expect($scope.state.playing).toBe(false);
						});
					});

					describe('progress', function() {
						it('should change the position of the playhead', function() {
							expect($scope.state.playheadPosition).toBe(0);

							$scope.controller().progress(25);
							expect($scope.state.playheadPosition).toBe(25);
						});

						it('should only progress in a segment if that segment is passed in', function() {
							segments = [
								{
									portion: 50,
									bufferedPercent: 100
								},
								{
									portion: 50,
									bufferedPercent: 100
								}
							];
							$scope.$digest();

							expect($scope.state.playheadPosition).toBe(0);

							$scope.controller().progress(50, segments[0]);
							expect($scope.state.playheadPosition).toBe(25);

							$scope.controller().progress(50, segments[1]);
							expect($scope.state.playheadPosition).toBe(75);
						});

						describe('node notifications', function() {
							beforeEach(function() {
								nodes = [
									{
										position: 25
									},
									{
										position: 50
									},
									{
										position: 70
									},
									{
										position: 95
									}
								];

								delegate = {
									nodeReached: jasmine.createSpy()
								};
							});

							it('should normally notify you', function() {
								expect($scope.delegate().nodeReached.callCount).toBe(0);

								$scope.controller().progress(1);
								expect($scope.delegate().nodeReached.callCount).toBe(0);

								$scope.controller().progress(30);
								expect($scope.delegate().nodeReached.callCount).toBe(1);

								$scope.controller().progress(50.1);
								expect($scope.delegate().nodeReached.callCount).toBe(2);

								$scope.controller().progress(100);
								expect($scope.delegate().nodeReached.callCount).toBe(4);
							});

							it('should not notify you if you are seeking', function() {
								expect($scope.delegate().nodeReached).not.toHaveBeenCalled();

								$scope.state.seeking = true;

								$scope.controller().progress(1);
								expect($scope.delegate().nodeReached).not.toHaveBeenCalled();

								$scope.controller().progress(30);
								expect($scope.delegate().nodeReached).not.toHaveBeenCalled();

								$scope.controller().progress(50.1);
								expect($scope.delegate().nodeReached).not.toHaveBeenCalled();

								$scope.controller().progress(100);
								expect($scope.delegate().nodeReached).not.toHaveBeenCalled();
							});
						});
					});

					describe('volumeChange', function() {
						it('should change the volume playhead position', function() {
							expect($scope.state.volume.playheadPosition).toBe(100);

							$scope.controller().volumeChange(50);
							expect($scope.state.volume.playheadPosition).toBe(50);
						});
					});

					describe('muteChange', function() {
						it('should change the muted state of the player', function() {
							expect($scope.state.volume.muted).toBe(false);

							$scope.controller().muteChange(true);
							expect($scope.state.volume.muted).toBe(true);

							$scope.controller().muteChange(false);
							expect($scope.state.volume.muted).toBe(false);
						});
					});

					describe('buffer', function() {
						it('should change the bufferedPercent property of the first segment if no segment is passed in', function() {
							$scope.$digest();

							expect($scope.state.segments()[0].bufferedPercent).toBe(0);

							$scope.controller().buffer(50);
							expect($scope.state.segments()[0].bufferedPercent).toBe(50);
						});

						it('should changed the bufferedPercent property of a specific segment if that segment is passed in', function() {
							segments = [
								{
									portion: 50
								},
								{
									portion: 50
								}
							];

							$scope.$digest();

							expect($scope.state.segments()[0].bufferedPercent).toBeFalsy();
							expect($scope.state.segments()[1].bufferedPercent).toBeFalsy();

							$scope.controller().buffer(50, segments[1]);
							expect($scope.state.segments()[0].bufferedPercent).toBeFalsy();
							expect($scope.state.segments()[1].bufferedPercent).toBe(50);
						});
					});
				});
			});
		});
	});
})();
