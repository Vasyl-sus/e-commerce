import {
  ROOT_URL,
  API_URL,
  LOADING,
  GET_BLOG_POSTS,
  GET_BLOG_POST,
  GET_BLOG_CATEGORIES,
  GET_BLOG_POSTS_HOME,
  GET_NEW_BLOG_POSTS,
} from '../constants/constants.js'
import axios from 'axios'
import Router from 'next/router'

axios.defaults.headers['Pragma'] = 'no-cache'
axios.interceptors.response.use(
  response => {
    return response
  },
  function (error) {
    // Do something with response error
    // if (error.response.status === 401) {
    //     // auth.logout();
    //     // router.replace('/auth/login');
    // }
    return Promise.reject(error)
  },
)

export const getBlogPosts = data => dispatch => {
  dispatch({ type: LOADING, payload: true })
  var query = '?pageLimit=600&'
  query += `country=${data.cnt}`
  query += `&lang=${data.lang}`
  if (data.category) query += `&categories=${data.category}`
  if (data.tags) {
    for (var i = 0; i < data.tags.length; i++) {
      query += `&tags=${data.tags[i]}`
    }
  }
  if (data.pagination) {
    query += `&pageNumber=${data.pagination}`
  }

  axios
    .get(`${ROOT_URL}/blogpost${query}`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: GET_NEW_BLOG_POSTS, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.error(response)
    })
}

export const getBlogPosts1 = data => dispatch => {
  var query = '?pageLimit=6&'
  query += `country=${data.cnt}`
  query += `&lang=${data.lang}`
  if (data.category) query += `&categories=${data.category}`
  if (data.tags) {
    for (var i = 0; i < data.tags.length; i++) {
      query += `&tags=${data.tags[i]}`
    }
  }
  if (data.pagination) {
    query += `&pageNumber=${data.pagination}`
  }

  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/blogpost${query}`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: GET_BLOG_POSTS, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const getBlogPostsForHome = (cnt, lang) => dispatch => {
  var query = '?'
  query += `country=${cnt}`
  query += `&lang=${lang}`
  query += `&pageNumber=1`
  query += `&pageLimit=6`

  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/blogpost${query}`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: GET_BLOG_POSTS_HOME, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const getCategories = () => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/blogpost/categories`)
    .then(response => {
      console.log(response)
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: GET_BLOG_CATEGORIES, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const getBlogDetails = id => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/blogpost/details/${id}`)
    .then(response => {
      console.log(response)
      dispatch({ type: LOADING, payload: false })
      //dispatch({ type: LOADING, payload: false });
      dispatch({ type: GET_BLOG_POST, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}
