var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Smstemplate = require('./smstemplateModel.js');

var smstemplateController = function () {};

smstemplateController.prototype.addNewSmstemplate = bluebird.coroutine(function *(req, res) {
  try {
    var smstemplateData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.smstemplateSchema1);
    var valid = validate(smstemplateData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    //var smstemplate = yield Smstemplate.getSmstemplateByName(smstemplateData.name);
    //console.log(smstemplate);    
    
      Smstemplate.createSmstemplate(smstemplateData).then((result) => {
          logger.info('Smstemplate created');
          res.status(200).json({"success": true, id: result });
      }).catch((err) => {
        logger.error("smstemplateController: addNewSmstemplate - ERROR: Smstemplate.createSmstemplate: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    
  } catch (err) {
    logger.error("smstemplateController: addNewSmstemplate - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

smstemplateController.prototype.updateSmstemplate = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var smstemplateData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.smstemplateSchema2);
    var valid = validate(smstemplateData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Smstemplate.updateSmstemplate(id, smstemplateData).then(result => {
      if(result!=0){
        logger.info('Smstemplate updated');
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({success: false, message: "Invalid smstemplate_id"});
      }
    }).catch(err => {
      logger.error("smstemplateController: updateSmstemplate - ERROR: Smstemplate.updateSmstemplate: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("smstemplateController: updateSmstemplate - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

smstemplateController.prototype.filterSmstemplates = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Smstemplate.filterSmstemplates(queryParams));
    tasks.push(Smstemplate.countFilterSmstemplates(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, smstemplates: results[0], smstemplatesCount: results[1]});
  } catch (err) {
    logger.error("smstemplateController: filterSmstemplates - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

smstemplateController.prototype.deleteSmstemplate = (req, res) => {
  try {
    var { id } = req.params;

    Smstemplate.deleteSmstemplate(id).then(result => {
      if(result!=0) { 
        logger.info('Smstemplate deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid smstemplate_id"});
      }
    }).catch(err => {
      logger.error("smstemplateController: deleteSmstemplate - ERROR: Smstemplate.deleteSmstemplate: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("smstemplateController: deleteSmstemplate - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new smstemplateController();