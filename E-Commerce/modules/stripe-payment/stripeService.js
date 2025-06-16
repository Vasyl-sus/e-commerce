const {stripeInstance, publicKey} = require('./stripeInstance');
const pool = require('../../utils/mysqlService');
var config = require('../../config/environment/index');

module.exports.stripeChargeIntent = async ({paymentIntentId, req}) => {
	try {
		const intent = await stripeInstance.paymentIntents.retrieve(paymentIntentId)

		const confirmPaymentRes = await stripeInstance.paymentIntents.confirm(
			intent.id,
		)
		return {status: confirmPaymentRes.status}
	} catch (error) {
		console.error(error)

		return {
			message: 'Payment Failed: ' + error.message,
			success: false,
		}
	}
}

module.exports.createIntent = async ({customer, order}) => {
	const {currency} = order

	// TODO: select payment method
	const paymentMethods = await stripeInstance.paymentMethods.list({
		customer: customer.id,
		type: 'card',
	})
	const paymentMethod = paymentMethods.data[0]

	//TODO: resolve float value
	const amount = order.total * 100
	try {
		const paymentIntent = await stripeInstance.paymentIntents.create({
			amount,
			currency: currency.code,
			metadata: {
				...order.obj,
			},
			customer: customer.id,
			payment_method: paymentMethod.id,
			confirm: true,
			off_session: false,
		})
		console.log(paymentIntent);

		return {
			publicKey,
			clientSecret: paymentIntent.client_secret,
			id: paymentIntent.id,
		}
	} catch (e) {
		return {
			code: 400,
			status: false,
			error: e.message,
		}
	}
}

module.exports.createIntent = async ({ customer, order }) => {
  const { currency } = order

  // TODO: select payment method
  const paymentMethods = await stripeInstance.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  })
  const paymentMethod = paymentMethods.data[0]

  //TODO: resolve float value
  const amount = order.total * 100
  console.log(amount);
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: currency.code,
      metadata: {
        ...order.obj,
      },
      customer: customer.id,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: false,
      setup_future_usage: 'off_session',
    })
    // const connection = await pool.getConnection();
      // const createTableQuery =`CREATE TABLE IF NOT EXISTS ordersCutomers (order_id, customer_id)`;
      // const createRecord = 'INSERT INTO ordersCustomers values (order_id, customer_id)';
    // console.log(connection);
    return {
      status: paymentIntent.status,
      customer: customer.id,
      publicKey,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    }
  } catch (e) {
    return {
      code:400,
      status: false,
      error: e.message,
    }
  }
}

module.exports.createRecord = async function (paymentId, orderId, customerId) {
	try {
		return await new Promise((resolve, reject) => {
			pool.getConnection(async (err, connection) => {
				err && console.log('Error')

				// let queryPromise = new Promise((resolve, reject) => {
				//   queries.push(connection.query(createTableQuery));
				//   queries.push(connection.query(createRecord));
				//   resolve(Promise.all(queries))
				// })
				const selectOrder = `SELECT * FROM orders WHERE id = ${connection.escape(orderId)};`;
				let order;
				try {
					order = await new Promise((resolve, reject) => {
						connection.query(selectOrder, (err, data) => {
							if (err) {
								reject(err);
							}
							resolve(data[0]);
						});
					});
				} catch (e) {
					connection.release()
					console.log(e)
				}
				const createTableQuery = `CREATE TABLE IF NOT EXISTS payments
                                  (
                                      id int
                                  (
                                      11
                                  ) NOT NULL auto_increment, amount int, payment_intent_id varchar
                                  (
                                      255
                                  ), customer_id varchar
                                  (
                                      255
                                  ), order_id varchar
                                  (
                                      255
                                  ), PRIMARY KEY
                                  (
                                      id
                                  ));`;
				const createRecord = `INSERT INTO payments (amount, payment_intent_id, customer_id, order_id ) values (${connection.escape(order.total*100)}, ${connection.escape(paymentId)}, ${connection.escape(customerId)}, ${connection.escape(orderId)});`;

				await connection.query(createTableQuery);

				await connection.query(createRecord)
				await connection.beginTransaction()
				await connection.commit()
				await connection.release()
				resolve({success: true, message: "Record created", status: 200});
			})
		})
	} catch (error) {
		return {success: false, message: "Error was occurred", status: 500}
	}
}

module.exports.getSum = async (orderId) => {
	return await new Promise((resolve) => {
		pool.getConnection(async (err, connection) => {
			err && console.log('Error')

			const selectOrder = `SELECT * FROM payments WHERE order_id = ${connection.escape(orderId)};`;
			try {
				const data =  await new Promise((resolve, reject) => {
					connection.query(selectOrder, (err, data) => {
						connection.release()
						if (err) {
							reject(err);
						}

						resolve(data);
					});
				});
				resolve(data);
			} catch (e) {
				connection.release()
				console.log(e)
			}
		})
	})

}

module.exports.createCustomerSession = async ({ customer }) => {
  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'setup',
    customer,
    success_url: `${config.server.url}/stripe/session-callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.server.url}/stripe/session-cancel`,
  });

  return {
    publicKey,
    session,
  }
}

module.exports.setupPaymentIntent = async ({ customer }) => {
  const sIntent = await stripeInstance.setupIntents.create({
    payment_method_types: ['card'],
    customer,
    usage: 'off_session',
  });

  return {
    publicKey,
    sIntent,
  }
}

module.exports.savePaymentMethod = async ({ card }) => {

  const cardObject = {};
  cardObject.number = card.cardnumber;
  cardObject.exp_month = +card.exptDate.split('/')[0];
  cardObject.exp_year = +('20' + card.exptDate.split('/')[1]);
  cardObject.cvc = card.cvc;

  const paymentMethod = await stripeInstance.paymentMethods.create({
    type: 'card',
    card: cardObject,
  });

  return {
    publicKey,
    paymentMethod,
  }
}

module.exports.attachPaymentMethod = async ({ customer, paymentMethod }) => {
  const pMethod =  await stripeInstance.paymentMethods.attach(
    paymentMethod,
    { customer }
  );

  return {
    publicKey,
    paymentMethod: pMethod,
  }
}

module.exports.updateOrder = async ({paymentId, data}) => {
	  try {
		  const intent = await stripeInstance.paymentIntents.update(paymentId, data)
  	  return {status: intent.status}
	  } catch (error) {
		  console.error(error)
  
		  return {
			  message: 'Payment Failed: ' + error.message,
			  success: false,
		  }
	  }
  }
