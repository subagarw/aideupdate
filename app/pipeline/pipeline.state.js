(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('pipeline', {
            parent: 'app',
            url: '/pipeline/:viewId',
            views: {
                'content@': {
                    templateUrl: 'app/pipeline/pipeline.html',
                    controller: 'PipelineController'
                }
            }
        });
    }
})();
