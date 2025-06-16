import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_CUSTOMER_PROFILES, CREATE_NEW_CUSTOMER_PROFILE, EDIT_CUSTOMER_PROFILE, DELETE_CUSTOMER_PROFILE, DELETE_FROM_ACCESSORIES,
SET_INITIAL_VALUES_CUSTOMER_PROFILE, SET_INITIAL_VALUES_NEW_ORDER, GET_CUSTOMER_DETAILS, CHECK_COUNTRY, TOGGLE_COUNTRY, TOGGLE_GIFT, CLEAR_THERAPY, CLEAR_ACC, DELETE_FROM_THERAPIES, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getCustomerProfiles() {
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber){
    query+=`pageNumber=${location.query.pageNumber}`;
  }

  else{
    query+=`pageNumber=1`;
  }

  if(location.query.pageLimit){
    query+=`&pageLimit=${location.query.pageLimit}`;
  }

  else{
    query+=`&pageLimit=15`;
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
		axios.get(`${ROOT_URL}/admin/customer${query}`)
		.then((response) => {
			dispatch({type: GET_CUSTOMER_PROFILES, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createProfile(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/customer`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo stranko!');
  			dispatch({type: CREATE_NEW_CUSTOMER_PROFILE, payload: obj});
        dispatch(getCustomerProfiles());
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

export function setInitialValuesProfile(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_CUSTOMER_PROFILE, payload:obj})
	}
}

export function setInitialValuesNewOrder(obj, d) {
  var data = {};
  data.shipping_first_name = obj.shipping_first_name;
  data.shipping_last_name = obj.shipping_last_name;
  data.shipping_email = obj.shipping_email;
  data.shipping_telephone = obj.shipping_telephone;
  data.shipping_address = obj.shipping_address;
  data.shipping_city = obj.shipping_city;
  data.shipping_postcode = obj.shipping_postcode;
  data.shipping_country = obj.shipping_country;

  data.payment_first_name = obj.first_name;
  data.payment_last_name = obj.last_name;
  data.payment_email = obj.email;
  data.payment_telephone = obj.telephone;
  data.payment_address = obj.address;
  data.payment_city = obj.city;
  data.payment_postcode = obj.postcode;
  data.payment_country = obj.country;

  data.payment_method_code = d.paymentmethod;
  data.delivery_method_code = d.deliverymethod;
  data.order_type = obj.order_type;
  data.utm_source = obj.utm_source;
  data.utm_medium = obj.utm_medium;

	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_NEW_ORDER, payload:data})
	}
}

export function registerInfoBip(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/customer/registerinfobip/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili stranko!');
  			dispatch(getCustomerDetails(id))
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

export function editProfile(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/customer/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili stranko!');
  			dispatch({type: EDIT_CUSTOMER_PROFILE, payload: {id, obj}});
        if(Object.keys(obj).length==1 && obj.badges){
  				dispatch(getCustomerProfiles());
  			}
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

export function deleteProfile(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/customer/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili stranko!');
			  dispatch({type: DELETE_CUSTOMER_PROFILE, payload: {id}});
        dispatch(getCustomerProfiles());
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

export function getCustomerDetails(customer_id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/customer/details/${customer_id}`)
		.then((response) => {
			dispatch({type: GET_CUSTOMER_DETAILS, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function showCustomerData(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/customer/details/${id}`)
		.then((response) => {
			dispatch({type: GET_CUSTOMER_DETAILS, payload: response.data})
      localStorage.setItem("customer", JSON.stringify(response.data.customer));
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function checkedCountry()
{
  return function (dispatch) {
    dispatch({type:CHECK_COUNTRY, payload:null})
  }
}

export function toggleCountry(id, flag)
{
  return function (dispatch) {
    dispatch({type:TOGGLE_COUNTRY, payload:{id, flag}})
  }
}

export function toggleGift(id, flag)
{
  return function (dispatch) {
    dispatch({type:TOGGLE_GIFT, payload:{id, flag}})
  }
}

export function clear_therapy(obj)
{
  return function (dispatch) {
    dispatch({type: CLEAR_THERAPY, payload: obj.id})
	}
}

export function clear_acc(obj)
{
  return function (dispatch) {
    dispatch({type: CLEAR_ACC, payload: obj.id})
	}
}

export function delete_from_therapies(obj)
{
  return function (dispatch) {
    dispatch({type: DELETE_FROM_THERAPIES, payload: obj})
	}
}

export function delete_from_accessories(obj)
{
  return function (dispatch) {
    dispatch({type: DELETE_FROM_ACCESSORIES, payload: obj})
	}
}
