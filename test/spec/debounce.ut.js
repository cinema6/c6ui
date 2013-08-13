(function(jasmine) {
	'use strict';

	define(['debounce/debounce'], function() {
		describe('c6Debounce', function() {
			var c6Debounce,
				$window;

			beforeEach(function() {
				module('c6.ui');
				module(function($provide) {
					$provide.factory('$timeout', function($window) {
						return $window.setTimeout;
					});
				});
				inject(function(_c6Debounce_, _$window_) {
					c6Debounce = _c6Debounce_;
					$window = _$window_;
				});
			});

			it('should exist', function() {
				expect(c6Debounce).toBeDefined();
			});

			it('should only run the provided function once per the provided amount of ms', function() {
				var spy = jasmine.createSpy(),
					count = 0,
					flag = false,
					debouncedSpy = c6Debounce(spy, 1000);

				var interval = $window.setInterval(function() {
					debouncedSpy();

					if (count++ === 300) {
						$window.clearInterval(interval);
						flag = true;
					}
				}, 1);

				waitsFor(function() {
					return flag;
				});
				runs(function() {
					expect(spy.callCount).toBeLessThan(250);
				});
			});

			it('should call a function multiple times (but not every time)', function() {
				var spy = jasmine.createSpy(),
					count = 0,
					flag = false,
					debouncedSpy = c6Debounce(spy, 50);

				var interval = $window.setInterval(function() {
					debouncedSpy();

					if (count++ === 300) {
						$window.clearInterval(interval);
						flag = true;
					}
				}, 1);

				waitsFor(function() {
					return flag;
				});
				runs(function() {
					expect(spy.callCount).toBeGreaterThan(15);
					expect(spy.callCount).toBeLessThan(250);
				});
			});

			it('should work with multiple functions at the same time', function() {
				var spy1 = jasmine.createSpy(),
					spy2 = jasmine.createSpy(),
					count = 0,
					flag = false,
					debouncedSpy1 = c6Debounce(spy1, 50),
					debouncedSpy2 = c6Debounce(spy2, 100);

				var interval = $window.setInterval(function() {
					debouncedSpy1();
					debouncedSpy2();

					if(count++ === 300) {
						$window.clearInterval(interval);
						flag = true;
					}
				}, 1);

				waitsFor(function() {
					return flag;
				});
				runs(function() {
					expect(spy1.callCount).toBeGreaterThan(spy2.callCount);
				});
			});

			it('should pass along the arguments', function() {
				var spy = jasmine.createSpy(),
					count = 0,
					flag = false,
					debouncedSpy = c6Debounce(spy, 10),
					args = ['hello', 'foo'];

				var interval = $window.setInterval(function() {
					debouncedSpy.apply(this, args);

					if (count++ === 50) {
						$window.clearInterval(interval);
						flag = true;
					}
				}, 1);

				waitsFor(function() {
					return flag;
				});
				runs(function() {
					expect(spy).toHaveBeenCalledWith(args);
				});
			});
		});
	});
})(jasmine);
