var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');
var uuid = require('uuid');
var klaviyoService = require('../../utils/klaviyoService')
// var infoBipService = require('../../utils/infoBipService')

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Customer = require('./customerModel.js');
var customerController = function () {};

customerController.prototype.registerNewCustomer = bluebird.coroutine(function *(req, res) {
  try {
    //console.log(validationSchema);
    var customerData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.customerSchema1);
    var valid = validate(customerData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    customerData.email = customerData.email.toLowerCase();

    var customer = yield Customer.getCustomerByEmail(customerData.email);

    if (!customer) {
      customerData.id = uuid.v1();
      Customer.createCustomer(customerData).then((result) => {
          logger.info('Customer created');
          var customerLang = customerData.country;
          if (customerData.country == "SI") {
            customerLang = "SL"
          } else if (customerData.country == "GB") {
            customerLang = "EN"
          }
          var profileData = {
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            location: {
              address1: customerData.address,
              city: customerData.city,
              zip: customerData.postcode,
              country: customerData.country
            },
            phone_number: customerData.telephone,
            properties: {
              language: customerLang
            }
          };
          
          klaviyoService.handleSubscription(customerData.email, profileData, "subscribed").then(results => {
          klaviyoService.addToStore(customerData.email, profileData).then(results1 => {
              res.status(200).json({success: true, id: customerData.id });
            }).catch(err => {
              logger.error("customerController: registerNewCustomer - ERROR: klaviyoService.handleSubscription: "+err.message)
              res.status(500).json({success: false, message: err.message});
              return;
            })
          }).catch(err => {
            logger.error("customerController: registerNewCustomer - ERROR: klaviyoService.handleSubscription: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
          })
      }).catch((err) => {
        logger.error("customerController: registerNewCustomer - ERROR: Customer.createCustomer: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "customer_exists"});
      return;
    }

  } catch (err) {
    logger.error("customerController: registerNewCustomer - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

customerController.prototype.updateCustomer = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; // customer
    var customerData = req.body;
    var subscribe_action = customerData.subscribe_action;
    delete customerData.subscribe_action;

    if(customerData.badges){
      for(var i=0;i<customerData.badges.length;i++){
        customerData.badges[i] = parseInt(customerData.badges[i]);
      }
    }
    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.customerSchema2);
    var valid = validate(customerData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    if(customerData.email){
      customerData.email = customerData.email.toLowerCase();
      var customer = yield Customer.getCustomerByEmail(customerData.email);
      if(customer && customer.id!=id){
        res.status(403).json({success: false, message: "customer_exists"});
        return;
      }
    }

    var customer1 = yield Customer.getCustomerDetails1(id);
    if(!customer1){
      res.status(404).json({success: false, message: "Invalid customer_id!"});
      return;
    }
    customer1.email = customer1.email.toLowerCase();
    var email = customerData.email || customer1.email;

    var tasks = [];
    tasks.push(Customer.updateCustomer(id, customerData));

    // Prepare data for Klaviyo update
    var customerLang = customerData.country;
    if (customerData.country == "SI") {
      customerLang = "SL"
    } else if (customerData.country == "GB") {
      customerLang = "EN"
    }

    var profileData = {
      first_name: customerData.first_name || customer1.first_name,
      last_name: customerData.last_name || customer1.last_name,
      location: {
        address1: customerData.address || customer1.address,
        city: customerData.city || customer1.city,
        zip: customerData.postcode || customer1.postcode,
        country: customerData.country || customer1.country
      },
      phone_number: customerData.telephone || customer1.telephone,
      properties: {
        language: customerLang
      }
    };

    if(customerData.email && customerData.email!=customer1.email){
      // If email changed, transfer subscription and clean old profile
      tasks.push(klaviyoService.transferSubscription(customer1.email, customerData.email));
      tasks.push(klaviyoService.handleSubscription(customer1.email, {}, "cleaned"));
    } else {
      // If email didn't change, just update the profile
      tasks.push(klaviyoService.updateContact(customer1.email, profileData, id));
    }

    // Handle subscription status changes
    if(subscribe_action == "subscribe"){
      tasks.push(klaviyoService.handleSubscription(email, profileData, "subscribed"));
    } else if(subscribe_action == "unsubscribe") {
      tasks.push(klaviyoService.handleSubscription(email, {}, "unsubscribed"));
    }

    bluebird.all(tasks).then(results=>{
      logger.info('Customer updated');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("customerController: updateCustomer - ERROR: bluebird.all(tasks): "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("customerController: updateCustomer - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

customerController.prototype.filterCustomers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Customer.filterCustomers(queryParams));
    tasks.push(Customer.countFilterCustomers(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterCustomers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.filterBDCustomers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.inputDate = req.query.inputDate;
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Customer.filterBDCustomers(queryParams));
    tasks.push(Customer.countFilterBDCustomers(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterBDCustomers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.filterOTOCustomers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Customer.filterOTOCustomers(queryParams));
    tasks.push(Customer.countFilterOTOCustomers(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterOTOCustomers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.deleteCustomer = (req, res) => {
  try {
    var { id } = req.params;

    Customer.deleteCustomer(id).then(result => {
      if(result!=0){
        logger.info('Customer deleted');
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false , message:"Invalid customer_id"});
      }
    }).catch(err => {
      logger.error("customerController: deleteCustomer - ERROR: Customer.deleteCustomer: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("customerController: deleteCustomer - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

// Commented out InfoBip subscription functionality
/*
customerController.prototype.subscribeCustomerToInfoBip = bluebird.coroutine(function *(req, res) {
    try {
      var { id } = req.params;

      var status = req.body

      var customer = yield Customer.getCustomerDetails(id);
      if(!customer){
        res.status(404).json({success: false, message: "Customer doesn't exist"});
        return;
      } else {
        console.log(1221, status.subscribe_action === "subscribe")
        if (status.subscribe_action === "subscribe") {
          infoBipService.createOmniPerson(customer, customer).then(result1=>{
            res.status(200).json({"success": true});
            return;
          }).catch(err=>{
            logger.error("customerController: getCustomerDetails - ERROR: infoBipService.getOmniPerson: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
          });
        } else {
          infoBipService.updateOmniPerson(customer).then(result1=>{
            res.status(200).json({"success": true});
            return;
          }).catch(err=>{
            logger.error("customerController: getCustomerDetails - ERROR: infoBipService.getOmniPerson: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
          });
        }
      }
      }catch (err) {
      logger.error("customerController: subscribeCustomerToInfoBip - ERROR: try-catch: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    }
})
*/

customerController.prototype.getCustomerDetails = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var customer = yield Customer.getCustomerDetails(id);
    if(!customer){
      res.status(404).json({success: false, message: "Customer doesn't exist"});
      return;
    } else {
      logger.info("Getting Klaviyo details for customer:", JSON.stringify({
        id: customer.id,
        email: customer.email
      }, null, 2));

      // Set timeouts for external service calls
      const timeout = 5000; // 5 seconds timeout

      Promise.all([
        Promise.race([
          klaviyoService.getSubscription(customer.email.toLowerCase()).then(result => {
            logger.info("Klaviyo subscription result:", JSON.stringify({
              email: customer.email,
              result: result,
              lists: result.lists,
              segments: result.segments
            }, null, 2));
            return result;
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Klaviyo timeout')), timeout))
        ]).catch(err => {
          logger.error("customerController: getCustomerDetails - ERROR: klaviyoService.getSubscription: "+err.message);
          return { 
            status: 'unknown',
            lists: [],
            segments: []
          }; // Fallback value with empty lists and segments
        })
      ]).then(([klaviyoResult]) => {
        // Basic subscription status
        customer.subscribed = klaviyoResult.status;
        
        // Add Klaviyo detailed subscription information
        customer.klaviyo = {
          lists: klaviyoResult.lists || [],
          segments: klaviyoResult.segments || [],
          profile_id: klaviyoResult.id || null,
          active_segments: klaviyoResult.segments?.filter(segment => segment.is_active)
                                                .map(segment => segment.name)
                                                .sort() || []
        };

        logger.info("Final customer data:", JSON.stringify({
          id: customer.id,
          email: customer.email,
          subscribed: customer.subscribed,
          klaviyo: customer.klaviyo
        }, null, 2));
        
        // Set default InfoBip status since it's commented out
        customer.infoBipSubscribe = "nosubscribe";

        res.status(200).json({success: true, customer: customer});
      }).catch(err => {
        logger.error("customerController: getCustomerDetails - ERROR: Promise.all: "+err.message);
        res.status(500).json({success: false, message: err.message});
      });

    }
  } catch (err) {
    logger.error("customerController: getCustomerDetails - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.getPrecomputedBaza1Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {
      countries: req.query.countries,
      rating: req.query.rating,
      search: req.query.search,
      pageNumber: (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1,
      pageLimit: (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20,
      filter_criteria: 'filterBaza1'
    };

    var results = yield bluebird.all(Customer.getPrecomputedCustomers(queryParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: getPrecomputedBaza1Customers - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
  }
});

customerController.prototype.getPrecomputedBaza2Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {
      countries: req.query.countries,
      rating: req.query.rating,
      search: req.query.search,
      pageNumber: (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1,
      pageLimit: (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20,
      filter_criteria: 'filterBaza2'
    };

    var results = yield bluebird.all(Customer.getPrecomputedCustomers(queryParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: getPrecomputedBaza2Customers - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
  }
});

customerController.prototype.getPrecomputedBaza3Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {
      countries: req.query.countries,
      rating: req.query.rating,
      search: req.query.search,
      pageNumber: (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1,
      pageLimit: (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20,
      filter_criteria: 'filterBaza3'
    };

    var results = yield bluebird.all(Customer.getPrecomputedCustomers(queryParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: getPrecomputedBaza3Customers - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
  }
});

customerController.prototype.getPrecomputedBaza4Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {
      countries: req.query.countries,
      rating: req.query.rating,
      search: req.query.search,
      pageNumber: (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1,
      pageLimit: (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20,
      filter_criteria: 'filterBaza4'
    };

    var results = yield bluebird.all(Customer.getPrecomputedCustomers(queryParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: getPrecomputedBaza4Customers - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
  }
});

customerController.prototype.filterBaza1Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var functionParams = {
      subtract_big: 18,
      subtract_small: 6,
      criteria: "=1"
    }

    var results = yield bluebird.all(Customer.filterBazaCustomers(queryParams, functionParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterBaza1Customers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.filterBaza2Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var functionParams = {
      subtract_big: 24,
      subtract_small: 6,
      criteria: ">1"
    }

    var results = yield bluebird.all(Customer.filterBazaCustomers(queryParams, functionParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterBaza2Customers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

customerController.prototype.filterBaza3Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {};
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var functionParams = {
      subtract_big: 36,
      subtract_small: 3,
      criteria: ">0"
    };

    var results = yield bluebird.all(Customer.filterBazaCustomers(queryParams, functionParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterBaza3Customers - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

customerController.prototype.filterBaza4Customers = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {};
    queryParams.countries = req.query.countries;
    queryParams.rating = req.query.rating;
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var functionParams = {
      subtract_big: 36,
      subtract_small: 6,
      criteria: ">1"
    };

    var results = yield bluebird.all(Customer.filterBazaCustomers(queryParams, functionParams));
    res.status(200).json({success: true, customers: results[0], customersCount: results[1]});
  } catch (err) {
    logger.error("customerController: filterBaza3Customers - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new customerController();
