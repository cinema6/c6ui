(function(){
    'use strict';

    define(['events/journal'], function(){
        
        describe('c6Journal',function(){
            
            var c6Journal;
            beforeEach(module('c6.ui'));
            beforeEach(inject(['c6Journal',function(_c6Journal_) {
                c6Journal = _c6Journal_;
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
                    data = [];

                for (var i = 0; i < 5; i++){
                    data.push({
                        key     : 'key' + i,
                        value   : 'value' + i
                    });
                }

                beforeEach(function(){
                    journal = c6Journal.createJournal();
                });

                describe('recording interface',function(){

                    it('should work without data', function(){
                        expect(journal.recordEvent('eventA')).toEqual(1);
                        expect(journal.recordEvent('eventB')).toEqual(2);
                        expect(journal.recordEvent('eventC')).toEqual(3);
                    });

                    it('should work with data', function(){
                        expect(journal.recordEvent('eventA', data[0])).toEqual(1);
                        expect(journal.recordEvent('eventB', data[1])).toEqual(2);
                        expect(journal.recordEvent('eventC', data[2])).toEqual(3);
                    });

                    it('should work with duplicate keys', function(){
                        expect(journal.recordEvent('eventA')).toEqual(1);
                        expect(journal.recordEvent('eventA')).toEqual(2);
                        expect(journal.recordEvent('eventA')).toEqual(3);
                    });

                });

                describe('retrieval interface',function(){
                    beforeEach(function(){
                        journal.recordEvent('eventB', data[0]);
                        journal.recordEvent('eventA', data[1]);
                        journal.recordEvent('eventC', data[2]);
                        journal.recordEvent('eventA', data[3]);
                        journal.recordEvent('eventB', data[4]);
                    });

                    describe('findFirst',function(){

                        it('should find first event of many with same name',function(){
                            var itm  = journal.findFirst('eventA');
                            expect(itm.index).toEqual(1);
                            expect(itm.data).toBe(data[1]);
                            expect(itm.name).toEqual('eventA');
                        });

                        it('should find first event with unique name',function(){
                            var itm  = journal.findFirst('eventC');
                            expect(itm.index).toEqual(2);
                            expect(itm.data).toBe(data[2]);
                            expect(itm.name).toEqual('eventC');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findFirst('xxx')).not.toBeDefined();
                        });

                    });

                    describe('findLast', function(){
                        
                        it('should find last event of many with same name',function(){
                            var itm  = journal.findLast('eventA');
                            expect(itm.index).toEqual(3);
                            expect(itm.data).toBe(data[3]);
                            expect(itm.name).toEqual('eventA');
                        });

                        it('should find last event with unique name',function(){
                            var itm  = journal.findLast('eventC');
                            expect(itm.index).toEqual(2);
                            expect(itm.data).toBe(data[2]);
                            expect(itm.name).toEqual('eventC');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findFirst('xxx')).not.toBeDefined();
                        });

                    });

                    describe('findAll', function(){
                        it('should find all events of many with same name',function(){
                            var list  = journal.findAll('eventA');
                            expect(list[0].index).toEqual(1);
                            expect(list[0].data).toBe(data[1]);
                            expect(list[0].name).toEqual('eventA');
                            
                            expect(list[1].index).toEqual(3);
                            expect(list[1].data).toBe(data[3]);
                            expect(list[1].name).toEqual('eventA');
                        });

                        it('should find nothing with invalid name',function(){
                            expect(journal.findAll('xxx')).not.toBeDefined();
                        });

                    });

                });

            });
        });

    });

}());
            
