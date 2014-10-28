define(['videos/ext/embedded'], function(embeddedModule) {
    'use strict';

    describe('<embedded-player>', function() {
        var $rootScope,
            $compile,
            $timeout,
            $scope,
            $embeddedPlayer;

        var $eventSpy;

        beforeEach(function() {
            $eventSpy = jasmine.createSpy('<embedded-player>:init');

            module(embeddedModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');

                $scope = $rootScope.$new();
                $scope.code = null;

                $scope.$on('<embedded-player>:init', $eventSpy);
                $scope.$apply(function() {
                    $embeddedPlayer = $compile('<embedded-player code="{{code}}"></embedded-player>')($scope);
                });
            });
        });

        it('should $emit <embedded-player>:init', function() {
            expect($eventSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object));
        });

        describe('when some code is provided', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $scope.code = '<p>Hello!</p>';
                });
            });

            it('should put the html into the element', function() {
                expect($embeddedPlayer.html()).toBe($scope.code);
            });

            describe('and it changes', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.code = '<span>Goodbye!</span>';
                    });
                });

                it('should replace the code', function() {
                    expect($embeddedPlayer.html()).toBe($scope.code);
                });
            });
        });

        describe('interface', function() {
            var iface;

            beforeEach(function() {
                iface = $embeddedPlayer.data('video');
            });

            it('should be accessible via jqLite', function() {
                expect($embeddedPlayer.data('video')).toEqual(jasmine.any(Object));
            });

            it('should be $emitted with the <embedded-player>:init $event', function() {
                expect($embeddedPlayer.data('video')).toBe($eventSpy.calls.mostRecent().args[1]);
            });

            describe('when the code changes', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.code = '<span>Code 1</span>';
                    });
                    $timeout.flush();
                    $scope.$apply(function() {
                        $scope.code = '<p>Code 2</p>';
                    });
                });

                it('should be reset', function() {
                    expect(iface.readyState).toBe(-1);
                });
            });

            describe('properties', function() {
                describe('readyState', function() {
                    it('should start as -1', function() {
                        expect(iface.readyState).toBe(-1);
                    });

                    it('should be ready-only', function() {
                        expect(function() {
                            iface.readyState = 1;
                        }).toThrow();
                    });

                    describe('after some code is provided', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.code = '<p>This is some code.</p>';
                            });
                            $timeout.flush();
                        });

                        it('should be 0', function() {
                            expect(iface.readyState).toBe(0);
                        });
                    });
                });
            });

            describe('events', function() {
                var spy;

                beforeEach(function() {
                    spy = jasmine.createSpy('event()');
                });

                describe('ready', function() {
                    beforeEach(function() {
                        iface.on('ready', spy);
                    });

                    describe('after some code is provided', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.code = '<strong>HEY!</strong>';
                            });
                            $timeout.flush();
                        });

                        it('should be emitted', function() {
                            expect(spy).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('reload', function() {
                    var originalNode;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.code = '<p>DAS CODE</p>';
                        });
                        $timeout.flush();
                        originalNode = $embeddedPlayer.children()[0];
                        $scope.$apply(function() {
                            iface.reload();
                        });
                    });

                    it('should reset the state', function() {
                        expect(iface.readyState).toBe(-1);
                    });

                    it('should create a new element', function() {
                        expect($embeddedPlayer.children()[0]).not.toBe(originalNode);
                    });
                });

                ['play', 'load', 'pause'].forEach(function(method) {
                    describe(method, function() {
                        var result;

                        beforeEach(function() {
                            result = iface[method]();
                        });

                        it('should return an error', function() {
                            expect(result).toEqual(jasmine.any(Error));
                        });
                    });
                });
            });
        });
    });
});
