import Immutable from 'immutable';
import moment from 'moment';
import {GET_CUSTOMER_PROFILES, CREATE_NEW_CUSTOMER_PROFILE, EDIT_CUSTOMER_PROFILE, GET_CUSTOMER_DETAILS, DELETE_FROM_ACCESSORIES,
SET_INITIAL_VALUES_CUSTOMER_PROFILE, DELETE_CUSTOMER_PROFILE, SET_INITIAL_VALUES_NEW_ORDER, CHECK_COUNTRY,
SHOW_NEW_ORDER_GIFTS, TOGGLE_COUNTRY, TOGGLE_GIFT, CLEAR_ACC, CLEAR_THERAPY, DELETE_FROM_THERAPIES} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({customers:[], customersCount:0, initialValuesCustomer:{}, initialValuesNewOrder:{}, localAcc: [],
customer:{orders:[]}, user: localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")) || [], deliveryMethod:[], country:{}});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {

		case CHECK_COUNTRY:
			var countries = nextState.countries
			var user_countries = nextState.user.countries

			var country = countries.filter((c) => {
				c.checked = false;
				return c;
			});

			for(var i=0; i<country.length; i++){
				if (user_countries.filter(function(e) { return e.name === country[i].name; }).length > 0)
					country[i].checked = true;
			}

			nextState.countries = country
		break;

		case TOGGLE_COUNTRY:
			var countries = nextState.countries;
			var country = countries.find(c => {return c.id == action.payload.id})
			country.checked = action.payload.flag
		break;

		case GET_CUSTOMER_PROFILES:
			var customers = action.payload.customers
			var customersCount = action.payload.customersCount
			nextState.customers = customers
			nextState.customersCount = customersCount
		break;

		case GET_CUSTOMER_DETAILS:
			var customer = action.payload.customer
			nextState.customer = customer;
		break;

		case CREATE_NEW_CUSTOMER_PROFILE:
			nextState.customers.push(action.payload)
			nextState.customersCount++;
		break;

		case SET_INITIAL_VALUES_NEW_ORDER:
			var data = {};
			var customer = action.payload;
			data.shipping_first_name = customer.shipping_first_name;
			data.shipping_last_name = customer.shipping_last_name;
			data.shipping_email = customer.shipping_email;
			data.shipping_telephone = customer.shipping_telephone;
			data.shipping_address = customer.shipping_address;
			data.shipping_city = customer.shipping_city;
			data.shipping_postcode = customer.shipping_postcode;
			data.shipping_country = customer.shipping_country;

			data.payment_first_name = customer.payment_first_name;
			data.payment_last_name = customer.payment_last_name;
			data.payment_email = customer.payment_email;
			data.payment_telephone = customer.payment_telephone;
			data.payment_address = customer.payment_address;
			data.payment_city = customer.payment_city;
			data.payment_postcode = customer.payment_postcode;
			data.payment_country = customer.payment_country;

			data.order_type = customer.order_type;
			data.payment_method_code = customer.payment_method_code;
			data.delivery_method_code = customer.delivery_method_code;
			data.utm_source = customer.utm_source;
			data.utm_medium = customer.utm_medium;
			nextState.initialValuesNewOrder = data;

			var countries = localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [];
			var deliverymethods = localStorage.getItem("deliverymethods") && JSON.parse(localStorage.getItem("deliverymethods")) || []
			var all_gifts = localStorage.getItem("gifts") && JSON.parse(localStorage.getItem("gifts")) || []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []
			var localTherapies = localStorage.getItem("therapies") && JSON.parse(localStorage.getItem("therapies")) || []
			var localAcc = localStorage.getItem("accessories") && JSON.parse(localStorage.getItem("accessories")) || []
			var categories = JSON.parse(localStorage.getItem("categories")) || [];

      let cc = customer.shipping_country ? customer.shipping_country : customer.payment_country

      let lcc = cc === "SI" ? "SL" : cc
      localAcc.map(l => {
        l.options = l.options.filter(o => {
          return o.lang === lcc
        })
      })

			var country = countries.find(c => {
				return c.name === cc;
			});

			var deliverymethod = deliverymethods.filter(dm => {
				return dm.country == cc;
			});

			var categoriesMap = {};
					categories.forEach(category => {
			    categoriesMap[category.name] = category;
			});

			var local_therapies = localTherapies.filter(t => {return t.country == cc})


			var therapiesByCategory = {};
			localTherapies.forEach(t => {
					var category = categoriesMap[t.category];
			    if (t.country === cc) { // Assuming 'cc' is your country code variable
			        if (!therapiesByCategory[t.category]) {
			            therapiesByCategory[t.category] = {
			            	therapies: [],
			            	sort_order: category.sort_order
			            };
			        }
			        therapiesByCategory[t.category].therapies.push(t);
			    }
			});

			var local_acc = localAcc.filter(a => {return a.country == cc})

			local_acc.map(la => {la.quantity = 1, la.isGift = false});

			local_therapies.map(lt => {lt.quantity = 1});

			var show_therapies = [];
			var t = []
			var t1 = local_therapies.filter(t => {return t.products.length == 1})
			// var t2 = local_acc.filter(t => {return t.products.length > 1})

		//	for (var i = 0; i < products.length; i++) {
		//		t = t1.filter(t => {
		//			return t.products[0].id == products[i].id
		//		})

		//		if (t.length > 0)
		//			show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
		//	}

			var sortedCategoryKeys = Object.keys(therapiesByCategory).sort((a, b) => {
			    return therapiesByCategory[a].sort_order - therapiesByCategory[b].sort_order;
			});

			var show_therapies = sortedCategoryKeys.map(categoryName => {
			    var category = categoriesMap[categoryName];
			    var displayName = category.translations.find(t => t.lang === "SL")?.display_name || category.name;
			    return { name: displayName, therapies: therapiesByCategory[categoryName].therapies };
			});

			show_therapies.push({name: "DODATKI", therapies: local_acc})

			var gifts = all_gifts.filter(g => {return g.country == cc});

			var active_gifts = gifts.filter((g) => {
				g.isChosen = false;
				return g.active == 1;
			});
			nextState.newOrderGifts = active_gifts;
			nextState.newOrderGiftsCount = active_gifts.length;
			nextState.country = country
			nextState.deliveryMethod = deliverymethod
			nextState.localTherapies = local_therapies
      nextState.localAcc = local_acc;
			nextState.show_therapies = show_therapies;
			nextState.select_therapies = local_therapies;
      break;

		case SET_INITIAL_VALUES_CUSTOMER_PROFILE:
			var edit_customer_profile = {};
			edit_customer_profile.address = action.payload.address;
			edit_customer_profile.id = action.payload.id;
			var data = action.payload;
			edit_customer_profile.birthdate = action.payload.birthdate == null ? null : moment(new Date(data.birthdate)).format('DD.MM.YYYY');
			edit_customer_profile.city = action.payload.city;
			edit_customer_profile.comment = action.payload.comment;
			edit_customer_profile.country = action.payload.country;
			edit_customer_profile.email = action.payload.email;
			edit_customer_profile.first_name = action.payload.first_name;
			edit_customer_profile.last_name = action.payload.last_name;
			edit_customer_profile.postcode = action.payload.postcode;
			edit_customer_profile.telephone = action.payload.telephone;
			nextState.initialValuesCustomer = edit_customer_profile;
      break;

    case EDIT_CUSTOMER_PROFILE:
			var customers = nextState.customers;
			var customer = customers.find((c) => {
				return c.id == action.payload.id;
			});
			customer = Object.assign(customer, action.payload.obj);
			nextState.customers = customers;
			break;

		case DELETE_CUSTOMER_PROFILE:
			var customers = nextState.customers.filter((c) => {
				return c.id != action.payload.id;
			});
			nextState.customers = customers;
			break;

		case CLEAR_THERAPY:
			var categories = JSON.parse(localStorage.getItem("categories")) || [];
			var categoriesMap = {};
			categories.forEach(category => {
			    categoriesMap[category.name] = category;
			});
			var therapiesByCategory = {};
			nextState.localTherapies.forEach(t => {
			    var category = categoriesMap[t.category];
			    if (category) {
			        if (!therapiesByCategory[t.category]) {
			            therapiesByCategory[t.category] = {
			                therapies: [],
			                sort_order: category.sort_order
			            };
			        }
			        therapiesByCategory[t.category].therapies.push(t);
			    }
			});
			var sortedCategoryKeys = Object.keys(therapiesByCategory).sort((a, b) => {
			    return therapiesByCategory[a].sort_order - therapiesByCategory[b].sort_order;
			});

			var show_therapies = sortedCategoryKeys.map(categoryName => {
			    var category = categoriesMap[categoryName];
			    var displayName = category.translations.find(t => t.lang === "SL")?.display_name || category.name;
			    return { name: displayName, therapies: therapiesByCategory[categoryName].therapies };
			});

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
			break;

    case CLEAR_ACC:
      nextState.localAcc = nextState.localAcc.filter(t => {return t.id != action.payload});
			var categories = JSON.parse(localStorage.getItem("categories")) || [];
			var categoriesMap = {};
			categories.forEach(category => {
			    categoriesMap[category.name] = category;
			});
			var therapiesByCategory = {};
			nextState.localTherapies.forEach(t => {
			    var category = categoriesMap[t.category];
			    if (category) {
			        if (!therapiesByCategory[t.category]) {
			            therapiesByCategory[t.category] = {
			                therapies: [],
			                sort_order: category.sort_order
			            };
			        }
			        therapiesByCategory[t.category].therapies.push(t);
			    }
			});
			var sortedCategoryKeys = Object.keys(therapiesByCategory).sort((a, b) => {
			    return therapiesByCategory[a].sort_order - therapiesByCategory[b].sort_order;
			});

			var show_therapies = sortedCategoryKeys.map(categoryName => {
			    var category = categoriesMap[categoryName];
			    var displayName = category.translations.find(t => t.lang === "SL")?.display_name || category.name;
			    return { name: displayName, therapies: therapiesByCategory[categoryName].therapies };
			});

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
    break;

		case DELETE_FROM_THERAPIES:
			var categories = JSON.parse(localStorage.getItem("categories")) || [];
			var categoriesMap = {};
			categories.forEach(category => {
			    categoriesMap[category.name] = category;
			});
			var therapiesByCategory = {};
			nextState.localTherapies.forEach(t => {
			    var category = categoriesMap[t.category];
			    if (category) {
			        if (!therapiesByCategory[t.category]) {
			            therapiesByCategory[t.category] = {
			                therapies: [],
			                sort_order: category.sort_order
			            };
			        }
			        therapiesByCategory[t.category].therapies.push(t);
			    }
			});
			var sortedCategoryKeys = Object.keys(therapiesByCategory).sort((a, b) => {
			    return therapiesByCategory[a].sort_order - therapiesByCategory[b].sort_order;
			});

			var show_therapies = sortedCategoryKeys.map(categoryName => {
			    var category = categoriesMap[categoryName];
			    var displayName = category.translations.find(t => t.lang === "SL")?.display_name || category.name;
			    return { name: displayName, therapies: therapiesByCategory[categoryName].therapies };
			});

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
		break;

		case DELETE_FROM_ACCESSORIES:
			nextState.localAcc.push(action.payload);
						var categories = JSON.parse(localStorage.getItem("categories")) || [];
			var categoriesMap = {};
			categories.forEach(category => {
			    categoriesMap[category.name] = category;
			});
			var therapiesByCategory = {};
			nextState.localTherapies.forEach(t => {
			    var category = categoriesMap[t.category];
			    if (category) {
			        if (!therapiesByCategory[t.category]) {
			            therapiesByCategory[t.category] = {
			                therapies: [],
			                sort_order: category.sort_order
			            };
			        }
			        therapiesByCategory[t.category].therapies.push(t);
			    }
			});
			var sortedCategoryKeys = Object.keys(therapiesByCategory).sort((a, b) => {
			    return therapiesByCategory[a].sort_order - therapiesByCategory[b].sort_order;
			});

			var show_therapies = sortedCategoryKeys.map(categoryName => {
			    var category = categoriesMap[categoryName];
			    var displayName = category.translations.find(t => t.lang === "SL")?.display_name || category.name;
			    return { name: displayName, therapies: therapiesByCategory[categoryName].therapies };
			});

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
		break;

		case TOGGLE_GIFT:
			var all_gifts = nextState.newOrderGifts;
			var gift = all_gifts.find(g => {return g.id == action.payload.id})
			gift.isChosen = action.payload.flag
			break;
	}

	return state.merge(nextState);
}
