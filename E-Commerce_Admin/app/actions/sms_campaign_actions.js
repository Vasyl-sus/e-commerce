import axios from 'axios'
import {browserHistory} from 'react-router'
import {errorNotification} from '../App.js'
import { ROOT_URL, LOADING, GET_INFOBIT_CUSTOMERS, CHECK_CUSTOMER, CHECK_ALL_CUSTOMERS, GET_INFOBIT_SCENARIOS,
GET_INFOBIT_REPORT, GET_INFOBIT_MESSAGES } from '../config/constants'

export function getSMSCustomers()
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

  if(location.query.country)
  {
    query+=`&country=${location.query.country}`;
  }

  if(location.query.from_date && location.query.to_date)
  {
    query+=`&date_from=${location.query.from_date}&date_to=${location.query.to_date}`;
  }

  if(location.query.num_of_orders)
  {
    query+=`&num_of_orders=${location.query.num_of_orders}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/infoBip/customers${query}`)
		  .then((response) => {
			  dispatch({type: GET_INFOBIT_CUSTOMERS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getScenarios() {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/infoBip/scenarios`)
		  .then((response) => {
			  dispatch({type: GET_INFOBIT_SCENARIOS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getOmniReport(data) {
  let query = `?bulkId=${data}`;

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/infoBip/omnireport${query}`)
		  .then((response) => {
			  dispatch({type: GET_INFOBIT_REPORT, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getOmniMessages() {
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
  if(location.query.from_date && location.query.to_date)
  {
    query+=`&date_from=${location.query.from_date}&date_to=${location.query.to_date}`;
  }
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/infoBip/omnimessages${query}`)
		  .then((response) => {
			  dispatch({type: GET_INFOBIT_MESSAGES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createCampaign(data, flag) {
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/infoBip/omnimessage?flag=${flag}`, data)
		  .then((response) => {
			  // dispatch({type: GET_INFOBIT_SCENARIOS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function checkCustomer(id)
{
  return function (dispatch) {
    dispatch({type:CHECK_CUSTOMER, payload:id})
	}
}

export function checkAllCustomers(flag)
{
  return function (dispatch) {
    dispatch({type:CHECK_ALL_CUSTOMERS, payload:flag})
	}
}
