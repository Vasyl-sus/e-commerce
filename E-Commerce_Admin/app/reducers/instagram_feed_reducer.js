import Immutable from 'immutable';
import {GET_INSTAGRAM_FEEDS, NEW_INSTAGRAM_FEED, SET_INITIAL_VALUES_INSTAGRAM_FEED,
EDIT_INSTAGRAM_FEED, DELETE_INSTAGRAM_FEED} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({instagramFeeds:[], instagramFeedsCount:0, initialValuesInstagramFeed:{therapies: [], accessories: []}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_INSTAGRAM_FEEDS:
			var instagramFeeds = action.payload.igfeeds;
			nextState.instagramFeeds = instagramFeeds;
			var instagramFeedsCount = action.payload.igfeedsCount;
			nextState.instagramFeedsCount = instagramFeedsCount;
      break;

		case NEW_INSTAGRAM_FEED:
			nextState.instagramFeeds.push(action.payload);
			nextState.instagramFeedsCount++;
			break;

		case SET_INITIAL_VALUES_INSTAGRAM_FEED:
			var therapies = [];
			var accessories = [];
			let data = action.payload;
			if(action.payload.therapies.length > 0) {
				therapies = action.payload.therapies.map(t => {return {label: t.view_label, value: t.id}})
				data.products = therapies;
			} else {
				data.products = [];
			}
			if(data.accessories.length > 0) {
				accessories = data.accessories.map(a => {return {label: a.name, value: a.id}})
				data.accessories = accessories;
			} else {
				data.accessories = [];
			}
			
			nextState.initialValuesInstagramFeed = data;
			break;

		case EDIT_INSTAGRAM_FEED:
			var instagramFeeds = nextState.instagramFeeds;
			var instagram_feed = instagramFeeds.find(i => {
				return i.id == action.payload.id;
			});
			instagram_feed = Object.assign(instagram_feed, action.payload.obj);
			nextState.instagramFeeds = instagramFeeds;
			break;

		case DELETE_INSTAGRAM_FEED:
			var instagramFeeds = nextState.instagramFeeds.filter(i => {
				return i.id != action.payload.id;
			})
			nextState.instagramFeeds = instagramFeeds;
			break;
	}

	return state.merge(nextState);
}
