(function() {
	'use strict';

	angular.module('app')
		.controller('AppController', ['$scope', function($scope) {

		}])
		.controller('VideoPlayerController', ['$scope', '$log', function($scope, $log) {
			var video,
				self = this;

			$scope.$on('c6video-ready', function(event, c6video) {
				var setupEventListeners = function() {
					c6video
						.on('play', function() {
							self.ControlsController.play();
						})
						.on('pause', function() {
							self.ControlsController.pause();
						})
						.on('timeupdate', function(event) {
							var currentTime = event.target.currentTime,
								totalTime = event.target.duration;

							self.ControlsController.progress((currentTime / totalTime) * 100);
						})
						.on('volumechange', function(event) {
							var volumePercent = event.target.volume * 100,
								muted = event.target.muted;

							self.ControlsController.volumeChange(volumePercent);
							self.ControlsController.muteChange(muted);
						})
						.on('progress', function() {
							self.ControlsController.buffer(c6video.bufferedPercent() * 100);
						});

					self.ControlsController.buffer(c6video.bufferedPercent() * 100);
				};
				
				video = c6video;

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

			this.segments = [
				{
					portion: 20,
					bufferedPercent: 0
				},
				{
					portion: 5,
					bufferedPercent: 50
				},
				{
					portion: 21,
					bufferedPercent: 80
				},
				{
					portion: 54,
					bufferedPercent: 80
				}
			];

			this.nodes = [
				{
					position: 20,
					style: 'scene',
					text: 'Hello world!'
				},
				{
					position: 25,
					style: 'scene',
					text: 'How is life?'
				},
				{
					position: 46,
					style: 'scene',
					text: 'Foo'
				}
			];

			this.ControlsController = {};

			this.play = function() {
				video.player.play();
			};

			this.pause = function() {
				video.player.pause();
			};

			this.seekStart = function() {
				$log.log('seeking started');
			};

			this.seek = function(percent) {
				video.player.currentTime = (percent * video.player.duration) / 100;
			};

			this.seekStop = function() {
				$log.log('seeking stopped');
			};

			this.volumeSeek = function(percent) {
				video.player.volume = percent / 100;
			};

			this.mute = function() {
				video.player.muted = true;
			};

			this.unmute = function() {
				video.player.muted = false;
			};

			this.fullscreen = function() {
				$log.log('fullscreen');
			};

			this.return = function() {
				$log.log('return');
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
