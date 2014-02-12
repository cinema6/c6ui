(function() {
    'use strict';

    define(['cinema6/cinema6'], function() {
        describe('cinema6Provider.adapters.fixture', function() {
            var cinema6Provider;

            var $rootScope,
                $q;

            var $httpBackend,
                fixtures;

            var fixture,
                adapterConfig;

            beforeEach(function() {
                fixtures = {
                    experience: [
                        {
                            id: 'e-2ff054584731c6',
                            type: 'minireel',
                            user: 'u-38b61e71b25d1e'
                        },
                        {
                            id: 'e-04464ceeded4fc',
                            type: 'minireel',
                            user: 'u-38b61e71b25d1e'
                        },
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
                    ],
                    user: [
                        {
                            id: 'u-bc03d43a69c86d',
                            name: 'Josh'
                        },
                        {
                            id: 'u-53de94d3424f14',
                            name: 'Evan'
                        }
                    ]
                };

                adapterConfig = {};

                module('c6.ui', function($injector) {
                    cinema6Provider = $injector.get('cinema6Provider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    $httpBackend = $injector.get('$httpBackend');

                    fixture = $injector.instantiate(cinema6Provider.adapters.fixture, { config: adapterConfig });
                });
            });

            it('should exist', function() {
                expect(fixture).toEqual(jasmine.any(Object));
            });

            describe('private', function() {
                describe('_getJSON(src)', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('_getJSON success');

                        $httpBackend.expectGET('assets/mock/fixtures.json')
                            .respond(200, fixtures);

                        fixture._getJSON('assets/mock/fixtures.json').then(spy);

                        $httpBackend.flush();
                    });

                    it('should cache the response', function() {
                        expect(fixture._cache.get('assets/mock/fixtures.json')).toEqual([200, fixtures, {}]);
                    });

                    it('should resolve to the json', function() {
                        expect(spy).toHaveBeenCalledWith(fixtures);
                    });
                });
            });

            describe('public', function() {
                beforeEach(function() {
                    adapterConfig.jsonSrc = 'assets/mock/fixtures.json';

                    spyOn(fixture, '_getJSON').andReturn($q.when(fixtures));
                });

                describe('findAll(type)', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('findAll success');
                    });

                    it('should return an array of all objects of a given type', function() {
                        $rootScope.$apply(function() {
                            fixture.findAll('experience').then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith(fixtures.experience);

                        $rootScope.$apply(function() {
                            fixture.findAll('user').then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith(fixtures.user);

                        expect(fixture._getJSON).toHaveBeenCalledWith(adapterConfig.jsonSrc);
                    });
                });

                describe('find(type, id)', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('findAll success');
                    });

                    it('should return an array with the single found object in it', function() {
                        $rootScope.$apply(function() {
                            fixture.find('experience', 'e-2ff054584731c6').then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([fixtures.experience[0]]);

                        $rootScope.$apply(function() {
                            fixture.find('experience', 'e-b1384eed3c9dcc').then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([fixtures.experience[2]]);

                        $rootScope.$apply(function() {
                            fixture.find('user', 'u-53de94d3424f14').then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([fixtures.user[1]]);

                        expect(fixture._getJSON).toHaveBeenCalledWith(adapterConfig.jsonSrc);
                    });
                });

                describe('findQuery(type, query)', function() {
                    var spy;

                    beforeEach(function() {
                        spy = jasmine.createSpy('findQuery success');
                    });

                    it('should return all items that match the selected query', function() {
                        var experiences = fixtures.experience,
                            users = fixtures.user;

                        $rootScope.$apply(function() {
                            fixture.findQuery('experience', { type: 'minireel' }).then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([experiences[0], experiences[1], experiences[3]]);

                        $rootScope.$apply(function() {
                            fixture.findQuery('experience', { type: 'minireel', user: 'u-38b61e71b25d1e' }).then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([experiences[0], experiences[1]]);

                        $rootScope.$apply(function() {
                            fixture.findQuery('experience', { type: 'minireel', id: ['e-2ff054584731c6', 'e-b1384eed3c9dcc'] }).then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([experiences[0]]);

                        $rootScope.$apply(function() {
                            fixture.findQuery('user', { name: 'Josh' }).then(spy);
                        });
                        expect(spy).toHaveBeenCalledWith([users[0]]);

                        expect(fixture._getJSON).toHaveBeenCalledWith(adapterConfig.jsonSrc);
                    });
                });
            });
        });
    });
}());