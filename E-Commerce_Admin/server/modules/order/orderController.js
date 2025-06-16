var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Orderstatus = require('../orderstatus/orderstatusModel.js');
var Order = require('./orderModel.js');
var Customer = require('../customer/customerModel.js');
var Admin = require('../admin/adminModel.js');
var Color = require('../color/colorModel.js');
const puppeteer = require('puppeteer');
var XLSX = require('xlsx');
// var cptable = require('codepage');
require("./cptable.js")
require("./cputils.js")
var services = require('../../utils/commonServices.js')
var klaviyoService = require('../../utils/klaviyoService')

var pool = require('../../utils/mysqlService');
var config = require('../../config/environment/index');

const fs = require("fs");

var orderController = function () {};

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function int_round5(num) {
  return Math.ceil(num/5)*5;
}

function compareTherapies(oldT, newT) {
  var changes = null;
  if(oldT && oldT.length>0 && newT && newT.length>0){
    changes = {};
    newT.forEach(nt => {
      var old_found = oldT.find(ot=>{return ot.id==nt.id});
      if(!old_found){
        //added.push(nt);
        for(var i=0;i<nt.products.length;i++){
          if(!changes[nt.products[i].id])
          changes[nt.products[i].id]=0;
          changes[nt.products[i].id] += nt.quantity * nt.products[i].product_quantity;
        }
      }
    });
    oldT.forEach(ot => {
      var new_found = newT.find(nt=>{return ot.id==nt.id});
      if(!new_found){
        //removed.push(ot);
        for(var i=0;i<ot.products.length;i++){
          if(!changes[ot.products[i].id])
          changes[ot.products[i].id]=0;
          changes[ot.products[i].id] -= ot.quantity * ot.products[i].product_quantity;
        }
      }
    });
  }
  return changes;
}

