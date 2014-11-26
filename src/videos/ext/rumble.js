define (['angular','../../events/emitter','../../url/urlparser','../../browser/info',
         './lib/vimeo_interface/directive','./lib/vimeo_interface/service'],
function( angular , eventsEmitter        , urlUrlparser        , browserInfo        ,
          vimeoInterfaceDirective         , vimeoInterfaceService         ) {
    'use strict';

    return angular.module('c6.ui.videos.ext.rumble', [
        eventsEmitter.name,
        urlUrlparser.name,
        browserInfo.name
    ])
        .service('RumblePlayerService', vimeoInterfaceService('rumble.com'))
        .directive('rumblePlayer', vimeoInterfaceDirective(
            'rumble',
            '//rumble.com/embed/{videoid}/?api=1&player_id={id}',
            'RumblePlayerService'
        ));
});
