var config = require('../config/environment/index');
var bluebird = require('bluebird');
var md5 = require('md5');
var uuid = require('uuid');
const axios = require('axios');

var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
var base64Credentials = Buffer.from(credentialData).toString('base64');
var headers = {
    "Authorization": "Basic " + base64Credentials
};

var mailchimpService = function() {}

mailchimpService.prototype.getSubscription = async function (email) {
    var url = config.mailchimp.baseUrl + "/lists/" + config.mailchimp.subscribeListId + "/members/" + md5(email.toLowerCase());

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (err) {
        throw err;
    }
};

mailchimpService.prototype.handleSubscription = async function (email, newSubscriberStatus, exsistingSubscriberStatus, type, merge_fields) {
    try {
        email = email.toLowerCase();
        let listId = config.mailchimp.subscribeListId;
        if (type === "checkout") {
            listId = config.mailchimp.checkoutListId;
        }
        
        const url = config.mailchimp.baseUrl + "/lists/" + listId + "/members/" + md5(email);
        
        let response;
        try {
            response = await axios.get(url, { headers });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Member not found, create new one
                const data = {
                    email_address: email,
                    status: newSubscriberStatus,
                    merge_fields
                };
                
                const createResponse = await axios.post(
                    config.mailchimp.baseUrl + "/lists/" + listId + "/members/", 
                    data,
                    { headers }
                );
                
                return createResponse.data;
            }
            throw error;
        }
        
        // Member exists
        const body = response.data;
        
        if (body.status == "cleaned" || body.status == "unsubscribed") {
            if (newSubscriberStatus == "subscribed")
                newSubscriberStatus = "pending";
            if (exsistingSubscriberStatus == "subscribed")
                exsistingSubscriberStatus = "pending";
        }

        const data = {
            status: exsistingSubscriberStatus || newSubscriberStatus
        };
        
        const updateResponse = await axios.patch(url, data, { headers });
        return updateResponse.data;
    } catch (err) {
        throw err;
    }
};

mailchimpService.prototype.addOrderToStore = async function (orderData, customer, utm = {}) {
    try {
        let lines = orderData.therapies.map(t => {
            return {
                id: uuid.v1(),
                product_id: t.id,
                product_variant_id: "1",
                quantity: t.quantity,
                price: t.price
            }
        })
        let data = {
            id: orderData && orderData.order_id2.toString(),
            processed_at_foreign: new Date().toISOString(), // ISO 8601 format mora bit, date and time verjetno...
            customer: {
                id: customer.id,
                email_address: customer.email,
                opt_in_status: true,
                first_name: customer.first_name,
                last_name: customer.last_name,
                address: {
                    address1: customer.address,
                    city: customer.city,
                    postal_code: customer.postcode,
                    country_code: customer.country,
                    phone: customer.telephone
                }
            },
            currency_code: orderData.currency_code === "Ft" ? "HUF" : orderData.currency_code,
            order_total: orderData.total,
            discount_total: orderData.discount,
            shipping_total: parseFloat(orderData.shipping_fee),
            shipping_address: {
                address1: customer.address,
                city: customer.city,
                postal_code: customer.postcode,
                country_code: customer.country,
                phone: customer.telephone
            },
            lines
        }

        if (utm && utm.mc_cid) {
            data.campaign_id = utm.mc_cid
        }

        const url = `${config.mailchimp.baseUrl}/ecommerce/stores/${config.mailchimp.storeId}${customer.country}/orders`;
        
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (err) {
        throw err;
    }
};

mailchimpService.prototype.transferSubscription = async function (source_email, target_email) {
    try {
        source_email = source_email.toLowerCase();
        target_email = target_email.toLowerCase();

        // Get source email subscription status
        let sourceUrl = config.mailchimp.baseUrl + "/lists/" + config.mailchimp.subscribeListId + "/members/" + md5(source_email);
        let newStatus;
        
        try {
            const sourceResponse = await axios.get(sourceUrl, { headers });
            newStatus = sourceResponse.data.status;
        } catch (error) {
            // If source email not found or error, default to unsubscribed
            newStatus = "unsubscribed";
        }

        // Check if target email exists
        const targetUrl = config.mailchimp.baseUrl + "/lists/" + config.mailchimp.subscribeListId + "/members/" + md5(target_email);
        
        try {
            const targetResponse = await axios.get(targetUrl, { headers });
            
            // Target exists, update its status
            if (targetResponse.data.status == "cleaned" || targetResponse.data.status == "unsubscribed") {
                if (newStatus == "subscribed") {
                    newStatus = "pending";
                }
            }
            
            const updateResponse = await axios.patch(
                targetUrl, 
                { status: newStatus }, 
                { headers }
            );
            
            return updateResponse.data;
            
        } catch (error) {
            // Target doesn't exist, create new member
            if (error.response && error.response.status === 404) {
                const createResponse = await axios.post(
                    config.mailchimp.baseUrl + "/lists/" + config.mailchimp.subscribeListId + "/members/",
                    {
                        email_address: target_email,
                        status: newStatus
                    },
                    { headers }
                );
                
                return createResponse.data;
            }
            
            throw error;
        }
    } catch (err) {
        throw err;
    }
};

module.exports = new mailchimpService();
