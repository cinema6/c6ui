(function() {
    'use strict';

    angular.module('c6.ui')
        .factory('urlParser', ['$document','c6UserAgent',
        function              ( $document , c6UserAgent ) {
            var parser = $document[0].createElement('a');

            return function(url) {
                function URLInfo(parser, url) {
                    // In all browsers except for IE, setting the href property with a relative URL
                    // will do both of these operations:
                    // 1. Expand the url to an absolute path
                    // 2. Fill in the href/protocol/host/search/etc. properties
                    //
                    // However, in IE, setting the href property will only perform the first step
                    // unless the values of the second step are encoded in the URL. For this reason,
                    // we set the href property a first time to get the absolute URL, then set it a
                    // second time to fill in the previously-mentioned properties.
                    if (c6UserAgent.app.name === 'msie') {
                        parser.setAttribute('href', url);
                        url = parser.href;
                    }

                    parser.setAttribute('href', url);

                    this.href = parser.href;
                    this.protocol = parser.protocol.replace(/:$/, '');
                    this.host = parser.host;
                    this.search = parser.search.replace(/^\?/, '');
                    this.hash = parser.hash.replace(/^#/, '');
                    this.hostname = parser.hostname;
                    this.port = parser.port;
                    this.pathname = parser.pathname;
                }
                URLInfo.prototype = {
                    sameOriginAs: function(url) {
                        var parsed = new URLInfo(parser, url);

                        return (this.protocol === parsed.protocol) &&
                            (this.host === parsed.host);
                    }
                };

                return new URLInfo(parser, url);
            };
        }]);
}());
