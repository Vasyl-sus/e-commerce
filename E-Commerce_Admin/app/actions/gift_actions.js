import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_GIFTS, CREATE_GIFT, SET_INITIAL_VALUES_GIFT, DELETE_GIFT, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getGifts()
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

  if(location.query.active)
  {
    query+=`&active=${location.query.active}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/gift${query}`)
		  .then((response) => {
			  dispatch({type: GET_GIFTS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createGift(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/gift`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo darilo!');
        obj.id = response.data.id
        dispatch({type: CREATE_GIFT, payload: obj});
        dispatch(getGifts());
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

export function setInitialValuesGift(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_GIFT, payload:obj})
	}
}

export function editGift(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/gift/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili darilo!');
        //dispatch({type: EDIT_GIFT, payload: {id, obj}});
        dispatch(getGifts());
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

export function deleteGift(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/gift/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili darilo!');
        dispatch({type: DELETE_GIFT, payload: {id}});
        dispatch(getGifts());
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
