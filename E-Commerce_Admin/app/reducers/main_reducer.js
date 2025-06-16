import Immutable from 'immutable';
import {LOADING, GET_PRODUCTS, GET_ADMINS, GET_COUNTRIES, GET_THERAPIES, GET_UTMS, GET_GIFTS, GET_BADGES, GET_LOCAL_COUNTRIES, ERROR_LOGIN, GET_LANGUAGES, GET_TOP_IMAGE_BAR,
GET_DISCOUNTS, GET_ORDER_STATUSES, GET_USER_GROUPS, GET_ACCESSORIES, GET_DELIVERY_METHODS, GET_PAYMENT_METHODS, LOGIN, GET_LOCAL_STATUSES, GET_CURRENCIES, SHARE_SOCKET_CONNECTION, GET_FILES, CLOSE_FILES_MODAL } from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({socket: null, user: localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')) || {first_name: '', last_name: '', adminGroup: {permission_names: []}},
loading:false, loading_array:[], countries: localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [], error_login: false,
products: localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || [], admins: localStorage.getItem("admins") && JSON.parse(localStorage.getItem("admins")) || [],
therapies: localStorage.getItem("therapies") && JSON.parse(localStorage.getItem("therapies")) || [], utmmedia: localStorage.getItem("utmmedia") && JSON.parse(localStorage.getItem("utmmedia")) || [],
orderstatuses: localStorage.getItem("orderstatuses") && JSON.parse(localStorage.getItem("orderstatuses")) || [], admingroups: localStorage.getItem("admingroups") && JSON.parse(localStorage.getItem("admingroups")) || [],
deliverymethods: localStorage.getItem("deliverymethods") && JSON.parse(localStorage.getItem("deliverymethods")) || [], paymentmethods: localStorage.getItem("paymentmethods") && JSON.parse(localStorage.getItem("paymentmethods")) || [],
discounts: localStorage.getItem("discounts") && JSON.parse(localStorage.getItem("discounts")) || [], gifts: localStorage.getItem("gifts") && JSON.parse(localStorage.getItem("gifts")) || [],
badges: localStorage.getItem("badges") && JSON.parse(localStorage.getItem("badges")) || [], localStatuses: localStorage.getItem("localStatuses") && JSON.parse(localStorage.getItem("localStatuses")) || [],
localCountries: localStorage.getItem("localCountries") && JSON.parse(localStorage.getItem("localCountries")) || [], currencies: localStorage.getItem("currencies") && JSON.parse(localStorage.getItem("currencies")) || [],
languages: localStorage.getItem("languages") && JSON.parse(localStorage.getItem("languages")) || [], categories: localStorage.getItem("categories") && JSON.parse(localStorage.getItem("categories")) || [], allLanguages: localStorage.getItem("allLanguages") && JSON.parse(localStorage.getItem("allLanguages")) || [], billboards: localStorage.getItem("billboards") && JSON.parse(localStorage.getItem("billboards")) || [],
accessories: localStorage.getItem("accessories") && JSON.parse(localStorage.getItem("accessories")) || [], openFilesModal: false, files: []});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {
		case LOADING:
			/*nextState.loading = true*/
			if (action.payload) {
                nextState.loading_array.push(true)
            } else {
                nextState.loading_array.pop();
            }
            if (nextState.loading_array.length == 0) {
                nextState.loading = false
            } else {
                nextState.loading = true
            }
			break;

		case LOGIN:
			nextState.user = action.payload
			break;

		case ERROR_LOGIN:
			nextState.error_login = true
			break;

		case GET_LOCAL_STATUSES:
			nextState.localStatuses = action.payload;
			//console.log(nextState.localStatuses)
			break;

		case GET_LANGUAGES:
			nextState.languages = action.payload;
			break;

		case GET_LOCAL_COUNTRIES:
			nextState.localCountries = action.payload;
			break;

		case GET_DISCOUNTS:
      var discounts = action.payload.discounts
      var discountsCount = action.payload.discountsCount
      nextState.discounts = discounts
      nextState.discountsCount = discountsCount
      break;

		case GET_CURRENCIES:
			var currencies = action.payload.currencies
			nextState.currencies = currencies
			var currenciesCount = action.payload.currenciesCount
			nextState.currenciesCount = currenciesCount
			break;

		case GET_BADGES:
			var badges = action.payload.badges
			var badgesCount = action.payload.badgesCount
			nextState.badges = badges
			nextState.badgesCount = badgesCount
			break;

		case GET_ACCESSORIES:
			var accessories = action.payload.accessories
			nextState.accessories = accessories
			var accessoriesCount = action.payload.accessoriesCount
			nextState.accessoriesCount = accessoriesCount
			break;

		case GET_GIFTS:
			var gifts = action.payload.gifts
			nextState.gifts = gifts
			var giftsCount = action.payload.giftsCount
			nextState.giftsCount = giftsCount
      break;

		case GET_PRODUCTS:
			var products = action.payload.products
			nextState.products = products
			var productsCount = action.payload.productsCount
			nextState.productsCount = productsCount
			break;

		case GET_PRODUCTS:
			var products = action.payload.products
			nextState.products = products
			var productsCount = action.payload.productsCount
			nextState.productsCount = productsCount
			break;

		case GET_TOP_IMAGE_BAR:
			var billboards = action.payload.billboard
			nextState.billboards = billboards
			var billboardsCount = action.payload.billboardsCount
			nextState.billboardsCount = billboardsCount
			break;

		case GET_DELIVERY_METHODS:
			var deliverymethods = action.payload.deliverymethods
			nextState.deliverymethods = deliverymethods
			var deliverymethodsCount = action.payload.deliverymethodsCount
			nextState.deliverymethodsCount = deliverymethodsCount
			break;

		case GET_PAYMENT_METHODS:
			var paymentmethods = action.payload.paymentmethods
			nextState.paymentmethods = paymentmethods
			var paymentmethodsCount = action.payload.paymentmethodsCount
			nextState.paymentmethodsCount = paymentmethodsCount
			break;

		case GET_ADMINS:
			var admins = action.payload.admins
			nextState.admins = admins
			var adminsCount = action.payload.adminsCount
			nextState.adminsCount = adminsCount
			break;

		case GET_COUNTRIES:
			var countries = action.payload.countries
			nextState.countries = countries
			var countriesCount = action.payload.countriesCount
			nextState.countriesCount = countriesCount
			break;

		case GET_THERAPIES:
			var therapies = action.payload.therapies
			nextState.therapies = therapies
			var therapiesCount = action.payload.therapiesCount
			nextState.therapiesCount = therapiesCount
			break;

		case GET_UTMS:
			var utmmedia = action.payload.utmmediums
			nextState.utmmedia = utmmedia
			var utmmediaCount = action.payload.utmmediaCount
			nextState.utmmediaCount = utmmediaCount
			break;

		case GET_ORDER_STATUSES:
			var orderstatuses = action.payload.orderstatuses
			//orderstatuses = orderstatuses.filter(o => {
			//	return o.hidden === 0
			//})
			nextState.orderstatuses = orderstatuses
			var orderstatusesCount = action.payload.orderstatusesCount
			nextState.orderstatusesCount = orderstatusesCount
			break;

		case GET_USER_GROUPS:
			var admingroups = action.payload.admingroups
			nextState.admingroups = admingroups
			var adminsCount = action.payload.adminsCount
			nextState.adminsCount = adminsCount
			break;
		case SHARE_SOCKET_CONNECTION:
			nextState.socket = action.payload
			break;
		case GET_FILES:
			nextState.files = action.payload
			nextState.openFilesModal = true
		break;
		case CLOSE_FILES_MODAL:
			nextState.openFilesModal = !nextState.openFilesModal
		break;
	}

	return state.merge(nextState);
}
