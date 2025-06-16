import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_PRODUCT_CATEGORIES, CREATE_PRODUCT_CATEGORY, SET_INITIAL_VALUES_PRODUCT_CATEGORY, DELETE_PRODUCT_CATEGORY, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App';

export function getProductCategories()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber){
  	query+=`pageNumber=${location.query.pageNumber}`;
  }
  else {
	  query+=`pageNumber=1`;
  }

  if(location.query.pageLimit){
  	query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else {
	  query+=`&pageLimit=20`;
  }

  return function (dispatch) {
		dispatch({type:LOADING, payload:true})
	  axios.get(`${ROOT_URL}/admin/category${query}`)
	  .then((response) => {
		  dispatch({type: GET_PRODUCT_CATEGORIES, payload: response.data})
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createProductCategory(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/category`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo kategorijo produkta!');
  			obj.id = response.data.id
  			dispatch({type: CREATE_PRODUCT_CATEGORY, payload: obj});
        dispatch(getProductCategories());
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

export function setInitialValuesProductCategory(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_PRODUCT_CATEGORY, payload:obj})
	}
}

export function editProductCategory(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/category/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili kategorijo produkta!');
  			// dispatch({type: EDIT_PRODUCT_CATEGORY, payload: {id, obj}});
        dispatch(getProductCategories());
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

export function deleteProductCategory(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/category/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili kategorijo produkta!');
			  dispatch({type: DELETE_PRODUCT_CATEGORY, payload: {id}});
        dispatch(getProductCategories());
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
