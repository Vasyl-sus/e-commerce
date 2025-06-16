const stripeService = require('./stripeService')
var Payment = require('./paymentModel');

module.exports.stripeChargeIntent = async (req, res) => {
	const result = await stripeService.stripeChargeIntent({
		paymentIntentId: req.session.paymentIntentId,
		req,
	})

	return res.json(result)
}

module.exports.createIntent = async (req, res) => {
	const {order} = req.body
	const {cart} = req.session
	const newOrder = {...order, total: cart.total}

	const {customer} = req

	const payment = await stripeService.createIntent({
		customer,
		order: newOrder,
	})
	if (payment.error) {
		console.log('some');
		return res.json({payment})
	}
	req.session.paymentIntentId = payment.id

	return res.json({payment})
}

module.exports.updateOrder = async (req, res) => {
	const {paymentId, data} = req.body

	const payment = await stripeService.updateOrder({paymentId, data})
	if (payment.error) {
		return res.json({payment})
	}
	return res.json({payment})
}

module.exports.createUpsellIntent = async (req, res) => {
    const {paymentIntentId} = req.session
    const order = req.body.order
    const upsell = await stripeService.createUpsellIntent({
        paymentIntentId,
        order,
    })

	res.status(200).json({success: true})
}

module.exports.createCustomerSession = async (req, res) => {
    const session = await stripeService.createCustomerSession({
        customer: req.body.customer,
    })
    return res.json(session)
}

module.exports.setupPaymentIntent = async (req, res) => {
    const intent = await stripeService.setupPaymentIntent({
        customer: req.body.customer,
    })
    return res.json(intent)
}

module.exports.confirmSession = async (req, res) => {
    const sessionId = req.params.session_id;
}

module.exports.createDBPayment = async (req, res) => {
    const { order } = req.body;
    try {
        Payment.paymentIntent(order);
    } catch (err) {
        return res.json({ success: false })
    }

    return res.json({ success: true })
}

module.exports.savePaymentMethod = async (req, res) => {
    const { card, customer } = req.body;
    try {
        const { paymentMethod } = await stripeService.savePaymentMethod({
            card,
        });
        const res = await stripeService.attachPaymentMethod({ customer, paymentMethod: paymentMethod.id });
    } catch (err) {
        return res.json({ success: false });
    }

    return res.json({ success: true });
}

module.exports.attachPaymentMethod = async (req, res) => {
    const { customer, paymentMethod } = req.body;
    try {
        const {res} = stripeService.attachPaymentMethod({ customer, paymentMethod });
    } catch (err) {
        return res.json({ success: false })
    }

    return res.json({ success: true })
}
