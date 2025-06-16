var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Currency = require('./currencyModel.js');

var currencyController = function () {};

currencyController.prototype.addNewCurrency = bluebird.coroutine(function *(req, res) {
  try {
    var currencyData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.currencySchema1);
    var valid = validate(currencyData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    var currency = yield Currency.getCurrencyByName(currencyData.name);
    //console.log(currency);    
    if (!currency) {
        Currency.createCurrency(currencyData).then((result) => {
          logger.info('Currency created');
          logInitdataChange.write();
          res.status(200).json({success: true, id: result });
      }).catch((err) => {
        logger.error("currencyController: addNewCurrency - ERROR: Currency.createCurrency: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "currency_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("currencyController: addNewCurrency - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

currencyController.prototype.updateCurrency = bluebird.coroutine(function * (req, res) {
  try {
    var { id } = req.params; 
    var currencyData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.currencySchema2);
    var valid = validate(currencyData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var currency = yield Currency.getCurrencyByName(currencyData.name);
      //console.log(currency);
      if(currency && currency.id!=id){
          res.status(403).json({success: false, message: "currency_exists"});
          return;
      }
      Currency.updateCurrency(id, currencyData).then(result => {
        if(result!=0){
          logger.info('Currency updated');
          logInitdataChange.write();
          res.status(200).json({success: true});
        } else {
          res.status(404).json({success: false, message: "Invalid currency_id"});
        }
      }).catch(err => {
        logger.error("currencyController: updateCurrency - ERROR: Currency.updateCurrency: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
  } catch (err) {
    logger.error("currencyController: updateCurrency - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

currencyController.prototype.filterCurrencies = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Currency.filterCurrencies(queryParams));
    tasks.push(Currency.countFilterCurrencies(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, currencies: results[0], currenciesCount: results[1]});
  } catch (err) {
    logger.error("currencyController: filterCurrencies - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

currencyController.prototype.deleteCurrency = (req, res) => {
  try {
    var { id } = req.params;

    Currency.deleteCurrency(id).then(result => {
      if(result!=0) {
        logger.info('Currency deleted');
        logInitdataChange.write();
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false , message:"Invalid currency_id"});
      }
    }).catch(err => {
      logger.error("currencyController: deleteCurrency - ERROR: Currency.deleteCurrency: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("currencyController: deleteCurrency - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new currencyController();