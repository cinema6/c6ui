define(['http/http','browser/info'], function(httpHttp, browserInfo) {
    'use strict';

    describe('$httpBackend', function() {
        var $rootScope,
            $httpBackend,
            $http,
            $delegate;

        var $window,
            $location,
            c6BrowserInfo,
            xdr;

        function MockXDR() {
            this.onerror = null;
            this.onload = null;
            this.onprogress = null;
            this.ontimeout = null;

            this.abort = jasmine.createSpy('xdr.abort()');
            this.open = jasmine.createSpy('xdr.open(method, url)');
            this.send = jasmine.createSpy('xdr.send(data)');

            this.constructor = MockXDR;
            this.contentType = '';
            this.responseText = '';
            this.timeout = 0;

            xdr = this;
        }

        function MockWindow() {}
        MockWindow.prototype = window;

        beforeEach(function() {
            module('ng', function($provide) {
                $delegate = jasmine.createSpy('$httpBackend()');

                $provide.value('$httpBackend', $delegate);
                $provide.value('$window', new MockWindow());
                $provide.value('$location', {
                    absUrl: function() {
                        return 'http://cinema6.com/';
                    }
                });
            });

            module(browserInfo.name, function($provide) {
                $provide.value('c6BrowserInfo', {
                    profile: {
                        cors: true
                    }
                });
            });

            module(httpHttp.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');

                $window = $injector.get('$window');
                c6BrowserInfo = $injector.get('c6BrowserInfo');
            });
        });

        describe('under most use cases', function() {
            beforeEach(function() {
                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $http = $injector.get('$http');
                });
            });

            it('should delegate to the actual $httpBackend', function() {
                $rootScope.$apply(function() {
                    $http.get('/test/foo.html');
                });

                expect($delegate).toHaveBeenCalledWith('GET', '/test/foo.html', undefined, jasmine.any(Function), jasmine.any(Object), undefined, undefined, undefined);
            });
        });

        describe('if the request is cross-origin and the browser does not support cors but does support XDomainRequest', function() {
            beforeEach(function() {
                $window.XDomainRequest = MockXDR;
                c6BrowserInfo.profile.cors = false;

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $http = $injector.get('$http');
                });
            });

            it('should make an XDomainRequest', function() {
                $rootScope.$apply(function() {
                    $http.get('https://www.tribal360.com/test/html.json');
                });

                expect($delegate).not.toHaveBeenCalled();

                expect(xdr.open).toHaveBeenCalledWith('GET', 'https://www.tribal360.com/test/html.json');
                expect(xdr.timeout).toBe(0);
                expect(xdr.send).toHaveBeenCalledWith('');
            });

            it('should resolve the promise when the request comes back successfully', function() {
                var success = jasmine.createSpy('$http.post() success'),
                    data = { name: 'Josh', company: 'Cinema6' },
                    response = { foo: 'test', okay: 'hello' };

                $rootScope.$apply(function() {
                    $http.post('https://apple.com/post', data, {
                        timeout: 1000
                    }).then(success);
                });

                expect($delegate).not.toHaveBeenCalled();

                expect(xdr.open).toHaveBeenCalledWith('POST', 'https://apple.com/post');
                expect(xdr.timeout).toBe(1000);
                expect(xdr.send).toHaveBeenCalledWith(JSON.stringify(data));

                xdr.responseText = JSON.stringify(response);
                xdr.onload();

                expect(success).toHaveBeenCalledWith({
                    status: 200,
                    data: response,
                    headers: jasmine.any(Function),
                    config: jasmine.any(Object)
                });
            });

            it('should reject the promise if there is an error', function() {
                var failure = jasmine.createSpy('$http.get() failure');

                $rootScope.$apply(function() {
                    $http.get('https://www.tribal360.com/test/fail.html').then(null, failure);
                });

                expect($delegate).not.toHaveBeenCalled();

                expect(xdr.open).toHaveBeenCalledWith('GET', 'https://www.tribal360.com/test/fail.html');
                expect(xdr.timeout).toBe(0);
                expect(xdr.send).toHaveBeenCalledWith('');

                xdr.responseText = 'FAIL!';
                xdr.onerror();

                expect(failure).toHaveBeenCalledWith({
                    status: 400,
                    data: 'FAIL!',
                    headers: jasmine.any(Function),
                    config: jasmine.any(Object)
                });
            });

            it('should reject the promise if the request times out', function() {
                var failure = jasmine.createSpy('$http.get() failure');

                $rootScope.$apply(function() {
                    $http.get('https://www.tribal360.com/test/fail.html', {
                        timeout: 1000
                    }).then(null, failure);
                });

                expect($delegate).not.toHaveBeenCalled();

                expect(xdr.open).toHaveBeenCalledWith('GET', 'https://www.tribal360.com/test/fail.html');
                expect(xdr.timeout).toBe(1000);
                expect(xdr.send).toHaveBeenCalledWith('');

                xdr.ontimeout();

                expect(failure).toHaveBeenCalledWith({
                    status: 408,
                    data: 'Timeout after 1000ms.',
                    headers: jasmine.any(Function),
                    config: jasmine.any(Object)
                });
            });

            it('should provide an onprogress handler', function() {
                $rootScope.$apply(function() {
                    $http.get('http://google.com/api/foo');
                });

                expect(xdr.onprogress).toEqual(jasmine.any(Function));
            });
        });
    });
});
