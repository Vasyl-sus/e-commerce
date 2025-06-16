import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_COLOR_DASHBOARD, GET_COLORS, CREATE_COLOR, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App';

export function getColorDashboard()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/color`)
		  .then((response) => {
			  dispatch({type: GET_COLOR_DASHBOARD, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getColors()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber){
    query+=`&pageNumber=${location.query.pageNumber}`;
  }
  else{
    query+=`&pageNumber=1`;
  }

  if(location.query.pageLimit){
    query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else{
    query+=`&pageLimit=15`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/color${query}`)
		  .then((response) => {
			  dispatch({type: GET_COLORS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createColor(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/color`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo barvo!');
        obj.id = response.data.id;
  			dispatch({type: CREATE_COLOR, payload: obj});
        dispatch(getColors());
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

export function deleteColor(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/color/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili barvo!');
  			//dispatch({type: DELETE_COLOR, payload: {id}});
        dispatch(getColors());
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