orderController.prototype.addNewOrder = bluebird.coroutine(function *(req, res) {
  try {
    var orderData = req.body;

     //AJV validation
     var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
     var validate = ajv.compile(validationSchema.orderSchema1);
     var valid = validate(orderData);
     if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var adminData = req.admin;

    var tasks = [];

    var statusName = "Neobdelano";

    if (orderData.payment_method_code == "PROFORMA") {
      statusName = "Cakamo_nakazilo";
    }
    tasks.push(Orderstatus.getOrderstatusByName(statusName));
    tasks.push(Customer.getCustomerDetails1(orderData.customer_id));
    tasks.push(Customer.getCustomerByEmail(orderData.email));
    var results = yield bluebird.all(tasks);

    var customer1 = results[2];
    if(customer1 && customer1.id!=orderData.customer_id){
      res.status(403).json({success: false, message: "Customer email already in use."});
      return;
    }
    var customer = results[1];
    if(!customer){
      res.status(403).json({success: false, message: "Invalid customer_id!"});
      return;
    }
    var orderstatus = results[0];
    if(orderstatus){
      orderData.order_status = orderstatus.id;
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
      if (orderData.currency_value) {
        orderData.eur_value = orderData.total / orderData.currency_value;
      }
      orderData.orderhistory = orderhistory;

      // add initial order value
      orderData.initial_order_value = orderData.total - orderData.shipping_fee;
      orderData.initial_shipping_fee = orderData.shipping_fee;
      orderData.initial_currency_value = orderData.currency_value;

  //    let infoBipStatus = yield infoBipService.getOmniPerson(customer.telephone);
  //    console.log("infoBipStatus", infoBipStatus)
      Order.createOrder(orderData, customer).then( async (result) => {
        if(orderData.additional_discount && orderData.additional_discount_data)
        logger.info('Additional discount added');
        logger.info('Order created');
        var DDV = await Order.getCountryDDV(orderData.id);
        res.status(200).json({success: true, data: {id: orderData.id, ddv: DDV, order_id2: result}});
        var orderId2 = await Order.getOrderId2(orderData.id);
        orderData.order_id2 = orderId2.order_id2;
        // Track order in Klaviyo
        klaviyoService.addOrderToStore(orderData, customer);

  //      if (infoBipStatus) {
  //          infoBipService.createOmniPerson(orderData, customer);
  //      }

      }).catch((err) => {
        console.log(err)
        logger.error("orderController: addNewOrder - ERROR: Order.createOrder: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      logger.error("orderController: addNewOrder - ERROR: else: Missing orderstatus Neobdelano!");
      res.status(404).json({success: false, message: "Missing orderstatus: Neobdelano"});
      return;
    }

  } catch (err) {
    logger.error("orderController: addNewOrder - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.updateOrderHistory = bluebird.coroutine(function *(req, res) {
  var { id } = req.params;
  var orderData = req.body;

  let firstHistory = yield Order.getFirstHistory(id);

  if (!firstHistory) {
    logger.error("No history")
    res.status(500).json({success: false, message: "No history"});
    return;
  }

  let firstHistoryData = JSON.parse(firstHistory.data);

  firstHistoryData.total = orderData.total;
  // set shipping fee from first history same as now
  firstHistoryData.shipping_fee = orderData.shipping_fee;
  firstHistory.data = JSON.stringify(firstHistoryData);
  Order.updateOrderHistory(id, firstHistory).then(results => {
    logger.info('Order history updated');

    Order.setInitialOrderInfoSameAsFinal(id).then(() => {
      logger.info('order initial value set same as the final one')
      res.status(200).json({success: true})
    }).catch(e => {
      logger.info('order initial value set same as the final one error', e.message)
      res.status(500).json({success: false, message: e.message});
      return;
    })
  }).catch(err => {
    logger.error("orderController: updateOrderHistory - ERROR: Order.updateOrderHistory: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  });
})

orderController.prototype.updateOrder = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var orderData = req.body;

    if(orderData.badges){
      for(var i=0;i<orderData.badges.length;i++){
        orderData.badges[i] = parseInt(orderData.badges[i]);
      }
    }
    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.orderSchema2);
    var valid = validate(orderData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var oldOrderData = yield Order.getOrderDetails(id);

    if(oldOrderData){
      var datum = false;
      if (Object.keys(orderData).length == 1 && orderData.date_naknadno) {
        datum = true;
      }
      if (Object.keys(orderData).length == 1 && (orderData.storno_status || orderData.declined_order_status)) {
        datum = true;
      }

        if(orderData.shipping_email){
          orderData.shipping_email = orderData.shipping_email.toLowerCase();
          var customer = yield Customer.getCustomerByEmail(orderData.shipping_email);
          if(customer && customer.id!=oldOrderData.customer_id){
            res.status(403).json({success: false, message: "Customer email already in use!", existing_customer_id: customer.id});
            return;
          }
        }

        if(orderData.additional_discount_data && orderData.additional_discount){
          orderData.additional_discount_data.id = uuid.v1();
          orderData.additional_discount_data.isAdditionalDiscount = 1;
          orderData.additional_discount_data.name = "add_" + makeid();
          orderData.additional_discount_id = orderData.additional_discount_data.id;
        }

        var orderhistory = {
          order_id: id,
          responsible_agent_id: oldOrderData.responsible_agent_id,
          isInitialState: 0,
          data: JSON.stringify(orderData)
        };
        orderData.orderhistory = orderhistory;

        if (orderData.total) {
          if (orderData.currency_value) {
            orderData.eur_value = orderData.total / orderData.currency_value;
          } else if (oldOrderData.currency_value) {
            orderData.eur_value = orderData.total / oldOrderData.currency_value;
          }

          if (oldOrderData.initial_order_value) {
            // todo how to deal if currency_value is different from initial currency value
            let upsell_value = 0;
            if ('shipping_fee' in orderData) {
              upsell_value = orderData.total - orderData.shipping_fee - oldOrderData.initial_order_value;
            } else {
              upsell_value = orderData.total - oldOrderData.shipping_fee - oldOrderData.initial_order_value;
            }
            orderData.upsell_value = upsell_value;
            if (orderData.currency_value) {
              orderData.upsell_value_eur = orderData.upsell_value / orderData.currency_value;
            } else if (oldOrderData.currency_value) {
              orderData.upsell_value_eur = orderData.upsell_value / oldOrderData.currency_value;
            }
          }
        }

        //var changes = compareTherapies(oldOrderData.therapies, orderData.therapies);

        Order.updateOrder(id, orderData, oldOrderData.customer_id).then(results => {
          logger.info('Order updated');
          res.status(200).json({success: true})
        }).catch(err => {
          logger.error("orderController: updateOrder - ERROR: Order.updateOrder: "+err)
          res.status(500).json({success: false, message: err.message});
          return;
        });

    } else {
      res.status(404).json({success: false, message: "Invalid order_id"});
    }

  } catch (err) {
    logger.error("orderController: updateOrder - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.updateOrderReklamacija = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var orderData = {}

    var oldOrderData = yield Order.getOrderDetails(id);

    if(oldOrderData){
        orderData.discount = oldOrderData.total;
        orderData.total = 0;
        orderData.discount_id = 111;

        var orderhistory = {
          order_id: id,
          responsible_agent_id: oldOrderData.responsible_agent_id,
          isInitialState: 0,
          data: JSON.stringify(orderData)
        };
        orderData.orderhistory = orderhistory;

        Order.updateOrder(id, orderData, oldOrderData.customer_id).then(results => {
          logger.info('Order updated updateOrderReklamacija');
          res.status(200).json({success: true})
        }).catch(err => {
          logger.error("orderController: updateOrder - ERROR: Order.updateOrder: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        });
    } else {
      res.status(404).json({success: false, message: "Invalid order_id"});
    }

  } catch (err) {
    logger.error("orderController: updateOrder - ERROR: try-catch: "+err.message)
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

    var tasks=[];
    tasks.push(Orderstatus.getOrderstatusByName(new_status));
    tasks.push(Order.getOrdersDetails(ids));
    var results = yield bluebird.all(tasks);
    if(results[0]){

      var orders = results[1];
      var emails = results[1].map(x => {
        return x.shipping_email;
      });

      var new_status=results[0];

      Order.changeStatus(ids, new_status, orders).then(result => {
        logger.info('Order status updated');
        for(var i=0;i<emails.length;i++){
          mailingService.changeOrderStatus(emails[i], new_status);
        }
        res.status(200).json({"success": true});
      }).catch(err => {
        logger.error("orderController: changeStatus - ERROR: Order.changeStatus: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(404).json({success: false, message: "Invalid order_status name!"});
    }

  } catch (err) {
    logger.error("orderController: changeStatus - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.filterOrders = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.order_statuses = req.query.order_statuses;
    queryParams.products = req.query.products;
    queryParams.countries = req.query.countries;
    queryParams.from_date = req.query.from_date;
    queryParams.to_date = req.query.to_date;
    queryParams.search = req.query.search;
    queryParams.influencer = req.query.influencer;
    queryParams.view = req.query.view;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    if(queryParams.from_date)
      queryParams.from_date=parseInt(queryParams.from_date);
    if(queryParams.to_date)
      queryParams.to_date=parseInt(queryParams.to_date);

    var tasks = [];
    tasks.push(Order.filterOrders(queryParams))
    tasks.push(Order.countFilterOrders(queryParams))

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, "orders": results[0], "ordersCount": results[1]});
  } catch (err) {
    logger.error("orderController: filterOrders - ERROR: try-catch: "+err.message)
    res.status(500).json({"success": false, "message": err.message});
    return;
  }
})

orderController.prototype.getOrderDetails = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var order = yield Order.getOrderDetails(id);

    if(!order){
      res.status(404).json({success: false, message: "Order doesn't exist"});
    } else {

      if (order.order_status.name === "Storno") {
        order.therapies.map(t => {
          t.total_price *= -1;
        })
        order.accessories.map(t => {
          t.reduced_price *= -1;
        })

        order.shipping_fee = -Math.abs(order.shipping_fee);
        order.discount = -Math.abs(order.discount);
        order.additional_discount = -Math.abs(order.additional_discount);
      }

      res.status(200).json({"success": true, order: order});
    }

  } catch (err) {
    logger.error("orderController: getOrderDetails - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.deleteOrder = (req, res) => {
  try {
    var { id } = req.params;

    Order.deleteOrder(id).then(result => {
      if(result!=0) {
        logger.info('Order deleted');
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false , message:"Invalid order_id"});
      }
    }).catch(err => {
      logger.error("orderController: deleteOrder - ERROR: Order.deleteOrder: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("orderController: deleteOrder - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

orderController.prototype.addComment = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var comment = req.body;

    var order = yield Order.getOrderDetails(id);
    if(!order){
      res.status(404).json({success: false, message: "Order doesn't exist"});
    } else {
      Order.addComment(id, comment.author, comment.content).then(result => {
        logger.info('Order_Comment added');
        res.status(200).json({"success": true, id: result});
      }).catch(err => {
        deleteOrder
        res.status(500).json({success: false, message: err.message});
        return;
      })
    }
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.deleteComment = (req, res) => {
  try {
    var { comment_id } = req.params;
    //var comment = req.body;

    Order.deleteComment(comment_id).then(result => {
      if(result!=0) {
        logger.info('Order_Comment deleted');
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({"success": false, message: "Invalid comment_id"});
      }
    }).catch(err => {
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

/* orderController.prototype.addTherapy = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var therapy_id = req.body.therapy_id;
    var quantity = req.body.quantity;

    var order = yield Order.getOrderDetails(id);
    if(!order){
      res.status(404).json({success: false, message: "Order doesn't exist"});
    } else {
      var find_therapy=order.therapies.filter(x=>{
        return x.id==therapy_id;
      })
      if(find_therapy[0] && find_therapy[0].id){
        res.status(403).json({success: false, message: "Order_therapy exsists"});
      } else {
        Order.addTherapy(id, therapy_id, quantity).then(result => {
          logger.info('Order_Therapy added');
          res.status(200).json({"success": true, id: result});
        }).catch(err => {
          res.status(500).json({success: false, message: err.message});
          return;
        });
      }
    }

  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.deleteTherapy = (req, res) => {
  try {
    var { therapy_id } = req.params;

    Order.deleteTherapy(therapy_id).then(result => {
      if(result!=0){
        logger.info('Order_Therapy deleted');
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({"success": false, message: "Invalid order_therapy_id"});
      }
    }).catch(err => {
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

orderController.prototype.addEmail = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var email = req.body.email;

    var order = yield Order.getOrderDetails(id);
    if(!order){
      res.status(404).json({success: false, message: "Order doesn't exist"});
    } else {
      var find_email=order.emails.filter(x=>{
        return x.email==email;
      })
      if(find_email[0] && find_email[0].email){
        res.status(403).json({success: false, message: "Order_email exsists"});
      } else {
        Order.addEmail(id, email).then(result => {
          logger.info('Order_Email added');
          res.status(200).json({"success": true, id: result});
        }).catch(err => {
          res.status(500).json({success: false, message: err.message});
          return;
        });
      }
    }

  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.deleteEmail = (req, res) => {
  try {
    var { email_id } = req.params;

    Order.deleteEmail(email_id).then(result => {
      if(result!=0){
        logger.info('Order_Email deleted');
        res.status(200).json({"success": true});
      } else {
        res.status(404).json({"success": false, message: "Invalid email_id"});
      }
    }).catch(err => {
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    res.status(500).json({success: false, message: err.message});
    return;
  }
}
*/

orderController.prototype.setOrdersAgent = bluebird.coroutine(function *(req, res) {
  try {
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.setOrdersAgentSchema);
    var valid = validate(req.body);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var order_ids = req.body.order_ids;
    var admin_id = req.body.admin_id;

    var admin = yield Admin.getAdminDetails(admin_id)
    if(admin){
      var orderhistory = yield Order.getFullOrdersHistory(order_ids);
      Order.setOrdersAgent(order_ids, admin, orderhistory).then(result => {
        logger.info('Orders agent updated');
        res.status(200).json({success: true, orders_updated_count: result});
      }).catch(err => {
        logger.error("orderController: setOrdersAgent - ERROR: Order.setOrdersAgent: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(404).json({success: false, message: "Invalid admin_id!"});
    }

  } catch (err) {
    logger.error("orderController: setOrdersAgent - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.setOrdersColor = bluebird.coroutine(function *(req, res) {
  try {
    var changeColorsData = req.body;
    changeColorsData.admin_id = req.admin.id;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.setOrdersColorSchema);
    var valid = validate(changeColorsData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var color = yield Color.getColorDetails(changeColorsData.color_id)
    if(color){
      Order.setOrdersColor(changeColorsData).then(result => {
        logger.info('Orders color updated');
        res.status(200).json({success: true, orders_updated_count: result});
      }).catch(err => {
        logger.error("orderController: setOrdersColor - ERROR: Order.setOrdersColor: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(404).json({success: false, message: "Invalid color_id!"});
    }

  } catch (err) {
    logger.error("orderController: setOrdersColor - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.createInvoice = async function (req, res) {
  await generateInvoices(req, res, services.makeInvoiceHtml, "invoices.pdf");
};

orderController.prototype.createProforma = async function (req, res) {
  await generateInvoices(req, res, services.makeProformaHtml, "proforma-invoices.pdf");
};

orderController.prototype.createInvoiceKnjizara = async function (req, res) {
  await generateInvoices(req, res, services.makeInvoiceHtmlKnjizara, "knjizara-invoices.pdf");
};

async function generateInvoices(req, res, htmlGenerator, filename) {
  try {
    const ids = req.body.ids;
    const orders = await Order.getOrderDetails1(ids);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }

    // Generate multi-page PDF
    const pdfBuffer = await generateMultiPagePdf(orders, htmlGenerator);

    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new Error("Generated PDF buffer is empty");
    }

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);

    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error(`Error in ${filename}:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function generateSingleInvoicePdf(order, htmlGenerator, browser) {
  const page = await browser.newPage();

  // Log network requests
  page.on('request', request => {
    console.log('Request:', request.url());
  });

  page.on('requestfailed', request => {
    console.log('Request failed:', request.url(), request.failure().errorText);
  });



  const invoiceHtml = htmlGenerator(order);

  await page.setContent(invoiceHtml, { waitUntil: "networkidle0" });

  // Generate PDF as a Buffer
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

  await page.close(); // Close only the page, not the browser

  return pdfBuffer;
}

async function generateMultiPagePdf(orders, htmlGenerator) {
  const { default: PDFMerger } = await import("pdf-merger-js");
  const merger = new PDFMerger();

  // ✅ 1. Use a single browser instance
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });



  // ✅ 2. Generate PDFs in parallel for better performance
  const pdfBuffers = await Promise.all(
    orders.map(async (order) => {
      try {
        return await generateSingleInvoicePdf(order, htmlGenerator, browser);
      } catch (err) {
        console.error(`❌ Error processing Order ${order.id}: ${err.message}`);
        return null; // Prevents stopping execution if one fails
      }
    })
  );

  await browser.close();

  // ✅ 3. Merge PDFs from Buffers instead of file system
  for (const buffer of pdfBuffers.filter((b) => b)) {
    await merger.add(buffer);
  }

  return await merger.saveAsBuffer();
}



var thankYouLetter = require('../../utils/thankyoyletter')
orderController.prototype.createThankYou = async function (req, res) {
  try {
    var ids = req.body.ids;
    var customers = await Order.getCustomers(ids);

    var html;
    if(customers && customers.length > 0) {
      html = '';
      for(let i = 0; i < customers.length; i++){
        html += thankYouLetter(customers[i]);
      }

      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(html);
      const buffer = await page.pdf({ format: 'A4' });
      await browser.close();

      res.status(200);
      res.setHeader('Content-Disposition', 'attachment; filename=thank_you.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } else {
      html = '';

      var orders = await Order.getOrdersDetails(ids);

      if (orders && orders.length > 0) {
        for(let i = 0; i < orders.length; i++){
          html += thankYouLetter({
            shipping_first_name: orders[i].shipping_first_name,
            shipping_last_name: orders[i].shipping_last_name,
            country: orders[i].shipping_country
          });
        }

          const browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const buffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.status(200);
        res.setHeader('Content-Disposition', 'attachment; filename=thank_you.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
      } else {
        res.status(404).json({success: false, message: "No orders found!"});
      }
    }
  } catch (err) {
    logger.error("orderController: createThankYou - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
  }
};


createExcel = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="Test sheet ";
  var ws_header = { header:["ID","Ime","Priimek","Naslov"] }
  var ws_data = [];

  for(var i=0;i<orders.length;i++){
    ws_data.push({ID: orders[i].order_id, Ime: orders[i].shipping_first_name, Priimek: orders[i].shipping_last_name, Naslov: orders[i].shipping_address});
  }

  var ws=XLSX.utils.json_to_sheet(ws_data,ws_header);
  XLSX.utils.book_append_sheet(wb,ws,ws_name);
  //XLSX.writeFile(wb, 'test_excel.xlsx');
  var buf = XLSX.write(wb,  {type:'buffer', bookType: "xlsx"});
  return buf;
}

orderController.prototype.createExcel = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrderDetails1(ids);

    var buffer=createExcel(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcel - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

createExcelGLS = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="GLS";
  var ws_header = { header:["ODKUPNINA","REFERENCA","NAZIV","NASLOV", "POŠTNA ŠT.",
                            "DRŽAVA", "MESTO", "ŠTEVILO PAKETOV", "EMAIL", "KONTAKTNI TELEFON"] }
  var ws_data = [];



  for(var i=0;i<orders.length;i++){
    var ototal = orders[i].total;
    var country = orders[i].shipping_country;
    country = country == 'SI' ? 'SLOVENIA' : country == 'HU' ? 'HUNGARY' : country == 'CZ' ? 'CZECH' : country == 'HR' ? 'CROATIA' : country == 'SK' ? 'SLOVAKIA' : ''

    if (country === 'HUNGARY') {
      ototal = int_round5(ototal);
    }
    ws_data.push({
      "ODKUPNINA": ototal,
      "REFERENCA": orders[i].order_id2,
      "NAZIV": orders[i].shipping_first_name + " " + orders[i].shipping_last_name,
      "NASLOV": orders[i].shipping_address,
      "POŠTNA ŠT.": orders[i].shipping_postcode,
      "DRŽAVA": country,
      "MESTO": orders[i].shipping_city,
      "ŠTEVILO PAKETOV": 1,
      "EMAIL": orders[i].shipping_email,
      "KONTAKTNI TELEFON": orders[i].shipping_telephone.charAt(0) == '+' ? '"' + orders[i].shipping_telephone.replace('+','00') + '"'  :  '"' + orders[i].shipping_telephone + '"'
    });
    if(orders[i].payment_method_code != 'cod'){
      delete ws_data[i]['REFERENCA']
      delete ws_data[i]['ODKUPNINA']
    }
  }

  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "csv", FS: ";", raw: true});
  return buf;
}

orderController.prototype.createExcelGLS = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrdersDetails(ids);

    var buffer=createExcelGLS(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelGLS - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


createExcelZasilkovna = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="Zasilkovna";
  var ws_header = { header:["RESERVED","ORDER NUMBER","NAME","SURNAME", "COMPANY",
                            "E-MAIL", "PHONE", "COD", "CURRENCY", "VALUE", "WEIGHT", "PICKUP POINT OR CARRIER", "SENDER LABEL", "ADULT CONTENT", "DELAYED DELIVERY", "STREET", "HOUSE NUMBER", "CITY", "ZIP", "CARRIER PICKUP POINT", "SIZE - WIDTH", "SIZE - HEIGHT", "SIZE - DEPTH"], skipHeader:true }
  var ws_data = [];

  ws_data.push({
    "RESERVED": "version5",
  });

  ws_data.push({
    "RESERVED": " ",
  });

  for(var i=0;i<orders.length;i++){
    var formatedAddress = formatAddress(orders[i].shipping_address)
    var hisnaStevilka = formatedAddress ? formatedAddress[0] : '';
    var address = orders[i].shipping_address.slice(0,formatedAddress && formatedAddress.index || orders[i].shipping_address.length)
    var country = orders[i].shipping_country;
    var currency = country == 'SI' ? 'EUR' : country == 'HU' ? 'HUF' : country == 'HR' ? 'EUR' : country == 'CZ' ? 'CZK' : country == 'SK' ? 'EUR' : ''
    var carrier = country == 'SI' ? '19515' : country == 'SK' ? '131' : country == 'HU' ? '4159' : country == 'CZ' ? '106' : country =='HR' ? '10618' : ''
    var ototal = orders[i].total;

    if (country === 'HU') {
      ototal = int_round5(ototal);
    }



    ws_data.push({
      "RESERVED": "",
      "ORDER NUMBER": orders[i].order_id2,
      "NAME": orders[i].shipping_first_name,
      "SURNAME": orders[i].shipping_last_name,
      "COMPANY": "",
      "E-MAIL": orders[i].shipping_email,
      "PHONE": orders[i].shipping_telephone,
      "COD": ototal,
      "CURRENCY": currency,
      "VALUE": ototal,
      "WEIGHT": "0.250",
      "PICKUP POINT OR CARRIER": carrier,
      "SENDER LABEL": "E-commerce",
      "ADULT CONTENT": "",
      "DELAYED DELIVERY": "",
      "STREET": address,
      "HOUSE NUMBER": hisnaStevilka,
      "CITY": orders[i].shipping_city,
      "ZIP": orders[i].shipping_postcode,
      "CARRIER PICKUP POINT": "",
      "SIZE - WIDTH": "",
      "SIZE - HEIGHT": "",
      "SIZE - DEPTH": ""
    });
    if(orders[i].payment_method_code != 'cod'){
      delete ws_data[i+2]["COD"]
      delete ws_data[i+2]["CURRENCY"]
    }
  }

  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "xlsx", FS: ";"});
  return buf;
}

orderController.prototype.createExcelZasilkovna = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrdersDetails(ids);

    var buffer=createExcelZasilkovna(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelZasilkovna - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

createExcelExpedico = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="Expedico";
  var ws_header = { header:["RESERVED","ORDER NUMBER","NAME","SURNAME", "COMPANY",
                            "E-MAIL", "PHONE", "COD", "CURRENCY", "VALUE", "WEIGHT", "PICKUP POINT OR CARRIER", "SENDER LABEL", "ADULT CONTENT", "DELAYED DELIVERY", "STREET", "HOUSE NUMBER", "CITY", "ZIP", "CARRIER PICKUP POINT", "SIZE - WIDTH", "SIZE - HEIGHT", "SIZE - DEPTH"], skipHeader:true }
  var ws_data = [];

  ws_data.push({
    "RESERVED": "version5",
  });

  ws_data.push({
    "RESERVED": " ",
  });

  for(var i=0;i<orders.length;i++){
    var formatedAddress = formatAddress(orders[i].shipping_address)
    var hisnaStevilka = formatedAddress ? formatedAddress[0] : '';
    var address = orders[i].shipping_address.slice(0,formatedAddress && formatedAddress.index || orders[i].shipping_address.length)
    var country = orders[i].shipping_country;
    var currency = country == 'SI' ? 'EUR' : country == 'HU' ? 'HUF' : country == 'HR' ? 'EUR' : country == 'CZ' ? 'CZK' : country == 'SK' ? 'EUR' : ''
    var carrier = country == 'SK' ? '131' : country == 'HU' ? '4159' : country == 'CZ' ? '106' : country =='HR' ? '4646' : ''
    var ototal = orders[i].total;

    if (country === 'HU') {
      ototal = int_round5(ototal);
    }



    ws_data.push({
      "RESERVED": "",
      "ORDER NUMBER": orders[i].order_id2,
      "NAME": orders[i].shipping_first_name,
      "SURNAME": orders[i].shipping_last_name,
      "COMPANY": "",
      "E-MAIL": orders[i].shipping_email,
      "PHONE": orders[i].shipping_telephone,
      "COD": ototal,
      "CURRENCY": currency,
      "VALUE": ototal,
      "WEIGHT": "0.250",
      "PICKUP POINT OR CARRIER": carrier,
      "SENDER LABEL": "E-commerce",
      "ADULT CONTENT": "",
      "DELAYED DELIVERY": "",
      "STREET": address,
      "HOUSE NUMBER": hisnaStevilka,
      "CITY": orders[i].shipping_city,
      "ZIP": orders[i].shipping_postcode,
      "CARRIER PICKUP POINT": "",
      "SIZE - WIDTH": "",
      "SIZE - HEIGHT": "",
      "SIZE - DEPTH": ""
    });
    if(orders[i].payment_method_code != 'cod'){
      delete ws_data[i+2]["COD"]
      delete ws_data[i+2]["CURRENCY"]
    }
  }

  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "csv", FS: ";"});
  return buf;
}

orderController.prototype.createExcelExpedico = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrdersDetails(ids);

    var buffer=createExcelExpedico(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelExpedico - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


createExcelCustomList = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="CustomList";
  var ws_header = { header:["DATUM NAROČILA","ORDER ID","IME IN PRIIMEK","NASLOV", "EMAIL",
                            "TELEFONSKA", "SKUPAJ", "TERAPIJE", "DODATKI", "NAČIN PLAČILA", "NAČIN DOSTAVE"] }
  var ws_data = [];

  for(var i=0;i<orders.length;i++){
    var country = orders[i].shipping_country;
    country = country == 'SI' ? 'Slovenia' : country == 'HU' ? 'Hungary' : country == 'CZ' ? 'Czech' : country == 'HR' ? 'Croatia' : country == 'SK' ? 'Slovakia' : ''
    ws_data.push({
      "DATUM NAROČILA": orders[i].date_added,
      "ORDER ID": orders[i].order_id2,
      "IME IN PRIIMEK": orders[i].shipping_first_name + " " + orders[i].shipping_last_name,
      "NASLOV": orders[i].shipping_address + ", " + orders[i].shipping_postcode + orders[i].shipping_city + ", " + country,
      "EMAIL": orders[i].shipping_email,
      "TELEFONSKA": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "SKUPAJ": orders[i].total,
      "TERAPIJE": orders[i].therapies && orders[i].therapies.map(t => {return t.quantity + "x " + t.name}).join(", "),
      "DODATKI": orders[i].accessories && orders[i].accessories.map(a => {return a.quantity + "x " + a.acc_name + " - " + a.name}).join(", "),
      "NAČIN PLAČILA": orders[i].payment_method_name,
      "NAČIN DOSTAVE": orders[i].delivery_method_code,
    });
  }
  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "xlsx"});
  return buf;
}

orderController.prototype.createExcelCustomList = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrderDetails1(ids);

    var buffer=createExcelCustomList(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelCustomList - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


createExcelStornoList = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="CustomList";
  var ws_header = { header:["DATUM NAROČILA","ORDER ID","IME IN PRIIMEK","NASLOV", "EMAIL",
                            "TELEFONSKA", "SKUPAJ", "TERAPIJE", "DODATKI", "STORNO RAZLOG", "ZAVRNJENO - KLIC"] }
  var ws_data = [];
  for(var i=0;i<orders.length;i++){
    var country = orders[i].shipping_country;
    country = country == 'SI' ? 'Slovenia' : country == 'HU' ? 'Hungary' : country == 'CZ' ? 'Czech' : country == 'HR' ? 'Croatia' : country == 'SK' ? 'Slovakia' : ''
    ws_data.push({
      "DATUM NAROČILA": orders[i].date_added,
      "ORDER ID": orders[i].order_id2,
      "IME IN PRIIMEK": orders[i].shipping_first_name + " " + orders[i].shipping_last_name,
      "NASLOV": orders[i].shipping_address + ", " + orders[i].shipping_postcode + orders[i].shipping_city + ", " + country,
      "EMAIL": orders[i].shipping_email,
      "TELEFONSKA": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "SKUPAJ": orders[i].total,
      "TERAPIJE": orders[i].therapies && orders[i].therapies.map(t => {return t.name}).join(", "),
      "DODATKI": orders[i].accessories && orders[i].accessories.map(a => {return a.name}).join(", "),
      "STORNO RAZLOG": orders[i].storno_status,
      "ZAVRNJENO - KLIC": orders[i].declined_order_status,
      "PRVOTNO NAROČILO": orders[i].primary_order_id,
      "DATUM PRVOTNEGA NAROČILA": orders[i].primary_order_date
    });
  }
  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "xlsx"});
  return buf;
}

orderController.prototype.createExcelStornoList = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrderDetails1(ids);

    var buffer=createExcelStornoList(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelStornoList - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


createExcelTaxList = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="CustomList";
  var ws_header = { header:["ŠT. NAROČILA", "ŠT. NAROČILA STARO", "DATUM NAROČILA","IME IN PRIIMEK","NASLOV", "POŠTNA ŠT.",
                            "MESTO", "EMAIL", "TELEFONSKA", "IZDELKI", "DODATKI", "STROŠKI DOSTAVE", "SKUPAJ"] }
  var ws_data = [];

  for(var i=0;i<orders.length;i++){
    var country = orders[i].shipping_country;
    country = country == 'SI' ? 'Slovenia' : country == 'HU' ? 'Hungary' : country == 'CZ' ? 'Czech' : country == 'HR' ? 'Croatia' : country == 'SK' ? 'Slovakia' : ''
    ws_data.push({
      "ŠT. NAROČILA": orders[i].order_id2,
      "ŠT. NAROČILA STARO": orders[i].order_id,
      "DATUM NAROČILA": orders[i].date_added,
      "IME IN PRIIMEK": orders[i].shipping_first_name + " " + orders[i].shipping_last_name,
      "NASLOV": orders[i].shipping_address,
      "POŠTNA ŠT.": orders[i].shipping_postcode,
      "MESTO": orders[i].shipping_city,
      "EMAIL": orders[i].shipping_email,
      "TELEFONSKA": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "IZDELKI": orders[i].therapies && orders[i].therapies.map(t => {return t.quantity + "x " + t.name}).join(", "),
      "DODATKI": orders[i].accessories && orders[i].accessories.map(a => {return a.quantity + "x " + a.acc_name + " - " + a.name}).join(", "),
      "STROŠKI DOSTAVE": orders[i].shipping_fee,
      "SKUPAJ": orders[i].total,
    });
  }
  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb, {type:'buffer', bookType: "xlsx"});
  return buf;
}

orderController.prototype.createExcelTaxList = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrderDetails1(ids);

    var buffer=createExcelTaxList(orders);

    res.status(200).json({success: true, result: buffer});

  } catch (err) {
    logger.error("orderController: createExcelTaxList - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


createExcelPosta = (orders) => {
  var wb=XLSX.utils.book_new();
  var ws_name="Pošta";
  var ws_header = { header:["VrstaPosiljke","CrtnaKoda", "Naziv", "DodatniNaziv",
                            "Naslov", "PostnaSt", "NazivPoste", "Drzava", "TelSt",
                            "Email", "IdNaslovnika", "Opomba", "Masa", "DodatneStoritve",
                            "Odkupnina", "Vrednost", "VrstaVplDok", "RefX", "Model",
                            "Sklic", "Namen", "OdkupninaVValuti", "Valuta", "Navodilo"] }
  var ws_data = [];
  for(var i=0;i<orders.length;i++){
    ws_data.push({
      'VrstaPosiljke': 138,
      'CrtnaKoda': '',
      'Naziv': orders[i].shipping_first_name + " " + orders[i].shipping_last_name,
      'DodatniNaziv': '',
      'Naslov': orders[i].shipping_address,
      'PostnaSt': orders[i].shipping_postcode,
      'NazivPoste': orders[i].shipping_city,
      'Drzava': 705,
      'TelSt': orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      'Email': orders[i].shipping_email,
      'IdNaslovnika': orders[i].order_id2,
      'Opomba': '',
      'Masa': '',
      'DodatneStoritve': 'ODKBN',
      'Odkupnina': orders[i].total.toString().replace('.',','),
      'Vrednost': '',
      'VrstaVplDok': '',
      'RefX': '',
      'Model': 0,
      'Sklic': orders[i].order_id2,
      'Namen': '',
      'OdkupninaVValuti': '',
      'Valuta': orders[i].currency_code,
      'Navodilo': ''
    });
    if(orders[i].payment_method_code != 'cod'){
      delete ws_data[i]['DodatneStoritve']
      delete ws_data[i]['Odkupnina']
      delete ws_data[i]['Sklic']
    }
  }

  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);

  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  var buf = XLSX.write(wb, {type:'buffer', bookType: "csv", FS: ";"});
  // var strd = cptable.utils.decode(1250, buf);
  // console.log("Strd: " + strd);
  return buf;
}

orderController.prototype.createExcelPosta = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrdersDetails(ids);

    var buffer=createExcelPosta(orders);

    res.status(200).json({success: true, result: buffer});
  } catch (err) {
    logger.error("orderController: createExcelPosta - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

formatAddress = address => {
  var r = /\d+/;
  var s = address;
  var num = (s.match(r));
  var index = address.indexOf(num)
  var chars = 1;
  if (parseInt(num) <= 9) {
      if (address[index + 1]) {
          if (address[index + 1] == '/') {
              num += address[index + 1] + address[index + 2]
              chars = 3
          } else {
              num += address[index + 1]
              chars = 2;
          }
      }
  } else if (parseInt(num) > 9 && parseInt(num) <= 99) {
      chars = 2;
      if (address[index + 2]) {
          if (address[index + 2] == '/') {
              num += address[index + 2] + address[index + 3]
              chars = 4;
          } else {
              num += address[index + 2]
              chars = 3;
          }

      }
  } else if (parseInt(num) > 99 && parseInt(num) < 999) {
      chars = 3;
      if (address[index + 3]) {
          if (address[index + 2] == '/') {
              num += address[index + 3] + address[index + 4]
              chars = 5;
          } else {
              num += address[index + 3]
              chars = 4;
          }
      }
  }
  return num
}

createExcelPostaCroatia = (orders) =>{
  var wb=XLSX.utils.book_new();
  var ws_name="Pošta";
  var ws_header = { header:["broj pošiljke","šifra pošiljatelja","oib pošiljatelja","naziv pošiljatelja","adresa pošiljatelja","kućni broj pošiljatelja","poštanski broj pošiljatelja","mjesto pošiljatelja","zemlja pošiljatelja",
                            "telefon pošiljatelja","mobitel pošiljatelja","e-mail pošiljatelja","šifra primatelja","oib primatelja","naziv primatelja","adresa primatelja","kućni broj primatelja","poštanski broj primatelja",
                            "mjesto primatelja","zemlja primatelja","telefon primatelja","mobitel primatelja","e-mail primatelja","način plaćanja","uslugu plaća","dostava","rok uručenja","širina","visina","dužina",
                            "masa (gr)","vrijednost","otkupnina","vrsta uputnice","poziv na broj","posebno rukovanje","uručenje subotom","povratnica","otpremnica","vrijeme uručenja od","vrijeme uručenja do","glomazno","uručiti osobno",
                            "opis","napomena","interni broj paketa","napomena pošiljke","interni broj pošiljke","pakiranje hpekspres pošiljke","HP ispis adresnice", "Prikup subotom"] }
  var ws_data = [];
  for(var i=0;i<orders.length;i++){
    var formatedAddress = formatAddress(orders[i].shipping_address)
    var hisnaStevilka = formatedAddress ? formatedAddress[0] : '';
    var address = orders[i].shipping_address.slice(0,formatedAddress && formatedAddress.index || orders[i].shipping_address.length)
    ws_data.push({
      "broj pošiljke":'',
      "šifra pošiljatelja":671880,
      "oib pošiljatelja":'',
      "naziv pošiljatelja": 'SELTIS d.o.o. (Lux factor) - Velika Gorica',
      "adresa pošiljatelja": 'Novi sortirni centar (NSC), Poštanska ulica',
      "kućni broj pošiljatelja":9,
      "poštanski broj pošiljatelja":10410,
      "mjesto pošiljatelja":'Velika Gorica',
      "zemlja pošiljatelja":191,
      "telefon pošiljatelja":'',
      "mobitel pošiljatelja":'',
      "e-mail pošiljatelja":'',
      "šifra primatelja":orders[i].order_id2,
      "oib primatelja":'',
      "naziv primatelja": orders[i].shipping_first_name + ' ' + orders[i].shipping_last_name,
      "adresa primatelja":address,
      "kućni broj primatelja":hisnaStevilka,
      "poštanski broj primatelja":orders[i].shipping_postcode,
      "mjesto primatelja":orders[i].shipping_city,
      "zemlja primatelja":191,
      "telefon primatelja": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "mobitel primatelja": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "e-mail primatelja": orders[i].shipping_email,
      "način plaćanja":'Po ugovoru',
      "uslugu plaća":'Pošiljatelj',
      "dostava":'adr',
      "rok uručenja":'D3',
      "širina":'',
      "visina":'',
      "dužina":'',
      "masa (gr)":500,
      "vrijednost":'',
      "otkupnina":orders[i].total,
      "vrsta uputnice":'nalog',
      "poziv na broj": orders[i].shipping_telephone.charAt(0) == '+' ? orders[i].shipping_telephone.replace('+','00') : orders[i].shipping_telephone,
      "posebno rukovanje":'',
      "uručenje subotom":'',
      "povratnica":'',
      "otpremnica":'',
      "vrijeme uručenja od":'',
      "vrijeme uručenja do":'',
      "glomazno":'',
      "uručiti osobno":'',
      "opis":'',
      "napomena":orders[i].order_id2,
      "interni broj paketa":'',
      "napomena pošiljke":orders[i].order_id2,
      "interni broj pošiljke":'',
      "pakiranje hpekspres pošiljke":'',
      "HP ispis adresnice":'',
      "Prikup subotom":'',
    });
    if(orders[i].payment_method_code != 'cod'){
      delete ws_data[i]['Način plaćanja']
      delete ws_data[i]['Uslugu plaća']
      delete ws_data[i]['otkupnina']
      delete ws_data[i]['vrsta uputnice']
    }
  }

  var ws=XLSX.utils.json_to_sheet(ws_data, ws_header);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  var buf = XLSX.write(wb,  {type:'buffer', bookType: "xls"});
  return buf;
}

orderController.prototype.createExcelPostaCroatia = bluebird.coroutine(function *(req, res) {
  try {
    var ids = req.body.ids;
    var orders = yield Order.getOrdersDetails(ids);

    var buffer = createExcelPostaCroatia(orders);

    res.status(200).json({success: true, result: buffer});
  }
  catch (err) {
    logger.error("orderController: createExcelPostaHR - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.duplicateNegativeOrder = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var order = yield Order.getOrdersDetails(id);

    if(!order || order.length == 0) throw new Error('invalid_id')

    var exists = yield Order.checkDuplicateOrderExistence(id)
    if(exists.length != 0) throw new Error('duplicate_already_exists')

    Order.duplicateNegativeOrder(id, order[0].order_status_name)
    .then(result => {
      logger.info('Duplicate created with id: ' + result)
      res.status(200).json({success: true,id:result});
    })
    .catch(error => {
      logger.error("orderController: duplicateOrder - ERROR: Order.duplicateNegativeOrder: "+error.message)
      res.status(500).json({success: false, message: error.message});
    })
  }
  catch (err) {
    logger.error("orderController: duplicateNegativeOrder - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

orderController.prototype.initializeNewFields = async function () {
  return new Promise((resolve, reject) => {
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      const notMigratedOrders = `SELECT id FROM orders WHERE (migrated NOT LIKE 1 OR ISNULL(migrated)) AND (ISNULL(initial_order_value)) LIMIT ${connection.escape(config.initialize.numberOfRecords ? config.initialize.numberOfRecords : 100)}`;

      connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
      connection.query = bluebird.promisify(connection.query);
      connection.rollback = bluebird.promisify(connection.rollback);

      try {
        await connection.beginTransaction();
        let a = new Date().getTime();
        console.log(`${new Date().toLocaleString()} - [order] [initialize] transaction ${a} start`);

        let results = await connection.query(notMigratedOrders);
        console.log(`${(new Date()).toISOString()} - [order] [initialize] ${results.length} records from orders`);

        if (results.length > 0) {
          const ids = results.map(it => connection.escape(it.id));
          const ordersIds = ids.toString();
          const query = `SELECT
                          a.data,
                          a.order_id
                        FROM
                          (
                            SELECT
                              id,
                              order_id,
                              MIN(date_added) first_date
                            FROM
                              orderhistory
                            WHERE
                              isInitialState = 1 AND
                              order_id IN (${ordersIds})
                            GROUP BY
                              order_id
                          ) b
                          INNER JOIN orderhistory a ON a.id = b.id
                          AND a.date_added = b.first_date`;

          let orderHistories = await connection.query(query);
          console.log(`${(new Date()).toISOString()} - [order] [initialize] ${orderHistories.length} records from orderhistory`);

          let updateQueries = '';
          orderHistories.forEach((orderHistory) => {
            var data = orderHistory.data ? JSON.parse(orderHistory.data) : null;
            if (data) {
              var initial_order_value = (data.total ? data.total : 0) - (data.shipping_fee ? data.shipping_fee : 0);
              var initial_shipping_fee = data.shipping_fee ? data.shipping_fee : 0;
              var initial_currency_value = data.currency_value ? data.currency_value : 1;
              var currency_value = data.currency_value ? data.currency_value : 1;
              var initial_order_value_eur = initial_order_value / currency_value;
              if (initial_order_value && initial_order_value_eur) {
                updateQueries +=
                  `\nUPDATE orders
                    SET
                    initial_order_value = ${connection.escape(initial_order_value)},
                    initial_shipping_fee = ${connection.escape(initial_shipping_fee)},
                    initial_currency_value = ${connection.escape(initial_currency_value)},
                    upsell_value = total - ${connection.escape(initial_order_value)} - shipping_fee,
                    upsell_value_eur = (total - ${connection.escape(initial_order_value)} - shipping_fee) / currency_value
                    WHERE
                    id = ${connection.escape(orderHistory.order_id)};`;
              }
            }
          });
          updateQueries += `\nUPDATE orders SET migrated = 1 WHERE id IN (${ordersIds});`
          if (updateQueries) {
            await connection.query(updateQueries);
          }
        }

        await connection.commit();
        connection.release();
        console.log(`${new Date().toLocaleString()} - [order] [initialize] transaction ${a} end`);
        resolve();
      } catch (err) {
        console.error('[order] [initialize] error', err);
        await connection.rollback();
        connection.release();
        reject(err);
      }
    });
  });
};

module.exports = new orderController();
