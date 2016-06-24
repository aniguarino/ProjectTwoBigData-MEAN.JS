var expressServer = "http://localhost:8083";
var predictionServer = "http://localhost:8080";
//Angular App Module and Controller
var sampleApp = angular.module('predictionsApp', []);

sampleApp.controller('controllerPredictions', function ($scope, $http) {
    
    $scope.uniqueCarrier = "";
    $scope.allCarriers = [];
    $scope.allOriginByCarrier = [];
    $scope.allDestByOrigin = [];
    $scope.dateToPredict = "";
    $scope.originTime = "";
    $scope.destTime = "";
    $scope.result = {
    	carrierName: "",
        origin: "",
        dest: "",
        date: "",
        originTime: "",
        destTime: "",
        prediction: ""
    }
    
    // when landing on the page, get all air companies
    $http.get(expressServer+'/getallcarrier')
    .success(function(data) {
        for(var i=0; i<data.length; i++)
            $scope.allCarriers[i] = getNameCarrier(data[i]) + " ("+data[i]+")";
            $scope.allCarriers = $scope.allCarriers.sort();
    })
    .error(function(data) {
    	console.log('Error: ' + data);
    });
    
    $scope.showOrigin = function() {
        document.getElementById('selectOrigin').style.display = "inline";
        
        //If you want to make another prediction, reset all again
        document.getElementById('selectDest').style.display = "none";
        document.getElementById('selectDate').style.display = "none";
        document.getElementById('selectTimeOrigin').style.display = "none";
        document.getElementById('selectTimeDest').style.display = "none";
        document.getElementById('result').style.display = "none"; 
        //*****
        
        $scope.uniqueCarrier = $scope.currentCarrier.trim().slice(-3);
        $scope.uniqueCarrier = $scope.uniqueCarrier.substring(0, $scope.uniqueCarrier.length-1);
        
        $http.get(expressServer+'/getoriginscarrier/'+ $scope.uniqueCarrier)
        .success(function(data) {
            var dat = [];
            for(var i=0; i<data.length; i++)
                dat[i] = data[i].OriginCity;
            
            var unique=dat.filter(function(itm,i,dat){
                 return i==dat.indexOf(itm);
            });
            
            $scope.allOriginByCarrier = unique.sort();
            
        })
        .error(function(data) {
           console.log('Error: ' + data);
        });   
    }
    
    $scope.showDest = function() {
        document.getElementById('selectDest').style.display = "inline";
                
        $http.get(expressServer+'/getdestscarrier/'+ $scope.uniqueCarrier + '?origin=' + $scope.currentOrigin.trim())
        .success(function(data) {
            var dat = [];
            for(var i=0; i<data.length; i++)
                dat[i] = data[i].DestCity;
            
            var unique=dat.filter(function(itm,i,dat){
                 return i==dat.indexOf(itm);
            });
            
            $scope.allDestByOrigin = unique.sort();
            
        })
        .error(function(data) {
           console.log('Error: ' + data);
        });   
    }
    
    $scope.showDate = function() {
        document.getElementById('selectDate').style.display = "inline";
    }
    
     $scope.showTime = function() {
        var date = document.getElementById('dateSelected').value;
         
         //check date if > that current date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
         if(dd<10) {
             dd='0'+dd
         } 
         if(mm<10) {
             mm='0'+mm
         } 
         today = yyyy+'-'+mm+'-'+dd;
         
         if(date <= today){
           alert("Attenzione! La data non e' nel futuro. Reinseriscila!");
         }else{
             $scope.dateToPredict = date;
             document.getElementById('selectTimeOrigin').style.display = "inline";
         } 
    }
     
     $scope.showTimeDest = function() {
        var timeOrigin = document.getElementById('timeOriginSelected').value;
         
        //validate timeOrigin
        var parts = timeOrigin.split(":");
        if(parts[0].length == 2 && parts[0]> 0 && parts[0]<24){
            if(parts[1].length == 2 && parts[1]> 0 && parts[1]<60){
                $scope.originTime = timeOrigin;
                document.getElementById('selectTimeDest').style.display = "inline";
            }else
                alert("Attenzione! Il formato inserito non e' corretto. Reinserisci l'orario!");
        }else
            alert("Attenzione! Il formato inserito non e' corretto. Reinserisci l'orario!");
         
    }
     
    $scope.validateLast = function() {
        var timeDest = document.getElementById('timeDestSelected').value;
         
        //validate timeOrigin
        var parts = timeDest.split(":");
        if(parts[0].length == 2 && parts[0]> 0 && parts[0]<24){
            if(parts[1].length == 2 && parts[1]> 0 && parts[1]<60){
                $scope.destTime = timeDest;
                window.setTimeout(function() {
                    //call prediction server
                    $http.get(predictionServer+'/server/prediction?uniqueCarrier='+$scope.uniqueCarrier+'&currentOrigin='+$scope.currentOrigin.trim()+'&currentDest='+$scope.currentDest.trim()+'&dateToPredict='+$scope.dateToPredict+'&originTime='+$scope.originTime+'&destTime='+$scope.destTime)
                        .success(function(data) {
                        $scope.result.carrierName = getNameCarrier(data.uniqueCarrier);
                        $scope.result.origin = data.currentOrigin;
                        $scope.result.dest = data.currentDest;
                        $scope.result.date = data.dateToPredict;
                        $scope.result.originTime = data.originTime;
                        $scope.result.destTime = data.destTime;
                        $scope.result.prediction = data.prediction;
                        document.getElementById('result').style.display = "inline";
                    })
                    .error(function(data) {
                       console.log('Error: ' + data);
                       alert("Predizione fallita! Problemi con il server "+predictionServer); 
                    });    
                }, 100);
            }else
                alert("Attenzione! Il formato inserito non e' corretto. Reinserisci l'orario!");
        }else
            alert("Attenzione! Il formato inserito non e' corretto. Reinserisci l'orario!");
         
    }
      
});

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
                     
