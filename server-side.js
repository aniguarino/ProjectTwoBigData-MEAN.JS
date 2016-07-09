// server-side.js

// set up ========================
var express  = require('express');
var app      = express(), server = require('http').createServer(app);    // create our app w/ express
var mongoose = require('mongoose'), Schema = mongoose.Schema;                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================

mongoose.connect('localhost/airplaneDB');     // connect to mongoDB database

app.use(express.static('/js'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define models =================
var allMarkers = mongoose.model('markers', {
	text : String
});

var allRoutes = mongoose.model('routes', {
	text : String
});

var allRoutesDistinct = mongoose.model('distinctroutes', {
	text : String
});

var statsCarrier = mongoose.model('stats', {
	text : String
});

var ghostFlights = mongoose.model('ghostflights', {
	text : String
});

var carrierDelay = mongoose.model('carrierproblems', {
	text : String
});

// listen server ======================================
//var port = 8083; //Server port
var port = 80; //Server port
app.listen(port); 
console.log("Server avviato sulla porta: "+port);

module.exports = allMarkers;
module.exports = allRoutes;
module.exports = allRoutesDistinct;
module.exports = statsCarrier;
module.exports = ghostFlights;
module.exports = carrierDelay;

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// get all markers via Rest API
app.get('/getmarkers', function(req, res, next) {
    // use mongoose to get all markers in the database
    allMarkers.find(function(err, markers) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
        	res.send(err)

        res.json(markers); // return all markers in JSON format
    });
});

// get all routes via Rest API
app.get('/getroutes', function(req, res, next) {
    // use mongoose to get all routes in the database
    allRoutes.find(function(err, routes) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
        	res.send(err)

        res.json(routes); // return all routes in JSON format
    });
});

// get all routes about a specific origin and dest via Rest API
app.get('/getrouteinfo', function(req, res, next) {
	var originIata = req.query.origin;
	var destIata = req.query.dest;
    // use mongoose to get all routes about a specific origin in the database
    allRoutes.find({'OriginIata': originIata, 'DestIata': destIata}, {'UniqueCarrier':1, 'FlightDateMax':1, 'FlightDateMin':1, 'MeanDepDelay':1,
    			'CountDelayDep0':1, 'CountDelayDep15':1, 'CountDelayDep60':1, 'CountDelayDep3h':1, 'CountDelayDep24h':1, 'CountDelayDepOther':1,
    			'MeanArrDelay':1, 'CountDelayArr0':1, 'CountDelayArr15':1, 'CountDelayArr60':1, 'CountDelayArr3h':1, 'CountDelayArr24h':1,
    			'CountDelayArrOther':1
					}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)

            res.json(routes); // return all routes about a specific origin in JSON format
        });
});

// get all routes about a specific origin via Rest API
app.get('/getroutesorigin/:origin', function(req, res, next) {
	var origin = req.params.origin;
	var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific origin in the database
    if(dateFilter == null || dateFilter == ""){
    	allRoutes.find({'OriginIata': origin}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific origin in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{OriginIata: origin}]}, function(err, routes) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
        	res.send(err)
        
        res.json(routes); // return all routes about a specific origin in JSON format
    });
    }
});

// only for visualization
app.get('/getroutesorigindistinct/:origin', function(req, res, next) {
	var origin = req.params.origin;
	var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific origin in the database
    if(dateFilter == null || dateFilter == ""){
    	allRoutesDistinct.find({'OriginIata': origin}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific origin in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutesDistinct.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{OriginIata: origin}]}, function(err, routes) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
        	res.send(err)
        
        res.json(routes); // return all routes about a specific origin in JSON format
    });
    }
});

// get all routes about a specific air carrier via Rest API
app.get('/getroutescarrier/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
	var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific air carrier in the database
    if(dateFilter == null || dateFilter == ""){
    	allRoutes.find({'UniqueCarrier': carrier}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific air carrier in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{'UniqueCarrier': carrier}]}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific air carrier in JSON format
        });
    }
});

// FOR PREDICTIONS: get all Origin City about a specific air carrier via Rest API
app.get('/getoriginscarrier/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
    	allRoutes.find({'UniqueCarrier': carrier}, {'OriginIata': 1, 'OriginCity': 1}, function(err, result) { 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(result); // return all routes about a specific air carrier in JSON format
        });
});

// FOR PREDICTIONS: get all Dest City about a specific air carrier and specific Origin City via Rest API
app.get('/getdestscarrier/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
    var origin = req.query.origin;
    	allRoutes.find({'UniqueCarrier': carrier, 'OriginCity': origin}, {'DestIata': 1, 'DestCity': 1}, function(err, result) { 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(result); // return all routes about a specific air carrier in JSON format
        });
});

// get all routes about a specific air carrier via Rest API
app.get('/getroutescarrier/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
	var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific air carrier in the database
    if(dateFilter == null || dateFilter == ""){
    	allRoutes.find({'UniqueCarrier': carrier}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific air carrier in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{'UniqueCarrier': carrier}]}, function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(routes); // return all routes about a specific air carrier in JSON format
        });
    }
});

