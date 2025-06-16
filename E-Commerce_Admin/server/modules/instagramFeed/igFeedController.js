var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var IGfeed = require('./igFeedModel.js');

var igfeedController = function () {};

igfeedController.prototype.addNewIGfeed = bluebird.coroutine(function *(req, res) {
  try {
    var igfeedData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'igfeed');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;        
    }

    if(igfeedData.showed)
        igfeedData.showed = parseInt(igfeedData.showed);

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.igFeedSchema1);
      var valid = validate(igfeedData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      igfeedData.id = uuid.v1();

      for(var i=0;i<uploaded_files[0].length;i++){
        if(i==profile_img_idx){
          uploaded_files[0][i].profile_img = 1;
        }
      }
      igfeedData.files = uploaded_files[0];
      
      IGfeed.createIGfeed(igfeedData).then(result => {
        logger.info('IGfeed created');
        res.status(200).json({success: true, id: igfeedData.id });
      }).catch(err => {
        console.log(err)
        logger.error("igfeedController: addNewIGfeed: IGfeed.createIGfeed - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      }); 
      
    }));
  } catch (err) {
    console.log(err)
    logger.error("igfeedController: addNewIGfeed: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

igfeedController.prototype.updateIGfeed = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var igfeedData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var igfeed = yield IGfeed.getIGfeedDetails(id);
    if(!igfeed){
      res.status(404).json({success: false , message:"Invalid igfeed_id"});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'igfeed');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;        
    }

    if(igfeedData.showed)
      igfeedData.showed = parseInt(igfeedData.showed);

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.igFeedSchema2);
      var valid = validate(igfeedData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      igfeedData.files = uploaded_files[0];
      
      IGfeed.updateIGfeed(id, igfeedData).then(result => {
        logger.info('IGfeed updated');
        res.status(200).json({success: true});
      }).catch(err => {
        console.log(err)
        logger.error("igfeedController: updateIGfeed: IGfeed.updateIGfeed - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));
  } catch (err) {
    logger.error("igfeedController: updateIGfeed: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

igfeedController.prototype.filterIGfeeds = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(IGfeed.filterIGfeeds(queryParams));
    tasks.push(IGfeed.countFilterIGfeeds(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, igfeeds: results[0], igfeedsCount: results[1]});
  } catch (err) {
    logger.error("igfeedController: filterIGfeeds: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

igfeedController.prototype.deleteIGfeed = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var igfeed = yield IGfeed.getIGfeedDetails(id);
    if(!igfeed){
      res.status(404).json({success: false , message:"Invalid igfeed_id"});
      return;
    }

    IGfeed.deleteIGfeed(id).then(result => {
      logger.info('IGfeed deleted');
      res.status(200).json({success: true}); 
      return;
    }).catch(err => {
      logger.error("igfeedController: deleteIGfeed: IGfeed.deleteIGfeed - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("igfeedController: deleteIGfeed: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

igfeedController.prototype.deleteIGfeedImage = (req, res) => {
  try {
    var { image_id } = req.params;
    
    IGfeed.deleteIGfeedImage(image_id).then(result => {
      logger.info('Deleted IGfeed image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("igfeedController: deleteIGfeedImage: IGfeed.updateIGfeedImage - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("igfeedController: deleteIGfeedImage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


module.exports = new igfeedController();