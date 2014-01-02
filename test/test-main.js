(function($window){
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return /\.ut\.js$/.test(file);
    });
    
    function libUrl(url) {
        return 'http://s3.amazonaws.com/c6.dev/ext/' + url;
    }

    requirejs({

        baseUrl: '/base/src',

        paths : {
            "angular": libUrl('angular/v1.2.6-0-g98ee371/angular'),
            "angularMocks": libUrl('angular/v1.2.6-0-g98ee371/angular-mocks'),
            //"angular"       : "../lib/angular/angular",
            //"angularMocks"  : "../lib/angular/angular-mocks",
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
            "anicache/anicache" : {
                "deps" : [ "events/emitter" ]
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
            "panels/panels": {
                "deps": ["anicache/anicache"]
            },
            "visible/visible": {
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
            "site/site": {
                "deps": ["postmessage/postmessage"]
            }
        },

        priority : [
            "angular"
        ],

        deps : tests ,

        callback: $window.__karma__.start
    });

}(window));
