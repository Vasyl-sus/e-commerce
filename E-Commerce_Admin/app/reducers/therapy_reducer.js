import Immutable from 'immutable';
import {GET_THERAPIES, CREATE_NEW_THERAPY, SET_INITIAL_VALUES_THERAPY, EDIT_THERAPY, DELETE_THERAPY, GET_THERAPIES1} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({therapies:[], therapies_all:[], therapiesCoun_all: 0, therapiesCount:0, initialValuesTherapy:{}, products: localStorage.getItem("products") && JSON.parse(localStorage.getItem("products")) || []});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_THERAPIES:
      var therapies = action.payload.therapies
      nextState.therapies = therapies
			var therapiesCount = action.payload.therapiesCount
			nextState.therapiesCount = therapiesCount
      break;
    case GET_THERAPIES1:
      var therapies = action.payload.therapies
      nextState.therapies_all = therapies
			var therapiesCount = action.payload.therapiesCount
			nextState.therapiesCoun_all = therapiesCount
    break;
    break;

    case CREATE_NEW_THERAPY:
      nextState.therapies.push(action.payload)
      nextState.therapiesCount++;
      break;

		case SET_INITIAL_VALUES_THERAPY:
			var edit_therapy = {};
			edit_therapy.country = action.payload.country;
			edit_therapy.language = action.payload.language;
			edit_therapy.meta_title = action.payload.meta_title;
			edit_therapy.meta_description = action.payload.meta_description;
			edit_therapy.name = action.payload.name;
			edit_therapy.id = action.payload.id;
			var product_quantity = 0;
			for (var i = 0; i < action.payload.products.length; i++) {
				product_quantity += action.payload.products[i].product_quantity;
			}
			edit_therapy.product_quantity = product_quantity;
			edit_therapy.category = action.payload.category;
			edit_therapy.active = action.payload.active;
			edit_therapy.seo_link = action.payload.seo_link;
			edit_therapy.total_price = action.payload.total_price;
			edit_therapy.view_label = action.payload.view_label;
			edit_therapy.title_color = action.payload.title_color;
			edit_therapy.products = action.payload.products.map(p => {return {label: p.name, value: p.id}});
			edit_therapy.second_bonus = action.payload.second_bonus;
			edit_therapy.bonus = action.payload.bonus;
			edit_therapy.therapy_name = action.payload.therapy_name;
			edit_therapy.box_title = action.payload.box_title;
			edit_therapy.box_subtitle = action.payload.box_subtitle;
			edit_therapy.inflated_price = action.payload.inflated_price;
			edit_therapy.inflated_price_label = action.payload.inflated_price_label;
			edit_therapy.percent = action.payload.percent;
			nextState.initialValuesTherapy = edit_therapy;
			break;

		case EDIT_THERAPY:
			var therapies = nextState.therapies;
			var therapy = therapies.find((t) => {
				return t.id == action.payload.id;
			});
			therapy = Object.assign(therapy, action.payload.obj);
			nextState.therapies = therapies;
			break;

		case DELETE_THERAPY:
			var therapies = nextState.therapies.filter((t) => {
				return t.id != action.payload.id;
			});
			nextState.therapies = therapies;
			break;
	}

	return state.merge(nextState);
}
