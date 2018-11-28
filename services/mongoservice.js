var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://naveen2014redmi:sizzlers!23@cluster0-shard-00-00-2vsbv.mongodb.net:27017,cluster0-shard-00-01-2vsbv.mongodb.net:27017,cluster0-shard-00-02-2vsbv.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
//var url = "mongodb://naveen2014redmi:sizzlers!23@mumbaicluster-shard-00-00-neeel.mongodb.net:27017,mumbaicluster-shard-00-01-neeel.mongodb.net:27017,mumbaicluster-shard-00-02-neeel.mongodb.net:27017/test?ssl=true&replicaSet=Mumbaicluster-shard-0&authSource=admin&retryWrites=true";
var _db;

module.exports = {
  connectToServer: function() {
    MongoClient.connect(url, function( err, client ) {
        console.log('connected');
        _db = client.db("tom");
      //return callback( err );
    } );
  },
  getDb: function() {
    return _db;
  },
  closeDb: function(){
    _db.close();
    
  },
  getDbCollectionByQry: function(colname,qry,callback){
    _db.collection(colname).find(qry).toArray(function(err, result) {
         return callback(result);  
    });
  },
  getDbCollections: function(colname,callback){
    _db.collection(colname).find({}).toArray(function(err, result) {
          return callback(result);  
    });
  },
  insertDbCollections: function(colname,data,callback){
    _db.collection(colname).insertOne(data, function (err, result) {
      if(err)
      return callback(err);
      else
        return callback(result);  
  });
  },
  
  updateDbCollections: function(colname,qry,newValues,callback){
    _db.collection(colname).updateOne(qry,newValues, function (err, result) {
      if(err)
      return callback(err);
      else
        return callback(result);  
  });
  }
};