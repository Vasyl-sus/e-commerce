var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Gift = require('./giftModel.js');

var giftController = function () {};

giftController.prototype.addNewGift = bluebird.coroutine(function *(req, res) {
  try {
    var giftData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.giftSchema1);
    var valid = validate(giftData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    var gift = yield Gift.getGiftByDisplayNameCountryLang(giftData.display_name, giftData.country, giftData.lang);
    if(gift){
        res.status(403).json({success: false, message: "Gift display name already exists for specified country and lang."});
        return; 
    }
    
    //console.log(gift);    
    
    Gift.createGift(giftData).then((result) => {
      logger.info('Gift created');
      logInitdataChange.write();
      res.status(200).json({"success": true, id: result });
    }).catch((err) => {
      logger.error("giftController: addNewGift - ERROR: Gift.createGift: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("giftController: addNewGift - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

giftController.prototype.addNewGiftConfigurator = bluebird.coroutine(function *(req, res) {
  try {
    var giftData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.giftConfigSchema1);
    var valid = validate(giftData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    } 
    
    Gift.createGiftConfigurator(giftData).then((result) => {
      logger.info('Gift config. created');
      res.status(200).json({"success": true, id: result });
    }).catch((err) => {
      logger.error("giftController: addNewGiftConfig - ERROR: Gift.createGift: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("giftController: addNewGiftConfig - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

giftController.prototype.updateGift = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var giftData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.giftSchema2);
    var valid = validate(giftData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    if(giftData.display_name && giftData.country && giftData.lang) {
      var gift = yield Gift.getGiftByDisplayNameCountryLang(giftData.display_name, giftData.country, giftData.lang);
      if(gift && gift.id != id){
          res.status(403).json({success: false, message: "Gift display name already exists for specified country and lang."});
          return; 
      }
    }
    

    Gift.updateGift(id, giftData).then(result => {
      if(result!=0){
        logger.info('Gift updated');
        logInitdataChange.write();
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({success: false, message: "Invalid gift_id"});
      }
    }).catch(err => {
      logger.error("giftController: updateGift - ERROR: Gift.updateGift: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("giftController: updateGift - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

giftController.prototype.updateGiftConfigurator = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var giftData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.giftConfigSchema2);
    var valid = validate(giftData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Gift.updateGiftConfigurator(id, giftData).then(result => {
      if(result!=0){
        logger.info('Gift config updated');
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({success: false, message: "Invalid gift_id"});
      }
    }).catch(err => {
      logger.error("giftController: updateGiftConfig - ERROR: Gift.updateGift: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("giftController: updateGiftConfig - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

giftController.prototype.filterGifts = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.active = req.query.active;
    queryParams.country = req.query.country;
    queryParams.lang = req.query.lang;

    var tasks = [];
    tasks.push(Gift.filterGifts(queryParams));
    tasks.push(Gift.countFilterGifts(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, gifts: results[0], giftsCount: results[1]});
  } catch (err) {
    logger.error("giftController: filterGifts - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

giftController.prototype.filterGiftsConfigurator = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.country = req.query.country;

    var tasks = [];
    tasks.push(Gift.filterGiftsConfigurator(queryParams));
    tasks.push(Gift.countFilterGiftsConfigurator(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, gifts: results[0], giftsCount: results[1]});
  } catch (err) {
    logger.error("giftController: filterGiftsConfigurator - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

giftController.prototype.deleteGift = (req, res) => {
  try {
    var { id } = req.params;

    Gift.deleteGift(id).then(result => {
      if(result!=0) { 
        logger.info('Gift deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid gift_id"});
      }
    }).catch(err => {
      logger.error("giftController: deleteGift - ERROR: Gift.deleteGift: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("giftController: deleteGift - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

giftController.prototype.deleteGiftConfigurator = (req, res) => {
  try {
    var { id } = req.params;

    Gift.deleteGiftConfigurator(id).then(result => {
      if(result!=0) { 
        logger.info('Gift configurator deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid gift_id"});
      }
    }).catch(err => {
      logger.error("giftController: deleteGiftConfigurator - ERROR: Gift.deleteGiftConfigurator: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("giftController: deleteGiftConfigurator - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new giftController();