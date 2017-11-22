/**
 *  * 
 *   */

 angular.module('cicdApp').factory('DashboardService', function ($q,$http,$rootScope,$location) {
 	var hostUrl=$rootScope.hostUrl;

 	return {

 		getBuildExecutors : function(){
 			var def = $q.defer();
 			var timeout=$q.defer();
 			var timedOut = false;
 			setTimeout(function () {
 				timedOut = true;
 				timeout.resolve();
 			}, (2000));

 			$http.get(hostUrl+"/ajaxExecutors",{timeout: timeout.promise,ignoreLoader: true})
 			.success(function(data) {

 				var dummyElement = document.createElement('html');
 				dummyElement.innerHTML = data;
 				var buildExecutor;
 				var buildExecutors=[];
 				var tds = dummyElement.getElementsByClassName("progress-bar-done");
 				var stopAnchors=dummyElement.getElementsByClassName("stop-button-link");
 				var consoleAnchors=dummyElement.getElementsByClassName("progress-bar");


 				var i=0;
 				if(tds.length!=0){
 					for(i=0;i<tds.length;i++){
 						buildExecutor={};
 						buildExecutor.id=i;
 						if(!tds[i].getAttribute("style")==""){	
 							buildExecutor.status=(tds[i].getAttribute("style").substring(6, 8)).replace("%","");
 						}else{
 							buildExecutor.status="-1";
 						}

 						if(stopAnchors.length!=0){
 							buildExecutor.stopLink=stopAnchors[i].getAttribute("href");
 						}else{
 							buildExecutor.stopLink="";
 						}

 						if(consoleAnchors.length!=0){
 							buildExecutor.consoleLink=consoleAnchors[i].getAttribute("href");
 							buildExecutor.toolTip=consoleAnchors[i].getAttribute("tooltip");
 						}else{
 							buildExecutor.consoleLink="#";
 						}
 						buildExecutors.push(buildExecutor);
 					}
 				}else{
 					for(i=0;i<2;i++){
 						buildExecutor={};
 						buildExecutor.id=i;
 						buildExecutor.status="-1";
 						buildExecutor.stopLink="";
 						buildExecutor.consoleLink="#";
 						buildExecutor.toolTip="No builds currently running on me!";
 						buildExecutors.push(buildExecutor);
 					}
 				} 

 				def.resolve(buildExecutors);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getNoOfExecutors : function(){
 			var def = $q.defer();			
 			$http.get(hostUrl+"api/json?tree=numExecutors")
 			.success(function(data) {
 				def.resolve(data.numExecutors);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getAllJobs : function(){
 			var def = $q.defer();					
 			$http.get(hostUrl+"api/json?tree=jobs[name,url,color,healthReport[*],lastBuild[number,timestamp],upstreamProjects[name]]")
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getJobDetailsFromUrl : function(jobUrl){         
 			if($location.protocol()==="https"){
 				jobUrl = jobUrl.replace("http://","https://");
 			}

 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: jobUrl
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured while fetching job details. Please try again.");
 			});
 			return def.promise;
 		},

 		getBuildDetailsFromUrl : function(buildUrl){
 			if($location.protocol()==="https"){
 				buildUrl = buildUrl.replace("http://","https://");
 			}   

 			var def = $q.defer();
 			$http({
 				method:"GET",
 				url: buildUrl+'/api/json'
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getJobsVSHealthReport : function(){
 			var def = $q.defer();			
 			$http({
 				method:"GET",
 				url: hostUrl+'api/json?tree=jobs[name,healthReport[score]]' 
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		buildJob : function(jobUrl,delay){
 			if($location.protocol()==="https"){
 				jobUrl = jobUrl.replace("http://","https://");
 			}   

 			var def = $q.defer();
 			$http({
 				method:"POST",
 				url: jobUrl+'build?delay='+delay+'sec',
 			})
 			.success(function(data, status, headers, config) {
 				def.resolve(status);
 			})
 			.error(function(data, status, headers, config) {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getBuildConsoleOutput : function(buildUrl,showFullLog){
 			var parameter="console";
 			if(showFullLog==true){
 				parameter="consoleFull";
 			}
 			if($location.protocol()==="https"){
 				buildUrl = buildUrl.replace("http://","https://");
 			}

 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: buildUrl+parameter,
 			})
 			.success(function(data) {
 				var dummyElement = document.createElement('div');
 				dummyElement.innerHTML=data;
 				var consoleOutput=dummyElement.getElementsByClassName("console-output");
 				def.resolve("<pre class='console-output'>"+consoleOutput[0].innerHTML+"</pre>");
 			})
 			.error(function() {
 				def.reject("An error occured while fetching console output. Please try again.");
 			});
 			return def.promise;
 		},

 		getFileList : function(jobWsUrl){
 			if($location.protocol()==="https"){
 				jobWsUrl = jobWsUrl.replace("http://","https://");
 			}

 			var def = $q.defer();
 			$http({
 				method:"GET",
 				url: jobWsUrl,
 			})
 			.success(function(data) {
 				var dummyElement = document.createElement('div');
 				dummyElement.innerHTML = data;
 				var fileList = dummyElement.getElementsByClassName("fileList");
 				if(fileList.length!=0){
 					def.resolve("<table>"+fileList[0].innerHTML+"</table>");	
 				}else{
 					def.resolve("<p>Workspace is empty!</p>");
 				}
 				
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getAllViews : function(){
 			var def = $q.defer();			
 			$http({
 				method:"GET", 
 				url: hostUrl+'api/json?tree=views[name,url]'
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getTestReport : function(buildUrl){
 			if($location.protocol()==="https"){
 				buildUrl = buildUrl.replace("http://","https://");
 			}     

 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: buildUrl+"testReport/api/json?pretty=true&tree=duration,empty,failCount,passCount,skipCount,suites[cases[age,className,duration,failedSince,name,skipped,skippedMessage]]",
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function(data, status, headers, config) {
 				if(status == 404){
 					def.resolve("No Test report Configured");
 				}else{	
 					def.resolve("An error occured. Please try again.");
 				}	
 			});
 			return def.promise;
 		},

 		getJobBuilds : function(jobBuildsUrl){
 			/*if($location.protocol()==="https"){
 				viewUrl = viewUrl.replace("http://","https://");
 			}*/ 			
 			var def = $q.defer();
 			var timeout=$q.defer();
 			var timedOut = false;

 			setTimeout(function () {
 				timedOut = true;
 				timeout.resolve();
 			}, (2300));

 			$http({
 				method:"GET", 
 				url: jobBuildsUrl,
 				timeout: timeout.promise,
 				ignoreLoader: true
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				console.log("Network is too slow to fetch data or server is facing overload.");
 				def.reject("An error occured while fetching job builds. Please try again.");
 			});
 			return def.promise;
 		},

 		getPipelineData : function(viewUrl){
 			/*if($location.protocol()==="https"){
 				viewUrl = viewUrl.replace("http://","https://");
 			}*/
 			var def = $q.defer();
 			var timeout=$q.defer();
 			var timedOut = false;

 			setTimeout(function () {
 				timedOut = true;
 				timeout.resolve();
 			}, (2300));

 			var d = new Date();
 			var milliSeconds = d.getTime();
 			$http({
 				method:"GET", 
 				url: viewUrl+'&_='+milliSeconds,
 				timeout: timeout.promise,
 				ignoreLoader: true
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				console.log("Network is too slow to fetch data or server is facing overload.");
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getJobDetailsProgressBarData : function(jobUrl){
 			if($location.protocol()==="https"){
 				jobUrl = jobUrl.replace("http://","https://");
 			}  

 			var def = $q.defer();
 			$http({
 				method:"GET",
 				url: jobUrl+'buildHistory/ajax',
 				headers: {'n':'1'}
 			})
 			.success(function(data) {
 				var dummyElement = document.createElement('div');
 				dummyElement.innerHTML = data;
 				var progressBarContent = dummyElement.getElementsByClassName("pane");
 				var response;
 				if(""==progressBarContent.nodeValue){
 					response="";
 				}else{
 					var consoleLink=dummyElement.getElementsByClassName("build-status-link");
 					var tooltip=dummyElement.getElementsByClassName("progress-bar");
 					var progressBarPercent=dummyElement.getElementsByClassName("progress-bar-done");
 					if(progressBarPercent.length!=0 && tooltip.length!=0 && consoleLink.length!=0){
 						response=(progressBarPercent[0].getAttribute("style").substring(6, 8)).replace("%","")+"$$";
 						response=response+tooltip[0].getAttribute("tooltip")+"$$";
 						response=response+consoleLink[0].getAttribute("href");
 					}else{
 						response="";
 					}
 				}
 				def.resolve(response);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		doDelete : function(Url){
 			if($location.protocol()==="https"){
 				Url = Url.replace("http://","https://");
 			}

 			var def = $q.defer();
 			$http({
 				method:"POST", 
 				url: Url+'doDelete',
 			})
 			.success(function(data, status, headers, config) {
 				def.resolve(status);
 			})
 			.error(function(data, status, headers, config) {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		verifyJobName : function(jobName){
 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: 'api/doesJobExists',
 				params: {jobName:jobName}
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		createJob : function(jobDSLScript){
 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: 'api/createJob',
 				params: {jobDSLScript:jobDSLScript}
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		stopBuild : function(url){
 			var def = $q.defer();            
 			$http({
 				method:"POST",
 				url: url,
 			})
 			.success(function(data, status, headers, config) {
 				def.resolve(status);
 			})
 			.error(function() {
 				def.reject("An error occured while stopping the build. Please try again.");
 			});
 			return def.promise;
 		},

 		hitUrl : function(url){
 			var def = $q.defer();            
 			$http({
 				method:"GET",
 				url: url,
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getJobAnalysisData: function(jobName){
 			var def = $q.defer();            
 			$http({
 				method:"GET",
 				url: hostUrl+"job/"+jobName+"/api/json?depth=1&tree=builds[result,timestamp,number,duration]",
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getCodeCoverageData : function(buildUrl){
 			if($location.protocol()==="https"){
 				buildUrl = buildUrl.replace("http://","https://");
 			}       

 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: buildUrl+"cobertura/api/json?tree=results[elements[denominator,name,numerator,ratio]]",
 				params: {buildURL:buildUrl}
 			})
 			.success(function(data, status, headers, config) {
 				def.resolve(data);
 			})
 			.error(function(data, status, headers, config) {
 				if(status==404){
 					def.resolve("No Code Coverage report is configured for this job");
 				}else{
 					def.reject("An error occured. Please try again.");
 				}
 			});
 			return def.promise;
 		},

 		getOverallCodeCoverageData : function(url){
 			if($location.protocol()==="https"){
 				url = url.replace("http://","https://");
 			}       

 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: url
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getLoggedInUser :  function(){
 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: hostUrl+"login"
 			})
 			.success(function(data) {
 				var dummyElement = document.createElement('html');
 				dummyElement.innerHTML = data;
 				var loginDiv = dummyElement.getElementsByClassName('login');
 				data = loginDiv[0].getElementsByTagName('a')[0].getElementsByTagName('b')[0].textContent;
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		logOut : function(){
 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: hostUrl+"logout"
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured. Please try again.");
 			});
 			return def.promise;
 		},

 		getScmChanges : function(buildUrl){
 			var def = $q.defer();
 			$http({
 				method:"GET", 
 				url: buildUrl
 			})
 			.success(function(data) {
 				def.resolve(data);
 			})
 			.error(function() {
 				def.reject("An error occured while fetching scm changes. Please try again.");
 			});
 			return def.promise;
 		}

 	}
 });

