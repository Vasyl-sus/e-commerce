var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Country = require('../country/countryModel.js')
var Discount = require('./discountModel.js');

var discountController = function () {};

discountController.prototype.addNewDiscount = bluebird.coroutine(function *(req, res) {
  try {
    var discountData = req.body;

     //AJV validation
     var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
     var validate = ajv.compile(validationSchema.discountSchema1);
     var valid = validate(discountData);
     if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var countries = yield Country.getCountriesByNames(discountData.countries);
    if(!countries){
      res.status(404).json({success: false, message: "Invalid countries!"});
      return;
    }
    discountData.countries = countries.map(x => { return x.id; });

    var discount = yield Discount.getDiscountByName(discountData.name);

    //console.log(discount);
    if (!discount) {
      discountData.id = uuid.v1();
      Discount.createDiscount(discountData).then((result) => {
          logger.info('Discount created');
          logInitdataChange.write();
          res.status(200).json({"success": true, id: discountData.id });
      }).catch((err) => {
        logger.error("discountController: addNewDiscount - ERROR: Discount.createDiscount: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "discount_exists"});
      return;
    }

  } catch (err) {
    logger.error("discountController: addNewDiscount - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

discountController.prototype.updateDiscount = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var discountData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.discountSchema2);
    var valid = validate(discountData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var discount1 = yield Discount.getDiscountDetails2(id);
      if(!discount1){
        res.status(404).json({success: false, message: "Invalid discount_id"});
        return;
      }
      var discount = yield Discount.getDiscountByName(discountData.name);
      if(discount && discount.id!=id){
        res.status(403).json({success: false, message: "discount_exists"});
        return;
      }
      if(discountData.countries){
        var countries = yield Country.getCountriesByNames(discountData.countries);
        if(!countries){
          res.status(403).json({success: false, message: "Invalid countries!"});
          return;
        }
        discountData.countries = countries.map(x => { return x.id; });
      }

      Discount.updateDiscount(id, discountData).then(result => {
        logger.info('Discount updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("discountController: updateDiscount - ERROR: Discount.updateDiscount: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }

  } catch (err) {
    logger.error("discountController: updateDiscount - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

discountController.prototype.filterDiscounts = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.active = req.query.active;
    queryParams.search = req.query.search;
    queryParams.type = req.query.type;
    queryParams.country = req.query.country;

    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.isAdditionalDiscount = req.query.isAdditionalDiscount;

    var tasks = [];
    tasks.push(Discount.filterDiscounts(queryParams))
    tasks.push(Discount.countFilterDiscounts(queryParams))

    var results = yield bluebird.all(tasks)
    res.status(200).json({"success": true, discounts: results[0], discountsCount: results[1]});
  } catch (err) {
    logger.error("discountController: filterDiscounts - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

discountController.prototype.getDiscountDetails = bluebird.coroutine(function *(req, res) {
  try {
    let id = req.params.id;
    let queryParams = {};
    queryParams.pageNumberOrders = (req.query.pageNumberOrders && parseInt(req.query.pageNumberOrders)) || 1;
    queryParams.pageLimitOrders = (req.query.pageLimitOrders && parseInt(req.query.pageLimitOrders)) || 10;
    queryParams.status = req.query.status;
    queryParams.date_from = req.query.date_from;
    queryParams.date_to = req.query.date_to;

    let discount = yield Discount.getDiscountDetailsV2(id, queryParams);


    res.status(200).json({"success": true, discount});
  } catch (err) {
    logger.error("discountController: getDiscountDetails - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

discountController.prototype.deleteDiscount = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var discount = yield Discount.getDiscountDetails2(id);
    if(!discount){
      res.status(404).json({success: false, message: "Invalid discount_id"});
      return;
    }

    Discount.deleteDiscount(id).then(result => {
      logger.info('Discount deleted');
      logInitdataChange.write();
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("discountController: deleteDiscount - ERROR: Discount.deleteDiscount: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("discountController: deleteDiscount - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

discountController.prototype.deleteDiscount1 = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var discountData = { active: 0 };

    var discount = yield Discount.getDiscountDetails2(id);
    if(!discount){
      res.status(404).json({success: false, message: "Invalid discount_id"});
      return;
    }

    Discount.updateDiscount(id, discountData).then(result => {
      logger.info('Discount deactivated');
      logInitdataChange.write();
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("discountController: deleteDiscount1 - ERROR: Discount.updateDiscount: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("discountController: deleteDiscount1 - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

discountController.prototype.getDiscountByName = bluebird.coroutine(function *(req, res) {
  try {
    var discountcode = req.body.discountcode;
    var country = req.body.country;

    Discount.getFullDiscountByName(discountcode, country).then(result => {
      if(result){
        res.status(200).json({success: true, discount: result});
      } else {
        res.status(404).json({success: false, message: "Discount not found!"});
      }
    }).catch(err => {
      logger.error("discountController: getDiscountByName - ERROR: Discount.getFullDiscountByName: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("discountController: getDiscountByName - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new discountController();
