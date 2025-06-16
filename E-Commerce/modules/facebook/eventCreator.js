'use strict';
const config = require('../../config/environment');
const bizSdk = require('facebook-nodejs-business-sdk');
const requestIp = require('request-ip');
const { EventRequest, UserData, ServerEvent, Content, CustomData } = bizSdk;
const { v4: uuidv4 } = require('uuid');

const access_token = config.pixel.access_token;
const pixel_id = config.pixel.pixel_id;
const testId = config.pixel.test_id;

function createServerEvent(event, req) {
  const current_timestamp = Math.floor(new Date() / 1000);
  let content;
  let customData;
  let contentIds;

  const clientIp = requestIp.getClientIp(req); // Get client IP

  const ipv4 = clientIp && clientIp.includes('.') ? clientIp : null; // Check if it's IPv4
  const ipv6 = clientIp && clientIp.includes(':') ? clientIp : null; // Check if it's IPv6

  if (req.body.currency === 'Ft') req.body.currency = 'HUF';

  const fbc = req.cookies._fbc; // get fbc from cookies
  const fbp = req.cookies._fbp; // get fbp from cookies

  const userData = new UserData()
    .setClientIpAddress(ipv4 || ipv6) // Use whichever IP address is available
    .setFbc(fbc) // set fbc
    .setFbp(fbp); // set fbp

  const serverEvent = new ServerEvent()
    .setEventName(event)
    .setUserData(userData)
    .setEventTime(current_timestamp)
    .setEventSourceUrl(req.body.url)
    .setEventId(req.body.eventId); // Set event ID from the request

  switch (event) {
    case 'PageView':
      break;
    case 'AddToCart':
      content = new Content()
        .setId(req.body.item.id)
        .setQuantity(req.body.item.quantity)
        .setItemPrice(req.body.item.price)
        .setTitle(req.body.item.name)
        .setBrand(req.body.item.brand)
        .setCategory(req.body.item.category);

      customData = new CustomData()
        .setValue(+(req.body.item.price * req.body.item.quantity).toFixed(2))
        .setContentName(req.body.item.name)
        .setContentIds([req.body.item.id])
        .setContentType('product')
        .setContentCategory(req.body.item.category)
        .setContents([content])
        .setCurrency(req.body.currency);
      serverEvent.setCustomData(customData);
      break;
    case 'ViewContent':
      content = [];
      contentIds = [];
      req.body.item && req.body.item.map(i => {
        const itemContent = new Content()
          .setId(i.id)
          .setTitle(i.name)
          .setBrand(i.brand)
          .setCategory(i.category);
        content.push(itemContent);
        contentIds.push(i.id);
      });

      customData = new CustomData()
        .setContents(content)
        .setContentIds(contentIds)
        .setContentType('product')
        .setContentCategory(req.body.item && req.body.item.length && req.body.item[0].category)
        .setCurrency(req.body.currency);
      serverEvent.setCustomData(customData);
      break;
    case 'InitiateCheckout':
      content = [];
      contentIds = [];
      let checkoutPrice = 0;
      const checkoutTitles = [];
      const checkoutBrands = [];
      req.body.item && req.body.item.map(i => {
        const itemContent = new Content()
          .setId(i.id)
          .setQuantity(i.quantity)
          .setItemPrice(i.price)
          .setTitle(i.name)
          .setBrand(i.brand)
          .setCategory(i.category);
        content.push(itemContent);
        contentIds.push(i.id);
        checkoutPrice += +(i.price * i.quantity);
        checkoutTitles.push(i.name);
        checkoutBrands.push(i.category);
      });

      customData = new CustomData()
        .setValue(checkoutPrice.toFixed(2))
        .setContents(content)
        .setContentType('product')
        .setContentIds(contentIds)
        .setContentName(checkoutTitles.join(', '))
        .setContentCategory(checkoutBrands.join(', '))
        .setNumItems(req.body.item && req.body.item.length)
        .setCurrency(req.body.currency);
      serverEvent.setCustomData(customData);
      break;
    case 'Purchase':
      content = [];
      contentIds = [];
      const purchaseTitles = [];
      const purchaseBrands = [];
      req.body.item && req.body.item.map(i => {
        const itemContent = new Content()
          .setId(i.id)
          .setQuantity(i.quantity)
          .setItemPrice(i.price)
          .setTitle(i.name)
          .setBrand(i.brand)
          .setCategory(i.category);
        contentIds.push(i.id);
        content.push(itemContent);
        purchaseTitles.push(i.name);
        purchaseBrands.push(i.category);
      });

      userData
        .setPhone(req.body.obj.shipping_telephone)
        .setFirstName(req.body.obj.shipping_first_name)
        .setLastName(req.body.obj.shipping_last_name)
        .setCity(req.body.obj.shipping_city)
        .setEmail(req.body.obj.shipping_email);

      customData = new CustomData()
        .setValue(req.body.price)
        .setContents(content)
        .setContentType('product')
        .setContentIds(contentIds)
        .setContentName(purchaseTitles.join(', '))
        .setContentCategory(purchaseBrands.join(', '))
        .setNumItems(req.body.item && req.body.item.length)
        .setCurrency(req.body.currency);
      serverEvent.setCustomData(customData);
      break;
  }

  serverEvent.setActionSource('website');
  const eventsData = [serverEvent];
  const eventRequest = new EventRequest(access_token, pixel_id)
    .setEvents(eventsData)
    .setTestEventCode(testId);

  return eventRequest;
}

exports.default = createServerEvent;