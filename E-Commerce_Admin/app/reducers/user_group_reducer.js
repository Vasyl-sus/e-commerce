import Immutable from 'immutable';
import {GET_USER_GROUPS, CREATE_NEW_USER_GROUP, SET_INITIAL_VALUES_USER_GROUP, EDIT_USER_GROUP, DELETE_USER_GROUP} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({admingroups:[], admingroupsCount:0, initialValuesUserGroup:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_USER_GROUPS:
      var admingroups = action.payload.admingroups
      nextState.admingroups = admingroups
			var admingroupsCount = action.payload.admingroupsCount
			nextState.admingroupsCount = admingroupsCount
      break;

    case CREATE_NEW_USER_GROUP:
      nextState.admingroups.push(action.payload)
			nextState.admingroupsCount++;
      break;

		case SET_INITIAL_VALUES_USER_GROUP:
			nextState.initialValuesUserGroup = action.payload;
			break;

		case EDIT_USER_GROUP:
			var admingroups = nextState.admingroups;
			var admingroup = admingroups.find((ag) => {
				return ag.id == action.payload.id;
			});
			admingroup = Object.assign(admingroup, action.payload.obj);
			nextState.admingroups = admingroups;
			break;

		case DELETE_USER_GROUP:
			var admingroups = nextState.admingroups.filter((ag) => {
				return ag.id != action.payload.id;
			});
			nextState.admingroups = admingroups;
			break;
	}

	return state.merge(nextState);
}
