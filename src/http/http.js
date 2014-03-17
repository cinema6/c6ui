(function() {
    'use strict';

    angular.module('c6.http', ['c6.ui'])
        .config(['$provide',
        function( $provide ) {
            $provide.decorator('$httpBackend', ['$delegate','c6BrowserInfo','$window','urlParser','$location',
            function                           ( $delegate , c6BrowserInfo , $window , urlParser , $location ) {
                return function(method, url, data, callback, headers, timeout) {
                    var appUrl = urlParser($location.absUrl()),
                        cors = c6BrowserInfo.profile.cors,
                        supportsXdr = !!$window.XDomainRequest;

                    if (!appUrl.sameOriginAs(url) && !cors && supportsXdr) {
                        var xdr = new $window.XDomainRequest();

                        xdr.onload = function() {
                            callback(200, xdr.responseText, '');
                        };
                        xdr.onerror = function() {
                            callback(400, xdr.responseText, '');
                        };
                        xdr.ontimeout = function() {
                            callback(408, 'Timeout after ' + timeout + 'ms.', '');
                        };

                        xdr.open(method, url);
                        xdr.timeout = timeout || 0;
                        xdr.send(data || '');
                    } else {
                        $delegate.apply($delegate, arguments);
                    }
                };
            }]);
        }]);
}());
