import axios from 'axios'
import {browserHistory} from 'react-router'
import { store } from '../main.js'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, API_URL, LOADING, GET_PRODUCTS, GET_ADMINS, GET_COUNTRIES, GET_UTMS, GET_BADGES, GET_LOCAL_STATUSES, ERROR_LOGIN, GET_LANGUAGES, GET_TOP_IMAGE_BAR,
GET_DISCOUNTS, GET_CURRENCIES, GET_ACCESSORIES, GET_ORDER_STATUSES, GET_USER_GROUPS, GET_PAYMENT_METHODS, GET_DELIVERY_METHODS, GET_GIFTS, LOGIN, GET_LOCAL_COUNTRIES, SHARE_SOCKET_CONNECTION, GET_PRODUCT_CATEGORIES, GET_FILES, CLOSE_FILES_MODAL, GET_THERAPIES1, GET_LOCAL_STORAGE_VERSION } from '../config/constants'

axios.interceptors.response.use(undefined, error => {
  if (error) {
  var pError = JSON.parse(JSON.stringify(error))
    if (pError.response && pError.response.status === 401 && pError.response.data.error == "token_required") {
	     store.dispatch(logout_user())
    }
  }
  return Promise.reject(pError);
});

export function login_user(user) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/auth/login`, {username: user.username, password: user.password})
		.then((response) => {
			dispatch({type:LOGIN, payload:response.data.data})
			localStorage.setItem("user", JSON.stringify(response.data.data));
			localStorage.setItem("token", JSON.stringify(response.data.data.token));
      dispatch(get_order_statuses());
			dispatch(get_countries_login(response.data.data.countries));
      dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      dispatch({type:ERROR_LOGIN, payload:true})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function closeModal() {
	return function (dispatch) {
		dispatch({type: CLOSE_FILES_MODAL, payload:false})
	}
}

export function addImages(data)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
    	const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		  axios.post(`${ROOT_URL}/admin/upload`, data, config)
		  .then((response) => {
        if(response.data.success) {
          createNotification('success','Uspešno ste dodali nove slike!');
          var files = response.data.uploaded_files;
          dispatch({type:GET_FILES, payload:files})
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

export function get_countries_login(data)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/country`)
		  .then((response) => {
			var countries = response.data.countries;
			var filteredCountries = [];
			var names = [];
			for (var i = 0; i < data.length; i++) {
				var country = countries.find(c => {
					return c.name == data[i].name
				})
				if (country) {
					filteredCountries.push(country)
          names.push(country.name)
				}
			}
			localStorage.setItem('countries', JSON.stringify(filteredCountries));
			localStorage.setItem('localCountries', JSON.stringify(names));
			dispatch({type: GET_LOCAL_COUNTRIES, payload: names})
			dispatch({type: GET_COUNTRIES, payload: {countries: filteredCountries, countriesCount: filteredCountries.length}})
      axios.get(`${ROOT_URL}/admin/orderstatus`)
        .then((response1) => {
          var statuses = [];
          for(var i=0; i<response1.data.orderstatuses.length; i++) {
            statuses.push(response1.data.orderstatuses[i])
          }
          localStorage.setItem('localStatuses', JSON.stringify(statuses))
          dispatch({type: GET_LOCAL_STATUSES, payload: statuses})
          dispatch({type:LOADING, payload:false})
          browserHistory.push("/dashboard");
      })
      .catch((response1) => {
        dispatch({type:LOADING, payload:false})
        console.log(2262, response1)
  			errorNotification(response1.response.data.message);
      })
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function logout_user(token, socket, id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${ROOT_URL}/auth/logout`)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			localStorage.setItem("user", null);
			if(token && socket){
				socket.emit('clientLogout', { client_token: token, id: id})
			}
			browserHistory.push("/login");
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function addLanding(obj)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/landings`, obj)
		  .then((response) => {
        if(response.data.success) {
          createNotification('success','Uspešno ste dodali nov landing!');
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

export function get_products()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/product?pageLimit=50`)
		  .then((response) => {
        localStorage.setItem('products', JSON.stringify(response.data.products));
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

export function get_accessories()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/accessory`)
		  .then((response) => {
        localStorage.setItem('accessories', JSON.stringify(response.data.accessories));
			  dispatch({type: GET_ACCESSORIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_billboards()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/billboard`)
		  .then((response) => {
        localStorage.setItem('billboards', JSON.stringify(response.data.billboard));
			  dispatch({type: GET_TOP_IMAGE_BAR, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_currencies()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/currency`)
		  .then((response) => {
        localStorage.setItem('currencies', JSON.stringify(response.data.currencies));
			  dispatch({type: GET_CURRENCIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_badges()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/badge`)
		  .then((response) => {
        localStorage.setItem('badges', JSON.stringify(response.data.badges));
			  dispatch({type: GET_BADGES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_gifts()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/gift?active=1`)
		  .then((response) => {
        localStorage.setItem('gifts', JSON.stringify(response.data.gifts));
			  dispatch({type: GET_GIFTS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_discounts()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/discount?active=1`)
		  .then((response) => {
        localStorage.setItem('discounts', JSON.stringify(response.data.discounts));
			  dispatch({type: GET_DISCOUNTS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_categories()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/category?active=1`)
		  .then((response) => {
        localStorage.setItem('categories', JSON.stringify(response.data.categories));
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

export function get_languages() {
	return function (dispatch) {
		dispatch({ type: LOADING, payload: true })
		axios.get(`${API_URL}/lang/config/all`)
			.then((response) => {
				localStorage.setItem('allLanguages', JSON.stringify(response.data.langConfig));
				localStorage.setItem('languages', JSON.stringify(response.data.langConfig));
				dispatch({ type: GET_LANGUAGES, payload: response.data.langConfig })
				dispatch({ type: LOADING, payload: false })
			})
			.catch((response) => {
				dispatch({
				  type: _config_constants__WEBPACK_IMPORTED_MODULE_4__["LOADING"],
				  payload: false
				});
				console.log(2262, response);
				if (response && response.response && response.response.data) {
				  Object(_App_js__WEBPACK_IMPORTED_MODULE_3__["errorNotification"])(response.response.data.message);
				} else {
				  console.log('Unexpected error:', response);
				}
			  });
	}
}

export function get_delivery_methods()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/deliverymethod`)
		  .then((response) => {
        localStorage.setItem('deliverymethods', JSON.stringify(response.data.deliverymethods));
			  dispatch({type: GET_DELIVERY_METHODS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_payment_methods()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/paymentmethod`)
		  .then((response) => {
        localStorage.setItem('paymentmethods', JSON.stringify(response.data.paymentmethods));
			  dispatch({type: GET_PAYMENT_METHODS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_admins()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/admin`)
		  .then((response) => {
        localStorage.setItem('admins', JSON.stringify(response.data.admins));
			  dispatch({type: GET_ADMINS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_countries()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/country`)
		  .then((response) => {
        localStorage.setItem('countries', JSON.stringify(response.data.countries));
			  dispatch({type: GET_COUNTRIES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_therapies()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/therapy`)
		  .then((response) => {
        localStorage.setItem('therapies', JSON.stringify(response.data.therapies));
			  dispatch({type: GET_THERAPIES1, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_UTMS()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/utmmedium`)
		  .then((response) => {
        localStorage.setItem('utmmedia', JSON.stringify(response.data.utmmedia));
			  dispatch({type: GET_UTMS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_order_statuses()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/orderstatus`)
		  .then((response) => {
        localStorage.setItem('orderstatuses', JSON.stringify(response.data.orderstatuses))
        dispatch({type: GET_ORDER_STATUSES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function get_user_groups()
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/admingroup`)
		  .then((response) => {
        localStorage.setItem('admingroups', JSON.stringify(response.data.admingroups));
			  dispatch({type: GET_USER_GROUPS, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setLocalCountries(ids) {
	return function(dispatch) {
		dispatch({type: GET_LOCAL_COUNTRIES, payload: ids})
	}
}

export function setLocalStatuses(statuses) {
	return function(dispatch) {
    localStorage.setItem('localStatuses', JSON.stringify(statuses))
		dispatch({type: GET_LOCAL_STATUSES, payload: statuses})
	}
}

export function shareSocketConnection (socket) {
	return function(dispatch) {
		dispatch({type: SHARE_SOCKET_CONNECTION, payload: socket})
	}
}

export function getInitData () {

  return function (dispatch) {
    dispatch({type:LOADING, payload:true})


	var lsVersionCurrent = JSON.parse(localStorage.getItem('lastinitchange'))

    axios.get(`${ROOT_URL}/admin/admin/init`, {params: {lsVersion: lsVersionCurrent ? lsVersionCurrent.version_counter : null}})
		  .then((response) => {

			if(response.data.results) {

				localStorage.setItem('utmmedia', JSON.stringify(response.data.results.utmmediums));
					dispatch({type: GET_UTMS, payload: response.data.results})
				localStorage.setItem('products', JSON.stringify(response.data.results.products));
					dispatch({type: GET_PRODUCTS, payload: response.data.results})
				localStorage.setItem('admins', JSON.stringify(response.data.results.admins));
					dispatch({type: GET_ADMINS, payload: response.data.results})
				localStorage.setItem('countries', JSON.stringify(response.data.results.countries));
					dispatch({type: GET_COUNTRIES, payload: response.data.results})
				localStorage.setItem('therapies', JSON.stringify(response.data.results.therapies));
					dispatch({type: GET_THERAPIES1, payload: response.data.results})
				localStorage.setItem('orderstatuses', JSON.stringify(response.data.results.orderstatuses))
				dispatch({type: GET_ORDER_STATUSES, payload: response.data.results})
				localStorage.setItem('admingroups', JSON.stringify(response.data.results.admingroups));
					dispatch({type: GET_USER_GROUPS, payload: response.data.results})
				localStorage.setItem('deliverymethods', JSON.stringify(response.data.results.deliverymethods));
					dispatch({type: GET_DELIVERY_METHODS, payload: response.data.results})
				localStorage.setItem('paymentmethods', JSON.stringify(response.data.results.paymentmethods));
					dispatch({type: GET_PAYMENT_METHODS, payload: response.data.results})
				localStorage.setItem('discounts', JSON.stringify(response.data.results.discounts));
					dispatch({type: GET_DISCOUNTS, payload: response.data.results})
				localStorage.setItem('gifts', JSON.stringify(response.data.results.gifts));
					dispatch({type: GET_GIFTS, payload: response.data.results})
				localStorage.setItem('badges', JSON.stringify(response.data.results.badges));
					dispatch({type: GET_BADGES, payload: response.data.results})
				localStorage.setItem('currencies', JSON.stringify(response.data.results.currencies));
					dispatch({type: GET_CURRENCIES, payload: response.data.results})
				localStorage.setItem('billboards', JSON.stringify(response.data.results.billboards));
					dispatch({type: GET_TOP_IMAGE_BAR, payload: response.data.results})
				localStorage.setItem('accessories', JSON.stringify(response.data.results.accessories));
					dispatch({type: GET_ACCESSORIES, payload: response.data.results})
				localStorage.setItem('categories', JSON.stringify(response.data.results.categories));
					dispatch({type: GET_PRODUCT_CATEGORIES, payload: response.data.results})
				localStorage.setItem('lastinitchange', JSON.stringify(response.data.results.lastinitchange));
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
