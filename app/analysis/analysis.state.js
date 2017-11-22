(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('analysis', {
            parent: 'app',
            url: '/analysis',
            views: {
                'content@': {
                    templateUrl: 'app/analysis/analysis.html',
                    controller: 'AnalysisController'
                }
            }
        });
    }
})();
