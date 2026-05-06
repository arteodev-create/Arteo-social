const config = require('./Registry');
const { prisma, redis, s3, cloudinary, jwt } = require('./Providers');
const queue = require('../infra/queue/Queue.Service');

module.exports = {
    config,
    prisma,
    redis,
    s3,
    cloudinary,
    jwt,
    queue
};