(function() {
    'use strict';

    angular
    .module('cicdApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];



    function stateConfig($stateProvider) {		
        $stateProvider.state('detailView', {
            parent: 'app',
            url: '/detailView/:jobType',
            views: {
                'content@': {
                    templateUrl: 'app/detailView/detailView.html',
                    controller: 'DetailViewController'
                }
            }
        });
    }
})();
