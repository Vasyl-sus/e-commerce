import Immutable from 'immutable';
import {GET_TOP_IMAGE_BAR, CREATE_TOP_IMAGE_BAR, SET_INITIAL_VALUES_TOP_IMAGE_BAR, EDIT_TOP_IMAGE_BAR, DELETE_TOP_IMAGE_BAR} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({billboards:[], billboardsCount:0, initialValuesBillboard:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_TOP_IMAGE_BAR:
			var billboards = action.payload.billboards
			nextState.billboards = billboards
			var billboardsCount = billboards.length
			nextState.billboardsCount = billboardsCount
      break;

    case CREATE_TOP_IMAGE_BAR:
			nextState.billboards.push(action.payload)
			nextState.billboardsCount++;
      break;

		case SET_INITIAL_VALUES_TOP_IMAGE_BAR:
			nextState.initialValuesBillboard = action.payload;
			break;

		case EDIT_TOP_IMAGE_BAR:
			break;

		case DELETE_TOP_IMAGE_BAR:
			var billboards = nextState.billboards.filter((b) => {
				return b.id != action.payload.id;
			});
			nextState.billboards = billboards;
			break;
	}

	return state.merge(nextState);
}
