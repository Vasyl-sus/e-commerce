var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var UserTestimonial = require('./userTestimonialModel.js');

var userTestimonialController = function () {};

userTestimonialController.prototype.filterUserTestimonials = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.country = req.query.country;
    queryParams.lang = req.query.lang;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.sort = req.query.sort;
    queryParams.sortOpt = req.query.sortOpt;

    var tasks = [];
    tasks.push(UserTestimonial.filterUserTestimonials(queryParams));
    tasks.push(UserTestimonial.countUserTestimonials());

    var results = yield bluebird.all(tasks);
    
    res.status(200).json({success: true, userTestimonials: results[0], userTestimonialsCount: results[1] });
  } catch (err) {
    logger.error("userTestimonialController: filterUserTestimonials - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

userTestimonialController.prototype.createUserTestimonial = bluebird.coroutine(function *(req, res) {
  try {

    var data = req.body;

    if (data.rating) {
      data.rating = parseInt(data.rating);
    }

    if (data.sort_number) {
      data.sort_number = parseInt(data.sort_number);
    }
   
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.userTestimonialSchema1);
    var valid = validate(data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    const testimonialsCount = yield UserTestimonial.countUserTestimonials();

    if (testimonialsCount) data.sort_number = testimonialsCount + 1;

    if (req.files && req.files['image']) {
      const uploadedImage = yield Upload.uploadToS3AsyncResizedTestimonial(req.files['image'].data, req.files['image'].mimetype, 'testimonial', 'profile_image')
      if (uploadedImage) {
        data.image = uploadedImage[0].link;
        data.image_small = uploadedImage[1].link
      }
    }
    
    yield UserTestimonial.createUserTestimonial(data);
    logger.info('User testimonial created');
      res.status(200).json({ success: true });
  } catch (err) {
    logger.error("userTestimonialController: createUserTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

userTestimonialController.prototype.deleteUserTestimonial = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var userTestimonial = yield UserTestimonial.getUserTestimonialDetails(id);
    if(!userTestimonial){
      res.status(404).json({success: false , message:"Invalid testimonial_id"});
      return;
    }

    UserTestimonial.deleteUserTestimonial(id, userTestimonial.sort_number).then(result => {
      logger.info('User testimonial deleted');
      res.status(200).json({success: true}); 
    }).catch((err) => {
      logger.error("userTestimonialController: deleteUserTestimonial - ERROR: UserTestimonial.deleteUserTestimonial: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("userTestimonialController: deleteUserTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

userTestimonialController.prototype.updateUserTestimonial = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var userTestimonialData = req.body;

    var userTestimonial = yield UserTestimonial.getUserTestimonialDetails(id);
    if(!userTestimonial){
      res.status(404).json({success: false , message:"Invalid testimonial_id"});
      return;
    }

    if (userTestimonialData.rating) {
      userTestimonialData.rating = parseInt(userTestimonialData.rating);
    }

    if (userTestimonialData.sort_number) {
      userTestimonialData.sort_number = parseInt(userTestimonialData.sort_number);
    }
   
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.userTestimonialSchema2);
    var valid = validate(userTestimonialData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    if (req.files && req.files['image']) {
      const uploadedImage = yield Upload.uploadToS3AsyncResizedTestimonial(req.files['image'].data, req.files['image'].mimetype, 'testimonial', 'profile_image')
      if (uploadedImage) {
        userTestimonialData.image = uploadedImage[0].link;
        userTestimonialData.image_small = uploadedImage[1].link
      }
    }

    yield UserTestimonial.updateUserTestimonial(id, userTestimonialData);
    logger.info('User testimonial updated');
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error("testimonialController: updateTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new userTestimonialController();