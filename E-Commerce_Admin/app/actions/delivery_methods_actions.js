import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_DELIVERY_METHODS, CREATE_NEW_DELIVERY_METHOD, SET_INITIAL_VALUES_DELIVERY_METHOD, EDIT_DELIVERY_METHOD, DELETE_DELIVERY_METHOD, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getDeliveryMethods()
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
		  axios.get(`${ROOT_URL}/admin/deliverymethod${query}`)
		  .then((response) => {
			  dispatch({type: GET_DELIVERY_METHODS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createDeliveryMethod(obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/deliverymethod`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov način dostave!');
        obj.id = response.data.id;
        dispatch({type: CREATE_NEW_DELIVERY_METHOD, payload: obj});
        dispatch(getDeliveryMethods());
      }
      dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'deliverymethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesDeliveryMethod(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_DELIVERY_METHOD, payload:obj})
	}
}

export function editDeliveryMethod(id, obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/deliverymethod/${id}`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili način dostave!');
        dispatch({type: EDIT_DELIVERY_METHOD, payload: {id, obj}});
        dispatch(getDeliveryMethods());
      }
      dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'deliverymethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteDeliveryMethod(id, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/deliverymethod/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili način dostave!');
        dispatch({type: DELETE_DELIVERY_METHOD, payload: {id}});
        dispatch(getDeliveryMethods());
      }
      dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'deliverymethods', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
