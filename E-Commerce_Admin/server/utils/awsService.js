/**
 * Created by Kico-Local on 27.06.2016.
 * Updated on 30.11.2023
 */
var config = require('../config/environment/index');
var { S3Client } = require('@aws-sdk/client-s3');

var AWS_ACCESS_KEY = config.amazonS3.awsAccessKeyId;
var AWS_SECRET_KEY = config.amazonS3.awsSecretAccessKey;

const s3Client = new S3Client({
    region: "auto",
    endpoint: config.amazonS3.endpoint,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    },
    forcePathStyle: true,
});

module.exports = s3Client;