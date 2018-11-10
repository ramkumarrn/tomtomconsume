var _ = require('lodash');
var moment = require('moment');
var request = require('request');

var payload= {
	
	  "incidentType": "Road Block",
	  "severity": "medium",
	  "images": "",
	  "location": { "lat": "",
					"lng": ""
				  },
	  "created": "",
	  "userVerified": false,
	  "trafficVerified": false
	
  }
  

module.exports = {
	encode: function (doc) {  
		return new Buffer(JSON.stringify(doc));
	  },
	  
	  processData : function(responseData,jsonData){

		var trafficVerified = false;

		var curSpeed = responseData.flowSegmentData.currentSpeed;
		var freeFlow = responseData.flowSegmentData.freeFlowSpeed;

		
		var unixdatetime = moment().valueOf();
		jsonData.incident.created = unixdatetime;
		jsonData.incident.userVerified = false;

		var trafficPer = Math.ceil(curSpeed/freeFlow*100);
		console.log("trafficper="+trafficPer);

		var severity = jsonData.incident.severity.toLowerCase();
		var severityPer = 0;
		switch(severity){
			case('high'):
			severityPer = 80;	
			 break;
			case('medium'):
			severityPer = 40;
			break;
			case('low'):
			severityPer = 0;
			break; 
		}

		console.log("severity per="+severityPer);
		switch(true){
			case (trafficPer >= 80):
			if(severityPer <= 40)
					trafficVerified = true;
			break;
			case(trafficPer >= 40 && trafficPer < 80):
				trafficVerified = true;

			 break;
			case (trafficPer < 40):
			
			if(severityPer >= 40)
				trafficVerified = true;

			 break;
			 default:
			 break;   
		}

		console.log("after verify="+trafficVerified);
		jsonData.incident.trafficVerified = trafficVerified;	
	
		
		return jsonData;
	  }



}