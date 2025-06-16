import Immutable from 'immutable';
import { GET_INFOBIT_CUSTOMERS, CHECK_CUSTOMER, CHECK_ALL_CUSTOMERS, GET_INFOBIT_SCENARIOS, GET_INFOBIT_MESSAGES, GET_INFOBIT_REPORT} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({customers:[], customersCount:0, scenarios: [], reports:[], messages: [], messagesCount: 0});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type) {
		case GET_INFOBIT_CUSTOMERS:
      let customers = action.payload.data.customers
      nextState.customers = customers
			let customersCount = action.payload.data.customersCount
			nextState.customersCount = customersCount
    break;
    case CHECK_CUSTOMER:
      let customers1 = nextState.customers;
      let found = customers1.find(c => {
        return c.id === action.payload
      })
      if (found)
        found.checked = !found.checked

      nextState.customers = customers1
    break;
    case CHECK_ALL_CUSTOMERS:
      nextState.customers.map(c => {
        c.checked = action.payload
      })
    break;
    case GET_INFOBIT_SCENARIOS:
      nextState.scenarios = action.payload.data;
    break;
		case GET_INFOBIT_REPORT:
			nextState.reports = action.payload.data;
		break;
    case GET_INFOBIT_MESSAGES:
      let messages = action.payload.data.messages
      nextState.messages = messages
			let messagesCount = action.payload.data.messagesCount
			nextState.messagesCount = messagesCount
    break;
	}

	return state.merge(nextState);
}
