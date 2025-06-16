import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_GIFT_CONFIGURATOR, ADD_GIFT_CONFIGURATOR, SET_INITIAL_VALUES_GIFT_CONFIGURATOR,
EDIT_GIFT_CONFIGURATOR, DELETE_GIFT_CONFIGURATOR, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getGiftConfigurator()
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

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/gift/configurator${query}`)
		  .then((response) => {
			  dispatch({type: GET_GIFT_CONFIGURATOR, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createGiftConfigurator(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/gift/configurator`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo konfiguracijo!');
        obj.id = response.data.id
        dispatch({type: ADD_GIFT_CONFIGURATOR, payload: obj});
        dispatch(getGiftConfigurator());
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

export function setInitialValuesGiftConfigurator(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_GIFT_CONFIGURATOR, payload:obj})
	}
}

export function editGiftConfigurator(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/gift/configurator/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili konfiguracijo!');
        dispatch({type: EDIT_GIFT_CONFIGURATOR, payload: {id, obj}});
        dispatch(getGiftConfigurator());
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

export function deleteGiftConfigurator(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/gift/configurator/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili konfiguracijo!');
        dispatch({type: DELETE_GIFT_CONFIGURATOR, payload: {id}});
        dispatch(getGiftConfigurator());
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
