define (['angular','../../events/emitter','../../url/urlparser','../../browser/info',
         './lib/vimeo_interface/directive','./lib/vimeo_interface/service'],
function( angular , eventsEmitter        , urlUrlparser        , browserInfo        ,
          vimeoInterfaceDirective         , vimeoInterfaceService         ) {
    'use strict';

    return angular.module('c6.ui.videos.ext.vimeo', [
        eventsEmitter.name,
        urlUrlparser.name,
        browserInfo.name
    ])
        .service('VimeoPlayerService', vimeoInterfaceService('player.vimeo.com'))
        .directive('vimeoPlayer', vimeoInterfaceDirective(
            'vimeo',
            '//player.vimeo.com/video/{videoid}?api=1&player_id={id}',
            'VimeoPlayerService'
        ));
});
