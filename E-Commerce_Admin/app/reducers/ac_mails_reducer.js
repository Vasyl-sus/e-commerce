import Immutable from 'immutable';
import {GET_AC_MAIL, CREATE_AC_MAIL, SET_INITIAL_VALUES_AC_MAIL, EDIT_AC_MAIL, DELETE_AC_MAIL} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({acMails:[], acMailsCount:0, initialValuesACMail:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
	 {
			case GET_AC_MAIL:
				var acMails = action.payload.acMails;
				nextState.acMails = acMails;
				nextState.acMailsCount = action.payload.acMailsCount;
		  break;

		  case CREATE_AC_MAIL:
				nextState.acMails.push(action.payload);
				nextState.acMailsCount++;
		  break;

			case SET_INITIAL_VALUES_AC_MAIL:
				nextState.initialValuesACMail = action.payload;
			break;

			case EDIT_AC_MAIL:
				var acMails = nextState.acMails;
				var acMail = acMails.find((acm) => {
					return acm.id == action.payload.id;
				});
				acMail = Object.assign(acMail, action.payload.obj);
				nextState.acMails = acMails;
			break;

      case DELETE_AC_MAIL:
				var acMails = nextState.acMails.filter((acm) => {
					return acm.id != action.payload.id;
				});
				nextState.acMails = acMails;
		  break;

	}

	return state.merge(nextState);
}
