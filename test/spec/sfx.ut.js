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
                    source = {
                        buffer: null,
                        connect: function(destination) {

                        },
                        start: jasmine.createSpy(),
                        stop: jasmine.createSpy('source stop'),
                        loop: false
                    };

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

                                this.destination = {};
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
                });

                describe('playSound method', function() {
                    it('should loop if configured to do so', function() {
                        c6Sfx.loadSounds(sounds);
                        c6Sfx.playSound('foo', { loop: true });

                        expect(source.loop).toBe(true);
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
            });

            describe('without web audio api', function() {
                var c6Sfx,
                    audioElementCreationSpy,
                    audioElementPlaySpy,
                    audioElementPauseSpy,
                    createdAudioPlayers = [],
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
            });

            describe('shared functionality', function() {
                var c6Sfx;

                beforeEach(function() {
                    inject(function(_c6Sfx_) {
                        c6Sfx = _c6Sfx_;
                    });
                });

                describe('error prevention', function() {
                    it('should do nothing (including throw errors) if the browser does not support the web audio api or audio tag)', function() {
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
            });
        });
    });
})();
