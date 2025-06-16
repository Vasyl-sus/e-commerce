var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Deliverymethod = require('./deliverymethodModel.js');

var deliverymethodController = function () {};

deliverymethodController.prototype.addNewDeliverymethod = bluebird.coroutine(function *(req, res) {
  try {
    var dmData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'deliverymethod');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(dmData.therapies){
        for(var i=0; i<dmData.therapies.length; i++){
          if(typeof dmData.therapies[i]=="string"){
            try{
              dmData.therapies[i] = JSON.parse(dmData.therapies[i]);
            } catch(err) {
              dmData.therapies[i] = null;
            }
          }
        }
      }

      if(dmData.active){
        dmData.active=parseInt(dmData.active);
      }
      if(dmData.price){
        dmData.price=parseFloat(dmData.price);
      }
      if(dmData.to_price){
        dmData.to_price=parseFloat(dmData.to_price);
      }
      //AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.deliverymethodSchema1);
      var valid = validate(dmData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var deliverymethod = yield Deliverymethod.getDeliverymethodByCodeAndCountry(dmData.code, dmData.country);
      if (deliverymethod) {
        res.status(403).json({success: false, message: "deliverymethod_exists"});
        return;
      }

      dmData.id = uuid.v1();

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      dmData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      Deliverymethod.createDeliverymethod(dmData).then((result) => {
        logger.info('Deliverymethod created');
        logInitdataChange.write();
        res.status(200).json({"success": true, id: dmData.id });
      }).catch((err) => {
        logger.error("deliverymethodController: addNewDeliverymethod - ERROR: Deliverymethod.createDeliverymethod: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));

  } catch (err) {
    logger.error("deliverymethodController: addNewDeliverymethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

deliverymethodController.prototype.updateDeliverymethod = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var dmData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'deliverymethod');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      if(dmData.active){
        dmData.active=parseInt(dmData.active);
      }
      if(dmData.price){
        dmData.price=parseFloat(dmData.price);
      }
      if(dmData.to_price){
        dmData.to_price=parseFloat(dmData.to_price);
      }

      if(dmData.therapies){
        for(var i=0; i<dmData.therapies.length; i++){
          if(typeof dmData.therapies[i]=="string"){
            try{
              dmData.therapies[i] = JSON.parse(dmData.therapies[i]);
            } catch(err) {
              dmData.therapies[i] = null;
            }
          }
        }
      }

      //AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.deliverymethodSchema2);
      var valid = validate(dmData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var deliverymethod1 = yield Deliverymethod.getDeliverymethodDetails(id);
      if(!deliverymethod1){
        res.status(404).json({success: false, message: "Invalid deliverymethod_id"});
        return;
      }
      var deliverymethod = yield Deliverymethod.getDeliverymethodByCodeAndCountry(dmData.code, dmData.country);
      if(deliverymethod && deliverymethod.id!=id){
        res.status(403).json({success: false, message: "deliverymethod_exists"});
        return;
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      dmData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      var country = dmData.country || deliverymethod1.country;
      Deliverymethod.updateDeliverymethod(id, dmData, country).then(result => {
        logger.info('Deliverymethod updated');
        logInitdataChange.write();
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("deliverymethodController: updateDeliverymethod - ERROR: Deliverymethod.updateDeliverymethod: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));

  } catch (err) {
    logger.error("deliverymethodController: updateDeliverymethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

deliverymethodController.prototype.filterDeliverymethods = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.active = req.query.active;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Deliverymethod.filterDeliverymethods(queryParams));
    tasks.push(Deliverymethod.countFilterDeliverymethods(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, deliverymethods: results[0], deliverymethodsCount: results[1]});
  } catch (err) {
    logger.error("deliverymethodController: filterDeliverymethods - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

deliverymethodController.prototype.deleteDeliverymethod = (req, res) => {
  try {
    var { id } = req.params;

    Deliverymethod.deleteDeliverymethod(id).then(result => {
      if(result!=0) {
        logger.info('Deliverymethod deleted');
        logInitdataChange.write();
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false , message:"Invalid deliverymethod_id"});
      }
    }).catch(err => {
      logger.error("deliverymethodController: deleteDeliverymethod - ERROR: Deliverymethod.deleteDeliverymethod: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("deliverymethodController: deleteDeliverymethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new deliverymethodController();
