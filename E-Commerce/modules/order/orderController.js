var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Ajv = require('ajv');
var validationSchema = require('./orderValidation.js');
var mailingService = require('../../utils/mailingService.js');
var lang = require('../lang/langController');
var Lang = require('../lang/langModel');
var md5 = require('md5');
var Order = require('./orderModel.js');
var socketService = require('../../utils/socket');
var Notifications = require('../notifications/notificationsModel');
var infoBipService = require('../../utils/infoBipService.js');
var Cart = require('../cart/cartModel');
var mailchimpService = require("../../utils/mailchimpService");
var klaviyoService = require("../../utils/klaviyoService");
var orderController = function () {};
var parsePhoneNumber = require('libphonenumber-js');

orderController.prototype.createInitialOrder = bluebird.coroutine(function *(req, res) {
  console.log('createInitialOrder')
  try {
    var orderData = req.body;

    var orderstatus = yield Order.getOrderstatusByName("Nedokončano");
    if(!orderstatus){
      res.status(403).json({success: false, message: "Missing orderstatus!"});
      return;
    }
    orderData.order_status = orderstatus.id; //Nepopolno
    orderData.ip = req.session.ip;
    orderData.lang = req.session.lang;
    orderData.shipping_country=req.session.country;
    orderData.subtotal = req.session.cart.subtotal;
    orderData.therapies = req.session.cart.therapies;
    orderData.accessories = req.session.cart.accessories;
    orderData.currency_symbol = req.session.currency && req.session.currency.symbol;
    orderData.currency_value = req.session.currency && req.session.currency.value;
    orderData.currency_code = req.session.currency && req.session.currency.code;
    orderData.utm_source = req.session.utm && req.session.utm.source || null;
    orderData.utm_medium = req.session.utm && req.session.utm.medium || null;
    orderData.utm_campaign = req.session.utm && req.session.utm.campaign || null;
    orderData.utm_content = req.session.utm && req.session.utm.content || null;
    orderData.order_type = "splet";
    orderData.oto = parseInt(req.session.oto) || 0;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    // var validate = ajv.compile(validationSchema.initialOrderSchema);
    // var valid = validate(orderData);
    // if (!valid) {
    //   res.status(400).json({success: false, message: validate.errors});
    //   return;
    // }
    orderData.shipping_email = orderData.shipping_email.toLowerCase();

    const orderKlavio = {
      ...orderData,
      ...{
        eur_value: req.session.cart && req.session.cart.total,
        discount: req.session.cart && req.session.cart.discount,
        discount_code: req.session.cart && req.session.cart.discountData && req.session.cart.discountData.name,
        order_id: req.session.customer && req.session.customer.order_id,
        order_id2: req.session.customer && req.session.customer.order_id2
      }
    };
    if(req.session.customer && req.session.customer.order_id && req.session.customer.order_id !== undefined){
      Order.updateInitialOrder(req.session.customer.order_id, orderData).then((result) => {
        logger.info('Initial order updated');
        if(orderData['ip']) delete orderData['ip'];
        if(orderData['therapies']) delete orderData['therapies'];
        if(orderData['accessories']) delete orderData['accessories'];
        if(orderData['subtotal']) delete orderData['subtotal'];
        if(orderData['order_status']) delete orderData['order_status'];
        if(orderData['order_type']) delete orderData['order_type'];
        Object.assign(req.session.customer, orderData);
        req.session.save();
        //mailingService.createNewOrder(orderData.shipping_email, orderData.total);
        //klaviyoService.addOrderToStore(orderKlavio, req.session.customer, req.session.utm, "Started Checkout")
        // sendToDataLayer(orderKlavio);
        res.status(200).json({success: true, id: req.session.customer.order_id, customer: req.session.customer });
      }).catch((err) => {
        logger.error("orderController: createInitialOrder - ERROR: Order.updateInitialOrder: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      orderData.id = uuid.v1();
      Order.createInitialOrder(orderData).then((result) => {
        logger.info('Initial order created');

        // orderData.order_id = result;
        // socketService.emitNewOrder(orderData);
        orderData.order_id = new String(orderData.id);
        delete orderData['id'];
        delete orderData['ip'];
        delete orderData['therapies'];
        delete orderData['accessories'];
        delete orderData['subtotal'];
        delete orderData['order_status'];
        delete orderData['order_type'];
        orderData.display_order_id = result && result.id;
        orderData.order_id = result && result.id;
        orderData.order_id2 = result && result.order_id2;
        if(!req.session.customer)
          req.session.customer = {};
        Object.assign(req.session.customer, orderData);
        req.session.save();
        //mailingService.createNewOrder(orderData.shipping_email, orderData.total);
        res.status(200).json({success: true, id: orderData.order_id, customer: req.session.customer });
    }).catch((err) => {
      logger.error("orderController: createInitialOrder - ERROR: Order.createInitialOrder: " + err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    }
  }
  catch (err) {
    logger.error("orderController: createInitialOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


orderController.prototype.updateInitialOrder = bluebird.coroutine(function *(req, res) {
  console.log("Updating initial order")
  try {
    var {id} = req.params;
    var initial_order = yield Order.getOrderDetails(id);
    if(initial_order){
      var orderData = req.body;
      orderData.shipping_country=req.session.country;

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.initialOrder2Schema);
      var valid = validate(orderData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      Order.updateInitialOrder(id, orderData).then(result => {
        Object.assign(req.session.customer, orderData);
        //req.session.save();
        res.status(200).json({success: true, id: id });
      }).catch(err => {
        logger.error("orderController: updateInitialOrder - ERROR: Order.updateInitialOrder: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      });

    } else {
      res.status(404).json({success: false, message: "Initial order not found."});
      return;
    }

  } catch (err) {
    logger.error("orderController: updateInitialOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

function clearCart(req) {
  req.session.cart=null;
  req.session.cart={};
  req.session.cart.therapies=[];
  req.session.cart.accessories=[];
  req.session.cart.subtotal=0;
  req.session.cart.discount=0;
  req.session.cart.shipping_fee=0;
  req.session.cart.total=0;
  req.session.cart.recalculate = false;
  req.session.utm = null;
  //req.session.save();
  return;
}

orderController.prototype.createOrder = bluebird.coroutine(function *(req, res) {
  try {
    var {id} = req.params;
    var initial_order = yield Order.getOrderDetails(id);
    if(initial_order){
      var orderData = req.body;
      var orderstatus = yield Order.getOrderstatusByName("Neobdelano");
      if(!orderstatus){
        res.status(403).json({success: false, message: "Missing orderstatus!"});
        return;
      }
      orderData.order_status = orderstatus.id; //Neobdelano
      orderData.ip = req.session.ip;
      orderData.lang = req.session.lang;
      orderData.shipping_country = req.session.country;
      orderData.currency_symbol = req.session.currency.symbol;
      orderData.currency_value = req.session.currency.value;
      orderData.currency_code = req.session.currency.code;
      orderData.subtotal = req.session.cart.subtotal;
      orderData.discount = req.session.cart.discount;
      orderData.order_id2 = req.session.cart.order_id2;
      orderData.shipping_fee = req.session.cart.shipping_fee;
      orderData.total = req.session.cart.total;
      orderData.therapies = req.session.cart.therapies;
      orderData.accessories = req.session.cart.accessories;
      orderData.utm_source = req.session.utm && req.session.utm.source || null;
      orderData.utm_medium = req.session.utm && req.session.utm.medium || null;
      orderData.utm_campaign = req.session.utm && req.session.utm.campaign || null;
      orderData.utm_content = req.session.utm && req.session.utm.content || null;
      orderData.oto = parseInt(req.session.oto) || 0;
      if(req.session.cart.discountData)
        orderData.discount_id = req.session.cart.discountData.id;

      var customer_edit = false;
      orderData.new_customer = false;
      var customer = yield Order.getCustomerByEmail(req.session.customer.shipping_email);
      if(!customer){
        customer = {};
        customer.id = uuid.v1();
        orderData.new_customer = true;
      } else {
        customer_edit = true;
        orderData.new_customer = false;
    //    orderData.responsible_agent_id = customer.last_agent_id;
    //    orderData.responsible_agent_username = customer.last_agent_username;
        delete customer.last_agent_id;
        delete customer.last_agent_username;
      }
      orderData.customer_id=customer.id;

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.orderSchema);
      var valid = validate(orderData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var temp_obj = {
        payment_method_id: orderData.payment_method_id,
        payment_method_code: orderData.payment_method_code,
        delivery_method_id: orderData.delivery_method_id,
        delivery_method_code: orderData.delivery_method_code
      }

      var sessionOrder = {};
      for(var k in req.session.customer) {
        if(k!="order_id"){
          sessionOrder[k]=req.session.customer[k];
        } else {
          sessionOrder['id']=req.session.customer['order_id'];
        }
        if(k.indexOf("shipping_")==0){
          customer[k.substring(9)]=req.session.customer[k];
        }
      }

      Object.assign(sessionOrder, orderData);
      Object.assign(req.session.customer, temp_obj);

      var orderhistory = {
        order_id: sessionOrder.id,
        agent_id: sessionOrder.responsible_agent_id,
        isInitialState: 1,
        data: JSON.stringify(sessionOrder)
      };

      var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
      var base64Credentials = Buffer.from(credentialData).toString('base64');
      var headers={};
      headers["Authorization"] = "Basic " + base64Credentials;
      var params1={
        headers: headers,
        url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/"+md5(req.session.customer.shipping_email)
      }

      fetch(params1.url, { headers: params1.headers })
    .then(response => response.json())
    .then(bluebird.coroutine(function* (response) {
        var tasks = [];
        tasks.push(lang.getLanguageModules(req.session.lang));

        tasks.push(Order.createOrder(id, orderData));

        tasks.push(Order.insertOrderHistory(orderhistory));
        if(!customer_edit){
            tasks.push(Order.insertCustomer(customer));
        } else {
            tasks.push(Order.editCustomer(customer.id, customer));
        }
        if(req.session.cart.discountData && req.session.cart.discountData.otom_sent_id){
            tasks.push(Order.updateOtomsSent(req.session.cart.discountData.otom_sent_id));
        }
        if(response.status == 404){
            var data2 = {
                email_address: req.session.customer.shipping_email.toLowerCase(),
                status: "subscribed",
                merge_fields: {
                    FNAME: req.session.customer.shipping_first_name,
                    LNAME: req.session.customer.shipping_last_name,
                    JEZIK: req.session.lang,
                    DRZAVA: req.session.country
                }
            }
            var params2 = {
                headers: headers,
                url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/",
                body: JSON.stringify(data2)
            };
            tasks.push(fetch(params2.url, {
                method: 'POST',
                headers: params2.headers,
                body: params2.body
            }).then(res => res.json()));
        }

        bluebird.all(tasks).then(results =>{
            logger.info('Order created1');

            sessionOrder.order_id = req.session.customer.display_order_id;

            var textData = results[0].languageModules.filter(y=>{
                return y.name=='order_complete_mail';
            });

            Object.assign(initial_order, sessionOrder);
            if(req.session.cart.discountData){
                initial_order.discountData = JSON.parse(JSON.stringify(req.session.cart.discountData));
            }
            socketService.emitNewOrder(initial_order);
            initial_order.ddv = req.session.country_ddv;
            //mailingService.createNewOrder(initial_order, textData, 1);
            delete initial_order.ddv;

            clearCart(req);
            delete req.session.utm;
            delete req.session.deliverymethod;
            delete req.session.customer.order_id;
            delete req.session.customer.display_order_id;

            res.status(200).json({success: true, id: id, order: initial_order});
        }).catch(err => {
            logger.error("orderController: createOrder - ERROR: bluebird.all(tasks): " + err.message);
            res.status(500).json({success: false, message: "BLUEBIRD: "+ err.message});
            return;
        });
    }))
    .catch(err => {
        logger.error("orderController: createOrder - ERROR: fetch(params1): " + err.message);
    });

    } else {
      res.status(404).json({success: false, message: "Initial order not found."});
    }

  } catch (err) {
    logger.error("orderController: createOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: "DRUGO: " + err.message});
    return;
  }
});


orderController.prototype.checkDiscountApi = bluebird.coroutine(function *(req, res) {
  try {
    var discountcode = req.body.discountcode;
    var discountcountry = req.body.country;
    var therapy_id = req.body.therapy_id;

    var country_name = yield Cart.getShortCountryName(discountcountry);

    var discount_code = yield Cart.getFullDiscountByName(discountcode, country_name.name);
    var thisTherapy = yield Lang.getTherapiesByIds([therapy_id]);
    if (thisTherapy) {
      thisTherapy = thisTherapy[0]
    }

    if(discount_code){
      var returnObject = {};
      var discountType = 'Normal'
      var isValidCode = false;
      var price = 0;
      if (discount_code.type.toLowerCase() == 'general') {
        isValidCode = true;
        if (discount_code.discount_type.toLowerCase() == 'percent') {
          price = thisTherapy.total_price - ((thisTherapy.total_price * discount_code.discount_value) / 100)
        } else if (discount_code.discount_type.toLowerCase() == 'amount') {
          price = thisTherapy.total_price - discount_code.discount_value;
        }
      } else if (discount_code.type.toLowerCase() == 'individual') {
        var foundDiscount = discount_code.therapies.find(function(t) {
          return t.id == thisTherapy.id
        })
        if (foundDiscount) {
          isValidCode = true;
          if (discount_code.discount_type.toLowerCase() == 'percent') {
            price = thisTherapy.total_price - ((thisTherapy.total_price * discount_code.discount_value) / 100)
          } else if (discount_code.discount_type.toLowerCase() == 'amount') {
            price = thisTherapy.total_price - discount_code.discount_value;
          }
        } else {
          res.status(500).json('Neveljavna koda za popust.');
          return;
        }
      } else if (discount_code.type.toLowerCase() == 'shipping') {
        discountType = 'shipping'
      }
      returnObject = {
        oldTherapyPrice: thisTherapy.total_price,
        newTherapyPrice: price,
        discount: discount_code,
        discountType: discountType
      }
      res.status(200).json(JSON.stringify({success: true, discount: returnObject}));//"Discount added to cart."
      return;
    }

    res.status(404).json({success: false, message: "discount_not_found"});
    return;

  } catch (err) {
    logger.error("cartController: checkDiscountApi - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.createOrderApi = bluebird.coroutine(function *(req, res) {
  try {

    var orderData = {};
    var postData = req.body;
    var orderstatus = yield Order.getOrderstatusByName("Neobdelano");
    if(!orderstatus){
      res.status(403).json({success: false, message: "Missing orderstatus!"});
      return;
    }
    var cc = yield Lang.getCountryByFullName(postData.customer.country)

    if (!cc) {
      res.status(403).json({success: false, message: "Missing country!"});
      return;
    }
    orderData.order_status = orderstatus.id; //Neobdelano
    orderData.ip = req.session.ip;
    orderData.lang = postData.lang;
    orderData.shipping_country = cc.name;
    orderData.shipping_first_name = postData.customer.first_name;
    orderData.shipping_last_name = postData.customer.last_name;
    orderData.shipping_address = postData.customer.address;
    orderData.shipping_postcode = postData.customer.postcode;
    var telephone = postData.customer.telephone;
    var country = cc.name;
    var telephone_get = parsePhoneNumber(telephone, country);
    var telephone_int = telephone_get.number;
    orderData.shipping_telephone = telephone_int;
    orderData.shipping_email = postData.customer.email;
    orderData.shipping_city = postData.customer.city;
    orderData.order_type = "splet";
    let ccurrency = yield Order.getCurrencyByCountry(cc.name)

    if (!ccurrency) {
      res.status(403).json({success: false, message: "Missing currency!"});
      return;
    }

    orderData.eur_value = postData.total / ccurrency.value

    orderData.currency_symbol = ccurrency.symbol;
    orderData.currency_value = ccurrency.value;
    orderData.currency_code = ccurrency.code;

    orderData.subtotal = postData.subtotal;
    orderData.shipping_fee = postData.shipping_fee;
    orderData.total = postData.total;

    var therapy_name = yield Order.getTherapyNameById(postData.therapy_id)

    var category_id = yield Order.getTherapyCategoryIdByTherapyId(postData.therapy_id)

    orderData.therapies = [{id: postData.therapy_id, quantity: 1, price: postData.subtotal, name: therapy_name.name, category_id: category_id.id}]

    var gift_name = yield Order.getGiftNameById(postData.giftId)

    var gift_option_name = yield Order.getGiftOptionNameById(postData.giftProductId)


    orderData.accessories = [];
    if (postData.giftId) {
      var gift = {
        id: postData.giftId,
        quantity: 1,
        product_id: postData.giftProductId,
        name: gift_name.name,
        product_name: gift_option_name.name,
        isGift: 1
      }
      orderData.accessories.push(gift)
    }
    orderData.utm_source = postData.utm.source || null;
    orderData.utm_medium = postData.utm.medium || null;
    orderData.utm_campaign = postData.utm.campaign || null;
    orderData.utm_content = postData.utm.content || null;

    orderData.discount = postData.discount_value;
    if (postData.discount)
      orderData.discount_id = postData.discount.id;

    orderData.country_ddv = cc.ddv;

    var pay = yield Lang.getPymentMethodByCode("cod", cc.name)

    if (!pay) {
      res.status(403).json({success: false, message: "Missing payment method!"});
      return;
    }

    var del = yield Lang.getDeliveryMethodById(postData.delivery_method_id)
    if (del) {
      orderData.delivery_method_id = del.id;
      orderData.delivery_method_code = del.code
      orderData.delivery_method_price = del.price
      orderData.delivery_method_to_price = del.to_price
    } else {
      res.status(403).json({success: false, message: "Missing delivery method!"});
      return;
    }

    var trans = JSON.parse(pay.translations)
    orderData.payment_method_name = trans[postData.lang.toUpperCase()]
    orderData.payment_method_id = pay.id
    orderData.payment_method_code = pay.code

    orderData.oto = 0;

    var customer_edit = false;
    var customer = yield Order.getCustomerByEmail(postData.customer.email);
    if(!customer){
      customer = {};
      customer.id = uuid.v1();
    } else {
      customer_edit = true;
    //  orderData.responsible_agent_id = customer.last_agent_id;
    //  orderData.responsible_agent_username = customer.last_agent_username;
      delete customer.last_agent_id;
      delete customer.last_agent_username;
    }

    for(var k in orderData) {
      if(k.indexOf("shipping_")==0 && k!="shipping_fee"){
        customer[k.substring(9)]=orderData[k];
        customer[k]=orderData[k];
      }
    }

    orderData.customer_id = customer.id;
    orderData.id = uuid.v1();
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.oneStepOrderSchema);
    var valid = validate(orderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    if (ccurrency) {
      orderData.eur_value = orderData.total / ccurrency.value
    }

    orderData.orderhistory = {
      order_id: orderData.id,
      agent_id: orderData.responsible_agent_id,
      isInitialState: 1,
      data: JSON.stringify(orderData)
    };

    var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
    var base64Credentials = Buffer.from(credentialData).toString('base64');
    var headers={};
    headers["Authorization"] = "Basic " + base64Credentials;
    var params1={
      headers: headers,
      url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/"+md5(orderData.shipping_email)
    }

    let infoBipStatus = yield infoBipService.getOmniPerson(customer.telephone);

    fetch(params1.url, { headers: params1.headers })
    .then(response => response.json())
    .then(bluebird.coroutine(function* (response) {
        var tasks = [];
        tasks.push(lang.getLanguageModules(postData.lang.toUpperCase()));
        tasks.push(Order.createOrderOneStep(orderData));
        tasks.push(Order.getCountry(postData.customer.country));
        if(!customer_edit){
            tasks.push(Order.insertCustomer(customer));
        } else {
            tasks.push(Order.editCustomer(customer.id, customer));
        }
        if(response.status == 404){
            var data2 = {
                email_address: postData.customer.email.toLowerCase(),
                status: "subscribed",
                merge_fields: {
                    FNAME: postData.customer.first_name,
                    LNAME: postData.customer.last_name,
                    ADDRESS: postData.customer.address,
                    PHONE: postData.customer.telephone,
                    JEZIK: postData.lang,
                    DRZAVA: postData.customer.country
                }
            }
            var params2 = {
                headers: headers,
                url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/",
                body: JSON.stringify(data2)
            };
            tasks.push(fetch(params2.url, {
                method: 'POST',
                headers: params2.headers,
                body: params2.body
            }).then(res => res.json()));
        }

        bluebird.all(tasks).then(results =>{
            logger.info('Order created2');

            var textData = results[0].languageModules.filter(y=>{
                return y.name=='mail_complete';
            });

            let order_id = {order_id: results[1]};
            let order_id2 = {order_id2: results[1]};

            orderData = Object.assign(orderData, order_id);
            orderData = Object.assign(orderData, order_id2);

            if(postData.discount) {
                orderData.discountData = postData.discount;
            }
            let country = results[2]
            orderData = {...orderData, full_country: country.full_name}
            mailingService.createNewOrder(orderData, textData, 1);

            clearCart(req);
            delete orderData.orderhistory;

            res.status(200).json({success: true, id: orderData.id, order: orderData});
        }).catch(err => {
            console.log('error: ',err)
            logger.error("orderController: createOrder - ERROR: bluebird.all(tasks): " + err.message);
            res.status(500).json({success: false, message: "BLUEBIRD: "+ err});
            return;
        });
    }))
    .catch(err => {
        logger.error("orderController: createOrderOneStep - ERROR: fetch(params1): " + err.message);
    });

  } catch (err) {
    logger.error("orderController: createOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: "DRUGO: " + err.message});
    return;
  }
});

orderController.prototype.createOrderApiWp = bluebird.coroutine(function *(req, res) {
  try {
    var orderData = {};
    var postData = req.body;
    var orderstatus = yield Order.getOrderstatusByName("Neobdelano");
    if(!orderstatus){
      res.status(403).json({success: false, message: "Missing orderstatus!"});
      return;
    }
    orderData.order_status = orderstatus.id; //Neobdelano
    orderData.ip = req.session.ip;
    orderData.lang = postData.lang;
    orderData.shipping_country = postData.customer.country;
    orderData.shipping_first_name = postData.customer.first_name;
    orderData.shipping_last_name = postData.customer.last_name;
    orderData.shipping_address = postData.customer.address;
    orderData.shipping_postcode = postData.customer.postcode;
    var telephone = postData.customer.telephone;
    var country = postData.customer.country;
    var telephone_get = parsePhoneNumber(telephone, country);
    var telephone_int = telephone_get.number;
    orderData.shipping_telephone = telephone_int;
    orderData.shipping_email = postData.customer.email;
    orderData.shipping_city = postData.customer.city;
    orderData.order_type = "splet";
    let ccurrency = yield Order.getCurrencyByCountry(postData.customer.country)

    if (!ccurrency) {
      res.status(403).json({success: false, message: "Missing currency!"});
      return;
    }

    // add initial order value
    orderData.initial_order_value = postData.total - postData.shipping_fee;
    orderData.initial_shipping_fee = postData.shipping_fee;
    orderData.initial_currency_value = ccurrency.value;

    orderData.eur_value = postData.total / ccurrency.value

    orderData.currency_symbol = ccurrency.symbol;
    orderData.currency_value = ccurrency.value;
    orderData.currency_code = ccurrency.code;

    orderData.subtotal = postData.subtotal;
    orderData.shipping_fee = postData.shipping_fee;
    orderData.total = postData.total;

    // IZDELKI



    const orderTherapies = []

    for (const therapy of postData.therapies) {
      const therapy_name = yield Order.getTherapyNameById(therapy.therapy_id)
      orderTherapies.push({
        id: therapy.therapy_id,
        quantity: therapy.therapy_quantity,
        price: therapy.therapy_price,
        name: therapy_name.name
      })
    }

    orderData.therapies = orderTherapies;


    const orderAccessories = [];

    for (const accessory of postData.accessories) {
      const accessory_name = yield Order.getGiftNameById(accessory.accessory_id)
      const accessory_option_name = yield Order.getGiftOptionNameById(accessory.accessory_id)
      orderAccessories.push({
        id: accessory.accessory_id,
        product_id: accessory.accessory_product_id,
        quantity: accessory.accessory_quantity,
        price: accessory.accessory_price,
      //  name: accessory_name.name,
      //  product_name: accessory_option_name.name
      })
    }

    const orderGifts = [];

    for (const gift of postData.gifts) {
      const gift_name = yield Order.getGiftNameById(gift.gift_id)
      const gift_option_name = yield Order.getGiftOptionNameById(gift.gift_product_id)
      orderAccessories.push({
        id: gift.gift_id,
        product_id: gift.gift_product_id,
        quantity: gift.gift_quantity,
        price: gift.gift_price,
        name: gift_name.name,
        product_name: gift_name.name,
        isGift: 1
      })
    }

    orderData.accessories = orderAccessories;





    orderData.utm_source = postData.utm.source || null;
    orderData.utm_medium = postData.utm.medium || null;
    orderData.utm_campaign = postData.utm.campaign || null;
    orderData.utm_content = postData.utm.content || null;


    orderData.discount = postData.discount_value;
    orderData.discount_code = postData.discount_code;

    if ((orderData.discount > 0 && postData.discount_code != "" && postData.discount_code != "popust")) {
      var discount_id = yield Order.getDiscountIdFromName(postData.discount_code);
      orderData.discount_id = discount_id.id;
    }

    var country_ddv = yield Order.getCountryDDV(postData.customer.country);

    orderData.country_ddv = country_ddv.ddv;

    var pay = yield Order.getPaymentMethodById(postData.payment_method_id);

    if (!pay) {
      res.status(403).json({success: false, message: "Missing payment method!"});
      return;
    }

    var del = yield Lang.getDeliveryMethodById(postData.delivery_method_id)
    if (del) {
      orderData.delivery_method_id = del.id;
      orderData.delivery_method_code = del.code
      orderData.delivery_method_price = del.price
      orderData.delivery_method_to_price = del.to_price
    } else {
      res.status(403).json({success: false, message: "Missing delivery method!"});
      return;
    }

    var trans = JSON.parse(pay.translations)
    orderData.payment_method_name = trans[postData.lang.toUpperCase()]
    orderData.payment_method_id = pay.id
    orderData.payment_method_code = pay.code

    orderData.oto = 0;

    var customer_edit = false;
    var customer = yield Order.getCustomerByEmail(postData.customer.email);
    if(!customer){
      customer = {};
      customer.id = uuid.v1();

    } else {
      customer_edit = true;
      delete customer.last_agent_id;
      delete customer.last_agent_username;
    }

    for(var k in orderData) {
      if(k.indexOf("shipping_")==0 && k!="shipping_fee"){
        customer[k.substring(9)]=orderData[k];
        customer[k]=orderData[k];
      }
    }

    orderData.customer_id = customer.id;
    orderData.id = uuid.v1();
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.oneStepOrderSchema);
    var valid = validate(orderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    if (ccurrency) {
      orderData.eur_value = orderData.total / ccurrency.value
    }

    orderData.orderhistory = {
      order_id: orderData.id,
      agent_id: orderData.responsible_agent_id,
      isInitialState: 1,
      data: JSON.stringify(orderData)
    };

    var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
    var base64Credentials = Buffer.from(credentialData).toString('base64');
    var headers={};
    headers["Authorization"] = "Basic " + base64Credentials;
    var params1={
      headers: headers,
      url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/"+md5(orderData.shipping_email)
    }

  //  let infoBipStatus = yield infoBipService.getOmniPerson(customer.telephone);
  //  console.log("infoBipStatus", infoBipStatus)

  fetch(params1.url, { headers: params1.headers })
  .then(response => response.json())
  .then(bluebird.coroutine(function* (response) {
      var tasks = [];
      tasks.push(lang.getLanguageModules(postData.lang.toUpperCase()));
      tasks.push(Order.createOrderOneStep(orderData));
      tasks.push(Order.getCountry(postData.customer.country));
      if(!customer_edit){
          tasks.push(Order.insertCustomer(customer));
      } else {
          tasks.push(Order.editCustomer(customer.id, customer));
      }
      if(response.status == 404){
          var data2 = {
              email_address: postData.customer.email.toLowerCase(),
              status: "subscribed",
              merge_fields: {
                  FNAME: postData.customer.first_name,
                  LNAME: postData.customer.last_name,
                  ADDRESS: postData.customer.address,
                  PHONE: postData.customer.telephone,
                  JEZIK: postData.lang,
                  DRZAVA: postData.customer.country
              }
          }
          var params2 = {
              headers: headers,
              url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/",
              body: JSON.stringify(data2)
          };
          tasks.push(fetch(params2.url, {
              method: 'POST',
              headers: params2.headers,
              body: params2.body
          }).then(res => res.json()));
      }

      bluebird.all(tasks).then(results =>{
          logger.info('Order created3');

          var textData = results[0].languageModules.filter(y=>{
              return y.name=='mail_complete';
          });

          let order_id = {order_id: results[1]};
          let order_id2 = {order_id2: results[1]};
          orderData = Object.assign(orderData, order_id);
          orderData = Object.assign(orderData, order_id2);

          if(postData.discount) {
              orderData.discountData = postData.discount;
          }
          let country = results[2]
          orderData = {...orderData, full_country: country.full_name}
          mailingService.createNewOrder(orderData, textData, 1);

          clearCart(req);
          delete orderData.orderhistory;

          res.status(200).json({success: true, id: orderData.id, order: orderData});
      }).catch(err => {
          console.log('error: ',err)
          logger.error("orderController: createOrder - ERROR: bluebird.all(tasks): " + err.message);
          logger.error("Order data: " + JSON.stringify(orderData));
          logger.error("Post data: " + JSON.stringify(postData));
          res.status(500).json({success: false, message: "BLUEBIRD: "+ err});
          return;
      });
  }))
  .catch(err => {
      logger.error("orderController: createOrderOneStep - ERROR: fetch(params1): " + err.message);
  });

  } catch (err) {
    logger.error("orderController: createOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: "DRUGO: " + err.message});
    return;
  }
});


orderController.prototype.createOrderOneStep = bluebird.coroutine(function *(req, res) {
  try {


    var orderData = req.body;
    var orderstatus = yield Order.getOrderstatusByName("Neobdelano");
    if(!orderstatus){
      res.status(403).json({success: false, message: "Missing orderstatus!"});
      return;
    }
    orderData.order_status = orderstatus.id; //Neobdelano
    orderData.ip = req.session.ip;
    orderData.lang = req.session.lang;
    orderData.shipping_country = req.session.country;
    orderData.currency_symbol = req.session.currency.symbol;
    orderData.currency_value = req.session.currency.value;
    orderData.currency_code = req.session.currency.code;
    orderData.subtotal = req.session.cart.subtotal;
    orderData.discount = req.session.cart.discount;
    orderData.order_id2 = req.session.customer && req.session.customer.order_id2;
    orderData.total = req.session.cart.total;
    orderData.shipping_fee = req.session.cart.shipping_fee;
    orderData.therapies = req.session.cart.therapies;
    orderData.accessories = req.session.cart.accessories;
    orderData.utm_source = req.session.utm && req.session.utm.source || null;
    orderData.utm_medium = req.session.utm && req.session.utm.medium || null;
    orderData.utm_campaign = req.session.utm && req.session.utm.campaign || null;
    orderData.utm_content = req.session.utm && req.session.utm.content || null;
    orderData.country_ddv = req.session.country_ddv;
    orderData.payment_method_name = req.session.customer && req.session.customer.payment_method_name;
    orderData.order_type = "splet";
    orderData.oto = parseInt(orderData.oto) || 0;
    // add initial order value
    orderData.initial_order_value = req.session.cart.total - req.session.cart.shipping_fee;
    orderData.initial_shipping_fee = req.session.cart.shipping_fee;
    orderData.initial_currency_value = req.session.currency.value;

    if(req.session.cart.discountData) {
      let cdiscoutn = yield Cart.checkDiscountById(req.session.cart.discountData.id)
      if (cdiscoutn) {
        orderData.discount_id = req.session.cart.discountData.id;
        orderData.discount_code = cdiscoutn.name;
      } else {
        req.session.cart.total += req.session.cart.discount;
        orderData.total = req.session.cart.total;
        req.session.cart.discountData=undefined;
        req.session.cart.discount = 0;
        orderData.discount = 0;
        req.session.cart.recalculate = false;
      }
    }

    var customer_edit = false;
    var customer = yield Order.getCustomerByEmail(orderData.shipping_email);
    orderData.new_customer = false;
    if(!customer){
      customer = {};
      customer.id = uuid.v1();
      orderData.new_customer = true;
    } else {
      customer_edit = true;
      orderData.new_customer = false;
  //    orderData.responsible_agent_id = customer.last_agent_id;
  //    orderData.responsible_agent_username = customer.last_agent_username;
      delete customer.last_agent_id;
      delete customer.last_agent_username;
    }
    orderData.customer_id = customer.id;
    orderData.id = req.session.customer && req.session.customer.order_id && req.session.customer.order_id !== undefined ? req.session.customer.order_id : uuid.v1();
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.oneStepOrderSchema);
    var valid = validate(orderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    let ccurrency = yield Lang.getCurrencyByCountry(req.session.country);

    if (ccurrency) {
      orderData.eur_value = (orderData.total / ccurrency.value) || 0;
    }

    var deliverymethods = yield Cart.getDeliverymethods(req.session.country);

    let foundDelivery = deliverymethods.find(d => { return d.id ===  orderData.delivery_method_id})

    if (!foundDelivery) {
      let ffound = deliverymethods.find(d => { return !d.is_other && d.default_method})
      if (ffound) {
        orderData.delivery_method_id = ffound.id
        orderData.delivery_method_code = ffound.code
      } else {
        orderData.delivery_method_id = deliverymethods[0].id
        orderData.delivery_method_code = deliverymethods[0].code
      }
    }

    var temp_obj = {
      payment_method_id: orderData.payment_method_id,
      payment_method_code: orderData.payment_method_code,
      delivery_method_id: orderData.delivery_method_id,
      delivery_method_code: orderData.delivery_method_code
    }

    for(var k in orderData) {
      if(k.indexOf("shipping_")==0 && k!="shipping_fee"){
        customer[k.substring(9)]=orderData[k];
        customer[k]=orderData[k];
      }
    }
    if(!req.session.customer){
      req.session.customer={};
    }
    Object.assign(req.session.customer, customer);
    Object.assign(req.session.customer, temp_obj);

    orderData.orderhistory = {
      order_id: orderData.id,
      agent_id: orderData.responsible_agent_id,
      isInitialState: 1,
      data: JSON.stringify(orderData)
    };
    var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
    var base64Credentials = Buffer.from(credentialData).toString('base64');
    var headers={};
    headers["Authorization"] = "Basic " + base64Credentials;
    var params1={
      headers: headers,
      url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/"+md5(orderData.shipping_email)
    }

  //  let infoBipStatus = yield infoBipService.getOmniPerson(customer.telephone);
  //  logger.info(`infoBipStatus ${JSON.stringify(infoBipStatus)}`)

      fetch(params1.url, { headers: params1.headers })
      .then(response => response.json())
      .then(bluebird.coroutine(function* (response) {
          var tasks = [];
          tasks.push(lang.getLanguageModules(req.session.lang));

          if (req.session.customer && req.session.customer.order_id && req.session.customer.order_id !== undefined) {
              tasks.push(Order.createOrderOneStep(orderData, 'update'));
          } else {
              tasks.push(Order.createOrderOneStep(orderData, 'insert'));
          }

          tasks.push(Order.getCountry(orderData.shipping_country));
          if (!customer_edit) {
              tasks.push(Order.insertCustomer(customer));
          } else {
              tasks.push(Order.editCustomer(customer.id, customer));
          }
          if (req.session.cart.discountData && req.session.cart.discountData.otom_sent_id) {
              tasks.push(Order.updateOtomsSent(req.session.cart.discountData.otom_sent_id));
          }
      // if(body1 && JSON.parse(body1) && JSON.parse(body1).status==404){
      //   var data2 = {
      //     email_address: req.session.customer.email.toLowerCase(),
      //     status: "subscribed",
      //     merge_fields: {
      //       FNAME: req.session.customer.first_name,
      //       LNAME: req.session.customer.last_name,
      //       ADDRESS: req.session.customer.address,
      //       PHONE: req.session.customer.telephone,
      //       JEZIK: req.session.lang,
      //       DRZAVA: req.session.country
      //     }
      //   }
      //   var params2 = {
      //     headers: headers,
      //     url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.checkoutListId+"/members/",
      //     body: JSON.stringify(data2)
      //   };
      //   request.post = bluebird.promisify(request.post);
      //   tasks.push(request.post(params2));
      // }

      bluebird.all(tasks).then(results => {
        logger.info('Order created4');

        var textData = results[0].languageModules.filter(y => {
            return y.name == 'mail_complete';
        });

          // let order_id = {order_id: results[1]};
          // let order_id2 = {order_id2: results[1]};
          // orderData = Object.assign(orderData, order_id);
          // orderData = Object.assign(orderData, order_id2);

          if (req.session.cart.discountData) {
            orderData.discountData = JSON.parse(JSON.stringify(req.session.cart.discountData));
        }
          let country = results[2]
          orderData = { ...orderData, full_country: country.full_name }
          mailingService.createNewOrder(orderData, textData, 1);
          //console.log(req.session.utm)
          //mailchimpService.addOrderToStore(orderData, customer, req.session.utm)

          klaviyoService.addOrderToStore(orderData, customer, req.session.utm)
          clearCart(req);

      //    if (infoBipStatus) {
      //      if (infoBipStatus.errorCode && infoBipStatus.errorCode == 40401) {
      //        infoBipService.createOmniPerson(customer);
      //      }
      //    }
          // delete req.session.utm;
          delete req.session.customer.order_id;
            delete orderData.orderhistory;
            delete orderData.discountData;
            res.status(200).json({ success: true, id: orderData.id, order: orderData });
        }).catch(err => {
            console.log('error: ', err)
            logger.error("orderController: createOrder - ERROR: bluebird.all(tasks): " + err.message);
            res.status(500).json({ success: false, message: "BLUEBIRD: " + err });
            return;
        });
    }))
    .catch(err => {
        logger.error("orderController: createOrderOneStep - ERROR: fetch(params1): " + err.message);
    });

  } catch (err) {
    logger.error("orderController: createOrder - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: "DRUGO: " + err.message});
    return;
  }
});


orderController.prototype.getOrderDetails = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var order = yield Order.getOrderDetails(id);
    if(!order){
      res.status(404).json({success: false, message: "Order doesn't exist"});
    } else {
      res.status(200).json({"success": true, order: order});
    }

  } catch (err) {
    logger.error("orderController: getOrderDetails - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.changeStatus = bluebird.coroutine(function *(req, res) {
  try {
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.changeStatusSchema);
    var valid = validate(req.body);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var ids = req.body.ids;
    var new_status = req.body.new_status;
    var date_naknadno = req.body.date_naknadno || null;
    var orderBody = req.body.order || null;

    var tasks=[];
    tasks.push(Order.getOrderstatusByName(new_status));
    tasks.push(Order.getOrdersDetails(ids));
    tasks.push(Order.getOrdersDiscounts(ids));
    var results = yield bluebird.all(tasks);
    if(results[0]){
      var orders = results[1];
      var id_status = null;
      var discounts = results[2];

      switch(results[0].name){
        case 'Odobreno':
          id_status=2;
          break;
        case 'Poslano':
          id_status=3;
          break;
        case 'Preklicano':
          id_status=4;
          break;
        case 'Dostavljeno':
          id_status=5;
          break;
      }
      new_status=results[0];

      Order.changeStatuses(ids, new_status, orders, req.admin, date_naknadno).then(result => {
        logger.info('Order status updated');
        if(new_status.name == 'Poslano')  {
          // var returnDataForEmailing = [];
          // var returnDataForNotifying = {};
          // returnDataForNotifying.user_ids = [];
          // returnDataForNotifying.products = [];
          // var checkEmail = [];

          // Order.getAdminIdsByUserGroup('Admin').then(rows => {
          //   if(rows.length > 0){
          //     returnDataForNotifying.user_ids = rows.map(function(row){
          //       return Number(row.id);
          //     });
          //   }
          //   else{
          //     console.log('nema me');
          //   }
          // });

        //  Order.getProductsByOrderId(ids).then(products => {
            // var productIds = products.map(function(produkt){
            //   return produkt.id;
            // });
      //      Order.getStockRemindersByProductIds(productIds).then(stockReminders => {
              // for(var i = 0; i < products.length; ++i){
              //
              //   for(var j = 0; j < stockReminders.length; ++j){
              //
              //     var stockReminder_products = stockReminders[j].products.split('|');
              //
              //     var tmpObj = {};
              //     var tmpProductsHolder = [];
              //
              //     for(var k = 0; k < stockReminder_products.length; ++k){
              //
              //       if(products[i].id == stockReminder_products[k].split('&')[0] && products[i].amount < stockReminder_products[k].split('&')[1]){
              //         checkEmail.push(stockReminders[j].email);
              //         tmpObj.to = stockReminders[j].email;
              //         tmpProductsHolder.push({product_id: products[i].id, product_name: products[i].name, amount: products[i].amount, critical_value: stockReminder_products[k].split('&')[1]});
              //
              //         var dummy = {product_id: products[i].id, product_name: products[i].name, amount: products[i].amount, critical_value: stockReminder_products[k].split('&')[1]};
              //         if(!returnDataForNotifying.products.includes(dummy)){
              //           returnDataForNotifying.products.push(dummy);
              //         }
              //
              //       }
              //
              //     }
              //
              //     if(tmpObj.to && tmpObj.to != '' && tmpProductsHolder.length > 0 ){
              //
              //       var existingReceivers = returnDataForEmailing.map(function(obj){
              //         return obj.to;
              //       });
              //
              //       if(existingReceivers.includes(tmpObj.to)){
              //         for(var k = 0; k < returnDataForEmailing.length; ++k){
              //           if(returnDataForEmailing[k].to == tmpObj.to){
              //             for(var l = 0; l < tmpProductsHolder.length; ++l){
              //               returnDataForEmailing[k].products.push(tmpProductsHolder[l]);
              //             }
              //
              //           }
              //         }
              //       }
              //       else{
              //         tmpObj.products = tmpProductsHolder;
              //         returnDataForEmailing.push(tmpObj);
              //       }
              //
              //     }
              //
              //   }
              //
              // }

              // returnDataForNotifying.products = returnDataForNotifying.products.filter((thing, index, self) =>
              //   index === self.findIndex((t) => (
              //     t.product_id === thing.product_id && t.product_name === thing.product_name && t.amount === thing.amount && t.critical_value === thing.critical_value
              //   ))
              // )
              //
              // if(returnDataForNotifying.products.length > 0){
              //   var content = 'Opozorilo! : <br>';
              //   for(var i = 0; i < returnDataForNotifying.products.length; ++i){
              //     content += returnDataForNotifying.products[i].product_name + ',' + returnDataForNotifying.products[i].amount + ',' + returnDataForNotifying.products[i].critical_value + ',' + '<br>';
              //   }
              //   content += '<br><br>';
              //   var notificationData = {};
              //   notificationData.id = uuid.v1();
              //   notificationData.type = 'stockReminder_notification';
              //   notificationData.content = content;
              //   notificationData.forWho = 'Admin';
              //
              //   Notifications.createNotification(notificationData).then(function(){
              //     socketService.emitStockCriticalAmount(returnDataForNotifying);
              //   });
              // }
              // else{
              //   console.log('niente')
              // }
              // mailingService.sendStockRemindersMails(returnDataForEmailing);
      //      });
      //    });
        }
        else{
          console.log('ni poslano')
        }

        for(var i=0;i<orders.length;i++){
          order = orders[i];

          Order.getOrderDetails(orders[i].id).then(function(order){
            lang.getLanguageModules(order.lang).then(function(language){
              var textData;
              var item_id;
              if(id_status==1){
                textData = language.languageModules.filter(y=>{
                  return y.name=='mail_complete';
                });
                if (textData)
                  mailingService.createNewOrder(order, textData, id_status);
              }
              else if(id_status==3){
                if (order.additional_discount_id) {
                  let discount = discounts.find(d => {
                    return d.id === order.additional_discount_id
                  })
                  item_id = discount && discount.therapies[0] && discount.therapies[0].therapy_id || discount.accessories[0] && discount.accessories[0].accessory_id
                }
                textData = language.languageModules.filter(y=>{
                  return y.name=='mail_sent';
                });
                if (textData)
                  mailingService.createSentMail(order, textData, id_status, item_id);
              }
              else if(id_status==4){
                if (order.additional_discount_id) {
                  let discount = discounts.find(d => {
                    return d.id === order.additional_discount_id
                  })
                  item_id = discount && discount.therapies[0] && discount.therapies[0].therapy_id || discount.accessories[0] && discount.accessories[0].accessory_id
                }
                textData = language.languageModules.filter(y=>{
                  return y.name=='mail_canceled';
                });
                if (textData)
                  mailingService.createCancelMail(order, textData, id_status, item_id);
              }
              else if(id_status==5){
                textData = language.languageModules.filter(y=>{
                  return y.name=='mail_delivered';
                });
                if (order.additional_discount_id) {
                  let discount = discounts.find(d => {
                    return d.id === order.additional_discount_id
                  })
                  item_id = discount && discount.therapies[0] && discount.therapies[0].therapy_id || discount.accessories[0] && discount.accessories[0].accessory_id
                }
                if (textData) {
                  mailingService.orderDelivered(order, textData, id_status, item_id);
                }
              }
            })
          })

        }
        if (results[0].translations) {
          let translations = JSON.parse(results[0].translations)
          var bulkId = uuid.v4();
          for (let i = 0; i < orders.length; i++) {
            var scenarioKey = "57EF46F2BA28C41B09771400477E2A20";
            if (orders[i].shipping_country && orders[i].shipping_country.toLowerCase() !== "si") {
              scenarioKey = "94662BB64B2FD2FB54BDFE1367499791";
            }
              if (translations[`${orders[i].lang.toUpperCase()}`]) {
                  try {
                      let number = orders[i].shipping_telephone
                      number = (number[0] == '+' ? number.substring(1, number.length) : number)

                      let data = {
                        bulkId,
                        scenarioKey: scenarioKey,
                        destinations: [{
                            to: {
                                phoneNumber: number
                            }
                        }],
                        viber: {
                          text: `${translations[`${orders[i].lang}`]}`
                        },
                        sms: {
                          text: `${translations[`${orders[i].lang}`]}`
                        }
                      }
                      let url = '/omni/1/advanced'
                      if (process.env.NODE_ENV === "production") {
                        infoBipService.sendRequest(data,url).then(result =>{
                          logger.info(result)
                        }).catch(error => {
                        logger.error(error)
                        })

                        logger.info('SMS Sent')
                      }
                  } catch (error) {
                    logger.error(error)
                  }
              }
              // else {
              //   logger.error('No translation')
              // }
          }
      }



        // klaviyoService.addOrderToStore(orderData, {}, req.session.utm, "Started Checkout")
        // console.log('orderBody ~~~~~~~~`', orderBody)


        // klaviyoService.addOrderToStore(
        //   orderBody,
        //   orderBody.customer,
        //   // {
        //   //   email: orders[0].shipping_email,
        //   //   first_name: orders[0].shipping_first_name,
        //   //   last_name: orders[0].shipping_last_name,
        //   //   telephone: orders[0].shipping_telephone,
        //   //   address: orders[0].shipping_address,
        //   //   city: orders[0].shipping_city,
        //   //   postcode: orders[0].shipping_postcode,
        //   //   country: orders[0].shipping_country,
        //   // },
        //   {
        //     utm_medium: orderBody.utm_medium,
        //     utm_source: orderBody.utm_source,
        //     utm_campaign: orderBody.utm_campaign,
        //     utm_content: orderBody.utm_content,
        //   },
        //   new_status.name
        // )


        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("orderController: changeStatus - ERROR: Order.changeStatuses: " + err.message);
        res.status(500).json({success: false, message: "TU: " + err.message});
        return;
      });
    } else {
      res.status(404).json({success: false, message: "Invalid order_status name!"});
    }

  } catch (err) {
    logger.error("orderController: changeStatus - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


module.exports = new orderController();
