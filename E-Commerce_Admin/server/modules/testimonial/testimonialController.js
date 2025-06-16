var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Testimonial = require('./testimonialModel.js');

var testimonialController = function () {};

testimonialController.prototype.addNewTestimonial = bluebird.coroutine(function *(req, res) {
  try {
    var testimonialData = req.body;    
    var profile_img_idx = -1;
    var instagram_img_idx = [];
    var timeline_img_idx = -1;
    var promises=[];
    var k=0;
    var b=0;
    var t=0;
    var y=0;
    console.log("v create files", req.files)
    for(var f in req.files){
      
      if(f=="profile_image") {
        profile_img_idx = k;
        var promise = Upload.uploadToS3AsyncResizedTestimonial(req.files[f].data, req.files[f].mimetype, 'testimonial', 'profile_image');
        promises.push(promise);
      }
      k++;
      
      if(f.split("[")[0] == `instagram_images`) {
        instagram_img_idx.push(b);
        y++;
        var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'testimonial');
        promises.push(promise);
      }
      b++;
      
      if(f=="timeline_image") {
        timeline_img_idx = t;
        var promise = Upload.uploadToS3AsyncResizedTestimonial(req.files[f].data, req.files[f].mimetype, 'testimonial', 'timeline_image');
        promises.push(promise);
      }
      t++;

      promises.push(promise);
    }
    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      console.log("v create", uploaded_files)
      if(testimonialData.sort_order){
        testimonialData.sort_order=parseInt(testimonialData.sort_order);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.testimonialSchema1);
      var valid = validate(testimonialData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var testimonial = yield Testimonial.getTestimonialBy({url:testimonialData.url});
      if(testimonial){
        res.status(403).json({success: false, message: "Testimonial URL is already in use."});
        return;
      }
      testimonialData.id = uuid.v4();

      var all_uploaded_files = [];
      if(testimonialData.existing_images){
        testimonialData.existing_images = JSON.parse(testimonialData.existing_images);
        for(var obj in testimonialData.existing_images){
          for(var i = 0; i < testimonialData.existing_images[obj].length; ++i){
            // testimonialData.existing_images[obj][i].id = uuid.v4();
            testimonialData.existing_images[obj][i].testimonial_id = testimonialData.id;
            uploaded_files.push(testimonialData.existing_images[obj][i]);
          }
        }
      } 

      for(var i=0;i<uploaded_files.length;i++){
        if (uploaded_files[i] && uploaded_files[i].length > 0) {
          for(var j=0;j<uploaded_files[i].length;j++){
            uploaded_files[i][j].img_size = j+1;
            if(i==profile_img_idx){
              uploaded_files[i][j].profile_img = 1; 
              uploaded_files[i][j].timeline_img = 0; 
              uploaded_files[i][j].instagram_img = 0; 
            } else if(i==timeline_img_idx) {
              uploaded_files[i][j].profile_img = 0; 
              uploaded_files[i][j].timeline_img = 1; 
              uploaded_files[i][j].instagram_img = 0; 
            } else if ((instagram_img_idx.find(ind => ind==i) != undefined)) {
              uploaded_files[i][j].profile_img = 0; 
              uploaded_files[i][j].timeline_img = 0; 
              uploaded_files[i][j].instagram_img = 1; 
            }
            uploaded_files[i][j].id = uuid.v4();
            all_uploaded_files.push(uploaded_files[i][j]);
          }
        } else {
          uploaded_files[i].img_size = 1;
          if(i==profile_img_idx){
            uploaded_files[i].profile_img = 1; 
            uploaded_files[i].timeline_img = 0; 
            uploaded_files[i].instagram_img = 0; 
          } else if(i==timeline_img_idx) {
            uploaded_files[i].profile_img = 0; 
            uploaded_files[i].timeline_img = 1; 
            uploaded_files[i].instagram_img = 0; 
          } else if ((instagram_img_idx.find(ind => ind==i) != undefined)) {
            uploaded_files[i].profile_img = 0; 
            uploaded_files[i].timeline_img = 0; 
            uploaded_files[i].instagram_img = 1; 
          }
            uploaded_files[i].id = uuid.v4();
          all_uploaded_files.push(uploaded_files[i]);
        }
      }

      testimonialData.files = all_uploaded_files;

      Testimonial.createTestimonial(testimonialData).then((result) => {
        logger.info('Testimonial created');
        res.status(200).json({success: true, id: testimonialData.id});
      }).catch((err) => {
        console.log(err)
        logger.error("testimonialController: addNewTestimonial - ERROR: Testimonial.createTestimonial: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
  
    })).catch((err) => {
      console.log(err)
      logger.error("testimonialController: addNewTestimonial - ERROR: Testimonial.createTestimonial: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
  } catch (err) {
    logger.error("testimonialController: addNewTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

testimonialController.prototype.updateTestimonial = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var testimonialData = req.body;
    var profile_img_idx = -1;
    var instagram_img_idx = [];
    var timeline_img_idx = -1;
    var promises=[];

    var testimonial = yield Testimonial.getTestimonialDetails(id);
    if(!testimonial){
      res.status(404).json({success: false , message:"Invalid testimonial_id"});
      return;
    }

    var k=0;
    var b=0;
    var t=0;
    var y=0;
    for (var f in req.files) {
      if (f == "profile_image") {
        profile_img_idx = k;
        var promise = Upload.uploadToS3AsyncResizedTestimonial(req.files[f].data, req.files[f].mimetype, 'testimonial', 'profile_image');
        promises.push(promise);
      }
      k++;
    
      if (f.split("[")[0] == `instagram_images`) {
        instagram_img_idx.push(b);
        y++;
        var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'testimonial');
        promises.push(promise);
      }
      b++;
    
      if (f == "timeline_image") {
        timeline_img_idx = t;
        var promise = Upload.uploadToS3AsyncResizedTestimonial(req.files[f].data, req.files[f].mimetype, 'testimonial', 'timeline_image');
        promises.push(promise);
      }
      t++;
    }
    console.log(promises)
    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      console.log(uploaded_files)
      if(testimonialData.sort_order){
        testimonialData.sort_order=parseInt(testimonialData.sort_order);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.testimonialSchema2);
      var valid = validate(testimonialData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      if(testimonialData.url){
        var testimonial1 = yield Testimonial.getTestimonialBy({url:testimonialData.url});
        if(testimonial1 && testimonial1.id!=id){
          res.status(403).json({success: false, message: "Testimonial URL is already in use."});
          return;
        }
      }
      var all_uploaded_files = [];
      for(var i=0;i<uploaded_files.length;i++){
        if (uploaded_files[i] && uploaded_files[i].length > 0) {
          for(var j=0;j<uploaded_files[i].length;j++){
            uploaded_files[i][j].img_size = j+1;
            if(i==profile_img_idx){
              uploaded_files[i][j].profile_img = 1; 
              uploaded_files[i][j].timeline_img = 0; 
              uploaded_files[i][j].instagram_img = 0; 
            } else if(i==timeline_img_idx) {
              uploaded_files[i][j].profile_img = 0; 
              uploaded_files[i][j].timeline_img = 1; 
              uploaded_files[i][j].instagram_img = 0; 
            } else if ((instagram_img_idx.find(ind => ind==i) != undefined)) {
              uploaded_files[i][j].profile_img = 0; 
              uploaded_files[i][j].timeline_img = 0; 
              uploaded_files[i][j].instagram_img = 1; 
            }
            all_uploaded_files.push(uploaded_files[i][j]);
          }
        } else if (uploaded_files[i]) {
          uploaded_files[i].img_size = 1;
          if(i==profile_img_idx){
            uploaded_files[i].profile_img = 1; 
            uploaded_files[i].timeline_img = 0; 
            uploaded_files[i].instagram_img = 0; 
          } else if(i==timeline_img_idx) {
            uploaded_files[i].profile_img = 0; 
            uploaded_files[i].timeline_img = 1; 
            uploaded_files[i].instagram_img = 0; 
          } else if ((instagram_img_idx.find(ind => ind==i) != undefined)) {
            uploaded_files[i].profile_img = 0; 
            uploaded_files[i].timeline_img = 0; 
            uploaded_files[i].instagram_img = 1; 
          }
          all_uploaded_files.push(uploaded_files[i]);
        }
      }
      testimonialData.files = all_uploaded_files;
      console.log(testimonialData)
      Testimonial.updateTestimonial(id, testimonialData).then((result) => {
        logger.info('Testimonial updated');
        res.status(200).json({success: true});
      }).catch((err) => {
        console.log(err)
        logger.error("testimonialController: updateTestimonial - ERROR: Testimonial.updateTestimonial: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });

    })).catch((err) => {
      logger.error("testimonialController: updateTestimonial - ERROR: Testimonial.updateTestimonial: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
  } catch (err) {
    logger.error("testimonialController: updateTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

testimonialController.prototype.filterTestimonials = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.country = req.query.country;
    queryParams.lang = req.query.lang;
    queryParams.category = req.query.category;
    queryParams.gender = req.query.gender;
    queryParams.sort = req.query.sort;
    queryParams.sortOpt = req.query.sortOpt && req.query.sortOpt.toUpperCase() || "ASC";
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Testimonial.filterTestimonials(queryParams));
    tasks.push(Testimonial.countFilterTestimonials(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, testimonials: results[0], testimonialsCount: results[1]});
  } catch (err) {
    logger.error("testimonialController: filterTestimonials - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

testimonialController.prototype.deleteTestimonial = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var testimonial = yield Testimonial.getTestimonialDetails(id);
    if(!testimonial){
      res.status(404).json({success: false , message:"Invalid testimonial_id"});
      return;
    }

    Testimonial.deleteTestimonial(id).then(result => {
      logger.info('Testimonial deleted');
      res.status(200).json({success: true}); 
    }).catch((err) => {
      logger.error("testimonialController: deleteTestimonial - ERROR: Testimonial.deleteTestimonial: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("testimonialController: deleteTestimonial - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

testimonialController.prototype.deleteTestimonialImage = (req, res) => {
  try {
    var { image_id } = req.params;

    Testimonial.deleteTestimonialImage(image_id).then(result => {
      logger.info('Deleted testimonial image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("testimonialController: deleteTestimonialImage - ERROR: Testimonial.deleteTestimonialImage: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("testimonialController: deleteTestimonialImage - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


module.exports = new testimonialController();