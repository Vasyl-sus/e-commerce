import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_INSTAGRAM_FEEDS, NEW_INSTAGRAM_FEED, SET_INITIAL_VALUES_INSTAGRAM_FEED,
EDIT_INSTAGRAM_FEED, DELETE_INSTAGRAM_FEED, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getInstagramFeeds()
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
		  axios.get(`${ROOT_URL}/admin/ig_feed${query}`)
		  .then((response) => {
			  dispatch({type: GET_INSTAGRAM_FEEDS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createInstagramFeed(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/ig_feed`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov instagram feed!');
        obj.id = response.data.id;
        dispatch({type: NEW_INSTAGRAM_FEED, payload: obj});
        dispatch(getInstagramFeeds());
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

export function setInitialValuesInstagramFeed(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_INSTAGRAM_FEED, payload:obj})
	}
}

export function editInstagramFeed(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/ig_feed/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili instagram feeda!');
        dispatch({type: EDIT_INSTAGRAM_FEED, payload: {id, obj}});
        dispatch(getInstagramFeeds());
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

export function deleteInstagramFeed(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/ig_feed/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili instagram feeda!');
        dispatch({type: DELETE_INSTAGRAM_FEED, payload: {id}});
        dispatch(getInstagramFeeds());
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

export function deleteInstagramPicture(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/ig_feed/images/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko instagram feeda!');
        dispatch(getInstagramFeeds());
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
