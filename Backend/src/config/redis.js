const { createClient } = require('redis');

const redisClient = createClient({

    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15645.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 15645
    }
});

module.exports = redisClient;