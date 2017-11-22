(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider','$urlRouterProvider']; 

    function stateConfig($stateProvider,$urlRouterProvider) {

        $urlRouterProvider.otherwise("/dashboard");

        $stateProvider.state('app', {
            abstract: true,
            views: {
                'navbar@': {
                    templateUrl: 'app/layouts/navbar/navbar.html',
                    controller: 'NavbarController'
                }
            }
        });
    }
})();
