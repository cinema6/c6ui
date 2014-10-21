(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            modernizr: '//lib.cinema6.com/modernizr/modernizr.custom.71747',
            angular: '//lib.cinema6.com/angular/v1.2.22-0-g93b0c2d/angular.min'
        },
        packages: [
            {
                name: 'c6uilib',
                location: '../lib/c6ui',
                main: 'c6uilib'
            },
            {
                name: 'c6log',
                location: '../lib/c6ui',
                main: 'c6log'
            }
        ],
        shim: {
            angular: {
                exports: 'angular'
            }
        }
    });

    define( ['angular','app'],
    function( angular , app ) {
        angular.bootstrap(document.documentElement, [app.name]);

        return true;
    });
}());
