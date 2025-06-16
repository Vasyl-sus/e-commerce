import Immutable from 'immutable';
import {GET_INFLUENCERS, CREATE_NEW_INFLUENCER, SET_INITIAL_VALUES_INFLUENCER, EDIT_INFLUENCER,
DELETE_INFLUENCER, GET_INFLUENCER_DETAILS, SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER, DELETE_FROM_ACCESSORIES_INFLUENCER,
CLEAR_ACC_INFLUENCER, CLEAR_THERAPY_INFLUENCER, DELETE_FROM_THERAPIES_INFLUENCER} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({influencers:[], influencersCount:0, initialValuesInfluencer:null, influencer:{}, payments:[],
initialValuesNewOrderInfluencer: null, country:{}, localAcc: [], deliveryMethod:[]});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_INFLUENCERS:
      var influencers = action.payload.influencers
      nextState.influencers = influencers
			var influencersCount = action.payload.influencersCount
			nextState.influencersCount = influencersCount
      break;

		case GET_INFLUENCER_DETAILS:
			var influencer = action.payload.influencer
			var payments = action.payload.payments
			nextState.influencer = Object.assign(nextState.influencer, influencer);
			nextState.payments = payments
			break;

		case CREATE_NEW_INFLUENCER:
			nextState.influencers.push(action.payload)
			nextState.influencersCount++;
			break;

		case SET_INITIAL_VALUES_INFLUENCER:
			nextState.initialValuesInfluencer = action.payload;
			break;

		case DELETE_INFLUENCER:
			var influencers = nextState.influencers.filter((i) => {
				return i.id != action.payload.id;
			});
			nextState.influencers = influencers;
			break;

		case SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER:
			var data = {};
			var influencer = action.payload;
			data.shipping_first_name = influencer.shipping_first_name;
			data.shipping_last_name = influencer.shipping_last_name;
			data.shipping_email = influencer.shipping_email;
			data.shipping_telephone = influencer.shipping_telephone;
			data.shipping_address = influencer.shipping_address;
			data.shipping_city = influencer.shipping_city;
			data.shipping_postcode = influencer.shipping_postcode;
			data.shipping_country = influencer.shipping_country;
			data.order_type = influencer.order_type;
			data.payment_method_code = influencer.payment_method_code;
			data.delivery_method_code = influencer.delivery_method_code;
			data.utm_source = influencer.utm_source;
			data.utm_medium = influencer.utm_medium;
			data.description = influencer.description;
			data.tracking_code = influencer.tracking_code;
			nextState.initialValuesNewOrderInfluencer = data;

			var countries = localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [];
			var deliverymethods = localStorage.getItem("deliverymethods") && JSON.parse(localStorage.getItem("deliverymethods")) || []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []
			var localTherapies = localStorage.getItem("therapies") && JSON.parse(localStorage.getItem("therapies")) || []
			var localAcc = localStorage.getItem("accessories") && JSON.parse(localStorage.getItem("accessories")) || []

			var country = countries.find(c => {
				return c.name == influencer.shipping_country;
			});

			var deliverymethod = deliverymethods.filter(dm => {
				return dm.country == influencer.shipping_country && dm.is_other == 1;
			});

			var local_therapies = localTherapies.filter(t => {return t.country == influencer.shipping_country})

			var local_acc = localAcc.filter(a => {return a.country == influencer.shipping_country})

			local_acc.map(la => {la.quantity = 1, la.isGift = false});

			local_therapies.map(lt => {lt.quantity = 1});

			var show_therapies = [];
			var t = []

			var t1 = local_therapies.filter(t => {return t.products.length == 1})
			// var t2 = local_acc.filter(t => {return t.products.length > 1})

			for (var i = 0; i < products.length; i++) {
				t = t1.filter(t => {
					return t.products[0].id == products[i].id
				})

				if (t.length > 0)
					show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
			}

			show_therapies.push({name: "DODATKI", therapies: local_acc})

			nextState.country = country
			nextState.deliveryMethod = deliverymethod
			nextState.localTherapies = local_therapies
			nextState.localAcc = local_acc;
			nextState.show_therapies = show_therapies;
			nextState.select_therapies = local_therapies;
			break;

		case CLEAR_THERAPY_INFLUENCER:
			nextState.localTherapies = nextState.localTherapies.filter(t => {return t.id != action.payload});
			var show_therapies = [];
			var t = []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []

			var t1 = nextState.localTherapies.filter(t => {return t.products.length == 1})

			for (var i = 0; i < products.length; i++) {
				t = t1.filter(t => {
					return t.products[0].id == products[i].id
				})

				if (t.length > 0)
					show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
			}

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
			break;

    case CLEAR_ACC_INFLUENCER:
      nextState.localAcc = nextState.localAcc.filter(t => {return t.id != action.payload});
			var show_therapies = [];
			var t = []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []

			var t1 = nextState.localTherapies.filter(t => {return t.products.length == 1})

			for (var i = 0; i < products.length; i++) {
				t = t1.filter(t => {
					return t.products[0].id == products[i].id
				})

				if (t.length > 0)
					show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
			}

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
    break;

		case DELETE_FROM_THERAPIES_INFLUENCER:
			nextState.localTherapies.push(action.payload);
			var show_therapies = [];
			var t = []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []

			var t1 = nextState.localTherapies.filter(t => {return t.products.length == 1})

			for (var i = 0; i < products.length; i++) {
				t = t1.filter(t => {
					return t.products[0].id == products[i].id
				})

				if (t.length > 0)
					show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
			}

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
		break;

		case DELETE_FROM_ACCESSORIES_INFLUENCER:
			nextState.localAcc.push(action.payload);
			var show_therapies = [];
			var t = []
			var products = localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []

			var t1 = nextState.localTherapies.filter(t => {return t.products.length == 1})

			for (var i = 0; i < products.length; i++) {
				t = t1.filter(t => {
					return t.products[0].id == products[i].id
				})

				if (t.length > 0)
					show_therapies.push({name: products[i].name.toUpperCase(), therapies: t})
			}

			show_therapies.push({name: "DODATKI", therapies: nextState.localAcc})
			nextState.show_therapies = show_therapies;
		break;
	}

	return state.merge(nextState);
}
