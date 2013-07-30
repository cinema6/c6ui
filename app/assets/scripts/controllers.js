(function() {
	'use strict';

	angular.module('app')
		.controller('AppController', ['$scope', function($scope) {

		}])
		.controller('VideoPlayerController', ['$scope', function($scope) {
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

			/*this.segments = [
				{
					portion: 50,
					bufferedPercent: 0
				},
				{
					portion: 20,
					bufferedPercent: 50
				},
				{
					portion: 30,
					bufferedPercent: 80
				}
			];*/

			this.ControlsController = {};

			this.play = function() {
				video.player.play();
			};

			this.pause = function() {
				video.player.pause();
			};

			this.seek = function(percent) {
				video.player.currentTime = (percent * video.player.duration) / 100;
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

			$scope.VideoPlayerCtrl = this;
		}]);
})();
