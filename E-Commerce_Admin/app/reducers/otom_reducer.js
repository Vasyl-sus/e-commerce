import Immutable from 'immutable';
import {GET_OTO_MAILS, CREATE_OTO_MAIL, SET_INITIAL_VALUES_OTO_MAIL, EDIT_OTO_MAIL, DELETE_OTO_MAIL} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({otoms:[], otomsCount:0, initialValuesOtom:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_OTO_MAILS:
      var otoms = action.payload.otoms
      nextState.otoms = otoms
      var otomsCount = action.payload.otomsCount
      nextState.otomsCount = otomsCount
      break;

		case CREATE_OTO_MAIL:
      nextState.otoms.push(action.payload)
			nextState.otomsCount++;
      break;

		case SET_INITIAL_VALUES_OTO_MAIL:
			var otom_initial_values = action.payload;
			otom_initial_values.therapies = otom_initial_values.therapies.map(t => {return {label: t.name, value: t.id, quantity: t.quantity}});
			delete otom_initial_values.discount;
			nextState.initialValuesOtom = otom_initial_values;
			break;

		case DELETE_OTO_MAIL:
			var otoms = nextState.otoms.filter((om) => {
				return om.id != action.payload.id;
			});
			nextState.otoms = otoms;
			break;
	}

	return state.merge(nextState);
}
