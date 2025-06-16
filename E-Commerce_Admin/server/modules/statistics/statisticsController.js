var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var statisticsSchema = require('./statisticsValidation.js');

var Statistics = require('./statisticsModel.js');
var Status = require('../orderstatus/orderstatusModel');

var statisticsController = function () {};


statisticsController.prototype.addExpense = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.expenses_visits_schema);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
      Statistics.addExpense(statisticsData).then((result) => {
          logger.info('Expense added');
          res.status(200).json({"success": true, "id": result });
          return;
      }).catch((err) => {
        logger.error("statisticsController: addExpense - ERROR: Statistics.addExpense: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    
  } catch (err) {
    logger.error("statisticsController: addExpense - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.addVisit = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.expenses_visits_schema);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
      Statistics.addVisit(statisticsData).then((result) => {
          logger.info('Visit added');
          res.status(200).json({"success": true, "id": result });
          return;
      }).catch((err) => {
        logger.error("statisticsController: addVisit - ERROR: Statistics.addVisit: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    
  } catch (err) {
    logger.error("statisticsController: addVisit - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.ordersIncomeStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;
    var ajv = new Ajv();
    
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.orders_income_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.ordersIncomeStatistics(statisticsData).then((result) => {
          logger.info('Statistics created');
          res.status(200).json({"success": true, "orderStatistics": result });
          return;
      }).catch((err) => {
        logger.error("statisticsController: ordersIncomeStatistics - ERROR: Statistics.ordersIncomeStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });

    } else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.orders_income_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.ordersIncomeStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: ordersIncomeStatistics - ERROR: Statistics.ordersIncomeStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }  
  } catch (err) {
    logger.error("statisticsController: ordersIncomeStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

statisticsController.prototype.ordersCountStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.orders_income_schema1);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    Statistics.ordersCountStatistics(statisticsData).then((result) => {
      logger.info('Statistics created');
      res.status(200).json({"success": true, "orderStatistics": result });
      return;
    }).catch((err) => {
      logger.error("statisticsController: ordersCountStatistics - ERROR: Statistics.ordersCountStatistics: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("statisticsController: ordersCountStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.productsCountStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;
    
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.products_count_schema);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Statistics.productsCountStatistics(statisticsData).then((result) => {
      logger.info('Statistics created');
      res.status(200).json({"success": true, "orderStatistics": result });
      return;
    }).catch((err) => {
      logger.error("statisticsController: productsCountStatistics - ERROR: Statistics.productsCountStatistics: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("statisticsController: productsCountStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

statisticsController.prototype.utmStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;
    
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.utm_statistics_schema);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Statistics.utmStatistics(statisticsData).then((result) => {
      logger.info('Statistics created');
      res.status(200).json({"success": true, "orderStatistics": result });
      return;
    }).catch((err) => {
      logger.error("statisticsController: utmStatistics - ERROR: Statistics.utmStatistics: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("statisticsController: utmStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.discountsUsageStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.body;
    
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsSchema.orders_income_schema1);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Statistics.discountsUsageStatistics(statisticsData).then((result) => {
      logger.info('Statistics created');
      res.status(200).json({"success": true, "orderStatistics": result });
      return;
    }).catch((err) => {
      logger.error("statisticsController: discountsUsageStatistics - ERROR: Statistics.discountsUsageStatistics: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("statisticsController: discountsUsageStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.ordersVisitorsRateStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;   
    var ajv = new Ajv();
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.orders_visitors_rate_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      Statistics.ordersVisitorsRateStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: ordersVisitorsRateStatistics - ERROR: Statistics.ordersVisitorsRateStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.orders_visitors_rate_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      Statistics.ordersVisitorsRateStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: ordersVisitorsRateStatistics - ERROR: Statistics.ordersVisitorsRateStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    
  } catch (err) {
    logger.error("statisticsController: ordersVisitorsRateStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.vccStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;
    var ajv = new Ajv();
    
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.vcc_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.vccStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({success: true, orderStatistics: result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: vccStatistics - ERROR: Statistics.vccStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.orders_upsale_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.ordersUpsaleStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: vccStatistics - ERROR: Statistics.ordersUpsaleStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }  

  } catch (err) {
    logger.error("statisticsController: vccStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.ordersUpsaleStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;
    var ajv = new Ajv();
    
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.orders_upsale_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.ordersUpsaleStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: ordersUpsaleStatistics - ERROR: Statistics.ordersUpsaleStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.orders_upsale_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.ordersUpsaleStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: ordersUpsaleStatistics - ERROR: Statistics.ordersUpsaleStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }  

  } catch (err) {
    logger.error("statisticsController: ordersUpsaleStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.callCenterCountStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;   
    var ajv = new Ajv();
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.call_center_count_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterCountStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterCountStatistics - ERROR: Statistics.callCenterCountStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.call_center_count_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterCountStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterCountStatistics - ERROR: Statistics.callCenterCountStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    
  } catch (err) {
    logger.error("statisticsController: callCenterCountStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.callCenterProductsStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;  
    var ajv = new Ajv(); 
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.call_center_products_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterProductsStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterProductsStatistics - ERROR: Statistics.callCenterProductsStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.call_center_products_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterProductsStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterProductsStatistics - ERROR: Statistics.callCenterProductsStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    
  } catch (err) {
    logger.error("statisticsController: callCenterProductsStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.callCenterIncomeStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;
    var ajv = new Ajv();   
    if(statisticsData.opt!="year"){
      var validate = ajv.compile(statisticsSchema.call_center_count_schema1);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterIncomeStatistics(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterIncomeStatistics - ERROR: Statistics.callCenterIncomeStatistics: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else if(statisticsData.opt=="year"){
      var validate = ajv.compile(statisticsSchema.call_center_count_schema2);
      var valid = validate(statisticsData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      Statistics.callCenterIncomeStatisticsYear(statisticsData).then((result) => {
        logger.info('Statistics created');
        res.status(200).json({"success": true, "orderStatistics": result });
        return;
      }).catch((err) => {
        logger.error("statisticsController: callCenterIncomeStatistics - ERROR: Statistics.callCenterIncomeStatisticsYear: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
    
  } catch (err) {
    logger.error("statisticsController: callCenterIncomeStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.agentStatistics = bluebird.coroutine(function *(req, res) {
  try {
    var statisticsData = req.query;
    var ajv = new Ajv();   
    var validate = ajv.compile(statisticsSchema.agent_statistics_schema);
    var valid = validate(statisticsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    let isStorno = yield Status.checkStornoStatus(statisticsData.orderStatuses);
    
    Statistics.agentStatistics(statisticsData, isStorno).then((result) => {
      logger.info('Statistics created');
      res.status(200).json({success: true, result });
      return;
    }).catch((err) => {
      logger.error("statisticsController: agentStatistics - ERROR: Statistics.agentStatistics: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("statisticsController: agentStatistics - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


statisticsController.prototype.filterAgentOrders = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.orderStatuses = req.query.orderStatuses;
    queryParams.countries = req.query.countries;
    queryParams.fromDate = req.query.fromDate;
    queryParams.toDate = req.query.toDate;
    queryParams.agent_id = req.query.agent_id;
    queryParams.order_type = req.query.order_type;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    if(queryParams.from_date)
      queryParams.from_date=parseInt(queryParams.from_date);
    if(queryParams.to_date)
      queryParams.to_date=parseInt(queryParams.to_date);

    var tasks = [];
    tasks.push(Statistics.filterAgentOrders(queryParams))
    tasks.push(Statistics.countFilterAgentOrders(queryParams))

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, "orders": results[0], "ordersCount": results[1]});
    return;
  } catch (err) {
    logger.error("statisticsController: filterAgentOrders - ERROR: try-catch: "+err.message);
    res.status(500).json({"success": false, "message": err.message});
    return;
  }
})

module.exports = new statisticsController();