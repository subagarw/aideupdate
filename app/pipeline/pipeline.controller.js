(function() {
	'use strict';

	angular
	.module('cicdApp')
	.controller('PipelineController', PipelineController);

	PipelineController.$inject = ['$scope','$rootScope','$state','$stateParams','$interval','$timeout','$sce','DashboardService'];

	function PipelineController ($scope,$rootScope,$state,$stateParams,$interval,$timeout,$sce,DashboardService) {
		$scope.viewId =  $stateParams.viewId;
		var queryParam = "tree=pipelines[name,firstJob,pipelines[*,triggeredBy[*],contributors[*],stages[*,tasks[*,status[*]]]]]";
		$scope.pipelineUrl = $rootScope.hostUrl+"view/"+$stateParams.viewId+"/api/json?"+queryParam;
		var retrieveDataLoop = $interval(function(){
			if($state.$current.name == "pipeline"){
				DashboardService.getPipelineData($scope.pipelineUrl).then(function(data){
					$scope.pipelineData=data.pipelines[0];
					console.log($scope.pipelineData);
					$scope.isRunning=false;
				});
			}else{
				$interval.cancel(retrieveDataLoop);
			}
		},3000);

		//on load activity
		$scope.showStage=[];
		$scope.showStage[0]='true';
		

		$scope.getStyle = function(){
			var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

			return {
				'top': $scope.isSemi ? 'auto' : '50%',
				'bottom': $scope.isSemi ? '5%' : 'auto',
				'left': '50%',
				'transform': transform,
				'-moz-transform': transform,
				'-webkit-transform': transform,
				'font-size': $scope.radius/3.5 + 'px'
			};
		};

		$scope.revealStage=function(index){
			$scope.showStage[index]='true';
			for(var i=0;i<$scope.pipelineData.pipelines[0].stages.length;i++){
				if(i!=index){
					$scope.showStage[i]='false';
				}				
			}
		}

		$scope.revealStageSm=function(index){
			$scope.showStage[index]='true';
			for(var i=0;i<$scope.pipelineData.pipelines[0].stages.length;i++){
				if(i!=index){
					$scope.showStage[i]='false';
				}				
			}
			$('#taskModal').modal('show');
		}

		$scope.getProcessStatusCSS = function(status){
			if(status=="SUCCESS"){
				return "completedTask";
			}else if(status=="FAILED"){
				return "failedTask";
			}else if(status=="IDLE" || status=="CANCELLED"){
				return "idleTask";
			}else if(status=="QUEUED"){
				$scope.isQueued=true;
				return "queuedTask blink";				
			}else if(status=="RUNNING"){
				$scope.isRunning=true;
			}
		}

		$scope.getReadableDate=function(dt){
			return new Date(dt).toUTCString();
		}

		$scope.calculatePercentage = function(stage){
			var stagePerc=0;
			angular.forEach(stage.tasks,function(task){
				if(task.status.percentage != null && task.status.percentage>=0){
					stagePerc=stagePerc+task.status.percentage;
				}
				if(task.status.type=="SUCCESS"){
					stagePerc=stagePerc+100;
				}
			});
			return (stagePerc)/stage.tasks.length;
		}

		$scope.startPipeline = function(jobId){
			var jobUrl=$rootScope.hostUrl+"job/"+jobId+"/";
			$scope.delay="0";
			DashboardService.buildJob(jobUrl,$scope.delay).then(function(data){
				if(data=="201"){
					$scope.alertMessage="Its good to say that Pipeline started !";
					$scope.mood="fa-smile-o";
					$scope.alertCss="successAlert";
					$('#alertModal').modal('show');
				}else{
					$scope.alertMessage="Oh sorry! I failed in running your pipeline !";
					$scope.mood="fa-frown-o";
					$scope.alertCss="failedAlert";
					$('#alertModal').modal('show');
				}
			});
		}

		$scope.getTaskCss = function(status){
			if(status=="SUCCESS"){
				return "fa-check-square-o bg-green";
			}else if(status=="FAILED"){
				$scope.isRunning=false;
				$scope.isQueued=false;
				return "fa-close bg-red";
			}else if(status=="IDLE" || status=="CANCELLED"){
				return "fa fa-warning bg-grey";
			}else if(status=="QUEUED"){
				$scope.isQueued=true;
				return "fa-circle-o-notch fa-spin"
			}else if(status=="RUNNING"){
				$scope.isRunning=true;
			}
		}


		$scope.showConsole = function(link){
			DashboardService.getBuildConsoleOutput($rootScope.hostUrl+link,false).then(function(data){
				$scope.consoleOutput=$sce.trustAsHtml(data);
				$('#consoleModal').modal('show');
			});
		}
		
		$scope.stopBuild = function(id,buildId){
			var buildUrl = $rootScope.hostUrl+"job/"+id+"/"+buildId+"/stop";
			DashboardService.stopBuild(buildUrl).then(function(data){
				if(data==200){
					$scope.alertMessage="Its good to say that build "+id+" #"+buildId+" killed !";
					$scope.mood="fa-smile-o";
					$scope.alertCss="successAlert";
					$('#alertModal').modal('show');
				}				
			});
		}
	}
})();
