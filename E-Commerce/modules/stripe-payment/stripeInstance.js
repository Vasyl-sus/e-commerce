var config = require('../../config/environment/index');

const secretKey = config.stripe.secret_key;
const publicKey = config.stripe.public_key;


const stripeInstance = require('stripe')(secretKey)

module.exports = { stripeInstance, publicKey }
