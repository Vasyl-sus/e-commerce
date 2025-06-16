var Payment = require('./paymentModel.js');
var bluebird = require('bluebird');

var paymentController = function () {};

paymentController.prototype.getPayment = bluebird.coroutine(function *(req, res) {
  try {
    var tasks = [];
    tasks.push(Payment.getPaymentById(req.params.id));
  
    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, payment: results[0] });
  } catch (err) {
    console.log("paymentController: getPayment - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

module.exports = new paymentController();