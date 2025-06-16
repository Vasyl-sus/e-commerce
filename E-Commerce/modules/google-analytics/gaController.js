'use strict';
const createAndSendEvent = require('./eventCreator');

/**
 * Controller for handling Google Analytics 4 server-side events
 */

/**
 * Send a page_view event to GA4
 */
module.exports.sendPageViewEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('page_view', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (page_view) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send an add_to_cart event to GA4
 */
module.exports.sendAddToCartEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('add_to_cart', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (add_to_cart) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send a view_item event to GA4
 */
module.exports.sendViewItemEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('view_item', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (view_item) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send a begin_checkout event to GA4
 */
module.exports.sendBeginCheckoutEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('begin_checkout', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (begin_checkout) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send a purchase event to GA4
 */
module.exports.sendPurchaseEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('purchase', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (purchase) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Send a view_item_list event to GA4
 */
module.exports.sendViewItemListEvent = async (req, res) => {
  try {
    const response = await createAndSendEvent('view_item_list', req);
    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('GA4 (view_item_list) Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
