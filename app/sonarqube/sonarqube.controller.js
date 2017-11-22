(function() {
	'use strict';

	angular
	.module('cicdApp')
	.controller('SonarController', SonarController);

	SonarController.$inject = ['$scope','$location','$sce'];

	function SonarController ($scope,$location,$sce) {
		$scope.sonarUrl = $sce.trustAsResourceUrl($location.protocol()+"://dadc.fs.capgemini.com:9000");
	}
})();
