'use strict';
const config = require('../../config/environment');
const bizSdk = require('facebook-nodejs-business-sdk');
const EventRequest = bizSdk.EventRequest;
const createServerEvent = require('./eventCreator').default;

const access_token = config.pixel.access_token;
const pixel_id = config.pixel.pixel_id;
const testId = config.pixel.test_id;

module.exports.sendPageViewEvent = async (req, res) => {
  const eventRequest = createServerEvent('PageView', req);

  try {
    const response = await eventRequest.execute();
    return res.json(response);
  } catch (err) {
    console.error('Conversion API (PageView) Error: ', err);
    return res.json(err);
  }
}

module.exports.sendAddToCartEvent = async (req, res) => {
  const eventRequest = createServerEvent('AddToCart', req);

  try {
    const response = await eventRequest.execute();
    return res.json(response);
  } catch (err) {
    console.error('Conversion API (Cart) Error: ', err);
    return res.json(err);
  }
}

module.exports.sendViewContentEvent = async (req, res) => {
  const eventRequest = createServerEvent('ViewContent', req);

  try {
    const response = await eventRequest.execute();
    return res.json(response);
  } catch (err) {
    console.error('Conversion API (ViewContent) Error: ', err);
    return res.json(err);
  }
}

module.exports.sendInitiateCheckoutEvent = async (req, res) => {
  const eventRequest = createServerEvent('InitiateCheckout', req);

  try {
    const response = await eventRequest.execute();
    return res.json(response);
  } catch (err) {
    console.error('Conversion API (InitiateCheckout) Error: ', err);
    return res.json(err);
  }
}

module.exports.sendPurchaseEvent = async (req, res) => {
  const eventRequest = createServerEvent('Purchase', req);

  try {
    const response = await eventRequest.execute();
    return res.json(response);
  } catch (err) {
    console.error('Conversion API (Purchase) Error: ', err);
    return res.json(err);
  }
}