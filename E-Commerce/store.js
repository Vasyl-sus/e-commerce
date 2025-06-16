import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from '@redux-devtools/extension'
import mainReducer from './reducers/mainReducer.js'
import cartReducer from './reducers/cartReducer.js'
import blogReducer from './reducers/blogReducer.js'
import { reducer as form } from 'redux-form'
import { createWrapper } from 'next-redux-wrapper'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

// REDUCERS

export const rootReducer = combineReducers({
  form,
  main: mainReducer,
  cart: cartReducer,
  blog: blogReducer,
})

const isDev = process.env.NODE_ENV !== 'production'

const middlewares = [thunk, isDev && logger].filter(Boolean)

export const initStore = reducer => {
  return createStore(
    reducer,
    undefined,
    composeWithDevTools(applyMiddleware(...middlewares)),
  )
}

const makeStore = () => {
  const store = initStore(rootReducer)

  return store
}

export const wrapper = createWrapper(makeStore)