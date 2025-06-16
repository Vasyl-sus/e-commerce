import Immutable from 'immutable';
import {GET_BADGES, CREATE_BADGE, SET_INITIAL_VALUES_BADGE, EDIT_BADGE, DELETE_BADGE} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({badges:[], badgesCount:0, initialValuesBadges:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_BADGES:
      var badges = action.payload.badges
      nextState.badges = badges
			var badgesCount = action.payload.badgesCount
			nextState.badgesCount = badgesCount
      break;

    case CREATE_BADGE:
      nextState.badges.push(action.payload)
      nextState.badgesCount++;
      break;

		case SET_INITIAL_VALUES_BADGE:
      var badge = {};
      badge.id = action.payload.id;
      badge.name = action.payload.name;
      badge.color = action.payload.color;
			nextState.initialValuesBadges = badge;
			break;

		case EDIT_BADGE:
			var badges = nextState.badges;
			var badge = badges.find((b) => {
				return b.id == action.payload.id;
			});
			badge = Object.assign(badge, action.payload.obj);
			nextState.badges = badges;
			break;

		case DELETE_BADGE:
			var badges = nextState.badges.filter((b) => {
				return b.id != action.payload.id;
			});
			nextState.badges = badges;
			break;
	}

	return state.merge(nextState);
}
