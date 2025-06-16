import {
  ROOT_URL,
  LOADING,
  GET_CART,
  ADD_TO_CART,
  GET_OTO_DATA,
  UPDATE_CART,
  GET_ORDER_ID,
  INITIAL_SUBMITTED,
  DISCOUNT_NOT_FOUND,
  OPEN_CART_MODAL,
  OPEN_ACCESSORY_MODAL,
  SUCCESS_REVIEW,
  ERROR_REVIEW,
  CLOSE_CART_MODAL,
  CLOSE_ACCESSORY_MODAL,
  CUSTOMER,
} from '../constants/constants.js'
import axios from 'axios'
import Router from 'next/router'
import { addToDataLayer } from '../components/services'
import { AddToCart } from './facebookActions'
import { AddToCart as GA4AddToCart } from './googleAnalyticsActions'
import { ca } from 'date-fns/locale'


axios.defaults.headers['Pragma'] = 'no-cache'

axios.interceptors.response.use(
  response => {
    return response
  },
  function (error) {
    return Promise.reject(error)
  },
)

export const facebookInf = () => {
  try {
    const response = Axios.post(`${API_URL}/`)
  } catch (e) {
    console.log(e)
  }
}

export const addToCart = (therapy, currency) => dispatch => {
  let obj = {
    therapy_id: therapy.therapy.id,
    new_quantity: 1,
    product_id: therapy.product && therapy.product.id,
    product_name: therapy.product && therapy.product.name,
  }
  let config = {
    headers: { Pragma: 'no-cache' },
  }
  axios
    .post(`${ROOT_URL}/cart`, obj, config)
    .then(response => {
      let currencycode = currency.code
      if (currencycode == 'Ft') currencycode = 'HUF'
      let step = 1

      let th = {
        id: therapy.therapy.id,
        name: therapy.therapy.name,
        price: therapy.therapy.total_price || therapy.therapy.reduced_price,
        brand: 'Lux-Cosmetics',
        category: therapy.therapy.category,
        quantity: 1,
      }
      let therapiesGA4 = {
        item_id: therapy.therapy.id,
        item_name: therapy.therapy.name,
        price: therapy.therapy.total_price || therapy.therapy.reduced_price,
        item_brand: 'Lux-Cosmetics',
        item_category: therapy.therapy.category,
        quantity: 1,
        currency: currencycode
      }

      let productname = therapy.therapy.product_name
      let productid = therapy.therapy.category
      let productprice = therapy.therapy.total_price || therapy.therapy.reduced_price
      let productquantity = therapy.therapy.product_quantity
      let valueOfProduct = therapy.therapy.total_price * therapy.therapy.product_quantity


      let object = { therapies: [th], productname, productid, productprice, productquantity, currencycode, therapiesGA4: [therapiesGA4], valueOfProduct }
      const body = {
        url: window.location.href,
        currency: currencycode,
        item: th,
      }

      // Send to Facebook Conversions API
      AddToCart(body);
      
      // Send to Google Analytics 4
      GA4AddToCart({
        url: window.location.href,
        currency: currencycode,
        item: th,
      });
      
      addToDataLayer('addToCart', object)
      dispatch(getCart(currency))
      therapy.therapy = { ...response?.data?.therapy, ...therapy.therapy }
      console.log('{...response?.data?.therapy, ...therapy}', therapy, response?.data?.therapy)
      // display_image
      if (!therapy?.therapy?.display_image) {
        therapy.therapy.display_image = {
          link: response?.data?.therapy?.link,
          id: response?.data?.therapy?.id,
          name: response?.data?.therapy?.name,
          type: response?.data?.therapy?.type,
        }
      }

        dispatch({ type: ADD_TO_CART, payload: { therapy: { ...response?.data?.therapy, ...therapy }, response } })
      })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const changeQuantity = (therapy, currency) => dispatch => {
  let obj = {
    therapy_id: therapy.therapy.id,
    new_quantity: therapy.new_quantity,
  }
  axios
    .put(`${ROOT_URL}/cart`, obj)
    .then(response => {
      let currencycode = currency.code
      if (currencycode == 'Ft') currencycode = 'HUF'
      let step = 1

      let th = {
        id: therapy.therapy.id,
        name: therapy.therapy.name,
        price: therapy.therapy.total_price || therapy.therapy.reduced_price,
        brand: 'Lux-Cosmetics',
        category: therapy.therapy.category,
        quantity: 1,
      }

      let therapiesGA4 = {
        item_id: therapy.therapy.id,
        item_name: therapy.therapy.name,
        price: therapy.therapy.total_price || therapy.therapy.reduced_price,
        item_brand: 'Lux-Cosmetics',
        item_category: therapy.therapy.category,
        quantity: 1,
        currency: currencycode
      }

      let object = { therapies: [th], currencycode, therapiesGA4: therapiesGA4 }

      addToDataLayer('addToCart', object)

      dispatch(getCart(currency))
      dispatch({ type: ADD_TO_CART, payload: { therapy, response } })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
    })
}

export const addGiftToCart = (accessory, currency) => dispatch => {
  let obj = {
    accessory_id: accessory.id,
    new_quantity: 1,
    product_id: accessory.product_id,
    product_name: accessory.product_name,
  }

  axios
    .post(`${ROOT_URL}/cart/gift`, obj)
    .then(response => {
      let currencycode = currency.code
      if (currencycode == 'Ft') currencycode = 'HUF'
      let step = 1

      let th = {
        id: accessory.id,
        name: accessory.name,
        price: 0,
        brand: 'Lux-Cosmetics',
        category: accessory.category,
        quantity: 1,
      }

      let therapiesGA4 = {
        item_id: accessory.id,
        item_name: accessory.name,
        price: 0,
        item_brand: 'Lux-Cosmetics',
        item_category: accessory.category,
        quantity: 1,
        currency: currencycode
      }

      let object = { therapies: [th], currencycode, therapiesGA4: therapiesGA4 }
      addToDataLayer('addToCart', object)

      dispatch(getCart(currency))
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const removeGiftFromCart = (accessory, currency) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .delete(`${ROOT_URL}/cart/${accessory.id}`)
    .then(response => {
      let th = {
        id: accessory.id,
        name: accessory.name,
        price: 0,
        brand: 'Lux-Cosmetics',
        category: accessory.category,
        quantity: 1,
      }

      let object = { therapies: [th] }
      addToDataLayer('removeFromCart', object)

      dispatch(getCart(currency))
      dispatch({ type: LOADING, payload: false })
    })
    .catch(response => {
      console.log('removeGiftFromCart err:', response)
      dispatch({ type: LOADING, payload: false })
    })
}


//----------------------- > FACEBOOK API < --------------------------


export const addOtoToCart = obj => async dispatch => {
  dispatch({ type: LOADING, payload: true })

  try {
    const res = await axios.put(`${ROOT_URL}/lang/buyOto`, obj)
    return res.data
  } catch (e) {
    // .then(response => {
    // })
    // .catch(response => {
    //   dispatch({ type: LOADING, payload: false });
    //   console.log(response)
    // });
    console.log(e.message)
  } finally {
    dispatch({ type: LOADING, payload: false })
  }
}

export const openCartModal = () => dispatch => {
  dispatch({ type: OPEN_CART_MODAL, payload: true })
}

export const closeCartModal = () => ({
  type: CLOSE_CART_MODAL,
})

export const openAccessoryModal = (accessories, name) => dispatch => {
  dispatch({ type: OPEN_ACCESSORY_MODAL, payload: { accessories, discount_name: name } })
}

export const closeAccessoryModal = () => ({
  type: CLOSE_ACCESSORY_MODAL,
})

export const getCart = (
  currency,
  delivery_methods,
  payment_methods,
  url,
) => dispatch => {
  var q = Router.query.query
  var q_str = ''

  if (Router.route == '/checkout' && q && q.order_id && q.oto_id)
  q_str = `?order_id=${q.order_id}&oto_id=${q.oto_id}`

  console.log("GETTING CART");

  let config = {
    headers: { Pragma: 'no-cache' },
  }
  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/cart${q_str}`, config)
    .then(async response => {

      if (['/cart', '/checkout'].includes(Router.route)) { 
        if (response.data.cart.therapies && response.data.cart.therapies.length > 0) {
          // Extract the IDs of the therapies
          const therapyIds = response.data.cart.therapies.map(therapy => therapy.id);
  
          // Fetch the status of all therapies in a single request
          const therapyStatusResponse = await axios.get(`${ROOT_URL}/cart/therapies/status?ids=${therapyIds.join(',')}`, config);
  
          // Iterate over the therapies again
          for (let therapy of response.data.cart.therapies) {
            // Find the status for this therapy in the response
            const status = therapyStatusResponse.data.statuses.find(status => status.id === therapy.id);
  
            // If the therapy is disabled, remove it from the cart
            if (status && status.status === 0) {
              dispatch(removeFromCart(therapy, currency, url));
            }
          }
        }
  
        if (response.data.cart.accessories && response.data.cart.accessories.length > 0) {
          // Extract the IDs of the accessories
          const accessoryIds = response.data.cart.accessories.map(accessory => accessory.id);
  
          // Fetch the status of all accessories in a single request
          const accessoryStatusResponse = await axios.get(`${ROOT_URL}/cart/accessories/status?ids=${accessoryIds.join(',')}`, config);
  
          // Iterate over the accessories again
          for (let accessory of response.data.cart.accessories) {
            // Find the status for this accessory in the response
            const status = accessoryStatusResponse.data.statuses.find(status => status.id === accessory.id);
  
            // If the accessory is disabled, remove it from the cart
            if (status && status.status === 0) {
              dispatch(removeFromCart(accessory, currency, url));
            }
          }
        }
      }


      if (Router.router.route == '/cart') {

        let currencycode = currency.code
        if (currencycode == 'Ft') currencycode = 'HUF'
        let step = 1


        var therapies = response.data.cart.therapies.map((c, index) => {
          return {
            id: c.id,
            name: c.name,
            price: c.price,
            brand: 'Lux-Cosmetics',
            category: c.category,
            position: index,
            quantity: c.quantity,
          }
        })
        Array.isArray(response.data.cart.accessories) && response.data.cart.accessories.length > 0 && response.data.cart.accessories.map((c, index) => {
          therapies.push({
            id: c.id,
            name: c.name,
            price: c.price,
            brand: 'Lux-Cosmetics',
            category: c.category,
            position: index,
            quantity: c.quantity,
          })
        })

        var therapiesGA4 = response.data.cart.therapies.map((c, index) => {
          return {
            item_id: c.id,
            item_name: c.name,
            price: c.price,
            item_brand: 'Lux-Cosmetics',
            item_category: c.category,
            quantity: c.quantity,
            currency: currencycode
          }
        })
        Array.isArray(response.data.cart.accessories) && response.data.cart.accessories.length > 0 && response.data.cart.accessories.map((c, index) => {
          therapiesGA4.push({
            item_id: c.id,
            item_name: c.name,
            price: c.price,
            item_brand: 'Lux-Cosmetics',
            item_category: c.category,
            quantity: c.quantity,
            currency: currencycode
          })
        })

        var therapiesKlaviyo = response.data.cart.therapies.map((c, index) => {
          return {
            ProductID: c.category,
            ProductName: c.product_name,
            Quantity: c.quantity,
            ItemPrice: c.price,
            RowTotal: c.price * c.quantity
          }
        })

        let obj = { therapies, currencycode, step, therapiesGA4, therapiesKlaviyo }

        let objGA4 = { therapiesGA4: therapiesGA4 }

        addToDataLayer('EEcheckout', obj)
        addToDataLayer('viewCart', objGA4)

        if (
          delivery_methods &&
          delivery_methods.length > 0 &&
          payment_methods &&
          payment_methods.length > 0
        ) {
          dispatch(
            setPaymentDelivery(delivery_methods[0].id, payment_methods[0].id),
          )
        }
      }
      if (Router.router.route === '/checkout') {

        let currencycode = currency.code
        if (currencycode == 'Ft') currencycode = 'HUF'
        let step = 2

        var therapies = response.data.cart.therapies.map((c, index) => {
          return {
            id: c.id,
            name: c.name,
            price: c.price,
            brand: 'Lux-Cosmetics',
            category: c.category,
            position: index,
            quantity: c.quantity,
          }
        })
        Array.isArray(response.data.cart.accessories) && response.data.cart.accessories.length > 0 && response.data.cart.accessories.map((c, index) => {
          therapies.push({
            id: c.id,
            name: c.name,
            price: c.price,
            brand: 'Lux-Cosmetics',
            category: c.category,
            position: index,
            quantity: c.quantity,
          })
        })
        var therapiesGA4 = response.data.cart.therapies.map((c, index) => {
          return {
            item_id: c.id,
            item_name: c.name,
            price: c.price,
            item_brand: 'Lux-Cosmetics',
            item_category: c.category,
            quantity: c.quantity,
            currency: currencycode
          }
        })
        Array.isArray(response.data.cart.accessories) && response.data.cart.accessories.length > 0 && response.data.cart.accessories.map((c, index) => {
          therapiesGA4.push({
            item_id: c.id,
            item_name: c.name,
            price: c.price,
            item_brand: 'Lux-Cosmetics',
            item_category: c.category,
            quantity: c.quantity,
            currency: currencycode
          })
        })

        let obj = { therapies, currencycode, step, therapiesGA4 }
        addToDataLayer('EEcheckout', obj)
        if (
          response.data.cart.therapies.length === 0 &&
          response.data.cart.accessories.length === 0
        )
          if (url) {
            Router.push(`/${url}`)
          } else {
            Router.push(ROOT_URL)
          }
      }
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: GET_CART, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const setDelivery = id => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/cart/delivery`, { deliverymethod_id: id })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UPDATE_CART, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const setPaymentDelivery = (d_id, p_id) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/cart/paymentdelivery`, {
      deliverymethod_id: d_id,
      paymentmethod_id: p_id,
    })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UPDATE_CART, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const submitReview = data => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/lang/reviews`, data)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: SUCCESS_REVIEW, payload: true })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: ERROR_REVIEW, payload: false })
    })
}

