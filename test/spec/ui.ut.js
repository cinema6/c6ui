define(['c6ui'], function(c6uiModule) {
    'use strict';

    describe('c6uiService', function() {
        var c6ui;

        beforeEach(function() {
            module(c6uiModule.name);
            inject(function(_c6ui_) {
                c6ui = _c6ui_;
            });
        });

        it('should exist', function() {
            expect(c6ui).toBeDefined();
        });

        describe('methods', function() {
            describe('array', function() {
                it('should exist', function() {
                    expect(c6ui.array).toBeDefined();
                });

                describe('lastItem(array)', function() {
                    it('should return the last item of an array', function() {
                        var lastItem = c6ui.array.lastItem;

                        expect(lastItem(['jason', 'howard', 'moo'])).toBe('moo');
                        expect(lastItem(['josh', 'evan', 'steph'])).toBe('steph');
                    });
                });
            });
        });
    });
});
