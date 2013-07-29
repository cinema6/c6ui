(function() {
	'use strict';

	angular.module('app')
		.controller('AppController', ['$scope', function($scope) {

		}])
		.controller('VideoPlayerController', ['$scope', function($scope) {
			var video,
				self = this;

			$scope.$on('c6video-ready', function(event, c6video) {
				video = c6video;

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

						self.ControlsController.progress = (currentTime / totalTime) * 100;
					});
			});

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

			$scope.VideoPlayerCtrl = this;
		}]);
})();
