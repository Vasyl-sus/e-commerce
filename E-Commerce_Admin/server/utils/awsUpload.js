var config = require('../config/environment/index');
var S3Client = require('./awsService');
var { PutObjectCommand } = require('@aws-sdk/client-s3');
var S3_BUCKET = config.amazonS3.bucket;
var S3_REGION = config.amazonS3.region;

var uuid = require('uuid');
var mime = require('mime');
const sharp = require('sharp');

async function resizeImage(file, k) {
  try {
    const metaReader = sharp(file);
    const info = await metaReader.metadata();
    const o_width = info.width;
    const o_height = info.height;
    const buf = await metaReader.resize(Math.round(o_width / k), Math.round(o_height / k)).toBuffer();
    return buf;
  } catch (err) {
    throw err;
  }
}

async function resizeImageWithConstant(file) {
  try {
    const metaReader = sharp(file);
    const info = await metaReader.metadata();
    let o_width = info.width;

    if (o_width > 1700) {
      o_width = 1700;
      const buf = await metaReader.resize(Math.round(o_width)).toBuffer();
      return buf;
    } else {
      return file;
    }
  } catch (err) {
    throw err;
  }
}

async function createResizedImages(file) {
  var files = [file];
  for (var i = 2; i <= 3; i++) {
    files.push(await resizeImage(file, i));
  }
  return files;
}

async function uploadToS3Async(file, mimetype, used_module, imageName = null) {
  try {
    var name = imageName ? imageName : uuid.v1();
    var fileType = mime.extension(mimetype);
    var fileName = name;

    var params = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: `${used_module}/${fileName}`,
      Body: file, // Stream
      ContentType: mimetype,
      CacheControl: 'max-age=31536000'
    });

    await S3Client.send(params);
    var fileLink = `${config.amazonS3.publicEndpoint}/${used_module}/${fileName}`;

    console.log("Upload successful:", fileLink);
    return {
      id: uuid.v1(),
      name: name,
      type: fileType,
      link: fileLink
    };
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
}

async function uploadToS3AsyncFile(file, mimetype, used_module, imageName = null) {
  try {
    var name = imageName ? imageName : uuid.v1();
    var fileType = mime.extension(mimetype);
    var fileName = name;

    var params = {
      Bucket: S3_BUCKET,
      Key: used_module + "/" + fileName,
      Body: file, //stream
      region: S3_REGION,
      ContentType: mimetype,
      CacheControl: 'max-age=31536000',
    };

    await S3Client.send(new PutObjectCommand(params));
    var fileLink = `${config.amazonS3.publicEndpoint}/${used_module}/${fileName}`;

    var insertedFile = {
      id: uuid.v1(),
      name: name,
      type: fileType,
      link: fileLink
    };

    return insertedFile;
  } catch (err) {
    throw err;
  }
}

async function uploadToS3AsyncResized(file, mimetype, used_module) {
  try {
    let fResizedFile = await resizeImageWithConstant(file);
    var files = await createResizedImages(fResizedFile);

    var name = uuid.v1();
    var fileType = mime.extension(mimetype);

    var params_array = files.map((file, index) => {
      var fileName = `${name}-${index + 1}.${fileType}`;
      return {
        Bucket: S3_BUCKET,
        Key: `${used_module}/${fileName}`,
        Body: file, //stream
        region: S3_REGION,
        ContentType: mimetype,
        CacheControl: 'max-age=31536000',
      };
    });

    const uploadPromises = params_array.map(params => S3Client.send(new PutObjectCommand(params)));
    await Promise.all(uploadPromises);

    var fileLink = `${config.amazonS3.publicEndpoint}/${used_module}/${fileName}`;

    var insertedFile = {
      id: uuid.v1(),
      name: name,
      type: fileType,
      link: fileLink
    };

    return insertedFile;
  } catch (err) {
    throw err;
  }
}

async function resizeImageT(file, k) {
  try {
    const metaReader = sharp(file);
    const info = await metaReader.metadata();
    const buf = await metaReader.resize(k, k).toBuffer();
    return buf;
  } catch (err) {
    throw err;
  }
}

async function createResizedImagesT(file, type) {
  var files = [file];

  switch (type) {
    case 'profile_image':
      files.push(await resizeImageT(file, 83));
      break;
    case 'timeline_image':
      files.push(await resizeImageT(file, 350));
      break;
    default:
      return files;
  }

  return files;
}

async function createResizedImagesIG(file) {
  var files = [];

  files.push(await resizeImageT(file, 700));
  files.push(await resizeImageT(file, 400));

  return files;
}

async function uploadToS3AsyncResizedIG(file, mimetype, used_module) {
  try {
    var files = await createResizedImagesIG(file);

    var name = uuid.v1();
    var fileType = mime.extension(mimetype);

    var params_array = files.map((file, index) => {
      var fileName = `${name}-${index + 1}.${fileType}`;
      return {
        Bucket: S3_BUCKET,
        Key: `${used_module}/${fileName}`,
        Body: file, //stream
        region: S3_REGION,
        ContentType: mimetype,
        CacheControl: 'max-age=31536000',
      };
    });

    const uploadPromises = params_array.map(params => S3Client.send(new PutObjectCommand(params)));
    await Promise.all(uploadPromises);

    var fileLink = `${config.amazonS3.publicEndpoint}/${used_module}/${fileName}`;

    var insertedFile = {
      id: uuid.v1(),
      name: name,
      type: fileType,
      link: fileLink
    };

    return insertedFile;
  } catch (err) {
    throw err;
  }
}

async function uploadToS3AsyncResizedTestimonial(file, mimetype, used_module, type) {
  try {
    const files = await createResizedImagesT(file, type);

    const name = uuid.v1();
    const fileType = mime.extension(mimetype);

    const params_array = files.map((file, index) => {
      const fileName = `${name}-${index + 1}.${fileType}`;
      return {
        Bucket: S3_BUCKET,
        Key: `${used_module}/${fileName}`,
        Body: file, //stream
        region: S3_REGION,
        ContentType: mimetype,
        CacheControl: 'max-age=31536000',
      };
    });

    const uploadPromises = params_array.map(params => S3Client.send(new PutObjectCommand(params)));
    await Promise.all(uploadPromises);

    const fileLink = `${config.amazonS3.publicEndpoint}/${used_module}/${fileName}`;

    const insertedFile = {
      id: uuid.v1(),
      name: name,
      type: fileType,
      link: fileLink
    };

    return insertedFile;
  } catch (err) {
    throw err;
  }
}

async function uploadToS3AsyncResizedUserTestimonialImage(file, mimetype, used_module, type) {
  try {
    const resizedImage = await resizeImageT(file, 200);

    const name = uuid.v1();
    const fileType = mime.extension(mimetype);

    const fileName = name + "-1." + fileType; // Assuming `i` is always 0 as it's not defined
    const params = {
      Bucket: S3_BUCKET,
      Key: used_module + "/" + fileName,
      Body: resizedImage, //stream
      region: S3_REGION,
      ContentType: mimetype,
      CacheControl: 'max-age=31536000',
    };

    const command = new PutObjectCommand(params);
    const uploadedFile = await S3Client.send(command);

    return uploadedFile;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  uploadToS3Async,
  uploadToS3AsyncFile,
  uploadToS3AsyncResized,
  uploadToS3AsyncResizedTestimonial,
  uploadToS3AsyncResizedIG,
  uploadToS3AsyncResizedUserTestimonialImage,
};
