import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_PRODUCTS, SET_INITIAL_VALUES_PRODUCT, GET_STOCK_CHANGES, EDIT_PRODUCT_STOCK, GET_STOCK_REMINDERS, ADD_STOCK_REMINDER,
DELETE_STOCK_REMINDER, SET_INITIAL_VALUES_PRODUCT_STOCK, GET_ALL_STOCK_CHANGES, LOADING} from '../config/constants'

export function getProducts()
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

  if (location.query.showAll) {
	query += `&showAll=true`
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
		  axios.get(`${ROOT_URL}/admin/product${query}`)
		  .then((response) => {
			  dispatch({type: GET_PRODUCTS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getStockChanges(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/product/stock/${id}`)
		  .then((response) => {
			  dispatch({type: GET_STOCK_CHANGES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getAllStockChanges()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumberStock)
  {
    query+=`pageNumberStock=${location.query.pageNumberStock}`;
  }
  else
  {
     query+=`pageNumberStock=1`;
  }

  if(location.query.pageLimitStock)
  {
    query+=`&pageLimitStock=${location.query.pageLimitStock}`;
  }
  else
  {
    query+=`&pageLimitStock=15`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/product/stock${query}`)
		  .then((response) => {
			  dispatch({type: GET_ALL_STOCK_CHANGES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getStockReminders(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/stockreminder/${id}`)
		  .then((response) => {
			  dispatch({type: GET_STOCK_REMINDERS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editProductStock(id, obj)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/product/stock/${id}`, obj)
		  .then((response) => {
        if(response.data.success) {
          createNotification('success','Uspešno ste posodobili količino produkta!');
          obj.id = id
  			  dispatch({type: EDIT_PRODUCT_STOCK, payload: obj})
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

export function createProduct(data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/product`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov produkt!');
        data.id = response.data.id;
        dispatch(getProducts());
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

export function createStockReminder(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/stockreminder`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov opomnik!');
        obj.id = response.data.id;
  			dispatch({type: ADD_STOCK_REMINDER, payload: obj});
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

export function setInitialValuesProduct(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_PRODUCT, payload:obj})
	}
}

export function setInitialValuesProductStock(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_PRODUCT_STOCK, payload:obj})
	}
}

export function editProduct(id, data) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/product/${id}`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili produkta!');
        dispatch(getProducts());
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

export function editStockReminder(product_id, id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/stockreminder/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili opomnika!');
        dispatch(getStockReminders(product_id));
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

export function deleteProduct(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/product/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili produkta!');
        dispatch(getProducts());
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

export function deleteStockReminder(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/stockreminder/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili opomnika!');
        dispatch({type: DELETE_STOCK_REMINDER, payload: {id}});
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

export function deleteProductImage(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/product/image/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili sliko produkta!');
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
