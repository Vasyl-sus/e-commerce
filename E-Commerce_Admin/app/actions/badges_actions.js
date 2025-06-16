import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_BADGES, CREATE_BADGE, SET_INITIAL_VALUES_BADGE, EDIT_BADGE, DELETE_BADGE, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getBadges()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber){
    query+=`&pageNumber=${location.query.pageNumber}`;
  }
  else{
    query+=`&pageNumber=1`;
  }

  if(location.query.pageLimit){
    query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else{
    query+=`&pageLimit=15`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/badge${query}`)
		  .then((response) => {
			  dispatch({type: GET_BADGES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createBadge(obj, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/badge`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo značko!');
        data.id = response.data.id;
        dispatch({type: CREATE_BADGE, payload: data});
        dispatch(getBadges());
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

export function setInitialValuesBadge(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_BADGE, payload:obj})
	}
}

export function editBadge(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/badge/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili značko!');
        obj.id = id;
  			dispatch({type: EDIT_BADGE, payload: {id, obj}});
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

export function deleteBadge(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/badge/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili značko!');
        dispatch({type: DELETE_BADGE, payload: {id}});
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
