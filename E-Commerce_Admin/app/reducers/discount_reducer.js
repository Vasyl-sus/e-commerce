import Immutable from 'immutable';
import {GET_DISCOUNTS, CREATE_NEW_DISCOUNT, EDIT_DISCOUNT, GET_DISCOUNTSS, SET_INITIAL_VALUES_DISCOUNT, GET_DISCOUNT_DETAILS} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({discounts:[], discountsCount:0, initialValuesDiscount:{}, discount:{},
therapies: localStorage.getItem("therapies") && JSON.parse(localStorage.getItem("therapies")) || [], total_discount_orders:0, discountss:[],  discountssCount: []});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {
		case GET_DISCOUNTS:
      var discounts = action.payload.discounts
      var discountsCount = action.payload.discountsCount
      nextState.discounts = discounts
      nextState.discountsCount = discountsCount
      break;
    case GET_DISCOUNTSS:
      var discountss = action.payload.discounts
      var discountssCount = action.payload.discountsCount
      nextState.discountss = discountss
      nextState.discountssCount = discountssCount
    break;

		case GET_DISCOUNT_DETAILS:
			var discount = action.payload.discount
			var total_orders = discount.orders.map(o => {return o.total});
			var sum = 0;
			if(total_orders.length > 0) {
				for(var i=0; i<total_orders.length; i++) {
					sum = sum + total_orders[i];
				}
			}
			nextState.total_discount_orders = sum;
			nextState.discount = discount;
	  break;

		case CREATE_NEW_DISCOUNT:
      nextState.discounts.push(action.payload)
      nextState.discountsCount++;
      break;

		case SET_INITIAL_VALUES_DISCOUNT:
			var edit_discount = {};
			edit_discount.active = action.payload.active;
			edit_discount.date_start = action.payload.date_start;
			edit_discount.date_end = action.payload.date_end;
			edit_discount.name = action.payload.name;
			edit_discount.dodatni_naziv = action.payload.dodatni_naziv;
			edit_discount.id = action.payload.id;
			edit_discount.type = action.payload.type;
			edit_discount.utm_medium = action.payload.utm_medium;
			edit_discount.utm_source = action.payload.utm_source;
			edit_discount.discount_type = action.payload.discount_type;
			edit_discount.discount_value = action.payload.discount_value;
			edit_discount.min_order_amount = action.payload.min_order_amount;
			var therapies = [];
			var countries = [];
			var ttt = [];
			for (var i = 0; i < action.payload.therapies.length; i++) {
				therapies.push({value: action.payload.therapies[i].id, label: action.payload.therapies[i].name})
			}
			for (var i = 0; i < action.payload.countries.length; i++) {
				countries.push({value: action.payload.countries[i], label: action.payload.countries[i]})
			}
			edit_discount.therapies = therapies;
			edit_discount.countries = countries;
			nextState.initialValuesDiscount = edit_discount
			break;

		case EDIT_DISCOUNT:
			var discounts = nextState.discounts;
			var discount = discounts.find((d) => {
				return d.id == action.payload.id;
			}) || {}
			discount = Object.assign(discount, action.payload.obj);
			nextState.discounts = discounts;
			break;
	}

	return state.merge(nextState);
}
