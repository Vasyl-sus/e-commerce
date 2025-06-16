var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Stockreminder = require('./stockreminderModel.js');

var stockreminderController = function () {};

stockreminderController.prototype.addNewStockreminder = bluebird.coroutine(function *(req, res) {
  try {
    var stockreminderData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.stockreminderSchema1);
    var valid = validate(stockreminderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    stockreminderData.id = uuid.v1();

    Stockreminder.createStockreminder(stockreminderData).then((result) => {
      logger.info('Stockreminder created');
      res.status(200).json({"success": true, id: stockreminderData.id });
    }).catch((err) => {
      logger.error("stockreminderController: addNewStockreminder - ERROR: Stockreminder.createStockreminder: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("stockreminderController: addNewStockreminder - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

stockreminderController.prototype.updateStockreminder = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var stockreminderData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.stockreminderSchema2);
    var valid = validate(stockreminderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    var stockreminder1 = yield Stockreminder.getStockreminderDetails(id);
    if(!stockreminder1){
      res.status(404).json({success: false, message: "Invalid stockreminder_id"});
      return;
    }

    var stockreminder = yield Stockreminder.getStockreminderByProductId(stockreminderData.product_id);
    if(stockreminder && stockreminder.id!=id){
      res.status(403).json({success: false, message: "stockreminder_exists"});
      return;
    }
    Stockreminder.updateStockreminder(id, stockreminderData).then(result => {
      logger.info('Stockreminder updated');
      res.status(200).json({"success": true});
    }).catch(err => {
      logger.error("stockreminderController: updateStockreminder - ERROR: Stockreminder.updateStockreminder: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("stockreminderController: updateStockreminder - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

stockreminderController.prototype.getStockreminders = bluebird.coroutine(function *(req, res) {
  try {
    var { product_id } = req.params;

    var tasks = [];
    tasks.push(Stockreminder.filterStockreminders(product_id));
    tasks.push(Stockreminder.countFilterStockreminders(product_id));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, stockreminders: results[0], stockremindersCount: results[1]});
  } catch (err) {
    logger.error("stockreminderController: getStockreminders - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

stockreminderController.prototype.deleteStockreminder = (req, res) => {
  try {
    var { id } = req.params;

    Stockreminder.deleteStockreminder(id).then(result => {
      if(result!=0) { 
        logger.info('Stockreminder deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid stockreminder_id"});
      }
    }).catch(err => {
      logger.error("stockreminderController: deleteStockreminder - ERROR: Stockreminder.deleteStockreminder: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("stockreminderController: deleteStockreminder - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new stockreminderController();