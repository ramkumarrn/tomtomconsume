'use strict';

var express = require('express');
var router = express.Router();
var controller = require(rootdir+'/controllers/controllerconsume.js');

router.get('/testjson', function(req, res, next){
  controller.testjson(req, res, next);
});

router.get('/getsmartdata', function(req, res,next) {
  
  controller.getSmartTravelData(req, res, next);
});

router.post('/triggersos',function(req,res,next){
   controller.triggerSOS(req,res,next);
});

router.post('/routes',function(req,res,next){
   controller.getRoutes(req,res,next);
});

module.exports = router;

