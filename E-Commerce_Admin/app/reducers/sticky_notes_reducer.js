import Immutable from 'immutable';
import {GET_STICKY_NOTES, ADD_STICKY_NOTE, SET_INITIAL_VALUES_STICKY_NOTE,
EDIT_STICKY_NOTE, DELETE_STICKY_NOTE} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({stickynotes:[], stickynotesCount:0, initialValuesStickyNotes:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_STICKY_NOTES:
      var stickynotes = action.payload.stickynotes
      nextState.stickynotes = stickynotes
			var stickynotesCount = action.payload.stickynotesCount
			nextState.stickynotesCount = stickynotesCount
      break;

    case ADD_STICKY_NOTE:
      nextState.stickynotes.push(action.payload)
      nextState.stickynotesCount++;
      break;

		case SET_INITIAL_VALUES_STICKY_NOTE:
			nextState.initialValuesStickyNotes = action.payload;
			break;

		case EDIT_STICKY_NOTE:
			var stickynotes = nextState.stickynotes;
			var stickynote = stickynotes.find((sn) => {
				return sn.id == action.payload.id;
			});
			stickynote = Object.assign(stickynote, action.payload.obj);
			nextState.stickynotes = stickynotes;
			break;

		case DELETE_STICKY_NOTE:
			var stickynotes = nextState.stickynotes.filter((sn) => {
				return sn.id != action.payload.id;
			});
			nextState.stickynotes = stickynotes;
			break;
	}

	return state.merge(nextState);
}