export const setPayment = id => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/cart/payment`, { paymentmethod_id: id })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UPDATE_CART, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const removeFromCart = (therapy, currency, url) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .delete(`${ROOT_URL}/cart/${therapy.id}`)
    .then(response => {
      let th = {
        id: therapy.id,
        name: therapy.name,
        price: therapy.price,
        brand: 'Lux-Cosmetics',
        category: therapy.category,
        quantity: therapy.quantity,
      }

      let object = { therapies: [th] }
      addToDataLayer('removeFromCart', object)

      dispatch(getCart(currency, null, null, url))
      dispatch({ type: LOADING, payload: false })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const addQuantity = (id, qty) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .put(`${ROOT_URL}/cart/${id}`, { new_quantity: qty })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UPDATE_CART, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const submitInfoData = (data, Router, path) => dispatch => {
  axios
    .post(`${ROOT_URL}/order`, data)
    .then(response => {
      //dispatch({ type: LOADING, payload: false });
      /*Router.push(path)*/

      dispatch({ type: GET_ORDER_ID, payload: response.data })
    })
    .catch(error => {
      console.log(error)
      //var err = error.response.data.error
      dispatch({ type: LOADING, payload: false })
      console.log(error)
    })
}

export const getDiscountData = (discount) => dispatch => {
  return axios
    .get(`${ROOT_URL}/cart/discount/${discount}`, {});
}

export const addDiscount = (discount, accessoryId = null) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/cart/discount`, { discountcode: discount, accessory_product_id: accessoryId })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: UPDATE_CART, payload: response.data })
      dispatch({ type: DISCOUNT_NOT_FOUND, payload: 1 })
    })
    .catch(error => {
      dispatch({ type: LOADING, payload: false })
      var err = error.response.data.message
      if (err == 'discount_not_found') {
        dispatch({ type: DISCOUNT_NOT_FOUND, payload: 2 })
      }
    })
}

