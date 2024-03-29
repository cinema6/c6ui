define([
    'angular',
    './ext/youtube',
    './ext/vimeo',
    './ext/dailymotion',
    './ext/embedded',
    './ext/rumble'
], function(
    angular
) {
    'use strict';

    var modules = Array.prototype.slice.call(arguments, 1);

    return angular.module('c6.ui.videos.ext', modules.map(function(module) {
        return module.name;
    }));
});
