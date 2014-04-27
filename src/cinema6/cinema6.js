(function() {
    'use strict';

    var copy = angular.copy;

    angular.module('c6.ui')
        .provider('cinema6', [function() {
            var Adapter = angular.noop,
                toJson = angular.toJson,
                fromJson = angular.fromJson;

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

                function DBModel(type, data) {
                    copy(data, this);

                    this._type = type;
                }
                DBModel.prototype = {
                    save: function() {
                        var self = this;

                        function update(data) {
                            return self._update(data[0]);
                        }

                        function cacheModel(model) {
                            return cache.put(model._type + ':' + model.id, model);
                        }

                        // When the update() function is called, the _pending property will be
                        // stripped from the model, allowing the next call to save() to call the
                        // adapter.
                        return this._pending ||
                            (this._pending = adapter[this.id ?
                                'update' : 'create'](this._type, this.pojoify())
                                .then(update)
                                .then(cacheModel));
                    },
                    erase: function() {
                        var self = this;

                        function uncacheModel() {
                            return cache.remove(self._type + ':' + self.id) || null;
                        }

                        return this.id ?
                            adapter.erase(this._type, this.pojoify())
                                .then(uncacheModel) :
                            $q.when(null);
                    },
                    pojoify: function() {
                        var pojo = fromJson(toJson(this));

                        delete pojo._type;

                        return pojo;
                    },
                    _update: function(data) {
                        var type = this._type;

                        copy(data, this);
                        this._type = type;

                        return this;
                    }
                };

                function saveToCache(type, items) {
                    angular.forEach(items, function(item) {
                        cache.put((type + ':' + item.id), item);
                    });

                    return items;
                }

                function createModels(type, items) {
                    return items.map(function(item) {
                        return (cache.get(type + ':' + item.id) || self.db.create(type))
                            ._update(item);
                    });
                }

                self.db = {
                    find: function(type, id) {
                        function fetchFromCache() {
                            var item = cache.get(type + ':' + id);

                            if (!item) {
                                return $q.reject('Cannot find ' + (type + ':' + id) + ' in cache.');
                            }

                            return $q.when([item]);
                        }

                        function fetchFromAdapter() {
                            return adapter.find(type, id)
                                .then(createModels.bind(null, type))
                                .then(saveToCache.bind(null, type));
                        }

                        function extractSingle(items) {
                            return items[0];
                        }

                        return fetchFromCache()
                            .catch(fetchFromAdapter)
                            .then(extractSingle);
                    },
                    findAll: function(type, matcher) {
                        return adapter[matcher ?
                            'findQuery' : 'findAll'].apply(adapter, arguments)
                            .then(createModels.bind(null, type))
                            .then(saveToCache.bind(null, type));
                    },
                    create: function(type, data) {
                        return new DBModel(type, data);
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
