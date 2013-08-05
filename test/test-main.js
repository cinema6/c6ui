(function($window){
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return /\.ut\.js$/.test(file);
    });

    requirejs({

        baseUrl: '/base/src',

        paths : {
            "angular"       : "../lib/angular/angular",
            "angularMocks"  : "../lib/angular/angular-mocks"
        },

        shim : {
            "angular"   : {
                "exports" : "angular"
            },
            "angularMocks" : {
                "deps" : [ "angular" ]
            },
            "c6ui" : {
                "deps" : [ "angularMocks" ]
            },
            "events/emitter" : {
                "deps" : [ "c6ui" ]
            },
            "events/journal" : {
                "deps" : [ "c6ui" ]
            },
            "anicache/anicache" : {
                "deps" : [ "events/emitter" ]
            },
			"computed/computed": {
				"deps": ["c6ui"]
			},
			"controls/controls": {
				"deps": ["computed/computed"]
			}
        },

        priority : [
            "angular"
        ],

        deps : tests ,

        callback: $window.__karma__.start
    });

}(window));
