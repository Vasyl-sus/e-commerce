var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Otom = require('./otomModel.js');

var otomController = function () {};

otomController.prototype.addNewOtom = bluebird.coroutine(function *(req, res) {
  try {
    var otomData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'otom');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      if(otomData.hasOwnProperty('active') && (otomData.active==0 || otomData.active==1)){
        otomData.active=parseInt(otomData.active);
      }
      if(otomData.hasOwnProperty('send_after_days') && otomData.send_after_days>=0){
        otomData.send_after_days=parseInt(otomData.send_after_days);
      }
      if(otomData.therapies){
        for(var i=0;i<otomData.therapies.length;i++){
          if(typeof otomData.therapies[i]=='string')
            otomData.therapies[i] = JSON.parse(otomData.therapies[i]);
        }
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      var uploaded_image = uploaded_files.find(uf=>{return uf.profile_img==1});
      otomData.image_link = (uploaded_image && uploaded_image.link) || "";

      //AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.otomSchema1);
      var valid = validate(otomData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      otomData.id = uuid.v1();

      Otom.createOtom(otomData).then((result) => {
          logger.info('Otom created');
          res.status(200).json({"success": true, id: otomData.id });
      }).catch((err) => {
          logger.error("otomController: addNewOtom - ERROR: Otom.createOtom: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
      });
    }));

  } catch (err) {
    logger.error("otomController: addNewOtom - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

otomController.prototype.updateOtom = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var otomData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'otom');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      if(otomData.hasOwnProperty('active') && (otomData.active==0 || otomData.active==1)){
        otomData.active=parseInt(otomData.active);
      }
      if(otomData.hasOwnProperty('send_after_days') && otomData.send_after_days>=0){
        otomData.send_after_days=parseInt(otomData.send_after_days);
      }
      if(otomData.therapies){
        for(var i=0;i<otomData.therapies.length;i++){
          if(typeof otomData.therapies[i]=='string')
            otomData.therapies[i] = JSON.parse(otomData.therapies[i]);
        }
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      var uploaded_image = uploaded_files.find(uf=>{return uf.profile_img==1});
      otomData.image_link = (uploaded_image && uploaded_image.link) || otomData.image_link;

      //AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.otomSchema2);
      var valid = validate(otomData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var otom = yield Otom.getOtomDetails(id);
      if(!otom){
        res.status(404).json({success: false, message: "Invalid otom_id"});
        return;
      }

      Otom.updateOtom(id, otomData).then(result => {
        logger.info('Otom updated');
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("otomController: addNewOtom - ERROR: Otom.updateOtom: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }));

  } catch (err) {
    logger.error("otomController: updateOtom - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

otomController.prototype.filterOtoms = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Otom.filterOtoms(queryParams));
    tasks.push(Otom.countFilterOtoms(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, otoms: results[0], otomsCount: results[1]});
  } catch (err) {
    logger.error("otomController: filterOtoms - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

otomController.prototype.deleteOtom = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var otom = yield Otom.getOtomDetails(id);
    if(!otom){
    res.status(404).json({success: false, message: "Invalid otom_id"});
    return;
    }

    Otom.deleteOtom(id).then(result => {
        logger.info('Otom deleted');
        res.status(200).json({success: true});
    }).catch(err => {
        logger.error("otomController: deleteOtom - ERROR: Otom.deleteOtom: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });

  } catch (err) {
    logger.error("otomController: deleteOtom - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

module.exports = new otomController();
