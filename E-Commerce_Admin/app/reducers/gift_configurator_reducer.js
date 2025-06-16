import Immutable from 'immutable';
import {GET_GIFT_CONFIGURATOR, ADD_GIFT_CONFIGURATOR, SET_INITIAL_VALUES_GIFT_CONFIGURATOR,
EDIT_GIFT_CONFIGURATOR, DELETE_GIFT_CONFIGURATOR} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({giftConfig:[], giftConfigCount:0, initialValuesGiftConfig:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_GIFT_CONFIGURATOR:
      var giftConfig = action.payload.gifts
      nextState.giftConfig = giftConfig
			var giftConfigCount = action.payload.giftsCount
			nextState.giftConfigCount = giftConfigCount
      break;

		case ADD_GIFT_CONFIGURATOR:
			nextState.giftConfig.push(action.payload)
			nextState.giftConfigCount++;
			break;

		case SET_INITIAL_VALUES_GIFT_CONFIGURATOR:
			nextState.initialValuesGiftConfig = action.payload;
			break;

		case EDIT_GIFT_CONFIGURATOR:
			var giftConfig = nextState.giftConfig;
			var gift = giftConfig.find((g) => {
				return g.id == action.payload.id;
			});
			gift = Object.assign(gift, action.payload.obj);
			nextState.giftConfig = giftConfig;
			break;

		case DELETE_GIFT_CONFIGURATOR:
			var giftConfig = nextState.giftConfig.filter((g) => {
				return g.id != action.payload.id;
			});
			nextState.giftConfig = giftConfig;
			break;
	}

	return state.merge(nextState);
}
