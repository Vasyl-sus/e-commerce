import Immutable from 'immutable';
import {GET_PRODUCT_CATEGORIES, CREATE_PRODUCT_CATEGORY, SET_INITIAL_VALUES_PRODUCT_CATEGORY,
EDIT_PRODUCT_CATEGORY, DELETE_PRODUCT_CATEGORY} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({categories:[], categoriesCount:0, initialValuesProductCategory:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_PRODUCT_CATEGORIES:
      var categories = action.payload.categories
      nextState.categories = categories
			var categoriesCount = action.payload.categoriesCount
			nextState.categoriesCount = categoriesCount
      break;

    case CREATE_PRODUCT_CATEGORY:
      nextState.categories.push(action.payload)
			nextState.categoriesCount++;
      break;

		case SET_INITIAL_VALUES_PRODUCT_CATEGORY:
			nextState.initialValuesProductCategory = action.payload;
			break;

		case EDIT_PRODUCT_CATEGORY:
			var categories = nextState.categories;
			var category = categories.find((c) => {
				return c.id == action.payload.id;
			});
			category = Object.assign(category, action.payload.obj);
			nextState.categories = categories;
			break;

		case DELETE_PRODUCT_CATEGORY:
			var categories = nextState.categories.filter((c) => {
				return c.id != action.payload.id;
			});
			nextState.categories = categories;
			break;
	}

	return state.merge(nextState);
}
