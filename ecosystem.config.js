module.exports = {
    apps : [
        {
          name: "notify.slack",
          script: "./notify.slack.js",
          env: {
              "NODE_ENV": "development",
              "REDIS_HOST": "127.0.0.1",
              "REDIS_PORT": "6379",
              "QUEUE_PREFIX": "squeue",
              "SLACK_WEBHOK_URL": '/#####/#####/#####',
          },
          env_production: {
              "NODE_ENV": "production",
              "REDIS_HOST": "127.0.0.1",
              "REDIS_PORT": "6379",
              "QUEUE_PREFIX": "squeue",
              "SLACK_WEBHOK_URL": '/#####/#####/#####',
          }
        },
        {
          name: "sync.queue.worker",
          script: "./sync.queue.worker.js",
          autorestart: false,
          cron_restart: "*/1 * * * *",
          env: {
              "NODE_ENV": "development",
              "REDIS_HOST": "127.0.0.1",
              "REDIS_PORT": "6379",
              "QUEUE_PREFIX": "squeue",
          },
          env_production: {
              "NODE_ENV": "production",
              "REDIS_HOST": "127.0.0.1",
              "REDIS_PORT": "6379",
              "QUEUE_PREFIX": "squeue",
          }
        }
    ]
};