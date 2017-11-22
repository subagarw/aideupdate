(function() {
	'use strict';

	angular
	.module('cicdApp')
	.controller('JobController', JobController);

	JobController.$inject = ['$scope','$rootScope','$interval','$filter','$state','$stateParams','$sce','DashboardService'];

	function JobController($scope,$rootScope,$interval,$filter,$state,$stateParams,$sce,DashboardService){

		$scope.jobUrl = $rootScope.hostUrl+"job/"+$stateParams.jobId+"/api/json?depth=1";
		$scope.wsDownloadUrl = $rootScope.hostUrl+"job/"+$stateParams.jobId+"/ws/*zip*/workspace.zip";
		var wsUrl = $rootScope.hostUrl+"job/"+$stateParams.jobId+"/ws";
		//build id will be appended to this
		var buildUrlPrefix = $rootScope.hostUrl+"job/"+$stateParams.jobId;

		var getLoadData=function(){
			DashboardService.getJobDetailsFromUrl($scope.jobUrl).then(function(data){
				$scope.jobDetails=data;
				console.log($scope.jobDetails);
				processTimeLineData($scope.jobDetails.builds);
				createBuildsGraph();
			});
		}	
		getLoadData();

		var jobQueryParam = "&tree=builds[*,culprits[*],actions[*,causes[*]]]";
		var retrieveDataLoop = $interval(function(){
			if($state.$current.name == "job"){
				DashboardService.getJobBuilds($scope.jobUrl+jobQueryParam).then(function(data){
					processTimeLineData(data.builds);
				});
			}else{
				$interval.cancel(retrieveDataLoop);
			}
		},3000);

		function groupedBuild(buildDate){
			this.buildDate = buildDate;
			this.builds = [];	
		}

		var processTimeLineData=function(defaultBuilds){
			$scope.builds = [];
			angular.forEach(defaultBuilds,function(buildData){
				if(buildData.result == "FAILURE"){
					buildData.css="fa-close bg-red";
				}else if(buildData.result == "SUCCESS"){
					buildData.css="fa-check-square-o bg-green";
				}else if(buildData.result == "ABORTED"){
					buildData.css="fa fa-warning bg-grey";
				}else if(buildData.result == null){
					buildData.css="fa fa-spinner fa-spin bg-yellow";
				}
				if($scope.builds.length==0){
					var gBuild = new groupedBuild();
					gBuild.buildDate = $filter('date')(buildData.timestamp);
					gBuild.builds.push(buildData);
					$scope.builds.push(gBuild);
				}else{
					var found=false;
					angular.forEach($scope.builds,function(gBuild){
						if(gBuild.buildDate == $filter('date')(buildData.timestamp)){
							found = true;
							gBuild.builds.push(buildData);
						}
					});
					if(!found){
						var gBuild = new groupedBuild();
						gBuild.buildDate = $filter('date')(buildData.timestamp);
						gBuild.builds.push(buildData);
						$scope.builds.push(gBuild);
					}
				}
			});
			console.log($scope.builds);
		}

		//build now functionality
		$scope.buildNow=function(){
			$scope.delay="0";
			DashboardService.buildJob($scope.jobDetails.url,$scope.delay).then(function(data){
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

		$scope.deleteBuild=function(buildId) {
			$scope.currentDeleteBuild=buildId;
			$scope.promptCss="successPrompt";
			$scope.mood="fa-smile-o";
			$scope.promptMessage="Are you sure that you want to delete "+$stateParams.jobId+" #"+buildId+" build ?";
			$('#promptModal').modal('show');			
		}

		$scope.deleteJob=function(){
			$scope.callBack="proceedToDelete";
			$scope.promptCss="successPrompt";
			$scope.mood="fa-smile-o";
			$scope.promptMessage="Are you sure that you want to delete "+$stateParams.jobId+" job?";
			$('#promptModal').modal('show');		  
		}

		$scope.proceedToDelete=function(){		
			$('#promptModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			if($scope.currentDeleteBuild!=undefined){				
				DashboardService.doDelete($rootScope.hostUrl+"job/"+$stateParams.jobId+"/"+$scope.currentDeleteBuild+"/").then(function(data){
					var currentDeleteBuild = $scope.currentDeleteBuild;
					$scope.currentDeleteBuild=undefined;
					if(data==200){					
						$scope.alertMessage="Its good to say that "+$stateParams.jobId+" #"+currentDeleteBuild+" build is deleted !";
						$scope.mood="fa-smile-o";
						$scope.alertCss="successAlert";
						$('#alertModal').modal('show');
					}else{
						$scope.alertMessage="Oh sorry! I failed in deleting your build "+$stateParams.jobId+" #"+currentDeleteBuild+" !";
						$scope.mood="fa-frown-o";
						$scope.alertCss="failedAlert";
						$('#alertModal').modal('show');
					}
				});
			}else{
				DashboardService.doDelete($rootScope.hostUrl+"job/"+$stateParams.jobId+"/").then(function(data){
					if(data==200){					
						$state.go("dashboard", {}, {reload: true});
					}else{
						$scope.alertMessage="Oh sorry! I failed in deleting your job "+$stateParams.jobId+" !";
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

		//stop build
		$scope.stopBuild = function(buildId){
			var buildUrl = buildUrlPrefix+"/"+buildId+"/stop";
			DashboardService.stopBuild(buildUrl).then(function(data){
				if(data==200){
					$scope.alertMessage="Its good to say that build #"+buildId+" killed !";
					$scope.mood="fa-smile-o";
					$scope.alertCss="successAlert";
					$('#alertModal').modal('show');
				}				
			});
		}

		//get build scm details
		var buildQueryParam = "?tree=changeSet[items[*,author[*],paths[*]],revisions[*],*]";
		$scope.getScmChanges = function(buildId){
			var buildUrl=buildUrlPrefix+"/"+buildId+"/api/json";
			buildUrl = buildUrl+buildQueryParam;
			DashboardService.getScmChanges(buildUrl).then(function(data){
				$scope.changeSet = data.changeSet;
				$('#changesModal').modal('show');
			});
		}

		//get console output
		$scope.showConsole = function(buildId){			
			DashboardService.getBuildConsoleOutput(buildUrlPrefix+"/"+buildId+"/",false).then(function(data){
				$scope.consoleOutput=$sce.trustAsHtml(data);
				$('#consoleModal').modal('show');
			});
		}

		//get Filelist
		$('#wsModal').on('show.bs.modal',function(){
			DashboardService.getFileList(wsUrl).then(function(data){
				$scope.fileList=$sce.trustAsHtml(data);
			});
		});		

		//graph-- builds analysis
		function createBuildsGraph(){
			DashboardService.getJobAnalysisData(encodeURI($scope.jobDetails.displayName)).then(function(data){
				$scope.gData=data;
				if(data.builds.length!=0){
					var successCount=0;
					var failedCount=0;
					var abortedCount=0;
					angular.forEach(data.builds,function(obj){
						if(obj.result=='SUCCESS'){
							successCount++;
						}else if(obj.result=='FAILURE'){
							failedCount++;
						}else if(obj.result=='ABORTED'){
							abortedCount++;
						}
						var date = new Date(obj.timestamp);
						var month=date.getMonth()+1;
						obj.readableDate= date.getDate()+"-"+month+"-"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
					});

					drawBuildsAnalysisGraph(successCount,failedCount,abortedCount);
					data.builds.sort(function(a,b){ 
						return new Date(a.timestamp)-new Date(b.timestamp);
					});
				}				
			});
		}		

		function drawBuildsAnalysisGraph(successCount,failedCount,abortedCount){
			var donutData = [
			{label: "Success", data: successCount, color: "#00a65a"},
			{label: "Failed", data: failedCount, color: "#dd4b39"},
			{label: "Aborted", data: abortedCount, color: "#4c4e4c"}
			];
			$.plot("#donut-chart", donutData, {
				series: {
					pie: {
						show: true,
						radius: 1,
						innerRadius: 0.5,
						label: {
							show: true,
							radius: 2 / 3,
							formatter: labelFormatter,
							threshold: 0.1
						}

					}
				},
				legend: {
					show: false
				}
			});
		}

		function labelFormatter(label, series) {
			return '<div style="font-size:13px; text-align:center; padding:2px; color: #fff; font-weight: 600;">'
			+ label
			+ "<br>"
			+ Math.round(series.percent) + "%</div>";
		}
		

	}
})();
