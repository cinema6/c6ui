define(['storage/storage'], function(storageStorage){
    'use strict';

    describe('c6LocalStorage',function(){
        var c6LocalStorage, $window;
        
        beforeEach(function(){
            $window = {
                localStorage : {
                    setItem    : jasmine.createSpy('localStorage.setItem'),
                    getItem    : jasmine.createSpy('localStorage.getItem'),
                    removeItem : jasmine.createSpy('localStorage.removeItem')
                }
            };

            module(storageStorage.name, function($provide){
               $provide.value('$window',$window);
            });

            inject(['$injector',function($injector){
                c6LocalStorage  = $injector.get('c6LocalStorage');
            }]);
        });

        describe('storage keys',function(){
            
            it('should be made from normal keys',function(){
                expect(c6LocalStorage.makeKey('abc')).toEqual('c6::abc');
            });

            it('should parse out normal keys', function(){
                expect(c6LocalStorage.getKey('c6::abc')).toEqual('abc');
            });

            it('should be testable', function(){
                expect(c6LocalStorage.isPrefixKey('c6::abc')).toEqual(true);
                expect(c6LocalStorage.isPrefixKey('c6__abc')).toEqual(false);
            });

        });

        describe('set method',function(){

            it('stores strings as strings',function(){
                c6LocalStorage.set('abc','hello mother');
                expect($window.localStorage.setItem)
                    .toHaveBeenCalledWith('c6::abc','hello mother');
            });

            it('stores numbers as numbers',function(){
                c6LocalStorage.set('abc',5);
                expect($window.localStorage.setItem)
                    .toHaveBeenCalledWith('c6::abc',5);
            });

            it('stores objects as JSON',function(){
                c6LocalStorage.set('abc', { x : 1 });
                expect($window.localStorage.setItem)
                    .toHaveBeenCalledWith('c6::abc','{"x":1}');
            });

            it('emits setItem event when setting an item',function(){
                var setItemSpy = jasmine.createSpy('c6LocalStorage.setItem');
                c6LocalStorage.on('setItem',setItemSpy);
                c6LocalStorage.set('abc',123);
                expect(setItemSpy).toHaveBeenCalledWith('c6::abc','abc',123);
            });

            it('emits setItemError when an error occurs',function(){
                var setItemErrorSpy = jasmine.createSpy('c6LocalStorage.setItemError'),
                    e = new Error('this is an error');
                $window.localStorage.setItem.andCallFake(function(){
                    throw e;
                });
                c6LocalStorage.on('setItemError',setItemErrorSpy);
                c6LocalStorage.set('abc');
                expect(setItemErrorSpy).toHaveBeenCalledWith(e,'abc', undefined);
            });
        });

        describe('get method', function(){
            it('gets a string as a string', function(){
                $window.localStorage.getItem.andReturn('xyz');
                expect(c6LocalStorage.get('abc')).toEqual('xyz');
                expect($window.localStorage.getItem).toHaveBeenCalledWith('c6::abc');
            });

            it('gets a number as a number', function(){
                $window.localStorage.getItem.andReturn(5);
                expect(c6LocalStorage.get('abc')).toEqual(5);
            });

            it('gets a json string as an object', function(){
                var obj = { x : 5, y : 'apple'  },
                    objJson = JSON.stringify(obj);

                $window.localStorage.getItem.andReturn(objJson);
                expect(c6LocalStorage.get('abc')).toEqual(obj);
            });

            it('gets a json array string as an object', function(){
                var obj = [ 1, 4, 'apple', 5],
                    objJson = JSON.stringify(obj);

                $window.localStorage.getItem.andReturn(objJson);
                expect(c6LocalStorage.get('abc')).toEqual(obj);
            });

        });

        describe('getKeys method', function(){

            it('returns an empty array if there are none', function(){
                expect(c6LocalStorage.getKeys()).toEqual([]);
            });

            it('gets keys that it should',function(){
                $window.localStorage['c6::key1'] = 1;
                $window.localStorage['c6::key2'] = 1;
                $window.localStorage['c6::key3'] = 1;
                expect(c6LocalStorage.getKeys()).toEqual(['key1','key2','key3']);
            });

        });

        describe('remove method', function(){
            
            it('removes items', function(){
                c6LocalStorage.remove('abc');
                expect($window.localStorage.removeItem).toHaveBeenCalledWith('c6::abc');
            });

            it('emits removeItem event when removing an item',function(){
                var removeItemSpy = jasmine.createSpy('c6LocalStorage.removeItem');
                c6LocalStorage.on('removeItem',removeItemSpy);
                c6LocalStorage.remove('abc');
                expect(removeItemSpy).toHaveBeenCalledWith('c6::abc','abc');
            });

            it('emits removeItemError event when an error occurs', function(){
                var removeItemErrorSpy = 
                        jasmine.createSpy('c6LocalStorage.removeItemError'),
                    e = new Error('this is an error');
                $window.localStorage.removeItem.andCallFake(function(){
                    throw e;
                });
                c6LocalStorage.on('removeItemError',removeItemErrorSpy);
                c6LocalStorage.remove('abc');
                expect(removeItemErrorSpy).toHaveBeenCalledWith(e,'abc');
            });
        });

        describe('removeAll method', function(){

            it('removes all items with service prefix', function(){
                $window.localStorage['c6::key1']    = 1;
                $window.localStorage['x-key1']      = 1;
                $window.localStorage['c6::key2']    = 1;
                $window.localStorage['x-key2']      = 1;
                $window.localStorage['c6::key3']    = 1;
                c6LocalStorage.removeAll();
                expect($window.localStorage.removeItem.callCount).toEqual(3);
                expect($window.localStorage.removeItem.argsForCall[0])
                    .toEqual(['c6::key1']);
                expect($window.localStorage.removeItem.argsForCall[1])
                    .toEqual(['c6::key2']);
                expect($window.localStorage.removeItem.argsForCall[2])
                    .toEqual(['c6::key3']);
            });

            it('emits removeAll event after removing all',function(){
                $window.localStorage['c6::key1']    = 1;
                $window.localStorage['x-key1']      = 1;
                $window.localStorage['c6::key2']    = 1;
                $window.localStorage['x-key2']      = 1;
                $window.localStorage['c6::key3']    = 1;
                var removeAllSpy = jasmine.createSpy('c6LocalStorage.removeAll');
                c6LocalStorage.on('removeAll',removeAllSpy);
                c6LocalStorage.removeAll();
                expect(removeAllSpy).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
            });

            it('emits removeAll with empty array after removing none',function(){
                var removeAllSpy = jasmine.createSpy('c6LocalStorage.removeAll');
                c6LocalStorage.on('removeAll',removeAllSpy);
                c6LocalStorage.removeAll();
                expect(removeAllSpy).toHaveBeenCalledWith([]);
            });

            it('emits removeAllError if an error occurs in getKeys',function(){
                var removeAllErrorSpy = 
                        jasmine.createSpy('c6LocalStorage.removeAllError'),
                    e = new Error('this is an error');
                spyOn(c6LocalStorage,'getKeys').andCallFake(function(){
                    throw e;
                });
                c6LocalStorage.on('removeAllError',removeAllErrorSpy);
                c6LocalStorage.removeAll();
                expect(removeAllErrorSpy).toHaveBeenCalledWith(e);
            });

            it('emits removeItem errors if errors occur with removing item',function(){
                $window.localStorage['c6::key1']    = 1;
                $window.localStorage['x-key1']      = 1;
                $window.localStorage['c6::key2']    = 1;
                $window.localStorage['x-key2']      = 1;
                $window.localStorage['c6::key3']    = 1;
                var removeItemErrorSpy = 
                        jasmine.createSpy('c6LocalStorage.removeItemError'),
                    e = new Error('this is an error');
                $window.localStorage.removeItem.andCallFake(function(key){
                    if (key === 'c6::key2' || key === 'c6::key3'){
                        throw e;
                    }
                });
                c6LocalStorage.on('removeItemError',removeItemErrorSpy);
                c6LocalStorage.removeAll();
                expect(removeItemErrorSpy.callCount).toEqual(2);
                expect(removeItemErrorSpy.argsForCall[0]).toEqual([e,'key2']);
                expect(removeItemErrorSpy.argsForCall[1]).toEqual([e,'key3']);
            });
        });
    });

    describe('c6LocalStorage Provider', function(){
        it('can configure the prefix', function(){
            module(storageStorage.name, ['c6LocalStorageProvider', function(provider){
                provider.prefix = 'yyy_';
            }]);
            inject(['c6LocalStorage', function(c6LocalStorage){ 
                expect(c6LocalStorage.makeKey('abc')).toEqual('yyy_abc');
            }]);
        });
    });
});
