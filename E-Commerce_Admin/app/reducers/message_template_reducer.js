import Immutable from 'immutable';
import {GET_MESSAGE_TEMPLATES, CREATE_NEW_MESSAGE_TEMPLATE, SET_INITIAL_VALUES_MESSAGE_TEMPLATE, EDIT_MESSAGE_TEMPLATE, DELETE_MESSAGE_TEMPLATE} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({smstemplates:[], smstemplatesCount:0, initialValuesMessageTemplate:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_MESSAGE_TEMPLATES:
      var smstemplates = action.payload.smstemplates
      nextState.smstemplates = smstemplates
			var smstemplatesCount = action.payload.smstemplatesCount
			nextState.smstemplatesCount = smstemplatesCount
      break;

    case CREATE_NEW_MESSAGE_TEMPLATE:
      nextState.smstemplates.push(action.payload)
      nextState.smstemplatesCount++;
      break;

		case SET_INITIAL_VALUES_MESSAGE_TEMPLATE:
			nextState.initialValuesMessageTemplate = action.payload;
			break;

		case EDIT_MESSAGE_TEMPLATE:
			var smstemplates = nextState.smstemplates;
			var smstemplate = smstemplates.find((st) => {
				return st.id == action.payload.id;
			});
			smstemplate = Object.assign(smstemplate, action.payload.obj);
			nextState.smstemplates = smstemplates;
			break;

		case DELETE_MESSAGE_TEMPLATE:
			var smstemplates = nextState.smstemplates.filter((st) => {
				return st.id != action.payload.id;
			});
			nextState.smstemplates = smstemplates;
			break;
	}

	return state.merge(nextState);
}
