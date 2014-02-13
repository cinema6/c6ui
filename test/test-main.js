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

        paths : {
            "angular"       : libUrl('angular/v1.2.12-0-g5cc5cc1/angular'),
            "angularMocks"  : libUrl('angular/v1.2.12-0-g5cc5cc1/angular-mocks'),
            "templates"     : "../.tmp/templates"
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
            "templates" : {
                "deps" : [ "c6ui" ]
            },
            "browser/user_agent" : {
                "deps" : [ "c6ui" ]
            },
            "browser/info": {
                "deps": [ "browser/user_agent" ]
            },
            "events/emitter" : {
                "deps" : [ "c6ui" ]
            },
            "events/journal" : {
                "deps" : [ "c6ui" ]
            },
            "computed/computed": {
                "deps": ["c6ui"]
            },
            "controls/controls": {
                "deps": ["computed/computed"]
            },
            "debounce/debounce": {
                "deps": ["c6ui"]
            },
            "sfx/sfx": {
                "deps": ["c6ui"]
            },
            "mouseactivity/mouseactivity": {
                "deps": ["c6ui"]
            },
            "imagepreloader/imagepreloader": {
                "deps": ["c6ui"]
            },
            "videos/playlist_history": {
                "deps": ["events/emitter", "events/journal"]
            },
            "videos/playlist": {
                "deps": ["c6ui", "templates"]
            },
            "videos/video": {
                "deps": ["c6ui"]
            },
            "url/urlmaker": {
                "deps": ["c6ui"]
            },
            "format/format": {
                "deps": ["c6ui"]
            },
            "postmessage/postmessage": {
                "deps": ["events/emitter"]
            },
            "cinema6/cinema6": {
                "deps": ["postmessage/postmessage"]
            },
            "storage/storage": {
                "deps": ["c6ui"]
            }
        },

        priority : [
            "angular"
        ],

        deps : tests ,

        callback: $window.__karma__.start
    });

}(window));
