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
    
});

function initMap($scope, data) {
    var mapOptions = {
          zoom: 4,
          center: new google.maps.LatLng(42,-83),
          mapTypeId: google.maps.MapTypeId.TERRAIN
      }
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      $scope.map = map;
      $scope.markers = [];

      var bounds = new google.maps.LatLngBounds();
      var infoWindow = new google.maps.InfoWindow();

      var createMarker = function (info){

          var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(info.Latitude, info.Longitude),
              title: info.LabelCity,
              icon: 'js/icons/airport.png'
          });

          if(marker.title !== 'Pago Pago, TT' && marker.title !== 'Guam, TT')
            bounds.extend(marker.position);

          marker.content = '<div class="infoWindowContent">' + info.Iata + '</div>';

          google.maps.event.addListener(marker, 'click', function(){
              infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
              infoWindow.open($scope.map, marker);
          });

          $scope.markers.push(marker);
          map.fitBounds(bounds);
      }  

      google.maps.event.addDomListener(window, "load", function() {
      for (i = 0; i < data.length; i++){
          createMarker(data[i]);
        }
      });
        
    google.maps.event.addDomListener(window, "load", function() {
        drawLine($scope, data[0], data[1]);
      }); 
}

function drawLine($scope, airport1, airport2) {
    var flightPath = new google.maps.Polyline({
        path: [$scope.markers[airport1].getPosition(), $scope.markers[airport2].getPosition()],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 5
    });

    flightPath.setMap($scope.map);
}