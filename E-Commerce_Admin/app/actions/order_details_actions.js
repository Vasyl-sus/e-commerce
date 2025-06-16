import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, API_URL, GET_ORDER_DETAILS, CREATE_NEW_COMMENT, DELETE_COMMENT, END_VCC_CALL, ADD_OCCUPIED_ORDER, REMOVE_OCCUPIED_ORDER,
ADD_AGENT_TO_ORDER, SHOW_COLORS_EDIT, DELETE_THERAPY_EDIT, EDIT_THERAPIES, EDIT_ORDER_INFO, CHANGE_THERAPY_QUANTITY,
SHOW_THERAPIES_UPSALE, CLEAR_THERAPY_EDIT, CALLING, GET_GIFTS_FOR_ORDER, EDIT_ORDER_GIFTS, COMMON_ERROR, DELETE_ORDER_ACCESSORY, CHANGE_THERAPY_QUANTITY_STORNO,
ERROR_COUNTRY, SUCCESS_CALLING, CHANGE_ACC_QUANTITY, IS_ACCESSORY_GIFT, ACCESSORY_OPTION, LOADING, tid, CLEAR_THERAPY_EDIT_STORNO} from '../config/constants';

import { createNotification, errorNotification } from '../App.js'

var project_ids = [
  {id: 20, country: 'SI'},
  {id: 23, country: 'HR'},
  {id: 24, country: 'HU'},
  {id: 25, country: 'SK'},
  {id: 85, country: 'HR'},
  {id: 92, country: 'HU'},
  {id: 93, country: 'SI'},
  {id: 94, country: 'SK'},
  {id: 97, country: 'CZ'},
  {id: 99, country: 'CZ'}
]

export function getOrderDetails(order_id)
{
  return function (dispatch) {
		dispatch({type:LOADING, payload:true})
	  axios.get(`${ROOT_URL}/admin/order/details/${order_id}`)
  	.then((response) => {
  		dispatch({type: GET_ORDER_DETAILS, payload: response.data})
      var country = response.data.order.shipping_country;
  		axios.get(`${ROOT_URL}/admin/gift?active=1&country=${country}`)
        .then((response1) => {
          var obj = {};
          obj.data = response1.data;
          obj.gifts = response.data.order.gifts;
          dispatch({type: GET_GIFTS_FOR_ORDER, payload: obj})
          dispatch({type:LOADING, payload:false})
      })
      .catch((response1) => {
        dispatch({type:LOADING, payload:false})
        console.log(2262, response1)
  			errorNotification(response1.response.data.message);
      })
  	})
  	.catch((response) => {
  		dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
  	})
	}
}

