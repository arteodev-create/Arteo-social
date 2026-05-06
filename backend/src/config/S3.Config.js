const Logger = require('../infra/logging/Logger.Service');
const { S3Client } = require('@aws-sdk/client-s3');
const config = require('./Registry');

const { region, bucket, endpoint: configuredEndpoint, accessKeyId, secretAccessKey } = config.storage.s3;
const endpoint = configuredEndpoint || `https://s3.${region}.amazonaws.com`;

Logger.info(`[S3 Config] Region=${region}, Endpoint=${endpoint}`);

const s3Client = new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(configuredEndpoint),
    credentials: {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim()
    }
});

module.exports = s3Client;
