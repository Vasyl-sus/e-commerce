import Immutable from 'immutable';
import {GET_DATA_FOR_LANGUAGE, ADD_NEW_EXPENSE, HISTORY_EXPENSE, OPEN_NEW_EXPENSE, OPEN_EDIT_EXPENSE, EDIT_EXPENSE, ADD_NEW_EXPENSE_STAT} from '../config/constants';


  const INITIAL_STATE = Immutable.fromJS({data_expenses: [], newExpenseOpen:false, editExpenseOpen:false, history:[]
	}
  );

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {

	case GET_DATA_FOR_LANGUAGE:
	    var data = action.payload;
	    var arrayToReturn = [];
	    var tmp = [];

	    tmp = data.filter(l => {
	        return l.category == 'products/logistics'
	      })
	    arrayToReturn.push({title:'IZDELKI IN LOGISTIKA', category:'products/logistics', content:tmp}); 
	    tmp = [];

	    tmp = data.filter(l => {
	        return l.category == 'marketing'
	      })
	    arrayToReturn.push({title:'MARKETING', category:'marketing', content:tmp}); 
	    tmp = [];

	    tmp = data.filter(l => {
	        return l.category == 'outsourcing'
	      })
	    arrayToReturn.push({title:'OUTSOURCING', category:'outsourcing', content:tmp}); 
	    tmp = [];

	    tmp = data.filter(l => {
	        return l.category == 'software'
	      })
	    arrayToReturn.push({title:'SOFTWARE', category:'software', content:tmp}); 
	    tmp = [];

	    tmp = data.filter(l => {
	        return l.category == 'work/office'
	      })
	    arrayToReturn.push({title:'DELO IN PISARNE', category:'work/office', content:tmp}); 
	    tmp = [];
		
	    nextState.data_expenses = arrayToReturn;
	    nextState.successNew = false;
	break;

	case ADD_NEW_EXPENSE_STAT:
		var result = action.payload;
		break;

	case ADD_NEW_EXPENSE:
		var result = action.payload;
		var data_expenses = nextState.data_expenses;
		var cat = data_expenses.find(o => { 				
			return o.category == result.category; 			
		})
		cat.content.push(result);
		nextState.newExpenseOpen = false;
		break;

	case EDIT_EXPENSE:
		var result = action.payload;
		var data_expenses = nextState.data_expenses;
		var cat = data_expenses.find(o => { 				
			return o.category == result.category; 			
		})

		cat.content = cat.content.map((obj, index) => {
		    return obj.id === result.id ? result : obj;
		 });
	
		nextState.editExpenseOpen = false;
		break;

	case HISTORY_EXPENSE:
		var history = action.payload.expense_history;
		var admins = localStorage.getItem('admins');
		admins = JSON.parse(admins);

		for(var i=0; i<history.length;i++){
		 	var agent = admins.filter(a => {
		       return a.id == history[i].responsible_agent_id
		    })
		    if(agent[0])
		    	history[i].agent = agent[0].first_name + ' ' + agent[0].last_name;
		    else
		    	history[i].agent = '/';
		 }
		nextState.history = history;
		
		break;

	case OPEN_NEW_EXPENSE:
		nextState.newExpenseOpen = action.payload;
		break;

	case OPEN_EDIT_EXPENSE:
		nextState.editExpenseOpen = action.payload;
		break;


  }


	return state.merge(nextState);
}
