// server-side.js

// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
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
    //OriginIata : String,
    //DestIata : String
    text : String
});

// listen server ======================================
var port = 8083; //Server port
app.listen(port); 
console.log("Server avviato sulla porta: "+port);

module.exports = allMarkers;
module.exports = allRoutes;

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

// get all routes about a specific origin via Rest API
app.get('/getroutesorigin/:origin', function(req, res, next) {
    var origin = req.params.origin;
    var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific origin in the database
    if(dateFilter == null){
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

// get all routes about a specific air carrier via Rest API
app.get('/getroutescarrier/:carrier', function(req, res, next) {
    var carrier = req.params.carrier;
    var dateFilter = req.query.month;
    // use mongoose to get all routes about a specific air carrier in the database
    if(dateFilter == null){
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
    // use mongoose to get all air carrier in the database
    allRoutes.find().distinct('UniqueCarrier', function(err, routes) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)
        
        res.json(routes); // return all air carrier in JSON format
    });
});

// get all air carrier about routes from one marker via Rest API
app.get('/getroutesorigindistinct/:origin', function(req, res, next) {
    var origin = req.params.origin;
    var dateFilter = req.query.month;
    // use mongoose to get all air carrier about routes from one marker in the database
    if(dateFilter == null){
        allRoutes.find({'OriginIata': origin}).distinct('UniqueCarrier', function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            
            res.json(routes); // return all air carrier about routes from one marker in JSON format
        });
    }else{
        dateFilter = dateFilter+"-15";
        allRoutes.find({$and: [{FlightDateMax: { $gte: dateFilter}}, {FlightDateMin: { $lte: dateFilter}},{'OriginIata': origin}]}).distinct('UniqueCarrier', function(err, routes) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            
            res.json(routes); // return all air carrier about routes from one marker in JSON format
        });
    }
});