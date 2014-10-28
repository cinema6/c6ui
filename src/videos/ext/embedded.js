define (['angular','../../events/emitter'],
function( angular , eventsEmitter        ) {
    'use strict';

    return angular.module('c6.ui.videos.ext.embedded', [eventsEmitter.name])
        .directive('embeddedPlayer', ['$timeout','c6EventEmitter','$document',
        function                     ( $timeout , c6EventEmitter , $document ) {
            $document.find('head').append('<style>embedded-player {display:inline-block;}</style>');

            function link(scope, $element) {
                var iface = new Video();

                function Video() {
                    var self = this,
                        state = createState();

                    function createState() {
                        return {
                            readyState: -1
                        };
                    }

                    function load(code) {
                        if (!code) { return; }

                        $element.html(code);

                        state = createState();

                        $timeout(function() {
                            state.readyState = 0;
                            self.emit('ready');
                        });
                    }

                    Object.defineProperties(this, {
                        readyState: {
                            get: function() {
                                return state.readyState;
                            }
                        }
                    });

                    this.reload = function() {
                        return load(scope.code);
                    };

                    ['play', 'pause', 'load'].forEach(function(method) {
                        this[method] = function() {
                            return new Error('<embedded-player> cannot ' + method + '.');
                        };
                    }, this);

                    scope.$watch('code', load);

                    c6EventEmitter(this);
                }

                scope.$emit('<embedded-player>:init', iface);
                $element.data('video', iface);
            }

            return {
                restrict: 'E',
                scope: {
                    code: '@'
                },
                link: link
            };
        }]);
});
