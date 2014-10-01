define (['angular','c6ui','modernizr','controllers'],
function( angular , c6ui , modernizr , controllers ) {
    'use strict';

    window.c6 = {
        kLogLevels: ['log', 'info', 'warn', 'error']
    };

    return angular.module('app', [c6ui.name, controllers.name]);
});
