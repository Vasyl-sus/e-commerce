import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import { ROOT_URL, GET_USER_TESTIMONIALS, ADD_USER_TESTIMONIAL, LOADING, DELETE_USER_TESTIMONIAL, EDIT_USER_TESTIMONIAL } from '../config/constants'

export function getUserTestimonials()
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

	query+=`&sort=sort_number&sortOpt=DESC`;

  return function (dispatch) {
  		dispatch({ type: LOADING, payload: true })
		  axios.get(`${ROOT_URL}/admin/user-testimonial${query}`)
		  .then((response) => {
			  dispatch({ type: GET_USER_TESTIMONIALS, payload: response.data })
        dispatch({ type: LOADING, payload: false })
		})
		.catch((response) => {
			dispatch({ type: LOADING, payload:false })
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createUserTestimonial(obj) {
	return function (dispatch) {
		dispatch({ type: LOADING, payload: true })
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/user-testimonial`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo izjavo!');
        obj.id = response.data.id;
  			dispatch({ type: ADD_USER_TESTIMONIAL, payload: obj });
        dispatch(getUserTestimonials());
      }
			dispatch({ type:LOADING, payload:false })
		})
		.catch((response) => {
			dispatch({ type:LOADING, payload:false })
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteUserTestimonial(id) {
	return function (dispatch) {
		dispatch({ type: LOADING, payload: true })
		axios.delete(`${ROOT_URL}/admin/user-testimonial/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili izjavo!');
        dispatch({ type: DELETE_USER_TESTIMONIAL, payload: { id } });
        dispatch(getUserTestimonials());
      }
			dispatch({ type: LOADING, payload: false })
		})
		.catch((response) => {
			dispatch({ type: LOADING, payload: false })
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editUserTestimonial(id, data) {
	return function (dispatch) {
		dispatch({ type:LOADING, payload:true })
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/user-testimonial/${id}`, data, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili izjavo!');
        // dispatch({type: EDIT_USER_TESTIMONIAL, payload: data});
  			dispatch(getUserTestimonials());
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