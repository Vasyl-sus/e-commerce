import Immutable from 'immutable';
import {GET_COUNTRIES_LIST, ADD_COUNTRY, DELETE_COUNTRY, INITIAL_COUNTRY} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({countriesList:[], initialValuesCountry: {}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
	 {
		case GET_COUNTRIES_LIST:
			var countries = action.payload.countries;
			nextState.countriesList = countries;
			nextState.countriesListCount = action.payload.countriesCount;
	    	break;
	    case ADD_COUNTRY:
			var country = action.payload;
			country.currency_name = country.currency;
			nextState.countriesList.push(country);
			nextState.countriesListCount++;
	    	break;
	    case DELETE_COUNTRY:
			var id = action.payload;
			var countries = nextState.countriesList.filter((c) => {
				return c.id != id;
			});
			nextState.countriesList = countries;
			nextState.countriesListCount--;
	    	break;
      case INITIAL_COUNTRY:
        nextState.initialValuesCountry = action.payload
				console.log(nextState.initialValuesCountry)
      	break;
	}

	return state.merge(nextState);
}
