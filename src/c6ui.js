(function(){
    'use strict';
    /**
     * C6UI Module
     *
     * @module c6ui
     **/
    angular.module('c6.ui',[])
        /**
         * This service contains useful, general-purpose utility functions.
         *
         * @module c6ui
         * @class c6ui
         **/
        .service('c6ui', [function() {
            this.array = {
                /**
                 * Return the last item of an array.
                 *
                 * @method array.lastItem
                 **/
                lastItem: function(array) {
                    return array[array.length - 1];
                }
            };
        }]);
}());
