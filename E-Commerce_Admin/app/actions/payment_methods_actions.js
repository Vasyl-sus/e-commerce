import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_PAYMENT_METHODS, SET_INITIAL_VALUES_PAYMENT_METHOD, DELETE_PAYMENT_METHOD, LOADING} from '../config/constants'

export function getPaymentMethods()
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

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/paymentmethod${query}`)
		  .then((response) => {
			  dispatch({type: GET_PAYMENT_METHODS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createPaymentMethod(obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/paymentmethod`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo plačilno metodo!');
  			//dispatch({type: CREATE_NEW_PAYMENT_METHOD, payload: obj});
        dispatch(getPaymentMethods());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'paymentmethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesPaymentMethod(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_PAYMENT_METHOD, payload:obj})
	}
}

export function editPaymentMethod(id, obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/paymentmethod/${id}`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili plačilno metodo!');
        // obj.id = id;
  			// dispatch({type: EDIT_PAYMENT_METHOD, payload: {id, obj}});
        dispatch(getPaymentMethods());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'paymentmethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deletePaymentMethod(id, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/paymentmethod/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili plačilno metodo!');
        dispatch({type: DELETE_PAYMENT_METHOD, payload: {id}});
        dispatch(getPaymentMethods());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'paymentmethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deletePaymentMethodImage(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/paymentmethod/image/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko plačilne metode!');
        dispatch(getPaymentMethods());
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
		})
	}
}
