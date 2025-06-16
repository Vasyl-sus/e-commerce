import {
  GET_CART,
  EDIT_QTY,
  REMOVE_THERAPY,
  GET_OTO_DATA,
  ADD_TO_CART,
  GET_ORDER,
  UPDATE_CART,
  INITIAL_SUBMITTED,
  GET_ORDER_ID,
  DISCOUNT_NOT_FOUND,
  OPEN_CART_MODAL,
  OPEN_ACCESSORY_MODAL,
  SUCCESS_REVIEW,
  ERROR_REVIEW,
  CLOSE_CART_MODAL,
  CLOSE_ACCESSORY_MODAL,
  CUSTOMER
} from '../constants/constants.js'

const INITIAL_STATE = {
  cart: {
    discount: 0,
    shipping_fee: 0,
    subtotal: 0,
    total: 0,
    order: {},
    accessories: [],
    therapies: [],
  },
  customer: {},
  secondStep: false,
  thirdStep: false,
  order_summary: {
    discount: 0,
    shipping_fee: 0,
    subtotal: 0,
    therapies: [],
    total: 0,
  },
  open_cart_modal: false,
  open_accessory_modal: false,
  accessory_modal_items: [],
  discount_name: null,
  addedTherapy: {},
  addedProduct: {},
  reviewStatus: {
    success: null,
    error: null,
  },
  gifts: [],
  giftConfig: {},
}

export default function CartFunction(state = INITIAL_STATE, action) {
  let nextState = state
  switch (action.type) {
    case GET_CART:
      nextState.cart = Object.assign(nextState.cart, action.payload.cart)
      if (action.payload.customer) nextState.customer = action.payload.customer
      nextState.numCart = action.payload.cart.therapies.length
      nextState.gifts = action.payload.gifts
      nextState.giftConfig = action.payload.giftConfig
      break
    case CUSTOMER:
      if (action?.payload?.data?.customer) nextState.customer = action.payload.data.customer
      break
    case SUCCESS_REVIEW:
      nextState.reviewStatus.success = true
      nextState.reviewStatus.error = false
      break
    case ERROR_REVIEW:
      nextState.reviewStatus.success = false
      nextState.reviewStatus.error = true
      break
    case GET_ORDER:
      nextState.order_summary = action.payload
    case ADD_TO_CART:
      let obj = action.payload
      nextState.addedTherapy = obj.therapy.therapy
      nextState.addedProduct = obj.therapy.product
      break
    case UPDATE_CART:
      nextState.cart = Object.assign(nextState.cart, action.payload.cart)
      if (action.payload.customer) {
        nextState.customer = action.payload.customer
      }
      break
    case GET_ORDER_ID:
      nextState.order_id = action.payload.id
      nextState.initial_submitted = 1 
      break
    case INITIAL_SUBMITTED:
      nextState.initial_submitted = action.payload
      break
    case DISCOUNT_NOT_FOUND:
      nextState.discount_not_found = action.payload
      break
    case OPEN_CART_MODAL:
      nextState.open_cart_modal = !nextState.open_cart_modal
      break
    case CLOSE_CART_MODAL:
      nextState.open_cart_modal = false
      break
    case OPEN_ACCESSORY_MODAL:
      nextState.open_accessory_modal = !nextState.open_cart_modal
      nextState.accessory_modal_items = action.payload.accessories
      nextState.discount_name = action.payload.discount_name
      break
    case CLOSE_ACCESSORY_MODAL:
      nextState.open_accessory_modal = false
      nextState.accessory_modal_items = []
      nextState.discount_name = null
      break
    case GET_OTO_DATA:
      nextState.otos = action && action.payload && action.payload.data && action.payload.data && action.payload.data.otos[0]
      nextState.order_info = action && action.payload && action.payload.data && action.payload.data && action.payload.data.order
      var order_date = action && action.payload && action.payload.data && action.payload.data.order && action.payload.data.order.date_added
      var time = nextState.otos && nextState.otos.time

      if (time) {
        const offsetGMTInMinutes = new Date().getTimezoneOffset()

        var expire_date = new Date(order_date)
        expire_date.setMinutes(expire_date.getMinutes() - offsetGMTInMinutes)
        expire_date.setMinutes(expire_date.getMinutes() + time)
        nextState.expire_date = expire_date
      }
      break
  }
  return { ...state, ...nextState }
}

/*73096f1e-7e88-11e8-adc0-fa7ae01bbebc*/
