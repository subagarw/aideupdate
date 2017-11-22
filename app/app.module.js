(function() {
	'use strict';

	angular
	.module('cicdApp', [
		'ui.router',
		'angular-svg-round-progressbar'
		]).run(run);

	run.$inject = ['$rootScope','$location']


	/*Add jenkins at the end if jenkins server is running on sub context jenkins, 
	 *currently it is considered that jenkins is running on root context.
	 */
	function run($rootScope,$location){
		$rootScope.hostUrl=$location.protocol()+"://"+$location.host()+":"+$location.port()+"/";
	}
})();
