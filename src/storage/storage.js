(function(){
    'use strict';

    angular.module('c6.ui')
    .provider('c6LocalStorage',[ function(){
        var config = {
            prefix : 'c6::'
        };

        Object.defineProperty(this,'prefix',{
            get : function() {
                        return config.prefix;
                    },
            set : function(val) {
                        config.prefix = val;
                        return this;
                    }
        });

        this.$get = ['$window','c6EventEmitter',function($window,emitter){
            var store = $window.localStorage;

            function C6LocalStorage(){

            }

            C6LocalStorage.prototype.makeKey = function(key){
                return (config.prefix + key);
            };

            C6LocalStorage.prototype.getKey = function(storageKey) {
                return storageKey.replace(config.prefix,'');
            };

            C6LocalStorage.prototype.isPrefixKey = function(storageKey){
                var base = config.prefix ;
                return (storageKey.substr(0,base.length) === base) ? true : false;
            };

            C6LocalStorage.prototype.set = function(key,value){

                try {
                    if (angular.isObject(value) || angular.isArray(value)){
                        value = angular.toJson(value);
                    }

                    var storageKey = this.makeKey(key);

                    store.setItem(storageKey,value);

                    this.emit('setItem', storageKey, key, value);
                } catch (e) {
                    this.emit('setItemError', e, key, value);
                }

                return this;
            };

            C6LocalStorage.prototype.get = function(key){
                var storageKey = this.makeKey(key), item;

                item = store.getItem(storageKey);

                if (!item || item === 'null') {
                    return null;
                }

                if (isNaN(item) && ((item.charAt(0) === '{') || (item.charAt(0) === '['))){
                    return angular.fromJson(item);
                }

                return item;
            };

            C6LocalStorage.prototype.getKeys = function(){
                var key, keys = [];

                for (key in store){
                    if (this.isPrefixKey(key)){
                        keys.push(this.getKey(key));
                    }
                }

                return keys;
            };

            C6LocalStorage.prototype.remove = function(key){
                try {
                    var storageKey = this.makeKey(key);

                    store.removeItem(storageKey);

                    this.emit('removeItem', storageKey, key);
                } catch (e) {
                    this.emit('removeItemError', e, key);
                }

                return this;
            };

            C6LocalStorage.prototype.removeAll = function(){

                try {
                    var keys = this.getKeys(), self = this;
                    keys.forEach(function(key){
                        self.remove(key);
                    });
                    this.emit('removeAll',keys);
                }catch(e){
                    this.emit('removeAllError',e);
                }
                return this;
            };

            return emitter(new C6LocalStorage());
        }];
    }]);


}());
