import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_AC_MAIL, CREATE_AC_MAIL, SET_INITIAL_VALUES_AC_MAIL, EDIT_AC_MAIL, DELETE_AC_MAIL, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getACMail()
{
	var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber){
  	query+=`pageNumber=${location.query.pageNumber}`;
  }
  else{
	query+=`pageNumber=1`;
  }

  if(location.query.pageLimit){
  	query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else{
	query+=`&pageLimit=20`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/acMail${query}`)
		  .then((response) => {
				dispatch({type: GET_AC_MAIL, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createACMail(obj)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/acMail`, obj)
		  .then((response) => {
		  	obj.id = response.data.id;
		  	createNotification('success','Uspešno ste dodali nov abandoned cart mail!');
				dispatch({type: CREATE_AC_MAIL, payload: obj})
				dispatch(getACMail());
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesACMail(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_AC_MAIL, payload:obj})
	}
}

export function editACMail(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/acMail/${id}`, obj)
		.then((response) => {
			createNotification('success','Uspešno ste posodobili abandoned cart maila!');
			dispatch({type: EDIT_AC_MAIL, payload: {id, obj}});
      dispatch(getACMail());
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteACMail(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.delete(`${ROOT_URL}/admin/acMail/${id}`)
		  .then((response) => {
		  	createNotification('success','Uspešno ste odstranili abandoned cart maila!');
				dispatch({type: DELETE_AC_MAIL, payload: id})
				dispatch(getACMail());
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
