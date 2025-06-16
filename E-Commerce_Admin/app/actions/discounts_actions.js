import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, CREATE_NEW_DISCOUNT, SET_INITIAL_VALUES_DISCOUNT,
GET_DISCOUNT_DETAILS, EDIT_DISCOUNT, GET_DISCOUNTSS, LOADING} from '../config/constants'
import {errorNotification} from '../App.js'

export function getDiscounts()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber)
  {
    query+=`pageNumber=${location.query.pageNumber}`;
  }
  else
  {
     query+=`pageNumber=1`;
  }

  if(location.query.pageLimit)
  {
    query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else
  {
    query+=`&pageLimit=15`;
  }

  if(location.query.active){
    if (location.query.active != 2) {
  	  query+=`&active=${location.query.active}`;
    }
  } else {
    query+=`&active=1`;
  }

  if(location.query.type){
    query+=`&type=${location.query.type}`;
  }

  if(location.query.search){
  	query+=`&search=${location.query.search}`;
  }

  if(location.query.country)
  {
    query+=`&country=${location.query.country}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/discount${query}&isAdditionalDiscount=0`)
		.then((response) => {
			dispatch({type: GET_DISCOUNTSS, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log('2262 getDiscounts', response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getDiscountDetails(id)
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumberOrders)
  {
    query+=`pageNumberOrders=${location.query.pageNumberOrders}`;
  }
  else
  {
     query+=`pageNumberOrders=1`;
  }

  if(location.query.pageLimitOrders)
  {
    query+=`&pageLimitOrders=${location.query.pageLimitOrders}`;
  }
  else
  {
    query+=`&pageLimitOrders=10`;
  }
  if (location.query.status)
  {
    var order_status = location.query.status;

    if (typeof order_status != 'string')
    {
      for(var i=0; i<order_status.length; i++)
      {
        query+=`&status[]=${order_status[i]}`;
      }
    }
    else
    {
        query+=`&status[]=${order_status}`;
    }
  }

  if(location.query.date_from)
  {
    query+=`&date_from=${location.query.date_from}`;
  }

  if(location.query.date_to)
  {
    query+=`&date_to=${location.query.date_to}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/discount/${id}${query}`)
		.then((response) => {
			dispatch({type: GET_DISCOUNT_DETAILS, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log('2262 getDiscountDetails', response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createDiscount(obj, user) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/discount`, obj)
		.then((response) => {
      if(response.data.success) {
        obj.id = response.data.id;
        dispatch({type: CREATE_NEW_DISCOUNT, payload: obj});
        dispatch(getDiscounts());
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log('2262 createDiscount', response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesDiscount(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_DISCOUNT, payload:obj})
	}
}

export function editDiscount(id, obj, user) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/discount/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        obj.id = id;
        dispatch({type: EDIT_DISCOUNT, payload: {id, obj}});
        dispatch(getDiscounts());
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log('2262 editDiscount', response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteDiscount(id, user) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/discount/${id}`)
		.then((response) => {
      if(response.data.success) {
        // dispatch({type: DELETE_DISCOUNT, payload: {id}});
        dispatch(getDiscounts());
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log('2262 deleteDiscount', response)
			errorNotification(response.response.data.message);
		})
	}
}
