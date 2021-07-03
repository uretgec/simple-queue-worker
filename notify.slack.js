// Requirements
const Config = require("./config");
const Redis = require("ioredis");
const request = require("request");

// Redis Client Connection
const redisClient = new Redis({
    port: Config.port,
    host: Config.host,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0
});
const subscriberClient = redisClient();

// Channel Subscribe
// squeue: sync-queue-worker's redis-prefix argument
const slackNotifyChannelKey = Config.prefix + ':notify:slack';

// Event Listener
subscriberClient.on('ready', function () {
    console.log('im ready');
});

subscriberClient.subscribe(slackNotifyChannelKey, function (err, count) {
    console.log('subscribe', slackNotifyChannelKey, err, count);
    if(err) {

    } else {

    }
});

subscriberClient.on('message', function (channel, message) {
    console.log('subscribe message', channel, message);

    const webhookUrl = 'https://hooks.slack.com/services' + Config.slackHookUrl;  // your slack hook url

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
