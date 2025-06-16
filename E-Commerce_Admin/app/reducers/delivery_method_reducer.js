import Immutable from 'immutable';
import {GET_DELIVERY_METHODS, CREATE_NEW_DELIVERY_METHOD, SET_INITIAL_VALUES_DELIVERY_METHOD, EDIT_DELIVERY_METHOD, DELETE_DELIVERY_METHOD} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({deliverymethods:[], deliverymethodsCount:0, initialValuesDeliveryMethod:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_DELIVERY_METHODS:
      var deliverymethods = action.payload.deliverymethods
      nextState.deliverymethods = deliverymethods
			var deliverymethodsCount = action.payload.deliverymethodsCount
			nextState.deliverymethodsCount = deliverymethodsCount
      break;

    case CREATE_NEW_DELIVERY_METHOD:
      nextState.deliverymethods.push(action.payload)
			nextState.deliverymethodsCount++;
      break;

		case SET_INITIAL_VALUES_DELIVERY_METHOD:
			action.payload.therapies = action.payload.therapies.map(t => {return {label: t.name, value: t.id}})
			nextState.initialValuesDeliveryMethod = action.payload;
			break;

		case EDIT_DELIVERY_METHOD:
			var deliverymethods = nextState.deliverymethods;
			var deliveryMethod = deliverymethods.find((dm) => {
				return dm.id == action.payload.id;
			});
			deliveryMethod = Object.assign(deliveryMethod, action.payload.obj);
			nextState.deliverymethods = deliverymethods;
			break;

		case DELETE_DELIVERY_METHOD:
			var deliverymethods = nextState.deliverymethods.filter((dm) => {
				return dm.id != action.payload.id;
			});
			nextState.deliverymethods = deliverymethods;
			break;
	}

	return state.merge(nextState);
}
