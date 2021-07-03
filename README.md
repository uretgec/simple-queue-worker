# Sync Queue Worker
For admin panel background service
For data sync to multiple clients

# How to work
example/clint.worker.js
--> Redis 
    --> one by one client sent to per SyncDataItem (rpush the sync queue list)

example/client.peer.js
--> HTTP Server - Allow Only POST Method

-----------------
sync.queue.worker.js (FIFO)
--> Redis 
    --> checked queue is blocked
    --> llen the sync queue list
    --> blocked queue
    --> lpop SyncDataItem one by one while maximum limit not exceeded
    --> events data collected the background process
    --> SyncDataItem has been posted by sync url with HTTP Post method
        --> request process not response or timeout, SyncDataItem rpush the queue list again
    --> Finally when queue list was empty, collected stats send to publish the slack notify channel
    --> queue process kill by itself

notify.slack.js
--> Redis
    --> notify channel subscribed
    --> when message received from channel, stats data sent to Slack Channel immediately with HTTP Post method