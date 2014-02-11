(function() {
    'use strict';

    define(['cinema6/cinema6'], function() {
        describe('cinema6.db', function() {
            var cinema6Provider;

            var cinema6,
                $rootScope,
                $cacheFactory;

            var AdapterConstructor,
                AdapterInjectable,
                adapter;

            beforeEach(function() {
                AdapterConstructor = jasmine.createSpy('Adapter')
                    .andCallFake(function(config, $q) {
                        this._deferreds = {
                            find: $q.defer(),
                            findAll: $q.defer(),
                            findQuery: $q.defer()
                        };

                        this.find = jasmine.createSpy('adapter.find()')
                            .andReturn(this._deferreds.find.promise);

                        this.findAll = jasmine.createSpy('adapter.findAll()')
                            .andReturn(this._deferreds.findAll.promise);

                        this.findQuery = jasmine.createSpy('adapter.findQuery()')
                            .andReturn(this._deferreds.findQuery.promise);

                        adapter = this;
                    });
                AdapterInjectable = ['config', '$q', AdapterConstructor];

                module('c6.ui', function($injector) {
                    cinema6Provider = $injector.get('cinema6Provider');

                    cinema6Provider.useAdapter(AdapterInjectable);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $cacheFactory = $injector.get('$cacheFactory');
                });
            });

            describe('instantiation', function() {
                describe('if the adapter has a config object', function() {
                    beforeEach(function() {
                        AdapterInjectable.config = {
                            jsonSrc: 'foo.json'
                        };

                        inject(function($injector) {
                            cinema6 = $injector.get('cinema6');
                        });
                    });

                    it('should provide that config object to the adapter', function() {
                        expect(AdapterConstructor).toHaveBeenCalledWith(AdapterInjectable.config, jasmine.any(Object));
                    });
                });

                describe('if the adapter has no config object', function() {
                    beforeEach(function() {
                        inject(function($injector) {
                            cinema6 = $injector.get('cinema6');
                        });
                    });

                    it('should provide an empty object', function() {
                        expect(AdapterConstructor).toHaveBeenCalledWith({}, jasmine.any(Object));
                    });
                });
            });

            describe('after initialization', function() {
                beforeEach(function() {
                    inject(function($injector) {
                        cinema6 = $injector.get('cinema6');
                    });
                });

                describe('find(type, matcher)', function() {
                    var findSpy;

                    beforeEach(function() {
                        findSpy = jasmine.createSpy('find spy');
                    });

                    describe('if no matcher is provided', function() {
                        var results;

                        beforeEach(function() {
                            results = [
                                {
                                    id: 'e-2ff054584731c6',
                                    type: 'minireel',
                                    user: 'u-38b61e71b25d1e'
                                },
                                {
                                    id: 'e-04464ceeded4fc',
                                    type: 'minireel',
                                    user: 'u-38b61e71b25d1e'
                                }
                            ];

                            $rootScope.$apply(function() {
                                cinema6.db.find('experience').then(findSpy);
                            });
                        });

                        it('should call the adapter\'s findAll method', function() {
                            expect(adapter.findAll).toHaveBeenCalledWith('experience');
                        });

                        it('should resolve with the result of the adapter', function() {
                            expect(findSpy).not.toHaveBeenCalled();

                            $rootScope.$apply(function() {
                                adapter._deferreds.findAll.resolve(results);
                            });
                            expect(findSpy).toHaveBeenCalledWith(results);
                        });

                        it('should cache all the items by type and id', function() {
                            var cache = $cacheFactory.get('cinema6.db');

                            $rootScope.$apply(function() {
                                adapter._deferreds.findAll.resolve(results);
                            });

                            expect(cache.get('experience:e-2ff054584731c6')).toBe(results[0]);
                            expect(cache.get('experience:e-04464ceeded4fc')).toBe(results[1]);
                        });
                    });

                    describe('if an id is provided as a matcher', function() {
                        var result;

                        beforeEach(function() {
                            result = [
                                {
                                    id: 'e-2ff054584731c6',
                                    type: 'minireel',
                                    user: 'u-38b61e71b25d1e'
                                }
                            ];

                            $rootScope.$apply(function() {
                                cinema6.db.find('experience', 'e-2ff054584731c6').then(findSpy);
                            });
                        });

                        it('should call the adapter\'s find method', function() {
                            expect(adapter.find).toHaveBeenCalledWith('experience', 'e-2ff054584731c6');
                        });

                        it('should resolve with the singular result of the adapter', function() {
                            expect(findSpy).not.toHaveBeenCalled();

                            $rootScope.$apply(function() {
                                adapter._deferreds.find.resolve(result);
                            });
                            expect(findSpy).toHaveBeenCalledWith(result[0]);
                        });

                        it('should cache the item by type and id', function() {
                            $rootScope.$apply(function() {
                                adapter._deferreds.find.resolve(result);
                            });

                            expect($cacheFactory.get('cinema6.db').get('experience:e-2ff054584731c6')).toBe(result[0]);
                        });

                        it('should consult the cache before call the adapter', function() {
                            var exp = {
                                id: 'abc123'
                            };

                            adapter.find.callCount = 0;
                            $cacheFactory.get('cinema6.db').put('experience:abc123', exp);

                            $rootScope.$apply(function() {
                                cinema6.db.find('experience', 'abc123').then(findSpy);
                            });

                            expect(adapter.find.callCount).toBe(0);
                            expect(findSpy).toHaveBeenCalledWith(exp);
                        });
                    });

                    describe('if a query is provided as a matcher', function() {
                        var query,
                            results;

                        beforeEach(function() {
                            query = { id: ['e-b1384eed3c9dcc', 'e-f8515db773f478', 'e-04b624ab9a7227'] };

                            results = [
                                {
                                    id: 'e-b1384eed3c9dcc',
                                    type: 'screenjack',
                                    user: 'u-38b61e71b25d1e'
                                },
                                {
                                    id: 'e-f8515db773f478',
                                    type: 'minireel',
                                    user: 'u-567d9671aaacb8'
                                },
                                {
                                    id: 'e-04b624ab9a7227',
                                    type: 'screenjack',
                                    user: 'u-567d9671aaacb8'
                                }
                            ];

                            $rootScope.$apply(function() {
                                cinema6.db.find('experience', query).then(findSpy);
                            });
                        });

                        it('should call the adapter\'s findQuery method', function() {
                            expect(adapter.findQuery).toHaveBeenCalledWith('experience', query);
                        });

                        it('should resolve with the result of the adapter', function() {
                            expect(findSpy).not.toHaveBeenCalled();

                            $rootScope.$apply(function() {
                                adapter._deferreds.findQuery.resolve(results);
                            });
                            expect(findSpy).toHaveBeenCalledWith(results);
                        });

                        it('should cache all the items by type and id', function() {
                            var cache = $cacheFactory.get('cinema6.db');

                            $rootScope.$apply(function() {
                                adapter._deferreds.findQuery.resolve(results);
                            });

                            expect(cache.get('experience:e-b1384eed3c9dcc')).toBe(results[0]);
                            expect(cache.get('experience:e-f8515db773f478')).toBe(results[1]);
                            expect(cache.get('experience:e-04b624ab9a7227')).toBe(results[2]);
                        });
                    });
                });
            });
        });
    });
}());
