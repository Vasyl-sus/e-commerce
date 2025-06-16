var express = require('express');
var router = express.Router();
var googleSheetOrderController = require('./googleSheetOrderController.js');

router.get('/', googleSheetOrderController.createGoogleSheet);

module.exports = router;
