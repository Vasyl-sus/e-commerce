import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_CURRENCIES, CREATE_NEW_CURRENCY, SET_INITIAL_VALUES_CURRENCY, EDIT_CURRENCY, DELETE_CURRENCY, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getCurrencies()
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
    query+=`&pageLimit=5`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/currency${query}`)
		  .then((response) => {
			  dispatch({type: GET_CURRENCIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createCurrency(obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/currency`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo valuto!');
        obj.id = response.data.id;
        dispatch({type: CREATE_NEW_CURRENCY, payload: obj});
        dispatch(getCurrencies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'currencies', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesCurrency(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_CURRENCY, payload:obj})
	}
}

export function editCurrency(id, obj, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/currency/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili valuto!');
			  dispatch({type: EDIT_CURRENCY, payload: {id, obj}});
        dispatch(getCurrencies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'currencies', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteCurrency(id, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/currency/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili valuto!');
  			dispatch({type: DELETE_CURRENCY, payload: {id}});
        dispatch(getCurrencies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'currencies', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
