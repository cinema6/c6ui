define (['angular','browser/info','url/urlparser'],
function( angular , browserInfo  , urlUrlparser  ) {
    'use strict';

    return angular.module('c6.http', [
        browserInfo.name,
        urlUrlparser.name
    ]).config(['$provide',
        function( $provide ) {
            $provide.decorator('$httpBackend', ['$delegate','c6BrowserInfo','$window','c6UrlParser','$location',
            function                           ( $delegate , c6BrowserInfo , $window , c6UrlParser , $location ) {
                var appUrl = c6UrlParser($location.absUrl()),
                    cors = c6BrowserInfo.profile.cors,
                    supportsXdr = !!$window.XDomainRequest;

                if (cors || !supportsXdr) {
                    return $delegate;
                }

                return function(method, url, data, callback, headers, timeout) {
                    var xdr;

                    if (appUrl.sameOriginAs(url)) {
                        $delegate.apply($delegate, arguments);
                    } else {
                        xdr = new $window.XDomainRequest();

                        // There is a bug in IE9 where an xdr will abort if all
                        // of the event handlers are not specified. We don't
                        // actually care about the "progress" event, but must
                        // specify a handler for it anyway.
                        xdr.onprogress = function() {};
                        xdr.onerror = function() {
                            callback(400, xdr.responseText, '');
                        };
                        xdr.ontimeout = function() {
                            callback(408, 'Timeout after ' + timeout + 'ms.', '');
                        };
                        xdr.onload = function() {
                            callback(200, xdr.responseText, '');
                        };

                        xdr.open(method, url);
                        xdr.timeout = timeout || 0;
                        xdr.send(data || '');
                    }
                };
            }]);
        }]);
});
