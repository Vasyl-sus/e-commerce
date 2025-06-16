var express = require('express');
var router = express.Router();
var notificationsController = require('./notificationsController.js');

router.get('/:for_who', notificationsController.getNotifications);
router.put('/:notification_id', notificationsController.markNotificationAsRead);

module.exports = router;