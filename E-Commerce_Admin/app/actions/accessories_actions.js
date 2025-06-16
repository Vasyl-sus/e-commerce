import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_ACCESSORIES, CREATE_ACCESSORY, SET_INITIAL_VALUES_ACCESSORY, DELETE_ACCESSORY, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getAccessories()
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

  if(location.query.search)
  {
    query+=`&search=${location.query.search}`;
  }

  if(location.query.country)
  {
    query+=`&country=${location.query.country}`;
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
		  axios.get(`${ROOT_URL}/admin/accessory${query}`)
		  .then((response) => {
			  dispatch({type: GET_ACCESSORIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createAccessory(data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/accessory`, data, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov dodatek!');
        data.id = response.data.id;
        dispatch({type: CREATE_ACCESSORY, payload: data});
        dispatch(getAccessories());
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

export function setInitialValuesAccessory(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_ACCESSORY, payload:obj})
	}
}

export function editAccessory(id, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/accessory/${id}`, data, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili dodatka!');
        dispatch(getAccessories());
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

export function deleteAccessory(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/accessory/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili dodatek!');
        dispatch({type: DELETE_ACCESSORY, payload: {id}});
        dispatch(getAccessories());
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

export function deleteAccessoryImages(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/accessory/images/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko dodatka!');
        dispatch(getAccessories());
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
