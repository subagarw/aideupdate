(function() {
	'use strict';

	angular
	.module('cicdApp')
	.controller('DetailViewController', DetailViewController);

	DetailViewController.$inject = ['$scope','$state','$stateParams','DashboardService'];

	function DetailViewController ($scope,$state,$stateParams,DashboardService) {
		$scope.jobType=$stateParams.jobType;
		DashboardService.getAllJobs().then(function(data){
			var jobs=data.jobs;
			var i;
			for(i=0;i<jobs.length;i++){
				if(jobs[i].color=="blue"){
					jobs[i].color="success";
					jobs[i].status="SUCCESS";
				}
				else if(jobs[i].color=="red"){
					jobs[i].color="failed";
					jobs[i].status="FAILED";
				}
				else if(jobs[i].color=="notbuilt"){
					jobs[i].color="notbuilt";
					jobs[i].status="NOT BUILT";
				}
				else if(jobs[i].color=="yellow"){
					jobs[i].color="pending";
					jobs[i].status="PENDING";
				}
				else if(jobs[i].color=="aborted"){
					jobs[i].color="aborted";
					jobs[i].status="ABORTED";
				}
				else if(jobs[i].color=="unstable"){
					jobs[i].color="unstable";
					jobs[i].status="UN STABLE";
				}
				else if(jobs[i].color=="blue_anime" || jobs[i].color=="aborted_anime" || jobs[i].color=="red_anime"){
					jobs[i].color="running";
					jobs[i].status="RUNNING";
				}

				if(jobs[i].upstreamProjects.length==0){
					jobs[i].isMaster=true;
				}
			}
			$scope.jobs=jobs;
		});

    	//build now functionality
    	$scope.buildNow=function(jobUrl){
    		$scope.delay="0";
    		DashboardService.buildJob(jobUrl,$scope.delay).then(function(data){
    			if(data=="201"){
    				$scope.alertMessage="Its good to say that Build is running !";
    				$scope.mood="fa-smile-o";
    				$scope.alertCss="successAlert";
    				$('#alertModal').modal('show');
    				$('#alertModal').on('hidden.bs.modal', function (e) {
    					$state.go($state.current, {}, {reload: true});
    				});
    			}else{
    				$scope.alertMessage="Oh sorry! I failed in running your build !";
    				$scope.mood="fa-frown-o";
    				$scope.alertCss="failedAlert";
    				$('#alertModal').modal('show');
    				$('#alertModal').on('hidden.bs.modal', function (e) {
    					$state.go($state.current, {}, {reload: true});
    				});
    			}
    		});
    	}    		
    }
})();
