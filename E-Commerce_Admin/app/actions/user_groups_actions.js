import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_USER_GROUPS, CREATE_NEW_USER_GROUP, SET_INITIAL_VALUES_USER_GROUP, EDIT_USER_GROUP, DELETE_USER_GROUP, LOADING} from '../config/constants'

export function getUserGroups()
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
		  axios.get(`${ROOT_URL}/admin/admingroup${query}`)
		  .then((response) => {
			  dispatch({type: GET_USER_GROUPS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createUserGroup(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/admingroup`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo uporabniško skupino!');
        obj.id = response.data.id;
  			dispatch({type: CREATE_NEW_USER_GROUP, payload: obj});
        dispatch(getUserGroups());
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

export function setInitialValuesUserGroup(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_USER_GROUP, payload:obj})
	}
}

export function editUserGroup(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/admingroup/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili uporabniško skupino!');
        dispatch({type: EDIT_USER_GROUP, payload: {id, obj}});
        dispatch(getUserGroups());
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

export function deleteUserGroup(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/admingroup/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili uporabniško skupino!');
        dispatch({type: DELETE_USER_GROUP, payload: {id}});
        dispatch(getUserGroups());
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
