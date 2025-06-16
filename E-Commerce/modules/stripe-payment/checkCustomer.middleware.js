const {stripeInstance} = require('./stripeInstance')

module.exports.checkCustomer = async (req, res, next) => {

  const { customer: sessionCustomer } = req.session
  const { id: customerId } = sessionCustomer
  const { paymentMethodId } = req.body

    let customer

    try {
        customer = await stripeInstance.customers.retrieve(customerId)
    } catch (error) {
        const customerToCreate = {
            email: sessionCustomer.email,
            address: {
                line1: sessionCustomer.address,
                city: sessionCustomer.city,
                postal_code: sessionCustomer.postcode,
                country: sessionCustomer.country,
            },
            name: sessionCustomer.first_name,
            phone: sessionCustomer.telephone,
            payment_method: paymentMethodId,
            shipping: {
                address: {
                    line1: sessionCustomer.shipping_address,
                    city: sessionCustomer.shipping_city,
                    postal_code: sessionCustomer.shipping_postcode,
                    country: sessionCustomer.shipping_country,
                },


        name: sessionCustomer.shipping_first_name,
        phone: sessionCustomer.shipping_telephone,
      },
    }
    try {
      customer = await stripeInstance.customers.create(customerToCreate)
    } catch (e) {
      console.log(e)

      return res.status(402).json({ error: e })
    }
  }

    req.customer = customer

    next()
}