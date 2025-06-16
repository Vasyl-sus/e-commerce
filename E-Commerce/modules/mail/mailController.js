var logger = require('../../utils/logger');
var bluebird = require('bluebird');
var mailingService = require('../../utils/mailingService');
var Lang = require('../lang/langModel');
var Ajv = require('ajv');

var mailController = function () {};

var orderMailSchema = {
    "title": "orderMail",
    "type": "object",
    "properties": {
        "order_id": {"type": "integer" },
        "lang": { "type": "string" },
        "payment_method_code": { "type": "string" },
        "delivery_method_code": { "type": "string" },
        "currency_symbol": { "type": "string" },
        "subtotal": { "type": "number" },
        "discount_value": { "type": "number" },
        "additional_discount_value": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "total": { "type": "number" },
        "therapies": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties":{
                    "id":{"type":"string"},
                    "name":{"type":"string"},
                    "price":{"type":"number"},
                    "quantity":{"type":"integer"}
                },
                "required":["id","name","price","quantity"]
            }
        },
        "shipping_country": { "type": "string" },
        "country_ddv": { "type": "number" },
        "shipping_first_name": { "type": "string" },
        "shipping_last_name": { "type": "string" },
        "shipping_address": { "type": "string" },
        "shipping_postcode": { "type": "string" },
        "shipping_city": { "type": "string" },
    },
    "required": [
        "order_id",
        "lang",
        "payment_method_code",
        "delivery_method_code",
        "currency_symbol",
        "subtotal",
        "discount_value",
        "shipping_fee",
        "total",
        "therapies",
        "shipping_country",
        "country_ddv",
        "shipping_first_name",
        "shipping_last_name",
        "shipping_address",
        "shipping_postcode",
        "shipping_city"
    ]
};

mailController.prototype.sendMail = bluebird.coroutine(function*(req, res) {
    try {
        //order + country_ddv
        var data = req.body;
        var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        var validate = ajv.compile(orderMailSchema);
        var valid = validate(data);
        if (!valid) {
            res.status(400).json({success: false, message: validate.errors});
            return;
        }

        data.lang = data.lang.toUpperCase();

        var langModules = yield Lang.getLanguageModules(data.lang);
        var textData = langModules.find(lm=>{
            return lm.name=='mail_complete';
        });

        if(textData){
            mailingService.createNewOrder(data, [textData]);
            res.status(200).json({success: true, message: "Mail sent."});
            return;
        } else {
            res.status(404).json({success: false, message: "order_before_delivered_mail is missing from "+ data.lang + " language"});
            return;
        }

    } catch(err) {
        logger.error("mailController: sendMail - ERROR: try-catch: " + err);
        res.status(500).json({success: false, message: err});
        return;
    }
});


module.exports = new mailController();