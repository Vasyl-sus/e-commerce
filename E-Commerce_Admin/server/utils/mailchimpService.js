var config = require('../config/environment/index');
var bluebird = require('bluebird');

var md5 = require('md5');
var uuid = require("uuid")
var axios = require('axios');


var credentialData = config.mailchimp.user + ":" + config.mailchimp.apiKey;
var base64Credentials = Buffer.from(credentialData).toString('base64');
var headers = {
    "Authorization": "Basic " + base64Credentials,
    "Content-Type": "application/json"
  };


var mailchimpService = function() {}

mailchimpService.prototype.getSubscription = function (email) {
    return new Promise((resolve, reject) => {
    var params={
        headers: headers,
        url: config.mailchimp.baseUrl+"/lists/"+config.mailchimp.listId+"/members/"+md5(email.toLowerCase())
    }

    axios.get(params.url, { headers })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });

    });
};

mailchimpService.prototype.handleSubscription = function (email, merge_fields, newSubscriberStatus) {
    return new Promise((resolve, reject) => {
      try {
        email = email.toLowerCase();
        var url = `${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/${md5(email.toLowerCase())}`;
  
        axios.get(url, { headers })
          .then(response => {
            var tasks = [];
            var body = response.data;
            if (body && body.status === 404) {
              var data1 = {
                email_address: email,
                status: newSubscriberStatus,
                merge_fields
              };
              tasks.push(axios.post(`${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/`, data1, { headers }));
            } else if (body && body.status !== 404) {
              var data2 = {
                status: newSubscriberStatus,
                merge_fields
              };
              tasks.push(axios.patch(url, data2, { headers }));
            }
  
            bluebird.all(tasks)
              .then(results => {
                var response2 = results[0];
                if (response2) {
                  resolve(response2.data);
                } else {
                  resolve(null);
                }
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };

  mailchimpService.prototype.addToStore = function (source_email, data) {
    return new Promise((resolve, reject) => {
      try {
        source_email = source_email.toLowerCase();
        var url = `${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/${md5(source_email.toLowerCase())}`;
  
        axios.get(url, { headers })
          .then(response1 => {
            var body1 = response1.data;
            var newStatus = body1.status;
            if (!newStatus || newStatus === 404 || newStatus === "404") {
              newStatus = "unsubscribed";
            }
            if (body1.id) {
              let datas = {
                id: body1.id,
                email_address: source_email,
                opt_in_status: true,
                ...data
              };
              var storeUrl = `${config.mailchimp.baseUrl}/ecommerce/stores/${config.mailchimp.storeId}${customer.country}/customers`;
  
              axios.post(storeUrl, datas, { headers })
                .then(response => {
                  resolve(response.data);
                })
                .catch(err => {
                  reject(err);
                });
            } else {
              reject(new Error("No ID found in response"));
            }
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };


  mailchimpService.prototype.addOrderToStore = function (orderData, customer) {
    return new Promise((resolve, reject) => {
      try {
        let lines = orderData.therapies.map(t => {
          return {
            id: uuid.v1(),
            product_id: t.id,
            product_variant_id: "1",
            quantity: t.quantity,
            price: t.total_price
          };
        });
        let datas = {
          id: orderData.order_id2.toString(),
          processed_at_foreign: new Date().toISOString(),
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
          currency_code: orderData.currency_code,
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
        };
  
        var url = `${config.mailchimp.baseUrl}/ecommerce/stores/${config.mailchimp.storeId}${customer.country}/orders`;
  
        axios.post(url, datas, { headers })
          .then(response => {
            resolve(response.data);
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };

  mailchimpService.prototype.updateContact = function (source_email, data) {
    return new Promise((resolve, reject) => {
      try {
        source_email = source_email.toLowerCase();
        var url = `${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/${md5(source_email.toLowerCase())}`;
  
        axios.get(url, { headers })
          .then(response1 => {
            var body1 = response1.data;
            var newStatus = body1.status;
            var merge_fields = body1.merge_fields;
            if (!newStatus || newStatus === 404 || newStatus === "404") {
              newStatus = "unsubscribed";
            }
            merge_fields = { ...data };
  
            axios.get(url, { headers })
              .then(response => {
                var tasks = [];
                var body = response.data;
                if (body && body.status === 404) {
                  var data1 = {
                    email_address: source_email,
                    status: newStatus,
                    merge_fields
                  };
                  tasks.push(axios.post(`${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/`, data1, { headers }));
                } else if (body && body.status !== 404) {
                  var data2 = {
                    status: newStatus,
                    merge_fields
                  };
                  tasks.push(axios.patch(url, data2, { headers }));
                }
  
                bluebird.all(tasks)
                  .then(results => {
                    var response2 = results[0];
                    if (response2) {
                      resolve(response2.data);
                    } else {
                      resolve(null);
                    }
                  })
                  .catch(err => {
                    reject(err);
                  });
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };

  mailchimpService.prototype.transferSubscription = function (source_email, target_email) {
    return new Promise((resolve, reject) => {
      try {
        source_email = source_email.toLowerCase();
        target_email = target_email.toLowerCase();
        var url = `${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/${md5(source_email.toLowerCase())}`;
  
        axios.get(url, { headers })
          .then(response1 => {
            var body1 = response1.data;
            var newStatus = body1.status;
            var merge_fields = body1.merge_fields;
            if (!newStatus || newStatus === 404 || newStatus === "404") {
              newStatus = "unsubscribed";
            }
            if (!merge_fields) {
              merge_fields = {};
            }
  
            var targetUrl = `${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/${md5(target_email.toLowerCase())}`;
  
            axios.get(targetUrl, { headers })
              .then(response => {
                var tasks = [];
                var body = response.data;
                if (body && body.status === 404) {
                  var data1 = {
                    email_address: target_email,
                    status: newStatus,
                    merge_fields
                  };
                  tasks.push(axios.post(`${config.mailchimp.baseUrl}/lists/${config.mailchimp.listId}/members/`, data1, { headers }));
                } else if (body && body.status !== 404) {
                  var data2 = {
                    status: newStatus,
                    merge_fields
                  };
                  tasks.push(axios.patch(targetUrl, data2, { headers }));
                }
  
                bluebird.all(tasks)
                  .then(results => {
                    var response2 = results[0];
                    if (response2) {
                      resolve(response2.data);
                    } else {
                      resolve(null);
                    }
                  })
                  .catch(err => {
                    reject(err);
                  });
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  };
  

module.exports = new mailchimpService();
