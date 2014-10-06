define(['cinema6/cinema6'], function(cinema6Cinema6) {
    'use strict';

    describe('cinema6', function() {
        var cinema6,
            _private,
            postMessage,
            session,
            requestPromise,
            requestPromiseSuccessHandler,
            $window,
            $timeout,
            $q,
            $rootScope,
            $httpBackend,
            $compile,
            linker,
            path;

        beforeEach(function() {
            linker = jasmine.createSpy('linker').andReturn(angular.element('<div>Compiled HTML</div>'));

            $compile = jasmine.createSpy('$compile').andReturn(linker);

            requestPromise = {
                then: function(handler) {
                    requestPromiseSuccessHandler = handler;
                }
            };

            session = {
                request: jasmine.createSpy('session request').andReturn(requestPromise),
                ping: jasmine.createSpy('session ping'),
                on: jasmine.createSpy('session on')
            };

            $window = {
                parent: {

                }
            };

            postMessage = {
                createSession: jasmine.createSpy('createSession').andReturn(session)
            };

            module(cinema6Cinema6.name, function($provide) {
                $provide.value('postMessage', postMessage);
                $provide.value('$window', $window);
                $provide.value('$compile', $compile);
                $provide.value('$location', {
                    path: function() {
                        return path;
                    }
                });
            });

            inject(function(_cinema6_, _$rootScope_, _$httpBackend_, _$timeout_, _$q_) {
                cinema6 = _cinema6_;
                _private = _cinema6_._private();
                $rootScope = _$rootScope_;
                $httpBackend = _$httpBackend_;
                $timeout = _$timeout_;
                $q = _$q_;
            });

            $httpBackend.when('GET', 'middlefile.html').respond('<div>My Awesome HTML!</div>');
        });

        it('should exist', function() {
            expect(cinema6).toBeDefined();
        });

        it('should start with ready false', function() {
            expect(cinema6.ready).toBe(false);
        });

        describe('@public methods', function() {
            describe('init(config)', function() {
                var initResult,
                    config,
                    handshakeData;

                beforeEach(function() {
                    config = {};
                    initResult = cinema6.init(config);
                    handshakeData = {
                        success: true,
                        appData: {}
                    };
                });

                it('should create a session for the cinema6 window', function() {
                    expect(postMessage.createSession).toHaveBeenCalledWith($window.parent);
                });

                it('should request a handshake from cinema6', function() {
                    expect(session.request).toHaveBeenCalledWith('handshake');
                });

                it('should return the session', function() {
                    expect(initResult).toBe(session);
                });

                it('should keep a reference to the config', function() {
                    expect(_private.options).toBe(config);
                });

                it('should create an options hash if no config is provided', function() {
                    cinema6.init();

                    expect(_private.options).toBeDefined();
                });

                describe('when cinema6 responds to the handshake', function() {
                    var initConfig,
                        setupHandler;

                    describe('if a setup method is configured', function() {
                        describe('if the setup method doesn\'t return a promise', function() {
                            beforeEach(function() {
                                initConfig = {
                                    setup: jasmine.createSpy('cinema6 setup (no promise)').andReturn(true)
                                };

                                cinema6.init(initConfig);
                                requestPromiseSuccessHandler(handshakeData);
                            });

                            it('should call the setup method with the appData', function() {
                                expect(initConfig.setup).toHaveBeenCalledWith(handshakeData.appData);
                            });
                        });

                        describe('if the setup method returns a promise', function() {
                            var sessionSpy;

                            beforeEach(function() {
                                spyOn(cinema6, 'emit');
                                sessionSpy = jasmine.createSpy('session spy');

                                _private.session.promise.then(sessionSpy);

                                initConfig = {
                                    setup: jasmine.createSpy('cinema6 setup (promise)').andReturn({
                                        then: function(handler) {
                                            setupHandler = handler;
                                        }
                                    })
                                };

                                cinema6.init(initConfig);
                                requestPromiseSuccessHandler(handshakeData);
                            });

                            it('should not complete the setup', function() {
                                expect(cinema6.ready).toBe(false);
                                expect(cinema6.emit).not.toHaveBeenCalledWith('ready', true);
                                expect(session.ping).not.toHaveBeenCalledWith('ready', true);
                                expect(sessionSpy).not.toHaveBeenCalledWith(session);
                            });

                            it('should complete the setup when the promise resolves', function() {
                                $rootScope.$apply(setupHandler);

                                expect(cinema6.ready).toBe(true);
                                expect(cinema6.emit).toHaveBeenCalledWith('ready', true);
                                expect(session.ping).toHaveBeenCalledWith('ready', true);
                                expect(sessionSpy).toHaveBeenCalledWith(session);
                            });
                        });
                    });

                    it('should set ready to true', function() {
                        requestPromiseSuccessHandler(handshakeData);

                        expect(cinema6.ready).toBe(true);
                    });

                    it('should emit the ready event', function() {
                        spyOn(cinema6, 'emit');

                        requestPromiseSuccessHandler(handshakeData);

                        expect(cinema6.emit).toHaveBeenCalledWith('ready', true);
                    });

                    it('should send a ping to tell cinema6 it is ready', function() {
                        requestPromiseSuccessHandler(handshakeData);

                        expect(session.ping).toHaveBeenCalledWith('ready', true);
                    });

                    it('should resolve the appData promise', function() {
                        var spy = jasmine.createSpy('appData promise spy');

                        _private.appData.promise.then(spy);

                        $rootScope.$apply(function() {
                            requestPromiseSuccessHandler(handshakeData);
                        });

                        expect(spy).toHaveBeenCalledWith(handshakeData.appData);
                    });
                });
            });

            describe('getSession()', function() {
                it('should return the session promise', function() {
                    expect(cinema6.getSession()).toBe(_private.session.promise);
                });
            });

            describe('getAppData()', function() {
                it('should return the appData promise', function() {
                    expect(cinema6.getAppData()).toBe(_private.appData.promise);
                });
            });

            describe('shareUrl(data)', function() {
                var data;

                beforeEach(function() {
                    data = {};

                    $rootScope.$apply(function() {
                        _private.session.resolve(session);
                    });

                    $rootScope.$apply(function() {
                        cinema6.shareUrl(data);
                    });
                });

                it('should ping cinema6 with any data passed in', function() {
                    expect(session.ping).toHaveBeenCalledWith('shareUrl', data);
                });
            });

            describe('fullscreen(bool)', function() {
                function fullscreen(bool) {
                    $rootScope.$apply(function() {
                        cinema6.fullscreen(bool);
                    });
                }

                beforeEach(function() {
                    $rootScope.$apply(function() {
                        _private.session.resolve(session);
                    });
                });

                it('should ping cinema6 with a boolean form of the provided value', function() {
                    fullscreen({});
                    expect(session.ping).toHaveBeenCalledWith('fullscreenMode', true);

                    fullscreen();
                    expect(session.ping).toHaveBeenCalledWith('fullscreenMode', false);

                    fullscreen(true);
                    expect(session.ping).toHaveBeenCalledWith('fullscreenMode', true);

                    fullscreen(false);
                    expect(session.ping).toHaveBeenCalledWith('fullscreenMode', false);
                });
            });

            describe('getUser()', function() {
                var promise;

                beforeEach(function() {
                    promise = $q.defer().promise;

                    session.request.andReturn(promise);

                    $rootScope.$apply(function() {
                        _private.session.resolve(session);
                    });
                });

                it('should send a request to cinema6 for the current user', function() {
                    $rootScope.$apply(function() {
                        expect(cinema6.getUser().then).toEqual(jasmine.any(Function));
                    });
                    expect(session.request).toHaveBeenCalledWith('getCurrentUser');
                });
            });
        });

        describe('@private methods', function() {
            describe('_private()', function() {
                it('should return a reference to the private variables', function() {
                    expect(_private).toBeDefined();
                });
            });
        });

        describe('@private properties', function() {
            describe('session', function() {
                it('should be a deferred object', function() {
                    expect(angular.isFunction(_private.session.resolve)).toBe(true);
                });
            });

            describe('appData', function() {
                it('should be a deferred object', function() {
                    expect(angular.isFunction(_private.appData.resolve)).toBe(true);
                });
            });
        });
    });
});
