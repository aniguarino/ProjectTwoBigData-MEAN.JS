var expressServer = "http://localhost:8083";
var map;
//Angular App Module and Controller
var sampleApp = angular.module('mapsApp', []);

sampleApp.controller('controllerMap', function ($scope, $http) {

// when landing on the page, get all markers and show them
$http.get(expressServer+'/getmarkers')
.success(function(data) {
	initMap($scope, $http, data);
})
.error(function(data) {
	console.log('Error: ' + data);
});

$scope.showElements = {
	tableDetailsAirport: false
}

$scope.airportSelected = {
	iata: "",
	city: "",
	meanDelayDep: "",
	meanDelayArr: "",
	workingCarrier: [],
	airportReached: []
}

$scope.routeSelected = {
	originIata: "",
	originCity: "",
	destIata: "",
	destCity: "",
	airTime: "",
	distanceKm: "",
	meanDelayArr: "",
	workingCarrier: []
}

$scope.filter = function() {
	var month = document.getElementById('monthFilter').value;
	$scope.monthFilter = month;

	if(month != ""){
		document.getElementById('labelfilter').style.display = "inline";
		document.getElementById('dateReset').style.display = "inline";
		document.getElementById('filterMonthLabel').innerHTML = parseDate($scope.monthFilter);
	}

	if($scope.carrierClicked != null){
		$scope.onCarrierClick($scope.carrierClicked);
	}

	if($scope.markerClicked != null){
		$scope.onMarkerOver($scope, $scope.markerClicked.iata);
	}
};

$scope.resetFilter = function() {
	$scope.monthFilter = "";

	if($scope.carrierClicked != null){
		$scope.onCarrierClick($scope.carrierClicked);
	}

	if($scope.markerClicked != null){
		$scope.onMarkerOver($scope, $scope.markerClicked.iata);
	}

	document.getElementById('labelfilter').style.display = "none";
	document.getElementById('dateReset').style.display = "none";
};

$scope.onMarkerOver = function($scope, iataMarker){
    $scope.onMarker = true;
    $scope.lastMarkerOver = iataMarker;
    $scope.markers[iataMarker].setIcon('js/icons/airportred.png');
    setMarkersOpacity($scope, iataMarker, 0.3);

	$http.get(expressServer+'/getroutesorigindistinct/'+iataMarker+'?month='+$scope.monthFilter)
	.success(function(data) {
		$scope.airportSelected.iata = data[0].OriginIata;
		$scope.airportSelected.city = data[0].OriginCity;

		$scope.airportSelected.airportReached = [];
		for(var i = 0; i < data.length; i++){
			drawLine($scope, data[i].OriginIata, data[i].DestIata, 2);
			// Possibilità di aggiungere il nome della città raggiunta oltre lo iata
			$scope.airportSelected.airportReached.push({iata: data[i].DestIata, city: "CITTA'"});
        }
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

	$http.get(expressServer+'/getcarrierorigin/'+iataMarker+'?month='+$scope.monthFilter)
	.success(function(data) {		
		$scope.airportSelected.workingCarrier = [];
		for(var i = 0; i < data.length; i++){
			document.getElementById("carrierText"+data[i]).style.color = 'red';
			document.getElementById("carrierText"+data[i]).style.fontWeight = 'bold';
			$scope.airportSelected.workingCarrier.push(getNameCarrier(data[i]));
		}
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});
};

$scope.onMarkerNotOver = function($scope, iataMarker){
	removeAllLines($scope);
	$scope.markers[iataMarker].setIcon('js/icons/airport.png');
	setMarkersOpacity($scope, iataMarker, 1);

	resetStyleControls($scope);
    $scope.onMarker = false;
    $scope.airportSelected = {};
};
    
$scope.moveClean = function($scope){
	if($scope.lastMarkerOver != "" && $scope.onMarker === false){
        $scope.lastMarkerOver = "";
        window.setTimeout(function() {
            if($scope.onMarker === false){
                removeAllLines($scope);
                resetStyleControls($scope);
            }
        }, 250);
    }
};

$scope.onCarrierClick = function(carrierCode){
	removeAllLines($scope);
	$http.get(expressServer+'/getroutescarrier/'+carrierCode+"?month="+$scope.monthFilter)
	.success(function(data) {		
		for(var i = 0; i < data.length; i++){
			drawLine($scope, data[i].OriginIata, data[i].DestIata, 1);
		}
		setMarkersOpacity($scope, 0, 0.4);
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});
    
    if($scope.monthFilter != null || $scope.monthFilter != ""){
        $http.get(expressServer+'/getcarrierinfo/'+carrierCode+"?month="+$scope.monthFilter)
        .success(function(data) {
            document.getElementById("infoCarrier").style.display = "inline";
            createGraphWeekCarrier($scope, carrierCode, data);
            //add more graphs here
            })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }
};
});

function initMap($scope, $http, data) {
	$scope.carrierClicked = null;
	$scope.monthFilter = "";
	$scope.markerClicked = null;
    $scope.lastMarkerOver = "";
    $scope.onMarker = false;

	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(37.4236178,-98.8819956),
		mapTypeId: google.maps.MapTypeId.TERRAIN
	}
	map = new google.maps.Map(document.getElementById("googleMaps"), mapOptions);
    
    google.maps.event.addListener(map, 'mousemove', function(){
		$scope.moveClean($scope);
    });

	$scope.map = map;
	$scope.markers = [];
	$scope.lines = [];

	var bounds = new google.maps.LatLngBounds();

	var createMarker = function (info, timeout){
        window.setTimeout(function() {
            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.Latitude, info.Longitude),
                title: info.Iata+" - "+info.LabelCity,
                icon: 'js/icons/airport.png',
                iata: info.Iata,
                opacity: 1,
                animation: google.maps.Animation.DROP
            });

            if(marker.iata !== 'PPG' && marker.iata !== 'GUM' && marker.iata !== 'YAP' && marker.iata !== 'ROR' && marker.iata !== 'SPN')
                bounds.extend(marker.position);

            google.maps.event.addListener(marker, 'mouseover', function(){
                if($scope.markerClicked == null && $scope.carrierClicked == null)
                    $scope.onMarkerOver($scope, info.Iata);
            });
            google.maps.event.addListener(marker, 'mouseout', function(){
                if($scope.markerClicked == null && $scope.carrierClicked == null)
                    $scope.onMarkerNotOver($scope, info.Iata);
            });

            google.maps.event.addListener(marker, 'click', function(){
                if($scope.carrierClicked == null){
                    if(marker != $scope.markerClicked && $scope.markerClicked != null){
                    	// Click da marker un marker selezionato ad un altro marker
                        var lastIataClicked = $scope.markerClicked.iata;
                        $scope.onMarkerNotOver($scope, lastIataClicked);
                        $scope.markerClicked = marker;
                        $scope.onMarkerOver($scope, info.Iata);
                    }else{
                        if($scope.markerClicked == null){
                        	// Click di un marker
                            $scope.markerClicked = marker;
                            //$scope.showElements.tableDetailsAirport = false;
                            document.getElementById('infoAirport').style.display = "inline";
                            console.log($scope.airportSelected);
                        }else{
                        	// Unclick di un marker
                            $scope.markerClicked = null;
                            //$scope.showElements.tableDetailsAirport = false;
                            document.getElementById('infoAirport').style.display = "none";
                        }
                    }
                }
            });
            map.fitBounds(bounds);
            $scope.markers[info.Iata] = marker;
        }, timeout);
	}
    
    google.maps.event.addDomListener(window, "load", function() {
        for (i = 0; i < data.length; i++)
            createMarker(data[i], i*8);
	});
    
	$http.get(expressServer+'/getallcarrier')
	.success(function(data) {
		createControls($scope, data);
		createFilterLabel($scope);
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

	createInputDate($scope);
}

function createControls($scope, data){
	$scope.airlineControls = [];

	allControl = document.createElement('div');
	allControl.id = "allcarrier";
	allControl.title = "Airline Carrier";
	allControl.className = "allControl";

	for(var i=0; i<data.length; i++){
		var br = document.createElement('br');
		var controlDiv = document.createElement('div');
		controlDiv.id = "carrierDiv";
		controlDiv.className = "carrierDiv";
		controlDiv.title = "Click to select only the "+data[i]+" routes";
		allControl.appendChild(controlDiv);
		allControl.appendChild(br);

		var carrierName = getNameCarrier(data[i]);

		var controlText = document.createElement('div');
		controlText.id = "carrierText"+data[i];
		controlText.innerHTML = carrierName;
		controlText.prop = data[i];
		controlText.className = "carrierText";
		controlText.style.color = "black";
		controlText.align = "center";
		controlDiv.appendChild(controlText);

		$scope.airlineControls.push(controlText);

		var text = data[i];

		controlText.addEventListener('click', function() {
			if($scope.markerClicked === null){
                $scope.showElements.tableDetailsAirport = false;
				if(this.style.color === "black"){
					$scope.carrierClicked = this.prop;

					resetStyleControls($scope);

					this.style.color = "green";
					this.style.fontWeight = "bolder";
					$scope.onCarrierClick(this.prop);
				}else{
					$scope.carrierClicked = null;
					this.style.color = "black";
					this.style.fontWeight = "normal";
					removeAllLines($scope);
					setMarkersOpacity($scope, 1);
                    document.getElementById("infoCarrier").style.display = "none";
				}
			}
		});
	}
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(allControl);
}

function createFilterLabel($scope, data){
	labelFilter = document.createElement('div');
	labelFilter.id = "labelfilter";
	labelFilter.title = "Mese selezionato per il filtro";
	labelFilter.className = "labelFilter";
	labelFilter.style.display = "none";

	var filterHeadText = document.createElement('div');
	filterHeadText.id = "filterMonthHeadLabel";
	filterHeadText.className = "filterText";
	filterHeadText.innerHTML = "Mese selezionato: ";
	filterHeadText.style.color = "black";
	filterHeadText.align = "center";
	labelFilter.appendChild(filterHeadText);

	var filterText = document.createElement('div');
	filterText.id = "filterMonthLabel";
	filterText.className = "filterText";
	filterText.style.color = "red";
	filterText.style.fontWeight = "bold";
	filterText.align = "center";
	labelFilter.appendChild(filterText);

	labelFilter.appendChild(document.getElementById('dateReset'));

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(labelFilter);
}

function createInputDate($scope, data){
	var dateDiv = document.getElementById('selectMonth');

	google.maps.event.addDomListener(window, "load", function() {
		dateDiv.style.display = "inline";
	});

	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(dateDiv);
}

function drawLine($scope, airport1, airport2, stroke) {
	var flightPath = new google.maps.Polyline({
		path: [$scope.markers[airport1].position, $scope.markers[airport2].position],
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: stroke
	});

	google.maps.event.addListener(flightPath, 'click', function(){
        document.getElementById('infoRoute').style.display = "inline";
    });

	$scope.lines.push(flightPath);
	flightPath.setMap($scope.map);

	return flightPath;
}

function removeAllLines($scope){
	if($scope.lines != null){
		for (i=0; i<$scope.lines.length; i++) {                           
			$scope.lines[i].setMap(null);
		}
		$scope.lines = [];
	}
}

function setMarkersOpacity($scope, iataMarker, opacity){
	for (var current in $scope.markers) {
		if(current != iataMarker)
			$scope.markers[current].setOpacity(opacity);
	}
}

function setAllMarkersOpacity($scope, opacity){
	for (var current in $scope.markers) {
		$scope.markers[current].setOpacity(opacity);
	}
}

function resetStyleControls($scope){
	for(var i=0; i<$scope.airlineControls.length; i++){
		$scope.airlineControls[i].style.color='black';
		$scope.airlineControls[i].style.fontWeight = "normal";
	}
}

function getNameCarrier(carrierCode){
	if(carrierCode == "AA")
		return "American Airlines";
	if(carrierCode == "OO")
		return "Skywest Airlines";
	if(carrierCode == "B6")
		return "JetBlue Airways";
	if(carrierCode == "AS")
		return "Alaska Airlines";
	if(carrierCode == "WN")
		return "Southwest Airlines";
	if(carrierCode == "F9")
		return "Frontier Airlines";
	if(carrierCode == "NK")
		return "Spirit Air Lines";
	if(carrierCode == "DL")
		return "Delta Air Lines";
	if(carrierCode == "UA")
		return "United Air Lines";
	if(carrierCode == "HA")
		return "Hawaiian Airlines";
	if(carrierCode == "EV")
		return "Atlantic Southeast Airlines";
	if(carrierCode == "VX")
		return "Virgin America";
	if(carrierCode == "US")
		return "US Airways";
	if(carrierCode == "MQ")
		return "American Eagle Airlines";
	if(carrierCode == "FL")
		return "AirTran Airways Corporation";
	if(carrierCode == "PA (1)")
		return "Pan American World Airways";
	if(carrierCode == "TW")
		return "Trans World Airways LLC";
	if(carrierCode == "EA")
		return "Eastern Air Lines";
	if(carrierCode == "NW")
		return "Northwest Airlines";
	if(carrierCode == "HP")
		return "America West Airlines";
	if(carrierCode == "EA")
		return "Eastern Air Lines";
	if(carrierCode == "CO")
		return "Continental Air Lines";

	return carrierCode;
}

function parseDate(date){
	var year = date.substring(0, 4);
	var month = date.substring(5, 7);

	if(month == '01')
		month = 'Gennaio';
	if(month == '02')
		month = 'Febbraio';
	if(month == '03')
		month = 'Marzo';
	if(month == '04')
		month = 'Aprile';
	if(month == '05')
		month = 'Maggio';
	if(month == '06')
		month = 'Giugno';
	if(month == '07')
		month = 'Luglio';
	if(month == '08')
		month = 'Agosto';
	if(month == '09')
		month = 'Settembre';
	if(month == '10')
		month = 'Ottobre';
	if(month == '11')
		month = 'Novembre';
	if(month == '12')
		month = 'Dicembre';

	return month+" "+year;
}

function parseDay(day){
    if(day == '1')
		day = 'Lunedi';
	if(day == '2')
		day = 'Martedi';
	if(day == '3')
		day = 'Mercoledi';
    if(day == '4')
		day = 'Giovedi';
    if(day == '5')
		day = 'Venerdi';
    if(day == '6')
		day = 'Sabato';
    if(day == '7')
		day = 'Domenica';
    
    return day;
}

function parseMinutes(time){
    var hours = time.substring(0,2);
    var minutes = time.substring(3,5);
    
    return parseInt(hours*60)+parseInt(minutes);
}

function createGraphWeekCarrier($scope, carrierCode, data){

    var meansPoints = [];
    var deviationPoints = [];
    var countPoints0 = [];
    var countPoints15 = [];
    var countPoints60 = [];
    var countPoints3h = [];
    var countPoints24h = [];
    var countPointsOther = [];
    
    for(var i = 0; i < data.length; i++){
        var minutesMeans = parseMinutes(data[i].MeanDelay);
        var minutesDeviation = parseMinutes(data[i].StandardDeviation);
        var day = parseDay(data[i].DayOfWeek);
        meansPoints.push({y: minutesMeans, label: day});
        deviationPoints.push({y: minutesDeviation, label: day});
        
        countPoints0.push({y: data[i].CountDelay0, label: day});
        countPoints15.push({y: data[i].CountDelay15, label: day});
        countPoints60.push({y: data[i].CountDelay60, label: day});
        countPoints3h.push({y: data[i].CountDelay3h, label: day});
        countPoints24h.push({y: data[i].CountDelay24h, label: day});
        countPointsOther.push({y: data[i].CountDelayOther, label: day});
    }
    
    var chartGraphMeans = new CanvasJS.Chart("graphMeans",
    {
      title:{
      text: "Distribuzione ritardi di " + parseDate($scope.monthFilter) + " per " + getNameCarrier(carrierCode)   
      },
      axisY:{
        title:"Ritardo in minuti"   
      },
      animationEnabled: true,
      data: [
      {        
        type: "stackedColumn",
        toolTipContent: "{label}<br/><span style='\"'color: {color};'\"'><strong>{name}</strong></span>: {y} minuti",
        name: "Media",
        showInLegend: "true",
        dataPoints: meansPoints,
        color: "darkred"
      },  {        
        type: "stackedColumn",
        toolTipContent: "{label}<br/><span style='\"'color: {color};'\"'><strong>{name}</strong></span>: {y} minuti",
        name: "Deviazione standard",
        showInLegend: "true",
        dataPoints: deviationPoints,
        color: "lightblue"
      }            
      ]
      ,
      legend:{
        cursor:"pointer",
        itemclick: function(e) {
          if (typeof (e.dataSeries.visible) ===  "undefined" || e.dataSeries.visible) {
	          e.dataSeries.visible = false;
          }
          else
          {
            e.dataSeries.visible = true;
          }
          chartGraphMeans.render();
        }
      }
    });
    
    chartGraphMeans.render();
    
    var chartGraphCount = new CanvasJS.Chart("graphCount",
		{
			theme: "theme3",
            animationEnabled: true,
			title:{
				text: "Distribuzione ritardi di " + parseDate($scope.monthFilter) + " per " + getNameCarrier(carrierCode),
				fontSize: 30
			},
			toolTip: {
				shared: true
			},			
			axisY: {
				title: "Numero di voli"
			},		
			data: [ 
			{
				type: "column",	
				name: "In orario",
				legendText: "In orario",
				showInLegend: true, 
				dataPoints: countPoints0
			},
			{
				type: "column",	
				name: "Ritardo entro 15 minuti",
				legendText: "Ritardo entro 15 minuti",
				showInLegend: true, 
				dataPoints: countPoints15
			},
            {
				type: "column",	
				name: "Ritardo entro 1 ora",
				legendText: "Ritardo entro 1 ora",
				showInLegend: true, 
				dataPoints: countPoints60
			},
            {
				type: "column",	
				name: "Ritardo entro 3 ore",
				legendText: "Ritardo entro 3 ore",
				showInLegend: true, 
				dataPoints: countPoints3h
			},
            {
				type: "column",	
				name: "Ritardo entro 24 ore",
				legendText: "Ritardo entro 24 ore",
				showInLegend: true, 
				dataPoints: countPoints24h
			},
            {
				type: "column",	
				name: "Ritardo oltre un giorno",
				legendText: "Ritardo oltre un giorno",
				showInLegend: true, 
				dataPoints: countPointsOther
			}
			],
          legend:{
            cursor:"pointer",
            itemclick: function(e){
              if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
              	e.dataSeries.visible = false;
              }
              else {
                e.dataSeries.visible = true;
              }
            	chartGraphCount.render();
            }
          },
        });

    chartGraphCount.render();
}