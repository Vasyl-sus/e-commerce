var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Country = require('../country/countryModel.js');
var Paymentmethod = require('./paymentmethodModel.js');

var paymentmethodController = function () {};

paymentmethodController.prototype.addNewPaymentmethod = bluebird.coroutine(function *(req, res) {
  try {
    var pmData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'paymentmethod');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(pmData.active){
        pmData.active=parseInt(pmData.active);
      }
      if(pmData.is_other){
        pmData.is_other=parseInt(pmData.is_other);
      }
      
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.paymentmethodSchema1);
      var valid = validate(pmData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var exsisting_paymentmethod = yield Paymentmethod.getPaymentmethodByTitle(pmData.title);
      if(exsisting_paymentmethod){
        res.status(403).json({success: false, message: "paymentmethod_exists"});
        return;
      }

      // var countries1 = pmData.countries;
      var countries = yield Country.getCountriesByNames(pmData.countries);
      if(!countries){
        res.status(403).json({success: false, message: "No valid countries!"});
        return;
      }

      if(pmData.countries){
        for(var i=0; i<pmData.countries.length; i++){
          if(typeof pmData.countries[i]=="string"){
            try{
              pmData.countries[i] = JSON.parse(pmData.countries[i]);
            } catch(err) {
              pmData.countries[i] = null;
            }
          }
        }
      }

      pmData.id = uuid.v1();

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      pmData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      Paymentmethod.createPaymentmethod(pmData).then(result => {
        logger.info('Paymentmethod created');
        logInitdataChange.write();
        res.status(200).json({success: true, id: pmData.id });
      }).catch(err => {
        logger.error("paymentmethodController: addNewPaymentmethod - ERROR: Paymentmethod.createPaymentmethod: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));

  } catch (err) {
    logger.error("paymentmethodController: addNewPaymentmethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});



paymentmethodController.prototype.updatePaymentmethod = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var pmData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'paymentmethod');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(pmData.active){
        pmData.active=parseInt(pmData.active);
      }
      if(pmData.is_other){
        pmData.is_other=parseInt(pmData.is_other);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.paymentmethodSchema2);
      var valid = validate(pmData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var paymentmethod = yield Paymentmethod.getPaymentmethodDetailsFull(id);
      if(!paymentmethod){
        res.status(404).json({success: false, message: "Invalid paymentmethod_id"});
        return;
      }
      if(pmData.title){
        var paymentmethod1 = yield Paymentmethod.getPaymentmethodByTitle(pmData.title);
        if(paymentmethod1 && paymentmethod1.id!=id){
          res.status(403).json({success: false, message: "paymentmethod_exists"});
          return;
        }
      }

      var current_countries = pmData.countries || paymentmethod.countries;
      if(pmData.countries){
        var countries = yield Country.getCountriesByNames(pmData.countries);
        if(!countries){
          res.status(403).json({success: false, message: "Invalid countries!"});
          return;
        }
        // pmData.countries = countries.map(x => { return x.id; });
      }

      if(pmData.countries){
        for(var i=0; i<pmData.countries.length; i++){
          if(typeof pmData.countries[i]=="string"){
            try{
              pmData.countries[i] = JSON.parse(pmData.countries[i]);
            } catch(err) {
              pmData.countries[i] = null;
            }
          }
        }
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      pmData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});


      Paymentmethod.updatePaymentmethod(id, pmData, current_countries).then(result => {
        logger.info('Paymentmethod updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("paymentmethodController: addNewPaymentmethod - ERROR: Paymentmethod.updatePaymentmethod: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));
  } catch (err) {
    logger.error("paymentmethodController: updatePaymentmethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


paymentmethodController.prototype.filterPaymentmethods = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    //console.log(req._parsedOriginalUrl.path);
    //console.log(req.route.stack[0].method);
    var tasks = [];
    tasks.push(Paymentmethod.filterPaymentmethods(queryParams));
    tasks.push(Paymentmethod.countFilterPaymentmethods(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, paymentmethods: results[0], paymentmethodsCount: results[1]});
  } catch (err) {
    logger.error("paymentmethodController: filterPaymentmethods - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})


paymentmethodController.prototype.deletePaymentmethod = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;
    var paymentmethod = yield Paymentmethod.getPaymentmethodDetails(id);

    Paymentmethod.deletePaymentmethod(id).then(result => {
      if(result!=0){
        logger.info('Paymentmethod deleted');
        logInitdataChange.write();
        res.status(200).json({success: true});
      } else
        res.status(404).json({success: false , message:"Invalid paymentmethod_id"});
    });

  } catch (err) {
    logger.error("paymentmethodController: deletePaymentmethod - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


paymentmethodController.prototype.deletePaymentmetodImage = (req, res) => {
  try {
    var { id } = req.params;

    Paymentmethod.deletePaymentmethodImage(id).then(result => {
      logger.info('Deleted paymentmetod image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("paymentmethodController: deletePaymentmethodImage - ERROR: Paymentmethod.deletePaymentmethodImage: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("paymentmethodController: deletePaymentmethodImage - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new paymentmethodController();
