define(['computed/computed'], function(computedComputed) {
    'use strict';

    describe('c6Computed', function() {
        var c6Computed,
            $rootScope,
            $scope,
            c;

        function $apply(fn) {
            return $rootScope.$apply(fn);
        }

        beforeEach(function() {
            module(computedComputed.name);

            inject(function($injector) {
                c6Computed = $injector.get('c6Computed');
                $rootScope = $injector.get('$rootScope');

                $scope = $rootScope.$new();
                c = c6Computed($scope);
            });
        });

        it('should exist', function() {
            expect(c6Computed).toEqual(jasmine.any(Function));
        });

        describe('basic usage', function() {
            var model;

            beforeEach(function() {
                model = {};

                $scope.first = 'Josh';
                $scope.last = 'Minzner';
            });

            it('should compute the property with the provided dependencies', function() {
                var fullName = jasmine.createSpy('full name')
                    .and.callFake(function() {
                        return $scope.first + ' ' + $scope.last;
                    });

                c(model, 'fullName', fullName, ['first', 'last']);

                $apply(function() {
                    expect(model.fullName).toBe('Josh Minzner');
                });
                expect(fullName).toHaveBeenCalled();

                $apply(function() {
                    $scope.first = 'Jessica';
                    expect(model.fullName).toBe('Jessica Minzner');
                });
            });

            it('should set "this" to the model', function() {
                c(model, 'foo', function() {
                    expect(this).toBe(model);
                }, []);

                $apply(function() {
                    angular.noop(model.foo);
                });
            });

            it('should only run the computing function if the $scope dependencies change', function() {
                var fullName = jasmine.createSpy('last, first')
                    .and.callFake(function() {
                        return $scope.last + ', ' + $scope.first;
                    });

                $apply(function() {
                    c(model, 'fullName', fullName, ['last', 'first']);
                });

                $apply(function() {
                    angular.noop(model.fullName);
                });
                expect(fullName.calls.count()).toBe(1);

                $apply(function() {
                    angular.noop(model.fullname);
                });
                expect(fullName.calls.count()).toBe(1);

                $apply(function() {
                    $scope.first = 'Dan';
                });
                $apply(function() {
                    expect(model.fullName).toBe('Minzner, Dan');
                });
                expect(fullName.calls.count()).toBe(2);

                $apply(function() {
                    angular.noop(model.fullName);
                });
                expect(fullName.calls.count()).toBe(2);

                $apply(function() {
                    angular.noop(model.fullName);
                });
                expect(fullName.calls.count()).toBe(2);
            });

            it('should be $watchable', function() {
                var spy = jasmine.createSpy('$watcher spy');

                $scope.$watch('test', spy);

                $apply(function() {
                    c($scope, 'test', function() {
                        return $scope.first + ' ' + $scope.last;
                    }, ['first', 'last']);
                });

                expect(spy).toHaveBeenCalledWith('Josh Minzner', 'Josh Minzner', $scope);

                $apply(function() {
                    $scope.last = 'Groban';
                });

                expect(spy).toHaveBeenCalledWith('Josh Groban', 'Josh Minzner', $scope);
            });
        });

        describe('@each syntax', function() {
            var item1, item2, item3,
                model, groceries,
                total;

            beforeEach(function() {
                total = jasmine.createSpy('total')
                    .and.callFake(function() {
                        var total = 0;

                        angular.forEach($scope.groceries, function(item) {
                            total += item.price;
                        });

                        return total;
                    });

                model = {};

                item1 = {
                    name: 'Apple',
                    price: 0.50
                };
                item2 = {
                    name: 'Orange',
                    price: 0.75
                };
                item3 = {
                    name: 'Avocado',
                    price: 1.50
                };
                $scope.groceries = groceries = [item1, item2, item3];

                c(model, 'total', total, ['groceries.@each.price']);
            });

            it('should only recompute when the specified dependency of each model is changed', function() {
                $apply(function() {
                    expect(model.total).toBe(2.75);
                });
                expect(total.calls.count()).toBe(1);

                $apply(function() {
                    item2.price = 1;
                });
                expect(model.total).toBe(3);
                expect(total.calls.count()).toBe(2);

                $apply(function() {
                    item3.name = 'Banana';
                });
                expect(total.calls.count()).toBe(2);

                $apply(function() {
                    item3.price = 2;
                });
                expect(model.total).toBe(3.50);
                expect(total.calls.count()).toBe(3);

                $apply(function() {
                    item1.foo = 'foo';
                });
                expect(total.calls.count()).toBe(3);

                $apply(function() {
                    groceries.splice(0, 1);
                });
                expect(model.total).toBe(3);
                expect(total.calls.count()).toBe(4);
            });

            it('should not dirty dirty the property if a collection member is no longer in the collection', function() {
                $apply(function() {
                    expect(model.total).toBe(2.75);
                });
                expect(total.calls.count()).toBe(1);

                $apply(function() {
                    item1.price = 0.75;
                });
                $apply(function() {
                    angular.noop(model.total);
                });
                expect(total.calls.count()).toBe(2);

                $scope.$apply(function() {
                    groceries.splice(0, 1);
                });
                $scope.$apply(function() {
                    angular.noop(model.total);
                });
                expect(total.calls.count()).toBe(3);

                $scope.$apply(function() {
                    item1.price = 0.50;
                });
                expect(total.calls.count()).toBe(3);
            });

            it('should work with multiple @each', function() {
                var customers = jasmine.createSpy('customers')
                    .and.callFake(function() {
                        var customers = [];

                        angular.forEach(this.groceries, function(item) {
                            angular.forEach(item.purchasers, function(customer) {
                                customers.push(customer.name);
                            });
                        });

                        return customers;
                    });

                item1.purchasers = [
                    {
                        name: 'Josh'
                    },
                    {
                        name: 'Evan'
                    }
                ];
                item2.purchasers = [
                    {
                        name: 'Steph'
                    },
                    {
                        name: 'Moo'
                    }
                ];
                item3.purchasers = [
                    {
                        name: 'Howard'
                    },
                    {
                        name: 'Jason'
                    }
                ];

                c($scope, 'customers', customers, ['groceries.@each.purchasers.@each.name']);

                $apply(function() {
                    expect($scope.customers).toEqual(['Josh', 'Evan', 'Steph', 'Moo', 'Howard', 'Jason']);
                });
                expect(customers.calls.count()).toBe(1);

                $apply(function() {
                    item2.purchasers[0].name = 'Stephanie';
                });
                $apply(function() {
                    angular.noop($scope.customers);
                });
                expect(customers.calls.count()).toBe(2);

                $apply(function() {
                    item1.name = 'Kiwi';
                });
                $apply(function() {
                    angular.noop($scope.customers);
                });
                expect(customers.calls.count()).toBe(2);

                $apply(function() {
                    item3.purchasers[1].name = 'Jason Glickman';
                });
                $apply(function() {
                    expect($scope.customers).toEqual(['Josh', 'Evan', 'Stephanie', 'Moo', 'Howard', 'Jason Glickman']);
                });
                expect(customers.calls.count()).toBe(3);
            });

            it('should work on primitives', function() {
                var names = $scope.names = ['Howard', 'Josh', 'Evan'];

                c($scope, 'csv', function() {
                    return this.names.toString();
                }, ['names.@each']);

                $apply(function() {
                    expect($scope.csv).toBe('Howard,Josh,Evan');
                });

                $apply(function() {
                    names[0] = 'Steph';
                });
                $apply(function() {
                    expect($scope.csv).toBe('Steph,Josh,Evan');
                });
            });

            it('should handle adding items to the collection', function() {
                var names = $scope.names = ['Howard', 'Josh', 'Evan'];

                c($scope, 'csv', function() {
                    return this.names.toString();
                }, ['names.@each']);

                $apply(function() {
                    expect($scope.csv).toBe('Howard,Josh,Evan');
                });

                $apply(function() {
                    $scope.names.push('Steph');
                });
                $apply(function() {
                    expect($scope.csv).toBe('Howard,Josh,Evan,Steph');
                });

                $apply(function() {
                    names[3] = 'Moo';
                });
                $apply(function() {
                    expect($scope.csv).toBe('Howard,Josh,Evan,Moo');
                });
            });
        });

        describe('setting', function() {
            var full;

            beforeEach(function() {
                $scope.first = 'Josh';
                $scope.last = 'Minzner';

                full = jasmine.createSpy('full')
                    .and.callFake(function(value) {
                        var parts;

                        if (arguments.length) {
                            parts = value.split(' ');

                            this.first = parts[0];
                            this.last = parts[1];
                        }

                        return this.first + ' ' + this.last;
                    });
                c($scope, 'full', full, ['first', 'last']);
            });

            it('should call the computing function with the value to set', function() {
                $apply(function() {
                    expect($scope.full).toBe('Josh Minzner');
                });

                $apply(function() {
                    $scope.full = 'Peter Catalanotto';
                });
                expect(full).toHaveBeenCalledWith('Peter Catalanotto');
                $apply(function() {
                    expect($scope.full).toBe('Peter Catalanotto');
                    expect($scope.first).toBe('Peter');
                    expect($scope.last).toBe('Catalanotto');
                });
            });
        });
    });
});
