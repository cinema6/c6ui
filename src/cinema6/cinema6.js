(function() {
    'use strict';

    angular.module('c6.ui')
        .service('cinema6', ['$window', '$q', 'c6EventEmitter', 'postMessage',
        function            ( $window ,  $q ,  c6EventEmitter ,  postMessage ) {
            var self = this,
                _private = {
                    session: $q.defer(),
                    appData: $q.defer(),
                    options: undefined
                };

            /* @init */

            c6EventEmitter(this);

            /* @public */

            this.ready = false;

            this.init = function(config) {
                var session = postMessage.createSession($window.parent);

                config = config || {};

                session.request('handshake').then(function(handshakeData) {
                    var setupResult;

                    function completeHandshake() {
                        self.ready = true;
                        self.emit('ready', true);
                        session.ping('ready', true);
                        _private.session.resolve(session);
                    }

                    _private.appData.resolve(handshakeData.appData);

                    if (config.setup) {
                        setupResult = config.setup(handshakeData.appData);
                    }

                    if (setupResult && (typeof setupResult.then === 'function')) {
                        setupResult.then(completeHandshake);
                    } else {
                        completeHandshake();
                    }
                });

                _private.options = config;

                return session;
            };

            this.getSession = function() {
                return _private.session.promise;
            };

            this.getAppData = function() {
                return _private.appData.promise;
            };

            this.shareUrl = function(data) {
                this.getSession().then(function(session) {
                    session.ping('shareUrl', data);
                });
            };

            this.fullscreen = function(bool) {
                this.getSession().then(function(session) {
                    session.ping('fullscreenMode', !!bool);
                });
            };

            /* @private */

            this._private = function() {
                return _private;
            };
        }]);
})();
