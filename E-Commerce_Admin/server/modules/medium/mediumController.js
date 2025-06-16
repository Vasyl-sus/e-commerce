var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Medium = require('./mediumModel.js');

var mediumController = function () {};

mediumController.prototype.addNewMedium = bluebird.coroutine(function *(req, res) {
  try {
    var mediumData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var promises=[];

    var k=0;
    var m=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'medium');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;  
      if(f=="big_image") big_img_idx=k;
      m++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.mediumSchema1);
      var valid = validate(mediumData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      mediumData.id = uuid.v1();
    
      var medium = yield Medium.getMediumByName(mediumData.name);
      if(medium){
        res.status(403).json({success: false, message: "medium_exists"});
        return;
      }
    
      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      mediumData.files = uploaded_files;
    
      try {
        const result = yield Medium.createMedium(mediumData);
        logger.info('Medium created');
        res.status(200).json({success: true, id: mediumData.id});
      } catch (err) {
        logger.error("mediumController: addNewMedium - ERROR: Medium.createMedium: "+err.message);
        res.status(500).json({success: false, message: err.message});
      }
    }));
  } catch (err) {
    logger.error("mediumController: addNewMedium - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

mediumController.prototype.updateMedium = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var mediumData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var promises=[];

    var medium = yield Medium.getMediumDetails(id);
    if(!medium){
      res.status(404).json({success: false , message:"Invalid medium_id"});
      return;
    }

    var k=0;
    var m=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'medium');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;  
      if(f=="big_image") big_img_idx=k;
      m++;       
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.mediumSchema2);
      var valid = validate(mediumData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
    
      if(mediumData.name){
        var medium = yield Medium.getMediumByName(mediumData.name);
        if(medium && medium.id != id){
          res.status(403).json({success: false, message: "medium_exists"});
          return;
        }
      }
    
      for(var i=0; i<uploaded_files.length; i++){
        if(i == profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      mediumData.files = uploaded_files;
    
      try {
        const result = yield Medium.updateMedium(id, mediumData);
        logger.info('Medium updated');
        res.status(200).json({success: true});
      } catch (err) {
        logger.error("mediumController: updateMedium - ERROR: Medium.updateMedium: "+err.message);
        res.status(500).json({success: false, message: err.message});
      }
    }));
  } catch (err) {
    logger.error("mediumController: updateMedium - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

mediumController.prototype.filterMediums = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Medium.filterMediums(queryParams))
    tasks.push(Medium.countFilterMediums(queryParams))

    var results = yield bluebird.all(tasks)
    res.status(200).json({success: true, mediums: results[0], mediumsCount: results[1]});
  } catch (err) {
    logger.error("mediumController: filterMediums - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

mediumController.prototype.deleteMedium = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var medium = yield Medium.getMediumDetails(id);
    if(!medium){
      res.status(404).json({success: false , message:"Invalid medium_id"});
      return;
    }

    Medium.deleteMedium(id).then(result => {
      logger.info('Medium deleted');
      res.status(200).json({success: true}); 
    }).catch((err) => {
      logger.error("mediumController: deleteMedium - ERROR: Medium.deleteMedium: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
  } catch (err) {
    logger.error("mediumController: deleteMedium - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


mediumController.prototype.deleteMediumImage = (req, res) => {
  try {
    var { image_id } = req.params;

    Medium.deleteMediumImage(image_id).then(result => {
      logger.info('Deleted medium image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("mediumController: deleteMediumImage - ERROR: Medium.deleteMediumImage: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })  

  } catch (err) {
    logger.error("mediumController: deleteMediumImage - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new mediumController();