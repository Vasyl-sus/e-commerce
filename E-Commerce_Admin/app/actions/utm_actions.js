import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_UTMS, CREATE_NEW_UTM, SET_INITIAL_VALUES_UTM, EDIT_UTM, DELETE_UTM, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getUTMS()
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
		  axios.get(`${ROOT_URL}/admin/utmmedium${query}`)
		  .then((response) => {
			  dispatch({type: GET_UTMS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createUTM(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/utmmedium`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov UTM medium!');
        obj.id = response.data.id;
        dispatch({type: CREATE_NEW_UTM, payload: obj});
        dispatch(getUTMS());
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

export function setInitialValuesUTM(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_UTM, payload:obj})
	}
}

export function editUTM(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/utmmedium/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili UTM mediuma!');
        obj.id = id;
  			dispatch({type: EDIT_UTM, payload: {id, obj}});
        dispatch(getUTMS());
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

export function deleteUTM(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/utmmedium/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili UTM mediuma!');
        dispatch({type: DELETE_UTM, payload: {id}});
        dispatch(getUTMS());
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
