(function(){
    'use strict';

    define(['panels/panels'], function(){
        var $compile,
            $rootScope,
            $timeout,
            $scope,
            $log,
            $element,
            c6AniCache;

        describe('c6Panels',function(){
            var c6Panels;
            beforeEach(module('c6.ui'));

            beforeEach(function(){
                inject(function(_$compile_,_$rootScope_,_$timeout_,_$log_,_c6AniCache_){
                    $compile        = _$compile_;
                    $rootScope      = _$rootScope_;
                    $timeout        = _$timeout_;
                    $log            = _$log_;
                    c6AniCache      = _c6AniCache_;
                });
            });
            describe('initialization',function(){
                beforeEach(function(){
                    $scope = $rootScope.$new();
                });

                describe('static',function(){
                    it('should use default with no duration',function(){
                        $element = $compile(
                           '<div c6-panels x-show="showPanels"></div>' 
                        )($scope);
                        $scope.$digest();
                        expect(c6AniCache.data('c6Panels').duration).toEqual(0.6);
                    });
                    it('should use a valid duration',function(){
                        $element = $compile(
                           '<div c6-panels x-duration="4" x-show="showPanels"></div>' 
                        )($scope);
                        $scope.$digest();
                        expect(c6AniCache.data('c6Panels').duration).toEqual(4);
                    });
                    it('should except if duration is invalid',function(){
                        expect(function(){
                            $element = $compile(
                               '<div c6-panels x-duration="\'apple\'" x-show="showPanels"></div>' 
                            )($scope);
                            $scope.$digest();
                        }).toThrow('Invalid duration: apple. c6Panels duration must be a number.');
                    });
                });

                describe('dynamic',function(){
                    beforeEach(function(){
                        $element = $compile(
                           '<div c6-panels x-duration="myDuration" x-show="showPanels"></div>' 
                        )($scope);
                        $scope.$digest();
                    });

                    it('should set the default duration into the anicache', function(){
                        expect(c6AniCache.data('c6Panels').duration).toEqual(0.6);
                    });

                    it('should handle changes to the duration', function(){
                        $scope.myDuration = 2;
                        $scope.$digest();
                        expect(c6AniCache.data('c6Panels').duration).toEqual(2);
                    });

                    it('should except if duration is invalid', function(){
                        expect(function(){
                            $scope.myDuration = 'apple';
                            $scope.$digest();
                        }).toThrow('Invalid duration: apple. c6Panels duration must be a number.');
                    });
                });
            });
        });
    });
}());
