// Requires
var Redis = require("ioredis");
var request = require("request");
var createClient = function() {
    return new Redis({
        port: 6379,
        host: '127.0.0.1',
        family: 4, // 4 (IPv4) or 6 (IPv6)
        db: 0
    });
};
var subscriberClient = createClient();

// Channel Subscribe
// squeue: sync-queue-worker's redis-prefix argument
var channelName = 'squeue:notify:slack';

// Event Listener
subscriberClient.on('ready', function () {
    console.log('im ready');
});

subscriberClient.subscribe(channelName, function (err, count) {
    console.log('subscribe', channelName, err, count);
    if(err) {

    } else {

    }
});

subscriberClient.on('message', function (channel, message) {
    console.log('subscribe message', channel, message);

    var webhookUrl = 'https://hooks.slack.com/services/#######################'; // your slack hook url

    request.post(webhookUrl, {
        form: {
            payload: message
        }
    }, function(err, response) {
        if (err) {
            console.log(err);
            return false;
        } else if (response.body !== 'ok') {
            console.log(response.body);
            return false;
        } else {
            console.log(response.body);
            return true;
        }
    });
});
