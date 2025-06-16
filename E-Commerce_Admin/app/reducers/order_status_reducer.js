import Immutable from 'immutable';
import {GET_ORDER_STATUSES, CREATE_ORDER_STATUS, SET_INITIAL_VALUES_ORDER_STATUS, EDIT_ORDER_STATUS, DELETE_ORDER_STATUS} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({orderstatuses:[], orderstatusesCount:0, initialValuesOrderStatus:null});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_ORDER_STATUSES:
      var orderstatuses = action.payload.orderstatuses
			nextState.orderstatuses = orderstatuses
			var orderstatusesCount = action.payload.orderstatusesCount
			nextState.orderstatusesCount = orderstatusesCount
      break;

    case CREATE_ORDER_STATUS:
      nextState.orderstatuses.push(action.payload)
			nextState.orderstatusesCount++;
      break;

		case SET_INITIAL_VALUES_ORDER_STATUS:
			action.payload.next_statuses = action.payload.next_statuses.map(n => {return {label: n, value: n}});
			nextState.initialValuesOrderStatus = action.payload;
			break;

		case EDIT_ORDER_STATUS:
			var orderstatuses = nextState.orderstatuses;
			orderstatuses.map(o => {
				if (o.id == action.payload.id) {
					Object.assign(o, action.payload.obj);
				}
			})
			nextState.orderstatuses = orderstatuses;
			break;

		case DELETE_ORDER_STATUS:
			var orderstatuses = nextState.orderstatuses.filter((os) => {
				return os.id != action.payload.id;
			});
			nextState.orderstatuses = orderstatuses;
			break;
	}

	return state.merge(nextState);
}
