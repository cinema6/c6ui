define (['angular','../events/emitter','../postmessage/postmessage'],
function( angular , eventsEmitter     ,    postmessagePostmessage  ) {
    'use strict';

    var forEach = angular.forEach,
        isObject = angular.isObject;

    return angular.module('c6.ui.cinema6.cinema6', [
        eventsEmitter.name,
        postmessagePostmessage.name
    ]).provider('cinema6', [function() {
        var Adapter = angular.noop,
            toJson = angular.toJson,
            fromJson = angular.fromJson;

        this.adapters = {
            fixture: ['config','$http','$cacheFactory','$q',
            function ( config , $http , $cacheFactory , $q ) {
                var createdCount = -1,
                    self = this;

                function indexOfItemWithId(items, id) {
                    var result = -1;

                    forEach(items, function(item, index) {
                        if (item.id === id) {
                            result = index;
                        }
                    });

                    return result;
                }

                this._cache = $cacheFactory('cinema6 fixtures');

                this._getJSON = function(src) {
                    function getFromCache() {
                        var fixtures = self._cache.get('fixtures');

                        return fixtures ? $q.when(fixtures) :
                            $q.reject('No fixtures loaded.');
                    }

                    function fetchViaAjax() {
                        return $http.get(src)
                            .then(function cache(response) {
                                return self._cache.put('fixtures', response.data);
                            });
                    }

                    return getFromCache()
                        .catch(fetchViaAjax);
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

                this.create = function(type, data) {
                    return this._getJSON(config.jsonSrc)
                        .then(function(fixtures) {
                            data.id = 'fixture' + (createdCount += 1);

                            fixtures[type].push(data);

                            return [data];
                        });
                };

                this.erase = function(type, model) {
                    return this._getJSON(config.jsonSrc)
                        .then(function(fixtures) {
                            var items = fixtures[type],
                                index = indexOfItemWithId(items, model.id);

                            items.splice(index, 1);

                            return null;
                        });
                };

                this.update = function(type, model) {
                    return this._getJSON(config.jsonSrc)
                        .then(function(fixtures) {
                            var items = fixtures[type],
                                index = indexOfItemWithId(items, model.id);

                            items[index] = model;

                            return [model];
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

            var adapter = null;
            var models = $cacheFactory('cinema6.db.models');

            function getAdapter() {
                return adapter || (adapter = $injector.instantiate(Adapter, {
                    config: Adapter.config || {}
                }));
            }

            /* @public */

            var PRIVATE_PROPS = ['_type', '_erased', '_pending'];
            function DBModel(type, data) {
                this._update(data);

                this._type = type;
                this._erased = false;
            }
            DBModel.prototype = {
                save: function() {
                    var self = this;

                    function update(data) {
                        return self._update(data[0]);
                    }

                    function cacheModel(model) {
                        return models.put(model._type + ':' + model.id, model);
                    }

                    function cleanup() {
                        delete self._pending;
                    }

                    if (this._erased) {
                        return $q.reject('Cannot save an erased record.');
                    }

                    // When the update() function is called, the _pending property will be
                    // stripped from the model, allowing the next call to save() to call the
                    // adapter.
                    return this._pending ||
                        (this._pending = getAdapter()[this.id ?
                            'update' : 'create'](this._type, this.pojoify())
                            .then(update)
                            .then(cacheModel)
                            .finally(cleanup));
                },
                erase: function() {
                    var self = this;

                    function uncacheModel() {
                        return models.remove(self._type + ':' + self.id) || null;
                    }

                    this._erased = true;

                    return (
                        this.id ?
                            getAdapter().erase(this._type, this.pojoify())
                                .then(uncacheModel) :
                            $q.when(null)
                        )
                        .catch(function resetErased(error) {
                            self._erased = false;

                            return $q.reject(error);
                        });
                },
                pojoify: function() {
                    var pojo = fromJson(toJson(this));

                    forEach(PRIVATE_PROPS, function(prop) {
                        delete pojo[prop];
                    });

                    return pojo;
                },
                _update: function(data) {
                    var model = this;
                    // Copy the value of all private properties to an object for safe-keeping
                    var props = PRIVATE_PROPS.reduce(function(props, prop) {
                        if (prop in model) {
                            props[prop] = model[prop];
                        }

                        return props;
                    }, {});

                    function update(existing, data) {
                        forEach(data, function(newValue, prop) {
                            var oldValue = existing[prop];

                            if ((isObject(oldValue) && isObject(newValue)) &&
                                !(oldValue instanceof DBModel) && !(newValue instanceof DBModel) &&
                                (oldValue.constructor === newValue.constructor)) {
                                if ((oldValue instanceof Array) && (newValue instanceof Array)) {
                                    oldValue.length = newValue.length;
                                }

                                update(oldValue, newValue);
                            } else {
                                existing[prop] = newValue;
                            }
                        });

                        forEach(existing, function(oldValue, prop) {
                            if (!data.hasOwnProperty(prop)) {
                                delete existing[prop];
                            }
                        });
                    }

                    // Update the properties of this with the properties of data, including
                    // removing properties
                    update(this, data);

                    // Copy back the private properties to this.
                    forEach(PRIVATE_PROPS, function(prop) {
                        if (prop in props) {
                            model[prop] = props[prop];
                        }
                    });

                    return this;
                }
            };

            function setMeta(meta) {
                return function(item) {
                    item.meta = meta;
                    return item;
                };
            }

            function createModels(type, items) {
                return items.map(function(item) {
                    var cacheId = type + ':' + item.id;

                    return models.put(cacheId, (models.get(cacheId) || self.db.create(type))
                        ._update(item));
                });
            }

            self.db = {
                find: function(type, id) {
                    var cacheId = type + ':' + id;

                    function fetchFromCache() {
                        var item = models.get(cacheId);

                        if (!item) {
                            return $q.reject('Cannot find ' + cacheId + ' in cache.');
                        }

                        return $q.when([item]);
                    }

                    function fetchFromAdapter() {
                        return getAdapter().find(type, id).then(createModels.bind(null, type));
                    }

                    function extractSingle(items) {
                        return items[0];
                    }

                    return fetchFromCache()
                        .catch(fetchFromAdapter)
                        .then(extractSingle);
                },
                findAll: function(type, matcher) {
                    var args = Array.prototype.slice.call(arguments),
                        meta = args[args.push({}) - 1];

                    return getAdapter()[matcher ?
                        'findQuery' : 'findAll'].apply(getAdapter(), args)
                        .then(createModels.bind(null, type))
                        .then(setMeta(meta));
                },
                create: function(type, data) {
                    return new DBModel(type, data);
                },
                push: function(type, id, data) {
                    var cacheId = type + ':' + id;

                    return (models.get(cacheId) || models.put(cacheId, new DBModel(type)))
                        ._update(data);
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
});
