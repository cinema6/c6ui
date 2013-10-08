(function(){
    'use strict';

    define(['format/format'], function(){
        
        describe('c6Formatter',function(){
            var c6Formatter;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['c6Formatter',function(_c6Formatter_) {
                c6Formatter = _c6Formatter_;
            }]));
            
            it('should exist', function(){
                expect(c6Formatter).toBeDefined('c6Formatter');
            });

            describe('basic', function(){
                it('should create a format function with context', function(){
                    var fmt = c6Formatter('someFunction');
                    expect(fmt('this is a test')).toEqual('{someFunction} this is a test');
                });
                
                it('should create a format function with no context', function(){
                    var fmt = c6Formatter();
                    expect(fmt('this is a test')).toEqual('this is a test');
                });
            });

            describe('interpolation',function(){
                var fmt;
                beforeEach(function(){
                    fmt = c6Formatter('myFunc');
                });

                it('should handle a single variable', function(){
                    expect(fmt('this %1 a test','is')).toEqual('{myFunc} this is a test');
                });

                it('should handle a variable at the start', function(){
                    expect(fmt('%1 is a test','this')).toEqual('{myFunc} this is a test');
                });

                it('should handle a variable at the end', function(){
                    expect(fmt('this is a %1','test')).toEqual('{myFunc} this is a test');
                });

                it('should handle a percent at the end', function(){
                    expect(fmt('this is a %','test')).toEqual('{myFunc} this is a %');
                });

                it('should handle a percent in the middle', function(){
                    expect(fmt('this is a % test','test')).toEqual('{myFunc} this is a % test');
                });

                it('should handle a double percent in the middle', function(){
                    expect(fmt('this is a %%1 test','3')).toEqual('{myFunc} this is a %3 test');
                });

                it('should handle multiple variables',function(){
                    expect(fmt('this %1 %2 test','is','a')).toEqual('{myFunc} this is a test');
                });
                
                it('should handle repeat variables',function(){
                    expect(fmt('this %1 %1 test','is','a')).toEqual('{myFunc} this is is test');
                });

                it('should handle out of range variables',function(){
                    expect(fmt('this %2 a test','is')).toEqual('{myFunc} this %2 a test');
                    expect(fmt('this %0 a test','is')).toEqual('{myFunc} this %0 a test');
                });
                
                it('should handle no context',function(){
                    var fmt = c6Formatter();
                    expect(fmt('this %1 a test','is')).toEqual('this is a test');
                });

            });
        });

        describe('c6Formatter configuration', function(){
            describe('disable formatting',function(){
                it('can disable all formatting', function(){
                    module('c6.ui', ['c6FormatterProvider', function(provider){
                        provider.disable(); 
                    }]);
                    inject(['c6Formatter', function(c6Formatter){ 
                        var fmt = c6Formatter('myFunc'),
                            testString = 'this is a test';
                        expect(fmt(testString)).toBe(testString);

                        testString = 'this is a %1 test';
                        expect(fmt(testString,'great')).toBe(testString);
                    }]);
                });
                
                it('can disable interpolated formatting', function(){
                    module('c6.ui', ['c6FormatterProvider', function(provider){
                        provider.disableInterpolation(); 
                    }]);
                    inject(['c6Formatter', function(c6Formatter){ 
                        var fmt = c6Formatter('myFunc'),
                            testString = 'this is a test';
                        expect(fmt(testString)).toEqual('{myFunc} this is a test');

                        testString = 'this is a %1 test';
                        expect(fmt(testString,'great')).toEqual('{myFunc} this is a %1 test');
                    }]);
                });
            }); 
            describe('fnFormat',function(){
                it('can return the current basic format function',function(){
                    module('c6.ui', ['c6FormatterProvider', function(provider){
                        var func  = provider.fnFormat(); 
                        expect(angular.isFunction(func)).toBeTruthy();

                        expect(func('myFunc','this is a test'))
                            .toEqual('{myFunc} this is a test');
                    }]);
                    inject(['c6Formatter', function(c6Formatter){ }]);
                });

                it('can override basic formatting', function(){
                    module('c6.ui', ['c6FormatterProvider', function(provider){
                        provider.fnFormat(function(context,line){
                            return '[' + context + '] ' + line;    
                        }); 
                    }]);
                    inject(['c6Formatter', function(c6Formatter){ 
                        var fmt = c6Formatter('myFunc'),
                            testString = 'this is a test';
                        expect(fmt(testString)).toEqual('[myFunc] this is a test');

                        testString = 'this is a %1 test';
                        expect(fmt(testString,'great'))
                            .toEqual('[myFunc] this is a great test');
                    }]);
                });

                it('requires a valid formatter function when passed an arg', function(){
                    expect(function(){
                        module('c6.ui', ['c6FormatterProvider', function(provider){
                            provider.fnFormat('hello'); 
                        }]);
                        inject(['c6Formatter', function(c6Formatter){ }]);

                    }).toThrow();
                });
            });
        });
    });
}());