export function addReklamacija(id) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.put(`${ROOT_URL}/admin/order/reklamacija/${id}`)
    .then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili naročilo!');
        dispatch(getOrderDetails(id));
      }
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function addOrderBadge(id, obj, order_id) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.put(`${ROOT_URL}/admin/customer/${id}`, obj)
    .then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili značke naročila!');
        dispatch(getOrderDetails(order_id));
      }
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function createComment(obj, data)
{
  var location = browserHistory.getCurrentLocation();
  var order_id = "";

  if(location.query.id){
  	order_id+=`${location.query.id}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/order/comments/${order_id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov komentar!');
        data.id = response.data.id
  			dispatch({type: CREATE_NEW_COMMENT, payload: data})
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteComment(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.delete(`${ROOT_URL}/admin/order/comments/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili komentarja!');
  			dispatch({type: DELETE_COMMENT, payload: {id}})
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function changeOrderStatus(id, status) {
  var obj = {
    ids: id,
    new_status: status
  }
  return function (dispatch) {
      var user = JSON.parse(localStorage.getItem('user'))
      const config = { headers: { 'authorization': user.session_id } };
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${API_URL}/order/status`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili status naročila!');
        dispatch(getOrderDetails(id[0]));
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function makeStorno(id) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/order/storno/${id}`)
		.then((response) => {
      createNotification('success','Uspešno ste stornirali naročilo!');
      browserHistory.push("/order_details?id=" + response.data.id);
      dispatch(getOrderDetails(response.data.id));
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      createNotification('error','Naročilo ni možno stornirati!');
		})
	}
}

export function addNewOrder(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/order`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo naročilo!');
        var user = JSON.parse(localStorage.getItem('user'))
        var DDV = response.data.data.ddv
        var order_id_new = response.data.data.order_id2
        var ddv_total = obj.total - (obj.total * (DDV.country_ddv / 100));

        var items = [...obj.therapies, ...obj.accessories].map((item, i) => {
          return {
            "item_id": item.id.toString(),
            "item_name": item.name,
            "item_brand": "E-commerce",
            "item_category": item.category,
            "price": item.total_price || item.reduced_price,
            "quantity": item.quantity
          };
        });
    
        var data = {
          "client_id": obj.customer_id.toString(),
          "events": [{
            "name": "purchase",
            "params": {
              "transaction_id": order_id_new.toString(),
              "affiliation": "Online Store",
              "value": obj.total,
              "currency": obj.currency_code,
              "tax": obj.total - ddv_total,
              "shipping": obj.shipping_fee,
              "items": items
            }
          }]
        };

        axios.post('/send-ga-event', data)
        .then((response) => {
          
        })
        .catch((error) => {
          // Handle error
          onsole.log("GA4 Event Error " + JSON.stringify(response))
        })



        .then((response1) => {
          browserHistory.push("/order_details?id=" + response.data.data.id);
        })
        .catch((response1) => {
          browserHistory.push("/order_details?id=" + response.data.data.id);
        })
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function takeOrder(id) {
  var agent = JSON.parse(localStorage.getItem('user'))
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/order/setAgent`, {order_ids: [id], admin_id: agent.id})
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste prevzeli naročilo!');
        dispatch({type:ADD_AGENT_TO_ORDER, payload: {order_ids: [id], admin_id: agent.id}})
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function show_color(id) {
  return function (dispatch) {
    dispatch({type:SHOW_COLORS_EDIT, payload: id})
  }
}

export function add_color(id, color) {
  var location = browserHistory.getCurrentLocation();
  var data = {
    order_color_id: color.id.toString(),
    order_color_value: color.value
  }
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/order/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili barvo naročila!');
        dispatch(getOrderDetails(location.query.id))
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function clearTherapy(row) {
  return function (dispatch) {
		dispatch({type: CLEAR_THERAPY_EDIT, payload: row})
  }
}

export function clearTherapyStorno(row) {
  return function (dispatch) {
		dispatch({type: CLEAR_THERAPY_EDIT_STORNO, payload: row})
  }
}

export function changeTherapyQuantity(row, quantity) {
  return function (dispatch) {
		dispatch({type: CHANGE_THERAPY_QUANTITY, payload: {row, quantity}})
  }
}

export function changeTherapyQuantityStorno(row, quantity) {
  return function (dispatch) {
		dispatch({type: CHANGE_THERAPY_QUANTITY_STORNO, payload: {row, quantity}})
  }
}

export function changeAccQuantity(row, quantity) {
  return function (dispatch) {
		dispatch({type: CHANGE_ACC_QUANTITY, payload: {row, quantity}})
  }
}

export function accessoryOption(row, option) {
  return function (dispatch) {
		dispatch({type: ACCESSORY_OPTION, payload: {row, option}})
  }
}

export function show_therapies_upsell(e) {
  return function (dispatch) {
		dispatch({type: SHOW_THERAPIES_UPSALE, payload: e})
  }
}

export function deleteTherapy(row) {
  return function (dispatch) {
		dispatch({type: DELETE_THERAPY_EDIT, payload: row})
  }
}

export function deleteAccessory(obj) {
  return function (dispatch) {
		dispatch({type: DELETE_ORDER_ACCESSORY, payload: obj})
  }
}

export function isAccessoryGift(obj) {
  return function (dispatch) {
		dispatch({type: IS_ACCESSORY_GIFT, payload: obj})
  }
}

export function addAdditionalDiscount(total, id, discount, data) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.put(`${ROOT_URL}/admin/order/${id}`, {total: total - discount, additional_discount_data: data, additional_discount: parseFloat(discount)})
    .then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali dodatni popust!');
        dispatch(getOrderDetails(id))
      }
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function checkDiscount(order, name, country) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.post(`${ROOT_URL}/admin/discount/name`, {discountcode: name, country})
    .then((response) => {
      if(response.data.success) {
        if (response.data.discount.id === order.discount_id) {
          createNotification('error','Popust je že dodan');
        } else {
          createNotification('success','Uspešno ste dodali kupon za popust!');
          console.log("PREGLEDUJEM");
          var discount = response.data.discount;
          
          // Create a copy of the order to avoid modifying the original
          var orderCopy = { ...order };
          
          // Calculate discount value
          var discount_value = calculateDiscount(discount, orderCopy);
          
          // The calculateDiscount function now updates the order with proper shipping calculation
          var newOrderData = {
            total: orderCopy.total,
            discount_id: discount.id,
            discount: discount_value,
            shipping_fee: orderCopy.shipping_fee,
            utm_medium: discount.utm_medium,
            utm_source: discount.utm_source,
            subtotal: orderCopy.subtotal,
            therapies: orderCopy.therapies,
            accessories: orderCopy.accessories
          };
          dispatch(editOrderInfo(order.id, newOrderData))
        }
      }
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
      errorNotification(response.response.data.message);
    })
  }
}


