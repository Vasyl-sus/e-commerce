var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Country = require('../country/countryModel.js');
var Admin = require('./adminModel.js');
var Utmmedium = require('../utmmedium/utmmediumModel')
var Product = require('../product/productModel')
var Therapy = require('../therapy/therapyModel')
var Orderstatus = require('../orderstatus/orderstatusModel')
var Admingroup = require('../admingroup/admingroupModel')
var Deliverymethod = require('../deliverymethod/deliverymethodModel')
var Paymentmethod = require('../paymentmethod/paymentmethodModel')
var Discount = require('../discount/discountModel')
var Gift = require('../gift/giftModel')
var Badge = require('../badge/badgeModel')
var Currency = require('../currency/currencyModel')
var Billboard = require('../billboard/billboardModel')
var Accessory = require('../accessory/accessoryModel')
var Category = require('../category/categoryModel')

var adminController = function () {};


adminController.prototype.initData = bluebird.coroutine(function *(req, res) {
  var localStorageDBVersion = null;

  try {
    localStorageDBVersion = yield logInitdataChange.get();
  } catch (err) {
    logger.error("adminController: initDataVersion - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }

  if (parseInt(localStorageDBVersion.version_counter) === parseInt(req.query.lsVersion)) {
    res.status(200).json({success: true, results: null});
    return;
  }

  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || null;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || null;

    var tasks = [];
    tasks.push(Utmmedium.filterUtmmedia(queryParams));
    tasks.push(Product.filterProducts(queryParams));
    tasks.push(Admin.filterAdmins(queryParams));
    tasks.push(Country.filterCountries(queryParams));
    tasks.push(Therapy.filterTherapies(queryParams));
    tasks.push(Orderstatus.filterOrderstatuses(queryParams));
    tasks.push(Admingroup.filterAdmingroups(queryParams));
    tasks.push(Deliverymethod.filterDeliverymethods(queryParams));
    tasks.push(Paymentmethod.filterPaymentmethods(queryParams));
    tasks.push(Discount.filterDiscounts(queryParams))
    tasks.push(Gift.filterGifts(queryParams));
    tasks.push(Badge.filterBadges(queryParams));
    tasks.push(Currency.filterCurrencies(queryParams));
    tasks.push(Billboard.getAllBillboards());
    tasks.push(Accessory.filterAccessories(queryParams))
    tasks.push(Category.filterCategories(queryParams));
    tasks.push(logInitdataChange.get());

    var results = yield bluebird.all(tasks);

    let obj = {
      utmmediums: results[0],
      products: results[1],
      admins: results[2],
      countries: results[3],
      therapies: results[4],
      orderstatuses: results[5],
      admingroups: results[6],
      deliverymethods: results[7],
      paymentmethods: results[8],
      discounts: results[9],
      gifts: results[10],
      badges: results[11],
      currencies: results[12],
      billboards: results[13],
      accessories: results[14],
      categories: results[15],
      lastinitchange: results[16]
    }

    res.status(200).json({success: true, results: obj});
  } catch (err) {
    logger.error("adminController: filterAdmins - ERROR1: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

adminController.prototype.addNewAdmin = bluebird.coroutine(function *(req, res) {
  try {
    var adminData = req.body;
    
    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.adminSchema1);
    var valid = validate(adminData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var countries = yield Country.getCountriesByNames(adminData.countries);
    if(!countries || (countries && countries.length==0)){
      res.status(403).json({success: false, message: "No valid countries!"});
      return;
    }
    adminData.countries = countries.map(x => { return x.id; });

    if(adminData.call_countries && adminData.call_countries.length>0){
      var call_countries = yield Country.getCountriesByNames(adminData.call_countries);
      if(!call_countries || (call_countries && call_countries.length==0)){
        res.status(403).json({success: false, message: "No valid call countries!"});
        return;
      }
      adminData.call_countries = call_countries.map(x => { return x.id; });
    }

    var admin = yield Admin.getAdminByUsername(adminData.username);
    //console.log(product);
    if (!admin) {
      adminData.id = uuid.v1();
      Admin.createAdmin(adminData).then((result) => {
          logger.info('Admin created');
          logInitdataChange.write();
          res.status(200).json({"success": true, id: adminData.id });
      }).catch((err) => {
        logger.error("adminController: addNewAdmin - ERROR: Admin.createAdmin: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "admin_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("adminController: addNewAdmin - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

adminController.prototype.updateAdmin = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var adminData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.adminSchema2);
    var valid = validate(adminData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var admin1 = yield Admin.getAdminDetails(id);
    if(!admin1){
      res.status(404).json({success: false, message: "Invalid admin_id"});
      return;
    }
    
    if(adminData.countries){
      var countries = yield Country.getCountriesByNames(adminData.countries);
      if(!countries || (countries && countries.length==0)){
        res.status(403).json({success: false, message: "No valid countries!"});
        return;
      }
      adminData.countries = countries.map(x => { return x.id; });
    }

    if(adminData.call_countries && adminData.call_countries.length>0){
      var call_countries = yield Country.getCountriesByNames(adminData.call_countries);
      if(!call_countries || (call_countries && call_countries.length==0)){
        res.status(403).json({success: false, message: "No valid call countries!"});
        return;
      }
      adminData.call_countries = call_countries.map(x => { return x.id; });
    }

    var admin = yield Admin.getAdminByUsername(adminData.username);
    if(admin && admin.id!=id){
      res.status(403).json({success: false, message: "admin_exists"});
      return;
    }
    
    Admin.updateAdmin(id, adminData).then(result => {
      logger.info('Admin updated');
      logInitdataChange.write();
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("adminController: updateAdmin - ERROR: Admin.updateAdmin: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("adminController: updateAdmin - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

adminController.prototype.filterAdmins = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    //console.log(req.session.token)
    var tasks = [];
    tasks.push(Admin.filterAdmins(queryParams));
    tasks.push(Admin.countFilterAdmins(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, admins: results[0], adminsCount: results[1]});
  } catch (err) {
    logger.error("adminController: filterAdmins - ERROR2: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

adminController.prototype.deleteAdmin = (req, res) => {
  try {
    var { id } = req.params;

    Admin.deleteAdmin(id).then(result => {
      if(result!=0) { 
        logger.info('Admin deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid admin_id"});
      }
    }).catch(err => {
      logger.error("adminController: deleteAdmin - ERROR: Admin.deleteAdmin: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("adminController: deleteAdmin - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new adminController();