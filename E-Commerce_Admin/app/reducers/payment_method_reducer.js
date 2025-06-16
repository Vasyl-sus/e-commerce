import Immutable from 'immutable';
import {GET_PAYMENT_METHODS, CREATE_NEW_PAYMENT_METHOD, SET_INITIAL_VALUES_PAYMENT_METHOD, EDIT_PAYMENT_METHOD,
UPDATE_PAYMENT_METHOD_PICTURE, DELETE_PAYMENT_METHOD} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({paymentmethods:[], paymentmethodsCount:0, initialValuesPaymentMethod:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_PAYMENT_METHODS:
      var paymentmethods = action.payload.paymentmethods
      nextState.paymentmethods = paymentmethods
			var paymentmethodsCount = action.payload.paymentmethodsCount
			nextState.paymentmethodsCount = paymentmethodsCount
      break;

    case CREATE_NEW_PAYMENT_METHOD:
      nextState.paymentmethods.push(action.payload)
			nextState.paymentmethodsCount++;
      break;

		case SET_INITIAL_VALUES_PAYMENT_METHOD:
			var c = [];
			var countries = localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [];
			for(var i=0; i<countries.length; i++) {
				for(var j=0; j<action.payload.countries.length; j++) {
					if(countries[i].name == action.payload.countries[j]) {
						c.push({label: countries[i].name, value: countries[i].id})
					}
				}
			}
			action.payload.countries = c;
			nextState.initialValuesPaymentMethod = action.payload;
			//console.log(nextState.initialValuesPaymentMethod);
			break;

		case EDIT_PAYMENT_METHOD:
			var paymentmethods = nextState.paymentmethods;
			var paymentMethod = paymentmethods.find((pm) => {
				return pm.id == action.payload.id;
			});
			paymentMethod = Object.assign(paymentMethod, action.payload.obj);
			nextState.paymentmethods = paymentmethods;
			break;

		case DELETE_PAYMENT_METHOD:
			var paymentmethods = nextState.paymentmethods.filter((pm) => {
				return pm.id != action.payload.id;
			});
			nextState.paymentmethods = paymentmethods;
			break;
	}

	return state.merge(nextState);
}
