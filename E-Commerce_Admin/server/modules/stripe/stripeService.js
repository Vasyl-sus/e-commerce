const { stripeInstance, publicKey } = require('./stripeInstance');

module.exports.retieveSetupPayment = async ({ setupPaymentId }) => {
  try {
    const sIntent = await stripeInstance.setupIntents.retrieve(setupPaymentId);

    return sIntent;
  } catch (error) {
    console.error(error)

    return {
      message: 'Receive setup payment error: ' + error.message,
      success: false,
    }
  }
}

module.exports.getCustomerPaymentMethod = async ({customer}) => {
  try {
    const paymentMethods = await stripeInstance.paymentMethods.list({
      customer,
      type: 'card',
    });

    return { paymentMethod: paymentMethods.data[0] };
  } catch (error) {
    console.error(error)

    return {
      message: 'Receive setup payment error: ' + error.message,
      success: false,
    }
  }

}

module.exports.paymentIntent = async ({ amount, currency, customer, paymentMethod, metadata }) => {
  try {
    const sIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      payment_method: paymentMethod,
      customer,
      description: metadata.order_id + " :: " + metadata.customer_name + " " + metadata.customer_last_name + " :: " + metadata.customer_country,
      metadata,
      confirm: true,
      off_session: true,
    });

    return { status: sIntent.status, paymentIntent: sIntent }
  } catch (error) {
    console.error(error)

    return {
      message: 'Payment Failed: ' + error.message,
      success: false,
    }
  }
}
