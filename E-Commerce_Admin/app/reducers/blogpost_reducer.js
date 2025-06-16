import Immutable from 'immutable';
import {GET_BLOG_POSTS, CREATE_BLOG_POST, GET_BLOG_POSTS_ALL, SET_INITIAL_VALUES_BLOG_POST, EDIT_BLOG_POST, DELETE_BLOG_POST, GET_BLOG_CATEGORIES} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({blogposts:[], blogpostsCount:0, initialValuesBlogPost:{therapies: [], accessories: []}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_BLOG_POSTS:
	      var blogposts = action.payload.blogposts
	      nextState.blogposts = blogposts
	      var blogpostsCount = action.payload.blogpostsCount
	      nextState.blogpostsCount = blogpostsCount
	      break;

	  case GET_BLOG_POSTS_ALL:
	  	var res = action.payload.blogposts;

			var arr = [];

			for(var i=0; i<res.length; i++){
				arr.push({label:res[i].title, value:res[i].id});
			}

	  	nextState.blogpostsAllDrop = arr;
	  break;

		case CREATE_BLOG_POST:
      nextState.blogposts.push(action.payload)
      nextState.blogpostsCount++;
      break;

		case SET_INITIAL_VALUES_BLOG_POST:
			var categories = action.payload.categories.map(c => {return {label:c, value:c}})
			action.payload.categories = categories;
			var therapies = [];
			var accessories = [];
			if(action.payload.therapies.length > 0) {
				therapies = action.payload.therapies.map(t => {return {label: t.name, value: t.therapy_id}})
				action.payload.therapies = therapies;
			} else {
				action.payload.therapies = [];
			}
			if(action.payload.accessories.length > 0) {
				accessories = action.payload.accessories.map(a => {return {label: a.name, value: a.accessory_id}})
				action.payload.accessories = accessories;
			} else {
				action.payload.accessories = [];
			}
			var tags = action.payload.tags.map(t => {return t}).toString();
			action.payload.tags = tags;
			nextState.initialValuesBlogPost = action.payload;
			break;

		case DELETE_BLOG_POST:
			var blogposts = nextState.blogposts.filter((b) => {
				return b.id != action.payload.id;
			});
			nextState.blogposts = blogposts;
			break;

		case GET_BLOG_CATEGORIES:
			var cat = action.payload.blogCategories;
			var arr = [];
			for(var i=0; i<cat.length; i++){
				var obj = {};
				obj.label = cat[i].name;
				obj.value = cat[i].name;
				arr.push(obj);
			}

			nextState.blogCategories = arr;
			break;

	}

	return state.merge(nextState);
}
