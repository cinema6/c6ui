define(['debounce/debounce'], function(debounceDebounce) {
    'use strict';

    describe('c6Debounce', function() {
        var c6Debounce,
            $window,
            $timeout;

        beforeEach(function() {
            module(debounceDebounce.name);
            inject(function(_c6Debounce_, _$window_, _$timeout_) {
                c6Debounce = _c6Debounce_;
                $window = _$window_;
                $timeout = _$timeout_;
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

            for (var i = 0; i < 300; i++) {
                debouncedSpy();
            }

            $timeout.flush();

            expect(spy.callCount).toBe(1);
        });

        it('should call a function multiple times (but not every time)', function() {
            var spy = jasmine.createSpy(),
                count = 0,
                flag = false,
                debouncedSpy = c6Debounce(spy, 50);

            for (var i = 0; i < 25; i++) {
                for (var j = 0; j < 100; j++) {
                    debouncedSpy();
                }
                $timeout.flush();
            }


            expect(spy.callCount).toBe(25);
        });

        it('should pass along the arguments', function() {
            var spy = jasmine.createSpy(),
                count = 0,
                flag = false,
                debouncedSpy = c6Debounce(spy, 10),
                args = ['hello', 'foo'];

            debouncedSpy.apply(this, args);

            $timeout.flush();

            expect(spy).toHaveBeenCalledWith(args);
        });
    });
});
