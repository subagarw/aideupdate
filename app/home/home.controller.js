(function() {
	'use strict';

	angular
	.module('cicdApp')
	.controller('HomeController', HomeController);

	HomeController.$inject = ['$scope','$state','DashboardService'];

	function HomeController ($scope,$state,DashboardService) {
		var getLoadData=function(){
			$scope.masterJobs;
			$scope.jobs;
			var jobs=[];
			var views=[];
			$scope.stats={"success":0,"failed":0,"notbuilt":0,"pending":0,"aborted":0,"unstable":0,"running":0};
			DashboardService.getAllJobs().then(function(data){
				console.log(JSON.stringify(data));	  
				jobs=data.jobs;
				console.log(JSON.stringify(jobs));
				var i;
				for(i=0;i<jobs.length;i++){
					if(jobs[i].color=="blue"){
						jobs[i].color="success";
						jobs[i].status="SUCCESS";
						$scope.stats.success++;
					}
					else if(jobs[i].color=="red"){
						jobs[i].color="failed";
						jobs[i].status="FAILED";
						$scope.stats.failed++;
					}
					else if(jobs[i].color=="notbuilt"){
						jobs[i].color="notbuilt";
						jobs[i].status="NOT BUILT";
						$scope.stats.notbuilt++;
					}
					else if(jobs[i].color=="yellow"){
						jobs[i].color="pending";
						jobs[i].status="PENDING";
						$scope.stats.pending++;
					}
					else if(jobs[i].color=="aborted"){
						jobs[i].color="aborted";
						jobs[i].status="ABORTED";
						$scope.stats.aborted++;
					}
					else if(jobs[i].color=="unstable"){
						jobs[i].color="unstable";
						jobs[i].status="UN STABLE";
						$scope.stats.unstable++;
					}
					else if(jobs[i].color=="blue_anime" || jobs[i].color=="aborted_anime" || jobs[i].color=="red_anime" || jobs[i].color=="notbuilt_anime"){
						jobs[i].color="running";
						jobs[i].status="RUNNING";
						$scope.stats.running++;
					}

					if(jobs[i].upstreamProjects != null && jobs[i].upstreamProjects.length==0){
						jobs[i].isMaster=true;
					}
				}
				$scope.jobs=jobs;
				$scope.noOfJobs=$scope.jobs.length-1;
				$scope.round=Math.round;
			});
		}
		getLoadData();


		//used for switching views from grid to table
		$scope.viewType=true;
		$scope.isGridView=true;
		$scope.switchView=function(){
			if($scope.viewType){
				$scope.isGridView=true;
			}else{
				$scope.isGridView=false;
			}
		}

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
		
		// init all knobs
		/*$scope.initKonbs=function(){
			$('.knob').knob();
		}*/

		// circular progress css		
		$scope.getStyle = function(){
			var fontSize = '28px';
			var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';
			return {
				'font-size': fontSize,
				'color': '#F56954',
				'top': $scope.isSemi ? 'auto' : '50%',
				'bottom': $scope.isSemi ? '5%' : 'auto',
				'left': '50%',
				'transform': transform,
				'-moz-transform': transform,
				'-webkit-transform': transform,
				'font-weight': 500
			};
		};
	}
})();
