import Immutable from 'immutable';
import {GET_REVIEWS, SET_INITIAL_VALUES_REVIEW} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({reviews:[], reviewCount:0, initialValuesReview:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_REVIEWS:
      var reviews = action.payload.reviews
      nextState.reviews = reviews
			var reviewCount = action.payload.reviewCount
			nextState.reviewCount = reviewCount
      break;

		case SET_INITIAL_VALUES_REVIEW:
			nextState.initialValuesReview = action.payload;
			break;
	}

	return state.merge(nextState);
}
