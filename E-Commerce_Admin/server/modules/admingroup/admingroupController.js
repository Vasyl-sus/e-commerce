var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Admingroup = require('./admingroupModel.js');

var admingroupController = function () {};

admingroupController.prototype.addNewAdmingroup = bluebird.coroutine(function *(req, res) {
  try {
    var admingroupData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.admingroupSchema1);
    var valid = validate(admingroupData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    admingroupData.id = uuid.v1();

    var admingroup = yield Admingroup.getAdmingroupByName(admingroupData.name);
    //console.log(product);    
    if (!admingroup) {
      Admingroup.createAdmingroup(admingroupData).then((result) => {
          logger.info('Admingroup created');
          logInitdataChange.write();
          res.status(200).json({"success": true, id: admingroupData.id });
      }).catch((err) => {
        logger.error("admingroupController: addNewAdmingroup: Admingroup.createAdmingroup - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "admingroup_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("admingroupController: addNewAdmingroup: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

admingroupController.prototype.updateAdmingroup = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var admingroupData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.admingroupSchema2);
    var valid = validate(admingroupData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var admingroup = yield Admingroup.getAdmingroupDetails(id);
      if(!admingroup){
        res.status(404).json({success: false, message: "Invalid admingroup_id"});
        return;
      }

      var admingroup1 = yield Admingroup.getAdmingroupByName(admingroupData.name);
      if(admingroup1 && admingroup1.id!=id){
        res.status(403).json({success: false, message: "admingroup_exists"});
        return;
      }

      Admingroup.updateAdmingroup(id, admingroupData).then(result => {
        logger.info('Admingroup updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("admingroupController: updateAdmingroup: Admingroup.updateAdmingroup - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }

  } catch (err) {
    logger.error("admingroupController: updateAdmingroup: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

admingroupController.prototype.filterAdmingroups = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Admingroup.filterAdmingroups(queryParams));
    tasks.push(Admingroup.countFilterAdmingroups(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, admingroups: results[0], admingroupsCount: results[1]});
  } catch (err) {
    logger.error("admingroupController: filterAdmingroups: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

admingroupController.prototype.deleteAdmingroup = (req, res) => {
  try {
    var { id } = req.params;

    Admingroup.deleteAdmingroup(id).then(result => {
      if(result!=0) { 
        logger.info('Admingroup deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid admingroup_id"});
      }
    }).catch(err => {
      logger.error("admingroupController: deleteAdmingroup: Admingroup.deleteAdmingroup - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("admingroupController: deleteAdmingroup: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

admingroupController.prototype.getAvailablePermissions = bluebird.coroutine(function *(req, res) {
  try {
    var ag = yield Admingroup.getAdmingroupDetailsByName("Admin");
    if(!ag){
      logger.error("admingroupController: getAvailablePermissions: Admingroup.getAdmingroupDetailsByName - ERROR: Group named Admin is missing!")
      res.status(500).json({success: false, message: "Group named Admin is missing!"});
    } else {
      res.status(200).json({success: true, permissions: ag.permissions});
    }
  } catch (err) {
    logger.error("admingroupController: getAvailablePermissions: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new admingroupController();