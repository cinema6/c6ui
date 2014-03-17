(function() {
    'use strict';

    define(['url/urlparser'], function() {
        describe('urlParser', function() {
            var urlParser;

            var $location;

            beforeEach(function() {
                module('ng', function($provide) {
                    $provide.value('$location', {
                        absUrl: function() {
                            return 'http://cinema6.com/';
                        }
                    });
                });

                module('c6.ui');

                inject(function($injector) {
                    urlParser = $injector.get('urlParser');
                });
            });

            it('should exist', function() {
                expect(urlParser).toEqual(jasmine.any(Function));
            });

            it('should parse the url', function() {
                expect(urlParser('http://www.apple.com:9000/foo/test.json?abc=123#foo')).toEqual(jasmine.objectContaining({
                    href: 'http://www.apple.com:9000/foo/test.json?abc=123#foo',
                    protocol: 'http',
                    host: 'www.apple.com:9000',
                    search: 'abc=123',
                    hash: 'foo',
                    hostname: 'www.apple.com',
                    port: '9000',
                    pathname: '/foo/test.json'
                }));
            });

            it('should work for minimal urls', function() {
                expect(urlParser('/hello/world.html')).toEqual(jasmine.objectContaining({
                    href: location.origin + '/hello/world.html',
                    protocol: 'http',
                    host: 'localhost:8000',
                    search: '',
                    hash: '',
                    hostname: 'localhost',
                    port: '8000',
                    pathname: '/hello/world.html'
                }));
            });

            describe('sameOriginAs(url)', function() {
                it('should return a boolean indicating if the provided url has the same origin as the parsed url', function() {
                    var parsed = urlParser('http://www.cinema6.com/foo/test.xml');

                    expect(parsed.sameOriginAs('http://www.cinema6.com/help.json')).toBe(true);
                    expect(parsed.sameOriginAs('https://www.cinema6.com/help.json')).toBe(false);
                    expect(parsed.sameOriginAs('http://cinema6.com/help.json')).toBe(false);
                    expect(parsed.sameOriginAs('/okay.html')).toBe(false);
                });
            });
        });
    });
}());
