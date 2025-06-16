import Immutable from 'immutable';
import { uniqBy } from 'lodash'
import {GET_ORDERS_DASHBOARD, CHECK_ORDER, CHECK_ALL_ORDERS, CLEAR_SELECTED_ORDERS,
CHANGE_SELECTED_ORDERS, SHOW_COLORS, CHECK_COUNTRY_DASHBOARD,
TOGGLE_COUNTRY_DASHBOARD, NEW_ORDER} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({orders:[], selected_orders: [], ordersCount:0,
countries: localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [],
user: localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")) || []});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {
		case GET_ORDERS_DASHBOARD:
      var orders = action.payload.orders

			orders.map(o => {
				o.checked = false;
			});

			nextState.orders = orders
			var ordersCount = action.payload.ordersCount
			nextState.ordersCount = ordersCount
      break;

		case CHECK_COUNTRY_DASHBOARD:
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

		case TOGGLE_COUNTRY_DASHBOARD:
			var countries = nextState.countries;
			var country = countries.find(c => {return c.id == action.payload.id})
			country.checked = action.payload.flag
			break;

		case CHECK_ORDER:
			var orders = nextState.orders
			var order = orders.find(o => {
				return o.id == action.payload.id;
			})
			order.checked = !order.checked;

			if (order.checked) {
				nextState.selected_orders.push(action.payload)
			}
			else {
				nextState.selected_orders = nextState.selected_orders.filter(o => {
					return o.id != action.payload.id
				})
			}
			nextState.orders = orders;
			break;

		case CHECK_ALL_ORDERS:
			var orders = nextState.orders;
			var flag = action.payload;

			if (flag) {
				orders.forEach(o => {
					o.checked = true;
					nextState.selected_orders.push(o)
				})
			}
			else {
				nextState.selected_orders = []
				orders.map(o => {
          o.checked = false
        })
			}

			nextState.selected_orders = uniqBy(nextState.selected_orders, 'id')

			//nextState.orders = orders;
			break;

		case CLEAR_SELECTED_ORDERS:
			nextState.selected_orders = [];
			break;

		case SHOW_COLORS:
			var order = nextState.orders.find(o => {
				return o.id == action.payload
			})
			order.openColorPicker = !order.openColorPicker;
		break;
		case NEW_ORDER:
			nextState.orders.unshift(action.payload);
			nextState.ordersCount++;
		break;

		case CHANGE_SELECTED_ORDERS:
			var s_orders = [];
			console.log(action.payload)

			for (var i = 0; i < action.payload.length; i ++)
			{
				var o = nextState.selected_orders.find((s) => {
					return s.order_id == action.payload[i].value
				})

				if (o) {
					s_orders.push(o)
				}
			}

			nextState.selected_orders = s_orders;
			break;
	}

	return state.merge(nextState);
}
