import Immutable from 'immutable';
import {GET_TESTIMONIALS, ADD_TESTIMONIAL, SET_INITIAL_VALUES_TESTIMONIALS,
EDIT_TESTIMONIAL, DELETE_TESTIMONIAL, DELETE_TESTIMONIAL_IMAGES} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({testimonials:[], testimonialsCount:0, initialValuesTestimonials:{}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_TESTIMONIALS:
      var testimonials = action.payload.testimonials
      nextState.testimonials = testimonials
      var testimonialsCount = action.payload.testimonialsCount
      nextState.testimonialsCount = testimonialsCount
      break;

		case ADD_TESTIMONIAL:
      nextState.testimonials.push(action.payload)
      nextState.testimonialsCount++;
      break;

		case SET_INITIAL_VALUES_TESTIMONIALS:
      
      var data = action.payload;
      data.therapies = []

      data.productcategories.map(p => {
        data.therapies.push({value: p.pc_id, label: p.pc_name})
      })

      delete data.productcategories;

			nextState.initialValuesTestimonials = action.payload;
			break;
		case DELETE_TESTIMONIAL:
			var testimonials = nextState.testimonials.filter((t) => {
				return t.id != action.payload.id;
			});
			nextState.testimonials = testimonials;
			break;

		case DELETE_TESTIMONIAL_IMAGES:
			break;
	}

	return state.merge(nextState);
}
