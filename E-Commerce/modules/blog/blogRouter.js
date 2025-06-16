var express = require('express');
var router = express.Router();
var blogController = require('./blogController.js');


router.get('/', blogController.getBlogposts)
router.get('/categories/', blogController.getCategories)
//router.get('/details/:blogpost_id', blogController.getBlogpostDetails)

//router.post('/cron', cronController.createOtomDiscountsTest)

module.exports = router;