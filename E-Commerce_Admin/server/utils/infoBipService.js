var config = require('../config/environment/index');
var bluebird = require('bluebird');
var axios = require('axios');

var credentialData = config.infoBip.username + ":" + config.infoBip.password;
var base64Credentials = Buffer.from(credentialData).toString('base64');

var headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Basic " + base64Credentials
}

var infoBipService = function () {};

infoBipService.prototype.sendRequest = (post_data, url) => {
  return new Promise((resolve, reject) => {
    try {
      let params = {
        headers,
        url: `${config.infoBip.url}${url}`,
        data: post_data
      }
      
      axios.post(params.url, params.data, { headers: params.headers })
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

infoBipService.prototype.getOmniReport = (url) => {
  return new Promise((resolve, reject) => {
    try {
      let params = {
        headers,
        url: `${config.infoBip.url}${url}`
      }
      console.log(params);
      axios.get(params.url, { headers: params.headers })
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

infoBipService.prototype.getOmniPerson = (phone) => {
  return new Promise((resolve, reject) => {
    try {
      let params = {
        headers,
        url: `${config.infoBip.url}/people/2/persons?phone=${phone.substring(1, phone.length)}`
      }
      axios.get(params.url, { headers: params.headers })
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

infoBipService.prototype.createOmniPerson = (orderData, customer) => {
  return new Promise((resolve, reject) => {
    try {
      let body = {
        externalId: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        birthDate: customer.birthdate,
        contactInformation:{
          phone:[
            {
                number: customer.telephone.substring(1, customer.telephone.length)
            }
          ],
          email:[
            {
                address: customer.email
            }
          ]
        }
      }
      let params = {
        headers,
        url: `${config.infoBip.url}/people/2/persons`,
        data: body
      }
      console.log('customer params', params);
      axios.post(params.url, params.data, { headers: params.headers })
        .then(response => {
          var body = response.data;
          console.log("create", body);
          if (body.errorCode == 40002) {
            try {
              let body = {
                externalId: customer.id,
                firstName: orderData.shipping_first_name || orderData.first_name,
                lastName: orderData.shipping_last_name || orderData.last_name,
                address: orderData.shipping_address || orderData.address,
                city: orderData.shipping_city || orderData.city,
                country: orderData.shipping_country || orderData.country,
                birthDate: customer.birthdate || orderData.birthdate,
                contactInformation:{
                  phone:[
                    {
                        number: orderData.shipping_telephone && orderData.shipping_telephone.substring(1, orderData.shipping_telephone.length) || orderData.telephone.substring(1, orderData.telephone.length)
                    }
                  ],
                  email:[
                    {
                        address: orderData.shipping_email || orderData.email
                    }
                  ]
                }
              }
              let params = {
                headers,
                url: `${config.infoBip.url}/people/2/persons?phone=${orderData.shipping_telephone && orderData.shipping_telephone.substring(1, orderData.shipping_telephone.length) || orderData.telephone.substring(1, orderData.telephone.length)}`,
                data: body
              }
              console.log("update body", params);
              axios.put(params.url, params.data, { headers: params.headers })
                .then(response => {
                  var body = response.data;
                  console.log("update", body);
                  resolve(body);
                })
                .catch(err => {
                  reject(err);
                });
            } catch(err) {
              reject(err);
            }
          } else {
            resolve(body);
          }
        })
        .catch(err => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

infoBipService.prototype.updateOmniPerson = (customer) => {
  return new Promise((resolve, reject) => {
    try {
      let body = {
        customAttributes:{
          status:"unsubscribed"
        },
        contactInformation:{
          phone:[
            {
                number: customer.telephone.substring(1, customer.telephone.length)
            }
          ]
        }
      }

      let params = {
        headers,
        url: `${config.infoBip.url}/people/2/persons?phone=${customer.telephone.substring(1, customer.telephone.length)}`,
        data: body
      }
      console.log(params);
      axios.put(params.url, params.data, { headers: params.headers })
        .then(response => {
          var body = response.data;
          console.log(body);
          resolve(body);
        })
        .catch(err => {
          reject(err);
        });
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = new infoBipService();