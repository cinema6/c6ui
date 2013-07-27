(function(){
    'use strict';

    define(['events/journal'], function(){
        
        describe('c6Journal',function(){
            
            var c6Journal, $timeout;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['c6Journal','$timeout',function(_c6Journal_,_$timeout_) {
                c6Journal = _c6Journal_;
                $timeout  = _$timeout_;
            }]));
            
            it('should exist', function(){
                expect(c6Journal).toBeDefined('c6Journal');
            });

            it('should create journals',function(){
                var journal = c6Journal.createJournal();
                expect(journal).toBeDefined();
            });

            describe('data',function(){
                var journal,
                    emptyJournal,
                    data = [];

                for (var i = 0; i < 5; i++){
                    data.push({
                        key     : 'key' + i,
                        value   : 'value' + i
                    });
                }

                beforeEach(function(){
                    journal      = c6Journal.createJournal();
                    emptyJournal = c6Journal.createJournal();
                });

                describe('recording interface',function(){

                    describe('recordEvent method', function(){
                        it('should work without data', function(){
                            expect(journal.recordEvent('eventA')).toBe(journal);
                            expect(journal.recordEvent('eventB')).toBe(journal);
                            expect(journal.recordEvent('eventC')).toBe(journal);
                        });

                        it('should work with data', function(){
                            expect(journal.recordEvent('eventA', data[0])).toBe(journal);
                            expect(journal.recordEvent('eventB', data[1])).toBe(journal);
                            expect(journal.recordEvent('eventC', data[2])).toBe(journal);
                        });

                        it('should work with duplicate keys', function(){
                            expect(journal.recordEvent('eventA')).toBe(journal);
                            expect(journal.recordEvent('eventA')).toBe(journal);
                            expect(journal.recordEvent('eventA')).toBe(journal);
                        });
                    });

                }); // recording interface

                describe('retrieval interface',function(){
                    beforeEach(function(){
                        journal.recordEvent('eventB', data[0]);
                        journal.recordEvent('eventA', data[1]);
                        journal.recordEvent('eventC', data[2]);
                        journal.recordEvent('eventA', data[3]);
                        journal.recordEvent('eventB', data[4]);
                    });

                    describe('size method', function(){
                        it('should return the number of events recorded when populated.',
                            function(){
                            expect(journal.size()).toEqual(5);
                        });
                        
                        it('should return 0 events when not populated.',
                            function(){
                            expect(emptyJournal.size()).toEqual(0);
                        });
                    });
                    
                    describe('index method', function(){
                        it('should be -1 on an empty journal.',function(){
                            expect(emptyJournal.index()).toEqual(-1);
                        });

                        it('should be zero after adding first event', function(){
                            expect(emptyJournal.index()).toEqual(-1);
                            emptyJournal.recordEvent('event1'); 
                            expect(emptyJournal.index()).toEqual(0);
                        });
                        
                        it('should increment as events are added', function(){
                            expect(emptyJournal.index()).toEqual(-1);
                            emptyJournal.recordEvent('event1'); 
                            expect(emptyJournal.index()).toEqual(0);
                            emptyJournal.recordEvent('event2'); 
                            expect(emptyJournal.index()).toEqual(1);
                            emptyJournal.recordEvent('event3'); 
                            expect(emptyJournal.index()).toEqual(2);
                        });
                    });


                    describe('getHead method', function() {
                        it('should return the first element when the journal is populated.',
                            function(){
                            var itm  = journal.getHead();
                            expect(itm.data).toBe(data[0]);
                            expect(itm.name).toEqual('eventB');
                        });

                        it('should return nothing when the journal is not populated.',
                            function(){
                            expect(emptyJournal.getHead()).not.toBeDefined();
                        });
                    });

                    describe('getTail method', function() {
                        it('should return the last element when the journal is populated.',
                            function(){
                            var itm  = journal.getTail();
                            expect(itm.data).toBe(data[4]);
                            expect(itm.name).toEqual('eventB');
                        });

                        it('should return nothing when the journal is not populated.',
                            function(){
                            expect(emptyJournal.getTail()).not.toBeDefined();
                        });
                    });

                    describe('getAt method', function() {
                        it ('should return the right element with a valid arg',function(){
                            var itm = journal.getAt(3);
                            expect(itm.data).toBe(data[3]);
                            expect(itm.name).toEqual('eventA');
                        });

                        it ('should throw Range Error when arg is too low',function(){
                            expect(function(){
                                journal.getAt(-1)
                            }).toThrow('-1 is too low.');
                        });

                        it ('should throw Range Error when arg is too high',function(){
                            expect(function(){
                                journal.getAt(10)
                            }).toThrow('10 is too high.');
                        });
                        
                        it ('should use the current index with no arg.', function(){
                            expect(journal.index()).toEqual(4);
                            var itm = journal.getAt();
                            expect(itm.data).toBe(data[4]);
                            expect(itm.name).toBe('eventB');
                        });

                        it ('should use the current index with no arg and throw if enpty.',
                            function(){
                            expect(emptyJournal.index()).toEqual(-1);
                            expect(function(){
                                emptyJournal.getAt()
                            }).toThrow('-1 is too low.');
                        });
                    });

                    describe('findFirst method',function(){

                        it('should find first event of many with same name',function(){
                            var itm  = journal.findFirst('eventA');
                            expect(itm.data).toBe(data[1]);
                            expect(itm.name).toEqual('eventA');
                        });

                        it('should find first event with unique name',function(){
                            var itm  = journal.findFirst('eventC');
                            expect(itm.data).toBe(data[2]);
                            expect(itm.name).toEqual('eventC');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findFirst('xxx')).not.toBeDefined();
                        });

                    });

                    describe('findLast method', function(){
                        
                        it('should find last event of many with same name',function(){
                            var itm  = journal.findLast('eventA');
                            expect(itm.data).toBe(data[3]);
                            expect(itm.name).toEqual('eventA');
                        });

                        it('should find last event with unique name',function(){
                            var itm  = journal.findLast('eventC');
                            expect(itm.data).toBe(data[2]);
                            expect(itm.name).toEqual('eventC');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findFirst('xxx')).not.toBeDefined();
                        });

                    });

                    describe('findAll method', function(){
                        it('should find all events of many with same name',function(){
                            var list  = journal.findAll('eventA');
                            expect(list[0].data).toBe(data[1]);
                            expect(list[0].name).toEqual('eventA');
                            
                            expect(list[1].data).toBe(data[3]);
                            expect(list[1].name).toEqual('eventA');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findAll('xxx')).not.toBeDefined();
                        });

                    });

                }); // end retrieval interface
                
                describe('removal interface',function(){
                    beforeEach(function(){
                        journal.recordEvent('eventB', data[0]);
                        journal.recordEvent('eventA', data[1]);
                        journal.recordEvent('eventC', data[2]);
                        journal.recordEvent('eventA', data[3]);
                        journal.recordEvent('eventB', data[4]);
                    });

                    describe('clear method', function(){

                        it('should remove all events from populated journal', function(){
                            expect(journal.size()).toEqual(5);
                            expect(journal.clear()).toBe(journal);
                            expect(journal.size()).toEqual(0);
                        });

                        it('should do nothing to an empty journal', function(){
                            expect(emptyJournal.size()).toEqual(0);
                            expect(emptyJournal.clear()).toBe(emptyJournal);
                            expect(emptyJournal.size()).toEqual(0);
                        });

                    });

                    describe('shift method', function(){

                        it('should remove first event from populated journal', function(){
                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(4);
                            var itm = journal.shift();
                            expect(itm.name).toEqual('eventB');
                            expect(itm.data).toEqual(data[0]);
                            expect(journal.size()).toEqual(4);
                            expect(journal.index()).toEqual(3);
                        });

                        it('should do nothing to an empty journal', function(){
                            expect(emptyJournal.size()).toEqual(0);
                            expect(emptyJournal.index()).toEqual(-1);
                            expect(emptyJournal.shift()).not.toBeDefined();
                            expect(emptyJournal.size()).toEqual(0);
                            expect(emptyJournal.index()).toEqual(-1);
                        });

                    });

                    describe('pop method', function(){

                        it('should remove last event from populated journal', function(){
                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(4);
                            var itm = journal.pop();
                            expect(itm.name).toEqual('eventB');
                            expect(itm.data).toEqual(data[4]);
                            expect(journal.size()).toEqual(4);
                            expect(journal.index()).toEqual(3);
                        });

                        it('should do nothing to an empty journal', function(){
                            expect(emptyJournal.size()).toEqual(0);
                            expect(emptyJournal.index()).toEqual(-1);
                            expect(emptyJournal.pop()).not.toBeDefined();
                            expect(emptyJournal.size()).toEqual(0);
                            expect(emptyJournal.index()).toEqual(-1);
                        });

                    });
                    

                }); // end manipulation interface
                
                describe('index manipulation interface',function(){
                    beforeEach(function(){
                        journal.recordEvent('eventB', data[0]);
                        journal.recordEvent('eventA', data[1]);
                        journal.recordEvent('eventC', data[2]);
                        journal.recordEvent('eventA', data[3]);
                        journal.recordEvent('eventB', data[4]);
                    });

                    describe('moveTo method', function(){
                        it('should move the index with a valid arg.',function(){
                            var itm;
                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(4);
                            itm = journal.getAt();
                            expect(itm.name).toEqual('eventB');
                            expect(itm.data).toBe(data[4]);

                            expect(journal.moveTo(0)).toBe(journal);

                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(0);
                            itm = journal.getAt();
                            expect(itm.name).toEqual('eventB');
                            expect(itm.data).toBe(data[0]);
                        });
                        
                        it ('should throw Range Error when arg is too low',function(){
                            expect(function(){
                                journal.moveTo(-1)
                            }).toThrow('-1 is too low.');
                        });

                        it ('should throw Range Error when arg is too high',function(){
                            expect(function(){
                                journal.moveTo(10)
                            }).toThrow('10 is too high.');
                        });
                    });

                    describe('recordEvent after moveTo', function(){

                        it('with same event and data should be silent',function(){
                            var historyChanged = false;
                            journal.on('historyIsRewritten',function(index,newVal,origVal){
                                historyChanged = true; 
                            });

                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(4);

                            // Move to index 1
                            journal.moveTo(1);

                            // Get what's in the next slot
                            var itmOrig = journal.getAt(journal.index() + 1);
                            expect(itmOrig.updated).toBeNull();

                            // Record over it with same event name and data
                            journal.recordEvent('eventC', data[2]);
                            
                            // The size of the journal should be the same and
                            // the index should have incremented to the next slot
                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(2);

                           
                            // Get what's there now
                            var itmNew = journal.getAt();
                            expect(itmNew.name).toEqual(itmOrig.name);
                            expect(itmNew.data).toBe(itmOrig.data);
                            expect(itmNew.updated).not.toBeNull();

                            expect(function(){ $timeout.flush(); }).toThrow();

                            expect(historyChanged).toBeFalsy();
                        });

                        it('with same event and differnt data should emit',function(){
                            var historyChanged = false;
                            journal.on('historyIsRewritten',function(index,newVal,origVal){
                                expect(newVal.name).toEqual(origVal.name);
                                expect(newVal.data).toBeNull();
                                expect(newVal.updated).not.toBeNull();
                                historyChanged = true; 
                            });

                            // Move to index 1
                            journal.moveTo(1);

                            // Get what's in the next slot
                            var itmOrig = journal.getAt(journal.index() + 1);
                            expect(itmOrig.updated).toBeNull();

                            // Record over it with same event name but no data
                            journal.recordEvent('eventC');
                            
                            // The size of the journal should be the same and
                            // the index should have incremented to the next slot
                            expect(journal.size()).toEqual(5);
                            expect(journal.index()).toEqual(2);

                           
                            // Get what's there now
                            var itmNew = journal.getAt();
                            expect(itmNew.name).toEqual(itmOrig.name);
                            expect(itmNew.data).toBeNull();
                            expect(itmNew.updated).not.toBeNull();

                            expect(function(){ $timeout.flush(); }).not.toThrow();

                            expect(historyChanged).toBeTruthy();

                        });
                    });
                }); // end index manipulation

            });
        });

    });

}());
            
