var map;
//Angular App Module and Controller
var sampleApp = angular.module('mapsApp', []);
sampleApp.controller('controllerMarker', function ($scope, $http) {
	$scope.formData = {};

// when landing on the page, get all markers and show them
$http.get('http://localhost:8083/getmarkers')
.success(function(data) {
	initMap($scope, data);
})
.error(function(data) {
	console.log('Error: ' + data);
});

$scope.onMarkerClicked = function(iataMarker){
	removeAllLines($scope);
	if($scope.lastIataMarkerClicked === iataMarker){
		setMarkersOpacity($scope, 1);
		$scope.lastIataMarkerClicked = null;
	}else{
		$http.get('http://localhost:8083/getroutesorigin/'+iataMarker)
		.success(function(data) {		
			for(var i = 0; i < data.length; i++){
				drawLine($scope, data[i].OriginIata, data[i].DestIata);
			}
			setMarkersOpacity($scope, 0.6);
			$scope.lastIataMarkerClicked = iataMarker;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	}
};
});

function initMap($scope, data) {
	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(37.4236178,-98.8819956),
		mapTypeId: google.maps.MapTypeId.TERRAIN
	}
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
	$scope.map = map;
	$scope.markers = [];
	$scope.lines = [];
	$scope.lastIataMarkerClicked;

	var bounds = new google.maps.LatLngBounds();
	var infoWindow = new google.maps.InfoWindow();

	var createMarker = function (info){
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(info.Latitude, info.Longitude),
			title: info.LabelCity,
			icon: 'js/icons/airport.png',
			opacity: 1
		});

		if(marker.title !== 'Pago Pago, TT' && marker.title !== 'Guam, TT')
			bounds.extend(marker.position);

		marker.content = '<div class="infoWindowContent">' + info.Iata + '</div>';

		google.maps.event.addListener(marker, 'click', function(){
			$scope.onMarkerClicked(info.Iata);
		});

		$scope.markers[info.Iata] = marker;
		map.fitBounds(bounds);
	}  

	google.maps.event.addDomListener(window, "load", function() {
		for (i = 0; i < data.length; i++){
			createMarker(data[i]);
		}
	});
}

function drawLine($scope, airport1, airport2) {
	var flightPath = new google.maps.Polyline({
		path: [$scope.markers[airport1].position, $scope.markers[airport2].position],
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	$scope.lines.push(flightPath);

	flightPath.setMap($scope.map);
}

function removeAllLines($scope){
	if($scope.lines != null){
		for (i=0; i<$scope.lines.length; i++) {                           
			$scope.lines[i].setMap(null);
		}
		$scope.lines = [];
	}
}

function setMarkersOpacity($scope, opacity){
	for (var current in $scope.markers) {
		$scope.markers[current].setOpacity(opacity);
	}
}