var config = require('../config/environment/index');
var bluebird = require('bluebird');
var logger = require('./logger');
const axios = require('axios');

var credentialData = config.infoBip.username + ":" + config.infoBip.password;
var base64Credentials = Buffer.from(credentialData).toString('base64');

var headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Basic " + base64Credentials
}

var infoBipService = function () {};

console.log(headers)

infoBipService.prototype.sendRequest = async (post_data, url) => {
  try {
    const response = await axios.post(
      `${config.infoBip.url}${url}`, 
      post_data, 
      { headers }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

infoBipService.prototype.getOmniReport = async (url) => {
  try {
    const response = await axios.get(
      `${config.infoBip.url}${url}`, 
      { headers }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

infoBipService.prototype.getOmniPerson = async (phone) => {
  var credentialData = config.infoBip.otherusername + ":" + config.infoBip.password;
  var base64Credentials = Buffer.from(credentialData).toString('base64');

  var customHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Basic " + base64Credentials
  }
  try {
    const response = await axios.get(
      `${config.infoBip.url}/people/2/persons?phone=${phone.substring(1, phone.length)}`, 
      { headers: customHeaders }
    );
    logger.info("get infobip person response", JSON.stringify(response.status))
    return response.data;
  } catch (err) {
    throw err;
  }
}

infoBipService.prototype.createOmniPerson = async (customer) => {
  var credentialData = config.infoBip.otherusername + ":" + config.infoBip.password;
  var base64Credentials = Buffer.from(credentialData).toString('base64');

  var customHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Basic " + base64Credentials
  }
  try {
    let personData = {
      externalId: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      birthDate: customer.birthdate,
      contactInformation: {
        phone: [
          {
            number: customer.telephone.substring(1, customer.telephone.length)
          }
        ],
        email: [
          {
            address: customer.email
          }
        ]
      }
    }

    try {
      const response = await axios.post(
        `${config.infoBip.url}/people/2/persons`, 
        personData, 
        { headers: customHeaders }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errorCode == 40002) {
        // Try with email parameter
        const retryResponse = await axios.post(
          `${config.infoBip.url}/people/2/persons?email=${customer.email}`, 
          personData, 
          { headers: customHeaders }
        );
        logger.info(`creating person infobip response ${JSON.stringify(retryResponse.data)}`)
        return retryResponse.data;
      } else {
        throw error;
      }
    }
  } catch (err) {
    throw err;
  }
}

infoBipService.prototype.updateOmniPerson = async (customer) => {
  var credentialData = config.infoBip.otherusername + ":" + config.infoBip.password;
  var base64Credentials = Buffer.from(credentialData).toString('base64');

  var customHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Basic " + base64Credentials
  }
  try {
    let updateData = {
      customAttributes: {
        status: "unsubscribed"
      },
      contactInformation: {
        phone: [
          {
            number: customer.telephone.substring(1, customer.telephone.length)
          }
        ]
      }
    }

    console.log("Update data:", updateData);
    const response = await axios.put(
      `${config.infoBip.url}/people/2/persons?phone=${customer.telephone.substring(1, customer.telephone.length)}`, 
      updateData, 
      { headers: customHeaders }
    );
    console.log("Update response:", response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

module.exports = new infoBipService();
