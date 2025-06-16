var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Utmmedium = require('./utmmediumModel.js');

var utmmediumController = function () {};

utmmediumController.prototype.addNewUtmmedium = bluebird.coroutine(function *(req, res) {
  try {
    var utmmediumData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.utmmediumSchema);
    var valid = validate(utmmediumData);
    if (!valid) {
      logger.error("utmmediumController: addNewUtmmedium - ERROR: validationSchema.utmmediumSchema: "+err.message);
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var utmmedium = yield Utmmedium.getUtmmediumByName(utmmediumData.name);
    //console.log(utmmedium);    
    if (!utmmedium) {
      Utmmedium.createUtmmedium(utmmediumData).then((result) => {
          logger.info('Utmmedium created');
          logInitdataChange.write();
          res.status(200).json({"success": true, id: result });
      }).catch((err) => {
        logger.error("utmmediumController: addNewUtmmedium - ERROR: Utmmedium.createUtmmedium: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "utmmedium_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("utmmediumController: addNewUtmmedium - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

utmmediumController.prototype.updateUtmmedium = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var utmmediumData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.utmmediumSchema);
    var valid = validate(utmmediumData);
    if (!valid) {
      logger.error("utmmediumController: updateUtmmedium - ERROR: validationSchema.utmmediumSchema: "+err.message);
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var utm = yield Utmmedium.getUtmmediumByName(utmmediumData.name);
      if(utm && utm.id!=id){
        res.status(403).json({success: false, message: "utmmedium_exists"});
        return;
      }
      Utmmedium.updateUtmmedium(id, utmmediumData).then(result => {
        if(result!=0){
          logger.info('Utmmedium updated');
          logInitdataChange.write();
          res.status(200).json({"success": true});
        } else {
          res.status(404).json({success: false, message: "Invalid utmmedium_id"});
        }
      }).catch(err => {
        logger.error("utmmediumController: updateUtmmedium - ERROR: Utmmedium.updateUtmmedium: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
  } catch (err) {
    logger.error("utmmediumController: updateUtmmedium - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

utmmediumController.prototype.filterUtmmedia = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Utmmedium.filterUtmmedia(queryParams));
    tasks.push(Utmmedium.countFilterUtmmedia(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, utmmedia: results[0], utmmediaCount: results[1]});
  } catch (err) {
    logger.error("utmmediumController: filterUtmmedia - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

utmmediumController.prototype.deleteUtmmedium = (req, res) => {
  try {
    var { id } = req.params;

    Utmmedium.deleteUtmmedium(id).then(result => {
      if(result!=0) { 
        logger.info('Utmmedium deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid utmmedium_id"});
      }
    }).catch(err => {
      logger.error("utmmediumController: deleteUtmmedium - ERROR: Utmmedium.deleteUtmmedium: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("utmmediumController: deleteUtmmedium - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new utmmediumController();