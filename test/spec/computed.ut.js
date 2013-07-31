(function() {
	'use strict';

	define(['computed/computed'], function() {
		describe('c6Computed', function() {
			var c6Computed,
				$rootScope;

			beforeEach(module('c6.ui'));
			beforeEach(inject(function(_c6Computed_, _$rootScope_) {
				c6Computed = _c6Computed_;
				$rootScope = _$rootScope_;
			}));

			it('should exist', function() {
				expect(c6Computed).toBeDefined();
			});

			describe('setting up the scope', function() {
				var $scope;

				beforeEach(function() {
					$scope = $rootScope.$new();

					$scope.test = 'hello';
					$scope.test2 = 'world';

					$scope.helloWorld = c6Computed($scope, function(test, test2) {
						return test + ' ' + test2;
					}, ['test', 'test2']);
				});

				it ('should watch the passed in scope properties', function() {
					expect($scope.$$watchers.length).toBe(2);
				});

				it('should return the value of the computing function', function() {
					expect($scope.helloWorld()).toBe('hello world');
				});

				it('should update the computed property if any of the dependencies change.', function() {
					expect($scope.helloWorld()).toBe('hello world');

					$scope.$apply($scope.test = 'greetings');

					expect($scope.helloWorld()).toBe('greetings world');

					$scope.$apply(function() {
						$scope.test = 'what\'s up';
						$scope.test2 = 'homie';
					});

					expect($scope.helloWorld()).toBe('what\'s up homie');
				});

				it('should be able to work with nested object properties', function() {
					$scope.myObject = {
						anotherObject: {
							boss: 'Howard'
						},
						ceo: 'Jason',
						ranking: c6Computed($scope, function(boss, ceo) {
							return 'My boss is ' + boss + '. The CEO is ' + ceo + '.';
						}, ['myObject.anotherObject.boss', 'myObject.ceo'])
					};

					expect($scope.myObject.ranking()).toBe('My boss is Howard. The CEO is Jason.');

					$scope.myObject.ceo = 'Steve Jobs';
					$scope.$digest();

					expect($scope.myObject.ranking()).toBe('My boss is Howard. The CEO is Steve Jobs.');
				});

				it('should allow computed properties to be dependencies of other computed properties.', function() {
					$scope.gender = 'Male';
					$scope.firstName = 'Howard';
					$scope.lastName = 'Engelhart';
					$scope.fullName = c6Computed($scope, function(firstName, lastName) {
						return firstName + ' ' + lastName;
					}, ['firstName', 'lastName']);
					$scope.profile = c6Computed($scope, function(fullName, gender) {
						return 'Name: ' + fullName + ', Gender: ' + gender + '.';
					}, ['fullName()', 'gender']);

					expect($scope.fullName()).toBe('Howard Engelhart');
					expect($scope.profile()).toBe('Name: Howard Engelhart, Gender: Male.');

					$scope.gender = 'Female';
					$scope.$digest();

					expect($scope.profile()).toBe('Name: Howard Engelhart, Gender: Female.');

					$scope.firstName = 'Jessica';
					$scope.$digest();

					expect($scope.profile()).toBe('Name: Jessica Engelhart, Gender: Female.');
				});
			});
		});
	});
})();
