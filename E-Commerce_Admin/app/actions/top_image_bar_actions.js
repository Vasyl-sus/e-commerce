import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_TOP_IMAGE_BAR, CREATE_TOP_IMAGE_BAR, SET_INITIAL_VALUES_TOP_IMAGE_BAR, DELETE_TOP_IMAGE_BAR, LOADING} from '../config/constants';

export function getBillboard()
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
		  axios.get(`${ROOT_URL}/admin/billboard${query}`)
		  .then((response) => {
			  dispatch({type: GET_TOP_IMAGE_BAR, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createBillboard(data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/billboard/`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov naslovni slider!');
        data.id = response.data.id;
  			dispatch({type: CREATE_TOP_IMAGE_BAR, payload: data});
        dispatch(getBillboard());
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

export function setInitialValuesBillboard(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_TOP_IMAGE_BAR, payload:obj})
	}
}

export function editBillboard(id, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/billboard/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili sliderja!');
        dispatch(getBillboard());
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

export function deleteBillboard(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/billboard/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliderja!');
        dispatch({type: DELETE_TOP_IMAGE_BAR, payload: {id}});
        dispatch(getBillboard());
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

export function deleteBillboardImage(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/billboard/image/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko sliderja!');
        dispatch(getBillboard());
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
