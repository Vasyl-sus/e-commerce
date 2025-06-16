var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');

var uuid = require('uuid');
var Ajv = require('ajv');
var logger = require('../../utils/logger');
var validationSchema = require('../validationSchemas.js');
var Orderstatus = require('../orderstatus/orderstatusModel')
var Order = require('../order/orderModel')
var Influencer = require('./influencersModel');
var Admin = require('../admin/adminModel');

var influencersController = function () {}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

influencersController.prototype.addNewInfluencer = (req, res) => {

  try {
    var influencerData = req.body;

    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'influencers');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      //AJV validation
      var ajv = new Ajv();
      var validate = ajv.compile(validationSchema.influencerSchema1);
      var valid = validate(influencerData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      influencerData.email = influencerData.email.toLowerCase();
      influencerData.profile_image = uploaded_files[0] && uploaded_files[0].link || ""

      var influencer = yield Influencer.getInfluencerByEmail(influencerData.email);

      if (!influencer) {
        influencerData.id = uuid.v1();
        Influencer.createInfluencer(influencerData).then((result) => {
          logger.info('Influencer created');
          res.status(200).json({success: true});
          return;
        }).catch((err) => {
          logger.error("influencerController: registerNewInfluencer - ERROR: Customer.createCustomer: "+err)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      } else {
        res.status(403).json({success: false, message: "influencer_exists"});
        return;
      }
    }));

  } catch (err) {
    logger.error("influencerController: registerNewInfluencer - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }

}

influencersController.prototype.addInfluencerOrder = bluebird.coroutine(function *(req, res) {
  try {
    var orderData = req.body;
    let id = req.params.id;
    orderData.customer_id = id;
     //AJV validation
     var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
     var validate = ajv.compile(validationSchema.orderInfluencersSchema);
     var valid = validate(orderData);
     if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var adminData = req.admin;

    var tasks = [];
    tasks.push(Orderstatus.getOrderstatusByName('Odobreno'));
    tasks.push(Influencer.getInfluencer(id));
    var results = yield bluebird.all(tasks);

    var influencer = results[1];
    if(!influencer){
      res.status(403).json({success: false, message: "Invalid customer_id!"});
      return;
    }
    var orderstatus = results[0];
    if(orderstatus){
      orderData.order_status = orderstatus.id;
      orderData.influencer_id = influencer.id;
      orderData.id = uuid.v1();
      orderData.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      orderData.responsible_agent_id = adminData.id;
      orderData.responsible_agent_username = adminData.username;

      if(orderData.additional_discount_data && orderData.additional_discount){
        orderData.additional_discount_data.id = uuid.v1();
        orderData.additional_discount_data.name = "add_" + makeid();
        orderData.additional_discount_id = orderData.additional_discount_data.id;
      }

      var orderhistory = {
        order_id: orderData.id,
        responsible_agent_id: adminData.id,
        isInitialState: 1,
        data: JSON.stringify(orderData)
      };
      orderData.orderhistory = orderhistory;

      if (orderData.lang === "SI") {
        orderData.lang = "SL"
      }

      Order.createOrder(orderData, influencer).then( async (result) => {;
        logger.info('Influencer order created');
        var DDV = await Order.getCountryDDV(orderData.id);
        res.status(200).json({success: true, data: {id: orderData.id, ddv: DDV, order_id2: result}});

      }).catch((err) => {
        console.log(err)
        logger.error("influencersController: addNewOrder - ERROR: Order.influencersController: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      logger.error("influencersController: addNewOrder - ERROR: else: Missing orderstatus Neobdelano!");
      res.status(404).json({success: false, message: "Missing orderstatus: Neobdelano"});
      return;
    }

  } catch (err) {
    console.log(err)
    logger.error("orderController: addNewOrder - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

influencersController.prototype.filterInfluencers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.type = req.query.type;
    queryParams.search = req.query.search;
    queryParams.payment_type = req.query.payment_type;
    queryParams.state = req.query.state;

    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Influencer.filterInfluencers(queryParams));
    tasks.push(Influencer.countFilterInfluencers(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, influencers: results[0], influencersCount: results[1]});
  } catch (err) {
    logger.error("influencersController: filterInfluencers - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

influencersController.prototype.getInfluencerDetails = function (req, res) {
  try {
    let id = req.params.id

    var tasks = [];

    tasks.push(Influencer.getInfluencer(id));
    tasks.push(Influencer.getInfluencerPayments(id));
    tasks.push(Influencer.getInfluencerOrders(id));

    bluebird.all(tasks).then(function(result) {
      res.status(200).json({success: true, influencer: result[0], payments: result[1]});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: getInfluencerDetails - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.addInfluencerPayment = function (req, res) {
  try {
    let id = req.params.id;
    let data = req.body;

    var ajv = new Ajv();
    var validate = ajv.compile(validationSchema.influencerPaymentSchema1);
    var valid = validate(data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    data.influencer_id = id;
    Influencer.addInfluencerPayment(data).then(function(result) {
      res.status(200).json({success: true});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: addInfluencerPayment - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.getInfluencerPayments = function (req, res) {
  try {
    let id = req.params.id

    Influencer.getInfluencerPayments(id).then(function(result) {
      res.status(200).json({success: true, payments: result});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: getInfluencerPayments - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.getInfluencerOrders = function (req, res) {
  try {
    let id = req.params.id

    Influencer.getInfluencerOrders(id).then(function(result) {
      res.status(200).json({success: true, payments: result});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: getInfluencerOrders - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.editInfluencerPayment = function (req, res) {
  try {
    let id = req.params.id;
    let data = req.body;

    var ajv = new Ajv();
    var validate = ajv.compile(validationSchema.influencerPaymentSchema2);
    var valid = validate(data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    data.influencer_id = id;
    Influencer.editInfluencerPayment(data).then(function(result) {
      res.status(200).json({success: true});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: editInfluencerPayment - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.deleteInfluencerPayment = function (req, res) {
  try {
    let id = req.params.id;
    if(isNaN(id))
      throw new Error('invalid_id')

    Influencer.deleteInfluencerPayment(id).then(function(result) {
      res.status(200).json({success: true});
    }).catch(function (err) {
      res.status(500).json({success: false, message: err.message});
    })

  } catch (err) {
    logger.error("influencersController: deleteInfluencerPayment - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

influencersController.prototype.deleteInfluencer = bluebird.coroutine(function *(req, res) {
  try {
    let id = req.params.id

    var influencer = yield Influencer.getInfluencerDetails(id);
    if(!influencer){
      res.status(404).json({success: false, message: "Invalid influencer_id"});
      return;
    }

    Influencer.deleteInfluencer(id).then(function (result) {
      res.status(200).json({success: true});
      return;
    }).catch(function(err) {
      res.status(500).json({success: false, message: err.message});
      return;
    })
  } catch (err) {
    logger.error("influencersController: filterInfluencers - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})


influencersController.prototype.editInfluencer = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var influencerData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'influencers');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      k++;
    }
    if (promises.length > 0) {
      Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

        //AJV validation
        var ajv = new Ajv();
        var validate = ajv.compile(validationSchema.influencerSchema2);
        var valid = validate(influencerData);
        if (!valid) {
          res.status(400).json({success: false, message: validate.errors});
          return;
        }

        var influencer = yield Influencer.getInfluencerDetails(id);
        if(!influencer){
          res.status(404).json({success: false, message: "Invalid influencer_id"});
          return;
        }

        influencerData.profile_image = uploaded_files[0] && uploaded_files[0].link || "";

        Influencer.editInfluencer(id, influencerData).then(result => {
          logger.info('Influencer updated');
          res.status(200).json({"success": true});
        }).catch(err => {
          logger.error("influencersController: updateInfluencer - ERROR: influencersController.updateInfluencer: "+err)
          res.status(500).json({success: false, message: err.message});
          return;
        });

      }));
    } else {
      var ajv = new Ajv();
      var validate = ajv.compile(validationSchema.influencerSchema2);
      var valid = validate(influencerData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var influencer = yield Influencer.getInfluencerDetails(id);
      if(!influencer){
        res.status(404).json({success: false, message: "Invalid influencer_id"});
        return;
      }

      Influencer.editInfluencer(id, influencerData).then(result => {
        logger.info('Influencer updated');
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("influencersController: updateInfluencer - ERROR: influencersController.updateInfluencer: "+err)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }

  } catch (err) {
    logger.error("influencersController: updateInfluencer - ERROR: try-catch: "+err)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


module.exports = new influencersController();
