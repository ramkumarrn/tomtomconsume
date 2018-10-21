var _ = require('lodash');

var responseData = {
	payload: {
		displaytype: '',
		message: '',
		data: {

		}
	}
}

module.exports = {
	encode: function (doc) {  
		return new Buffer(JSON.stringify(doc));
	  } 


}