export const addDiscount2 = (discount, accessories = null) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/cart/discount`, { discountcode: discount, arr_accessory_product_id: accessories })
    .then(response => {
      console.log('cart/discount response.data', response.data)
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: UPDATE_CART, payload: response.data })
      dispatch({ type: DISCOUNT_NOT_FOUND, payload: 1 })
    })
    .catch(error => {
      dispatch({ type: LOADING, payload: false })
      var err = error.response.data.message
      if (err == 'discount_not_found') {
        dispatch({ type: DISCOUNT_NOT_FOUND, payload: 2 })
      }
    })
}

export const removeDiscount = () => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .delete(`${ROOT_URL}/cart/discount`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      const data = { ...response.data, discountData: {} }
      dispatch({ type: UPDATE_CART, payload: response.data })
      dispatch({ type: DISCOUNT_NOT_FOUND, payload: 0 })
    })
    .catch(error => {
      dispatch({ type: LOADING, payload: false })
      var err = error.data.message
      if (err == 'discount_not_found') {
        dispatch({ type: DISCOUNT_NOT_FOUND, payload: 2 })
      }
    })
}

export const getOtos = id => dispatch => {
  dispatch({ type: LOADING, payload: true })
  //console.log(1221)
  axios
    .get(`${ROOT_URL}/lang/oto/${id}`)
    .then(response => {
      // console.log(response)
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: GET_OTO_DATA, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const createOrder = (data, currency) => dispatch => {
  dispatch({ type: LOADING, payload: true })
  return axios
    .post(`${ROOT_URL}/order`, data)
    .then(response => {
      let order = response.data.order

      let currencycode = order.currency_code
      if (currencycode == 'Ft') currencycode = 'HUF'

      var therapies = order.therapies.map((t, index) => {
        return {
          id: t.id,
          name: t.name,
          price: t.price,
          brand: 'Lux-Cosmetics',
          category: t.category,
          position: index,
          quantity: t.quantity,
        }
      })
      order.accessories.map((t, index) => {
        therapies.push({
          id: t.id,
          name: t.name,
          price: t.price,
          brand: 'Lux-Cosmetics',
          category: t.category,
          position: index,
          quantity: t.quantity,
        })
      })
      var therapiesGA4 = order.therapies.map((t, index) => {
        return {
          item_id: t.id,
          item_name: t.name,
          price: t.price,
          item_brand: 'Lux-Cosmetics',
          item_category: t.category,
          quantity: t.quantity,
          currency: currencycode
        }
      })
      order.accessories.map((t, index) => {
        therapiesGA4.push({
          item_id: t.id,
          item_name: t.name,
          price: t.price,
          item_brand: 'Lux-Cosmetics',
          item_category: t.category,
          quantity: t.quantity,
          currency: currencycode
        })
      })
      var DDV = order.country_ddv
      let obj = {}
      let total_price = parseFloat(order.total)
      let all_ddv = total_price - total_price / (DDV / 100 + 1)
      let ordercountry = order.full_country
      let customer_first_name = data.shipping_first_name
      let customer_last_name = data.shipping_last_name
      let customer_email = data.shipping_email
      let customer_phone = data.shipping_telephone
      var new_customer = order.new_customer
      obj = {
        order_id: order.order_id2,
        total_price,
        all_ddv,
        therapies,
        therapiesGA4,
        shipping_fee: parseFloat(order.shipping_fee),
        discount_name: order && order.discountData && order.discount_id ? order.discountData.name : '',
        currencycode,
        ordercountry,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        new_customer
      }

      addToDataLayer('EEtransaction', obj)
      dispatch({ type: LOADING, payload: false })

      return { id: response.data.id, total: order.total, order_id2: order.order_id2 }
    })
    .catch(error => {
      console.log(error)
      //var err = error.response.data.error
      dispatch({ type: LOADING, payload: false })
      console.log(error)
    })
}

export const createOrderDouble = (data, Router, path) => dispatch => {
  dispatch({ type: LOADING, payload: true })

  axios
    .post(`${ROOT_URL}/order`, data)
    .then(response => {
      // console.log(data)
      // //dispatch({ type: LOADING, payload: false });
      // /*Router.push(path)*/
      // // console.log(response);
      // // dispatch({ type: GET_ORDER_ID, payload: response.data });
      axios
        .put(`${ROOT_URL}/order/${response.data.id}/create`, data)
        .then(response => {

          // dispatch({ type: LOADING, payload: false });
          //dispatch({ type: LOADING, payload: false });
          // Router.push(path);
          //dispatch({ type: GET_CART, payload: response.data.cart });
        })
        .catch(error => {
          console.log(error)
          //var err = error.response.data.error
          dispatch({ type: LOADING, payload: false })
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
      //var err = error.response.data.error
      dispatch({ type: LOADING, payload: false })
      console.log(error)
    })
}

export const createInitialOrder = (data, Router, path) => dispatch => {
  // dispatch({ type: LOADING, payload: true })

  axios
    .post(`${ROOT_URL}/order/initial`, data?.dataForm)
    .then(response => {

      console.log('response initial', response)
      // dispatch({ type: LOADING, payload: false })

      var itemsNames = data?.cart?.therapies.map((c, index) => {
        return c.product_name
      })
      var itemsCategories = data?.cart?.therapies.map((c, index) => {
        return c.category
      })

      var unix_timestamp = Math.floor(new Date().getTime() / 1000)

      dataLayer.push({
        'event': 'startCheckout',
        "custom_data": {
          "items": data.therapiesKlaviyo,
          "country": data?.country.country_name,
          "currency": response?.data?.customer?.currency_code,
          "order_id": response?.data?.customer?.order_id2,
          "event_id": response?.data?.customer?.order_id2 + '_' + unix_timestamp,
          "coupon": data?.cart?.discountData?.name,
          "phone": response?.data?.customer?.shipping_telephone,
          "address": response?.data?.customer?.shipping_address,
          "postcode": response?.data?.customer?.shipping_postcode,
          "customer_first_name": response?.data?.customer?.shipping_first_name,
          "customer_email": response?.data?.customer?.shipping_email,
          "customer_last_name": response?.data?.customer?.shipping_last_name,
          "total": data?.cart?.total,
          "itemsNames": itemsNames,
          "itemsCategories": itemsCategories,
          "url": data?.url,
        }
      });

      dispatch({ type: CUSTOMER, payload: response })
      return response;
    })
    .catch(error => {
      console.log(error)
      //var err = error.response.data.error
      dispatch({ type: LOADING, payload: false })
      console.log(error)
    })
}

export const updateInitialOrder = (data, Router, path) => dispatch => {
  // dispatch({ type: LOADING, payload: true })

  axios
    .post(`${ROOT_URL}/order/update-initial`, data)
    .then(response => {

      console.log('response initial', response)

      // dispatch({ type: LOADING, payload: false })
      return response;
    })
    .catch(error => {
      console.log(error)
      //var err = error.response.data.error
      dispatch({ type: LOADING, payload: false })
      console.log(error)
    })
}
