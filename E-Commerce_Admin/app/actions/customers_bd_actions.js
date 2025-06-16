import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_CUSTOMERS_BD, LOADING, GET_CUSTOMERS_BAZA, GET_PRECOMPUTED_CUSTOMERS_BAZA} from '../config/constants'
import {errorNotification} from '../App.js'

export function getCustomersBD() {
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

  if(location.query.inputDate){
    query+=`&inputDate=${location.query.inputDate}`;
  }

  return function (dispatch) {
  	dispatch({type:LOADING, payload:true})
		axios.get(`${ROOT_URL}/admin/customer/bd${query}`)
		.then((response) => {
			dispatch({type: GET_CUSTOMERS_BD, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getCustomersOTO() {
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
    axios.get(`${ROOT_URL}/admin/customer/oto${query}`)
    .then((response) => {
      dispatch({type: GET_CUSTOMERS_BD, payload: response.data})
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function getCustomersBaza(criteria) {
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

  var url = "";

  switch(criteria) {
    case '1':
      url = '/admin/customer/baza1';
      break;

    case '2':
      url = '/admin/customer/baza2';
      break;

    case '3':
      url = '/admin/customer/baza3';
      break;

    case '4':
      url = '/admin/customer/baza4';
      break;

    default:
      url = '/admin/customer/baza1';
      break;
  }

  return function (dispatch) {
    dispatch({type:LOADING, payload:true})
    axios.get(`${ROOT_URL}${url}${query}`)
    .then((response) => {
      dispatch({type: GET_CUSTOMERS_BAZA, payload: response.data})
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function getPrecomputedBazaCustomers(criteria) {

  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if (location.query.pageNumber) {
    query += `pageNumber=${location.query.pageNumber}`;
  } else {
    query += `pageNumber=1`;
  }

  if (location.query.pageLimit) {
    query += `&pageLimit=${location.query.pageLimit}`;
  } else {
    query += `&pageLimit=15`;
  }

  if (location.query.countries) {
    var country = location.query.countries;
    if (typeof country != 'string') {
      for (var i = 0; i < country.length; i++) {
        query += `&countries[]=` + country[i];
      }
    } else {
      query += `&countries[]=` + country;
    }
  }

  if (location.query.search) {
    query += `&search=${location.query.search}`;
  }

  var url = "";
  switch (criteria) {
    case '1':
      url = '/admin/customer/bazap1';
      break;
    case '2':
      url = '/admin/customer/bazap2';
      break;
    case '3':
      url = '/admin/customer/bazap3';
      break;
    case '4':
      url = '/admin/customer/bazap4';
      break;
    default:
      url = '/admin/customer/bazap1';
      break;
  }


  return function (dispatch) {
    dispatch({ type: LOADING, payload: true });
    axios.get(`${ROOT_URL}${url}${query}`)
      .then((response) => {
        dispatch({ type: GET_PRECOMPUTED_CUSTOMERS_BAZA, payload: response.data });
        dispatch({ type: LOADING, payload: false });
      })
      .catch((response) => {
        dispatch({ type: LOADING, payload: false });
        console.log(2262, response);
        errorNotification(response.response.data.message);
      });
  }
}
