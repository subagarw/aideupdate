(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('dashboard', {
            parent: 'app',
            url: '/dashboard',
            views: {
                'content@': {
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeController'
                }
            }
        });
    }
})();
