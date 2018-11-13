var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var geolib = require("geolib");

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

	isPointInside : function(location,arrPoints){
		var blnFlag = geolib.isPointInside(location,arrPoints);	
		console.log(blnFlag);
		return blnFlag;
	} , 
	sortedPoints:function(points){
		points = points.slice(0); // copy the array, since sort() modifies it
		var stringify_point = function(p) { return p.latitude + ',' + p.longitude; };
	
		// finds a point in the interior of `pts`
		var avg_points = function(pts) {
			var x = 0;
			y = 0;
			for(i = 0; i < pts.length; i++) {
				x += pts[i].latitude;
				y += pts[i].longitude;
			}
			return {latitude: x/pts.length, longitude:y/pts.length};
		}
		var center = avg_points(points);
	
		// calculate the angle between each point and the centerpoint, and sort by those angles
		var angles = {};
		for(i = 0; i < points.length; i++) {
			angles[stringify_point(points[i])] = Math.atan(points[i].latitude - center.latitude, points[i].longitude - center.longitude);
		}
		points.sort(function(p1, p2) {
			return angles[stringify_point(p1)] - angles[stringify_point(p2)];
		});
		return points;
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