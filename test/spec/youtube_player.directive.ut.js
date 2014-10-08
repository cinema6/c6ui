(function() {
    'use strict';

    define(['videos/ext/youtube','videos/ext/lib/youtube'], function(videosExtYoutube, youtube) {
        describe('<youtube-player>', function() {
            var $rootScope,
                $scope,
                $compile,
                $q,
                YouTubeDataService,
                $interval,
                c6BrowserInfo;

            var players,
                player,
                intervals,
                interval;

            var $player;

            beforeEach(function() {
                players = [];
                intervals = [];

                spyOn(youtube, 'Player')
                    .and.callFake(function(iframe, config) {
                        this.getCurrentTime = jasmine.createSpy('youtube.getCurrentTime()')
                            .and.returnValue(0);

                        this.getDuration = jasmine.createSpy('youtube.getDuration()')
                            .and.returnValue(0);

                        this.seekTo = jasmine.createSpy('youtube.seekTo()');
                        this.pauseVideo = jasmine.createSpy('youtube.pauseVideo()');
                        this.playVideo = jasmine.createSpy('youtube.playVideo()');
                        this.destroy = jasmine.createSpy('youtube.destroy()')
                            .and.callFake(function() {
                                iframe.parentNode.removeChild(iframe);
                            });
                        this.getIframe = function() {
                            return iframe;
                        };

                        this._trigger = function(name, event) {
                            config.events[name](event);
                        };

                        players.push(this);
                        player = this;
                    });

                module('ng', function($provide) {
                    $provide.decorator('$interval', function($delegate) {
                        var mockInterval = jasmine.createSpy('$interval')
                            .and.callFake(function() {
                                var promise = $delegate.apply($delegate, arguments);

                                intervals.push(promise);
                                interval = promise;

                                return promise;
                            });

                        mockInterval.cancel = jasmine.createSpy('$interval.cancel()')
                            .and.callFake(function(promise) {
                                intervals.splice(intervals.indexOf(promise), 1);

                                return $delegate.cancel.apply($delegate, arguments);
                            });

                        mockInterval.flush = jasmine.createSpy('$interval.flush()')
                            .and.callFake(function() {
                                return $delegate.flush.apply($delegate, arguments);
                            });

                        return mockInterval;
                    });
                });

                module(videosExtYoutube.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $interval = $injector.get('$interval');
                    $q = $injector.get('$q');
                    YouTubeDataService = $injector.get('YouTubeDataService');
                    c6BrowserInfo = $injector.get('c6BrowserInfo');

                    $scope = $rootScope.$new();
                });

                $scope.id = 'gy1B3agGNxw';
            });

            describe('initialization', function() {
                var listDeferred,
                    initSpy;

                beforeEach(function() {
                    initSpy = jasmine.createSpy('<youtube-player>:init');
                    listDeferred = $q.defer();

                    spyOn(YouTubeDataService.videos, 'list')
                        .and.returnValue(listDeferred.promise);

                    $rootScope.$on('<youtube-player>:init', initSpy);

                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="{{id}}"></youtube-player>')($scope);
                    });
                });

                it('should $emit an initialization event', function() {
                    expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object), $player.data('video'));
                });

                it('should create a youtube iframe', function() {
                    var $iframe = $player.find('iframe');

                    expect($iframe.length).toBe(1);
                    expect($iframe.attr('src')).toBe('https://www.youtube.com/embed/gy1B3agGNxw?html5=1&wmode=opaque&rel=0&enablejsapi=1');
                });

                it('should create a YouTube player with the iframe', function() {
                    var iframe = $player.find('iframe')[0];

                    expect(youtube.Player).toHaveBeenCalledWith(iframe, jasmine.any(Object));
                });

                it('should make a request for data about the video', function() {
                    expect(YouTubeDataService.videos.list).toHaveBeenCalledWith({
                        id: $scope.id,
                        part: ['status', 'contentDetails']
                    });
                });

                it('should create an interval after the player is ready', function() {
                    expect($interval).not.toHaveBeenCalled();

                    player._trigger('onReady', {});

                    expect($interval).toHaveBeenCalled();
                });

                it('should not autoplay the video', function() {
                    player._trigger('onReady', {});

                    expect(player.playVideo).not.toHaveBeenCalled();
                });

                it('should support changing the video', function() {
                    var $iframe = $player.find('iframe'),
                        video = $player.data('video'),
                        $newFrame,
                        poll;

                    player._trigger('onReady', {});
                    poll = interval;
                    player.getCurrentTime.and.returnValue(20);
                    $interval.flush(250);
                    player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });

                    $scope.$apply(function() {
                        $scope.id = 'f9h85495jf';
                    });

                    expect(YouTubeDataService.videos.list).toHaveBeenCalledWith({
                        id: $scope.id,
                        part: ['status', 'contentDetails']
                    });

                    expect(video.readyState).toBe(-1);
                    expect(video.currentTime).toBe(0);
                    expect(video.ended).toBe(false);
                    $newFrame = $player.find('iframe');

                    player._trigger('onReady', {});

                    expect($interval.cancel).toHaveBeenCalledWith(poll);
                    expect($interval.calls.count()).toBe(2);
                    expect($iframe[0]).not.toBe($newFrame[0]);
                    expect(player).not.toBe(players[0]);
                    expect($newFrame.attr('src')).toBe('https://www.youtube.com/embed/f9h85495jf?html5=1&wmode=opaque&rel=0&enablejsapi=1');
                });

                describe('if the autoplay attribute is present', function() {
                    beforeEach(function() {
                        expect(c6BrowserInfo.profile.autoplay).toBeDefined();
                        $scope.$apply(function() {
                            $player = $compile('<youtube-player videoid="TRrL5j3MIvo" autoplay></youtube-player>')($scope);
                        });
                    });

                    describe('if the browser can autoplay videos', function() {
                        beforeEach(function() {
                            c6BrowserInfo.profile.autoplay = true;
                            player._trigger('onReady');
                        });

                        it('should play the video', function() {
                            expect(player.playVideo).toHaveBeenCalled();
                        });
                    });

                    describe('if the browser can\'t autoplay videos', function() {
                        beforeEach(function() {
                            c6BrowserInfo.profile.autoplay = false;
                            player._trigger('onReady');
                        });

                        it('should not play the video', function() {
                            expect(player.playVideo).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('with a start and end time', function() {
                var iface, listDeferred;

                beforeEach(function() {
                    listDeferred = $q.defer();

                    spyOn(YouTubeDataService.videos, 'list')
                        .and.returnValue(listDeferred.promise);

                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="Mbj7zv9PqIo" start="5" end="30"></youtube-player>')($scope);
                    });
                    iface = $player.data('video');
                    player._trigger('onReady');
                });

                describe('the interface', function() {
                    describe('duration', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                listDeferred.resolve({
                                    contentDetails: {
                                        duration: 60
                                    },
                                    status: {
                                        embeddable: true
                                    }
                                });
                            });
                        });

                        it('should be the end - start', function() {
                            expect(iface.duration).toBe(25);
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                listDeferred.resolve({
                                    contentDetails: {
                                        duration: 60
                                    },
                                    status: {
                                        embeddable: true
                                    }
                                });
                            });
                        });

                        it('should be adjusted for the start/end times', function() {
                            iface.currentTime = 1;
                            expect(player.seekTo).toHaveBeenCalledWith(6);

                            iface.currentTime = 5;
                            expect(player.seekTo).toHaveBeenCalledWith(10);

                            iface.currentTime = -2;
                            expect(player.seekTo).toHaveBeenCalledWith(5);

                            iface.currentTime = 26;
                            expect(player.seekTo).toHaveBeenCalledWith(30);
                        });
                    });
                });

                describe('if the currentTime is in-between the start and end time', function() {
                    beforeEach(function() {
                        player.getCurrentTime.and.returnValue(5);
                    });

                    it('should not do any seeking or pausing', function() {
                        [5, 10, 15, 20, 25, 29.99].forEach(function(time) {
                            player.getCurrentTime.and.returnValue(time);
                            $interval.flush(250);
                            expect(player.seekTo).not.toHaveBeenCalled();
                            expect(player.pauseVideo).not.toHaveBeenCalled();
                        });
                    });

                    describe('the interface', function() {
                        describe('currentTime', function() {
                            it('should take the start/end time into consideration', function() {
                                $interval.flush(250);
                                expect(iface.currentTime).toBe(0);

                                player.getCurrentTime.and.returnValue(10);
                                $interval.flush(250);
                                expect(iface.currentTime).toBe(5);

                                player.getCurrentTime.and.returnValue(15);
                                $interval.flush(250);
                                expect(iface.currentTime).toBe(10);
                            });
                        });
                    });
                });

                describe('if the currentTime is before the start time', function() {
                    var timeupdate;

                    beforeEach(function() {
                        timeupdate = jasmine.createSpy('timeupdate()');

                        iface.on('timeupdate', timeupdate);

                        player.getCurrentTime.and.returnValue(4);
                        $interval.flush(250);
                    });

                    it('should seek to the start time', function() {
                        expect(player.seekTo).toHaveBeenCalledWith(5);
                        player.seekTo.calls.reset();

                        $interval.flush(250);
                        expect(player.seekTo).toHaveBeenCalledWith(5);
                    });

                    it('should not emit any events', function() {
                        expect(timeupdate).not.toHaveBeenCalled();
                    });

                    describe('the interface', function() {
                        describe('currentTime', function() {
                            it('should never be below 0', function() {
                                expect(iface.currentTime).toBe(0);

                                player.getCurrentTime.and.returnValue(2);
                                $interval.flush(250);
                                expect(iface.currentTime).toBe(0);
                            });
                        });
                    });
                });

                describe('if the currentTime is/is after the end time', function() {
                    var ended, timeupdate;

                    beforeEach(function() {
                        ended = jasmine.createSpy('ended()');
                        timeupdate = jasmine.createSpy('timeupdate()');

                        iface.on('ended', ended)
                            .on('timeupdate', timeupdate);

                        player.getCurrentTime.and.returnValue(30);
                        $interval.flush(250);
                    });

                    it('should pause the video', function() {
                        expect(player.pauseVideo).toHaveBeenCalled();
                    });

                    it('should emit the "ended" event and set the state', function() {
                        expect(ended).toHaveBeenCalled();
                        expect(iface.ended).toBe(true);
                    });

                    it('should not emit the timeupdate event', function() {
                        expect(timeupdate).not.toHaveBeenCalled();
                    });

                    it('should not pause the video again', function() {
                        player.pauseVideo.calls.reset();
                        $interval.flush(250);

                        expect(player.pauseVideo).not.toHaveBeenCalled();
                    });

                    describe('the next time the video is played', function() {
                        beforeEach(function() {
                            player._trigger('onStateChange', {
                                data: youtube.PlayerState.PLAYING
                            });
                            $interval.flush(250);
                        });

                        it('should go back to the start', function() {
                            expect(player.seekTo).toHaveBeenCalledWith(5);
                        });
                    });

                    describe('the interface', function() {
                        describe('currentTime', function() {
                            it('should never be above the end time', function() {
                                expect(iface.currentTime).toBe(25);

                                player.getCurrentTime.and.returnValue(32);
                                $interval.flush(250);
                                expect(iface.currentTime).toBe(25);
                            });
                        });
                    });
                });
            });

            describe('when the player is destroyed', function() {
                var destroySpy;

                beforeEach(function() {
                    destroySpy = jasmine.createSpy('destroy');

                    spyOn(YouTubeDataService.videos, 'list').and.returnValue($q.defer().promise);

                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="gy1B3agGNxw"></youtube-player>')($scope);
                    });
                    $player.data('video').on('destroy', destroySpy);
                    player._trigger('onReady', {});

                    $player.remove();
                });

                it('should cancel the $interval', function() {
                    expect($interval.cancel).toHaveBeenCalledWith(interval);
                });

                it('should emit a destroy event', function() {
                    expect(destroySpy).toHaveBeenCalled();
                });
            });

            describe('player interface', function() {
                var video,
                    metaData, metaDataDeferred;

                beforeEach(function() {
                    metaDataDeferred = $q.defer();
                    metaData = {
                        contentDetails: {
                            duration: 30
                        },
                        status: {
                            embeddable: true
                        }
                    };

                    spyOn(YouTubeDataService.videos, 'list')
                        .and.returnValue(metaDataDeferred.promise);

                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="gy1B3agGNxw"></youtube-player>')($scope);
                    });
                    video = $player.data('video');
                });

                it('should be accessible via jqLite .data()', function() {
                    expect(video).toEqual(jasmine.any(Object));
                });

                it('should have an interface that is as identical to the HTML5 video interface as possible', function() {
                    expect(video).toEqual(jasmine.objectContaining({
                        currentTime: 0,
                        duration: 0,
                        ended: false,
                        paused: true,
                        readyState: -1,
                        seeking: false,
                        videoid: 'gy1B3agGNxw',
                        error: null
                    }));
                });

                describe('properties', function() {
                    describe('currentTime', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                        });

                        describe('getting', function() {
                            it('should be 0 initially', function() {
                                expect(video.currentTime).toBe(0);
                            });

                            it('should be the value of the youtube player\'s currentTime', function() {
                                player.getCurrentTime.and.returnValue(1);
                                $interval.flush(250);

                                expect(video.currentTime).toBe(1);

                                player.getCurrentTime.and.returnValue(20);
                                expect(video.currentTime).toBe(1);
                                $interval.flush(250);
                                expect(video.currentTime).toBe(20);
                            });
                        });

                        describe('setting', function() {
                            describe('if the player does not have metadata', function() {
                                it('should throw an error', function() {
                                    expect(function() {
                                        video.currentTime = 10;
                                    }).toThrow(new Error('Can\'t seek video. Haven\'t loaded metadata.'));
                                });
                            });

                            describe('when the player has metadata', function() {
                                beforeEach(function() {
                                    player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                                });

                                it('should seek the youtube player to the provided time', function() {
                                    video.currentTime = 5;
                                    expect(player.seekTo).toHaveBeenCalledWith(5);

                                    video.currentTime = 7;
                                    expect(player.seekTo).toHaveBeenCalledWith(7);

                                    video.currentTime = 2;
                                    expect(player.seekTo).toHaveBeenCalledWith(2);
                                });
                            });
                        });
                    });

                    describe('duration', function() {
                        describe('getting', function() {
                            it('should be initialized as 0', function() {
                                expect(video.duration).toBe(0);
                            });

                            describe('after the video data is loaded', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        metaDataDeferred.resolve(metaData);
                                    });
                                });

                                it('should be the duration from the metaData', function() {
                                    expect(video.duration).toBe(metaData.contentDetails.duration);
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.duration = 30;
                                }).toThrow();
                            });
                        });
                    });

                    describe('ended', function() {
                        describe('getting', function() {
                            it('should be false if the video has not ended', function() {
                                expect(video.ended).toBe(false);
                            });

                            it('should be true if the video has ended', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });

                                expect(video.ended).toBe(true);
                            });

                            it('should be false after the video plays again', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });
                                player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                                expect(video.ended).toBe(false);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.ended = true;
                                }).toThrow();
                            });
                        });
                    });

                    describe('paused', function() {
                        describe('getting', function() {
                            it('should initially be true', function() {
                                expect(video.paused).toBe(true);
                            });

                            it('should become false when the video plays', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                                expect(video.paused).toBe(false);
                            });

                            it('should become true when the video pauses', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                                player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });

                                expect(video.paused).toBe(true);
                            });

                            it('should be true when the video ends', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                                player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });

                                expect(video.paused).toBe(true);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.paused = true;
                                }).toThrow();
                            });
                        });
                    });

                    describe('readyState', function() {
                        describe('getting', function() {
                            it('should initally be -1', function() {
                                expect(video.readyState).toBe(-1);
                            });

                            it('should be 0 when the player is ready', function() {
                                player._trigger('onReady', {});

                                expect(video.readyState).toBe(0);
                            });

                            it('should be 1 after metadata is loaded', function() {
                                $scope.$apply(function() {
                                    metaDataDeferred.resolve(metaData);
                                });

                                expect(video.readyState).toBe(1);
                            });

                            it('should be 3 when the video starts playing', function() {
                                player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                                expect(video.readyState).toBe(3);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.readyState = 4;
                                }).toThrow();
                            });
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                        });

                        describe('getting', function() {
                            it('should be initialized as false', function() {
                                expect(video.seeking).toBe(false);
                            });

                            it('should be true when the currentTime is changed', function() {
                                video.currentTime = 25;

                                expect(video.seeking).toBe(true);
                            });

                            it('should go back to be false when seeking ends', function() {
                                player.getCurrentTime.and.returnValue(10);
                                $interval.flush(250);
                                video.currentTime = 25;

                                $interval.flush(250);
                                expect(video.seeking).toBe(true);

                                $interval.flush(250);
                                expect(video.seeking).toBe(true);

                                player.getCurrentTime.and.returnValue(26);
                                $interval.flush(250);
                                expect(video.seeking).toBe(false);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.seeking = true;
                                }).toThrow();
                            });
                        });
                    });

                    describe('videoid', function() {
                        describe('getting', function() {
                            it('should be the id of the youtube video', function() {
                                expect(video.videoid).toBe('gy1B3agGNxw');
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.videoid = 'foo';
                                }).toThrow();
                            });
                        });
                    });

                    describe('error', function() {
                        describe('getting', function() {
                            it('should be null', function() {
                                expect(video.error).toBeNull();
                            });

                            describe('if the video is not embeddable', function() {
                                beforeEach(function() {
                                    metaData.status.embeddable = false;

                                    $scope.$apply(function() {
                                        metaDataDeferred.resolve(metaData);
                                    });
                                });

                                it('should be an error', function() {
                                    expect(video.error).toEqual(jasmine.any(Error));
                                    expect(video.error.name).toBe('YouTubePlayerError');
                                    expect(video.error.code).toBe(403);
                                    expect(video.error.message).toBe('The video ' + $scope.id + ' is not embeddable.');
                                });
                            });

                            describe('if the video is not found', function() {
                                var error;

                                beforeEach(function() {
                                    error = {
                                        code: 404,
                                        message: 'The video was not found.'
                                    };

                                    $scope.$apply(function() {
                                        metaDataDeferred.reject(error);
                                    });
                                });

                                it('should be an error', function() {
                                    expect(video.error).toEqual(jasmine.any(Error));
                                    expect(video.error.name).toBe('YouTubePlayerError');
                                    expect(video.error.code).toBe(error.code);
                                    expect(video.error.message).toBe(error.message);
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.error = 'foo';
                                }).toThrow();
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('pause', function() {
                        it('should pause the player', function() {
                            video.pause();

                            expect(player.pauseVideo).toHaveBeenCalled();
                        });
                    });

                    describe('play', function() {
                        it('should play the player', function() {
                            video.play();

                            expect(player.playVideo).toHaveBeenCalled();
                        });
                    });

                    describe('reload()', function() {
                        var $origFrame, $frame,
                            oldPlayer;

                        beforeEach(function() {
                            oldPlayer = player;
                            $origFrame = $player.find('iframe');
                            player._trigger('onReady');
                            player.getCurrentTime.and.returnValue(20);
                            $interval.flush(250);
                            player._trigger('onStateChange', {
                                data: youtube.PlayerState.ENDED
                            });

                            $scope.$apply(function() {
                                video.reload();
                            });

                            $frame = $player.find('iframe');
                        });

                        it('should remove the old player', function() {
                            expect($origFrame.parent().length).toBe(0);
                        });

                        it('should create a new frame', function() {
                            expect($frame.attr('src')).toBe($origFrame.attr('src'));
                        });

                        it('should reset the state', function() {
                            expect(video.readyState).toBe(-1);
                            expect(video.currentTime).toBe(0);
                            expect(video.ended).toBe(false);
                        });

                        it('should create a new player', function() {
                            expect(player).not.toBe(oldPlayer);
                        });
                    });
                });

                describe('events', function() {
                    beforeEach(function() {
                        expect(player).toBeDefined();
                    });

                    describe('ready', function() {
                        it('should be emitted when the player is ready', function() {
                            var readySpy = jasmine.createSpy('ready');

                            video.on('ready', readySpy);

                            player._trigger('onReady', {});
                            expect(readySpy).toHaveBeenCalled();
                        });
                    });

                    describe('error', function() {
                        var errorSpy;

                        beforeEach(function() {
                            errorSpy = jasmine.createSpy('error');

                            video.on('error', errorSpy);
                        });

                        describe('if the video is embeddable', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    metaDataDeferred.resolve(metaData);
                                });
                            });

                            it('should not be called', function() {
                                expect(errorSpy).not.toHaveBeenCalled();
                            });
                        });

                        describe('if the video is not embeddable', function() {
                            beforeEach(function() {
                                metaData.status.embeddable = false;

                                $scope.$apply(function() {
                                    metaDataDeferred.resolve(metaData);
                                });
                            });

                            it('should be called if the video is not embeddable', function() {
                                expect(errorSpy).toHaveBeenCalledWith();
                            });
                        });

                        describe('if the video is not found', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    metaDataDeferred.reject({});
                                });
                            });

                            it('should be called', function() {
                                expect(errorSpy).toHaveBeenCalledWith();
                            });
                        });
                    });

                    describe('loadedmetadata', function() {
                        it('should be emitted when we request data from youtube', function() {
                            var metadataSpy = jasmine.createSpy('loadedmetadata');

                            video.on('loadedmetadata', metadataSpy);

                            $scope.$apply(function() {
                                metaDataDeferred.resolve(metaData);
                            });

                            expect(metadataSpy).toHaveBeenCalled();
                        });
                    });

                    describe('canplay', function() {
                        it('should be emitted the first time the video plays', function() {
                            var canplaySpy = jasmine.createSpy('canplay');

                            video.on('canplay', canplaySpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(canplaySpy).toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(canplaySpy.calls.count()).toBe(1);
                        });
                    });

                    describe('ended', function() {
                        it('should be emitted when the video ends', function() {
                            var endedSpy = jasmine.createSpy('ended');

                            video.on('ended', endedSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });

                            expect(endedSpy).toHaveBeenCalled();
                        });
                    });

                    describe('pause', function() {
                        it('should be emitted when the player is paused', function() {
                            var pauseSpy = jasmine.createSpy('pause');

                            video.on('pause', pauseSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });

                            expect(pauseSpy).toHaveBeenCalled();
                        });
                    });

                    describe('play', function() {
                        it('should be emitted after the video is resumed', function() {
                            var playSpy = jasmine.createSpy('play');

                            video.on('play', playSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(playSpy).not.toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                            expect(playSpy).toHaveBeenCalled();
                        });
                    });

                    describe('playing', function() {
                        it('should be emitted after the video plays, no matter what', function() {
                            var playingSpy = jasmine.createSpy('playing');

                            video.on('playing', playingSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(playingSpy).toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                            expect(playingSpy.calls.count()).toBe(2);
                        });
                    });

                    describe('seeked', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                        });

                        it('should be emitted after the video finishes seeking', function() {
                            var seekedSpy = jasmine.createSpy('seeked');

                            video.on('seeked', seekedSpy);

                            player.getCurrentTime.and.returnValue(1);
                            $interval.flush(250);
                            player.getCurrentTime.and.returnValue(1.25);
                            $interval.flush(250);
                            player.getCurrentTime.and.returnValue(1.5);
                            $interval.flush(250);

                            expect(seekedSpy).not.toHaveBeenCalled();

                            video.currentTime = 10;

                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();

                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();

                            player.getCurrentTime.and.returnValue(11);
                            $interval.flush(250);
                            expect(seekedSpy).toHaveBeenCalled();
                            seekedSpy.calls.reset();

                            player.getCurrentTime.and.returnValue(11.25);
                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                        });

                        it('should be emitted when the video is seeked', function() {
                            var seekingSpy = jasmine.createSpy('seeking');

                            video.on('seeking', seekingSpy);

                            video.currentTime = 25;
                            expect(seekingSpy).toHaveBeenCalled();
                        });
                    });

                    describe('timeupdate', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                        });

                        it('should be emitted every 250ms if the current time has changed', function() {
                            var timeupdate = jasmine.createSpy('timeupdate');

                            video.on('timeupdate', timeupdate);

                            player.getCurrentTime.and.returnValue(0);
                            $interval.flush(250);
                            expect(timeupdate).not.toHaveBeenCalled();

                            player.getCurrentTime.and.returnValue(1);
                            $interval.flush(250);
                            expect(timeupdate).toHaveBeenCalled();

                            $interval.flush(250);
                            expect(timeupdate.calls.count()).toBe(1);

                            player.getCurrentTime.and.returnValue(2);
                            $interval.flush(250);
                            expect(timeupdate.calls.count()).toBe(2);

                            player.getCurrentTime.and.returnValue(3);
                            $interval.flush(250);
                            expect(timeupdate.calls.count()).toBe(3);

                            $interval.flush(250);
                            expect(timeupdate.calls.count()).toBe(3);
                        });
                    });
                });
            });
        });
    });
}());
