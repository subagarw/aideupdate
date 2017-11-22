(function() {
    'use strict';

    angular
    .module('cicdApp')
    .factory("httpInterceptor",httpInterceptor)
    .config(init)
    .directive("loader",loader);

    httpInterceptor.$inject = ['$q', '$rootScope', '$log'];
    init.$inject = ['$httpProvider'];
    loader.$inject = ['$rootScope'];

    function httpInterceptor($q, $rootScope, $log) {
        var numLoadings = 0;
        return {
            request: function (config) {
                if(config.ignoreLoader==undefined || config.ignoreLoader==false){
                    numLoadings++;
                    $rootScope.$broadcast("loader_show");
                }                
                return config || $q.when(config);               
            },
            response: function (response) {
                if(response.config.ignoreLoader==undefined || response.config.ignoreLoader==false){
                    if ((--numLoadings) === 0) {
                        $rootScope.$broadcast("loader_hide");
                    }
                }
                return response || $q.when(response);
            },
            responseError: function (response) {
                if (!(--numLoadings)) {
                    $rootScope.$broadcast("loader_hide");
                }
                return $q.reject(response);
            }
        }
    }

    function init($httpProvider){
        $httpProvider.interceptors.push('httpInterceptor');
    }

    function loader($rootScope) {
        return function ($scope, element, attrs) {
            $scope.$on("loader_show", function () {
                return element.show();
            });
            return $scope.$on("loader_hide", function () {
                return element.hide();
            });
        };
    }

})();