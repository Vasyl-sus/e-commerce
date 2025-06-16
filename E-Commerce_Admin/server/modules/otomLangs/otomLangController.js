var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var OtomLang = require('./otomLangModel');

var otomLangController = function () {};

otomLangController.prototype.addNewOtomLang = bluebird.coroutine(function *(req, res) {
  try {
    var otomLangData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.otomLangSchema1);
    var valid = validate(otomLangData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    otomLangData.id = uuid.v1();

    OtomLang.createOtomLang(otomLangData).then((result) => {
        logger.info('Otom language created');
        res.status(200).json({"success": true, id: otomLangData.id });
    }).catch((err) => {
        logger.error("otomLangController: addNewOtomLang - ERROR: OtomLang.createOtomLang: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });

  } catch (err) {
    logger.error("otomLangController: addNewOtomLang - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

otomLangController.prototype.updateOtomLang = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var otomLangData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.otomLangSchema2);
    var valid = validate(otomLangData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var otom_lang = yield OtomLang.getOtomLangDetails(id);
      if(!otom_lang){
        res.status(404).json({success: false, message: "Invalid otom_id"});
        return;
      }
      
      OtomLang.updateOtomLang(id, otomLangData).then(result => {
        logger.info('Otom lang updated');
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("otomLangController: updateOtomLang - ERROR: OtomLang.updateOtomLang: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
  } catch (err) {
    logger.error("otomLangController: updateOtomLang - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

otomLangController.prototype.filterOtomLangs = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.lang = req.query.lang;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(OtomLang.filterOtomLangs(queryParams));
    tasks.push(OtomLang.countFilterOtomLangs(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, otomLangs: results[0], otomLangsCount: results[1]});
  } catch (err) {
    logger.error("otomLangController: filterOtomLangs - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

otomLangController.prototype.deleteOtomLang = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var otom_lang = yield OtomLang.getOtomLangDetails(id);
    if(!otom_lang){
    res.status(404).json({success: false, message: "Invalid otom_id"});
    return;
    }

    OtomLang.deleteOtomLang(id).then(result => {
        logger.info('Otom lang deleted');
        res.status(200).json({success: true}); 
    }).catch(err => {
        logger.error("otomLangController: deleteOtomLang - ERROR: OtomLang.deleteOtomLang: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });

  } catch (err) {
    logger.error("otomLangController: deleteOtomLang - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

module.exports = new otomLangController();