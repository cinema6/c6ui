define([
    'angular',
    'alias/alias',
    'browser/info',
    'browser/user_agent',
    'cinema6/cinema6',
    'computed/computed',
    'debounce/debounce',
    'events/emitter',
    'format/format',
    'http/http',
    'imagepreloader/imagepreloader',
    'postmessage/postmessage',
    'storage/storage',
    'url/urlmaker',
    'url/urlparser',
    'videos/video'
], function(angular) {
    'use strict';

    var modules = Array.prototype.slice.call(arguments, 1);

    return angular.module('c6.ui', modules.map(function(module) {
        return module.name;
    })).service('c6ui', [function() {
        this.array = {
            lastItem: function(array) {
                return array[array.length - 1];
            }
        };
    }]);
});
