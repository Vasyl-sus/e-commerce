import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_INFLUENCERS, CREATE_NEW_INFLUENCER, SET_INITIAL_VALUES_INFLUENCER, DELETE_INFLUENCER,
GET_INFLUENCER_DETAILS, SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER, DELETE_FROM_ACCESSORIES_INFLUENCER,
CLEAR_ACC_INFLUENCER, CLEAR_THERAPY_INFLUENCER, DELETE_FROM_THERAPIES_INFLUENCER, LOADING} from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getInfluencers()
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

  if(location.query.type){
    query+=`&type=${location.query.type}`;
  }

  if(location.query.payment_type){
    query+=`&payment_type=${location.query.payment_type}`;
  }

  if(location.query.state){
    query+=`&state=${location.query.state}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/influencers${query}`)
		  .then((response) => {
			  dispatch({type: GET_INFLUENCERS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getInfluencerDetails(id)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/influencers/${id}`)
		  .then((response) => {
			  dispatch({type: GET_INFLUENCER_DETAILS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createInfluencer(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/influencers`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov influencer!');
        obj.id = response.data.id
        dispatch({type: CREATE_NEW_INFLUENCER, payload: obj});
        dispatch(getInfluencers());
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

export function createPayment(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/influencers/payments/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo plačilo!');
        obj.id = response.data.id
        dispatch(getInfluencerDetails(id));
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

export function setInitialValuesInfluencer(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_INFLUENCER, payload:obj})
	}
}

export function setInitialValuesNewOrderInfluencer(obj, d) {
  var data = {};
  data.shipping_first_name = obj.first_name;
  data.shipping_last_name = obj.last_name;
  data.shipping_email = obj.email;
  data.shipping_telephone = obj.telephone;
  data.shipping_address = obj.address;
  data.shipping_city = obj.city;
  data.shipping_postcode = obj.postcode;
  data.shipping_country = obj.country;
  data.payment_method_code = d.paymentmethod;
  data.delivery_method_code = d.deliverymethod;
  data.order_type = obj.order_type;
  data.utm_source = obj.utm_source;
  data.utm_medium = obj.utm_medium;
  data.description = obj.description;
  data.tracking_code = obj.tracking_code;

	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER, payload:data})
	}
}

export function editInfluencer(id, obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/influencers/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili influencerja!');
        dispatch(getInfluencers());
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

export function deleteInfluencer(id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/influencers/${id}`)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili influencerja!');
        dispatch({type: DELETE_INFLUENCER, payload: {id}});
        dispatch(getInfluencers());
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

export function clear_therapy(obj)
{
  return function (dispatch) {
    dispatch({type: CLEAR_THERAPY_INFLUENCER, payload: obj.id})
	}
}

export function clear_acc(obj)
{
  return function (dispatch) {
    dispatch({type: CLEAR_ACC_INFLUENCER, payload: obj.id})
	}
}

export function delete_from_therapies(obj)
{
  return function (dispatch) {
    dispatch({type: DELETE_FROM_THERAPIES_INFLUENCER, payload: obj})
	}
}

export function delete_from_accessories(obj)
{
  return function (dispatch) {
    dispatch({type: DELETE_FROM_ACCESSORIES_INFLUENCER, payload: obj})
	}
}

export function addNewOrder(obj, id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/influencers/order/${id}`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali novo naročilo!');
        browserHistory.push("/order_details?id=" + response.data.data.id);
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
