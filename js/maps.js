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
    	airportReached: [],
        airportInfoGraphs: [],
        airportOtherInfoGraphs: []
    }

    $scope.routeSelected = {
    	originIata: "",
    	originCity: "",
    	destIata: "",
    	destCity: "",
    	airTime: "",
    	distanceMiles: "",
    	distanceKm: "",
    	workingCarrier: []
    }

    $scope.filter = function() {
    	var month = document.getElementById('monthFilter').value;
    	$scope.monthFilter = month;
        document.getElementById('infoGhostFlights').style.display = "none";
        document.getElementById('otherInfoCarrierDelays').style.display = "none";
        
    	if(month != ""){
    		document.getElementById('labelfilter').style.display = "inline";
    		document.getElementById('dateReset').style.display = "inline";
    		document.getElementById('filterMonthLabel').innerHTML = parseDate($scope.monthFilter);
    		document.getElementById('allcarrier').remove();
            allCarriers($scope, $http); //this time, filtered by month

            if($scope.carrierClicked != null){
            	window.setTimeout(function() {
            		if(document.getElementById('carrierText'+$scope.carrierClicked) != null){
            			document.getElementById('carrierText'+$scope.carrierClicked).style.color = "green";
            			document.getElementById('carrierText'+$scope.carrierClicked).style.fontWeight = "bolder";
            		}
            	}, 100);
            }
        }

        if($scope.carrierClicked != null){
        	$scope.onCarrierClick($scope.carrierClicked);
        }

        if($scope.markerClicked != null){
        	$scope.onMarkerNotOver($scope, $scope.markerClicked.iata);
        	$scope.onMarkerOver($scope, $scope.markerClicked.iata);
        }

    };

    $scope.resetFilter = function() {
    	$scope.monthFilter = "";

    	if(document.getElementById('allcarrier') != null)
    		document.getElementById('allcarrier').remove();
    	//window.setTimeout(function() {
            allCarriers($scope, $http); //reset allCarrier without filtering
        //}, 20);

        window.setTimeout(function() {
    	if($scope.carrierClicked != null){
    			if(document.getElementById('carrierText'+$scope.carrierClicked) != null){
    				document.getElementById('carrierText'+$scope.carrierClicked).style.color = "green";
    				document.getElementById('carrierText'+$scope.carrierClicked).style.fontWeight = "bolder";
    			}
    		$scope.onCarrierClick($scope.carrierClicked);
    	}
        }, 100);

    	if($scope.markerClicked != null){
    		window.setTimeout(function() {
    			$scope.onMarkerOver($scope, $scope.markerClicked.iata);
    		}, 120); 
    	}

    	document.getElementById('labelfilter').style.display = "none";
    	document.getElementById('dateReset').style.display = "none";
    	document.getElementById("infoCarrier").style.display = "none";
    };

    $scope.onMarkerOver = function($scope, iataMarker){
    	$scope.onMarker = true;
    	$scope.lastMarkerOver = iataMarker;
    	$scope.markers[iataMarker].setIcon('js/icons/airportred.png');
    	setMarkersOpacity($scope, iataMarker, 0.3);

    	$http.get(expressServer+'/getroutesorigindistinct/'+iataMarker+'?month='+$scope.monthFilter)
    	.success(function(data) {
    		if(data.length != 0){
    			$scope.airportSelected.iata = data[0].OriginIata;
    			$scope.airportSelected.city = data[0].OriginCity;

    			$scope.airportSelected.airportReached = [];
    			for(var i = 0; i < data.length; i++){
    				drawLine($scope, $http, data[i], 2);
                    // Possibilità di aggiungere il nome della città raggiunta oltre lo iata
                    $scope.airportSelected.airportReached.push({iata: data[i].DestIata, city: data[i].DestCity});
                }
                
                $scope.airportSelected.airportInfoGraphs = [];      
                $scope.airportSelected.airportInfoGraphs.push({meanDelayDep: $scope.markers[data[0].OriginIata].meanDelayDep, meanDelayArr: $scope.markers[data[0].OriginIata].meanDelayArr, countDelayDep0: $scope.markers[data[0].OriginIata].countDelayDep0, countDelayDep15: $scope.markers[data[0].OriginIata].countDelayDep15, countDelayDep60: $scope.markers[data[0].OriginIata].countDelayDep60, countDelayDep3h: $scope.markers[data[0].OriginIata].countDelayDep3h, countDelayDep24h: $scope.markers[data[0].OriginIata].countDelayDep24h, countDelayDepOther: $scope.markers[data[0].OriginIata].countDelayDepOther, countDelayArr0: $scope.markers[data[0].OriginIata].countDelayArr0, countDelayArr15: $scope.markers[data[0].OriginIata].countDelayArr15, countDelayArr60: $scope.markers[data[0].OriginIata].countDelayArr60, countDelayArr3h: $scope.markers[data[0].OriginIata].countDelayArr3h, countDelayArr24h: $scope.markers[data[0].OriginIata].countDelayArr24h, countDelayArrOther: $scope.markers[data[0].OriginIata].countDelayArrOther});
                
                $scope.airportSelected.airportOtherInfoGraphs = [];      
                $scope.airportSelected.airportOtherInfoGraphs.push({carrierDelayDep: $scope.markers[data[0].OriginIata].carrierDelayDep, weatherDelayDep: $scope.markers[data[0].OriginIata].weatherDelayDep, nasDelayDep: $scope.markers[data[0].OriginIata].nasDelayDep, securityDelayDep: $scope.markers[data[0].OriginIata].securityDelayDep, lateAircraftDelayDep: $scope.markers[data[0].OriginIata].lateAircraftDelayDep, carrierDelayArr: $scope.markers[data[0].OriginIata].carrierDelayArr, weatherDelayArr: $scope.markers[data[0].OriginIata].weatherDelayArr, nasDelayArr: $scope.markers[data[0].OriginIata].nasDelayArr, securityDelayArr: $scope.markers[data[0].OriginIata].securityDelayArr, lateAircraftDelayArr: $scope.markers[data[0].OriginIata].lateAircraftDelayArr});
            }
        })
    	.error(function(data) {
    		console.log('Error: ' + data);
    	});

    	$http.get(expressServer+'/getcarrierorigin/'+iataMarker+'?month='+$scope.monthFilter)
    	.success(function(data) {		
    		for(var i = 0; i < data.length; i++){
    			document.getElementById("carrierText"+data[i]).style.color = 'red';
    			document.getElementById("carrierText"+data[i]).style.fontWeight = 'bold';
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
    			drawLine($scope, $http, data[i], 1);
    		}
    		setMarkersOpacity($scope, 0, 0.4);
    	})
    	.error(function(data) {
    		console.log('Error: ' + data);
    	});

    	if($scope.monthFilter != null || $scope.monthFilter != ""){
    		$http.get(expressServer+'/getcarrierinfo/'+carrierCode+"?month="+$scope.monthFilter)
    		.success(function(data) {
                document.getElementById('infoCarrierDelays').style.display = "none";
                document.getElementById('errorDelays').style.display = "none";
                document.getElementById('infoAirportDelays').style.display = "none";
                document.getElementById('infoOtherAirportDelays').style.display = "none";
    			document.getElementById("infoCarrier").style.display = "inline";
    			createGraphWeekCarrier($scope, carrierCode, data);
                //add more graphs here
            })
    		.error(function(data) {
    			console.log('Error: ' + data);
    		});
    	}
        
        if($scope.monthFilter == null || $scope.monthFilter == ""){
    		$http.get(expressServer+'/getghostflights/'+carrierCode)
    		.success(function(data) {
                document.getElementById('infoCarrierDelays').style.display = "none";
                document.getElementById('errorDelays').style.display = "none";
                document.getElementById('infoAirportDelays').style.display = "none";
                document.getElementById('infoOtherAirportDelays').style.display = "none";
    			document.getElementById('infoCarrier').style.display = "none";
                document.getElementById('infoGhostFlights').style.display = "inline";
    			createGraphGhostFlights($scope, carrierCode, data);
            })
    		.error(function(data) {
    			console.log('Error: ' + data);
    		});
            
            
            $http.get(expressServer+'/getcarrierdelay/'+carrierCode)
    		.success(function(data) {
                document.getElementById('otherInfoCarrierDelays').style.display = "inline";
    			createGraphOtherCarrierDelays($scope, carrierCode, data);
            })
    		.error(function(data) {
    			console.log('Error: ' + data);
    		});   
    	}
    };
        
    $scope.showInfoCarrier = function() {

    	for(var i=0; i<$scope.routeSelected.workingCarrier.length; i++){
    		if($scope.currentCarrier.trim() == $scope.routeSelected.workingCarrier[i].UniqueCarrier.trim()){
    			document.getElementById('carrierDetails').innerHTML = "Compagnia "+$scope.currentCarrier+" in attivo dal "+$scope.routeSelected.workingCarrier[i].FlightDateMin +" al "+ $scope.routeSelected.workingCarrier[i].FlightDateMax;
    			document.getElementById('carrierDetails').innerHTML = document.getElementById('carrierDetails').innerHTML + "<br>Ritardo medio alla partenza dei voli: " + $scope.routeSelected.workingCarrier[i].MeanDepDelay + " - Ritardo medio all'arrivo dei voli: " + $scope.routeSelected.workingCarrier[i].MeanArrDelay;
    			document.getElementById('carrierDetails').style.display = "inline";

    			var chartGraphCountDep = new CanvasJS.Chart("graphCountDelaysDep",
    			{
    				theme: "theme3",
    				animationEnabled: true,
    				title:{
    					text: "Ritardi voli in partenza di "+$scope.currentCarrier.trim(),
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
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDep0, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 15 minuti",
    					legendText: "Ritardo entro 15 minuti",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDep15, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 1 ora",
    					legendText: "Ritardo entro 1 ora",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDep60, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 3 ore",
    					legendText: "Ritardo entro 3 ore",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDep3h, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 24 ore",
    					legendText: "Ritardo entro 24 ore",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDep24h, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo oltre un giorno",
    					legendText: "Ritardo oltre un giorno",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayDepOther, label: " "}]
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
    						chartGraphCountDep.render();
    					}
    				},
    			});

    			chartGraphCountDep.render();

    			var chartGraphCountArr = new CanvasJS.Chart("graphCountDelaysArr",
    			{
    				theme: "theme3",
    				animationEnabled: true,
    				title:{
    					text: "Ritardi voli in arrivo di "+$scope.currentCarrier.trim(),
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
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArr0, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 15 minuti",
    					legendText: "Ritardo entro 15 minuti",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArr15, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 1 ora",
    					legendText: "Ritardo entro 1 ora",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArr60, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 3 ore",
    					legendText: "Ritardo entro 3 ore",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArr3h, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo entro 24 ore",
    					legendText: "Ritardo entro 24 ore",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArr24h, label: " "}]
    				},
    				{
    					type: "column",	
    					name: "Ritardo oltre un giorno",
    					legendText: "Ritardo oltre un giorno",
    					showInLegend: true, 
    					dataPoints: [{y: $scope.routeSelected.workingCarrier[i].CountDelayArrOther, label: " "}]
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
    						chartGraphCountArr.render();
    					}
    				},
    			});

    			chartGraphCountArr.render();

    			document.getElementById('infoCarrierDelays').style.display = "inline";
    		}
    	}
    }
});

    function initMap($scope, $http, data) {
    	$scope.carrierClicked = null;
        $scope.carrierClickedButton = null;
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
                    city: info.LabelCity,
                    meanDelayDep: info.MeanDelayDep,
                    meanDelayArr: info.MeanDelayArr,
                    
                    countDelayDep0: info.CountDelayDep0,
                    countDelayDep15: info.CountDelayDep15,
                    countDelayDep60: info.CountDelayDep60,
                    countDelayDep3h: info.CountDelayDep3h,
                    countDelayDep24h: info.CountDelayDep24h,
                    countDelayDepOther: info.CountDelayDepOther,
                    
                    countDelayArr0: info.CountDelayArr0,
                    countDelayArr15: info.CountDelayArr15,
                    countDelayArr60: info.CountDelayArr60,
                    countDelayArr3h: info.CountDelayArr3h,
                    countDelayArr24h: info.CountDelayArr24h,
                    countDelayArrOther: info.CountDelayArrOther,
                    
                    //Other info delays for airport
                    carrierDelayDep: info.CarrierDelayDep,
                    weatherDelayDep: info.WeatherDelayDep,
                    nasDelayDep: info.NASDelayDep,
                    securityDelayDep: info.SecurityDelayDep,
                    lateAircraftDelayDep: info.LateAircraftDelayDep,
                    
                    carrierDelayArr: info.CarrierDelayArr,
                    weatherDelayArr: info.WeatherDelayArr,
                    nasDelayArr: info.NASDelayArr,
                    securityDelayArr: info.SecurityDelayArr,
                    lateAircraftDelayArr: info.LateAircraftDelayArr,
                    
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
                            document.getElementById('infoRoute').style.display = "none";
                            document.getElementById('carrierDetails').style.display = "none";
                            document.getElementById('infoCarrierDelays').style.display = "none";
                            document.getElementById('errorDelays').style.display = "none";
                            document.getElementById('infoAirport').style.display = "inline";
                            document.getElementById('infoAirportDelays').style.display = "inline";
                            document.getElementById('infoOtherAirportDelays').style.display = "inline";
                            window.setTimeout(function() {
                                showGraphsAirport ($scope);
                                showOtherGraphsAirport ($scope);
                            }, 100);
                        }else{
                        	if($scope.markerClicked == null){
                                // Click di un marker
                                $scope.markerClicked = marker;
                                //$scope.showElements.tableDetailsAirport = false;
                                document.getElementById('infoAirport').style.display = "inline";
                                document.getElementById('infoAirportDelays').style.display = "inline";
                                document.getElementById('infoOtherAirportDelays').style.display = "inline";
                                document.getElementById('infoCarrierDelays').style.display = "none";
                                document.getElementById('errorDelays').style.display = "none";
                                showGraphsAirport ($scope);
                                showOtherGraphsAirport ($scope);
                                
                            }else{
                                // Unclick di un marker
                                $scope.markerClicked = null;
                                //$scope.showElements.tableDetailsAirport = false;
                                document.getElementById('infoRoute').style.display = "none";
                                document.getElementById('carrierDetails').style.display = "none";
                                document.getElementById('infoCarrierDelays').style.display = "none";
                                document.getElementById('errorDelays').style.display = "none";
                                document.getElementById('infoAirport').style.display = "none";
                                document.getElementById('infoAirportDelays').style.display = "none";
                                document.getElementById('infoOtherAirportDelays').style.display = "none";
                            }
                        }
                    }
                });
    			map.fitBounds(bounds);
    			$scope.markers[info.Iata] = marker;
    		}, timeout);
    	}

    	$(document).ready(function() {
    		for (i = 0; i < data.length; i++)
    			createMarker(data[i], i*8);
    	});

        allCarriers($scope, $http); //getAllCarriers

        createInputDate($scope);
    }

    function showGraphsAirport ($scope){
            
        var chartGraphCountDep = new CanvasJS.Chart("graphAirportDelaysDep",
        {
            theme: "theme3",
            animationEnabled: true,
            title:{
                text: "Ritardi voli in partenza per l'aeroporto di "+$scope.airportSelected.city,
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
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDep0, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 15 minuti",
                legendText: "Ritardo entro 15 minuti",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDep15, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 1 ora",
                legendText: "Ritardo entro 1 ora",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDep60, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 3 ore",
                legendText: "Ritardo entro 3 ore",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDep3h, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 24 ore",
                legendText: "Ritardo entro 24 ore",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDep24h, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo oltre un giorno",
                legendText: "Ritardo oltre un giorno",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayDepOther, label: " "}]
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
                    chartGraphCountDep.render();
                }
            },
        });

        chartGraphCountDep.render();

        var chartGraphCountArr = new CanvasJS.Chart("graphAirportDelaysArr",
        {
            theme: "theme3",
            animationEnabled: true,
            title:{
                text: "Ritardi voli in arrivo per l'aeroporto di "+$scope.airportSelected.city,
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
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArr0, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 15 minuti",
                legendText: "Ritardo entro 15 minuti",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArr15, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 1 ora",
                legendText: "Ritardo entro 1 ora",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArr60, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 3 ore",
                legendText: "Ritardo entro 3 ore",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArr3h, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo entro 24 ore",
                legendText: "Ritardo entro 24 ore",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArr24h, label: " "}]
            },
            {
                type: "column",	
                name: "Ritardo oltre un giorno",
                legendText: "Ritardo oltre un giorno",
                showInLegend: true, 
                dataPoints: [{y: $scope.airportSelected.airportInfoGraphs[0].countDelayArrOther, label: " "}]
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
                    chartGraphCountArr.render();
                }
            },
        });

        chartGraphCountArr.render();
    }

    function showOtherGraphsAirport ($scope){
         var chartDep = new CanvasJS.Chart("graphOtherAirportDelaysDep",
        {
            title:{
                text: "Cause dei ritardi in partenza per l'aeroporto di "+$scope.airportSelected.city
            },
                animationEnabled: true,
            legend:{
                verticalAlign: "center",
                horizontalAlign: "left",
                fontSize: 20,
                fontFamily: "Helvetica"        
            },
            
            data: [
            {        
                type: "pie",       
                indexLabelFontFamily: "Garamond",       
                indexLabelFontSize: 20,
                indexLabel: "{label} {y}%",
                startAngle:-20,      
                showInLegend: true,
                toolTipContent:"{legendText} {y}%",
                dataPoints: [
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].carrierDelayDep).toFixed(4), legendText:"Compagnie", label: "Compagnie" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].weatherDelayDep).toFixed(4), legendText:"Meteo", label: "Meteo" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].nasDelayDep).toFixed(4), legendText:"Aviazione nazionale", label: "Aviazione nazionale" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].securityDelayDep).toFixed(4), legendText:"Sicurezza" , label: "Sicurezza"},
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].lateAircraftDelayDep).toFixed(4), legendText:"Veivolo" , label: "Veivolo"}
                ]
            }
            ]
        });
        
        chartDep.render();
        
         var chartArr = new CanvasJS.Chart("graphOtherAirportDelaysArr",
        {
            title:{
                text: "Cause dei ritardi in arrivo per l'aeroporto di "+$scope.airportSelected.city
            },
                animationEnabled: true,
            legend:{
                verticalAlign: "center",
                horizontalAlign: "left",
                fontSize: 20,
                fontFamily: "Helvetica"        
            },
            
            data: [
            {        
                type: "pie",       
                indexLabelFontFamily: "Garamond",       
                indexLabelFontSize: 20,
                indexLabel: "{label} {y}%",
                startAngle:-20,      
                showInLegend: true,
                toolTipContent:"{legendText} {y}%",
                dataPoints: [
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].carrierDelayArr).toFixed(4), legendText:"Compagnie", label: "Compagnie" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].weatherDelayArr).toFixed(4), legendText:"Meteo", label: "Meteo" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].nasDelayArr).toFixed(4), legendText:"Aviazione nazionale", label: "Aviazione nazionale" },
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].securityDelayArr).toFixed(4), legendText:"Sicurezza" , label: "Sicurezza"},
                    {  y: ($scope.airportSelected.airportOtherInfoGraphs[0].lateAircraftDelayArr).toFixed(4), legendText:"Veivolo" , label: "Veivolo"}
                ]
            }
            ]
        });
        
        chartArr.render();
    }

    function allCarriers($scope, $http){
    	$http.get(expressServer+'/getallcarrier?month='+$scope.monthFilter)
    	.success(function(data) {
    		createControls($scope, data);
    	})
    	.error(function(data) {
    		console.log('Error: ' + data);
    	});
    }

    function createControls($scope, data){
    	$scope.airlineControls = [];

    	allControl = document.createElement('div');
    	allControl.id = "allcarrier";
    	allControl.title = "Airline Carrier";
    	allControl.className = "allControl";
        
        var sortedData = data.sort();
        
    	for(var i=0; i<sortedData.length; i++){
    		var br = document.createElement('br');
    		var controlDiv = document.createElement('div');
    		controlDiv.id = "carrierDiv";
    		controlDiv.className = "carrierDiv";
    		controlDiv.title = "Clicca per selezionare solo le rotte di "+getNameCarrier(data[i]);
    		allControl.appendChild(controlDiv);
    		allControl.appendChild(br);

    		var carrierName = getNameCarrier(sortedData[i]);

    		var controlText = document.createElement('div');
    		controlText.id = "carrierText"+sortedData[i];
    		controlText.innerHTML = carrierName;
    		controlText.prop = sortedData[i];
    		controlText.className = "carrierText";
    		controlText.style.color = "black";
    		controlText.align = "center";
    		controlDiv.appendChild(controlText);

    		$scope.airlineControls.push(controlText);

    		var text = sortedData[i];

    		controlText.addEventListener('click', function() {
                if($scope.carrierClicked != null && $scope.carrierClicked != this.prop){
                    $scope.carrierClickedButton.style.color = "black";
                    $scope.carrierClickedButton.style.fontWeight = "normal";
                    removeAllLines($scope);
                    setMarkersOpacity($scope, 1);
                    document.getElementById('infoRoute').style.display = "none";
                    document.getElementById('infoCarrierDelays').style.display = "none";
                    document.getElementById('errorDelays').style.display = "none";
                    document.getElementById("infoCarrier").style.display = "none";
                    document.getElementById('infoGhostFlights').style.display = "none";
                    document.getElementById('otherInfoCarrierDelays').style.display = "none";
                    $scope.carrierClicked = null;
                    $scope.carrierClickedButton = null;
                }
    			if($scope.markerClicked === null){
    				$scope.showElements.tableDetailsAirport = false;
    				if(this.style.color === "black"){
    					$scope.carrierClicked = this.prop;
                        $scope.carrierClickedButton = this;

    					resetStyleControls($scope);

    					this.style.color = "green";
    					this.style.fontWeight = "bolder";
    					$scope.onCarrierClick(this.prop);
    				}else{
    					$scope.carrierClicked = null;
                        $scope.carrierClickedButton = null;
    					this.style.color = "black";
    					this.style.fontWeight = "normal";
    					removeAllLines($scope);
    					setMarkersOpacity($scope, 1);
                        document.getElementById('infoRoute').style.display = "none";
                        document.getElementById('infoCarrierDelays').style.display = "none";
                        document.getElementById('errorDelays').style.display = "none";
    					document.getElementById("infoCarrier").style.display = "none";
                        document.getElementById('infoGhostFlights').style.display = "none";
                        document.getElementById('otherInfoCarrierDelays').style.display = "none";
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

    	$(document).ready(function() {
    		dateDiv.style.display = "inline";
    	});

    	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(dateDiv);

    	createFilterLabel($scope);
    }

    function drawLine($scope, $http, data, stroke) {
    	var flightPath = new google.maps.Polyline({
    		path: [$scope.markers[data.OriginIata].position, $scope.markers[data.DestIata].position],
    		geodesic: true,
    		strokeColor: '#FF0000',
    		strokeOpacity: 1.0,
    		strokeWeight: stroke,
    		originIata: data.OriginIata,
    		destIata: data.DestIata,
    		originCity: data.OriginCity,
    		destCity: data.DestCity,
    		airTime: data.AirTime,
    		distanceMiles: data.DistanceMiles,
    		distanceKm: data.DistanceKm,
    		originCoordinates: '(Latitudine: '+data.OriginLatitude+' - Longitudine: '+data.OriginLongitude+')',
    		destCoordinates: '(Latitudine: '+data.DestLatitude+' - Longitudine: '+data.DestLongitude+')'
    	});

    	google.maps.event.addListener(flightPath, 'click', function(){
    		document.getElementById('infoRoute').style.display = "inline";
            document.getElementById('infoCarrier').style.display = "none";
    		document.getElementById('infoAirport').style.display = "none";
            document.getElementById('carrierDetails').style.display = "none";
            document.getElementById('infoCarrierDelays').style.display = "none";
            document.getElementById('errorDelays').style.display = "none";
            document.getElementById('infoAirportDelays').style.display = "none";
            document.getElementById('infoOtherAirportDelays').style.display = "none";
            document.getElementById('infoGhostFlights').style.display = "none";
            document.getElementById('otherInfoCarrierDelays').style.display = "none";

    		$http.get(expressServer+'/getrouteinfo?origin='+flightPath.originIata+'&dest='+flightPath.destIata)
    		.success(function(data) {
    			if(data.length != 0){
    				$scope.routeSelected.originIata = flightPath.originIata;
    				$scope.routeSelected.originCity = flightPath.originCity;
    				$scope.routeSelected.destIata = flightPath.destIata;
    				$scope.routeSelected.destCity = flightPath.destCity;
    				$scope.routeSelected.airTime = flightPath.airTime;
    				$scope.routeSelected.distanceMiles = flightPath.distanceMiles;
    				$scope.routeSelected.distanceKm = flightPath.distanceKm;
    				for(var i=0; i<data.length; i++){
                    //Parsing data attributes
                    data[i].UniqueCarrier = getNameCarrier(data[i].UniqueCarrier);
                    data[i].FlightDateMax = data[i].FlightDateMax.slice(-2) +" "+ parseDate(data[i].FlightDateMax);
                    data[i].FlightDateMin = data[i].FlightDateMin.slice(-2) +" "+ parseDate(data[i].FlightDateMin);
                }
                $scope.currentCarrier = null;
                $scope.routeSelected.workingCarrier = data;

            }
        })
    		.error(function(data) {
    			console.log('Error: ' + data);
    		});

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
        if(carrierCode == "YV")
            return "Mesa Airlines";
        if(carrierCode == "9E")
            return "Endeavor Air";
        if(carrierCode == "OH")
            return "US Airways Express";
        if(carrierCode == "DH")
            return "Discovery Airways";
        if(carrierCode == "XE")
            return "Express Jet";
        if(carrierCode == "TZ")
            return "ATA Airlines";
        if(carrierCode == "KH")
            return "Aloha Airlines";
        
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
        
        if(data.length == 0)
            document.getElementById('errorDelays').style.display = "inline";
        else
            document.getElementById('errorDelays').style.display = "none";
        
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
    			text: "Variazione ritardi di " + parseDate($scope.monthFilter) + " per " + getNameCarrier(carrierCode),
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

    function createGraphGhostFlights($scope, carrierCode, data){
        
        if(data.length != 0){
            var points = [];
            var datas = [];
            
            for(var i=0; i<data.length; i++)
                points.push({x: new Date(data[i].Year, parseInt(data[i].Month), 1), y: parseFloat(data[i].GhostFlightPercent.substring(0,5)), countGhost: data[i].CountGhostFlight, countAll: data[i].CountAllFlight});

            datas.push({type: "spline", toolTipContent: "Voli fantasma: {countGhost}</br>Voli totali: {countAll}</br>Percentuale: {y}%", dataPoints: points});
            
            var chart = new CanvasJS.Chart("graphGhostFlightsCarrier",
            {
              title:{
              text: "Voli fantasma per "+getNameCarrier(data[0].UniqueCarrier)
              },
               data: datas
            });

            chart.render();
        }else{
            document.getElementById('infoGhostFlights').style.display = "none";
        }
    }

    function createGraphOtherCarrierDelays($scope, carrierCode, data){
        
            var chart = new CanvasJS.Chart("graphOtherCarrierDelays",
        {
            title:{
                text: "Cause dei ritardi per la compagnia "+getNameCarrier(carrierCode)
            },
                animationEnabled: true,
            legend:{
                verticalAlign: "center",
                horizontalAlign: "left",
                fontSize: 20,
                fontFamily: "Helvetica"        
            },
            
            data: [
            {        
                type: "pie",       
                indexLabelFontFamily: "Garamond",       
                indexLabelFontSize: 20,
                indexLabel: "{label} {y}%",
                startAngle:-20,      
                showInLegend: true,
                toolTipContent:"{legendText} {y}%",
                dataPoints: [
                    {  y: (data[0].CarrierDelayPercent).toFixed(4), legendText:"Compagnia", label: "Compagnia" },
                    {  y: (data[0].WeatherDelayPercent).toFixed(4), legendText:"Meteo", label: "Meteo" },
                    {  y: (data[0].NASDelayPercent).toFixed(4), legendText:"Aviazione nazionale", label: "Aviazione nazionale" },
                    {  y: (data[0].SecurityDelayPercent).toFixed(4), legendText:"Sicurezza" , label: "Sicurezza"},
                    {  y: (data[0].LateAircraftDelayPercent).toFixed(4), legendText:"Veivolo" , label: "Veivolo"}
                ]
            }
            ]
        });
        chart.render();
    }