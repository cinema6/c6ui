define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.ui.browser.userAgent', [])
    .service('c6UserAgent',['$window',function($window){
        var ua = $window.navigator.userAgent, match;

        this.app = {
            name    : null,
            version : null
        };

        this.os  = {
            name    : null,
            version : null
        };

        this.device = {
            name        : null,
            version     : null,
            isIPad      : function() { return (this.name === 'ipad'); },
            isIPod      : function() { return (this.name === 'ipod'); },
            isIPhone    : function() { return (this.name === 'iphone'); },
            isIOS       : function() { return (this.isIPhone() || this.isIPad() || this.isIPod()     ); },

            isKindle    : function() { return (this.name === 'kindle'); },
            isAndroid   : function() { return ( this.isKindle() || (this.name === 'android') ); },

            isMobile    : function() { return (this.isIOS() || this.isAndroid()); }
        };

        this.userAgent  = null;

        if (!ua){
            return;
        }
        match= ua.match(
            /(silk|opera|chrome|safari|firefox|msie|phantomjs)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (match !== null){
            this.app.name     = match[1].toLowerCase();
            this.app.version  = match[2];

            if (this.app.name === 'safari'){
                match = ua.match(/Version\/?\s*(\.?\d+(\.\d+)*)/);
                if (match !== null){
                    this.app.version  = match[1];
                }
            }
        }

        match = ua.match( /(kfot|android|iphone|ipod|ipad)/i );
        if (match !== null ){
            this.device.name = match[1].toLowerCase();
            if (this.device.name === 'kfot') {
                this.device.name = 'kindle';
            }
        }

        match = ua.match (/(mac os x|windows|linux)/i);
        if (match !== null){
            var os = match[1].toLowerCase();
            if (os === 'mac os x') {
                if (this.device.isIOS()){
                    this.os.name         = 'ios';
                    match = ua.match(/OS ?\s*(\.?\d+([\.|_]\d+)*) like Mac OS X/);
                    if (match !== null){
                        this.os.version  = match[1].replace(/_/g,'.');
                    }
                } else {
                    this.os.name         = 'mac';
                    match = ua.match(/Mac OS X?\s*(\.?\d+([\.|_]\d+)*)/);
                    if (match !== null){
                        this.os.version  = match[1].replace(/_/g,'.');
                    }
                }
            }
            else
            if (os === 'windows'){
                this.os.name         = 'windows';
                match = ua.match(/Windows NT ([\.\d]+)/);
                if (match !== null){
                    this.os.version  = match[1];
                }
            }
            else {
                if (this.device.isAndroid()){
                    this.os.name = 'android';
                    match = ua.match(/Android ?\s*(\.?\d+([\.|_]\d+)*)/);
                    if (match !== null){
                        this.os.version  = match[1].replace(/_/g,'.');
                    }
                } else {
                    this.os.name = 'linux';
                }
            }
        }


        this.userAgent = ua;

    }]);

});
