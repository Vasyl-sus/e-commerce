var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var moment = require('moment');

var infoBipService = require('../../utils/infoBipService');
var InfoBip = require('./infoBipModel')

var Ajv = require('ajv');
var ajv = new Ajv();
var validationSchema = require('../validationSchemas.js');


var infoBipController = function () {};

infoBipController.prototype.sendMessage = (req, res) => {
  try {
    let body_data = req.body;

    var validate = ajv.compile(validationSchema.infoBipMessage);
    var valid = validate(body_data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
    }

    infoBipService.sendSMSMessage(body_data, "/sms/2/text/single").then((result) => {
      res.status(200).json({success: true, data: result});
    }).catch(err => {
      logger.error("infoBipController: sendMessage: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: sendMessage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.getInfoBipScenarios = (req, res) => {
  try {
    let queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    InfoBip.getScenarios(queryParams).then((result) => {
      res.status(200).json({success: true, data: result});
    }).catch(err => {
      logger.error("infoBipController: getInfoBipScenarios: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: sendMessage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.deleteInfoBipScenario = (req, res) => {
  try {
    let id = req.params.id;

    InfoBip.deleteScenario(id).then((result) => {
      res.status(200).json({success: true, data: result});
    }).catch(err => {
      logger.error("infoBipController: deleteInfoBipScenario: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: sendMessage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.createOmniScenario = (req, res) => {
  try {
    let body_data = req.body;

    var validate = ajv.compile(validationSchema.infoBipOMNIScenario);
    var valid = validate(body_data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
    }

    infoBipService.sendRequest(body_data, "/omni/1/scenarios").then((result) => {
      result = JSON.parse(result)
      console.log(result)
      let infobipdata = {
        name: body_data.name,
        scenarioKey: result.key
      }
      InfoBip.addScenario(infobipdata).then((result1) => {
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("infoBipController: addScenario: try-catch - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
      });
      
    }).catch(err => {
      logger.error("infoBipController: createOmniScenario: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: createOmniScenario: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.sendOmniMessage = (req, res) => {
  try {
    let body_data = req.body;
    let query = req.query;

    let {name, ...excluded_data} = body_data;

    var validate = ajv.compile(validationSchema.infoBipOmniMessage);
    var valid = validate(excluded_data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
    }

    if (excluded_data.sendAt) {
      excluded_data.sendAt = new Date(excluded_data.sendAt).toUTCString();
    }
    
    infoBipService.sendRequest(excluded_data, "/omni/1/advanced").then((result) => {
      if (query.flag === "false") {
        let r = JSON.parse(result);
        if (!r.bulkId) {
          r.bulkId = uuid.v4();
        }
        InfoBip.addOmniBulk(r.bulkId, name).then((result1) => {
          res.status(200).json({success: true});
          return;
        }).catch(err => {
          logger.error("infoBipController: sendOmniMessage: try-catch - ERROR: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      } else {
        res.status(200).json({success: true, data: result});
      }
    }).catch(err => {
      console.log(err)
      logger.error("infoBipController: sendOmniMessage: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
      console.log(err)
    logger.error("infoBipController: sendOmniMessage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.sendSimpleOmniMessage = (req, res) => {
  try {
    let body_data = req.body;

    var validate = ajv.compile(validationSchema.infoBipSimpleOmniMessage);
    var valid = validate(body_data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
    }

    infoBipService.sendRequest(body_data, "/omni/1/text").then((result) => {
      res.status(200).json({success: true, data: result});
    }).catch(err => {
      logger.error("infoBipController: sendSimpleOmniMessage: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: sendSimpleOmniMessage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.checkOmniReports = (req, res) => {
  try {
    let url = ``;

    if(req.query.bulkId) {
      url += `bulkId=${req.query.bulkId}&`
    }
    if(req.query.messageId) {
      url += `messageId=${req.query.messageId}&`
    }
    if(req.query.limit) {
      url += `limit=${req.query.limit}&`
    }
    if(req.query.channel) {
      url += `channel=${req.query.channel}`
    }
    
    infoBipService.getOmniReport(`/omni/1/reports?${url}`).then((result) => {
      if (result.results && result.results.length > 0) {
        InfoBip.createReport(result.results).then(result1 => {
          InfoBip.getReport(result.results[0].bulkId).then(result2 => {
            res.status(200).json({success: true, data: result2});
          }).catch(err => {
            logger.error("infoBipController: getReport: try-catch - ERROR: "+err.message)
          res.status(500).json({success: false, message: err.message});
          })
        }).catch(err => {
          logger.error("infoBipController: checkOmniReports: try-catch - ERROR: "+err.message)
          res.status(500).json({success: false, message: err.message});
        })
      } else {
        let tasks = [];
        tasks.push(InfoBip.getReport(req.query.bulkId));
        // tasks.push(InfoBip.getReportData(req.query.bulkId));

        bluebird.all(tasks).then(result1 => {
          res.status(200).json({success: true, data: result1[0]});
        }).catch(err => {
          logger.error("infoBipController: checkOmniReports: try-catch - ERROR: "+err.message)
          res.status(500).json({success: false, message: err.message});
        })
      }
    }).catch(err => {
      logger.error("infoBipController: checkOmniReports: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    });

  } catch(err) {
    logger.error("infoBipController: checkOmniReports: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.getInfoBipCustomers = (req, res) => {
  try {
    let queryParams = {};

    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.country = req.query.country;
    queryParams.date_from = moment(new Date(parseInt(req.query.date_from))).format('YYYY-MM-DD');
    queryParams.date_to = moment(new Date(parseInt(req.query.date_to))).format('YYYY-MM-DD');
    queryParams.num_of_orders = req.query.num_of_orders
    let tasks = []

    tasks.push(InfoBip.getInfoBipCustomers(queryParams))
    tasks.push(InfoBip.countInfoBipCustomers(queryParams))

    bluebird.all(tasks).then(results => {
      res.status(200).json({success: true, data: {customers: results[0], customersCount: results[1]}});
    }).catch(err => {
      logger.error("infoBipController: getInfoBipCustomers: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    })
  } catch(err) {
    logger.error("infoBipController: getInfoBipCustomers: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

infoBipController.prototype.getInfoBipMessages = (req, res) => {
  try {
    let queryParams = {};

    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.date_from = moment(new Date(parseInt(req.query.date_from))).format('YYYY-MM-DD');
    queryParams.date_to = moment(new Date(parseInt(req.query.date_to))).format('YYYY-MM-DD');
    let tasks = []

    tasks.push(InfoBip.getInfoBipMessages(queryParams))
    tasks.push(InfoBip.countInfoBipMessages(queryParams))

    bluebird.all(tasks).then(results => {
      res.status(200).json({success: true, data: {messages: results[0], messagesCount: results[1]}});
    }).catch(err => {
      logger.error("infoBipController: getInfoBipMessages: try-catch - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
    })
  } catch(err) {
    logger.error("infoBipController: getInfoBipMessages: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
  }
}

module.exports = new infoBipController();