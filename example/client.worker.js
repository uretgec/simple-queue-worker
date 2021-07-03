// Requirements
const Config = require("../config");
const Redis = require("ioredis");

// Redis Client Connection
const redisClient = new Redis({
    port: Config.port,
    host: Config.host,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0
});

let SyncDataItem = require("../model/SyncModelItem");
const syncQueueKey = Config.prefix + ':sync:queue:list';

for (let item = 1; item<=10; item++) {
    SyncDataItem.url = "http://127.0.0.1:3000";
    SyncDataItem.sync = {
        type: "fake",
        name: "SyncItem" + item,
        desc: "Sync data from " + item,
        timestamp: new Date(),
        creator: "Uretgec",
        notes: "pls always smile"
    }
    redisClient.rpush(syncQueueKey, JSON.stringify(queueData));
}
