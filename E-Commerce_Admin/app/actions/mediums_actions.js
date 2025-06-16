import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_MEDIUMS, SET_INITIAL_VALUES_MEDIUM, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getMediums()
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
		  axios.get(`${ROOT_URL}/admin/medium${query}`)
		  .then((response) => {
			  dispatch({type: GET_MEDIUMS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createMedium(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/medium`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov medij!');
        obj.id = response.data.id;
        // dispatch({type: NEW_MEDIUM, payload: obj});
        dispatch(getMediums());
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

export function setInitialValuesMedium(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_MEDIUM, payload:obj})
	}
}

export function EditSingleMedium(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/medium/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili medija!');
        // dispatch({type: EDIT_MEDIUM, payload: {id, obj}});
        dispatch(getMediums());
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

export function DeleteMedium(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/medium/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili medija!');
        // dispatch({type: DELETE_INSTAGRAM_FEED, payload: {id}});
        dispatch(getMediums());
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
