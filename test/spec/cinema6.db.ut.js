define(['angular', 'cinema6/cinema6'], function(angular, cinema6Cinema6) {
    'use strict';

    var copy = angular.copy;

    function extend() {
        var objects = Array.prototype.slice.call(arguments);

        return objects.reduce(function(result, object) {
            return Object.keys(object).reduce(function(result, key) {
                result[key] = object[key];

                return result;
            }, result);
        }, {});
    }

    describe('cinema6.db', function() {
        var cinema6Provider;

        var cinema6,
            $rootScope,
            $cacheFactory,
            $q,
            cache;

        var AdapterConstructor,
            AdapterInjectable,
            adapter;

        beforeEach(function() {
            AdapterConstructor = jasmine.createSpy('Adapter')
                .and.callFake(function(config, $q) {
                    this._deferreds = {
                        find: $q.defer(),
                        findAll: $q.defer(),
                        findQuery: $q.defer(),
                        create: $q.defer(),
                        erase: $q.defer(),
                        update: $q.defer()
                    };

                    this.find = jasmine.createSpy('adapter.find()')
                        .and.returnValue(this._deferreds.find.promise);

                    this.findAll = jasmine.createSpy('adapter.findAll()')
                        .and.returnValue(this._deferreds.findAll.promise);

                    this.findQuery = jasmine.createSpy('adapter.findQuery()')
                        .and.returnValue(this._deferreds.findQuery.promise);

                    this.create = jasmine.createSpy('adapter.createRecord()')
                        .and.returnValue(this._deferreds.create.promise);

                    this.erase = jasmine.createSpy('adapter.erase()')
                        .and.returnValue(this._deferreds.erase.promise);

                    this.update = jasmine.createSpy('adapter.update()')
                        .and.returnValue(this._deferreds.update.promise);

                    adapter = this;
                });
            AdapterInjectable = ['config', '$q', 'cinema6', AdapterConstructor];

            module(cinema6Cinema6.name, function($injector) {
                cinema6Provider = $injector.get('cinema6Provider');

                cinema6Provider.useAdapter(AdapterInjectable);
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $cacheFactory = $injector.get('$cacheFactory');
                $q = $injector.get('$q');
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

                    // Make a request to instantiate the adapter
                    cinema6.db.findAll('foo');
                });

                it('should provide that config object to the adapter', function() {
                    expect(AdapterConstructor).toHaveBeenCalledWith(AdapterInjectable.config, jasmine.any(Object), cinema6);
                });
            });

            describe('if the adapter has no config object', function() {
                beforeEach(function() {
                    inject(function($injector) {
                        cinema6 = $injector.get('cinema6');
                    });

                    // Make a request to instantiate the adapter
                    cinema6.db.findAll('foo');
                });

                it('should provide an empty object', function() {
                    expect(AdapterConstructor).toHaveBeenCalledWith({}, jasmine.any(Object), cinema6);
                });
            });
        });

        describe('after initialization', function() {
            beforeEach(function() {
                inject(function($injector) {
                    cinema6 = $injector.get('cinema6');
                });

                cache = $cacheFactory.get('cinema6.db.models');
            });

            function assertIsDBModel(model) {
                expect(model._type).toEqual(jasmine.any(String));
                expect(model.erase).toEqual(jasmine.any(Function));
                expect(model.save).toEqual(jasmine.any(Function));
            }

            describe('DBModel methods', function() {
                var model,
                    data;

                beforeEach(function() {
                    data = {
                        name: 'Josh Minzner',
                        age: 22,
                        address: {
                            street: '205 Witherspoon St.',
                            city: 'Princeton',
                            state: 'New Jersey',
                            zip: '08542'
                        },
                        ballot: {
                            0: 'Hello',
                            1: 'Cinema6'
                        },
                        org: cinema6.db.create('org', {
                            id: 'o-f4314d77cd6b01',
                            data: {}
                        }),
                        coworkers: [
                            cinema6.db.create('person'),
                            cinema6.db.create('person'),
                            cinema6.db.create('person'),
                            { id: 'p-646a90e04ec760' },
                            { id: 'p-706e1282001128', data: 'I will be removed' }
                        ],
                        parents: [
                            {
                                name: 'Daniel Minzner',
                                age: 47
                            },
                            {
                                name: 'Louan Minzner',
                                age: 49
                            }
                        ]
                    };

                    $rootScope.$apply(function() {
                        model = cinema6.db.create('user', data);
                    });
                });

                describe('erase()', function() {
                    var eraseSpy;

                    beforeEach(function() {
                        eraseSpy = jasmine.createSpy('DBModel.erase() spy');
                    });

                    describe('if the model was fetched from the server', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                cinema6.db.find('user', 'u-83f2abdba2a005').then(function(user) {
                                    model = user;
                                });
                            });

                            $rootScope.$apply(function() {
                                adapter._deferreds.find.resolve([extend(data, { id: 'u-83f2abdba2a005' })]);
                            });

                            $rootScope.$apply(function() {
                                model.erase();
                            });

                            $rootScope.$apply(function() {
                                adapter._deferreds.erase.resolve(null);
                            });
                        });

                        it('should remove the record from the cache', function() {
                            adapter.find.calls.reset();
                            $rootScope.$apply(function() {
                                cinema6.db.find(model._type, model.id);
                            });
                            expect(adapter.find).toHaveBeenCalled();
                        });
                    });

                    describe('if the model has never been saved (has no ID)', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                model.erase().then(eraseSpy);
                            });
                        });

                        it('should resolve to null', function() {
                            expect(eraseSpy).toHaveBeenCalledWith(null);
                        });
                    });

                    describe('if the model has been saved (has an ID)', function() {
                        beforeEach(function() {
                            model.save();
                            $rootScope.$apply(function() {
                                adapter._deferreds.create.resolve([
                                    extend(data, { id: 'u-d83f502c99d226' })
                                ]);
                            });

                            $rootScope.$apply(function() {
                                model.erase().then(eraseSpy);
                            });
                        });

                        it('should not resolve right away', function() {
                            expect(eraseSpy).not.toHaveBeenCalled();
                        });

                        it('should call the adapter\'s erase() method', function() {
                            expect(adapter.erase).toHaveBeenCalledWith('user', model.pojoify());
                        });

                        describe('when the adapter comes back', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.erase.resolve();
                                });
                            });

                            it('should resolve the promise with null', function() {
                                expect(eraseSpy).toHaveBeenCalledWith(null);
                            });

                            it('should remove the record from the cache', function() {
                                adapter.find.calls.reset();
                                $rootScope.$apply(function() {
                                    cinema6.db.find(model._type, model.id);
                                });
                                expect(adapter.find).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('refresh()', function() {
                    var success, failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');
                    });

                    describe('when model has no id yet', function() {
                        beforeEach(function() {
                            adapter.find.calls.reset();

                            $rootScope.$apply(function() {
                                model.refresh().then(success, failure);
                            });
                        });

                        it('should not call the adapter.find()', function() {
                            expect(adapter.find).not.toHaveBeenCalled();
                        });

                        it('should return itself', function() {
                            expect(success).toHaveBeenCalledWith(model);
                        });
                    });

                    describe('when the model does have an id', function() {
                        beforeEach(function() {
                            adapter.find.calls.reset();

                            $rootScope.$apply(function() {
                                model.id = 'u-d83f502c99d226';
                                model.refresh().then(success, failure);
                            });
                        });

                        it('should call adapter.find()', function() {
                            expect(adapter.find).toHaveBeenCalledWith(model._type, model.id);
                        });

                        describe('when the request succeeds', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.find.resolve([{
                                        id: 'u-d83f502c99d226',
                                        name: 'Josh Minzner',
                                        location: {
                                            state: 'NJ'
                                        },
                                        age: 23
                                    }]);
                                });
                            });

                            it('should update the record with the result from the server', function() {
                                expect(model).toEqual({
                                    id: 'u-d83f502c99d226',
                                    name: 'Josh Minzner',
                                    location: {
                                        state: 'NJ'
                                    },
                                    age: 23,
                                    _type: 'user',
                                    _erased: false
                                });
                            });

                            it('should resolve the promise with itself', function() {
                                expect(success).toHaveBeenCalledWith(model);
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('when the request fails', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.find.reject('BAD');
                                });
                            });

                            it('should reject the promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('save()', function() {
                    var saveSpy,
                        promise;

                    beforeEach(function() {
                        saveSpy = jasmine.createSpy('DBModel.save() spy');
                    });

                    it('should only allow one adapter call to happen at a time', function() {
                        $rootScope.$apply(function() {
                            promise = model.save();
                        });

                        expect(model.save()).toBe(promise);

                        $rootScope.$apply(function() {
                            adapter._deferreds.create.resolve([extend(data, { id: 'u-d83f502c99d226' })]);
                        });

                        expect(model.save()).not.toBe(promise);
                    });

                    it('should only allow one adapter call to happen at a time, even if _update() is called in-between calls', function() {
                        $rootScope.$apply(function() {
                            promise = model.save();
                        });
                        model._update({ foo: 'bar' });

                        expect(model.save()).toBe(promise);
                    });

                    describe('if a previous save failed', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                model.save();
                            });
                            $rootScope.$apply(function() {
                                adapter._deferreds.create.reject('I FAILED!');
                            });
                            adapter.create.calls.reset();

                            $rootScope.$apply(function() {
                                model.save();
                            });
                        });

                        it('should call the adapter again', function() {
                            expect(adapter.create).toHaveBeenCalled();
                        });
                    });

                    describe('if the record has been deleted', function() {
                        var eraseSpy;

                        beforeEach(function() {
                            eraseSpy = jasmine.createSpy('model.erase()');

                            model.save();
                            $rootScope.$apply(function() {
                                adapter._deferreds.create.resolve([extend(data, { id: 'u-d83f502c99d226' })]);
                            });

                            model.erase().catch(eraseSpy);
                            $rootScope.$apply(function() {
                                model.save().catch(saveSpy);
                            });
                        });

                        it('should reject the promise', function() {
                            expect(adapter.update).not.toHaveBeenCalled();

                            expect(saveSpy).toHaveBeenCalledWith('Cannot save an erased record.');
                        });

                        describe('if the erase fails', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.erase.reject('Erase failed!');
                                });

                                $rootScope.$apply(function() {
                                    model.save();
                                });
                            });

                            it('should allow the model to be saved', function() {
                                expect(adapter.update).toHaveBeenCalled();
                            });

                            it('should still propagate a failure in the erase method', function() {
                                expect(eraseSpy).toHaveBeenCalledWith('Erase failed!');
                            });
                        });
                    });

                    describe('if the record has not been saved before (has no ID)', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                model.save().then(saveSpy);
                            });
                        });

                        it('should call the adapter\'s create() method', function() {
                            expect(adapter.create).toHaveBeenCalledWith('user', data);
                        });

                        describe('when the adapter responds', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.create.resolve([{
                                        id: 'u-d83f502c99d226',
                                        name: 'Josh Minzner',
                                        location: {
                                            state: 'NJ'
                                        },
                                        age: 23
                                    }]);
                                });
                            });

                            it('should update the record with the result from the server', function() {
                                expect(model).toEqual({
                                    id: 'u-d83f502c99d226',
                                    name: 'Josh Minzner',
                                    location: {
                                        state: 'NJ'
                                    },
                                    age: 23,
                                    _type: 'user',
                                    _erased: false
                                });
                            });

                            it('should cache the model', function() {
                                expect(cache.get('user:u-d83f502c99d226')).toBe(model);
                            });

                            it('should resolve the promise with itself', function() {
                                expect(saveSpy).toHaveBeenCalledWith(model);
                            });
                        });
                    });

                    describe('if the record has been saved before (has an ID)', function() {
                        beforeEach(function() {
                            model.save();

                            $rootScope.$apply(function() {
                                adapter._deferreds.create.resolve([
                                    extend(data, { id: 'u-d83f502c99d226' })
                                ]);
                            });

                            $rootScope.$apply(function() {
                                model.save().then(saveSpy);
                            });
                        });

                        it('should call the adapter\'s update method', function() {
                            expect(adapter.update).toHaveBeenCalledWith('user', model.pojoify());
                        });

                        describe('when the adapter responds', function() {
                            var newData,
                                parents, coworker1, coworker2, coworker3, coworker4, mom, dad, org;

                            beforeEach(function() {
                                parents = model.parents;
                                coworker1 = model.coworkers[0];
                                coworker1.id = 'p-5e19615e43e69b';
                                coworker2 = model.coworkers[1];
                                coworker2.id = 'p-5941c88d4fb61f';
                                coworker3 = model.coworkers[2];
                                coworker3.id = 'p-86da411d7b861a';
                                coworker4 = model.coworkers[3];
                                mom = parents[0];
                                dad = parents[1];
                                org = model.org;

                                $rootScope.$apply(function() {
                                    adapter._deferreds.update.resolve([(function() {
                                        newData = copy(extend(model.pojoify(), {
                                            lastUpdated: '2014-04-27T15:28:41.599Z',
                                            address: null,
                                            ballot: ['Hello', 'Cinema6']
                                        }));

                                        newData.org = org;
                                        newData.parents[0].age = 48;
                                        newData.parents[1].health = 100;
                                        newData.coworkers[0] = coworker2;
                                        newData.coworkers[1] = coworker1;
                                        newData.coworkers[2] = { data: 'I\m just some random data.' };
                                        newData.coworkers[3] = cinema6.db.create('person', coworker4);
                                        newData.coworkers.length--;

                                        return newData;
                                    }())]);
                                });
                            });

                            it('should update the record with the result from the server, preserving existing objects', function() {
                                expect(model.pojoify()).toEqual(newData);
                                expect(model.parents).toBe(parents);
                                expect(model.parents[0]).toBe(mom);
                                expect(model.parents[1]).toBe(dad);
                                expect(model.org).toBe(org);
                            });

                            it('should not update models', function() {
                                expect(model.coworkers[0]).toBe(coworker2);
                                expect(model.coworkers[1]).toBe(coworker1);
                                expect(model.coworkers[2]).not.toBe(coworker3);
                                expect(model.coworkers[2]).toBe(newData.coworkers[2]);
                                expect(model.coworkers[3]).not.toBe(coworker4);
                                expect(model.coworkers[3]).toBe(newData.coworkers[3]);
                            });

                            it('should resolve the promise with itself', function() {
                                expect(saveSpy).toHaveBeenCalledWith(model);
                            });
                        });
                    });
                });
            });

            describe('push(type, id, data)', function() {
                var model, result;

                beforeEach(function() {
                    model = {
                        id: 'e-ef9824b6513c46',
                        name: 'Johnny TestMonkey',
                        items: {}
                    };

                    result = cinema6.db.push('user', model.id, model);
                });

                it('should return a decorated record', function() {
                    expect(result).toEqual(jasmine.objectContaining(model));
                    expect(result.save).toEqual(jasmine.any(Function));
                    expect(result.erase).toEqual(jasmine.any(Function));
                });

                it('should put the record in the cache', function() {
                    var success = jasmine.createSpy('success()');

                    $rootScope.$apply(function() {
                        cinema6.db.find('user', model.id).then(success);
                    });

                    expect(success).toHaveBeenCalledWith(result);
                });

                it('should update existing records if they are re-put', function() {
                    var newModel = {
                        id: 'e-ef9824b6513c46',
                        name: 'Mildred TestMonkey',
                        items: {}
                    },
                    newResult = cinema6.db.push('user', newModel.id, newModel);

                    expect(newResult).toEqual(jasmine.objectContaining(newModel));
                    expect(newResult).toBe(result);
                });

                it('should be a shallow copy', function() {
                    expect(result.items).toBe(model.items);
                });
            });

            describe('create(type, data)', function() {
                var result,
                    data;

                beforeEach(function() {
                    data = {
                        type: 'minireel',
                        user: 'u-51aad6460bab04',
                        data: {
                            deck: [
                                {
                                    id: 'rc-fd8f49d8c68f2c'
                                }
                            ]
                        }
                    };

                    $rootScope.$apply(function() {
                        result = cinema6.db.create('experience', data);
                    });
                });

                it('should return a object with all the data of what was copied over', function() {
                    expect(result).toEqual(jasmine.objectContaining(data));
                });

                it('should store the type of the record as _type', function() {
                    expect(result._type).toBe('experience');
                });

                it('should return an object with methods for persistence and deletion', function() {
                    expect(result.save).toEqual(jasmine.any(Function));
                    expect(result.erase).toEqual(jasmine.any(Function));
                });

                it('should be a shallow copy', function() {
                    expect(result.data).toBe(data.data);
                });
            });

            describe('find(type, id)', function() {
                var result,
                    findSpy;

                beforeEach(function() {
                    result = [
                        {
                            id: 'e-2ff054584731c6',
                            type: 'minireel',
                            user: 'u-38b61e71b25d1e',
                            data: {}
                        }
                    ];

                    findSpy = jasmine.createSpy('find spy');

                    $rootScope.$apply(function() {
                        cinema6.db.find('experience', 'e-2ff054584731c6').then(findSpy);
                    });
                });

                it('should call the adapter\'s find method', function() {
                    expect(adapter.find).toHaveBeenCalledWith('experience', 'e-2ff054584731c6');
                });

                it('should resolve with a DBModel for the singular result of the adapter', function() {
                    expect(findSpy).not.toHaveBeenCalled();

                    $rootScope.$apply(function() {
                        adapter._deferreds.find.resolve(result);
                    });
                    expect(findSpy).toHaveBeenCalledWith(jasmine.objectContaining(result[0]));
                    assertIsDBModel(findSpy.calls.mostRecent().args[0]);
                });

                it('should be a shallow copy', function() {
                    $rootScope.$apply(function() {
                        adapter._deferreds.find.resolve(result);
                    });

                    expect(findSpy.calls.mostRecent().args[0].data).toBe(result[0].data);
                });

                it('should cache the item by type and id', function() {
                    $rootScope.$apply(function() {
                        adapter._deferreds.find.resolve(result);
                    });

                    expect($cacheFactory.get('cinema6.db.models').get('experience:e-2ff054584731c6')).toBe(findSpy.calls.mostRecent().args[0]);
                });

                it('should consult the cache before call the adapter', function() {
                    var exp = {
                        id: 'abc123'
                    };

                    adapter.find.callCount = 0;
                    $cacheFactory.get('cinema6.db.models').put('experience:abc123', exp);

                    $rootScope.$apply(function() {
                        cinema6.db.find('experience', 'abc123').then(findSpy);
                    });

                    expect(adapter.find.callCount).toBe(0);
                    expect(findSpy).toHaveBeenCalledWith(exp);
                });

                describe('if called many times', function() {
                    var secondFindSpy;

                    beforeEach(function() {
                        secondFindSpy = jasmine.createSpy('secondFindSpy()');

                        $rootScope.$apply(function() {
                            cinema6.db.find('experience', 'e-2ff054584731c6').then(secondFindSpy);
                        });
                    });

                    describe('when the adapter responds', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                adapter._deferreds.find.resolve(result);
                            });
                        });

                        it('should be given the same instance', function() {
                            expect(findSpy.calls.mostRecent().args[0]).toBe(secondFindSpy.calls.mostRecent().args[0]);
                        });
                    });

                    describe('with a different id', function() {
                        var secondResult;
                        var secondDeferred;

                        beforeEach(function() {
                            secondResult = [extend(result[0], { id: 'e-3ad9259ac6a80e' })];
                            secondDeferred = $q.defer();
                            adapter.find.and.returnValue(secondDeferred.promise);

                            $rootScope.$apply(function() {
                                cinema6.db.find('experience', secondResult[0].id).then(secondFindSpy);
                            });
                        });

                        describe('when the adapter responds', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    adapter._deferreds.find.resolve(result);
                                    secondDeferred.resolve(secondResult);
                                });
                            });

                            it('should be given a different instance', function() {
                                expect(findSpy.calls.mostRecent().args[0]).not.toBe(secondFindSpy.calls.mostRecent().args[0]);
                            });
                        });
                    });
                });

                describe('if the request is also part of a findAll()', function() {
                    var results;
                    var findAllSpy;

                    beforeEach(function() {
                        findAllSpy = jasmine.createSpy('findAllSpy()');

                        results = [
                            {
                                id: 'e-1dd4c82e0c792c',
                                type: 'minireel',
                                user: 'u-38b61e71b25d1e'
                            },
                            {
                                id: 'e-2ff054584731c6',
                                type: 'minireel',
                                user: 'u-38b61e71b25d1e',
                                data: {}
                            },
                            {
                                id: 'e-04464ceeded4fc',
                                type: 'minireel',
                                user: 'u-38b61e71b25d1e'
                            }
                        ];

                        $rootScope.$apply(function() {
                            cinema6.db.findAll('experience').then(findAllSpy);
                        });

                        $rootScope.$apply(function() {
                            adapter._deferreds.find.resolve(result);
                        });

                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(results);
                        });
                    });

                    it('should use the same instance', function() {
                        expect(findSpy.calls.mostRecent().args[0]).toBe(findAllSpy.calls.mostRecent().args[0][1]);
                    });
                });
            });

            describe('findAll(type, matcher)', function() {
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
                            cinema6.db.findAll('experience').then(findSpy);
                        });
                    });

                    it('should call the adapter\'s findAll method with the type and the meta object', function() {
                        expect(adapter.findAll).toHaveBeenCalledWith('experience', {});
                    });

                    it('should resolve with the result of the adapter as DBModels', function() {
                        expect(findSpy).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(results);
                        });
                        findSpy.calls.mostRecent().args[0].forEach(function(model, index) {
                            expect(model).toEqual(jasmine.objectContaining(results[index]));
                            assertIsDBModel(model);
                        });
                    });

                    it('should include the meta object', function() {
                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(results);
                        });

                        var meta = adapter.findAll.calls.mostRecent().args[1],
                            items = findSpy.calls.mostRecent().args[0];

                        expect(items.meta).toBe(meta);
                    });

                    it('should reuse, but update, existing DB models', function() {
                        var secondResults = [
                                {
                                    id: 'e-2ff054584731c6',
                                    type: 'minireel',
                                    user: 'u-38b61e71b25d1e',
                                    title: 'First Title'
                                },
                                {
                                    id: 'e-04464ceeded4fc',
                                    type: 'minireel',
                                    user: 'u-38b61e71b25d1e',
                                    title: 'Second Title'
                                }
                            ],
                            firstModels;

                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(results);
                        });
                        firstModels = findSpy.calls.mostRecent().args[0];

                        adapter._deferreds.findAll = $q.defer();
                        adapter.findAll.and.returnValue(adapter._deferreds.findAll.promise);
                        $rootScope.$apply(function() {
                            cinema6.db.findAll('experience').then(findSpy);
                        });
                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(secondResults);
                        });

                        findSpy.calls.mostRecent().args[0].forEach(function(model, index) {
                            expect(model).toBe(firstModels[index]);
                            expect(model).toEqual(jasmine.objectContaining(secondResults[index]));
                        });
                    });

                    it('should cache all the items by type and id', function() {
                        var cache = $cacheFactory.get('cinema6.db.models');

                        $rootScope.$apply(function() {
                            adapter._deferreds.findAll.resolve(results);
                        });

                        expect(cache.get('experience:e-2ff054584731c6')).toEqual(jasmine.objectContaining(results[0]));
                        expect(cache.get('experience:e-04464ceeded4fc')).toEqual(jasmine.objectContaining(results[1]));
                    });

                    describe('if multiple calls are in-flight', function() {
                        var secondFindSpy;

                        beforeEach(function() {
                            secondFindSpy = jasmine.createSpy('secondFindSpy()');

                            $rootScope.$apply(function() {
                                cinema6.db.findAll('experience').then(secondFindSpy);
                            });

                            $rootScope.$apply(function() {
                                adapter._deferreds.findAll.resolve(results);
                            });
                        });

                        it('should return the same instances', function() {
                            var first = findSpy.calls.mostRecent().args[0];
                            var second = secondFindSpy.calls.mostRecent().args[0];

                            expect(first).toEqual(second);
                            first.forEach(function(firstItem, index) {
                                var secondItem = second[index];

                                expect(firstItem).toBe(secondItem);
                            });
                        });
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
                            cinema6.db.findAll('experience', query).then(findSpy);
                        });
                    });

                    it('should call the adapter\'s findQuery method', function() {
                        expect(adapter.findQuery).toHaveBeenCalledWith('experience', query, {});
                    });

                    it('should resolve with the result of the adapter as DBModels', function() {
                        expect(findSpy).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            adapter._deferreds.findQuery.resolve(results);
                        });
                        findSpy.calls.mostRecent().args[0].forEach(function(model, index) {
                            expect(model).toEqual(jasmine.objectContaining(results[index]));
                            assertIsDBModel(model);
                        });
                    });

                    it('should include the meta object', function() {
                        $rootScope.$apply(function() {
                            adapter._deferreds.findQuery.resolve(results);
                        });

                        var meta = adapter.findQuery.calls.mostRecent().args[2],
                            items = findSpy.calls.mostRecent().args[0];

                        expect(items.meta).toBe(meta);
                    });

                    it('should cache all the items by type and id', function() {
                        var cache = $cacheFactory.get('cinema6.db.models');

                        $rootScope.$apply(function() {
                            adapter._deferreds.findQuery.resolve(results);
                        });

                        expect(cache.get('experience:e-b1384eed3c9dcc')).toEqual(jasmine.objectContaining(results[0]));
                        expect(cache.get('experience:e-f8515db773f478')).toEqual(jasmine.objectContaining(results[1]));
                        expect(cache.get('experience:e-04b624ab9a7227')).toEqual(jasmine.objectContaining(results[2]));
                    });
                });
            });
        });
    });
});
