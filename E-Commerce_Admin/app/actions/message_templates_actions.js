import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_MESSAGE_TEMPLATES, CREATE_NEW_MESSAGE_TEMPLATE, SET_INITIAL_VALUES_MESSAGE_TEMPLATE, EDIT_MESSAGE_TEMPLATE, DELETE_MESSAGE_TEMPLATE, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getMessageTemplates()
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
		  axios.get(`${ROOT_URL}/admin/smstemplate${query}`)
		  .then((response) => {
			  dispatch({type: GET_MESSAGE_TEMPLATES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createMessageTemplate(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/smstemplate`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov message template!');
        obj.id = response.data.id;
  			dispatch({type: CREATE_NEW_MESSAGE_TEMPLATE, payload: obj});
        dispatch(getMessageTemplates());
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

export function setInitialValuesMessageTemplate(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_MESSAGE_TEMPLATE, payload:obj})
	}
}

export function editMessageTemplate(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/smstemplate/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili message template-a!');
        obj.id = id;
  			dispatch({type: EDIT_MESSAGE_TEMPLATE, payload: {id, obj}});
        dispatch(getMessageTemplates());
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

export function deleteMessageTemplate(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/smstemplate/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili message template-a!');
        dispatch({type: DELETE_MESSAGE_TEMPLATE, payload: {id}});
        dispatch(getMessageTemplates());
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
