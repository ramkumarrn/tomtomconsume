var amqp = require('amqplib/callback_api');
var url = process.env.AMQP_URL || 'amqp://cpbjqore:GK6244Gg-q1n_KPLTBCZ-HSNOK_MD1fb@baboon.rmq.cloudamqp.com/cpbjqore';
module.exports = createQueueChannel;
function createQueueChannel(queue, cb) {  
  amqp.connect(url, onceConnected);
  function onceConnected(err, conn) {
    if (err) {
      cb(err);
    }
    else {
      console.log('connected');
	  conn.createChannel(onceChannelCreated);
	  
	    function onceChannelCreated(err, channel) {
			if (err) {
			cb(err);
		}
		else {
			console.log('channel created');
			channel.assertQueue(queue, {durable: true}, onceQueueCreated);
			
			function onceQueueCreated(err) {
				if (err) {
				  cb(err);
				}
				else {
				  cb(null, channel, conn);
				}
			  }
		}
	}

    }
  }
  
  
  
  
}

