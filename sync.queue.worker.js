// Requirements
const Crypto = require("crypto");
const Config = require("./config");
const Promise = require('bluebird');
const Request = Promise.promisifyAll(require("request"), {multiArgs: true});
const Redis = require('ioredis');

// Redis Client Connection
const redisClient = new Redis({
    port: Config.port,
    host: Config.host,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0
});

// Local Variables
const syncBlockKey = Config.prefix + ':sync:block';
const syncQueueKey = Config.prefix + ':sync:queue:list';
const syncListenerKey = 'queuechannel';
const slackNotifyChannelKey = Config.prefix + ':notify:slack';
const sessionid = Crypto.randomBytes(16).toString("hex");
const maxRetry = 3;
const maxConcurrentLimit = 50;
const maxQueueLimit = 2500;
const queueDelayTime = 1000; // 1 seconds

// Free Methods
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function logIt(data) {
    let info = {
        ts: Date.now(),
        sessionid: sessionid,
        result: data
    };
    console.log(JSON.stringify(info));
}

// Stats
let stats = require("./model/SyncDataStat");

// Queue Event Listener
const EventEmitter = require('events');
class QueueEmitter extends EventEmitter {}
const queueEmitter = new QueueEmitter();
queueEmitter.on(syncListenerKey, function(data) {
    switch (data.type) {
        case 'total':
            stats.total = data.count;
            stats.startDate = Date.now();
            break;
        case 'success':
            stats.success += data.count;
            break;
        case 'error':
            stats.error += data.count;
            break;
        case 'retry':
            stats.retry += data.count;
            break;
        case 'finish':
            stats.endDate = Date.now();
            stats.elapsedTime = (stats.endDate - stats.startDate)/1000;
            break;
    }
});

// Start Process
let queueList = async function(channel, blockChannel) {
    // Check Blocking
    let isQueueBlock = await redisClient.exists(blockChannel);
    if (isQueueBlock) throw Error('Queue already blocked');

    // Start Process
    let totalQueue = await redisClient.llen(channel);
    if ( !(totalQueue > 0) ) throw Error('Queue list is empty');

    // Start Blocking
    let queueBlock = await redisClient.set(blockChannel, 1);
    if (!queueBlock) throw Error('Queue is not blocking');
    totalQueue = (totalQueue > maxQueueLimit) ? maxQueueLimit : totalQueue;
    queueEmitter.emit(syncListenerKey, {type: 'total',count: totalQueue});

    // Sync Process
    let queueList = [];
    for (let item = 1; item<=totalQueue; item++) {
        let queueData = await redisClient.lpop(channel);
        queueData = JSON.parse(queueData);
        if (queueData === null) throw Error('Queue data is null!!!');

        if(queueData.retry >= maxRetry) {
            queueEmitter.emit(syncListenerKey, {type:'retry', count:1});
            let failQueueKey = channel + ':fail';
            redisClient.rpush(failQueueKey, JSON.stringify(queueData));
            continue;
        }

        // queueList.push(queueData);
        let response = await Request
            .postAsync(
                {
                    time: true,
                    timeout: 1500,
                    url: queueData.url,
                    json: true,
                    body: queueData.sync
                }
            ).spread(function (response, body) {
                // console.log('Response', err, response, body);
                if(!!body && body.status) {
                    queueEmitter.emit(syncListenerKey, {type:'success', count:1});
                } else {
                    queueEmitter.emit(syncListenerKey, {type:'error', count:1});
                }

                return body;
            }).catch(function (reason) {
                queueEmitter.emit(syncListenerKey, {type:'error', count:1});
                return { status:false, message: reason.message };
            });

        if(!response.status) {
            // Return The Queue
            queueData.retry += 1;
            queueData.status = 'error';
            redisClient.rpush(channel, JSON.stringify(queueData));

            // Collect Data
            response.url = queueData.url;
            response.id = queueData.sync.data.id;
            queueList.push(response);
        }

        if( (item%maxConcurrentLimit) === 0 ) await timeout(queueDelayTime);
    }

    // Trigger Finish Process
    queueEmitter.emit(syncListenerKey, {type:'finish', count:0});

    return queueList;
};

queueList(syncQueueKey, syncBlockKey)
    .then(function (queueResponse) {
        logIt({error:queueResponse, stats: stats });

        // Generate Slack Message: Stats
        let message = {
            "text": "Notify: Queue worker finished the works.",
            "unfurl_links":1,
            "as_user":false,
            "parse":"none",
            "link_names":1,
            "attachments":[
                {
                    "color":"good",
                    "fields":[],
                    "footer":"Sync Queue API",
                    "ts": Date.now()
                }
            ]
        };

        Object.keys(stats).forEach(function(key) {
            message['attachments'][0]['fields'].push({
                "title": key.toUpperCase(),
                "value": stats[key],
                "short": true
            });
        });

        // Publish Queue Worker Stats
        if(Config.env === 'prod') {
            redisClient.publish(slackNotifyChannelKey, JSON.stringify(message));
        }

    })
    .catch(function (err) {
        logIt({error: err.message, stats: stats});
    })
    .finally(function () {
        redisClient.del(syncBlockKey);
        Process.exit(1);
    })
;
