const request = require('request');
const axios = require("axios");

module.exports = {
    getApiData: function(url, callback) {
        request.get(url,function(error,response,body){
          callback(response);
         
    })
},
getAxiosData:function(url,callback){
    axios.get(url)
    .then(function (response) {
      callback(response);
    })
    .catch(function (error) {
      console.log(error);
    });
    
}
}

