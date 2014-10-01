(function($window){
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return (/\.(ut|it)\.js$/).test(file);
    });

    function libUrl(url) {
        return 'http://s3.amazonaws.com/c6.dev/ext/' + url;
    }

    /* Very upset with phantom js for not supporting Function.prototype.bind. Here's a pollyfill. */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(self) {
            var slice = Array.prototype.slice,
                boundArgs = slice.call(arguments, 1),
                fn = this;

            return function() {
                var calledArgs = slice.call(arguments),
                    args = [];

                args.push.apply(args, boundArgs);
                args.push.apply(args, calledArgs);

                return fn.apply(self, args);
            };
        };
    }

    requirejs({
        baseUrl: '/base/src',

        paths: {
            angular: libUrl('angular/v1.2.12-0-g5cc5cc1/angular'),
            ngMock: libUrl('angular/v1.2.12-0-g5cc5cc1/angular-mocks')
        },

        shim: {
            angular: {
                exports: 'angular'
            },
            ngMock: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngMock');
                }
            }
        }
    });

    require(['ngMock'], function() {
        require(tests, $window.__karma__.start);
    });

}(window));
