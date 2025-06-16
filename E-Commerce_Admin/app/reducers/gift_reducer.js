import Immutable from 'immutable';
import {GET_GIFTS, CREATE_GIFT, SET_INITIAL_VALUES_GIFT, EDIT_GIFT, DELETE_GIFT, GET_GIFTS_FOR_ORDER} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({gifts:[], giftsCount:0, initialValuesGift:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_GIFTS:
      var gifts = action.payload.gifts
      nextState.gifts = gifts
			var giftsCount = action.payload.giftsCount
			nextState.giftsCount = giftsCount
      break;

		case CREATE_GIFT:
			nextState.gifts.push(action.payload)
			nextState.giftsCount++;
			break;

		case SET_INITIAL_VALUES_GIFT:
			var gift_data = {};
			gift_data.id = action.payload.id;
			gift_data.name = action.payload.name;
			gift_data.active = action.payload.active;
			gift_data.display_name = action.payload.display_name;
			gift_data.lang = action.payload.lang;
			gift_data.country = action.payload.country;
			nextState.initialValuesGift = gift_data;
			break;

		case EDIT_GIFT:
			var gifts = nextState.gifts;
			var gift = gifts.find((g) => {
				return g.id == action.payload.id;
			});
			gift = Object.assign(gift, action.payload.obj);
			nextState.gifts = gifts;
			break;

		case DELETE_GIFT:
			var gifts = nextState.gifts.filter((g) => {
				return g.id != action.payload.id;
			});
			nextState.gifts = gifts;
			break;

		case GET_GIFTS_FOR_ORDER:
			var all_gifts = action.payload.data.gifts;
			var selected_gifts = action.payload.gifts;

			var active_gifts = all_gifts.filter((g) => {
				g.isChosen = 0;
				return g.active == 1;
			});

			for(var i=0; i<active_gifts.length; i++){
				if(selected_gifts) {
					if (selected_gifts.filter(function(e) { return e.gift_id === active_gifts[i].id; }).length > 0)
						active_gifts[i].isChosen = 1;
					else
						active_gifts[i].isChosen = 0;
				}
			}

			nextState.orderGifts = active_gifts;
			nextState.orderGiftsCount = active_gifts.length;
			break;
	}

	return state.merge(nextState);
}
