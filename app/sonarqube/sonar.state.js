(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('sonarqube', {
            parent: 'app',
            url: '/sonarqube',
            views: {
                'content@': {
                    templateUrl: 'app/sonarqube/sonarqube.html',
                    controller: 'SonarController'
                }
            }
        });
    }
})();
