var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Orderstatus = require('./orderstatusModel.js');

var orderstatusController = function () {};

orderstatusController.prototype.addNewOrderstatus = bluebird.coroutine(function *(req, res) {
  try {
    var orderstatusData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.orderstatusSchema1);
    var valid = validate(orderstatusData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    //if it fails it will throw error
    let test = JSON.parse(orderstatusData.translations)

    orderstatusData.id = uuid.v1();

    var orderstatus = yield Orderstatus.getOrderstatusByName(orderstatusData.name);
    //console.log(product);    
    if (!orderstatus) {
      Orderstatus.createOrderstatus(orderstatusData).then((result) => {
          logger.info('Orderstatus created');
          logInitdataChange.write();
          res.status(200).json({"success": true, id: orderstatusData.id });
      }).catch((err) => {
        logger.error("orderstatusController: addNewOrderstatus - ERROR: Orderstatus.createOrderstatus: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "orderstatus_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("orderstatusController: addNewOrderstatus - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderstatusController.prototype.updateOrderstatus = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var {orderstatusData, newStatuses} = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.orderstatusSchema2);
    var valid = validate(orderstatusData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var orderstatus = yield Orderstatus.getOrderstatusDetails(id);
      if(!orderstatus){
        res.status(404).json({success: false, message: "Invalid orderstatus_id"});
        return;
      }
      var orderstatus1 = yield Orderstatus.getOrderstatusByName(orderstatusData.name);
      if(orderstatus1 && orderstatus1.id!=id){
        res.status(403).json({success: false, message: "orderstatus_exists"});
        return;
      }
      
      Orderstatus.updateOrderstatus(id, orderstatusData, newStatuses).then(result => {
        logger.info('Orderstatus updated');
        logInitdataChange.write();
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("orderstatusController: updateOrderstatus - ERROR: Orderstatus.updateOrderstatus: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
  } catch (err) {
    logger.error("orderstatusController: updateOrderstatus - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderstatusController.prototype.filterOrderstatuses = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Orderstatus.filterOrderstatuses(queryParams));
    tasks.push(Orderstatus.countFilterOrderstatuses(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, orderstatuses: results[0], orderstatusesCount: results[1]});
  } catch (err) {
    logger.error("orderstatusController: filterOrderstatus - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

orderstatusController.prototype.deleteOrderstatus = (req, res) => {
  try {
    var { id } = req.params;
    let {newStatuses} = req.body

    Orderstatus.deleteOrderstatus(id, newStatuses).then(result => {
      if(result!=0) { 
        logger.info('Orderstatus deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid orderstatus_id"});
      }
    }).catch(err => {
      logger.error("orderstatusController: deleteOrderstatus - ERROR: Orderstatus.deleteOrderstatus: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("orderstatusController: deleteOrderstatus - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new orderstatusController();