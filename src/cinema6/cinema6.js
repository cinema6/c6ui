(function() {
    'use strict';

    angular.module('c6.ui')
        .provider('cinema6', [function() {
            var Adapter = angular.noop;

            this.adapters = {
                fixture: ['config','$http','$cacheFactory',
                function ( config , $http , $cacheFactory ) {
                    this._cache = $cacheFactory('cinema6 fixtures');

                    this._getJSON = function(src) {
                        return $http.get(src, {
                            cache: this._cache
                        }).then(function(response) {
                            return response.data;
                        });
                    };

                    this.findAll = function(type) {
                        return this._getJSON(config.jsonSrc)
                            .then(function(fixtures) {
                                return fixtures[type];
                            });
                    };

                    this.find = function(type, id) {
                        return this._getJSON(config.jsonSrc)
                            .then(function(fixtures) {
                                return fixtures[type].filter(function(object) {
                                    return object.id === id;
                                });
                            });
                    };

                    this.findQuery = function(type, query) {
                        return this._getJSON(config.jsonSrc)
                            .then(function(fixtures) {
                                var items = fixtures[type],
                                    list = (function() {
                                        var id = query.id;

                                        if (!id) {
                                            return items;
                                        }

                                        id = angular.isArray(id) ? id : [id];

                                        return items.filter(function(item) {
                                            return id.indexOf(item.id) > -1;
                                        });
                                    }());

                                delete query.id;

                                return list.filter(function(item) {
                                    for (var key in query) {
                                        if (item[key] !== query[key]) {
                                            return false;
                                        }
                                    }

                                    return true;
                                });
                            });
                    };
                }]
            };

            this.useAdapter = function(adapter) {
                Adapter = adapter;

                return this;
            };

            this.$get = ['$window','$q','c6EventEmitter','postMessage','$injector','$cacheFactory',
            function    ( $window , $q , c6EventEmitter , postMessage , $injector , $cacheFactory ) {
                var self = c6EventEmitter({}),
                    _private = {
                        session: $q.defer(),
                        appData: $q.defer(),
                        options: undefined
                    };

                var adapter = $injector.instantiate(Adapter, { config: Adapter.config || {} }),
                    cache = $cacheFactory('cinema6.db');


                /* @public */

                self.db = {
                    find: function(type, matcher) {
                        var isObject = angular.isObject,
                            isQuery = isObject(matcher);

                        function saveToCache(items) {
                            angular.forEach(items, function(item) {
                                cache.put((type + ':' + item.id), item);
                            });

                            return items;
                        }

                        function fetchFromCache() {
                            var item = cache.get(type + ':' + matcher);

                            if (!item) {
                                return $q.reject('Cannot find ' + (type + ':' + matcher) + ' in cache.');
                            }

                            return $q.when([item]);
                        }

                        function fetchFromAdapter() {
                            return adapter.find(type, matcher);
                        }

                        function extractSingle(items) {
                            return items[0];
                        }

                        if (!matcher || isQuery) {
                            return adapter[isQuery ? 'findQuery' : 'findAll'].apply(adapter, arguments)
                                .then(saveToCache);
                        }

                        return fetchFromCache()
                            .catch(fetchFromAdapter)
                            .then(saveToCache)
                            .then(extractSingle);
                    }
                };

                self.ready = false;

                self.init = function(config) {
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

                self.getSession = function() {
                    return _private.session.promise;
                };

                self.getAppData = function() {
                    return _private.appData.promise;
                };

                self.shareUrl = function(data) {
                    this.getSession().then(function(session) {
                        session.ping('shareUrl', data);
                    });
                };

                self.fullscreen = function(bool) {
                    this.getSession().then(function(session) {
                        session.ping('fullscreenMode', !!bool);
                    });
                };

                self.getUser = function() {
                    return this.getSession()
                        .then(function(session) {
                            return session.request('getCurrentUser');
                        });
                };

                /* @private */

                self._private = function() {
                    return _private;
                };

                return self;
            }];
        }]);
})();
