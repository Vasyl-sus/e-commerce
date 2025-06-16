import Immutable from 'immutable';
import {GET_ACCESSORIES, CREATE_ACCESSORY, SET_INITIAL_VALUES_ACCESSORY, EDIT_ACCESSORY, DELETE_ACCESSORY} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({accessories:[], accessoriesCount:0, initialValuesAccessory:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_ACCESSORIES:
      var accessories = action.payload.accessories
      nextState.accessories = accessories
			var accessoriesCount = action.payload.accessoriesCount
			nextState.accessoriesCount = accessoriesCount
      break;

		case CREATE_ACCESSORY:
			nextState.accessories.push(action.payload)
			nextState.accessoriesCount++;
			break;

		case SET_INITIAL_VALUES_ACCESSORY:
			nextState.initialValuesAccessory = action.payload;
			break;

		case EDIT_ACCESSORY:
			var accessories = nextState.accessories;
			var accessory = accessories.find((a) => {
				return a.id == action.payload.id;
			});
			accessory = Object.assign(accessory, action.payload.obj);
			nextState.accessories = accessories;
			break;

		case DELETE_ACCESSORY:
			var accessories = nextState.accessories.filter((a) => {
				return a.id != action.payload.id;
			});
			nextState.accessories = accessories;
			break;
	}

	return state.merge(nextState);
}
