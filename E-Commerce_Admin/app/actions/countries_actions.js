import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_COUNTRIES_LIST, ADD_COUNTRY, LOADING, DELETE_COUNTRY, INITIAL_COUNTRY, API_URL} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getCountries()
{
	var location = browserHistory.getCurrentLocation();
  var query = "?showLangs=1&";

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
		  axios.get(`${ROOT_URL}/admin/country${query}`)
		  .then((response) => {
			dispatch({type: GET_COUNTRIES_LIST, payload: response.data})
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function addCountry(obj, user,socket)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/country`, obj)
		  .then((response) => {
		  	createNotification('success','Uspešno ste dodali novo državo!');
				obj.id = response.data.id;
				dispatch({type: ADD_COUNTRY, payload: obj})
				dispatch(getCountries());
				dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'countries', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editCountry(data, langData) {
  var id = data.id;
  delete data.id
	var user = JSON.parse(localStorage.getItem('user'))
	return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/country/${id}`, data)
		  .then((response) => {
				const config = { headers: { 'authorization': user.session_id } };
				axios.post(`${API_URL}/language/routes`, langData, config)
				.then((response) => {
	  			createNotification('success','Uspešno ste posodobili državo!');
			  	dispatch(getCountries())
			  	dispatch({type:LOADING, payload:false})
				})
				.catch((response) => {
					dispatch({type:LOADING, payload:false})
					console.log(2262, response)
					errorNotification(response.response.data.message);
				})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteCountry(id, user, socket)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.delete(`${ROOT_URL}/admin/country/`+id)
		  .then((response) => {
		  createNotification('success','Uspešno ste odstranili državo!');
			dispatch({type: DELETE_COUNTRY, payload: id})
			dispatch(getCountries())
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'countries', client_token: user.token });
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialCountry(data) {
	return function (dispatch) {
  		dispatch({type:INITIAL_COUNTRY, payload:data})
	}
}
