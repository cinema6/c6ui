define(['videos/ext/dailymotion'], function(videosExtDailymotion) {
    'use strict';

    describe('<dailymotion-player> in a browser that supports mp4s with HTML5 video', function() {
        var $window,
            $rootScope,
            $compile,
            $httpBackend,
            c6VideoService,
            $scope,
            $dailymotionPlayer, $iframe;

        beforeEach(function() {
            module(videosExtDailymotion.name);

            inject(function($injector) {
                $window = $injector.get('$window');
                addEventListener = $window.addEventListener;
                spyOn($window, 'addEventListener');
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                c6VideoService = $injector.get('c6VideoService');
                $httpBackend = $injector.get('$httpBackend');

                $scope = $rootScope.$new();
                $httpBackend.whenGET('https://api.dailymotion.com/video/foo?fields=duration')
                    .respond(404, 'Not found.');
                spyOn(c6VideoService, 'bestFormat').and.returnValue('video/mp4');
                $scope.$apply(function() {
                    $dailymotionPlayer = $compile('<dailymotion-player id="player2" videoid="foo" controls></dailymotion-player>')($scope);
                });
                $iframe = $dailymotionPlayer.find('iframe');
            });
        });

        afterEach(function() {
            $window.addEventListener = addEventListener;
        });

        it('should add the html5 param to the iframe src', function() {
            expect(c6VideoService.bestFormat).toHaveBeenCalledWith(['video/mp4']);
            expect($iframe.attr('src')).toBe('//www.dailymotion.com/embed/video/foo?api=postMessage&id=player2&related=0&chromeless=0&html');
        });
    });

    describe('<dailymotion-player>', function() {
        var $window,
            $rootScope,
            $compile,
            DailymotionPlayerService,
            $httpBackend,
            c6VideoService,
            c6BrowserInfo,
            $scope, scope,
            $dailymotionPlayer, $iframe,
            player,
            addEventListener;

        var initSpy;

        beforeEach(function() {
            initSpy = jasmine.createSpy('<dailymotion-player>:init');

            module(videosExtDailymotion.name);
            module(function($provide) {
                $provide.decorator('DailymotionPlayerService', function($delegate) {
                    var Player = $delegate.Player;

                    $delegate.Player = jasmine.createSpy('DailymotionPlayerService.Player')
                        .and.callFake(function($iframe) {
                            return (player = new Player($iframe));
                        });

                    return $delegate;
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $window = $injector.get('$window');
                addEventListener = $window.addEventListener;
                spyOn($window, 'addEventListener');
                $compile = $injector.get('$compile');
                DailymotionPlayerService = $injector.get('DailymotionPlayerService');
                $httpBackend = $injector.get('$httpBackend');
                c6VideoService = $injector.get('c6VideoService');
                c6BrowserInfo = $injector.get('c6BrowserInfo');

                $rootScope.$on('<dailymotion-player>:init', initSpy);

                $scope = $rootScope.$new();
                $scope.videoid = 'abc';
                $httpBackend.expectGET('https://api.dailymotion.com/video/' + $scope.videoid + '?fields=duration')
                    .respond(200, { duration: 199 });
                spyOn(c6VideoService, 'bestFormat').and.returnValue();
                $scope.$apply(function() {
                    $dailymotionPlayer = $compile('<dailymotion-player id="player" videoid="{{videoid}}" controls></dailymotion-player>')($scope);
                });
                $iframe = $dailymotionPlayer.find('iframe');
                scope = $dailymotionPlayer.isolateScope();
                spyOn(player, 'call');
            });
        });

        afterEach(function() {
            $window.addEventListener = addEventListener;
        });

        it('should $emit an event with the player interface', function() {
            expect(initSpy).toHaveBeenCalledWith(jasmine.any(Object), $dailymotionPlayer.data('video'));
        });

        describe('if the autoplay attribute is present', function() {
            beforeEach(function() {
                expect(c6BrowserInfo.profile.autoplay).toBeDefined();
                $httpBackend.expectGET('https://api.dailymotion.com/video/' + $scope.videoid + '?fields=duration')
                    .respond(200, { duration: 199 });
                $scope.$apply(function() {
                    $dailymotionPlayer = $compile('<dailymotion-player id="player2" videoid="{{videoid}}" autoplay></dailymotion-player>')($scope);
                });
                spyOn(player, 'call');
            });

            describe('after the player is ready', function() {
                describe('if the device can autoplay', function() {
                    beforeEach(function() {
                        c6BrowserInfo.profile.autoplay = true;
                        player.emit('apiready', {});
                    });

                    it('should play', function() {
                        expect(player.call).toHaveBeenCalledWith('play');
                    });
                });

                describe('if the device can\'t autoplay', function() {
                    beforeEach(function() {
                        c6BrowserInfo.profile.autoplay = false;
                        player.emit('apiready', {});
                    });

                    it('should not play', function() {
                        expect(player.call).not.toHaveBeenCalledWith('play');
                    });
                });
            });
        });

        describe('if the controls attribute is not present', function() {
            beforeEach(function() {
                $httpBackend.expectGET('https://api.dailymotion.com/video/' + $scope.videoid + '?fields=duration')
                    .respond(200, { duration: 199 });
                $scope.$apply(function() {
                    $dailymotionPlayer = $compile('<dailymotion-player id="player" videoid="{{videoid}}"></dailymotion-player>')($scope);
                });
                $iframe = $dailymotionPlayer.find('iframe');
            });

            it('should enable the chromeless param', function() {
                expect($iframe.attr('src')).toBe('//www.dailymotion.com/embed/video/abc?api=postMessage&id=player&related=0&chromeless=1');
            });
        });

        describe('$watchers', function() {
            describe('videoid', function() {
                it('should set the src of the iframe', function() {
                    expect($iframe.attr('src')).toBe('//www.dailymotion.com/embed/video/abc?api=postMessage&id=player&related=0&chromeless=0');
                });

                it('should create a new DailymotionPlayerService.Player', function() {
                    expect(DailymotionPlayerService.Player).toHaveBeenCalled();
                    expect(DailymotionPlayerService.Player.calls.mostRecent().args[0][0]).toBe($iframe[0]);
                });

                describe('when the player is ready', function() {
                    beforeEach(function() {
                        player.emit('apiready');
                    });

                    it('should not play the video', function() {
                        expect(player.call).not.toHaveBeenCalledWith('play');
                    });
                });

                it('should fetch the duration via the data API', function() {
                    $httpBackend.flush();
                });

                describe('when the id changes', function() {
                    beforeEach(function() {
                        DailymotionPlayerService.Player.calls.reset();
                        $httpBackend.expectGET('https://api.dailymotion.com/video/123?fields=duration')
                            .respond(200, { duration: 51 });
                        $scope.$apply(function() {
                            $scope.videoid = '123';
                        });
                    });

                    it('should update the src', function() {
                        expect($iframe.attr('src')).toBe('//www.dailymotion.com/embed/video/123?api=postMessage&id=player&related=0&chromeless=0');
                    });

                    it('should fetch the new duration via the data API', function() {
                        $httpBackend.flush();
                    });

                    it('should not create another player', function() {
                        expect(DailymotionPlayerService.Player).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe('player interface', function() {
            var iface;

            beforeEach(function() {
                iface = $dailymotionPlayer.data('video');
            });

            it('should exist', function() {
                expect(iface).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('currentTime', function() {
                    describe('getting', function() {
                        it('should update as the player emits the timeupdate event', function() {
                            expect(iface.currentTime).toBe(0);

                            player.emit('timeupdate', {
                                time: 2
                            });
                            expect(iface.currentTime).toBe(2);

                            player.emit('timeupdate', {
                                time: 4
                            });
                            expect(iface.currentTime).toBe(4);
                        });
                    });

                    describe('setting', function() {
                        it('should call seek on the player', function() {
                            iface.currentTime = 3;
                            expect(player.call).toHaveBeenCalledWith('seek', 3);

                            iface.currentTime = 5;
                            expect(player.call).toHaveBeenCalledWith('seek', 5);
                        });
                    });
                });

                describe('duration', function() {
                    describe('getting', function() {
                        it('should start as 0', function() {
                            expect(iface.duration).toBe(0);
                        });

                        describe('when the metadata is fetched', function() {
                            beforeEach(function() {
                                $httpBackend.flush();
                            });

                            it('should update with the fetched duration', function() {
                                expect(iface.duration).toBe(199);
                            });
                        });

                        describe('when the player changes the duration', function() {
                            beforeEach(function() {
                                player.emit('durationchange', {
                                    duration: 199.3
                                });
                            });

                            it('should update', function() {
                                expect(iface.duration).toBe(199.3);
                            });
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.duration = 30;
                            }).toThrow();
                        });
                    });
                });

                describe('ended', function() {
                    describe('getting', function() {
                        it('should start as false', function() {
                            expect(iface.ended).toBe(false);
                        });

                        describe('when the player emits "ended"', function() {
                            beforeEach(function() {
                                player.emit('ended', {});
                            });

                            it('should be true', function() {
                                expect(iface.ended).toBe(true);
                            });

                            describe('when the video starts playing again', function() {
                                beforeEach(function() {
                                    player.emit('playing', {});
                                });

                                it('should become false again', function() {
                                    expect(iface.ended).toBe(false);
                                });
                            });
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.ended = true;
                            }).toThrow();
                        });
                    });
                });

                describe('error', function() {
                    describe('getting', function() {
                        it('should be null', function() {
                            expect(iface.error).toBeNull();
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.error = new Error();
                            }).toThrow();
                        });
                    });
                });

                describe('paused', function() {
                    describe('getting', function() {
                        it('should start as true', function() {
                            expect(iface.paused).toBe(true);
                        });

                        describe('when the "playing" event is emitted', function() {
                            beforeEach(function() {
                                player.emit('playing', {});
                            });

                            it('should be false', function() {
                                expect(iface.paused).toBe(false);
                            });

                            describe('when the "pause" event is emitted', function() {
                                beforeEach(function() {
                                    player.emit('pause');
                                });

                                it('should be true', function() {
                                    expect(iface.paused).toBe(true);
                                });
                            });
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.error = new Error();
                            }).toThrow();
                        });
                    });
                });

                describe('readyState', function() {
                    describe('getting', function() {
                        it('should start as -1', function() {
                            expect(iface.readyState).toBe(-1);
                        });

                        describe('when the "apiready" event is emitted', function() {
                            beforeEach(function() {
                                player.emit('apiready', {});
                            });

                            it('should be 0', function() {
                                expect(iface.readyState).toBe(0);
                            });
                        });

                        describe('when the duration is fetched', function() {
                            beforeEach(function() {
                                $httpBackend.flush();
                            });

                            it('should be 1', function() {
                                expect(iface.readyState).toBe(1);
                            });
                        });

                        describe('when the video starts to play', function() {
                            beforeEach(function() {
                                player.emit('playing', {});
                            });

                            it('should be 3', function() {
                                expect(iface.readyState).toBe(3);
                            });
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.readyState = 4;
                            }).toThrow();
                        });
                    });
                });

                describe('seeking', function() {
                    describe('getting', function() {
                        it('should start as false', function() {
                            expect(iface.seeking).toBe(false);
                        });

                        describe('when the "seeking" event is emitted', function() {
                            beforeEach(function() {
                                player.emit('seeking', {
                                    time: 12
                                });
                            });

                            it('should be true', function() {
                                expect(iface.seeking).toBe(true);
                            });

                            describe('when the "seeked" event is emitted', function() {
                                beforeEach(function() {
                                    player.emit('seeked', {
                                        time: 12
                                    });
                                });

                                it('should be false', function() {
                                    expect(iface.seeking).toBe(false);
                                });
                            });
                        });
                    });

                    describe('setting', function() {
                        it('should throw an error', function() {
                            expect(function() {
                                iface.seeking = true;
                            }).toThrow();
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('pause()', function() {
                    var result;

                    describe('if the player hasn\'t started playing', function() {
                        it('should return an error', function() {
                            expect(iface.pause()).toEqual(jasmine.any(Error));
                        });
                    });

                    describe('if the player has started playing', function() {
                        beforeEach(function() {
                            player.emit('playing', {});

                            result = iface.pause();
                        });

                        it('should not return an error', function() {
                            expect(result).not.toEqual(jasmine.any(Error));
                        });

                        it('should call pause on the player', function() {
                            expect(player.call).toHaveBeenCalledWith('pause');
                        });
                    });

                    describe('if the player is reloaded', function() {
                        beforeEach(function() {
                            player.emit('playing', {});
                            iface.reload();
                        });

                        it('should reset keeping track of the video playing', function() {
                            expect(iface.pause()).toEqual(jasmine.any(Error));
                        });
                    });

                    describe('if the player is playing and then pauses', function() {
                        beforeEach(function() {
                            player.emit('playing', {});
                            player.emit('pause', {});

                            result = iface.pause();
                        });

                        it('should not return an error', function() {
                            expect(result).not.toEqual(jasmine.any(Error));
                        });

                        it('should call pause on the player', function() {
                            expect(player.call).toHaveBeenCalledWith('pause');
                        });
                    });
                });

                describe('play()', function() {
                    beforeEach(function() {
                        iface.play();
                    });

                    it('should call the play method on the player', function() {
                        expect(player.call).toHaveBeenCalledWith('play');
                    });
                });

                describe('load', function() {
                    it('should exist', function() {
                        expect(function() {
                            iface.load();
                        }).not.toThrow();
                    });
                });

                describe('reload()', function() {
                    var setAttribute,
                        src;

                    beforeEach(function() {
                        src = $iframe.attr('src');

                        player.emit('apiready', {});
                        player.emit('timeupdate', {
                            time: 20
                        });
                        player.emit('ended', {});

                        setAttribute = spyOn($iframe[0], 'setAttribute').and.callThrough();

                        iface.reload();
                    });

                    it('should reset the state', function() {
                        expect(iface.readyState).toBe(-1);
                        expect(iface.currentTime).toBe(0);
                        expect(iface.ended).toBe(false);
                    });

                    it('should reload the iframe', function() {
                        expect(setAttribute).toHaveBeenCalledWith('src', src);
                    });
                });

                describe('minimize()', function() {
                    it('should return an error', function() {
                        expect(iface.minimize()).toEqual(jasmine.any(Error));
                    });
                });
            });

            describe('events', function() {
                var eventSpy;

                beforeEach(function() {
                    eventSpy = jasmine.createSpy('eventSpy');
                });

                describe('ready', function() {
                    beforeEach(function() {
                        iface.on('ready', eventSpy);
                        player.emit('apiready', {});
                    });

                    it('should be emitted when the player emits "apiready"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('ended', function() {
                    beforeEach(function() {
                        iface.on('ended', eventSpy);
                        player.emit('ended', {});
                    });

                    it('should be emitted when the player emits "ended"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('play', function() {
                    beforeEach(function() {
                        iface.on('play', eventSpy);
                        player.emit('playing', {});
                    });

                    it('should be emitted when the player emits "playing"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('durationchange', function() {
                    beforeEach(function() {
                        iface.on('durationchange', eventSpy);
                    });

                    describe('when the metadata is fetched', function() {
                        beforeEach(function() {
                            $httpBackend.flush();
                        });

                        it('should be emitted', function() {
                            expect(eventSpy).toHaveBeenCalledWith();
                        });

                        describe('when the player emits "durationchange"', function() {
                            beforeEach(function() {
                                eventSpy.calls.reset();
                            });

                            describe('if the duration is the same', function() {
                                beforeEach(function() {
                                    player.emit('durationchange', {
                                        duration: iface.duration
                                    });
                                });

                                it('should not be emitted', function() {
                                    expect(eventSpy).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the duration is different', function() {
                                beforeEach(function() {
                                    player.emit('durationchange', {
                                        duration: iface.duration + 0.5
                                    });
                                });

                                it('should be emitted', function() {
                                    expect(eventSpy).toHaveBeenCalledWith();
                                });
                            });
                        });
                    });
                });

                describe('loadedmetadata', function() {
                    beforeEach(function() {
                        iface.on('loadedmetadata', eventSpy);
                        $httpBackend.flush();
                    });

                    it('should be emitted when the duration is fetched', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('timeupdate', function() {
                    beforeEach(function() {
                        iface.on('timeupdate', eventSpy);
                        player.emit('timeupdate', {
                            time: 2
                        });
                    });

                    it('should be emitted when the player emits "timeupdate"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('seeking', function() {
                    beforeEach(function() {
                        iface.on('seeking', eventSpy);
                        player.emit('seeking', {
                            time: 40
                        });
                    });

                    it('should be emitted when the player emits "seeking"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('seeked', function() {
                    beforeEach(function() {
                        iface.on('seeked', eventSpy);
                        player.emit('seeked', {
                            time: 40
                        });
                    });

                    it('should be emitted when the player emits "seeked"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('canplay', function() {
                    beforeEach(function() {
                        iface.on('canplay', eventSpy);
                        player.emit('playing', {});
                    });

                    it('should be emitted when the player emits "playing"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });

                describe('pause', function() {
                    beforeEach(function() {
                        iface.on('pause', eventSpy);
                        player.emit('pause', {});
                    });

                    it('should be emitted when the player emits "pause"', function() {
                        expect(eventSpy).toHaveBeenCalledWith();
                    });
                });
            });
        });
    });
});
