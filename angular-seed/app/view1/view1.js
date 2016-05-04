'use strict';

angular.module('myApp.view1', ['ngRoute', 'uiGmapgoogle-maps', "firebase", "ngTable", "ngSanitize"])

.config(['$routeProvider', 'uiGmapGoogleMapApiProvider', function($routeProvider, uiGmapGoogleMapApiProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
  uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyC5rDcP9mqkgcd4L_q3cvvXNdtvOGFy-6c',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'weather,geometry,visualization'
  });
}])

.controller('View1Ctrl', ['$scope', 'uiGmapGoogleMapApi', '$firebaseObject', 'NgTableParams', 'GoogleMapsGeoTag', '$filter', '$sce', 
                          function($scope, uiGmapGoogleMapApi, $firebaseObject, NgTableParams, GoogleMapsGeoTag, $filter, $sce) {
	
	var ref = new Firebase("https://amber-heat-2713.firebaseio.com");
	$scope.data = $firebaseObject( ref );
	
	var tempMarkers = [];
    var data = [];
	
	$scope.data.$loaded()
	  .then(function() {
		
		/*
		for (var key in $scope.data.twitter_reports) {
			var tempObj = {
					title: $scope.data.twitter_reports[key].title,
					text: $scope.data.twitter_reports[key].text
			}
			data.push(tempObj);
		}
		*/
		
		for (var key in $scope.data.tweets) {
			
			var username = "";
		    var usernameTable = "";
			
			if ( 'username' in $scope.data.tweets[key] ) {
				username = '<a href="https://twitter.com/' + $scope.data.tweets[key].username + '" target="_blank">@' + $scope.data.tweets[key].username + '</a>';
				usernameTable = $scope.data.tweets[key].username;
			}
			
			/* No Location, Add To Table */
			if ( !('location' in $scope.data.tweets[key]) ) {
				var tableObj = {
						text: $scope.data.tweets[key].text,
						link: usernameTable
				};
				if (usernameTable !== "") {
					data.push(tableObj);
				}
				continue;
			} else {
				var location = $scope.data.tweets[key].location;
				var markerObj = {
						latitude: location.lat,
				        longitude: location.lon,
				        title: 'marker-' + key,
				        data: $scope.data.tweets[key].text,
				        user: username
				};
				var tableObj = {
						text: $scope.data.tweets[key].text,
						link: usernameTable
				};
				markerObj["id"] = key;
			    tempMarkers.push(markerObj);
			    if (usernameTable !== "") {
					data.push(tableObj);
				}
				
			}
			
		}
		
		/* Get Location Using the Google Maps API */
		for (var key in $scope.data.reports) {
			var location = $scope.data.reports[key].location;
			var markerObj = {
					latitude: location.lat,
			        longitude: location.lon,
			        title: 'marker-' + key,
			        data: $scope.data.reports[key].text,
			        user: ""
			};
			var tableObj = {
					text: $scope.data.reports[key].text,
					link: ""
			};
			markerObj["id"] = key;
		    tempMarkers.push(markerObj);
			data.push(tableObj);
		}
		
		
		/* Add Data to the Dom */
		$scope.map.markers = tempMarkers;
		
	    $scope.tableParams = new NgTableParams({
	        page: 1,            // show first page
	        count: 10			// count per page
	    }, {
	        data: data
	    });
	  })
	  .catch(function(err) {
	    console.error(err);
	  });
	
	$scope.map = { 
			center: { latitude: 24.24, longitude: -100.09 },
			zoom: 5,
			markersEvents: {
		        click: function(marker, eventName, model) {
		          $scope.map.window.model = model;
		          $scope.map.window.show = true;
		          $scope.title = marker.model.title;
		          document.querySelector('.tweetBody').innerHTML = $filter('linky')(marker.model.data, "_blank");
		          document.querySelector('.username').innerHTML = marker.model.user;
		        }
		      },
		      window: {
		        marker: {},
		        show: false,
		        closeClick: function() {
		          this.show = false;
		        },
		        options: {
		            visible: false,
		            pixelOffset: {
		              width: -1,
		              height: -25
		            }
		          } 
		      }
		  };
	
	uiGmapGoogleMapApi.then(function(maps) {

    });
	
}])
.factory('GoogleMapsGeoTag', function($http) {
    return {
      getGeotag: function(id, apiKey) {
         return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + id + '&key=AIzaSyC5rDcP9mqkgcd4L_q3cvvXNdtvOGFy-6c');
      }
    }
});