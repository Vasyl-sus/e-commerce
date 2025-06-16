'use strict';
const config = require('../../config/environment');
const axios = require('axios');

// GA4 Measurement Protocol endpoint
const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

/**
 * Creates and sends a GA4 event using the Measurement Protocol
 * @param {string} eventName - The GA4 event name
 * @param {object} req - Express request object
 * @returns {Promise} - Promise resolving to the API response
 */
async function createAndSendEvent(eventName, req) {
  try {
    // Get the measurement ID and API secret from config
    const { measurement_id, api_secret } = config.googleAnalytics;
    
    // Build the API URL with measurement ID and API secret
    const apiUrl = `${GA4_ENDPOINT}?measurement_id=${measurement_id}&api_secret=${api_secret}`;
    
    // Get client ID from request body, cookies, or generate a new one
    let clientId;
    
    // First, check if client_id is provided in the request body
    if (req.body.client_id) {
      clientId = req.body.client_id;
    }
    // If not, try to get it from the _ga cookie
    else if (req.cookies && req.cookies._ga) {
      clientId = req.cookies._ga.split('.').slice(-2).join('.');
    }
    // If still not found, generate a new client ID in GA4 format
    else {
      clientId = `${Math.floor(Math.random() * 1000000000)}.${Date.now()}`;
    }
    
    // Event-specific data
    let eventParams = {};
    
    // Configure event data based on event type
    switch (eventName) {
      case 'page_view':
        eventParams = {
          page_location: req.body.url || 'http://example.com',
          page_title: req.body.title || 'Example Page',
          engagement_time_msec: 100
        };
        break;
        
      case 'add_to_cart':
        if (req.body.item) {
          const item = req.body.item;
          eventParams = {
            currency: req.body.currency || 'EUR',
            value: parseFloat((item.price * item.quantity).toFixed(2)),
            items: [{
              item_id: item.id || 'test-id',
              item_name: item.name || 'Test Item',
              price: parseFloat(item.price) || 10.0,
              quantity: parseInt(item.quantity) || 1
            }],
            engagement_time_msec: 100
          };
        }
        break;
        
      case 'view_item':
        if (req.body.item && req.body.item.length) {
          eventParams = {
            currency: req.body.currency || 'EUR',
            value: parseFloat(req.body.item[0].price) || 10.0,
            items: req.body.item.map(item => ({
              item_id: item.id || 'test-id',
              item_name: item.name || 'Test Item',
              price: parseFloat(item.price) || 10.0,
              quantity: parseInt(item.quantity) || 1
            })),
            engagement_time_msec: 100
          };
        }
        break;
        
      case 'begin_checkout':
        if (req.body.item && req.body.item.length) {
          let value = 0;
          const items = req.body.item.map(item => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            value += price * quantity;
            return {
              item_id: item.id || 'test-id',
              item_name: item.name || 'Test Item',
              price: price,
              quantity: quantity
            };
          });
          
          eventParams = {
            currency: req.body.currency || 'EUR',
            value: value.toFixed(2),
            items: items,
            engagement_time_msec: 100
          };
        }
        break;
        
      case 'purchase':
        if (req.body.item && req.body.item.length) {
          const items = req.body.item.map(item => ({
            item_id: item.id || 'test-id',
            item_name: item.name || 'Test Item',
            price: parseFloat(item.price) || 10.0,
            quantity: parseInt(item.quantity) || 1
          }));
          
          eventParams = {
            transaction_id: req.body.obj?.order_id || 'T_' + Date.now(),
            value: parseFloat(req.body.price) || 10.0,
            currency: req.body.currency || 'EUR',
            shipping: parseFloat(req.body.obj?.shipping_fee) || 0,
            items: items,
            engagement_time_msec: 100
          };
        }
        break;
        
      case 'view_item_list':
        if (req.body.items && req.body.items.length) {
          eventParams = {
            item_list_name: req.body.list_name || 'Products list',
            items: req.body.items,
            engagement_time_msec: 100
          };
        } else if (req.body.item && req.body.item.length) {
          // Use the items directly from the request body without mapping
          // This preserves all the original properties like item_id, item_name, etc.
          eventParams = {
            item_list_name: req.body.list_name || 'Products list',
            items: req.body.item,
            engagement_time_msec: 100
          };
        }
        break;
    }
    
    // Prepare the payload
    const payload = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: eventParams
      }]
    };
    
    // Add user_id if provided in the request body
    if (req.body.user_id) {
      payload.user_id = req.body.user_id;
    }
    
    
    // Send the event to GA4
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('GA4 Event Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    throw error;
  }
}

module.exports = createAndSendEvent;
