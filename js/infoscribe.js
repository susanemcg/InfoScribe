(function(){

var app = angular.module('infoscribe', []);


app.directive('collectionsHighlight', function(){
	return{
		restrict: 'E',
		templateUrl:'templates/collections_highlight.html',
		controller:['$http', function($http){

			var current_collections = this;

			current_collections.collections = [];

			$http.get('data/sample_collections.json').success(function(data){

				current_collections.collections = data;

			});


		}],
		controllerAs:'recentcollections'

	};

});

app.directive('userProjectsListing', function(){
	return{
		restrict: 'E',
		templateUrl:'templates/user_projects_listing.html',
		controller:['$http', function($http){

			var current_collections = this;

			current_collections.collections = [];

			$http.get('data/sample_collections.json').success(function(data){

				current_collections.collections = data;

			});


		}],
		controllerAs:'recentcollections'

	};

});



app.controller('TabController', function($scope){

	this.tab = 1;

	this.selectTab = function(tabNum){
		this.tab = tabNum;
	};

	this.amISelected = function(tabNum){
		return this.tab === tabNum;
	}

	//angular doesn't use the common a,b array sort format; must return an number value and then 
	//actual sort will be handled by framework. Default is lowest to highest.
	this.sortByTranscriptionDeadline = function(obj){
		//return the milliseconds between 1970 and date supplied
		return(Date.parse(obj.transcription_deadline));
	}

});


})();