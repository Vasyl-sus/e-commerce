var logger = require('../../utils/logger');
const crypto = require('crypto');
var bluebird = require('bluebird');
var tokenService = require('../../utils/token');
var Admin = require('../admin/adminModel');

var loginController = function () {};

loginController.prototype.loginUser = bluebird.coroutine(function*(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password) {
    res.status(400).json({ success: false, error: "username_password_required" });
    return;
  }
  
  try {
    //encrypt password
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    password = hash;
    var user = yield Admin.getAdminLogin(username, password);
    if (!user) {
        res.status(400).json({ success: false, error: "Wrong username and/or password" });
        return;
    }
    
    var permissions = {};
    //console.log(user.admingroup.permissions)

			
    var filteredGroups = [];
    for (var i = 0; i < user.admingroup.permissions.length; i++) {
      var found = filteredGroups.find(f => {
        return f == user.admingroup.permissions[i].category
      })
      if (!found) {
        filteredGroups.push(user.admingroup.permissions[i].category)
      } 
    }
    user.admingroup.permissions.map(p => {
      if(!permissions[p.route]){
        permissions[p.route]={};
        permissions[p.route][p.method]=true;
      } else {
        permissions[p.route][p.method]=true;
      }
    });
    user.admingroup.permission_names=filteredGroups;
    user.admingroup.permissions = permissions
    var payloadData = {};
    payloadData.email = user.email;
    payloadData.id = user.id;
    payloadData.firstname = user.first_name || null;
    payloadData.lastname = user.last_name || null;
    payloadData.username = user.username;
    payloadData.vcc_username = user.vcc_username || null;
    payloadData.countries = user.countries;
    payloadData.call_countries = user.call_countries;
    payloadData.adminGroup = user.admingroup;

    var type = "admin";
    var token = tokenService.createToken(type, payloadData);
    if (!token) {
      logger.error(`loginController: loginUser - ERROR: tokenService.createToken: Error creating ${type} token`);
      res.status(500).json({ success: false });
      return;
    }
    req.session.token = token;
    req.session.save();

    //var data = {};
    payloadData.token = token;
    payloadData.session_id = req.session.id;

    res.status(200).json({ success: true, data: payloadData });
    return;
  } catch(err) {
    logger.error("loginController: loginUser - ERROR: try-catch: "+err.message)
    res.status(500).json({ success: false, message: err.message });
    return;
  }
})

loginController.prototype.logoutUser = function (req, res, next) {
  var token = req.session.token;

  // if (!token) {
  //   res.status(401).json({ success: false, error: "token_required" });
  //   return;
  // }
  try {
    req.session.destroy(()=>{
      res.status(200).json({success: true});
    });

  } catch (err) {
    logger.error("loginController: logoutUser - ERROR: try-catch: "+err.message)
  }

};

module.exports = new loginController();