"use strict";

const Process = require('process');

/**
 Usages: 
 NODE_ENV=development REDIS_HOST=127.0.0.1 REDIS_PORT=6379 QUEUE_PREFIX=squeue SLACK_WEBHOK_URL='/#####/#####/#####' node index.js
*/
module.exports = {
    env: (typeof Process.env.NODE_ENV === 'undefined') ? 'prod' : Process.env.NODE_ENV,
    host: (typeof Process.env.REDIS_HOST === 'undefined') ? '127.0.0.1' : Process.env.REDIS_HOST,
    port: (typeof Process.env.REDIS_PORT === 'undefined') ? '6379' : Process.env.REDIS_PORT,
    prefix: (typeof Process.env.QUEUE_PREFIX === 'undefined') ? 'squeue' : Process.env.QUEUE_PREFIX,
    slackHookUrl: (typeof Process.env.SLACK_WEBHOK_URL === 'undefined') ? '/' : Process.env.SLACK_WEBHOK_URL,
};