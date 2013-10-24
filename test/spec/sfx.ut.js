(function() {
    'use strict';

    define(['sfx/sfx'], function() {
        describe('c6AudioContext', function() {
            var audioContext,
                $window = {
                    AudioContext: undefined,
                    webkitAudioContext: undefined,
                    msAudioContext: undefined,
                    mozAudioContext: undefined,
                    reset: function() {
                        this.AudioContext = undefined;
                        this.webkitAudioContext = undefined;
                        this.msAudioContext = undefined;
                        this.mozAudioContext = undefined;
                    },
                    navigator: {
                        userAgent: 'PhantomJS'
                    }
                };

            beforeEach(function() {
                $window.reset();
                module('c6.ui');
                module(function($provide) {
                    $provide.value('$window', $window);
                });
            });

            it('should be undefined if there are no audio contexts', function() {
                inject(function(c6AudioContext) {
                    expect(c6AudioContext).toBeUndefined();
                });
            });

            it('should be defined if there is a prefix-free implementation', function() {
                $window.AudioContext = {};
                inject(function(c6AudioContext) {
                    expect(c6AudioContext).toBeDefined();
                });
            });

            it('should be defined if there is a webkit implementation', function() {
                $window.webkitAudioContext = {};
                inject(function(c6AudioContext) {
                    expect(c6AudioContext).toBeDefined();
                });
            });

            it('should be defined if there is a microsoft implementation', function() {
                $window.msAudioContext = {};
                inject(function(c6AudioContext) {
                    expect(c6AudioContext).toBeDefined();
                });
            });

            it('should be defined if there is a mozilla implementation', function() {
                $window.mozAudioContext = {};
                inject(function(c6AudioContext) {
                    expect(c6AudioContext).toBeDefined();
                });
            });
        });

        describe('c6Sfx', function() {
            var sounds = [
                {
                    name: 'foo',
                    src: 'test/foo.mp3'
                },
                {
                    name: 'test',
                    src: 'test/test.mp3'
                }
            ];

            beforeEach(function() {
                module('c6.ui');
            });

            it('should exist', function() {
                inject(function(c6Sfx) {
                    expect(c6Sfx).toBeDefined();
                });
            });

            describe('with web audio api', function() {
                var c6Sfx,
                    $httpBackend,
                    httpResponse = {},
                    context,
                    source,
                    gainNode;

                beforeEach(function() {
                    module('ngMock');
                    module(function($provide) {
                        $provide.value('$window', {
                            AudioContext: function() {
                                this.decodeAudioData = function(data, callback) {
                                    callback({

                                    });
                                };

                                this.createBufferSource = function() {
                                    return source;
                                };

                                this.createGain = function() {
                                    return gainNode;
                                };

                                this.destination = {};

                                context = this;
                            },
                            Audio: function() {
                                this.canPlayType = function(type) {
                                    switch(type) {
                                        case 'audio/mp3':
                                            return 'maybe';

                                        case 'audio/ogg':
                                            return 'probably';
                                    }
                                };
                            },
                            navigator: {
                                userAgent: 'PhantomJS'
                            }
                        });
                    });

                    source = {
                        buffer: null,
                        connect: jasmine.createSpy('source connect'),
                        start: jasmine.createSpy(),
                        stop: jasmine.createSpy('source stop'),
                        loop: false
                    };

                    gainNode = {
                        gain: {
                            value: 1
                        },
                        connect: jasmine.createSpy('gainNode connect')
                    };


                    inject(function(_$httpBackend_, _c6Sfx_) {
                        c6Sfx = _c6Sfx_;
                        $httpBackend = _$httpBackend_;
                    });
                    $httpBackend.when('GET', 'test/foo.mp3').respond(httpResponse);
                    $httpBackend.when('GET', 'test/test.mp3').respond(httpResponse);
                });

                describe('loadSounds method', function() {
                    beforeEach(function() {
                        $httpBackend.when('GET', 'test/moo.ogg').respond(httpResponse);
                        $httpBackend.when('GET', 'test/jason.ogg').respond(httpResponse);
                    });

                    it('should fetch sounds from the server', function() {
                        $httpBackend.expectGET('test/foo.mp3');
                        $httpBackend.expectGET('test/test.mp3');
                        c6Sfx.loadSounds(sounds);
                        $httpBackend.flush();
                    });

                    it('should set the sfx isLoaded flag to true when the loading is complete', function() {
                        c6Sfx.loadSounds(sounds);
                        expect(c6Sfx.getSoundByName('foo').isLoaded).toBe(false);
                        expect(c6Sfx.getSoundByName('test').isLoaded).toBe(false);

                        $httpBackend.flush();
                        expect(c6Sfx.getSoundByName('foo').isLoaded).toBe(true);
                        expect(c6Sfx.getSoundByName('test').isLoaded).toBe(true);
                    });

                    it('should choose the best extension if none is provided', function() {
                        $httpBackend.expectGET('test/moo.ogg');
                        $httpBackend.expectGET('test/jason.ogg');
                        c6Sfx.loadSounds([
                            {
                                name: 'moo',
                                src: 'test/moo'
                            },
                            {
                                name: 'jason',
                                src: 'test/jason'
                            }
                        ]);
                        $httpBackend.flush();
                    });

                    it('should return a promise', function() {
                        expect(typeof c6Sfx.loadSounds([{
                            name: 'moo',
                            src: 'test/moo'
                        }]).then).toBe('function');
                    });

                    it('should resolve its promise when all the sfx have loaded', function() {
                        var successSpy = jasmine.createSpy('promise success'),
                            promise = c6Sfx.loadSounds([{
                                name: 'moo',
                                src: 'test/moo'
                            },
                            {
                                name: 'jason',
                                src: 'test/jason'
                            }]).then(successSpy),
                            moo = c6Sfx.getSoundByName('moo'),
                            jason = c6Sfx.getSoundByName('jason'),
                            resolvedValues;

                        expect(successSpy).not.toHaveBeenCalled();

                        $httpBackend.flush();
                        resolvedValues = successSpy.mostRecentCall.args[0];

                        expect(successSpy).toHaveBeenCalled();
                        expect(resolvedValues[0]).toBe(moo);
                        expect(resolvedValues[1]).toBe(jason);
                    });
                });

                describe('playSound method', function() {
                    it('should loop if configured to do so', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo', { loop: true });

                        expect(source.loop).toBe(true);
                    });

                    it('should create a gain node and connect it', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo');
                        expect(source.connect).toHaveBeenCalledWith(gainNode);
                    });

                    it('should connect the gainNode to the destination', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo');
                        expect(gainNode.connect).toHaveBeenCalledWith(context.destination);
                    });

                    it('should set the gainNode\'s gain vaule to the currentVolume', function() {
                        var foo;

                        c6Sfx.loadSounds(sounds);
                        foo = c6Sfx.getSoundByName('foo');
                        foo.volume = 0.5;
                        foo.play();

                        expect(gainNode.gain.value).toBe(0.5);
                    });

                    it('should call start if the browser supports it', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo');

                        expect(source.start).toHaveBeenCalled();
                    });

                    it('should call noteOn if the browser doesnt support the start method', function() {
                        source.start = undefined;
                        source.noteOn = jasmine.createSpy();

                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('test');

                        expect(source.noteOn).toHaveBeenCalled();
                    });
                });

                describe('stopSound method', function() {
                    it('should call stop if the browser supports it', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo');
                        c6Sfx.stopSound('foo');

                        expect(source.stop).toHaveBeenCalledWith(0);
                    });

                    it('should call noteOff if the browser doesn\'t support the start method', function() {
                        source.stop = undefined;
                        source.noteOff = jasmine.createSpy('source noteOff');

                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo');
                        c6Sfx.stopSound('foo');

                        expect(source.noteOff).toHaveBeenCalledWith(0);
                    });
                });

                describe('SFX Object Methods', function() {
                    var sfx;

                    beforeEach(function() {
                        c6Sfx.loadSounds(sounds);
                        sfx = c6Sfx.getSoundByName('foo');
                    });

                    describe('setting the volume', function() {
                        it('should set the gain node\'s gain value to the volume', function() {
                            sfx.play();
                            sfx.volume = 0.5;

                            expect(gainNode.gain.value).toBe(0.5);
                        });
                    });
                });
            });

            describe('without web audio api', function() {
                var c6Sfx,
                    audioElementCreationSpy,
                    audioElementPlaySpy,
                    audioElementPauseSpy,
                    createdAudioPlayers = [],
                    audioEventListeners = {},
                    AudioContructor = function(src) {
                        audioElementCreationSpy(src);

                        this.canPlayType = function(type) {
                            switch(type) {
                                case 'audio/mp3':
                                    return 'probably';

                                case 'audio/ogg':
                                    return 'maybe';
                            }
                        };

                        this.play = function() {
                            audioElementPlaySpy();
                            this.paused = false;
                        };

                        this.pause = function() {
                            audioElementPauseSpy();
                            this.paused = true;
                        };

                        this.addEventListener = function(event, handler) {
                            if (!audioEventListeners[event]) {
                                audioEventListeners[event] = [];
                            }

                            audioEventListeners[event].push(handler);
                        };

                        this.removeEventListener = function(event, handler) {
                            var handlersArray = audioEventListeners[event];

                            handlersArray.splice(handlersArray.indexOf(handler), 1);
                        };

                        this.volume = 1;

                        createdAudioPlayers.push(this);
                    };

                AudioContructor.prototype.paused = true;
                AudioContructor.prototype.ended = false;
                AudioContructor.prototype.loop = false;

                beforeEach(function() {
                    module(function($provide) {
                        $provide.value('$window', {
                            Audio: AudioContructor,
                            navigator: {
                                userAgent: 'PhantomJS'
                            }
                        });
                    });
                    inject(function(_c6Sfx_) {
                        c6Sfx = _c6Sfx_;
                    });
                    audioElementCreationSpy = jasmine.createSpy();
                    audioElementPlaySpy = jasmine.createSpy();
                    audioElementPauseSpy = jasmine.createSpy();
                    createdAudioPlayers.length = 0;
                    audioEventListeners = {};
                });

                describe('loadSounds method', function() {
                    it('should create 3 Audio instances for each sound', function() {
                        c6Sfx.loadSounds(sounds);

                        expect(audioElementCreationSpy.callCount).toBe(6);
                    });

                    it('should choose the best extension if none is provided', function() {
                        c6Sfx.loadSounds([
                            {
                                name: 'greetings',
                                src: 'test/greetings.ogg'
                            },
                            {
                                name: 'earthling',
                                src: 'test/earthling'
                            }
                        ]);

                        expect(audioElementCreationSpy).toHaveBeenCalledWith('test/greetings.ogg');
                        expect(audioElementCreationSpy).toHaveBeenCalledWith('test/earthling.mp3');
                    });

                    it('should return a promise', function() {
                        var promise = c6Sfx.loadSounds([{
                            name: 'moo',
                            src: 'test/moo'
                        },
                        {
                            name: 'jason',
                            src: 'test/jason'
                        }]);

                        expect(typeof promise.then).toBe('function');
                    });
                });

                describe('stopSound method', function() {
                    it('should call the pause() method on any players that are still playing', function() {
                        c6Sfx.loadSounds([sounds[0]]);
                        c6Sfx.playSound('foo');
                        c6Sfx.playSound('foo');
                        c6Sfx.playSound('foo');

                        createdAudioPlayers.forEach(function(player) {
                            expect(player.paused).toBe(false);
                        });

                        c6Sfx.stopSound('foo');

                        createdAudioPlayers.forEach(function(player) {
                            expect(audioElementPauseSpy).toHaveBeenCalled();
                            expect(player.paused || player.ended).toBe(true);
                        });
                    });
                });

                describe('playSound method', function() {
                    it('should loop the sounds if configured', function() {
                        c6Sfx.loadSounds([sounds[0]]);

                        c6Sfx.playSound('foo', { loop: true });
                        expect(createdAudioPlayers[0].loop).toBe(true);

                        c6Sfx.playSound('foo', { loop: true });
                        expect(createdAudioPlayers[1].loop).toBe(true);
                    });

                    it('should set the correct volume before playing', function() {
                        var foo;

                        c6Sfx.loadSounds([sounds[0]]);
                        foo = c6Sfx.getSoundByName('foo');
                        foo.volume = 0.25;

                        foo.play();
                        foo.play();
                        foo.play();
                        foo.play();
                        foo.play();

                        createdAudioPlayers.forEach(function(player) {
                            expect(player.volume).toBe(0.25);
                        });
                    });

                    it('should reuse instances if they are available', function() {
                        function pausePlayer(player) {
                            player.paused = true;
                        }

                        c6Sfx.loadSounds([sounds[0]]);
                        expect(audioElementCreationSpy.callCount).toBe(3);

                        for (var i = 0; i < 15; i++) {
                            c6Sfx.playSound('foo');
                            createdAudioPlayers.forEach(pausePlayer);
                        }
                        expect(audioElementCreationSpy.callCount).toBe(3);
                        expect(audioElementPlaySpy.callCount).toBe(15);
                    });

                    it('should create new instances if the existing ones are busy', function() {
                        AudioContructor.prototype.paused = false;
                        c6Sfx.loadSounds([sounds[0]]);
                        expect(audioElementCreationSpy.callCount).toBe(3);

                        for (var i = 0; i < 15; i++) {
                            c6Sfx.playSound('foo');
                        }
                        expect(audioElementCreationSpy.callCount).toBe(18);
                        expect(audioElementPlaySpy.callCount).toBe(15);
                    });
                });

                describe('SFX Object Methods', function() {
                    var sfx;

                    beforeEach(function() {
                        c6Sfx.loadSounds([sounds[0]]);
                        sfx = c6Sfx.getSoundByName('foo');
                    });

                    describe('setting the volume', function() {
                        it('should set the volume on all of the audio players', function() {
                            createdAudioPlayers.forEach(function(player) {
                                expect(player.volume).toBe(1);
                            });

                            sfx.volume = 0.5;

                            createdAudioPlayers.forEach(function(player) {
                                expect(player.volume).toBe(0.5);
                            });
                        });
                    });

                    describe('load()', function() {
                        it('should return a promise', function() {
                            expect(typeof sfx.load().then).toBe('function');
                        });

                        it('should resolve the promise when the first audio element canPlayThrough', function() {
                            var promise,
                                promiseSpy = jasmine.createSpy('promise'),
                                handler;

                            audioEventListeners = {}; // Reset this and load again.
                            createdAudioPlayers.length = 0;

                            sfx.load().then(promiseSpy);

                            spyOn(createdAudioPlayers[0], 'removeEventListener').andCallThrough();

                            expect(audioEventListeners.canplaythrough.length).toBe(1);
                            handler = audioEventListeners.canplaythrough[0];
                            expect(promiseSpy).not.toHaveBeenCalled();

                            handler.call(createdAudioPlayers[0], { target: createdAudioPlayers[0] });

                            expect(promiseSpy).toHaveBeenCalledWith(sfx);
                            expect(sfx.isLoaded).toBe(true);
                            expect(createdAudioPlayers[0].removeEventListener).toHaveBeenCalledWith('canplaythrough', handler, false);
                            expect(audioEventListeners.canplaythrough.length).toBe(0);
                        });
                    });
                });
            });

            describe('shared functionality', function() {
                var c6Sfx,
                    time = 159851,
                    $window,
                    $rootScope;

                beforeEach(function() {
                    jasmine.Clock.useMock();

                    $window = {
                        Audio: function() {
                            this.addEventListener = angular.noop;
                        },
                        Date: function() {
                            this.getTime = function() {
                                return time;
                            };
                        },
                        navigator: window.navigator
                    };

                    module(function($provide) {
                        $provide.value('$window', $window);
                        // Using jasmine's mock clock instead of angular\'s
                        $provide.value('$timeout', jasmine.createSpy('$timeout').andCallFake(function(callback, time, apply) {
                            window.setTimeout(callback, time);
                        }));
                    });
                    inject(function(_c6Sfx_, _$rootScope_) {
                        c6Sfx = _c6Sfx_;
                        $rootScope = _$rootScope_;
                    });
                });

                describe('error prevention', function() {
                    it('should do nothing (including throw errors) if the browser does not support the web audio api or audio tag)', function() {
                        $window.Audio = undefined;

                        expect(function() { c6Sfx.loadSounds(sounds); }).not.toThrow();
                        expect(function() { c6Sfx.playSound('foo'); }).not.toThrow();
                    });
                });

                describe('getSoundByName method', function() {
                    it('should find a sound with the name that was passed in', function() {
                        // Load a couple of sounds
                        c6Sfx.loadSounds([
                            {
                                name: 'hello',
                                src: 'test/hello.mp3'
                            },
                            {
                                name: 'world',
                                src: 'test/world.mp3'
                            }
                        ]);

                        expect(c6Sfx.getSoundByName('hello').name).toBe('hello');
                        expect(c6Sfx.getSoundByName('world').name).toBe('world');
                    });
                });

                describe('getSounds method', function() {
                    it('should return an array of sfx objects', function() {
                        var sounds;

                        c6Sfx.loadSounds([
                            {
                                name: 'foo',
                                src: 'foo.mp3'
                            },
                            {
                                name: 'test',
                                src: 'test.mp3'
                            }
                        ]);

                        sounds = c6Sfx.getSounds();

                        expect(sounds[0]).toBe(c6Sfx.getSoundByName('foo'));
                        expect(sounds[1]).toBe(c6Sfx.getSoundByName('test'));
                    });
                });

                describe('fadeInSound(name, time)/fadeSoundOut(name, time)', function() {
                    var sfx;

                    beforeEach(function() {
                        c6Sfx.loadSounds([{
                            name: 'foo',
                            src: 'foo.mp3'
                        }]);
                        sfx = c6Sfx.getSoundByName('foo');
                        spyOn(sfx, 'setVolumeToValueOverTime').andCallThrough();
                        spyOn(sfx, 'play');
                        spyOn(sfx, 'stop');
                    });

                    describe('fadeInSound(name, time)', function() {
                        var result;

                        beforeEach(function() {
                            result = c6Sfx.fadeInSound('foo', 500);
                        });

                        it('should return a promise', function() {
                            expect(typeof result.then).toBe('function');
                        });

                        it('should set the volume to 0', function() {
                            expect(sfx.volume).toBe(0);
                        });

                        it('should play the sound', function() {
                            expect(sfx.play).toHaveBeenCalled();
                        });

                        it('should fade in the volume', function() {
                            expect(sfx.setVolumeToValueOverTime).toHaveBeenCalledWith(1, 500);
                        });
                    });

                    describe('fadeOutSound(name, time)', function() {
                        var result,
                            promiseHandler,
                            fakePromise = {
                                then: function(handler) {
                                    promiseHandler = handler;
                                }
                            };

                        beforeEach(function() {
                            result = c6Sfx.fadeOutSound('foo', 500);
                        });

                        it('should return a promise', function() {
                            expect(typeof result.then).toBe('function');
                        });

                        it('should fade out the volume', function() {
                            expect(sfx.setVolumeToValueOverTime).toHaveBeenCalledWith(0, 500);
                        });

                        it('should stop the sound when the sound has faded out', function() {
                            sfx.setVolumeToValueOverTime.andReturn(fakePromise);
                            c6Sfx.fadeOutSound('foo', 500);

                            expect(promiseHandler()).toBe(sfx);
                            expect(sfx.stop).toHaveBeenCalled();
                        });
                    });
                });

                describe('SFX Object Methods', function() {
                    var sfx;

                    beforeEach(function() {
                        c6Sfx.loadSounds([{
                            name: 'foo',
                            src: 'hello.mp3'
                        }]);
                        sfx = c6Sfx.getSoundByName('foo');
                    });

                    describe('getting the volume', function() {
                        it('should remember the volume you set', function() {
                            expect(sfx.volume).toBe(1);

                            sfx.volume = 0.25;
                            expect(sfx.volume).toBe(0.25);
                        });
                    });

                    describe('setVolumeToValueOverTime(volume, time)', function() {
                        it('should return a promise', function() {
                            expect(typeof sfx.setVolumeToValueOverTime(0, 1000).then).toBe('function');
                        });

                        it('should ramp linearly to the given volume over the specified amount of ms and resolve the promise when done', function() {
                            var elapsedTime = 0,
                                promise,
                                promiseSpy = jasmine.createSpy('promise');

                            sfx.volume = 1;
                            sfx.setVolumeToValueOverTime(0.5, 1000).then(promiseSpy);

                            for (var total = 501, i = 0; i < total; i++) {
                                time += 2;
                                elapsedTime += 2;
                                jasmine.Clock.tick(2);

                                if (elapsedTime === 250) {
                                    expect(sfx.volume).toBe(0.875);
                                } else if (elapsedTime === 500) {
                                    expect(sfx.volume).toBe(0.75);
                                } else if (elapsedTime === 750) {
                                    expect(sfx.volume).toBe(0.625);
                                } else if (elapsedTime === 1000) {
                                    expect(sfx.volume).toBe(0.5);
                                }
                            }

                            sfx.setVolumeToValueOverTime(1, 1000).then(promiseSpy);

                            for (total = 501, i = 0; i < total; i++) {
                                time += 2;
                                elapsedTime += 2;
                                jasmine.Clock.tick(2);

                                if (elapsedTime === 1253) {
                                    expect(sfx.volume).toBe(0.625);
                                } else if (elapsedTime === 1503) {
                                    expect(sfx.volume).toBe(0.75);
                                } else if (elapsedTime === 1753) {
                                    expect(sfx.volume).toBe(0.875);
                                } else if (elapsedTime === 2003) {
                                    expect(sfx.volume).toBe(1);
                                }
                            }

                            expect(promiseSpy.callCount).toBe(2);
                        });
                    });
                });
            });
        });
    });
})();
