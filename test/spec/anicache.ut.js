(function(){
    'use strict';

    define(['anicache/anicache'], function(){
        
        describe('c6AniCache',function(){
            var c6AniCache;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['c6AniCache',function(_c6AniCache_) {
                c6AniCache = _c6AniCache_;
            }]));
            
            it('should exist', function(){
                expect(c6AniCache).toBeDefined('c6AniCache');
            });
            
            it('should have the expected interface ', function(){
                expect(c6AniCache.emit).toBeDefined('emit');
                expect(c6AniCache.listeners).toBeDefined('listeners');
                expect(c6AniCache.on).toBeDefined('on');
                expect(c6AniCache.once).toBeDefined('once');
                expect(c6AniCache.removeAllListeners).toBeDefined('removeAllListeners');
                expect(c6AniCache.removeListener).toBeDefined('removeListener');
                expect(c6AniCache.setMaxListenersWarning).toBeDefined('setMaxListenersWarning');
                expect(c6AniCache.enabled).toBeDefined('enabled');
                expect(c6AniCache.cache).toBeDefined('cache');
                expect(c6AniCache.uncache).toBeDefined('uncache');
                expect(c6AniCache.cancelWithToken).toBeDefined('cancelWithToken');
                expect(c6AniCache.cancelAll).toBeDefined('cancelAll');
                expect(c6AniCache.data).toBeDefined('data');
            });

            describe('events',function(){

                it('should work', function(){
                    var count = 0;
                    c6AniCache.enabled(true);
                    c6AniCache.on('create'  ,function(id){ if (id === 'test'){ count++; } });
                    c6AniCache.on('setup'   ,function(id){ if (id === 'test'){ count++; } });
                    c6AniCache.on('start'   ,function(id){ if (id === 'test'){ count++; } });
                    c6AniCache.on('complete',function(id){ if (id === 'test'){ count++; } });

                    var ani = c6AniCache({
                        id : 'test',
                        setup : function(element){
                        },
                        start : function(element,done){
                            done();
                        }
                    });

                    ani.setup({});

                    ani.start({},function(){});

                    expect(count).toEqual(4);
                });
            });

            describe('data', function(){
                var data3 = {
                    'val_a' : 'a',
                    'val_b' : 3
                };
                beforeEach(function(){
                    c6AniCache
                        .data('key1','value1')
                        .data('key2', 2)
                        .data('key3', data3);
                });

                it('should allow data to be retrieved by key', function(){
                    expect(c6AniCache.data('key1')).toEqual('value1');
                    expect(c6AniCache.data('key2')).toEqual(2);
                    expect(c6AniCache.data('key3')).toBe(data3);
                });
            });
        });
    });
}());

