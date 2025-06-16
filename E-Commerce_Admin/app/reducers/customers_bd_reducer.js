import Immutable from 'immutable';
import {GET_CUSTOMERS_BD, GET_CUSTOMERS_BAZA, GET_PRECOMPUTED_CUSTOMERS_BAZA} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({customers_bd:[], customersCount_bd:0, customers_baza: []});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {

		case GET_CUSTOMERS_BD:
      var customers_bd = action.payload.customers
      var customersCount_bd = action.payload.customersCount
      nextState.customers_bd = customers_bd
      nextState.customersCount_bd = customersCount_bd
      break;
    case GET_CUSTOMERS_BAZA:
      var customers_baza = action.payload.customers
      var customersCount_baza = action.payload.customersCount
      nextState.customers_baza = customers_baza
      nextState.customersCount_baza = customersCount_baza
    break;
    case GET_PRECOMPUTED_CUSTOMERS_BAZA:
      var precomputed_customers_baza = action.payload.customers
      var precomputedCustomersCount_baza = action.payload.customersCount
      nextState.precomputed_customers_baza = precomputed_customers_baza
      nextState.precomputedCustomersCount_baza = precomputedCustomersCount_baza
    break;
	}

	return state.merge(nextState);
}
