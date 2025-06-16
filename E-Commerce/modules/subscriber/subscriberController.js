var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var bluebird = require('bluebird');
var Ajv = require('ajv');
var mailingService = require('../../utils/mailingService.js')
var mailchimpService = require('../../utils/mailchimpService.js')
//mailchimpService = bluebird.promisifyAll(mailchimpService);
var SocketService = require('../../utils/socket.js')
var infoBipService = require("../../utils/infoBipService")

var Subscriber = require('./subscriberModel.js');
const klaviyoService = require('../../utils/klaviyoService.js');


var subscriberController = function () {};

subscriberController.prototype.createSubscription = bluebird.coroutine(function *(req, res) {
  try {
    var subscriberData = req.body;

     //AJV validation
    var subscriberSchema = {
        "title": "subscriber",
        "type": "object",
        "properties": {
            "email": { "type": "string", "format": "email" }
        },
        "required": [
            "email"
        ]
    }
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(subscriberSchema);
    var valid = validate(subscriberData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    subscriberData.email=subscriberData.email.toLowerCase();

    var merge_fields = {
      DRZAVA: req.session.country,
      JEZIK: req.session.lang
    };

    var countryCode = req.session.country

  klaviyoService.addSubscriberToList(subscriberData.email,countryCode).then(result => {
      console.log("Subscription created");
      res.status(200).json({data: {success: true, message: result.message || "Subscription successful"}});
      return;
    }).catch(err => {
      logger.error("subscriberController: createSubscription - ERROR: klaviyoService.addSubscriberToList: " + err.message);
      res.status(500).json({data: {success: false, message: err.message}});
      return;
    });
  } catch (err) {
    logger.error("subscriberController: createSubscription - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

subscriberController.prototype.unsubscribeInfoBip = (req, res) => {
  try {
    var telephone = req.body.telephone;

    if (!telephone) {
      res.status(500).json({success: false, message: 'missing_data'});
      return;
    }

    infoBipService.updateOmniPerson({telephone}).then(result => {
      console.log("result",result)
      if (result.errorCode === 40401) {
        res.status(400).json({success: false});
      } else {
        res.status(200).json({success: true});
      }
      return;
    }).catch(error => {
      console.log(error)
    })

  } catch (err) {
    logger.error("subscriberController: verifyReCaptchaToken - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

subscriberController.prototype.verifyReCaptchaToken = async (req, res) => {
  try {
    const data = req.body;

    if (!data.response) {
      res.status(500).json({ success: false, message: 'missing_data' });
      return;
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        response: data.response,
        secret: config.recaptcha.secret
      })
    });

    const body = await response.json();

    if (body.success) {
      req.session.recaptchaSuccess = true;
      res.status(200).json({ success: true, data: body });
    } else {
      res.status(500).json({ success: false });
    }

  } catch (err) {
    logger.error("subscriberController: verifyReCaptchaToken - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

subscriberController.prototype.getWebhook = (req, res) => {
  try {
    // Initialize session values if they don't exist
    if (!req.session.lang) {
      req.session.lang = 'SL';
    }
    if (!req.session.country) {
      req.session.country = 'SI';
    }
    
    var data = {
      display_order_id: req.body.client_data.order_id || "",
      direction: req.body.direction || "",
      source: req.body.source || "",
      destination: req.body.destination || "",
      disposition_type: "call",
      disposition_name: req.body.disposition.name || "",
      disposition_assesment: req.body.disposition.assesment || "",
      disposition_status: req.body.disposition.status || "",
      disposition_description: req.body.disposition.description || "",
      disposition_label: req.body.disposition.label || "",
      disposition_id: req.body.disposition.id || "",
      disposition_callback: req.body.disposition.callback || "",
      next_calldate: req.body.next_calldate || "",
      create_time: req.body.create_time || "",
      client_data: JSON.stringify(req.body.client_data)
    };
    // Ensure order_id is a valid integer or null
    let order_id = req.body.client_data && req.body.client_data.order_id || null;
    // If order_id is a space or empty string, set it to null
    if (order_id === ' ' || order_id === '') {
      order_id = null;
    } else if (order_id !== null) {
      // Try to convert to integer
      const parsedId = parseInt(order_id, 10);
      // If not a valid number, set to null
      if (isNaN(parsedId)) {
        order_id = null;
      } else {
        order_id = parsedId;
      }
    }
    Subscriber.insertVccData(data, order_id).then(result => {
      // SocketService.emitEndCall(data).then(result => {
      //   res.status(200).json({succes: true, id: result});
      //   return;
      // });
      // SocketService.emitEndCall(data);
      // console.log("SUCCESS: VCC data inserted");
      //console.log(data);
      res.status(200).json({succes: true, id: 'result'});
    });
  } catch (err) {
    logger.error("subscriberController: getWebhook - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

subscriberController.prototype.getWebhook2 = (req, res) => {
  try {
    console.log(JSON.stringify(req.body));

    res.status(200).json({succes: true, id: result});
  } catch (err) {
    logger.error("subscriberController: getWebhook2 - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

subscriberController.prototype.askUsMail = (req, res) => {
  try {
    var data = {
      name: req.body.name,
      email: req.body.email,
      content: req.body.content
    }

    var askUsMailSchema = {
      "title": "askUsMail",
      "type": "object",
      "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "content": { "type": "string" }
      },
      "required": ["name", "email", "content"]
  }

  var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
  var validate = ajv.compile(askUsMailSchema);
  var valid = validate(data);
  var recaptchaValidation = req.session.recaptchaSuccess;
  if (!valid) {
    res.status(400).json({success: false, message: validate.errors});
    return;
  }

  if (!recaptchaValidation) {
    res.status(400).json({success: false, message: 'recaptcha token missing'});
    return;
  }

    mailingService.sendAskUsMail(data);
    req.session.recaptchaSuccess = false;
    res.status(200).json({succes: true, message: "Email sent."});
  } catch (err) {
    logger.error("subscriberController: askUsMail - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

subscriberController.prototype.getSendgridWebhook = (req, res) => {
  try {
    var otoms_sent_ids = [];
    var delivery_reminder_ids = [];
    //var body = JSON.parse(req.body);
    var body = req.body;
    for(var i=0;i<body.length;i++){
      if(body[i].otom_sent_id){
        otoms_sent_ids.push(body[i].otom_sent_id);
      }
      if(body[i].delivery_reminder_id){
        delivery_reminder_ids.push(body[i].delivery_reminder_id);
      }
    }

    Subscriber.updateOtomsOpened(otoms_sent_ids, delivery_reminder_ids).then(result => {
      res.status(200).json({succes: true, message: "DONE: updated rows " + result});
      return;
    }).catch(err => {
      logger.error("subscriberController: getSendgridWebhook - ERROR: Subscriber.updateOtomsOpened: " + err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("subscriberController: getSendgridWebhook - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new subscriberController();
