import Immutable from 'immutable';
import {GET_OTOS, REMOVE_OTO, EDIT_OTO} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({otos:[]});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  	{
		case GET_OTOS:
			var otos = action.payload.otos
			nextState.otos = otos
			var otosCount = action.payload.otosCount
			nextState.otosCount = otosCount
		break;
		case REMOVE_OTO:
			var id = action.payload
			nextState.otos = nextState.otos.filter(f=>{
				return f.id != id
			})
			nextState.otosCount--
		break;
		case EDIT_OTO:
			var edit = action.payload
			nextState.otos = nextState.otos.filter(f=>{
				return f.id == edit.id ? edit:f;
			})
		break;

	}

	return state.merge(nextState);
}
