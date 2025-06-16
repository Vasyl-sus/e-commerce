import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_TESTIMONIALS, ADD_TESTIMONIAL, SET_INITIAL_VALUES_TESTIMONIALS, DELETE_TESTIMONIAL, LOADING} from '../config/constants'

export function getTestimonials()
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
		  axios.get(`${ROOT_URL}/admin/testimonial${query}`)
		  .then((response) => {
			  dispatch({type: GET_TESTIMONIALS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createTestimonial(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/testimonial`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo izjavo!');
        obj.id = response.data.id;
  			dispatch({type: ADD_TESTIMONIAL, payload: obj});
        dispatch(getTestimonials());
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

export function setInitialValuesTestimonial(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_TESTIMONIALS, payload:obj})
	}
}

export function editTestimonial(id, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/testimonial/${id}`, data, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili izjavo!');
        //dispatch({type: EDIT_TESTIMONIAL, payload: data});
  			dispatch(getTestimonials());
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

export function deleteTestimonial(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/testimonial/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili izjavo!');
        dispatch({type: DELETE_TESTIMONIAL, payload: {id}});
        dispatch(getTestimonials());
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

export function deleteTestimonialImages(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/testimonial/images/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko izjave!');
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
