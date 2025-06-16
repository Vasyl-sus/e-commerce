var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Pharmacy = require('./pharmacyModel.js');

var pharmacyController = function () {};

pharmacyController.prototype.addNewPharmacy = bluebird.coroutine(function *(req, res) {
  try {
    var pharmacyData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'pharmacy');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      if(pharmacyData.latitude)
        pharmacyData.latitude = parseFloat(pharmacyData.latitude);
      if(pharmacyData.longitude)
        pharmacyData.longitude = parseFloat(pharmacyData.longitude);

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.pharmacySchema1);
      var valid = validate(pharmacyData);
      if (!valid) {
        console.log(validate.errors)
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      pharmacyData.id = uuid.v1();

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      pharmacyData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      Pharmacy.createPharmacy(pharmacyData).then((result) => {
        logger.info('Pharmacy created');
        res.status(200).json({success: true, id: pharmacyData.id });
      }).catch((err) => {
        logger.error("pharmacyController: addNewPharmacy - ERROR: Pharmacy.createPharmacy: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    })); 
  } catch (err) {
    logger.error("pharmacyController: addNewPharmacy - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

pharmacyController.prototype.updatePharmacy = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var pharmacyData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var pharmacy = yield Pharmacy.getPharmacyDetails(id);
    if(!pharmacy){
      res.status(404).json({success: false, message: "Invalid pharmacy_id"});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'pharmacy');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      if(pharmacyData.latitude)
        pharmacyData.latitude = parseFloat(pharmacyData.latitude);
      if(pharmacyData.longitude)
        pharmacyData.longitude = parseFloat(pharmacyData.longitude);

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.pharmacySchema2);
      var valid = validate(pharmacyData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      pharmacyData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      Pharmacy.updatePharmacy(id, pharmacyData).then(result => {
        logger.info('Pharmacy updated');
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("pharmacyController: updatePharmacy - ERROR: Pharmacy.updatePharmacy: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    })); 
  } catch (err) {
    logger.error("pharmacyController: updatePharmacy - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

pharmacyController.prototype.filterPharmacies = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Pharmacy.filterPharmacies(queryParams));
    tasks.push(Pharmacy.countFilterPharmacies(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, pharmacies: results[0], pharmaciesCount: results[1]});
  } catch (err) {
    logger.error("pharmacyController: filterPharmacies - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

pharmacyController.prototype.deletePharmacy = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var pharmacy = yield Pharmacy.getPharmacyDetails(id);
    if(!pharmacy){
      res.status(404).json({success: false , message:"Invalid pharmacy_id"});
      return;
    }

    Pharmacy.deletePharmacy(id).then(result => {
      logger.info('Pharmacy deleted');
      res.status(200).json({success: true}); 
    }).catch(err => {
      logger.error("pharmacyController: deletePharmacy - ERROR: Pharmacy.deletePharmacy: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
  } catch (err) {
    logger.error("pharmacyController: deletePharmacy - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


pharmacyController.prototype.deletePharmacyImage = (req, res) => {
  try {
    var { id } = req.params;
    
    Pharmacy.deletePharmacyImage(id).then(result => {
      logger.info('Deleted pharmacy image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("pharmacyController: deletePharmacyImage - ERROR: Pharmacy.deletePharmacyImage: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("pharmacyController: deletePharmacyImage - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


module.exports = new pharmacyController();