(function(){
    'use strict';

    define(['panels/panels'], function(){
        var $compile,
            $rootScope,
            $timeout,
            $scope,
            $animator,
            $log,
            element,
            upperPanel,
            lowerPanel;

        describe('c6Panels',function(){
            var c6Panels;
            beforeEach(module('c6.ui'));

            beforeEach(function(){
                inject(function(_$compile_,_$rootScope_,_$timeout_,_$log_,_$animator_){
                    $compile        = _$compile_;
                    $rootScope      = _$rootScope_;
                    $timeout        = _$timeout_;
                    $log            = _$log_;
                    $animator        = _$animator_;

                    $scope      = $rootScope.$new();
                    element = angular.element('<div c6-panels x-show="showPanels"></div>');
                    $compile(element)($scope);
                    $scope.$digest();
                    upperPanel = angular.element(element.find('div')[0]);
                    lowerPanel = angular.element(element.find('div')[1]);
                });
            });

            it('should add stuff to the dom', function(){
                var kids = element.find('div');
                expect(kids.length).toEqual(2);
            });
/*
            it('should be able to go up', function(){
                console.log(angular.mock.dump(element));
                $scope.$on('panelsDown',function(){
                    console.log('HELLO');
                });
                $scope.showPanels = true;
                $scope.$digest();
                console.log(angular.mock.dump(element));
                //var a = $animator($scope, { ngAnimate : '{show : \'upperPanel\' }' });
                //a.show(upperPanel);
            });
*/
        });
    });
}());
