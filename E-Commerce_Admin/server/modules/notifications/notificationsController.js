var bluebird = require('bluebird');
var Notifications = require('./notificationsModel.js');

var notificationsController = function () {};

notificationsController.prototype.getNotifications = bluebird.coroutine(function *(req, res) {
    try {
      var {for_who} = req.params;
      var from = req.query.from;
      var returnData = {};
      
      var notifications = yield Notifications.getNotificationsByUserGroup(for_who, from);
      var notificationsData = yield Notifications.getNotificationsCountByUserGroup(for_who);

      returnData.notifications = notifications;
      returnData.unreadNotificationsCount =notificationsData.unreadCount;
      returnData.allNotificationsCount = notificationsData.allCount;

      res.status(200).json({success: true, result: returnData});
    } catch (err) {
      logger.error("notificationsController: getNotifications - ERROR: try-catch: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    }
});

notificationsController.prototype.markNotificationAsRead = function (req, res){
  var {notification_id} = req.params;

  Notifications.markNotificationAsRead(notification_id).then(()=>{
    res.status(200).json({success: true});
    return;
  }).catch(err=>{
    logger.error("notificationsController: markNotificationAsRead - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  });
}

module.exports = new notificationsController();