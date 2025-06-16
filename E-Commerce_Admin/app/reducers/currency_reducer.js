import Immutable from 'immutable';
import {GET_CURRENCIES, CREATE_NEW_CURRENCY, SET_INITIAL_VALUES_CURRENCY, EDIT_CURRENCY, DELETE_CURRENCY} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({currencies:[], currenciesCount:0, initialValuesCurrency:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_CURRENCIES:
      var currencies = action.payload.currencies
      nextState.currencies = currencies
			var currenciesCount = action.payload.currenciesCount
			nextState.currenciesCount = currenciesCount
      break;

    case CREATE_NEW_CURRENCY:
      nextState.currencies.push(action.payload)
      nextState.currenciesCount++;
      break;

		case SET_INITIAL_VALUES_CURRENCY:
			nextState.initialValuesCurrency = action.payload;
			break;

		case EDIT_CURRENCY:
			var currencies = nextState.currencies;
			var currency = currencies.find((c) => {
				return c.id == action.payload.id;
			});
			currency = Object.assign(currency, action.payload.obj);
			nextState.currencies = currencies;
			break;

		case DELETE_CURRENCY:
			var currencies = nextState.currencies.filter((c) => {
				return c.id != action.payload.id;
			});
			nextState.currencies = currencies;
			break;
	}

	return state.merge(nextState);
}
