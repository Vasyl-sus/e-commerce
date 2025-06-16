var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Badge = require('./badgeModel.js');

var badgeController = function () {};

badgeController.prototype.addNewBadge = bluebird.coroutine(function *(req, res) {
  try {
    var badgeData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.badgeSchema1);
    var valid = validate(badgeData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    var badge = yield Badge.getBadgeByName(badgeData.name);
    //console.log(badge);    
    if (!badge) {
        Badge.createBadge(badgeData).then((result) => {
          logger.info('Badge created');
          logInitdataChange.write();
          res.status(200).json({success: true, id: result });
      }).catch((err) => {
        logger.error("badgeController: addNewBadge: Badge.createBadge - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "badge_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("badgeController: addNewBadge: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

badgeController.prototype.updateBadge = bluebird.coroutine(function * (req, res) {
  try {
    var { id } = req.params; 
    var badgeData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.badgeSchema2);
    var valid = validate(badgeData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
    var badge = yield Badge.getBadgeByName(badgeData.name);
    //console.log(badge);
    if(badge && badge.id!=id){
        res.status(403).json({success: false, message: "badge_exists"});
        return;
    }
    Badge.updateBadge(id, badgeData).then(result => {
      if(result!=0){
        logger.info('Badge updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false, message: "Invalid badge_id"});
      }
    }).catch(err => {
      logger.error("badgeController: updateBadge: Badge.updateBadge - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
  }
  } catch (err) {
    logger.error("badgeController: updateBadge: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

badgeController.prototype.filterBadges = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Badge.filterBadges(queryParams));
    tasks.push(Badge.countFilterBadges(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, badges: results[0], badgesCount: results[1]});
  } catch (err) {
    logger.error("badgeController: filterBadges: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

badgeController.prototype.deleteBadge = (req, res) => {
  try {
    var { id } = req.params;

    Badge.deleteBadge(id).then(result => {
      if(result!=0) {
        logger.info('Badge deleted');
        logInitdataChange.write();
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false , message:"Invalid badge_id"});
      }
    }).catch(err => {
      logger.error("badgeController: deleteBadge: Badge.deleteBadge - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("badgeController: deleteBadge: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new badgeController();