(function(jasmine) {
	'use strict';

	define(['mouseactivity/mouseactivity'], function() {
		describe('c6MouseActivity', function() {
			var $compile,
				$rootScope,
				$timeout,
				activityStart,
				activityStop,
				element$;

			beforeEach(function() {
				module('c6.ui');
				inject(function(_$rootScope_, _$compile_, _$timeout_) {
					$compile = _$compile_;
					$rootScope = _$rootScope_;
					$timeout = _$timeout_;
				});
				activityStart = jasmine.createSpy();
				activityStop = jasmine.createSpy();

				element$ = $compile('<div c6-mouse-activity>Foo</div>')($rootScope);
				$rootScope.$on('c6MouseActivityStart', activityStart);
				$rootScope.$on('c6MouseActivityStop', activityStop);

				for (var i = 0; i < 20; i++) {
					element$.triggerHandler('mousemove');
				}
			});

			it('should emit the c6MouseActivityStart event on the first mousemove', function() {
				expect(activityStart.callCount).toBe(1);
			});

			it('should emit the c6MouseActivityStop event once after the mouse stops moving', function() {
				expect(activityStop).not.toHaveBeenCalled();
				$timeout.flush();
				expect(activityStop.callCount).toBe(1);
			});
		});
	});
})(jasmine);
