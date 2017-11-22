(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('job', {
            parent: 'app',
            url: '/job/:jobId',
            views: {
                'content@': {
                    templateUrl: 'app/job/job.html',
                    controller: 'JobController'
                }
            }
        });
    }
})();