// Calculate shipping fee based on order subtotal and delivery method threshold
function calculateShippingFee(order) {
  // If subtotal is greater than the threshold, shipping is free
  if (order.subtotal > order.delivery_method_to_price) {
    return 0;
  } 
  // Otherwise, apply the shipping fee
  else {
    return order.delivery_method_price;
  }
}

// Update order with shipping fee and total calculations
function updateOrderWithShipping(order, discount) {
  // Check if there's a shipping discount
  var isShippingDiscount = false;
  if (discount && discount.type && discount.type.toLowerCase() === "shipping") {
    isShippingDiscount = true;
  }

  // Calculate shipping fee
  order.shipping_fee = calculateShippingFee(order);

  // Special case for free product discounts
  if (discount && discount.type && discount.type.toLowerCase() === "free product") {
    if (order.total < order.delivery_method_to_price) {
      order.shipping_fee = order.delivery_method_price;
    }
  }

  // Apply shipping discount if applicable
  if (isShippingDiscount) {
    order.discount = order.shipping_fee;
    // When shipping is the discount, don't add it to the total
    order.shipping_fee = 0;
  }

  // Calculate final total
  order.total = order.subtotal - order.discount + order.shipping_fee;
  order.total = Math.round(100 * order.total) / 100;
  
  return order;
}

