import Immutable from 'immutable';
import {GET_COLOR_DASHBOARD, GET_COLORS, CREATE_COLOR, DELETE_COLOR} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({colors:[], colorsCount:0});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_COLOR_DASHBOARD:
      var colors = action.payload.colors
      nextState.colors = colors
			var colorsCount = action.payload.colorsCount
			nextState.colorsCount = colorsCount
      break;

		case GET_COLORS:
			var colors = action.payload.colors
			nextState.colors = colors
			var colorsCount = action.payload.colorsCount
			nextState.colorsCount = colorsCount
			break;

    case CREATE_COLOR:
      nextState.colors.push(action.payload)
			nextState.colorsCount++;
      break;

		case DELETE_COLOR:
			var colors = nextState.colors.filter((c) => {
				return c.id != action.payload.id;
			});
			nextState.colors = colors;
			//console.log(nextState.colors)
			break;
	}

	return state.merge(nextState);
}
