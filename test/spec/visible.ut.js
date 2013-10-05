(function(){
    'use strict';
    define(['visible/visible'], function(){
        var $compile,
            $rootScope,
            $scope,
            element;

        describe('c6Visible',function(){
            var c6Panels;
            beforeEach(function(){
                inject(function(_$compile_,_$rootScope_){
                    $compile        = _$compile_;
                    $rootScope      = _$rootScope_;

                    $scope      = $rootScope.$new();
                    element = angular.element('<div c6-visible="show">&nbsp;</div>');
                    $compile(element)($scope);
                    $scope.$digest();
                });
            });

            it('should initialize to hidden', function(){
                expect(element.css('visibility')).toEqual('hidden');
            });

            it('should change element visisbility when scope attribute changes', function(){
                expect(element.css('visibility')).toEqual('hidden');
                $scope.show = true;
                $scope.$digest();
                expect(element.css('visibility')).toEqual('visible');
            });
        });
    });
}());
