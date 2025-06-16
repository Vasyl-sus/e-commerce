var bluebird = require('bluebird');
var logger = require('../../utils/logger');
var stripeService = require('./stripeService');
var paymentModel = require('../payment/paymentModel')

var stripeController = function () {};

stripeController.prototype.payDifference = bluebird.coroutine(function *(req, res) {
  try {
    var { setupPaymentId, amount, currency, oldAmount, order_id, customer_name, customer_last_name, customer_email, customer_phone, customer_country } = req.body;
    var setupPayment = yield stripeService.retieveSetupPayment({ setupPaymentId });

    if(!setupPayment){
      res.status(404).json({success: false, message: "Setup Payment Intent doesn't exists!"});
    } else {

      const { paymentMethod } = yield stripeService.getCustomerPaymentMethod({ customer: setupPayment.customer });

      if (paymentMethod) {

        const result = yield stripeService.paymentIntent({
          amount: amount,
          currency,
          paymentMethod: paymentMethod.id,
          customer: paymentMethod.customer,
          metadata: {
            order_id: order_id,
            customer_name: customer_name,
            customer_last_name: customer_last_name,
            customer_email: customer_email,
            customer_phone: customer_phone,
            customer_country: customer_country
          }

        });

        if (!result.paymentIntent) {
          res.status(500).json({success: false, message: result});
          return;
        }

        paymentModel.updatePaymentAmount(setupPaymentId, amount + oldAmount);

        res.status(200).json({"success": true, paymentIntent: result.paymentIntent});
        return;
      } else {

        res.status(404).json({success: false, message: "Payment method doesn't exists!"});
        return;
      }

    }

  } catch (err) {
    logger.error("stripeController: payDifference - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new stripeController();
