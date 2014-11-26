(function() {
    'use strict';

    define(['videos/ext/rumble','jquery'], function(videosExtVimeo, $) {
        /* global angular:true */

        describe('RumblePlayerService', function() {
            var RumblePlayerService,
                $q,
                $rootScope;

            var $window;

            var $iframes,
                $iframe,
                iframe;

            function IFrame(src) {
                $iframe = angular.element('<iframe>');
                $iframe.attr('src', src);
                $('body').append($iframe);

                spyOn($iframe[0].contentWindow, 'postMessage');

                iframe = $iframe[0];
                $iframes.push($iframe);

                return $iframe;
            }

            beforeEach(function() {
                $iframes = [];

                module('ng', function($provide) {
                    $provide.value('$window', {
                        _handlers: {},
                        addEventListener: function(event, handler) {
                            var handlers = this._handlers[event] = this._handlers[event] || [];

                            handlers.push(handler);
                        },
                        trigger: function(event, data) {
                            var handlers = this._handlers[event] || [];

                            handlers.forEach(function(handler) {
                                handler(data);
                            });
                        },
                        navigator: window.navigator,
                        document: window.document
                    });
                });

                module(videosExtVimeo.name);

                inject(function($injector) {
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');

                    $window = $injector.get('$window');

                    RumblePlayerService = $injector.get('RumblePlayerService');
                });
            });

            afterEach(function() {
                $iframes.forEach(function($frame) {
                    $frame.remove();
                });
            });

            it('should exist', function() {
                expect(RumblePlayerService).toEqual(jasmine.any(Object));
            });

            it('should ignore messages not intended for it', function() {
                expect(function() {
                    $window.trigger('message', { origin: 'foo.com', data: null });
                }).not.toThrow();

                expect(function() {
                    $window.trigger('message', { origin: 'cinema6.com', data: 'test' });
                }).not.toThrow();
            });

            describe('properties', function() {
                describe('Player($iframe)', function() {
                    it('should add itself to the players hash', function() {
                        var rumble = new RumblePlayerService.Player(new IFrame('//rumble.com/embed/8.2ze9q/?api=1&player_id=rc-1&foo=bar'));

                        expect(RumblePlayerService.players['rc-1']).toBe(rumble);
                    });

                    it('should remove itself from the players hash when the iframe is removed', function() {
                        new RumblePlayerService.Player(new IFrame('//rumble.com/embed/8.2ze9q/?api=1&player_id=rc-1'));
                        $iframe.remove();

                        expect(RumblePlayerService.players['rc-1']).not.toBeDefined();
                    });

                    it('should throw an error if the iframe provided has no player_id', function() {
                        expect(function() {
                            new RumblePlayerService.Player(new IFrame('//rumble.com/embed/8.2ze9q/?api=1'));
                        }).toThrow(new Error('Provided iFrame has no player_id specified in the search params.'));
                    });

                    describe('event handling', function() {
                        var rumble,
                            emitCount = 1;

                        function isEven(number) {
                            var remainder = (number % 2);

                            return !!remainder;
                        }

                        function emit(event, data, id) {
                            $window.trigger('message', {
                                origin: 'http' + (isEven(emitCount++) ? 's' : '') + '://rumble.com',
                                data: JSON.stringify({
                                    player_id: id || 'rc-2',
                                    event: event,
                                    value: data
                                })
                            });
                        }

                        beforeEach(function() {
                            rumble = new RumblePlayerService.Player(new IFrame('//rumble.com/embed/8.2ze9q/?api=1&player_id=rc-2'));

                            spyOn(rumble, 'call').and.callThrough();
                        });

                        it('should call the "addEventListener" method when a non-c6EventEmitter or ready event listener is added', function() {
                            rumble.on('ready', function() {});
                            expect(rumble.call).not.toHaveBeenCalled();

                            rumble.on('removeListener');
                            expect(rumble.call).not.toHaveBeenCalled();

                            rumble.on('loadProgress', function() {});
                            expect(rumble.call).toHaveBeenCalledWith('addEventListener', 'loadProgress');

                            rumble.on('play', function() {});
                            expect(rumble.call).toHaveBeenCalledWith('addEventListener', 'play');
                        });

                        it('should emit events that come via postMessage', function() {
                            var ready = jasmine.createSpy('ready'),
                                play = jasmine.createSpy('play'),
                                playProgress = jasmine.createSpy('playProgress');

                            rumble.on('ready', ready)
                                .on('play', play)
                                .on('playProgress', playProgress);

                            expect(ready).not.toHaveBeenCalled();
                            expect(play).not.toHaveBeenCalled();
                            expect(playProgress).not.toHaveBeenCalled();

                            emit('ready', undefined, 'rc-5');
                            expect(ready).not.toHaveBeenCalled();

                            emit('ready');
                            expect(ready).toHaveBeenCalled();

                            emit('play', undefined, 'rc-8rh49f');
                            expect(play).not.toHaveBeenCalled();

                            emit('play');
                            expect(play).toHaveBeenCalled();

                            emit('playProgress', {
                                seconds: '4.308',
                                percent: '0.012',
                                duration: '359.000'
                            });
                            expect(playProgress).toHaveBeenCalledWith({
                                seconds: '4.308',
                                percent: '0.012',
                                duration: '359.000'
                            });
                        });
                    });

                    describe('methods', function() {
                        var rumble;

                        beforeEach(function() {
                            rumble = new RumblePlayerService.Player(new IFrame('//rumble.com/embed/8.2ze9q/?api=1&player_id=rc-1'));
                        });

                        describe('call(method, data)', function() {
                            describe('without data', function() {
                                it('should send a message to the iframe', function() {
                                    rumble.call('play');
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'play'
                                    }), '*');

                                    rumble.call('pause');
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'pause'
                                    }), '*');
                                });
                            });

                            describe('with data', function() {
                                it('should send a message to the iframe', function() {
                                    rumble.call('seekTo', 30);
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'seekTo',
                                        value: 30
                                    }), '*');
                                });
                            });

                            describe('methods that don\'t return a value', function() {
                                it('should return a promise that resolves to undefined', function() {
                                    var play = jasmine.createSpy('play'),
                                        pause = jasmine.createSpy('pause'),
                                        seekTo = jasmine.createSpy('seekTo'),
                                        unload = jasmine.createSpy('unload'),
                                        setColor = jasmine.createSpy('setColor'),
                                        setLoop = jasmine.createSpy('setLoop'),
                                        setVolume = jasmine.createSpy('setVolume');

                                    $rootScope.$apply(function() {
                                        rumble.call('play').then(play);
                                        rumble.call('pause').then(pause);
                                        rumble.call('seekTo').then(seekTo);
                                        rumble.call('unload').then(unload);
                                        rumble.call('setColor').then(setColor);
                                        rumble.call('setLoop').then(setLoop);
                                        rumble.call('setVolume').then(setVolume);
                                    });

                                    expect(play).toHaveBeenCalledWith(undefined);
                                    expect(pause).toHaveBeenCalledWith(undefined);
                                    expect(seekTo).toHaveBeenCalledWith(undefined);
                                    expect(unload).toHaveBeenCalledWith(undefined);
                                    expect(setColor).toHaveBeenCalledWith(undefined);
                                    expect(setLoop).toHaveBeenCalledWith(undefined);
                                    expect(setVolume).toHaveBeenCalledWith(undefined);
                                });
                            });

                            describe('methods that return a value', function() {
                                function postMessage(method, value, id) {
                                    $window.trigger('message', {
                                        origin: 'http://rumble.com',
                                        data: JSON.stringify({
                                            player_id: id || 'rc-1',
                                            method: method,
                                            value: value
                                        })
                                    });
                                }

                                it('should return a promise that resolves to the value of the response', function() {
                                    var paused = jasmine.createSpy('paused'),
                                        getCurrentTime = jasmine.createSpy('getCurrentTime'),
                                        getDuration = jasmine.createSpy('getDuration'),
                                        getVideoEmbedCode = jasmine.createSpy('getVideoEmbedCode'),
                                        getVideoHeight = jasmine.createSpy('getVideoHeight'),
                                        getVideoWidth = jasmine.createSpy('getVideoWidth'),
                                        getVideoUrl = jasmine.createSpy('getVideoUrl'),
                                        getColor = jasmine.createSpy('getColor'),
                                        getVolume = jasmine.createSpy('getVolume');

                                    $rootScope.$apply(function() {
                                        rumble.call('paused').then(paused);
                                        rumble.call('getCurrentTime').then(getCurrentTime);
                                        rumble.call('getDuration').then(getDuration);
                                        rumble.call('getVideoEmbedCode').then(getVideoEmbedCode);
                                        rumble.call('getVideoHeight').then(getVideoHeight);
                                        rumble.call('getVideoWidth').then(getVideoWidth);
                                        rumble.call('getVideoUrl').then(getVideoUrl);
                                        rumble.call('getColor').then(getColor);
                                        rumble.call('getVolume').then(getVolume);
                                    });

                                    postMessage('paused', false, '48yfh9');
                                    expect(paused).not.toHaveBeenCalled();

                                    postMessage('paused', false);
                                    expect(paused).toHaveBeenCalledWith(false);

                                    postMessage('getCurrentTime', 12.2, '489rhf439');
                                    expect(getCurrentTime).not.toHaveBeenCalled();

                                    postMessage('getCurrentTime', 10);
                                    expect(getCurrentTime).toHaveBeenCalledWith(10);

                                    postMessage('getDuration', 60);
                                    expect(getDuration).toHaveBeenCalledWith(60);

                                    postMessage('getVideoEmbedCode', 'f7438fh4');
                                    expect(getVideoEmbedCode).toHaveBeenCalledWith('f7438fh4');

                                    postMessage('getVideoHeight', 400, '4938h4');
                                    expect(getVideoHeight).not.toHaveBeenCalled();

                                    postMessage('getVideoHeight', 400);
                                    expect(getVideoHeight).toHaveBeenCalledWith(400);

                                    postMessage('getVideoWidth', 800);
                                    expect(getVideoWidth).toHaveBeenCalledWith(800);

                                    postMessage('getVideoUrl', 'http://foo.com/');
                                    expect(getVideoUrl).toHaveBeenCalledWith('http://foo.com/');

                                    postMessage('getColor', 'red');
                                    expect(getColor).toHaveBeenCalledWith('red');

                                    postMessage('getVolume', 0.75, 'rc-2');
                                    expect(getVolume).not.toHaveBeenCalled();

                                    postMessage('getVolume', 0);
                                    expect(getVolume).toHaveBeenCalledWith(0);
                                });

                                it('should reuse deferreds when possible', function() {
                                    var paused = jasmine.createSpy('paused'),
                                        paused2 = jasmine.createSpy('paused2'),
                                        promise = rumble.call('paused'),
                                        promise2 = rumble.call('paused');

                                    expect(promise).toBe(promise2);

                                    promise.then(paused);
                                    promise2.then(paused2);

                                    postMessage('paused', false);

                                    expect(paused).toHaveBeenCalledWith(false);
                                    expect(paused2).toHaveBeenCalledWith(false);

                                    paused.calls.reset();

                                    rumble.call('paused').then(paused);

                                    postMessage('paused', true);

                                    expect(paused).toHaveBeenCalledWith(true);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
