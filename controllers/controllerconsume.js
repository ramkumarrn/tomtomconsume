'use strict';
var _ = require('lodash');
var fileService = require(rootdir+'/services/fileservice.js');
var Channel = require(rootdir+'/services/channel.js');
var util = require(rootdir+'/utils/util.js');
var mongoService = require(rootdir+'/services/mongoservice.js');
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
              var jsonData = JSON.parse(msg.content);
              console.log('consuming %j', msg.content.toString());
              var db = mongoService.getDb();
              mongoService.insertDbCollections('smarttravel',jsonData,function(jsonRes){   
                
                 //res.status(200).json(jsonRes);
                 console.log(jsonRes);
               });
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