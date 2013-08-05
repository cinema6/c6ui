(function() {
	'use strict';

	angular.module('app')
		.controller('AppController', ['$scope', function($scope) {

		}])
		.controller('VideoPlayerController', ['$scope', '$timeout', '$log', function($scope, $timeout, $log) {
			var videos = {},
				self = this,
				videoHandlers = {
					play: function() {
						self.ControlsController.play();
					},
					pause: function() {
						self.ControlsController.pause();
					},
					progress: function(event, c6video) {
						self.ControlsController.buffer(c6video.bufferedPercent() * 100, self.segments[c6video.id]);
					},
					timeupdate: function(event, c6video) {
						if (self.currentVideoIndex == c6video.id) {
							self.ControlsController.progress((c6video.player.currentTime / c6video.player.duration) * 100, self.segments[c6video.id]);
						}
					},
					ended: function(event, c6video) {
						var segmentsLength = Object.keys(self.segments).length;

						c6video.player.pause();

						if (c6video.id < (segmentsLength - 1)) {
							self.currentVideoIndex += 1;
							videos[self.currentVideoIndex].player.currentTime = 0;
							videos[self.currentVideoIndex].player.play();
						}
					}
				};

			$scope.$on('c6video-ready', function(event, c6video) {
				var setupEventListeners = function() {
					c6video
						.on('play', videoHandlers.play)
						.on('pause', videoHandlers.pause)
						.on('progress', videoHandlers.progress)
						.on('timeupdate', videoHandlers.timeupdate)
						.on('ended', videoHandlers.ended);

					self.ControlsController.buffer(c6video.bufferedPercent() * 100, self.segments[c6video.id]);
				};

				videos[c6video.id] = c6video;

				if (self.ControlsController.ready) {
					setupEventListeners();
				} else {
					var deactivateWatcher = $scope.$watch('VideoPlayerCtrl.ControlsController.ready', function(ready) {
						if (ready) {
							setupEventListeners();
							deactivateWatcher();
						}
					});
				}
			});

			this.currentVideoIndex = 0;

			this.segments = [
				{
					src: 'http://c6.dev.s3-website-us-east-1.amazonaws.com/media/demo/EBH',
					portion: 29
				},
				{
					src: 'http://c6.dev.s3-website-us-east-1.amazonaws.com/media/demo/Guitar_Tap',
					portion: 13
				},
				{
					src: 'http://c6.dev.s3-website-us-east-1.amazonaws.com/media/demo/McLaren',
					portion: 42
				},
				{
					src: 'http://c6.dev.s3-website-us-east-1.amazonaws.com/media/demo/Puddle',
					portion: 2
				},
				{
					src: 'http://c6.dev.s3-website-us-east-1.amazonaws.com/media/demo/Unbelievable_Dinner',
					portion: 14
				}
			];

			this.nodes = [
				{
					position: 29,
					style: 'scene',
					text: 'Guitar Tap'
				},
				{
					position: 42,
					style: 'scene',
					text: 'McLaren'
				},
				{
					position: 84,
					style: 'scene',
					text: 'Puddle'
				},
				{
					position: 86,
					style: 'scene',
					text: 'Dinner'
				}
			];

			this.ControlsController = {};

			this.play = function() {
				videos[self.currentVideoIndex].player.play();
			};

			this.pause = function() {
				videos[self.currentVideoIndex].player.pause();
			};

			this.seekStart = function() {
				$log.log('seeking started');
			};

			this.seek = function(percent, segment, percentOfSegment) {
				if (segment === self.segments[self.currentVideoIndex]) {
					videos[self.currentVideoIndex].player.currentTime = (percentOfSegment * videos[self.currentVideoIndex].player.duration) / 100;
				} else {
					videos[self.currentVideoIndex].player.pause();
					self.currentVideoIndex = self.segments.indexOf(segment);
					self.seek(percent, segment, percentOfSegment);
				}
			};

			this.seekStop = function() {
				$log.log('seeking stopped');
			};

			this.volumeSeek = function(percent) {
				var key;

				for (key in videos) {
					videos[key].player.volume = percent / 100;
				}

				$timeout(function() { self.ControlsController.volumeChange(percent); }, 0);
			};

			this.mute = function() {
				var key;

				for (key in videos) {
					videos[key].player.muted = true;
				}

				self.ControlsController.muteChange(true);
			};

			this.unmute = function() {
				var key;

				for (key in videos) {
					videos[key].player.muted = false;
				}

				self.ControlsController.muteChange(false);
			};

			this.fullscreen = function() {
				$log.log('fullscreen');
			};

			this.return = function() {
				videos[self.currentVideoIndex].player.currentTime = 0.25;
			};

			this.nodeClicked = function(node) {
				$log.log('node clicked! Text: ' + node.text);
			};

			this.nodeReached = function(node) {
				$log.log('node reached! Text: ' + node.text);
			};

			$scope.VideoPlayerCtrl = this;
		}]);
})();
