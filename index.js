// Initialize global variables here
global.rootdir = __dirname;
global.config = require('config');
//global.logger = require(rootdir+'/')


// Import required modules
var express = require('express');
var bodyparser = require('body-parser');
var methodOverride = require('method-override');
var app = express();
var routes = require(rootdir+'/routes/consumeroutes.js');
var path = require('path');
var async = require('async');
var controller = require(rootdir+'/controllers/controllerconsume.js');


// REST Api dependencies

app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({limit:'50mb', extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));

// Cors
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/aqi', routes);

//Landing page
app.get('/', function(req, res){
     res.json({message : 'Service started'});
});

app.listen( process.env.PORT, function(){

   //console.log("Application started on port: "+ config.app.port);
    console.log("Application started on port: "+ process.env.PORT);
    
    controller.consumeFromQueue();
});