// get all air carrier via Rest API
app.get('/getallcarrier', function(req, res, next) {
	var dateFilter = req.query.month;
	if(dateFilter == null || dateFilter == ""){
        // use mongoose to get all air carrier in the database
        allRoutes.find().distinct('UniqueCarrier', function(err, carriers) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)

            res.json(carriers); // return all air carrier in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}}]}).distinct('UniqueCarrier', function(err, carriers) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(carriers); // return all air carrier about routes from one marker in JSON format
        });
    }
});

// get all air carrier about routes from one marker via Rest API
app.get('/getcarrierorigin/:origin', function(req, res, next) {
	var origin = req.params.origin;
	var dateFilter = req.query.month;
    // use mongoose to get all air carrier about routes from one marker in the database
    if(dateFilter == null || dateFilter == ""){
    	allRoutes.find({'OriginIata': origin}).distinct('UniqueCarrier', function(err, carriers) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(carriers); // return all air carrier about routes from one marker in JSON format
        });
    }else{
    	dateFilter = dateFilter+"-15";
    	allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{'OriginIata': origin}]}).distinct('UniqueCarrier', function(err, carriers) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(carriers); // return all air carrier about routes from one marker in JSON format
        });
    }
});

// get other info about a specific air carrier in specific year and month via Rest API
app.get('/getcarrierinfo/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
	var dateFilter = req.query.month;
    // use mongoose to get info about a specific air carrier in specific year and month in the database
    if(dateFilter == null || dateFilter == ""){
        //caso in cui non ho nessun filtro, va richiamata una nuova collezione da fare per un grafico più generico
    }else{
    	var year = dateFilter.substring(0, 4);
    	var month;
    	if(dateFilter.slice(-2).charAt(0) === '0')
    		month = dateFilter.slice(-1);
    	else
    		month = dateFilter.slice(-2);

        //console.log(year);
        //console.log(mon);
        statsCarrier.find({'UniqueCarrier': carrier, 'Year': year, 'Month': month}).sort({'DayOfWeek': 1}).exec( function(err, infocarrier) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(infocarrier); // return JSON format
        });
    }
});

// get ghost flights info about a specific air carrier in specific year and month via Rest API
app.get('/getghostflights/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
	var dateFilter = req.query.month;
    // use mongoose to get ghost flights info about a specific air carrier in specific year and month in the database
    if(dateFilter == null || dateFilter == ""){
        ghostFlights.find({'UniqueCarrier': carrier}).sort({'Year': 1, 'Month':1}).exec( function(err, ghostflights) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(ghostflights); // return JSON format
        });
    }else{
    	var year = dateFilter.substring(0, 4);
    	var month;
    	if(dateFilter.slice(-2).charAt(0) === '0')
    		month = dateFilter.slice(-1);
    	else
    		month = dateFilter.slice(-2);

        //console.log(year);
        //console.log(mon);
        ghostFlights.find({'UniqueCarrier': carrier, 'Year': year, 'Month': month}).exec( function(err, ghostflights) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(ghostflights); // return JSON format
        });
    }
});

// get all delays about a specific air carrier via Rest API
app.get('/getcarrierdelay/:carrier', function(req, res, next) {
	var carrier = req.params.carrier;
    // use mongoose to get all delays about a specific air carrier in the database
    	carrierDelay.find({'UniqueCarrier': carrier}, function(err, delays) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
            	res.send(err)
            
            res.json(delays); // return all delays about a specific air carrier in JSON format
        });  
});


app.get('', function(req, res) {
        res.sendFile(__dirname + '/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/map', function(req, res) {
        res.sendFile(__dirname + '/map.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/predictions', function(req, res) {
        res.sendFile(__dirname + '/predictions.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/logo.png', function(req, res) {
        res.sendFile(__dirname + '/logo.png'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/favicon.ico', function(req, res) {
        res.sendFile(__dirname + '/favicon.ico'); // load the single view file (angular will handle the page changes on the front-end)
});



app.get('/css/maps.css', function(req, res) {
        res.sendFile(__dirname + '/css/maps.css'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/js/canvasjs.min.js', function(req, res) {
        res.sendFile(__dirname + '/js/canvasjs.min.js'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/js/maps.js', function(req, res) {
        res.sendFile(__dirname + '/js/maps.js'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/js/icons/airport.png', function(req, res) {
        res.sendFile(__dirname + '/js/icons/airport.png'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/js/icons/airportred.png', function(req, res) {
        res.sendFile(__dirname + '/js/icons/airportred.png'); // load the single view file (angular will handle the page changes on the front-end)
});



app.get('/css/predictions.css', function(req, res) {
        res.sendFile(__dirname + '/css/predictions.css'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/js/predictions.js', function(req, res) {
        res.sendFile(__dirname + '/js/predictions.js'); // load the single view file (angular will handle the page changes on the front-end)
});