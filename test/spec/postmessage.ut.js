(function() {
    /*jshint camelcase:false */
    'use strict';

    define(['postmessage/postmessage'], function() {
        describe('postMessage', function() {
            var postMessage,
                _private,
                $window,
                $timeout;

            beforeEach(function() {
                $window = {
                    addEventListener: jasmine.createSpy('window addEventListener()')
                };

                module('c6.ui', function($provide) {
                    $provide.value('$window', $window);
                });

                inject(function(_postMessage_, _$timeout_) {
                    postMessage = _postMessage_;
                    _private = _postMessage_._private();
                    $timeout = _$timeout_;
                });
            });

            it('should exist', function() {
                expect(postMessage).toBeDefined();
            });

            it('should have the window listen for the message event and use the _private.handleMessage() function', function() {
                expect($window.addEventListener).toHaveBeenCalledWith('message', _private.handleMessage, false);
            });

            describe('@public methods', function() {
                var session,
                    win;

                beforeEach(function() {
                    win = {

                    };

                    session = postMessage.createSession(win);
                });

                describe('createSession(win)', function() {
                    it('should create a session', function() {
                        expect(session).toBeDefined();
                    });

                    it('should add the session to a hash', function() {
                        expect(_private.sessions[0]).toBe(session);
                    });

                    describe('the session', function() {
                        it('should have a reference to the window', function() {
                            expect(session.window).toBe(win);
                        });

                        it('should have a unique id', function() {
                            expect(session.id).toBe(0);

                            expect(postMessage.createSession({}).id).toBe(1);

                            expect(postMessage.createSession({}).id).toBe(2);
                        });
                    });
                });

                describe('destroySession(id)', function() {
                    beforeEach(function() {
                        postMessage.destroySession(0);
                    });

                    it('should make all the properties undefined and the functions angular.noop', function() {
                        angular.forEach(session, function(value) {
                            if (typeof value === 'function') {
                                expect(value).toBe(angular.noop);
                            } else {
                                expect(value).not.toBeDefined();
                            }
                        });
                    });

                    it('should remove the session for the sessions hash', function() {
                        expect(_private.sessions.hasOwnProperty(0)).toBe(false);
                    });
                });

                describe('getSession(id)', function() {
                    var foundSession;

                    beforeEach(function() {
                        foundSession = postMessage.getSession(0);
                    });

                    it('should get the session with the provided id', function() {
                        expect(foundSession).toBe(session);
                    });
                });

                describe('session methods', function() {
                    var args;

                    beforeEach(function() {
                        spyOn(_private, 'ping');
                    });

                    describe('ping(event, data)', function() {
                        beforeEach(function() {
                            session.ping('test', 'hello');

                            args = _private.ping.mostRecentCall.args;
                        });

                        it('should ping the correct window', function() {
                            expect(_private.ping).toHaveBeenCalled();
                            expect(args[0]).toBe(session.window);
                            expect(args[1]).toBe('test');
                            expect(args[2]).toBe('ping');
                            expect(args[3]).toBe('hello');
                        });
                    });

                    describe('request', function() {
                        var promise;

                        beforeEach(function() {
                            promise = session.request('test', 'okay');

                            args = _private.ping.mostRecentCall.args;
                        });

                        it('should return a promise', function() {
                            expect(typeof promise.then).toBe('function');
                        });

                        it('should add the deferred object to the pending requests', function() {
                            expect(typeof session._pending[0].resolve).toBe('function');
                        });

                        it('should ping the correct window with the request', function() {
                            expect(_private.ping).toHaveBeenCalled();
                            expect(args[0]).toBe(session.window);
                            expect(args[1]).toBe('test');
                            expect(args[2]).toBe('request:0');
                            expect(args[3]).toBe('okay');
                        });
                    });
                });
            });

            describe('@private methods', function() {
                describe('_private()', function() {
                    it('should allow you to access the private methods and properties', function() {
                        expect(_private).toBeDefined();
                    });
                });
            });

            describe('_private methods', function() {
                describe('ping(win, event, type, data)', function() {
                    var data,
                        win;

                    beforeEach(function() {
                        data = {};
                        win = {
                            postMessage: jasmine.createSpy('window postMessage')
                        };

                        _private.ping(win, 'test', 'request', data);
                        $timeout.flush();
                    });

                    it('should send a message to the window', function() {
                        expect(win.postMessage).toHaveBeenCalled();
                    });

                    it('should format the data sent into a transferable format', function() {
                        var args = win.postMessage.mostRecentCall.args,
                            message = args[0];

                        expect(message.__c6__).toBeDefined();
                        expect(message.__c6__.event).toBe('test');
                        expect(message.__c6__.data).toBe(data);
                        expect(message.__c6__.type).toBe('request');
                    });
                });

                describe('newRequestId', function() {
                    var sessions;

                    beforeEach(function() {
                        sessions = {
                            0: {
                                _pending: {}
                            },
                            1: {
                                _pending: {}
                            },
                            2: {
                                _pending: {}
                            }
                        };

                        _private.sessions = sessions;
                    });

                    it('should use the first unused id starting at 0', function() {
                        expect(_private.newRequestId(sessions[0])).toBe(0);
                    });

                    it('should not use an id if a session already has a request with that id', function() {
                        sessions[0]._pending[0] = {};
                        sessions[0]._pending[1] = {};

                        expect(_private.newRequestId(sessions[0])).toBe(2);
                    });

                    it('should still use an id even if there is an id with a higher value', function() {
                        sessions[2]._pending[0] = {};
                        sessions[2]._pending[1] = {};
                        sessions[2]._pending[2] = {};
                        sessions[2]._pending[5] = {};

                        expect(_private.newRequestId(sessions[2])).toBe(3);
                    });
                });

                describe('getSessionByWindow(win)', function() {
                    beforeEach(function() {
                        _private.sessions = {
                            0: {
                                window: {}
                            },
                            1: {
                                window: {}
                            },
                            2: {
                                window: {}
                            }
                        };
                    });

                    it('should find the session with the corresponding window', function() {
                        expect(_private.getSessionByWindow(_private.sessions[0].window)).toBe(_private.sessions[0]);
                        expect(_private.getSessionByWindow(_private.sessions[1].window)).toBe(_private.sessions[1]);
                        expect(_private.getSessionByWindow(_private.sessions[2].window)).toBe(_private.sessions[2]);
                    });
                });

                describe('handleMessage(event)', function() {
                    var event,
                        session,
                        args,
                        win;

                    beforeEach(function() {
                        win = {};

                        session = postMessage.createSession(win);

                        event = {
                            data: {
                                __c6__: {
                                    event: 'test',
                                    data: {},
                                    type: null
                                }
                            },
                            source: win
                        };

                        spyOn(session, 'emit');
                    });

                    it('should do nothing when a non-cinema6 event comes in', function() {
                        function Event(data) {
                            this.data = data;
                        }

                        expect(function() {
                            _private.handleMessage.call($window, new Event({ facebook: 'hello' }));
                        }).not.toThrow();

                        expect(function() {
                            _private.handleMessage.call($window, new Event('hello'));
                        }).not.toThrow();

                        expect(function() {
                            _private.handleMessage.call($window, new Event(undefined));
                        }).not.toThrow();

                        expect(function() {
                            _private.handleMessage.call($window, new Event(null));
                        }).not.toThrow();

                        expect(function() {
                            _private.handleMessage.call($window, new Event(22));
                        }).not.toThrow();
                    });

                    describe('request', function() {
                        beforeEach(function() {
                            event.data.__c6__.type = 'request:0';

                            _private.handleMessage.call($window, event);

                            args = session.emit.mostRecentCall.args;
                        });

                        it('should emit the received event', function() {
                            expect(session.emit).toHaveBeenCalled();
                            expect(args[0]).toBe('test');
                        });

                        it('should pass along the data', function() {
                            expect(args[1]).toBe(event.data.__c6__.data);
                        });

                        it('should pass along a done() function', function() {
                            expect(typeof args[2]).toBe('function');
                        });

                        describe('the done() function', function() {
                            var done;

                            beforeEach(function() {
                                done = args[2];
                                spyOn(_private, 'ping');
                            });

                            it('should ping the window with the provided response', function() {
                                var data = {},
                                    pingArgs;

                                done(data);

                                pingArgs = _private.ping.mostRecentCall.args;

                                expect(pingArgs[0]).toBe(win);
                                expect(pingArgs[1]).toBe('test');
                                expect(pingArgs[2]).toBe('response:0');
                                expect(pingArgs[3]).toBe(data);
                            });
                        });
                    });

                    describe('response', function() {
                        beforeEach(function() {
                            event.data.__c6__.type = 'response:0';

                            session._pending[0] = {
                                resolve: jasmine.createSpy('session pending resolve')
                            };

                            _private.handleMessage(event);
                        });

                        it('should resolve the promise for the pending request with the provided data', function() {
                            expect(session._pending[0].resolve).toHaveBeenCalledWith(event.data.__c6__.data);
                        });
                    });

                    describe('ping', function() {
                        beforeEach(function() {
                            event.data.__c6__.type = 'ping';

                            _private.handleMessage(event);

                            args = session.emit.mostRecentCall.args;
                        });

                        it('should emit the event with the data and the angular.noop function', function() {
                            expect(args[0]).toBe('test');
                            expect(args[1]).toBe(event.data.__c6__.data);
                            expect(args[2]).toBe(angular.noop);
                        });
                    });
                });
            });
        });
    });
})();
