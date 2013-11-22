(function() {
	'use strict';

    window.c6 = {
        kLogLevels: ['log', 'info', 'warn', 'error']
    };

	angular.module('app', ['c6.ui', 'c6.log']);
})();
