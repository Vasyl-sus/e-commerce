var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var GoogleSheetOrder = require('./googleSheetOrderModel.js');
var config = require('../../config/environment/index');

var googlesheetKey = config.googlesheetKey;

var googleSheetOrderController = function () {};

googleSheetOrderController.prototype.createGoogleSheet = bluebird.coroutine(function *(req, res) {
  try {
    if (!req.headers.type) {
      res.status(401).json({ success: false, error: "type_required" });
      return;
    } else if (req.headers.type !== 'googlesheet' || !req.query.order_id2) {
      res.status(401).json({ success: false, error: "invalid_required" });
      return;
    } else {
      if (!req.headers['x-api-key']) {
        res.status(401).json({ success: false, error: "key_required" });
        return;
      } else if (req.headers['x-api-key'] !== googlesheetKey) {
        res.status(401).json({ success: false, error: "permission_required" });
        return;
      }
    }

    var orderId2 = req.query.order_id2;
    var orderSpreadData = yield GoogleSheetOrder.getOrderById(orderId2);
    res.status(200).json({success: true, result: orderSpreadData,});
  } catch (err) {
    logger.error("orderController: googlesheet - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new googleSheetOrderController();