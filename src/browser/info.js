/*
        this.inlineVideoAllowed = function() {
            if (this.app.name === null){
                return null;
            }
            return (this.device.isIPhone() || this.device.isIPod()  || this.app.name === 'silk') ? false : true;
        };

        this.multiPlayersAllowed = function(){
            if (this.app.name === null){
                return null;
            }
            return (this.device.isIOS() || this.app.name === 'silk') ? false : true;
        };

        this.videoOnCanvasAllowed = function(){
            var macOSX;
            if (this.app.name === null){
                return null;
            }

            if ((this.os.name === 'mac') && (this.os.version !== null) ){
                var m = this.os.version.match(/(\d+\.\d+)/);
                if (m !== null){
                    macOSX = parseFloat(m[1]);
                }
            }

            return ( this.device.isIOS()        ||
                     (this.app.name === 'silk') ||
                     (this.app.name === 'safari' && macOSX >= 10.6)
                    ) ? false : true;
        };

 * */
(function() {
    'use strict';

    angular.module('c6.ui')
        /*.service('c6BrowserInfo', [function() {

        }]);*/
})();
