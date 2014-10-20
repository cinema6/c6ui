define (['angular','c6ui','modernizr','controllers'],
function( angular , c6ui , modernizr , controllers ) {
    'use strict';

    window.c6 = {
        kLogLevels: ['log', 'info', 'warn', 'error']
    };

    return angular.module('app', [c6ui.name, controllers.name])
        .config(['YouTubeDataServiceProvider',
        function( YouTubeDataServiceProvider ) {
            YouTubeDataServiceProvider.apiKey('AIzaSyAoR0-kvy_fIjYOKk0vMU6F2JIb1aCMd1g');
        }])
        .config(['VPAIDServiceProvider',
        function(VPAIDServiceProvider) {
            VPAIDServiceProvider.swfUrl('lib/c6ui/videos/swf/player.swf');
        }])
        .config(['VASTServiceProvider',
        function(VASTServiceProvider) {
            VASTServiceProvider.adTimeout(3);
        }]);
});
