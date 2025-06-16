var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Settings = require('./settingsModel');

var settingsController = function () {};

settingsController.prototype.getSettings = bluebird.coroutine(function *(req, res) {
  try {
    Settings.getSettings().then(settings => {
        res.status(200).json({success: true, settings});
        return;
    }).catch(err => {
        logger.error("settingsController: getSettings - ERROR: Settings.getSettings: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });
  } catch (err) {
    logger.error("settingsController: getSettings - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

settingsController.prototype.editSettings = bluebird.coroutine(function *(req, res) {
  try {
    var settingsData = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.settingsSchema);
    var valid = validate(settingsData);
    if (!valid) {
      console.log(validate.errors)
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Settings.getSettings().then(settings => {
        try{
            var updated_settings = JSON.stringify(Object.assign(settings, settingsData));
        } catch(ex){
            logger.error("settingsController: editSettings - ERROR: updated_settings: "+ex.message)
            res.status(500).json({success: false, message: "editSettings: JSON.stringify/Object.assign: " + err.message});
            return; 
        }

        Settings.editSettings(updated_settings).then(result => {
            res.status(200).json({success: true});
            return;
        }).catch(err => {
            logger.error("settingsController: editSettings - ERROR: Settings.editSettings: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
        });
    }).catch(err => {
        logger.error("settingsController: editSettings - ERROR: Settings.getSettings: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });
  } catch (err) {
    logger.error("settingsController: editSettings - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


module.exports = new settingsController();