import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_BLOG_CATEGORIES, CREATE_BLOG_CATEGORY, SET_INITIAL_VALUES_BLOG_CATEGORY, DELETE_BLOG_CATEGORY, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getBlogCategories()
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
		  axios.get(`${ROOT_URL}/admin/blogcategories${query}`)
		  .then((response) => {
			  dispatch({type: GET_BLOG_CATEGORIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createBlogCategory(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/blogcategories`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo blog kategorijo!');
        obj.id = response.data.id;
			  dispatch({type: CREATE_BLOG_CATEGORY, payload: obj});
        dispatch(getBlogCategories());
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

export function setInitialValuesBlogCategory(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_BLOG_CATEGORY, payload:obj})
	}
}

export function editBlogCategory(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/blogcategories/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili blog kategorijo!');
			  dispatch(getBlogCategories());
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

export function deleteBlogCategory(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/blogcategories/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili blog kategorijo!');
			  dispatch({type: DELETE_BLOG_CATEGORY, payload: {id}});
        dispatch(getBlogCategories());
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
