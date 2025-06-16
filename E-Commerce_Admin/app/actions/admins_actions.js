import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_ADMINS, CREATE_ADMIN, SET_INITIAL_VALUES_ADMIN, EDIT_ADMIN, DELETE_ADMIN, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getAdmins()
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
		  axios.get(`${ROOT_URL}/admin/admin${query}`)
		  .then((response) => {
			  dispatch({type: GET_ADMINS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createAdmin(obj,user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/admin`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov uporabnik!');
        obj.id = response.data.id;
        dispatch({type: CREATE_ADMIN, payload: obj});
        dispatch(getAdmins());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', {what: 'admins', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesAdmin(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_ADMIN, payload:obj})
	}
}

export function editAdmin(id, obj,user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/admin/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili uporabnika!');
        dispatch({type: EDIT_ADMIN, payload: {id, obj}});
        dispatch(getAdmins());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', {what: 'admins', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteAdmin(id,user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/admin/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili uporabnika!');
        dispatch({type: DELETE_ADMIN, payload: {id}});
        dispatch(getAdmins());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', {what: 'admins', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