function calculateDiscount(discount, order) {
  var discount_value = 0;
  var tip = discount.type.toLowerCase();
  if (tip != "shipping") {
      var tip_popusta = discount.discount_type.toLowerCase();
      var vrednost_popusta = discount.discount_value;
      var min_order_amount = discount.min_order_amount;
      if (tip == "individual" && tip_popusta == "percent") {
          discount_value = 0;
          for (var i = 0; i < discount.therapies.length; i++) {
              var elt = discount.therapies[i].id;
              var tmp = order.therapies.find(t => {
                  return t.id == elt
              });
              if (tmp) {
                  discount_value += tmp.quantity * tmp.price * (vrednost_popusta / 100);
              }
          }
          for (var i = 0; i < discount.accessories.length; i++) {
              var elt = discount.accessories[i].id;
              var tmp1 = order.accessories.find(t => {
                  return t.id == elt
              });
              if (tmp1) {
                  discount_value += tmp1.quantity * tmp1.reduced_price * (vrednost_popusta / 100);
              }
          }
      } else if (tip == "individual" && tip_popusta == "amount") {
          discount_value = 0;
          for (var i = 0; i < discount.therapies.length; i++) {
              var elt = discount.therapies[i].id;
              var tmp = order.therapies.find(t => {
                  return t.id == elt
              });
              if (tmp) {
                  discount_value += (tmp.quantity * vrednost_popusta);
              }
          }
      } else if (tip == "general" && tip_popusta == "percent") {
          var therapiesInCart = order.therapies || "";
          var bundles = [];
          for (var i = 0; i < therapiesInCart.length; i++) {
              if (therapiesInCart[i].category === 'bundle') {
                  bundles.push(therapiesInCart[i]);
              }
          }
          var sumBundle = 0;
          if (bundles) {
              for (var i in bundles) {
                  sumBundle += +bundles[i].price * bundles[i].quantity;
              }
          }
          if (min_order_amount == null || (min_order_amount < order.subtotal)) {
              discount_value = (order.subtotal - sumBundle) * (vrednost_popusta / 100);
          } else {
              discount_value = 0;
              console.log("Low order amount");
          }
      } else if (tip_popusta == "amount") {
          if (min_order_amount == null || (min_order_amount < order.subtotal)) {
              discount_value = vrednost_popusta;
          } else {
              discount_value = 0;
              console.log("Low order amount");
          }
      } else if (tip == "free product") {
          if (min_order_amount == null || (min_order_amount < order.subtotal)) {
              var freeTherapies = discount.free_therapies;
              var newTherapies = Array.from(order.therapies);
              var freeAccessories = discount.free_accessories;
              var newAccessories = Array.from(order.accessories);
              var freeDiscount = 0;

              if (freeTherapies && freeTherapies.length) {
                  freeTherapies.forEach(element => {
                      if (!order.therapies.some(therapy => therapy.id === element.id && therapy.isFreeProduct)) {
                          element.product_quantity = 1;
                          element.quantity = 1;
                          element.price = element.total_price;
                          element.isFreeProduct = 1;
                          newTherapies.push(element);
                          freeDiscount += +element.total_price;
                      }
                  })
              }

              if (freeAccessories && freeAccessories.length) {
                  freeAccessories.forEach(element => {
                      if (!order.accessories.some(acc => acc.id === element.id && acc.isFreeProduct)) {
                          element.product_quantity = 1;
                          element.quantity = 1;
                          element.isFreeProduct = 1;
                          element.product_id = element.product_id;
                          element.price = element.reduced_price;
                          newAccessories.push(element);
                          freeDiscount += +element.reduced_price;
                      }
                  })
              }

              if (typeof freeDiscount == 'number') {
                  if (tip_popusta == "percent") {
                      discount_value = (order.subtotal * (vrednost_popusta / 100)) + freeDiscount;
                      order.subtotal = order.subtotal + freeDiscount;
                  } else {
                      discount_value = discount_value + freeDiscount + vrednost_popusta;
                      order.subtotal = order.subtotal + freeDiscount + vrednost_popusta;
                  }
              }

              order.therapies = newTherapies;
              order.accessories = newAccessories;
          }
      }

  } else if (tip == "shipping") {
      // For shipping discounts, the discount value is the shipping fee
      discount_value = order.delivery_method_price;
  }

  discount_value = Math.round(100 * discount_value) / 100;
  order.discount = discount_value;
  
  // Calculate shipping and update the order
  order = updateOrderWithShipping(order, discount);
  
  return discount_value;
}


export function editOrderTherapies(id, data) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/order/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili terapije naročila!');
        dispatch({type: EDIT_THERAPIES, payload: data})
        dispatch(getOrderDetails(id))
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editOrderInfo(id, data) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/order/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili naročilo!');
        dispatch({type: EDIT_ORDER_INFO, payload: data})
        dispatch(getOrderDetails(id))
      }
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editHistoryInfo(id, data) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/order/${id}/history`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili naročilo!');
        dispatch({type: EDIT_ORDER_INFO, payload: data})
        dispatch(getOrderDetails(id))
      }
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function payDifference(data) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/stripe/pay-difference`, data)
		.then((response) => {
      if(response) {
        createNotification('success','Payment successfull!');
        dispatch(getOrderDetails(data.id))
      }
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response);
		})
	}
}

