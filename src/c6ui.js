define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.ui',[])
        .service('c6ui', [function() {
            this.array = {
                lastItem: function(array) {
                    return array[array.length - 1];
                }
            };
        }]);
});
