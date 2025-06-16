import { GET_BLOG_POSTS, GET_BLOG_POST, GET_BLOG_CATEGORIES, SET_ACTIVES, GET_BLOG_POSTS_HOME, GET_NEW_BLOG_POSTS } from "../constants/constants.js";

const INITIAL_STATE = {
  blogs:[], blog:{}, blog_categories: [], blog_tags: [], hasMoreBlogs: true
};

export default function BlogFunction(state = INITIAL_STATE, action) {
	let nextState = state;
	switch(action.type) {
		case GET_BLOG_POSTS:
      nextState.blogs = [...nextState.blogs, ...action.payload.blogposts];
      nextState.blogCount = action.payload.blogpostsCount;
      if (nextState.blogs.length === action.payload.blogpostsCount) {
        nextState.hasMoreBlogs = false
      } else {
        nextState.hasMoreBlogs = true
      }
    break;
    case GET_NEW_BLOG_POSTS:
        nextState.blogs = action.payload.blogposts;
        nextState.blogCount = action.payload.blogpostsCount;
        if (nextState.blogs.length === action.payload.blogpostsCount) {
          nextState.hasMoreBlogs = false
        } else {
          nextState.hasMoreBlogs = true
        }
    break;
    case GET_BLOG_POST:
      nextState.blog = {...nextState.blog, ...action.payload.blogpost};
      nextState.relatedBlogPosts = action.payload.related_posts;
      break;
    case GET_BLOG_POSTS_HOME:
      nextState.blogs = action.payload.blogposts;
      nextState.blogCount = action.payload.blogpostsCount;
      break;
    case GET_BLOG_CATEGORIES:
      nextState.blog_categories = action.payload.categories;
      break;
    case SET_ACTIVES:
      nextState.blog_categories = action.payload.blog_categories;
      nextState.blog_tags = action.payload.blog_tags;
    break;
	}
	return {...state, ...nextState};
}

/*73096f1e-7e88-11e8-adc0-fa7ae01bbebc*/
