var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Therapy = require('./therapyModel.js');

var therapyController = function () {};

therapyController.prototype.addNewTherapy = bluebird.coroutine(function *(req, res) {
  try {
    var therapyData = req.body;
    var profile_img_idx = -1;
    var pattern_image_idx = -1;
    var background_image_idx = -1;
    var promises = [];
    
    var k = 0;
    var b = 0;
    var p = 0;
    for (var f in req.files) {
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'therapy');
      promises.push(promise);
      if (f == "display_image") profile_img_idx = k;
      k++;
      
      if (f == "background_image") background_image_idx = b;
      b++;       

      if (f == "pattern_image") pattern_image_idx = p;
      p++;       
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if (therapyData.products) {
        //dev - enter objects to postman form fields
        for (var i = 0; i < therapyData.products.length; i++) {
          if (typeof therapyData.products[i] == "string") {
            try {
              therapyData.products[i] = JSON.parse(therapyData.products[i]);
            } catch (err) {
              therapyData.products[i] = null;
            }
          }
        }
      }

      if (therapyData.active) {
        therapyData.active = parseInt(therapyData.active);
      }
      if (therapyData.total_price) {
        therapyData.total_price = parseFloat(therapyData.total_price);
      }
      if (therapyData.inflated_price) {
        therapyData.inflated_price = parseFloat(therapyData.inflated_price);
      }
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.therapySchema1);
      var valid = validate(therapyData);
      if (!valid) {
        logger.error("therapyController: addNewTherapy - ERROR: validationSchema.therapySchema1: " + validate.errors);
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      therapyData.id = uuid.v1();

      if (therapyData.display_image) {
        var link = therapyData.display_image;
        var arr1 = link.split('/');
        if (arr1 && arr1[arr1.length - 1]) {
          var arr2 = arr1[arr1.length - 1].split('.');
          if (arr2[0] && arr2[1]) {
            therapyData.display_image = {
              id: uuid.v1(),
              name: arr2[0],
              type: arr2[1],
              link
            }
          }
        }
      }

      for (var i = 0; i < uploaded_files.length; i++) {
        if (i == profile_img_idx) {
          uploaded_files[i].profile_img = 1;
          uploaded_files[i].pattern_img = 0;
          uploaded_files[i].background_img = 0;
        } else if (i == pattern_image_idx) {
          uploaded_files[i].profile_img = 0;
          uploaded_files[i].pattern_img = 1;
          uploaded_files[i].background_img = 0;
        } else if (i == background_image_idx) {
          uploaded_files[i].profile_img = 0;
          uploaded_files[i].pattern_img = 0;
          uploaded_files[i].background_img = 1;
        }
      }
      therapyData.files = uploaded_files.filter(uf => { return uf.profile_img == 1 || uf.pattern_img == 1 || uf.background_img == 1 });
      Therapy.createTherapy(therapyData).then((result) => {
        logger.info('Therapy created');
        logInitdataChange.write();
        res.status(200).json({success: true, id: therapyData.id });
      }).catch((err) => {
        logger.error("therapyController: addNewTherapy - ERROR: Therapy.createTherapy: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }));

  } catch (err) {
    logger.error("therapyController: addNewTherapy - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});



therapyController.prototype.filterTherapies = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.country = req.query.country;
    queryParams.lang = req.query.lang;
    queryParams.active = req.query.active;
    queryParams.search = req.query.search;
    queryParams.sort = req.query.sort;
    queryParams.sortOpt = req.query.sortOpt && req.query.sortOpt.toUpperCase() || "ASC";
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || null;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || null;

    var tasks = [];
    tasks.push(Therapy.filterTherapies(queryParams));
    tasks.push(Therapy.countFilterTherapies(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, therapies: results[0], therapiesCount: results[1]});
  } catch (err) {
    logger.error("therapyController: filterTherapies - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

therapyController.prototype.updateTherapy = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var therapyData = req.body;
    var profile_img_idx = -1;
    var pattern_image_idx = -1;
    var background_image_idx = -1;
    var promises = [];

    var therapy = yield Therapy.getTherapyDetails(id);
    if (!therapy) {
      res.status(404).json({success: false, message: "Invalid therapy_id"});
      return;
    }

    var k = 0;
    var b = 0;
    var p = 0;
    for (var f in req.files) {
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'therapy');
      promises.push(promise);
      if (f == "display_image") profile_img_idx = k;
      k++;   
      
      if (f == "background_image") background_image_idx = b;
      b++;       

      if (f == "pattern_image") pattern_image_idx = p;
      p++;  
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if (therapyData.products) {
        for (var i = 0; i < therapyData.products.length; i++) {
          if (typeof therapyData.products[i] == "string") {
            try {
              therapyData.products[i] = JSON.parse(therapyData.products[i]);
            } catch (err) {
              therapyData.products[i] = null;
            }
          }
        }
      }

      if (therapyData.active) {
        therapyData.active = parseInt(therapyData.active);
      }
      if (therapyData.total_price) {
        therapyData.total_price = parseFloat(therapyData.total_price);
      }
      if (therapyData.inflated_price) {
        therapyData.inflated_price = parseFloat(therapyData.inflated_price);
      }
      // AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.therapySchema2);
      var valid = validate(therapyData);
      if (!valid) {
        logger.error("therapyController: updateTherapy - ERROR: validationSchema.therapySchema2: " + validate.errors);
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      
      for (var i = 0; i < uploaded_files.length; i++) {
        if (i == profile_img_idx) {
          uploaded_files[i].profile_img = 1;
          uploaded_files[i].pattern_img = 0;
          uploaded_files[i].background_img = 0;
        } else if (i == pattern_image_idx) {
          uploaded_files[i].profile_img = 0;
          uploaded_files[i].pattern_img = 1;
          uploaded_files[i].background_img = 0;
        } else if (i == background_image_idx) {
          uploaded_files[i].profile_img = 0;
          uploaded_files[i].pattern_img = 0;
          uploaded_files[i].background_img = 1;
        }
      }
      therapyData.files = uploaded_files.filter(uf => { return uf.profile_img == 1 || uf.pattern_img == 1 || uf.background_img == 1 });

      Therapy.updateTherapy(id, therapyData).then(result => {
        logger.info('Therapy updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("therapyController: updateTherapy - ERROR: Therapy.updateTherapy: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    })).catch(err => {
      logger.error("therapyController: updateTherapy - ERROR: Promise.all(promises): " + err.message);
      res.status(500).json({success: false, message: err.message});
    });
    
  } catch (err) {
    logger.error("therapyController: updateTherapy - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

therapyController.prototype.deleteTherapy = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var therapy = yield Therapy.getTherapyDetails(id);
    if(!therapy){
      res.status(404).json({success: false , message:"Invalid therapy_id"});
      return;
    }

    Therapy.deleteTherapy(id).then(result => {
      logger.info('Therapy deleted');
      res.status(200).json({success: true}); 
    }).catch(err => {
      logger.error("therapyController: deleteTherapy - ERROR: Therapy.deleteTherapy: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("therapyController: deleteTherapy - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

therapyController.prototype.deleteTherapy1 = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var therapy = yield Therapy.getTherapyDetails(id);
    if(!therapy){
      res.status(404).json({success: false , message:"Invalid therapy_id"});
      return;
    }

    Therapy.updateTherapy(id, {active:0}).then(result => {
      logger.info('Therapy deactivated');
      logInitdataChange.write();
      res.status(200).json({success: true}); 
    }).catch(err => {
      logger.error("therapyController: deleteTherapy1 - ERROR: Therapy.updateTherapy: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("therapyController: deleteTherapy1 - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

therapyController.prototype.deleteTherapyImage = (req, res) => {
  try {
    var { id } = req.params;

    Therapy.deleteTherapyImage(id).then(result => {
      logger.info('Deleted product image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("productController: deleteProductImage - ERROR: Product.deleteProductImage: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: deleteProductImage - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new therapyController();