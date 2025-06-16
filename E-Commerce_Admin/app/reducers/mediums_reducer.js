import Immutable from 'immutable';
import {GET_MEDIUMS, NEW_MEDIUM, SET_INITIAL_VALUES_MEDIUM} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({mediums:[], mediumsCount:0, initialValuesMedium: {}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_MEDIUMS:
			let mediums = action.payload.mediums;
			nextState.mediums = mediums;
			let mediumsCount = action.payload.mediumsCount;
			nextState.mediumsCount = mediumsCount;
      break;

		case NEW_MEDIUM:
			nextState.mediums.push(action.payload);
			nextState.mediumsCount++;
    break;

		case SET_INITIAL_VALUES_MEDIUM:
			nextState.initialValuesMedium = action.payload;
			break;
	}

	return state.merge(nextState);
}
