(function(){
    'use strict';
    
    window._mockWindow = {
        navigator : {
            userAgent : 'foo'
        }
    };

    define(['browser/browser'], function(){
        describe('kc6Browser',function(){
            var kc6Browser;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['kc6Browser',function(_kc6Browser) {
                kc6Browser = _kc6Browser;
            }]));

            it('should exist',function(){
                expect(kc6Browser).toBeDefined();
                expect(kc6Browser()).toEqual(14);
            });

        });

    });

}());
