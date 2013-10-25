(function() {
    'use strict';

    define(['site/site'], function() {
        describe('site', function() {
            var site,
                _private,
                postMessage,
                session,
                requestPromise,
                requestPromiseSuccessHandler,
                $window,
                $timeout,
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

                module('c6.ui', function($provide) {
                    $provide.value('postMessage', postMessage);
                    $provide.value('$window', $window);
                    $provide.value('$compile', $compile);
                    $provide.value('$location', {
                        path: function() {
                            return path;
                        }
                    });
                });

                inject(function(_site_, _$rootScope_, _$httpBackend_, _$timeout_) {
                    site = _site_;
                    _private = _site_._private();
                    $rootScope = _$rootScope_;
                    $httpBackend = _$httpBackend_;
                    $timeout = _$timeout_;
                });

                $httpBackend.when('GET', 'middlefile.html').respond('<div>My Awesome HTML!</div>');
            });

            it('should exist', function() {
                expect(site).toBeDefined();
            });

            it('should start with ready false', function() {
                expect(site.ready).toBe(false);
            });

            describe('@public methods', function() {
                var initResult,
                    config;

                beforeEach(function() {
                    config = {};

                    spyOn(_private, 'listenForEvents');
                    spyOn(_private, 'pingPathChanges');

                    initResult = site.init(config);
                });

                describe('init(config)', function() {
                    var handshakeData;

                    beforeEach(function() {
                        handshakeData = {
                            success: true,
                            appData: {}
                        };
                    });

                    it('should create a session for the site window', function() {
                        expect(postMessage.createSession).toHaveBeenCalledWith($window.parent);
                    });

                    it('should keep a reference to the session', function() {
                        expect(_private.session).toBe(session);
                    });

                    it('should request a handshake from the site', function() {
                        expect(session.request).toHaveBeenCalledWith('handshake');
                    });

                    it('should return the session', function() {
                        expect(initResult).toBe(session);
                    });

                    it('should keep a reference to the config', function() {
                        expect(_private.options).toBe(config);
                    });

                    it('should create an options hash if no config is provided', function() {
                        site.init();

                        expect(_private.options).toBeDefined();
                    });

                    it('should listen for events', function() {
                        expect(_private.listenForEvents).toHaveBeenCalledWith(session);
                    });

                    it('should listen for $state changes if the configuration says so', function() {
                        expect(_private.pingPathChanges).not.toHaveBeenCalled();

                        site.init({
                            pingPathChanges: true
                        });

                        expect(_private.pingPathChanges).toHaveBeenCalled();
                    });

                    describe('when the site responds to the handshake', function() {
                        it('should set ready to true', function() {
                            requestPromiseSuccessHandler(handshakeData);

                            expect(site.ready).toBe(true);
                        });

                        it('should emit the ready event', function() {
                            spyOn(site, 'emit');

                            requestPromiseSuccessHandler(handshakeData);

                            expect(site.emit).toHaveBeenCalledWith('ready', true);
                        });

                        it('should resolve any pending getSession() deferred objects', function() {
                            _private.pendingGetSession = {
                                resolve: jasmine.createSpy('pending getSession() resolve')
                            };

                            requestPromiseSuccessHandler(handshakeData);

                            expect(_private.pendingGetSession.resolve).toHaveBeenCalledWith(_private.session);
                        });

                        it('should keep a reference to the appData', function() {
                            requestPromiseSuccessHandler(handshakeData);

                            expect(_private.appData).toBe(handshakeData.appData);
                        });

                        it('should resolve any pending getAppData() deferred objects', function() {
                            _private.pendingGetAppData = {
                                resolve: jasmine.createSpy('pending getAppData() resolve')
                            };

                            requestPromiseSuccessHandler(handshakeData);

                            expect(_private.pendingGetAppData.resolve).toHaveBeenCalledWith(handshakeData.appData);
                        });
                    });
                });

                describe('getSession()', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('getSession promise');
                    });

                    it('should return a promise', function() {
                        expect(typeof site.getSession().then).toBe('function');
                    });

                    it('should be resolved if the service is already ready', function() {
                        site.ready = true;

                        site.getSession().then(spy);

                        $rootScope.$digest();

                        expect(spy).toHaveBeenCalledWith(session);
                    });

                    it('should save the deferred object if the service is not ready', function() {
                        site.getSession().then(spy);

                        $rootScope.$digest();

                        expect(spy).not.toHaveBeenCalled();

                        expect(typeof _private.pendingGetSession.resolve).toBe('function');
                    });
                });

                describe('getAppData()', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('getSession promise');
                    });

                    it('should return a promise', function() {
                        expect(typeof site.getAppData().then).toBe('function');
                    });

                    it('should be resolved if the site already has the appData', function() {
                        _private.appData = {};

                        site.getAppData().then(spy);

                        $rootScope.$digest();

                        expect(spy).toHaveBeenCalledWith(_private.appData);
                    });

                    it('should save the deferred object if the appData isn\'t present', function() {
                        site.getAppData().then(spy);

                        $rootScope.$digest();

                        expect(spy).not.toHaveBeenCalled();

                        expect(typeof _private.pendingGetAppData.resolve).toBe('function');
                    });
                });

                describe('getSiteUrl()', function() {
                    it('should make a request to the site', function() {
                        site.getSiteUrl();
                        expect(session.request).toHaveBeenCalledWith('currentUrl');
                    });
                });

                describe('shareUrl(data)', function() {
                    it('should ping the site with any data passed in', function() {
                        var data = {};

                        site.shareUrl(data);

                        expect(session.ping).toHaveBeenCalledWith('shareUrl', data);
                    });
                });

                describe('requestTransitionState(toState)', function() {
                    var result;

                    beforeEach(function() {
                        result = site.requestTransitionState(true);
                    });

                    it('should return a promise', function() {
                        expect(typeof result.then).toBe('function');
                    });

                    it('should make a request to the site', function() {
                        expect(session.request).toHaveBeenCalledWith('transitionState', true);
                    });
                });

                describe('requestBar(show)', function() {
                    it('should ping the site with the show variable', function() {
                        site.requestBar(true);

                        expect(session.ping).toHaveBeenCalledWith('requestBar', true);

                        site.requestBar(false);

                        expect(session.ping).toHaveBeenCalledWith('requestBar', false);
                    });
                });

                describe('openExternalLink(url, target)', function() {
                    it('should ping the site with the url and target', function() {
                        var pingArgs;

                        site.openExternalLink('http://www.apple.com', '_blank');
                        pingArgs = session.ping.mostRecentCall.args;

                        expect(session.ping).toHaveBeenCalled();

                        expect(pingArgs[0]).toBe('openExternalLink');
                        expect(pingArgs[1].url).toBe('http://www.apple.com');
                        expect(pingArgs[1].target).toBe('_blank');
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

            describe('_private methods', function() {
                beforeEach(function() {
                    site.init();
                });

                describe('handlePathChange()', function() {
                    function newPath(thePath) {
                        path = thePath;

                        _private.handlePathChange.call($window);
                    }

                    it('should ping the site with the new path', function() {
                        newPath('/');

                        expect(session.ping).toHaveBeenCalledWith('pathChange', '/');

                        newPath('/test');

                        expect(session.ping).toHaveBeenCalledWith('pathChange', '/test');

                        newPath('/test/foo/');

                        expect(session.ping).toHaveBeenCalledWith('pathChange', '/test/foo/');
                    });

                    it('should not ping multiple times if the path does not change', function() {
                        newPath('/');

                        expect(session.ping.callCount).toBe(1);

                        newPath('/');

                        expect(session.ping.callCount).toBe(1);

                        newPath('/hello');

                        expect(session.ping.callCount).toBe(2);
                    });
                });

                describe('pingPathChanges()', function() {
                    it('should listen for the $locationChangeSuccess event', function() {
                        spyOn($rootScope, '$on');

                        _private.pingPathChanges();

                        expect($rootScope.$on).toHaveBeenCalledWith('$locationChangeSuccess', _private.handlePathChange);
                    });
                });

                describe('listenForEvents(session)', function() {
                    beforeEach(function() {
                        _private.listenForEvents(session);
                    });

                    it('should listen for the landingContent event', function() {
                        expect(session.on).toHaveBeenCalledWith('landingContent', _private.getLandingHTML);
                    });

                    it('should listen for the landingStylesheet event', function() {
                        expect(session.on).toHaveBeenCalledWith('landingStylesheet', _private.getLandingStylesheet);
                    });
                });

                describe('responding event handlers', function() {
                    var respondSpy;

                    beforeEach(function() {
                        respondSpy = jasmine.createSpy('respond spy');
                    });

                    describe('getLandingStylesheet(data, respond)', function() {
                        it('should respond with null if there is no landingStylesheet configured', function() {
                            _private.getLandingStylesheet(undefined, respondSpy);

                            expect(respondSpy).toHaveBeenCalledWith(null);
                        });

                        it('should respond with a url if one is provided', function() {
                            _private.options = {
                                landingContent: {
                                    stylesheetUrl: 'mycss.css'
                                }
                            };

                            _private.getLandingStylesheet(undefined, respondSpy);

                            expect(respondSpy).toHaveBeenCalledWith('mycss.css');
                        });
                    });

                    describe('getLandingHTML(section, respond)', function() {
                        it('should respond with null if there is no landingContent configured', function() {
                            _private.getLandingHTML('middle', respondSpy);

                            expect(respondSpy).toHaveBeenCalledWith(null);
                        });

                        describe('when a templateUrl is provided', function() {
                            beforeEach(function() {
                                _private.options = {
                                    landingContent: {
                                        middle: 'middlefile.html',
                                        right: 'rightfile.html',
                                        scope: {}
                                    }
                                };

                                _private.getLandingHTML('middle', respondSpy);
                            });

                            it('should not respond immediately', function() {
                                expect(respondSpy).not.toHaveBeenCalled();
                            });

                            it('should make a request to get the template', function() {
                                $httpBackend.expectGET('middlefile.html');
                                $httpBackend.flush();
                            });

                            describe('post-http process', function() {
                                beforeEach(function() {
                                    $httpBackend.flush();
                                });

                                it('should compile the html', function() {
                                    expect($compile).toHaveBeenCalledWith('<div>My Awesome HTML!</div>');
                                });

                                it('should link the template with the provided scope', function() {
                                    expect(linker).toHaveBeenCalledWith(_private.options.landingContent.scope);
                                });

                                it('should respond with the compiled html after the current $digest()', function() {
                                    expect(respondSpy).not.toHaveBeenCalled();

                                    $timeout.flush();

                                    expect(respondSpy).toHaveBeenCalledWith('<div>Compiled HTML</div>');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
})();
