import axios from "axios";
import { ROOT_URL } from "../constants/constants"

let eventId;

export const PageView = (data) =>  {
  axios.post(`${ROOT_URL}/facebook/page-view`, data)
    .then(response => {
      console.log('PageView action success');
    })
    .catch(err => {
      console.log('PageView action error:', err.message);
    })
}

export const AddToCart = (data) =>  {
  axios.post(`${ROOT_URL}/facebook/add-to-cart`, data)
    .then(response => {
      console.log('AddToCart action success')
    })
    .catch(err => {
      console.log('AddToCart action error')
    })
}

export const ViewContent = (data) =>  {
  axios.post(`${ROOT_URL}/facebook/view-content`, data)
    .then(response => {
      console.log('ViewContent action success')
    })
    .catch(err => {
      console.log('ViewContent action error')
    })
}


export const InitialCheckout = (data) =>  {
  axios.post(`${ROOT_URL}/facebook/initial-checkout`, data)
    .then(response => {
      console.log('InitialCheckout action success')
    })
    .catch(err => {
      console.log('InitialCheckout action error')
    })
}

export const Purchase = (data) =>  {
  axios.post(`${ROOT_URL}/facebook/purchase`, data)
    .then(response => {
      console.log('Purchase action success')
    })
    .catch(err => {
      console.log('Purchase action error')
    })
}