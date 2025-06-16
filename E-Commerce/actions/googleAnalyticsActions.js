import axios from "axios";
import { ROOT_URL } from "../constants/constants";

/**
 * Get client ID and user ID from dataLayer
 * @param {Object} data - The data object to enhance with IDs
 * @returns {Object} - The enhanced data object
 */
const enhanceWithIds = (data) => {
  // Get client ID from dataLayer if available
  if (window.dataLayer && !data.client_id) {
    try {
      // Find the most recent client_id from dataLayer
      for (let i = window.dataLayer.length - 1; i >= 0; i--) {
        if (window.dataLayer[i] && window.dataLayer[i].client_id) {
          data.client_id = window.dataLayer[i].client_id;
          break;
        }
      }
    } catch (e) {
      console.log('Error getting client_id from dataLayer:', e.message);
    }
  }
  
  // Get user ID from dataLayer if available
  if (window.dataLayer && !data.user_id) {
    try {
      // Find the most recent user_id from dataLayer
      for (let i = window.dataLayer.length - 1; i >= 0; i--) {
        if (window.dataLayer[i] && window.dataLayer[i].user_id) {
          data.user_id = window.dataLayer[i].user_id;
          break;
        }
      }
    } catch (e) {
      console.log('Error getting user_id from dataLayer:', e.message);
    }
  }
  
  return data;
};

/**
 * Send a page_view event to GA4
 * @param {Object} data - Event data including url and title
 */
export const PageView = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/page-view`, enhancedData)
    .then(response => {
      console.log('GA4 PageView action success');
    })
    .catch(err => {
      console.log('GA4 PageView action error:', err.message);
    });
};

/**
 * Send an add_to_cart event to GA4
 * @param {Object} data - Event data including item details
 */
export const AddToCart = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/add-to-cart`, enhancedData)
    .then(response => {
      console.log('GA4 AddToCart action success');
    })
    .catch(err => {
      console.log('GA4 AddToCart action error:', err.message);
    });
};

/**
 * Send a view_item event to GA4
 * @param {Object} data - Event data including item details
 */
export const ViewItem = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/view-item`, enhancedData)
    .then(response => {
      console.log('GA4 ViewItem action success');
    })
    .catch(err => {
      console.log('GA4 ViewItem action error:', err.message);
    });
};

/**
 * Send a begin_checkout event to GA4
 * @param {Object} data - Event data including checkout details
 */
export const BeginCheckout = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/begin-checkout`, enhancedData)
    .then(response => {
      console.log('GA4 BeginCheckout action success');
    })
    .catch(err => {
      console.log('GA4 BeginCheckout action error:', err.message);
    });
};

/**
 * Send a purchase event to GA4
 * @param {Object} data - Event data including purchase details
 */
export const Purchase = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/purchase`, enhancedData)
    .then(response => {
      console.log('GA4 Purchase action success');
    })
    .catch(err => {
      console.log('GA4 Purchase action error:', err.message);
    });
};

/**
 * Send a view_item_list event to GA4
 * @param {Object} data - Event data including items and list name
 */
export const ViewItemList = (data) => {
  const enhancedData = enhanceWithIds(data);
  
  axios.post(`${ROOT_URL}/google-analytics/view-item-list`, enhancedData)
    .then(response => {
      console.log('GA4 ViewItemList action success');
    })
    .catch(err => {
      console.log('GA4 ViewItemList action error:', err.message);
    });
};
