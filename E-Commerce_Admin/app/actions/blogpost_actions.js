import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_BLOG_POSTS, GET_BLOG_POSTS_ALL, CREATE_BLOG_POST, GET_BLOG_CATEGORIES, SET_INITIAL_VALUES_BLOG_POST, DELETE_BLOG_POST, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getBlogPosts()
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

	if(location.query.sort){
  	query+=`&sort=${location.query.sort}`;
  }
  else{
	query+=`&sort=title`;
  }

  if(location.query.sortOpt){
  	query+=`&sortOpt=${location.query.sortOpt}`;
  }
  else{
	query+=`&sortOpt=asc`;
  }

	if (location.query.countries)
  {
    var country = location.query.countries;

    if (typeof country != 'string')
    {
      for(var i=0; i<country.length; i++)
      {
        query+=`&countries[]=` + country[i];
      }
    }
    else
    {
      query+=`&countries[]=` + country;
    }
  }

  if(location.query.search){
  	query+=`&search=${location.query.search}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/blogpost${query}`)
		  .then((response) => {
			  dispatch({type: GET_BLOG_POSTS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getAllBlogPosts()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/blogpost`)
		  .then((response) => {
			  dispatch({type: GET_BLOG_POSTS_ALL, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getCategories()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/blogcategories`)
		  .then((response) => {
		  console.log(response);
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

export function createBlogPost(obj, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`${ROOT_URL}/admin/blogpost`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo objavo na blogu!');
        data.id = response.data.id;
  			dispatch({type: CREATE_BLOG_POST, payload: data});
        dispatch(getBlogPosts());
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

export function setInitialValuesBlogPost(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_BLOG_POST, payload:obj})
	}
}

export function editBlogPost(id, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.put(`${ROOT_URL}/admin/blogpost/${id}`, data, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili objavo na blogu!');
			  dispatch(getBlogPosts());
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

export function deleteBlogPost(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/blogpost/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili objavo na blogu!');
  			dispatch({type: DELETE_BLOG_POST, payload: {id}});
        dispatch(getBlogPosts());
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

export function deleteBlogPostImage(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/blogpost/image/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko bloga!');
        dispatch(getBlogPosts());
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
