(function(){
    'use strict';

    define(['events/emitter'], function(){

        describe('c6EventEmitter',function(){
            var c6EventEmitter;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['c6EventEmitter',function(_c6EventEmitter_) {
                c6EventEmitter = _c6EventEmitter_;
            }]));
            
            it('should exist', function(){
                expect(c6EventEmitter).toBeDefined('c6EventEmitter');
            });
            
            it('should add the expected methods to an object ', function(){
                var emitter = c6EventEmitter({ });
                expect(emitter.emit).toBeDefined('emit');
                expect(emitter.listeners).toBeDefined('listeners');
                expect(emitter.on).toBeDefined('on');
                expect(emitter.once).toBeDefined('once');
                expect(emitter.removeAllListeners).toBeDefined('removeAllListeners');
                expect(emitter.removeListener).toBeDefined('removeListener');
                expect(emitter.setMaxListenersWarning).toBeDefined('setMaxListenersWarning');
            });

            describe('adding and removing of listeners', function(){
                var emitter,
                    event1List, event2List, event3List,
                    testFunc_1_0 = function(){ return 'testEvent1-0'; },
                    testFunc_2_0 = function(){ return 'testEvent2-0'; },
                    testFunc_2_1 = function(){ return 'testEvent2-1'; },
                    testFunc_3_0 = function(){ return 'testEvent3-0'; },
                    testFunc_3_1 = function(){ return 'testEvent3-1'; },
                    testFunc_3_2 = function(){ return 'testEvent3-2'; };

                beforeEach(function(){
                    emitter = c6EventEmitter({ });

                    // Emitter on returns a ref to the emitter for chaining
                    emitter.on('testEvent1',testFunc_1_0);
                    emitter.on('testEvent2',testFunc_2_0); 
                    emitter.on('testEvent2',testFunc_2_1); 
                    emitter.on('testEvent3',testFunc_3_0); 
                    emitter.on('testEvent3',testFunc_3_1); 
                    emitter.on('testEvent3',testFunc_3_2); 
                });

                it('on should return reference to emitter',function(){
                    expect( emitter.on('testEvent1',testFunc_1_0) ).toBe(emitter);
                });

                it('should allow adding handlers',function(){
                    event1List = emitter.listeners('testEvent1');
                    event2List = emitter.listeners('testEvent2');
                    event3List = emitter.listeners('testEvent3');

                    expect(event1List.length).toEqual(1);
                    expect(event2List.length).toEqual(2);
                    expect(event3List.length).toEqual(3);
                    expect(event1List[0]()).toEqual('testEvent1-0');
                });

                it('should enable removal of a unique event listener',function(){
                    // Emitter on returns a ref to the emitter for chaining
                    expect( emitter.removeListener('testEvent2',testFunc_2_0) ).toBe(emitter);

                    event1List = emitter.listeners('testEvent1');
                    event2List = emitter.listeners('testEvent2');
                    event3List = emitter.listeners('testEvent3');
                    
                    expect(event1List.length).toEqual(1);
                    expect(event2List.length).toEqual(1);
                    expect(event3List.length).toEqual(3);
                    
                    expect(event2List[0]()).toEqual('testEvent2-1');
                }); 

                it('should enable removal of all listeners for an event', function(){
                    expect( emitter.removeAllListeners('testEvent2') ).toBe(emitter);
                    
                    event1List = emitter.listeners('testEvent1');
                    event2List = emitter.listeners('testEvent2');
                    event3List = emitter.listeners('testEvent3');
                    
                    expect(event1List.length).toEqual(1);
                    expect(event2List.length).toEqual(0);
                    expect(event3List.length).toEqual(3);
                });

                it('should enable removal of all listeners for all events', function(){
                    expect( emitter.removeAllListeners() ).toBe(emitter);
                    
                    event1List = emitter.listeners('testEvent1');
                    event2List = emitter.listeners('testEvent2');
                    event3List = emitter.listeners('testEvent3');
                    
                    expect(event1List.length).toEqual(0);
                    expect(event2List.length).toEqual(0);
                    expect(event3List.length).toEqual(0);
                });

                it('should warn on crossing MaxListeners', inject(['$log',function($log){
                    for (var i = 1; i <= 11; i++) {
                        emitter.on('textMaxListeners',function(){}); 
                    }

                    expect($log.error.logs.length).toEqual(1);
                    expect($log.error.logs[0].toString()).toEqual(
                        'Event [textMaxListeners] listeners (11) exceeds max(10).'
                    );

                }]));

                it('should not warn on crossing MaxListeners if set to 0', 
                                                            inject(['$log',function($log){
                    expect( emitter.setMaxListenersWarning(0) ).toBe(emitter);

                    for (var i = 1; i <= 11; i++) {
                        emitter.on('textMaxListeners',function(){}); 
                    }

                    expect($log.error.logs.length).toEqual(0);

                }]));
                
            });
            
            describe('emitting', function(){
                var emitter;
                
                beforeEach(function(){
                    emitter = c6EventEmitter({ });
                });

                it('should return false if there are no listeners',function(){
                    expect(emitter.emit('testEvent')).toEqual(false);
                });

                it('should only fire a once event once', function(){
                    var counter = 0;
                    emitter.once('testEvent',function(){ counter++; });
                    expect(emitter.emit('testEvent')).toEqual(true);
                    expect(emitter.emit('testEvent')).toEqual(false);
                    expect(counter).toEqual(1);
                });

                it('should fire regular events more than once', function(){
                    var counter = 0;
                    emitter.on('testEvent',function(){ counter++; });
                    expect(emitter.emit('testEvent')).toEqual(true);
                    expect(emitter.emit('testEvent')).toEqual(true);
                    expect(counter).toEqual(2);
                });

                it('should take arguments', function(){
                    var sum = 0;
                    emitter.on('testEvent', function(p1,p2,p3){
                        sum = p1 + p2;
                        if (p3) {
                            sum += p3;
                        }
                    });
                    expect(emitter.emit('testEvent',1,2)).toEqual(true);
                    expect(sum).toEqual(3);
                    sum = 0;
                    expect(emitter.emit('testEvent',3,4,5)).toEqual(true);
                    expect(sum).toEqual(12);
                });
            });
        });

    });

}());
