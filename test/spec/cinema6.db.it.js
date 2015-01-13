define(['cinema6/cinema6'], function(cinema6Cinema6) {
    'use strict';

    describe('cinema6.db integration', function() {
        describe('using the fixture adapter', function() {
            var $rootScope,
                $httpBackend,
                cinema6;

            var fixtures,
                resultSpy;

            beforeEach(function() {
                resultSpy = jasmine.createSpy('resultSpy');

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

                module(cinema6Cinema6.name, function(cinema6Provider) {
                    cinema6Provider.adapters.fixture.config = {
                        jsonSrc: 'assets/mock/fixtures.json'
                    };

                    cinema6Provider.useAdapter(cinema6Provider.adapters.fixture);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                    cinema6 = $injector.get('cinema6');
                });

                $httpBackend.whenGET('assets/mock/fixtures.json')
                    .respond(200, fixtures);
            });

            it('should support finding all records', function() {
                cinema6.db.findAll('experience').then(resultSpy);
                $httpBackend.flush();

                resultSpy.calls.mostRecent().args[0].forEach(function(item, index) {
                    expect(item).toEqual(jasmine.objectContaining(fixtures.experience[index]));
                });
                expect(resultSpy.calls.mostRecent().args[0].meta).toEqual({});

                $rootScope.$apply(function() {
                    cinema6.db.findAll('user').then(resultSpy);
                });

                resultSpy.calls.mostRecent().args[0].forEach(function(item, index) {
                    expect(item).toEqual(jasmine.objectContaining(fixtures.user[index]));
                });
                expect(resultSpy.calls.mostRecent().args[0].meta).toEqual({});
            });

            it('should support finding a single record by id', function() {
                cinema6.db.find('user', 'u-bc03d43a69c86d').then(resultSpy);
                $httpBackend.flush();

                expect(resultSpy).toHaveBeenCalledWith(jasmine.objectContaining(fixtures.user[0]));

                $rootScope.$apply(function() {
                    cinema6.db.find('experience', 'e-f8515db773f478').then(resultSpy);
                });

                expect(resultSpy).toHaveBeenCalledWith(jasmine.objectContaining(fixtures.experience[3]));
            });

            it('should support finding records with queries', function() {
                var experiences = fixtures.experience,
                    result = [
                        jasmine.objectContaining(experiences[0]),
                        jasmine.objectContaining(experiences[1]),
                        jasmine.objectContaining(experiences[3])
                    ];

                result.meta = {};

                cinema6.db.findAll('experience', { type: 'minireel' }).then(resultSpy);
                $httpBackend.flush();

                expect(resultSpy).toHaveBeenCalledWith(result);

                $rootScope.$apply(function() {
                    cinema6.db.findAll('experience', { type: 'screenjack', user: 'u-38b61e71b25d1e' }).then(resultSpy);
                });

                result = [jasmine.objectContaining(experiences[2])];
                result.meta = {};

                expect(resultSpy).toHaveBeenCalledWith(result);
            });

            it('should support creating, updating and deleting records', function() {
                var minireel = cinema6.db.create('experience', {
                        name: 'My MiniReel',
                        data: {
                            deck: []
                        }
                    }),
                    card = {
                        id: 'rc-5250c856b92575',
                        title: 'My Card'
                    };

                minireel.save();
                $httpBackend.flush();

                expect(minireel.id).toBe('fixture0');

                $rootScope.$apply(function() {
                    cinema6.db.findAll('experience').then(function(experiences) {
                        expect(experiences[5]).toBe(minireel);
                    });
                });

                minireel.data.deck.push(card);
                $rootScope.$apply(function() {
                    minireel.save();
                });
                expect(minireel.data.deck[0]).toEqual(card);

                $rootScope.$apply(function() {
                    minireel.erase();
                });
                $rootScope.$apply(function() {
                    cinema6.db.findAll('experience').then(function(experiences) {
                        expect(experiences).not.toContain(minireel);
                    });
                });
            });
        });
    });
});
