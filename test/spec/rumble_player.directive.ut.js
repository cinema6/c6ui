(function() {
    'use strict';

    define(['videos/ext/rumble'], function(videosExtRumble) {
        describe('<rumble-player>', function() {
            var $rootScope,
                $scope,
                c6EventEmitter,
                $compile,
                $q,
                c6BrowserInfo;

            var RumblePlayerService,
                players,
                player;

            var $rumble,
                initSpy;

            beforeEach(function() {
                players = [];

                module(videosExtRumble.name, function($provide) {
                    $provide.value('RumblePlayerService', {
                        Player: jasmine.createSpy('RumblePlayerService.Player')
                            .and.callFake(function($iframe) {
                                var ready = false;

                                expect($iframe[0].tagName).toBe('IFRAME');
                                expect($iframe.attr('src')).not.toBe('{{url}}');

                                this.call = jasmine.createSpy('player.call()')
                                    .and.returnValue($q.defer().promise);

                                c6EventEmitter(this);

                                this.on('ready', function() {
                                    ready = true;
                                });

                                this.on('newListener', function(event) {
                                    if (event.search(
                                        /^(newListener|ready)$/
                                    ) < 0 && !ready) {
                                        throw new Error('Can\'t add and event listener: ' + event + ' before the player is ready.');
                                    }
                                });

                                player = this;
                            })
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $q = $injector.get('$q');
                    c6BrowserInfo = $injector.get('c6BrowserInfo');

                    RumblePlayerService = $injector.get('RumblePlayerService');

                    $scope = $rootScope.$new();
                });
            });

            describe('with a start/end time', function() {
                var iface;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $rumble = $compile('<rumble-player id="rc-2" videoid="12345" start="15" end="30"></rumble-player>')($scope);
                    });
                    player.emit('ready');
                    iface = $rumble.data('video');
                });

                describe('interface', function() {
                    describe('duration', function() {
                        beforeEach(function() {
                            player.call.and.returnValue($q.when(60));
                            $scope.$apply(function() {
                                player.emit('ready');
                            });
                        });

                        it('should be the end time - the start time', function() {
                            expect(iface.duration).toBe(15);
                        });
                    });

                    describe('currentTime', function() {
                        describe('setting', function() {
                            describe('below 0', function() {
                                beforeEach(function() {
                                    iface.currentTime = -3;
                                });

                                it('should seek to the start time', function() {
                                    expect(player.call).toHaveBeenCalledWith('seekTo', 15);
                                });
                            });

                            describe('between 0 and the duration', function() {
                                beforeEach(function() {
                                    iface.currentTime = 7;
                                });

                                it('should take the start time into account', function() {
                                    expect(player.call).toHaveBeenCalledWith('seekTo', 22);
                                });
                            });

                            describe('above the duration', function() {
                                beforeEach(function() {
                                    iface.currentTime = 20;
                                });

                                it('should seek to the end time', function() {
                                    expect(player.call).toHaveBeenCalledWith('seekTo', 30);
                                });
                            });
                        });
                    });
                });

                describe('if the currentTime is in-between the start and end times', function() {
                    it('should not seek or pause', function() {
                        [15, 17, 19, 20, 22, 25, 27, 29.999].forEach(function(time) {
                            player.call.calls.reset();
                            player.emit('playProgress', {
                                seconds: time.toString()
                            });
                            expect(player.call).not.toHaveBeenCalled();
                        });
                    });

                    describe('interface', function() {
                        describe('currentTime', function() {
                            it('should subtract the set start time', function() {
                                player.emit('playProgress', {
                                    seconds: '15'
                                });
                                expect(iface.currentTime).toBe(0);

                                player.emit('playProgress', {
                                    seconds: '16'
                                });
                                expect(iface.currentTime).toBe(1);

                                player.emit('playProgress', {
                                    seconds: '19'
                                });
                                expect(iface.currentTime).toBe(4);
                            });
                        });
                    });
                });

                describe('if the currentTime is less than the start time', function() {
                    var timeupdate;

                    beforeEach(function() {
                        timeupdate = jasmine.createSpy('timeupdate');

                        iface.on('timeupdate', timeupdate);

                        player.emit('playProgress', {
                            seconds: '0.99'
                        });
                    });

                    it('should seek to the start time', function() {
                        expect(player.call).toHaveBeenCalledWith('seekTo', 15);

                        player.call.calls.reset();
                        player.emit('playProgress', {
                            seconds: '3.22'
                        });
                        expect(player.call).toHaveBeenCalledWith('seekTo', 15);
                    });

                    it('should not emit "timeupdate"', function() {
                        expect(timeupdate).not.toHaveBeenCalled();
                    });

                    describe('interface', function() {
                        describe('currentTime', function() {
                            beforeEach(function() {
                                player.emit('playProgress', {
                                    seconds: '20'
                                });
                            });

                            it('should be 0', function() {
                                player.emit('playProgress', {
                                    seconds: '5'
                                });
                                expect(iface.currentTime).toBe(0);

                                player.emit('playProgress', {
                                    seconds: '14.9'
                                });
                                expect(iface.currentTime).toBe(0);
                            });
                        });
                    });
                });

                describe('if the currentTime is greater than or equal to the end time', function() {
                    var ended, timeupdate;

                    beforeEach(function() {
                        ended = jasmine.createSpy('ended()');
                        timeupdate = jasmine.createSpy('timeupdate()');

                        iface.on('ended', ended)
                            .on('timeupdate', timeupdate);

                        player.emit('playProgress', {
                            seconds: '30.14'
                        });
                    });

                    it('should pause the player', function() {
                        expect(player.call).toHaveBeenCalledWith('pause');
                    });

                    describe('the interface', function() {
                        it('should emit "ended"', function() {
                            expect(ended).toHaveBeenCalled();
                        });

                        it('should not emit timeupdate', function() {
                            expect(timeupdate).not.toHaveBeenCalled();
                        });

                        describe('ended', function() {
                            it('should be true', function() {
                                expect(iface.ended).toBe(true);
                            });
                        });

                        describe('currentTime', function() {
                            it('should be the duration', function() {
                                expect(iface.currentTime).toBe(15);
                            });
                        });
                    });

                    describe('the next time the video is played', function() {
                        beforeEach(function() {
                            player.emit('play');
                        });

                        it('should seek to the start time', function() {
                            expect(player.call).toHaveBeenCalledWith('seekTo', 15);
                        });
                    });
                });
            });

            describe('initialization', function() {
                var initSpy;

                beforeEach(function() {
                    initSpy = jasmine.createSpy('<rumble-player>:init');

                    $rootScope.$on('<rumble-player>:init', initSpy);
                    $scope.$apply(function() {
                        $rumble = $compile('<rumble-player id="rc-1" videoid="abc123"></rumble-player>')($scope);
                    });
                });

                it('should emit an event on initialization', function() {
                    expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object), $rumble.data('video'));
                });

                it('should create a rumble iframe', function() {
                    var $iframe = $rumble.find('iframe');

                    expect($iframe.length).toBe(1);
                    expect($iframe.attr('src')).toBe('//rumble.com/embed/abc123/?api=1&player_id=rc-1');
                });

                describe('after the video is ready', function() {
                    beforeEach(function() {
                        player.emit('ready');
                    });

                    it('should not autoplay the video', function() {
                        expect(player.call).not.toHaveBeenCalledWith('play');
                    });

                    describe('if the "autoplay" attribute is present', function() {
                        beforeEach(function() {
                            expect(c6BrowserInfo.profile.autoplay).toBeDefined();
                            $scope.$apply(function() {
                                $rumble = $compile('<rumble-player id="rc-2" videoid="abc1234" autoplay></rumble-player>')($scope);
                            });
                        });

                        describe('if the browser can autoplay', function() {
                            beforeEach(function() {
                                c6BrowserInfo.profile.autoplay = true;
                                player.emit('ready');
                            });

                            it('should autoplay the video', function() {
                                expect(player.call).toHaveBeenCalledWith('play');
                            });
                        });

                        describe('if the browser can\'t autoplay', function() {
                            beforeEach(function() {
                                c6BrowserInfo.profile.autoplay = false;
                                player.emit('ready');
                            });

                            it('should autoplay the video', function() {
                                expect(player.call).not.toHaveBeenCalledWith('play');
                            });
                        });
                    });
                });
            });

            describe('video interface', function() {
                var video;

                beforeEach(function() {
                    $scope.id = 'abc123';

                    $scope.$apply(function() {
                        $rumble = $compile('<rumble-player id="foo" videoid="{{id}}"></rumble-player>')($scope);
                    });
                    video = $rumble.data('video');
                });

                it('should be accessible via jqLite .data()', function() {
                    expect(video).toEqual(jasmine.any(Object));
                });

                it('should support changing the video', function() {
                    player.emit('ready');
                    player.emit('loadProgress', {
                        percent: '0.75'
                    });
                    player.emit('play');
                    player.emit('playProgress', {
                        seconds: '30'
                    });
                    player.emit('finish');

                    $scope.$apply(function() {
                        $scope.id = '12345';
                    });
                    expect(video.buffered).toBe(0);
                    expect(video.currentTime).toBe(0);
                    expect(video.ended).toBe(false);
                    expect(video.paused).toBe(true);
                    expect(video.readyState).toBe(-1);

                    player.emit('ready');
                    expect(player.listeners('loadProgress').length).toBe(3);
                    expect(player.listeners('finish').length).toBe(1);
                    expect(player.listeners('pause').length).toBe(1);
                    expect(player.listeners('play').length).toBe(1);
                    expect(player.listeners('seek').length).toBe(1);
                    expect(player.listeners('playProgress').length).toBe(1);
                });

                describe('events', function() {
                    describe('ready', function() {
                        it('should be emitted when the player is ready', function() {
                            var ready = jasmine.createSpy('ready');

                            video.on('ready', ready);
                            expect(ready).not.toHaveBeenCalled();

                            player.emit('ready');
                            expect(ready).toHaveBeenCalled();
                        });
                    });

                    describe('canplay', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted the first time the "loadProgress" event is emitted', function() {
                            var canplay = jasmine.createSpy('canplay');

                            video.on('canplay', canplay);

                            player.emit('loadProgress', {});
                            expect(canplay).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(canplay.calls.count()).toBe(1);
                        });
                    });

                    describe('canplaythrough', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted after the video buffers 25%', function() {
                            var canplaythrough = jasmine.createSpy('canplaythrough');

                            function loadProgress(percent) {
                                player.emit('loadProgress', {
                                    percent: percent.toString()
                                });
                            }

                            video.on('canplaythrough', canplaythrough);

                            loadProgress(0.01);
                            loadProgress(0.1);
                            loadProgress(0.15);
                            loadProgress(0.2);
                            expect(canplaythrough).not.toHaveBeenCalled();

                            loadProgress(0.3);
                            expect(canplaythrough).toHaveBeenCalled();

                            loadProgress(0.5);
                            expect(canplaythrough.calls.count()).toBe(1);
                        });
                    });

                    describe('ended', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted when the player is finished', function() {
                            var ended = jasmine.createSpy('ended');

                            video.on('ended', ended);

                            player.emit('finish');
                            expect(ended).toHaveBeenCalled();
                        });
                    });

                    describe('loadedmetadata', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted when the player gets the duration', function() {
                            var loadedmetadata = jasmine.createSpy('loadedmetadata'),
                                deferred = $q.defer();

                            video.on('loadedmetadata', loadedmetadata);
                            player.call.and.returnValue(deferred.promise);

                            player.emit('ready');
                            expect(loadedmetadata).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                deferred.resolve(3);
                            });
                            expect(loadedmetadata).toHaveBeenCalled();
                        });
                    });

                    describe('loadstart', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted once on the first "loadProgress" event', function() {
                            var loadstart = jasmine.createSpy('loadstart');

                            video.on('loadstart', loadstart);

                            player.emit('loadProgress', {});
                            expect(loadstart).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(loadstart.calls.count()).toBe(1);
                        });
                    });

                    describe('pause', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted on every "pause" event', function() {
                            var pause = jasmine.createSpy('pause');

                            video.on('pause', pause);

                            player.emit('pause');
                            expect(pause).toHaveBeenCalled();

                            player.emit('pause');
                            expect(pause.calls.count()).toBe(2);
                        });
                    });

                    describe('play', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted on every play', function() {
                            var play = jasmine.createSpy('play');

                            video.on('play', play);

                            player.emit('play');
                            expect(play).toHaveBeenCalled();

                            player.emit('play');
                            expect(play.calls.count()).toBe(2);
                        });
                    });

                    describe('progress', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted for every "loadProgress" event', function() {
                            var progress = jasmine.createSpy('progress');

                            video.on('progress', progress);

                            player.emit('loadProgress', {});
                            expect(progress).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(progress.calls.count()).toBe(2);
                        });
                    });

                    describe('seeked', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted when the video finishes seeking', function() {
                            var seeked = jasmine.createSpy('seeked');

                            video.on('seeked', seeked);

                            player.emit('seek', {});
                            expect(seeked).toHaveBeenCalled();

                            player.emit('seek', {});
                            expect(seeked.calls.count()).toBe(2);
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted when the video starts seeking', function() {
                            var seeking = jasmine.createSpy('seeking');

                            video.on('seeking', seeking);

                            video.currentTime = 15;
                            expect(seeking).toHaveBeenCalled();

                            video.currentTime = 30;
                            expect(seeking.calls.count()).toBe(2);
                        });
                    });

                    describe('timeupdate', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        it('should be emitted on every "playProgress" event', function() {
                            var timeupdate = jasmine.createSpy('timeupdate');

                            video.on('timeupdate', timeupdate);

                            player.emit('playProgress', {});
                            expect(timeupdate).toHaveBeenCalled();

                            player.emit('playProgress', {});
                            expect(timeupdate.calls.count()).toBe(2);
                        });
                    });
                });

                describe('properties', function() {
                    describe('buffered', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        function loadProgress(percent) {
                            player.emit('loadProgress', {
                                percent: percent.toString()
                            });
                        }

                        describe('getting', function() {
                            it('should be the percent of the video that is buffered', function() {
                                expect(video.buffered).toBe(0);

                                loadProgress(0.2);
                                expect(video.buffered).toBe(0.2);

                                loadProgress(0.35);
                                expect(video.buffered).toBe(0.35);

                                loadProgress(0.6);
                                expect(video.buffered).toBe(0.6);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.buffered = 0.5;
                                }).toThrow();
                            });
                        });
                    });

                    describe('currentTime', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        function playProgress(time) {
                            player.emit('playProgress', {
                                seconds: time.toString()
                            });
                        }

                        describe('getting', function() {
                            it('should be the most recent time for the video', function() {
                                expect(video.currentTime).toBe(0);

                                playProgress(4);
                                expect(video.currentTime).toBe(4);

                                playProgress(6.4);
                                expect(video.currentTime).toBe(6.4);

                                playProgress(100.2);
                                expect(video.currentTime).toBe(100.2);
                            });
                        });

                        describe('setting', function() {
                            it('should seek the player to the provided time', function() {
                                video.currentTime = 15;
                                expect(player.call).toHaveBeenCalledWith('seekTo', 15);

                                video.currentTime = 20.2;
                                expect(player.call).toHaveBeenCalledWith('seekTo', 20.2);

                                video.currentTime = 35;
                                expect(player.call).toHaveBeenCalledWith('seekTo', 35);
                            });
                        });
                    });

                    describe('duration', function() {
                        describe('getting', function() {
                            var deferred;

                            beforeEach(function() {
                                deferred = $q.defer();

                                player.call.and.returnValue(deferred.promise);

                                player.emit('ready');
                            });

                            it('should be the result of a getDuration call', function() {
                                expect(player.call).toHaveBeenCalledWith('getDuration');

                                expect(video.duration).toBe(0);

                                $scope.$apply(function() {
                                    deferred.resolve(60);
                                });

                                expect(video.duration).toBe(60);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.duration = 10;
                                }).toThrow();
                            });
                        });
                    });

                    describe('ended', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        describe('getting', function() {
                            it('should be true when the video has ended, and be false when it plays again', function() {
                                expect(video.ended).toBe(false);

                                player.emit('finish');
                                expect(video.ended).toBe(true);

                                player.emit('play');
                                expect(video.ended).toBe(false);

                                player.emit('finish');
                                expect(video.ended).toBe(true);
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
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        describe('getting', function() {
                            it('should be true when the video is paused', function() {
                                expect(video.paused).toBe(true);

                                player.emit('play');
                                expect(video.paused).toBe(false);

                                player.emit('pause');
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
                            it('should start as -1', function() {
                                expect(video.readyState).toBe(-1);
                            });

                            it('should be 0 when the player is ready', function() {
                                player.emit('ready');

                                expect(video.readyState).toBe(0);
                            });

                            it('should be 1 when the duration is fetched', function() {
                                var deferred = $q.defer();

                                player.call.and.returnValue(deferred.promise);
                                player.emit('ready');
                                $scope.$apply(function() {
                                    deferred.resolve(45);
                                });

                                expect(video.readyState).toBe(1);
                            });

                            it('should be 3 on the first loadProgress event', function() {
                                player.emit('ready');
                                player.emit('loadProgress', {});

                                expect(video.readyState).toBe(3);
                            });

                            it('should be 4 when the video is 25% buffered', function() {
                                function loadProgress(percent) {
                                    player.emit('loadProgress', {
                                        percent: percent.toString()
                                    });
                                }

                                player.emit('ready');

                                loadProgress(0.1);
                                loadProgress(0.2);
                                loadProgress(0.24);
                                expect(video.readyState).not.toBe(4);
                                loadProgress(0.25);
                                expect(video.readyState).toBe(4);
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.readyState = 5;
                                }).toThrow();
                            });
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            player.emit('ready');
                        });

                        describe('getting', function() {
                            it('should be true when a seek is in progress', function() {
                                expect(video.seeking).toBe(false);

                                video.currentTime = 10;
                                expect(video.seeking).toBe(true);

                                player.emit('seek', {});
                                expect(video.seeking).toBe(false);

                                video.currentTime = 20;
                                expect(video.seeking).toBe(true);

                                player.emit('seek');
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

                    describe('error', function() {
                        describe('getting', function() {
                            it('should be null', function() {
                                expect(video.error).toBeNull();
                            });
                        });

                        describe('setting', function() {
                            it('should throw an error', function() {
                                expect(function() {
                                    video.error = 'sdfh942';
                                }).toThrow();
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('pause', function() {
                        it('should pause the player', function() {
                            video.pause();

                            expect(player.call).toHaveBeenCalledWith('pause');
                        });
                    });

                    describe('play', function() {
                        it('should play the player', function() {
                            video.play();

                            expect(player.call).toHaveBeenCalledWith('play');
                        });
                    });

                    describe('load', function() {
                        it('should exist', function() {
                            expect(function() {
                                video.load();
                            }).not.toThrow();
                        });
                    });

                    describe('reload()', function() {
                        var setAttribute,
                            src;

                        beforeEach(function() {
                            src = $rumble.find('iframe').attr('src');

                            player.emit('ready');
                            player.emit('playProgress', {
                                seconds: '4'
                            });
                            player.emit('finish');

                            spyOn(player, 'removeAllListeners').and.callThrough();

                            setAttribute = spyOn($rumble.find('iframe')[0], 'setAttribute').and.callThrough();

                            video.reload();
                        });

                        it('should reset the state', function() {
                            expect(video.readyState).toBe(-1);
                            expect(video.currentTime).toBe(0);
                            expect(video.ended).toBe(false);
                        });

                        it('should remove all the listeners', function() {
                            [
                                'loadProgress',
                                'finish',
                                'pause',
                                'play',
                                'seek',
                                'playProgress'
                            ].forEach(function(event) {
                                expect(player.removeAllListeners).toHaveBeenCalledWith(event);
                            });
                        });

                        it('should reload the iframe', function() {
                            expect(setAttribute).toHaveBeenCalledWith('src', src);
                        });
                    });

                    describe('minimize()', function() {
                        it('should return an error', function() {
                            expect(video.minimize()).toEqual(jasmine.any(Error));
                        });
                    });
                });
            });
        });
    });
}());
