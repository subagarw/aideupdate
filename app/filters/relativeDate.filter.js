(function() {
	'use strict';

	angular
	.module('cicdApp')
	.filter('relativeDate', RelativeDateFilter)
	.filter('timeConverter', TimeFilter);

	TimeFilter.$inject = ['$filter'];

	function RelativeDateFilter () {
		return function(timestamp){
			//var tzoffset = this.getTimezoneOffset() * 60 * 1000;
			var currDate = new Date();
			var relativeDate = timestamp;
			var delta = Math.round((currDate - relativeDate)/1000);
			var rtstamp = '';

			if(delta < 60) { rtstamp = delta + ' seconds ago'; }
			else if(delta < (60*60)) {
				rtstamp = Math.round(delta/60) + ' minutes ago';
			}
			else if(delta < (60*60*24)) {
				rtstamp = Math.round(delta/(60*60)) + ' hours ago';
			}
			else if(delta < (60*60*24*31)) {
				rtstamp = Math.round(delta/(60*60*24)) + ' days ago';
			} else {
				rtstamp = relativeDate.toDateString();
			}

			return rtstamp;
		}
	}

	function TimeFilter($filter){
		return function(millis){
			var time = millis/1000;
			if(time > 60){
				time = time/60;
				if(time > 60){
					time = time/60;
					if(time > 24){
						return $filter('number')(time/24) + " days";
					}else{
						return $filter('number')(time) + " hours";
					}
				}else{
					return $filter('number')(time) + " minutes";
				}
			}else{
				return $filter('number')(time) + " seconds";
			}
		}
	}
})();
