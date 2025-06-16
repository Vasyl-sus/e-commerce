import Immutable from 'immutable';
import {GET_ADMINS, CREATE_ADMIN, SET_INITIAL_VALUES_ADMIN, EDIT_ADMIN, DELETE_ADMIN} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({admins:[], adminsCount:0, initialValuesAdmin:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_ADMINS:
      var admins = action.payload.admins
      nextState.admins = admins
			var adminsCount = action.payload.adminsCount
			nextState.adminsCount = adminsCount
      break;

    case CREATE_ADMIN:
      nextState.admins.push(action.payload)
			nextState.adminsCount++;
      break;

		case SET_INITIAL_VALUES_ADMIN:
			var edit_admin = {};
			edit_admin.first_name = action.payload.first_name;
			edit_admin.last_name = action.payload.last_name;
			edit_admin.email = action.payload.email;
			edit_admin.id = action.payload.id;
			edit_admin.username = action.payload.username;
			edit_admin.password = action.payload.password;
			edit_admin.vcc_username = action.payload.vcc_username;
			edit_admin.countries = action.payload.countries.map(c => {return {label: c, value: c}});
			edit_admin.call_countries = action.payload.call_countries.map(c => {return {label: c, value: c}});
			edit_admin.userGroupId = action.payload.userGroupId;
			nextState.initialValuesAdmin = edit_admin;
			console.log(nextState.initialValuesAdmin);
			break;

		case EDIT_ADMIN:
			var admins = nextState.admins;
			var admin = admins.find((a) => {
				return a.id == action.payload.id;
			});
			admin = Object.assign(admin, action.payload.obj);
			nextState.admins = admins;
			break;

		case DELETE_ADMIN:
			var admins = nextState.admins.filter((a) => {
				return a.id != action.payload.id;
			});
			nextState.admins = admins;
			break;
	}

	return state.merge(nextState);
}