export function callCustomer(id, flag, tel, username, country, data) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    tel = tel.substring(1, tel.length)
      axios.get(`${ROOT_URL}/admin/vcc/project/${username}`)
      .then((response) => {
        var project_id = response.data.project_id;
        var founded = project_ids.find(pi => {
          return pi.id == project_id
        })
        dispatch({type:LOADING, payload:false})
        if (founded.country == country) {
          var query = '?';
          if (data.order_id) {
            query += `order_id=${data.order_id}`
          } else {
            query += `order_id= `
          }
          query += `&name=${data.name}&email=${data.email}`
          axios.get(`http://localhost:12255/call/${tel}${query}`)
          .then((response) => {
            dispatch({type: CALLING, payload: true})
            createNotification('success', SUCCESS_CALLING);
            dispatch({type:LOADING, payload:false})
          })
          .catch((response) => {
            dispatch({type:LOADING, payload:false})
            console.log(2262, response)
      			errorNotification(response.response.data.message);
          })
        } else {
          dispatch({type:LOADING, payload:false})
          createNotification('error', ERROR_COUNTRY);
        }
      })
      .catch((response) => {
        dispatch({type:LOADING, payload:false})
        createNotification('error', COMMON_ERROR);
      })
  }
}

export function editOrderDetails(ids, obj) {

  return function (dispatch) {
    for(var i=0; i<ids.length; i++) {
    		dispatch({type:LOADING, payload:true})
  		  axios.put(`${ROOT_URL}/admin/order/${ids[i]}`, obj)
  		.then((response) => {
        if(response.data.success) {
          dispatch(getOrderDetails(ids[0]));
        }
        dispatch({type:LOADING, payload:false})
  		})
  		.catch((response) => {
  			dispatch({type:LOADING, payload:false})
        console.log(2262, response)
  			errorNotification(response.response.data.message);
  		})
    }
	}
}

export function endCall() {
  return function (dispatch) {
    dispatch({type: CALLING, payload: false})
  }
}

export function endVccCall(data) {
  return function (dispatch) {
		dispatch({type: END_VCC_CALL, payload: data})
  }
}

export function newOrderOccupied(id) {
  return function (dispatch) {
		dispatch({type: ADD_OCCUPIED_ORDER, payload: id})
  }
}

export function removeOccupiedOrder(id) {
  return function (dispatch) {
		dispatch({type: REMOVE_OCCUPIED_ORDER, payload: id})
  }
}

export function editOrderGifts(id, data) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.put(`${ROOT_URL}/admin/order/${id}`, data)
  .then((response) => {
    createNotification('success','Uspešno ste dodali/odstranili darilo!');
    dispatch({type: EDIT_ORDER_GIFTS, payload: data})
    axios.get(`${ROOT_URL}/admin/gift?active=1`)
        .then((response1) => {
          var obj = {};
          obj.data = response1.data;
          obj.gifts = data.gifts;
          dispatch({type: GET_GIFTS_FOR_ORDER, payload: obj})
          dispatch({type:LOADING, payload:false})
      })
      .catch((response1) => {
        dispatch({type:LOADING, payload:false})
        console.log(2262, response1)
  			errorNotification(response1.response.data.message);
      })
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function sendEmail(obj) {
	var user = JSON.parse(localStorage.getItem('user'))
	var config = { headers: { 'authorization': user.session_id } };
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${API_URL}/mail`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno poslan mail!');
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteDiscount(id, obj) {
  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.put(`${ROOT_URL}/admin/order/${id}`, obj)
    .then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili popusta!');
        dispatch(getOrderDetails(id))
      }
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
      errorNotification(response.response.data.message);
    })
  }
}
