/**
 * Created by Kico-Local on 27.06.2016.
 */
var config = require('../config/environment/index');
var aws = require('aws-sdk');

var AWS_ACCESS_KEY = config.amazonS3.awsAccessKeyId;
var AWS_SECRET_KEY = config.amazonS3.awsSecretAccessKey;

aws.config.update({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
);

module.exports = new aws.S3({
        signatureVersion: "v4",
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
        region: config.amazonS3.region
    }
);
