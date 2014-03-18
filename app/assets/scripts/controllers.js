(function() {
	'use strict';

	angular.module('app')
		.controller('AppController', ['$scope','c6ImagePreloader','$log','$http',
        function                     ( $scope , c6ImagePreloader , $log , $http ) {
            var self = this;

			c6ImagePreloader.load(['http://farm9.staticflickr.com/8459/8020272673_8478cc3c85_b_d.jpg', 'http://farm9.staticflickr.com/8315/8024081498_35e3d37d1e_b_d.jpg']).then(function() {
				$log.log('Images preloaded!');
			});

            this.vimeo = null;

            $http.get('http://vimeo.com/api/v2/video/76579435.json')
                .then(function(response) {
                    self.vimeo = response.data[0];
                }, function(error) {
                    $log.error(error);
                });

            $scope.AppCtrl = this;
		}])
		.controller('VideoPlayerController', ['$scope', 'c6Sfx', '$timeout', '$log', function($scope, c6Sfx, $timeout, $log) {
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

			$scope.$on('c6MouseActivityStart', function() {
				self.showControls = true;
				self.ControlsController.repositionNodes();
			});

			$scope.$on('c6MouseActivityStop', function() {
				if (!self.userIsUsingControls) {
					self.showControls = false;
				}
			});

			this.showControls = false;
			this.userIsUsingControls = false;

			c6Sfx.loadSounds([
				{
					name: 'brake',
					src: 'assets/sfx/brake'
				},
				{
					name: 'peelout',
					src: 'assets/sfx/peelout'
				},
				{
					name: 'playball',
					src: 'assets/sfx/playball'
				},
				{
					name: 'pop',
					src: 'assets/sfx/pop'
				},
				{
					name: 'whistle',
					src: 'assets/sfx/whistle'
				},
				{
					name: 'wilhelm',
					src: 'assets/sfx/wilhelm'
				}
			]);

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
					width: 10,
					text: 'Guitar Tap'
				},
				{
					position: 42,
					style: 'scene',
					width: 15,
					text: 'McLaren'
				},
				{
					position: 84,
					style: 'scene',
					width: 20,
					text: 'Puddle'
				},
				{
					position: 86,
					style: 'scene',
					width: 25,
					text: 'Dinner'
				}
			];

			this.ControlsController = {};

			this.play = function() {
				c6Sfx.playSound('playball');
				videos[self.currentVideoIndex].player.play();
			};

			this.pause = function() {
				c6Sfx.playSound('whistle');
				videos[self.currentVideoIndex].player.pause();
			};

			this.seekStart = function(event) {
				c6Sfx.playSound('peelout');
				$log.log('seeking started. Percent:', event.percent, 'Segment index:', $scope.VideoPlayerCtrl.segments.indexOf(event.segment), 'Percent of segment:', event.percentOfSegment, 'Caused by click:', event.isClick);
			};

			this.seek = function(event) {
				$log.log('seeking! Caused by click:', event.isClick);
				if (event.segment === self.segments[self.currentVideoIndex]) {
					videos[self.currentVideoIndex].player.currentTime = (event.percentOfSegment * videos[self.currentVideoIndex].player.duration) / 100;
				} else {
					videos[self.currentVideoIndex].player.pause();
					self.currentVideoIndex = self.segments.indexOf(event.segment);
					self.seek(event);
				}
			};

			this.seekStop = function(event) {
				c6Sfx.playSound('brake');
				$log.log('seeking stopped. Percent:', event.percent, 'Segment index:', $scope.VideoPlayerCtrl.segments.indexOf(event.segment), 'Percent of segment:', event.percentOfSegment, 'Caused by click:', event.isClick);
			};

			this.volumeSeek = function(percent) {
				var key;

				if (Math.floor(percent % 10) === 0) {
					c6Sfx.playSound('pop');
				}

				for (key in videos) {
					videos[key].player.volume = percent / 100;
				}

                c6Sfx.getSounds().forEach(function(sfx) {
                    sfx.volume = (percent / 100);
                });

				$timeout(function() { self.ControlsController.volumeChange(percent); }, 0);
			};

			this.mute = function() {
				var key;

				c6Sfx.playSound('wilhelm');

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
