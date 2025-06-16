var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Accessory = require('./accessoryModel.js');

var accessoryController = function () {};

accessoryController.prototype.addNewAccessory = bluebird.coroutine(function *(req, res) {
  try {
    var accessoryData = req.body;
    var profile_img_idx = -1;
    var product_img_idx = -1;
    var promises=[];

    var k=0;
    var p=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'accessory');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;
      if(f=="product_image") product_img_idx=p;
      p++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(accessoryData.regular_price){
        accessoryData.regular_price=parseFloat(accessoryData.regular_price);
      }
      if(accessoryData.reduced_price){
        accessoryData.reduced_price=parseFloat(accessoryData.reduced_price);
      }
      if(accessoryData.min_order_total){
        accessoryData.min_order_total=parseFloat(accessoryData.min_order_total);
      }
      if(accessoryData.status || accessoryData.status=='0'){
        accessoryData.status=parseInt(accessoryData.status);
      }
      if(accessoryData.is_gift){
        accessoryData.is_gift=parseInt(accessoryData.is_gift);
      }
      if(accessoryData.sort_order){
        accessoryData.sort_order=parseInt(accessoryData.sort_order);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.accessorySchema1);
      var valid = validate(accessoryData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      accessoryData.id = uuid.v1();

      if(accessoryData.existing_images){
        var profile_img_i = -1;
        var product_img_i = -1;
        var n = 0;
        var l = 0;
        accessoryData.existing_images = JSON.parse(accessoryData.existing_images);
        for(var obj in accessoryData.existing_images){
          if(obj == "profile_image" && accessoryData.existing_images[obj].length > 0) {
            profile_img_i=n;
          }
          n++;
          if(obj == "product_image" && accessoryData.existing_images[obj].length > 0) {
            product_img_i=l;
          }
          l++;
          for(var i = 0; i < accessoryData.existing_images[obj].length; ++i){
            accessoryData.existing_images[obj][i].id = uuid.v1();
            accessoryData.existing_images[obj][i].accessory_id = accessoryData.id;
            uploaded_files.push(accessoryData.existing_images[obj][i]);
          }
        }
        for(var i=0;i<uploaded_files.length;i++){
          if(i==profile_img_i){
            uploaded_files[i].profile_img = 1;
            uploaded_files[i].product_img = 0;
          } else if (i == product_img_i) {
            uploaded_files[i].product_img = 1;
            uploaded_files[i].profile_img = 0;
          } else {
            uploaded_files[i].profile_img = 0;
            uploaded_files[i].product_img = 0;
          }
        }
      } else {
        for(var i=0;i<uploaded_files.length;i++){
          if(i==profile_img_idx){
            uploaded_files[i].profile_img = 1;
            uploaded_files[i].product_img = 0;
          } else if (i == product_img_idx) {
            uploaded_files[i].product_img = 1;
            uploaded_files[i].profile_img = 0;
          } else {
            uploaded_files[i].profile_img = 0;
            uploaded_files[i].product_img = 0;
          }
        }
      }

      accessoryData.files = uploaded_files;

      //console.log(accessoryData)
      Accessory.createAccessory(accessoryData).then((result) => {
        logger.info('Accessory created');
        logInitdataChange.write();
        res.status(200).json({success: true, id: accessoryData.id});
      }).catch((err) => {
        logger.error("accessoryController: addNewAccessory: Accessory.createAccessory - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));
  } catch (err) {
    logger.error("accessoryController: addNewAccessory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

accessoryController.prototype.updateAccessory = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var accessoryData = req.body;
    var profile_img_idx = -1;
    var product_img_idx = -1;
    var promises=[];

    var accessory = yield Accessory.getAccessoryDetails(id);
    if(!accessory){
      res.status(404).json({success: false , message:"Invalid accessory_id"});
      return;
    }

    var k=0;
    var p = 0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'accessory');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;
      if(f=="product_image") product_img_idx=p;
      p++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(accessoryData.regular_price){
        accessoryData.regular_price=parseFloat(accessoryData.regular_price);
      }
      if(accessoryData.reduced_price){
          accessoryData.reduced_price=parseFloat(accessoryData.reduced_price);
      }
      if(accessoryData.min_order_total){
        accessoryData.min_order_total=parseFloat(accessoryData.min_order_total);
      }
      if(accessoryData.status || accessoryData.status=='0'){
        accessoryData.status=parseInt(accessoryData.status);
      }
      if(accessoryData.is_gift){
        accessoryData.is_gift=parseInt(accessoryData.is_gift);
      }
      if(accessoryData.sort_order){
        accessoryData.sort_order=parseInt(accessoryData.sort_order);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.accessorySchema2);
      var valid = validate(accessoryData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
          uploaded_files[i].product_img = 0;
        } else if (i == product_img_idx) {
          uploaded_files[i].product_img = 1;
          uploaded_files[i].profile_img = 0;
        } else {
          uploaded_files[i].profile_img = 0;
          uploaded_files[i].product_img = 0;
        }
      }
      accessoryData.files = uploaded_files;

      Accessory.updateAccessory(id, accessoryData).then(result => {
          logger.info('Accessory updated');
          logInitdataChange.write();
          res.status(200).json({success: true});
      }).catch((err) => {
          logger.error("accessoryController: updateAccessory: Accessory.updateAccessory - ERROR: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
      });

    }));
  } catch (err) {
    logger.error("accessoryController: updateAccessory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

accessoryController.prototype.filterAccessories = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.search = req.query.search;
    queryParams.country = req.query.country;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 50;

    var tasks = [];
    tasks.push(Accessory.filterAccessories(queryParams))
    tasks.push(Accessory.countFilterAccessories(queryParams))

    var results = yield bluebird.all(tasks)
    res.status(200).json({success: true, accessories: results[0], accessoriesCount: results[1]});
  } catch (err) {
    logger.error("accessoryController: filterAccessories: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

accessoryController.prototype.deleteAccessory = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var accessory = yield Accessory.getAccessoryDetails(id);
    if(!accessory){
      res.status(404).json({success: false , message:"Invalid accessory_id"});
      return;
    }

    Accessory.deleteAccessory(id).then(result => {
      logger.info('Accessory deleted');
      logInitdataChange.write();
      res.status(200).json({success: true});
    }).catch((err) => {
      logger.error("accessoryController: deleteAccessory: Accessory.deleteAccessory - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
  } catch (err) {
    logger.error("accessoryController: deleteAccessory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


accessoryController.prototype.deleteAccessoryImage = (req, res) => {
  try {
    var { image_id } = req.params;

    Accessory.deleteAccessoryImage(image_id).then(result => {
      logger.info('Deleted accessory image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("accessoryController: deleteAccessoryImage: Accessory.deleteAccessoryImage - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("accessoryController: deleteAccessory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

accessoryController.prototype.getAccessoryFullDetails = (req, res) => {
  try {
    var { id } = req.params;

    Accessory.getAccessoryDetailsFull(id).then(result => {
      logger.info('Get full accessory details');
      res.status(200).json({success: true, accessory: result });
    }).catch(err => {
      logger.error("accessoryController: getAccessoryFullDetails: Accessory.getAccessoryFullDetails - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("accessoryController: getAccessoryFullDetails: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}




module.exports = new accessoryController();
