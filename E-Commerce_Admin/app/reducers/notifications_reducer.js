import Immutable from 'immutable';
import {GET_NOTIFICATIONS, PUSH_NOTIFICATION, MARK_AS_READ, TOGGLE_MENU} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({notifications: [], unreadNotificationsCount:0, allNotificationsCount:0, menuState: localStorage.getItem("menuState") || "open"});

export default function (state = INITIAL_STATE, action) {
    let nextState = state.toJS();

    switch(action.type) {
		case GET_NOTIFICATIONS:
			for(var i=0; i<action.payload.notifications.length; i++){
				nextState.notifications.push(action.payload.notifications[i])
			}
			nextState.unreadNotificationsCount = action.payload.unreadNotificationsCount
			nextState.allNotificationsCount = action.payload.allNotificationsCount
			break;
		case PUSH_NOTIFICATION:
			nextState.notifications.push(action.payload)
			break;
		case MARK_AS_READ:
			var notifications = nextState.notifications;
			var notif_id = action.payload;
			var n = notifications.map((obj, index) => {
				if(obj.id==notif_id){
					obj.seen=1;
				}
			    return obj;
			});
			nextState.notifications = n;
			nextState.unreadNotificationsCount--;
			break;
		case TOGGLE_MENU:
			if (action.payload === null) {
				nextState.menuState = "open";
			} else {
				nextState.menuState = action.payload;
			}
		break;
    }

    return state.merge(nextState);
}