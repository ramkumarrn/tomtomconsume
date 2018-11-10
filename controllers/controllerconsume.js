'use strict';
var _ = require('lodash');
var fileService = require(rootdir+'/services/fileservice.js');
var Channel = require(rootdir+'/services/channel.js');
var util = require(rootdir+'/utils/util.js');
var mongoService = require(rootdir+'/services/mongoservice.js');
var restClientService = require(rootdir+'/services/restclientservice.js');
mongoService.connectToServer();
var ObjectId = require('mongodb').ObjectId; 


module.exports = {
    
    testjson: function(req, res, next){
        fileService.getJsonData('leaves.json', function(jsonResponse){
            res.status(200).json(jsonResponse);
        });
    },
    getSmartTravelData: function(req, res, next){
      var db = mongoService.getDb();
      mongoService.getDbCollections('smarttravel',function(jsonRes){
                    
         //mongoService.closeDb();
          res.status(200).json(jsonRes);
        });
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
                  var allMarkers = jsonData.nearByMarkers;
                  if(allMarkers){
                     if(allMarkers.length > 0)
                      {
                        responsePayload.userVerified = true;
                        _.each(allMarkers,function(val){
                            if(!val.userVerified){
                               var id = val._id;
                               var qry = {userVerified:false};
                               var upd = {$set:{userVerified:true}};
                               var db = mongoService.getDb();

                               mongoService.updateDbCollections('smarttravel',qry,upd,function(jsonRes){
                              
                            });
                          }  
                        });                        
                      }
                      
                    }

                    console.log('updated ==', JSON.stringify(responsePayload));

                      var db = mongoService.getDb();
                      mongoService.insertDbCollections('smarttravel',responsePayload,function(jsonRes){   
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