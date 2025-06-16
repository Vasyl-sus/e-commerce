import Immutable from 'immutable';
import {GET_UTMS, CREATE_NEW_UTM, SET_INITIAL_VALUES_UTM, EDIT_UTM, DELETE_UTM} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({utmmedia:[], utmmediaCount:0, initialValuesUTM:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_UTMS:
      var utmmedia = action.payload.utmmedia || action.payload.utmmediums
      nextState.utmmedia = utmmedia
			var utmmediaCount = action.payload.utmmediaCount
			nextState.utmmediaCount = utmmediaCount
      break;

    case CREATE_NEW_UTM:
      nextState.utmmedia.push(action.payload)
      nextState.utmmediaCount++;
      break;

		case SET_INITIAL_VALUES_UTM:
			nextState.initialValuesUTM = action.payload;
			break;

		case EDIT_UTM:
			var utmmedia = nextState.utmmedia;
			var utm = utmmedia.find((u) => {
				return u.id == action.payload.id;
			});
			utm = Object.assign(utm, action.payload.obj);
			nextState.utmmedia = utmmedia;
			break;

		case DELETE_UTM:
			var utmmedia = nextState.utmmedia.filter((u) => {
				return u.id != action.payload.id;
			});
			nextState.utmmedia = utmmedia;
			break;
	}

	return state.merge(nextState);
}
