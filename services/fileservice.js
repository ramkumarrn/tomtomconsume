

module.exports = {
    getJsonData: function(url, callback){
        var basePath = rootdir + '/mocks/';
        var fs = require('fs');
        var filePath = basePath + url;

        fs.exists(filePath, function(exists){
            if(exists){
                var fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                callback(fileData);
            }else {
                var error ={
                    error: "file not found"
                }
                callback(error);
            }
        })
    }
}