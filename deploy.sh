#!/bin/bash

# Before run: chmod a+x runme.sh
# Local Variables
WHEREIAM=$(pwd)

# PM2 Checker
if [ -x "$(command -v pm2)" ]
then

    echo "PM2 ecosystem file startORrestart"
    #pm2 reload ecosystem.config.js # All apps
    pm2 reload ecosystem.config.js --only notify.slack # Only one app
    #pm2 reload ecosystem.config.js --only sync.queue.worker # Only one app

else

    echo -e "PM2 is not install \n
        $ npm install pm2@latest -g \n
        # or \n
        $ yarn global add pm2 \n"

fi

# TODO: env lines generated from ecosystem.config.js file
echo "Sync Queue Worker cron file added"
echo "*/1 * * * * cd $WHEREIAM && env NODE_ENV=development REDIS_HOST=127.0.0.1 REDIS_PORT=6379 QUEUE_PREFIX=squeue node sync.queue.worker.js >> sync.queue.worker.log" >> sync.queue.cronfile