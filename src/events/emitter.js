(function(){

    'use strict';
    angular.module('c6.ui')
    .factory('c6EventEmitter',['$log',function($log){
        var eventEmitter = (function(){
            var events       = {},
                maxListeners = 10,
                emitter      = {};
            
            emitter.on = function(eventName,listener, once){
                var evtBucket = events[eventName], 
                    itm = {
                        eventName : eventName,
                        listener  : listener,
                        reuse     : (once === true) ? false : true
                    };
                if (!evtBucket) {
                    evtBucket = events[eventName] = []; 
                }

                evtBucket.push(itm);

                if ((maxListeners > 0) && (maxListeners < evtBucket.length)) {
                    $log.error('Event [' + eventName + '] listeners (' + evtBucket.length + 
                        ') exceeds max(' + maxListeners + ').');
                }
                
                return this;
            };

            emitter.once = function(eventName,listener){
                return emitter.on(eventName,listener,true);
            };

            emitter.removeListener = function(eventName,listener){
                var evtBucket = events[eventName];
                if (evtBucket){
                    for (var i = 0; i < evtBucket.length; i++){
                        if (evtBucket[i].listener === listener){
                            evtBucket.splice(i--,1);
                        }
                    }
                }

                return this;
            };
            
            emitter.removeAllListeners = function(eventName){
                if (eventName) {
                    events[eventName] = [];
                } else {
                    angular.forEach(events,function(val,key){
                        events[key] = [];
                    });
                }

                return this;
            };

            emitter.setMaxListenersWarning = function(max){
                maxListeners = max; 
                return this;
            };

            emitter.listeners = function(eventName){
                var evtBucket = events[eventName],
                    result    = [];

                if (evtBucket){
                    for (var i = 0, ct = evtBucket.length; i < ct; i++){
                        result.push(evtBucket[i].listener);
                    }
                }

                return result;
            };

            emitter.emit = function(eventName){
                var evtBucket = events[eventName], result = false;
                if (evtBucket){
                    var copy = [].slice.call(arguments);
                    copy.shift();
                    for (var i = 0; i < evtBucket.length; i++){
                        evtBucket[i].listener.apply(evtBucket[i].listener,copy);
                        result = true;
                        if (evtBucket[i].reuse === false){
                            evtBucket.splice(i--,1);
                        }
                    }
                }

                return result;
            };

            return emitter;
        }());

        return function(dst){
            return angular.extend(dst,eventEmitter);             
        };

    }]);

}());
