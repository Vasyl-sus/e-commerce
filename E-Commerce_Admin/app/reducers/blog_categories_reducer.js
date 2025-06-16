import Immutable from 'immutable';
import {GET_BLOG_CATEGORIES, CREATE_BLOG_CATEGORY, SET_INITIAL_VALUES_BLOG_CATEGORY, EDIT_BLOG_CATEGORY, DELETE_BLOG_CATEGORY} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({blogCategories:[], blogCategoriesCount:0, initialValuesBlogCategory:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_BLOG_CATEGORIES:
      var blogCategories = action.payload.blogCategories
      nextState.blogCategories = blogCategories
      var blogCategoriesCount = action.payload.blogCategoriesCount
      nextState.blogCategoriesCount = blogCategoriesCount
      break;

		case CREATE_BLOG_CATEGORY:
      nextState.blogCategories.push(action.payload)
      nextState.blogCategoriesCount++;
      break;

		case SET_INITIAL_VALUES_BLOG_CATEGORY:
			nextState.initialValuesBlogCategory = action.payload;
			break;

		case DELETE_BLOG_CATEGORY:
			var blogCategories = nextState.blogCategories.filter((bc) => {
				return bc.id != action.payload.id;
			});
			nextState.blogCategories = blogCategories;
			break;

	}

	return state.merge(nextState);
}
