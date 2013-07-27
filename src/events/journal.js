(function(){

    'use strict';
    angular.module('c6.ui')
    .factory('c6Journal',['$timeout','c6EventEmitter',function($timeout,c6EventEmitter){

        function JournalEntry(name,data) {
            if (arguments[0].constructor === JournalEntry){
                var rhs = arguments[0];
                this.name    = rhs.name;
                this.data    = rhs.data;
                this.created = rhs.created;
                this.updated = rhs.updated;
                
            } else {
                this.name    = arguments[0];
                this.data    = arguments[1];
                this.created = new Date();
                this.updated = null;
            }
        };

        function createJournal(){
            var index   = -1,
                events  = [],
                journal = {};

            journal.valueOf = function(){
                return ('Index: ' + index + ', Size: ' + events.length);
            }

            journal.toString = function() { return journal.valueOf(); }

            journal.size = function(){
                return events.length;
            };

            journal.index = function(){
                return index;
            };

            journal.recordEvent = function(name,data){
                var self = this,
                    entry = events[++index];
                if (data === undefined) {
                    data = null;
                }
                if (!entry) {
                    events.push(new JournalEntry(name,data));
                    return self;
                }
                if ((entry.name === name) && (entry.data === data)) {
                    entry.updated = new Date();
                    return self;
                } 
            
                if (entry.name === name){
                    var newEntry = new JournalEntry(entry),
                        emitIndex = index;
                    newEntry.data = data;
                    newEntry.updated  = new Date();
                    events[index] = newEntry;
                    $timeout(function(){
                        self.emit('historyIsRewritten',emitIndex,newEntry,entry);
                    },0);
                    return self;
                } 

                var newEntry = new JournalEntry(entry,data),
                    emitIndex = index;
                events[index] = newEntry;
                $timeout(function(){
                    self.emit('historyIsRewritten',emitIndex,newEntry,entry);
                },0);
            
                return self;
            };

            journal.getAt = function(idx) {
                if ((idx === undefined) || (idx === null)) {
                    idx = index;
                }

                if (idx < 0) {
                    throw new RangeError(idx + ' is too low.');
                }

                if (idx >= events.length) {
                    throw new RangeError(idx + ' is too high.');
                }

                return new JournalEntry(events[idx]);
            };

            journal.getHead = function() {
                if (events.length){
                    return new JournalEntry(events[0]);
                } 
                return undefined;
            };

            journal.getTail = function() {
                var pos = (events.length - 1);
                return (pos >= 0) ? new JournalEntry(events[pos]) : undefined;
            };

            journal.findFirst = function(name){
                var result = undefined;

                for (var i = 0, size = this.size(); i < size; i++){
                    if (events[i].name === name) {
                        result = new JournalEntry(events[i]);
                        break;
                    }
                }

                return result;
            };

            journal.findLast = function(name){
                var result = undefined;

                for (var i = (this.size() - 1); i >= 0; i--){
                    if (events[i].name === name) {
                        result = new JournalEntry(events[i]);
                        break;
                    }
                }

                return result;
            };
            
            journal.findAll = function(name){
                var result = undefined;

                for (var i = 0, size = this.size(); i < size; i++){
                    if (events[i].name === name) {
                        if (result === undefined){
                            result = [];
                        }
                        result.push(new JournalEntry(events[i]));
                    }
                }

                return result;
            };

            journal.clear = function(){
                index = -1;
                events = [];
                return this;
            };

            journal.shift = function() {
                var entry = events.shift();
                if (entry){
                    index--;
                }
                return entry;
            };

            journal.pop = function() {
                var entry = events.pop();
                if (entry){
                    index--;
                }
                return entry;
            };

            journal.moveTo = function(idx){
                if (idx < 0) {
                    throw new RangeError(idx + ' is too low.');
                }

                if ((idx >= events.length) || (idx > index)) {
                    throw new RangeError(idx + ' is too high.');
                }

                index = idx;

                return this;
            };


            journal.clear();
        
            return c6EventEmitter(journal);
        };


        return {
            'createJournal' : function(){ return createJournal(); }
        };
    }]);

}());

