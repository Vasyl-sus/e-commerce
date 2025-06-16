import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_THERAPIES, CREATE_NEW_THERAPY, SET_INITIAL_VALUES_THERAPY, DELETE_THERAPY, LOADING} from '../config/constants'

export function getTherapies()
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

  if(location.query.sort)
  {
    query+=`&sort=${location.query.sort}`;
  }
  else
  {
    query+=`&sort=country`;
  }

  if(location.query.sortOpt)
  {
    query+=`&sortOpt=${location.query.sortOpt}`;
  }
  else
  {
    query+=`&sortOpt=asc`;
  }

  if(location.query.search){
    query+=`&search=${location.query.search}`;
  }

  if(location.query.country){
    query+=`&country=${location.query.country}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/therapy${query}`)
		  .then((response) => {
			  dispatch({type: GET_THERAPIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createTherapy(data, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/therapy`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo terapijo!');
        data.id = response.data.id;
  			dispatch({type: CREATE_NEW_THERAPY, payload: data});
        dispatch(getTherapies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'therapies', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesTherapy(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_THERAPY, payload:obj})
	}
}

export function editTherapy(id, data, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/therapy/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili terapijo!');
        dispatch(getTherapies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'therapies', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteTherapy(id, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/therapy/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste deaktivirali terapijo!');
        dispatch({type: DELETE_THERAPY, payload: {id}});
        dispatch(getTherapies());
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'therapies', client_token: user.token });
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteTherapyImage(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/therapy/image/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko terapije!');
        dispatch(getTherapies());
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
