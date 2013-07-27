(function(){

    'use strict';
    angular.module('c6.ui')
    .factory('c6Journal',['$log',function($log){

        function JournalEntry(index,name,data,dateCreated) {
            if (isNaN(arguments[0])){
                var rhs = arguments[0];
                this.index   = rhs.index;
                this.name    = rhs.name;
                this.data    = rhs.data;
                this.created = rhs.created;
                
            } else {
                this.index   = arguments[0];
                this.name    = arguments[1];
                this.data    = arguments[2];
                this.created = ((arguments[3]) ? arguments[3] : new Date());
            }
        };

        function createJournal(){
            var index  = -1,
                events = [],
                journal = {};

            journal.valueOf = function(){
                return ('Index: ' + index + ', Size: ' + events.length);
            }

            journal.toString = function() { return journal.valueOf(); }

            journal.size = function(){
                return events.length;
            };

            journal.recordEvent = function(name,data){
                events.push(new JournalEntry(++index,name,data)); 
                return events.length;
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


            return journal;
        };


        return {
            'createJournal' : function(){ return createJournal(); }
        };
    }]);

}());

