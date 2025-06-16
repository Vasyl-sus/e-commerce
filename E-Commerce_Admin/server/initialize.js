var cron = require('node-cron');
var Order = require('./modules/order/orderController');
var config = require("./config/environment");

function initializeNewFields() {
  console.log('[order] [initialize] started');
  try {
    cron.schedule(`*/${config.initialize.perMinute ? config.initialize.perMinute : 1} * * * *`, Order.initializeNewFields);
  } catch (e) {
    console.error('[order] [initialize] error', e)
  }
}

module.exports = {
  initializeNewFields,
};
