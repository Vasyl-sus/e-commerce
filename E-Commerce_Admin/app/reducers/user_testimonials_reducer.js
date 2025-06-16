import Immutable from 'immutable';
import { GET_USER_TESTIMONIALS, ADD_USER_TESTIMONIAL, DELETE_USER_TESTIMONIAL } from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({ userTestimonials:[], testimonialsCount: 0, initialValuesUserTestimonials:{} });

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_USER_TESTIMONIALS:
      var userTestimonials = action.payload.userTestimonials;
      nextState.userTestimonials = userTestimonials;
      var userTestimonialsCount = action.payload.userTestimonialsCount;
      nextState.userTestimonialsCount = userTestimonialsCount;
      break;
    case ADD_USER_TESTIMONIAL:
      nextState.userTestimonials.push(action.payload)
      nextState.userTestimonialsCount++;
      break;
    case DELETE_USER_TESTIMONIAL:
			var userTestimonials = nextState.userTestimonials.filter((t) => {
				return t.id != action.payload.id;
			});
			nextState.userTestimonials = userTestimonials;
			break;
    default:
      break;
	}

	return state.merge(nextState);
}
