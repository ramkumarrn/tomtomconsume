'use strict';
var _ = require('lodash');
var fileService = require(rootdir+'/services/fileservice.js');
var Channel = require(rootdir+'/services/channel.js');
var util = require(rootdir+'/utils/util.js');
var mongoService = require(rootdir+'/services/mongoservice.js');
var restClientService = require(rootdir+'/services/restclientservice.js');
mongoService.connectToServer();
var ObjectId = require('mongodb').ObjectId; 

var moment = require('moment');

module.exports = {
    
    testjson: function(req, res, next){
        fileService.getJsonData('leaves.json', function(jsonResponse){
            res.status(200).json(jsonResponse);
        });
    },
    getSmartTravelData: function(req, res, next){
      var db = mongoService.getDb();
      mongoService.getDbCollections('commute',function(jsonRes){
                    
           res.status(200).json(jsonRes);
        });
  },

   getRoutes: function(req,res,next){

      var srclat = req.body.source.lat;
      var srclng = req.body.source.lng;
      var deslat = req.body.destination.lat;
      var deslng = req.body.destination.lng;

      var routeArr = [];
     var url = "https://api.tomtom.com/routing/1/calculateRoute/"+srclat+","+srclng+":"+deslat+","+deslng+"/json?maxAlternatives=2&minDeviationDistance=0&minDeviationTime=0&alternativeType=anyRoute&traffic=false&key=925XUD4MhjVJnTe9Zza1FWfjfhkIKxDI";
      var postPayload = {"supportingPoints":[{"latitude":srclat,"longitude":srclng},{"latitude":deslat,"longitude":deslng}]};
      restClientService.postAxios(url,postPayload,function(responseData){

        var routeData = responseData.data;
        var arrRoutes = routeData.routes;
        var db = mongoService.getDb();
        mongoService.getDbCollections('commute',function(jsonRes){

          var dbData = jsonRes;
           if(dbData.length > 0)
            {
               _.each(dbData,function(data){

                var item = {
                  "_id": data._id,
                  "location": data.location
                  };
                 var glib = {"latitude":"","longitude":""};
                 glib.latitude = data.location.lat;
                 glib.longitude = data.location.lng;
                   console.log(JSON.stringify(glib) );
                //check whether incident in routes
                console.log(arrRoutes.length)
                if(arrRoutes.length > 0)
                  {
                   _.each(arrRoutes,function(route){
          
                        var arrPoints = route.legs[0].points;
                        var sortedPoints = util.sortedPoints(arrPoints);
                       
                        if(util.isPointInside(glib,sortedPoints)){
                          routeArr.push(item);  
                        }
                     })
                  }
               });
            }
       });
        
        res.status(200).json(responseData.data);
      });
      
      /*var start = moment().startOf('day'); // set to 12:00 am today
      var end = moment().endOf('day'); // set to 23:59 pm today
      var db = mongoService.getDb();
      var qry = {created: {$gte: start, $lt: end}};
      console.log(qry);
      mongoService.getDbCollections('commute',function(jsonRes){
           console.log(jsonRes);          
           res.status(200).json(jsonRes)
        });*/
   },

    consumeFromQueue: function(){

      var queue = 'testQueue';
      Channel(queue, function(err, channel, conn) {  
        if (err) {
          console.error(err.stack);
        }
        else {
          console.log('channel and queue created and Started consuming');
          consume();
        }
        function consume() {
          channel.get(queue, {}, onConsume);
          function onConsume(err, msg) {
            if (err) {
              console.warn(err.message);
            }
            else if (msg) {
              var responsePayload="";
              console.log('consuming %j', msg.content.toString()); 
                var jsonData = JSON.parse(msg.content);
                var lat = jsonData.incident.location.lat;
                var lng = jsonData.incident.location.lng;
                var url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=925XUD4MhjVJnTe9Zza1FWfjfhkIKxDI&point="+lat+","+lng;
                restClientService.getAxiosData(url,function(response){
                 responsePayload = util.processData(response.data,jsonData);
                  var db = mongoService.getDb();
                  
                  var allMarkers = jsonData.nearByMarkers;
                  if(allMarkers){
                     if(allMarkers.length > 0)
                      {
                        responsePayload.incident.userViews = allMarkers.length;
                        if(allMarkers.length > 1)
                          responsePayload.incident.userVerified = true;

                        _.each(allMarkers,function(val){
                            if(!val.userVerified){
                               var id = val._id;
                               var qry = {_id: ObjectId(id)}
                               var upd = {$set:{userVerified:true}};
                              // var db = mongoService.getDb();
                               mongoService.updateDbCollections('commute',qry,upd,function(jsonRes){

                           });
                          }  
                        });                        
                      }
                      
                    }else{responsePayload.incident.userViews = 0;
                      responsePayload.incident.userVerified = false;
                    }
                    mongoService.insertDbCollections('commute',responsePayload.incident,function(jsonRes){   
                      //   res.status(200).json(jsonRes);
                          // console.log(jsonRes);
                          });
                  

                  })
                

              setTimeout(function() {
                channel.ack(msg);
                consume();
              }, 1e3);
            }
            else {
              console.log('no message, waiting...');
              setTimeout(consume, 1e3);
            }
          }
        }
      });
      
    }
    
    


};