import Immutable from 'immutable';
import {GET_PRODUCTS, CREATE_NEW_PRODUCT, SET_INITIAL_VALUES_PRODUCT, EDIT_PRODUCT, UPDATE_PRODUCT_PICTURE, DELETE_PRODUCT, SET_INITIAL_VALUES_PRODUCT_STOCK,
GET_STOCK_CHANGES, EDIT_PRODUCT_STOCK, GET_STOCK_REMINDERS, ADD_STOCK_REMINDER, EDIT_STOCK_REMINDER, DELETE_STOCK_REMINDER, GET_ALL_STOCK_CHANGES} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({products:[], productsCount:0, initialValuesProduct:{}, file:{}, stockchanges:[],
stockreminders:[], stockremindersCount:0, initialValuesProductStock:{}, all_stock_changes:[], all_stock_changes_count:0});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_PRODUCTS:
      var products = action.payload.products
      nextState.products = products
			var productsCount = action.payload.productsCount
			nextState.productsCount = productsCount
      break;

		case GET_STOCK_CHANGES:
			var stockchanges = action.payload.stockchanges
			nextState.stockchanges = stockchanges
			break;

		case GET_ALL_STOCK_CHANGES:
			var all_stock_changes = action.payload.stockchanges
			nextState.all_stock_changes = all_stock_changes
			var all_stock_changes_count = action.payload.stockchangescount
			nextState.all_stock_changes_count = all_stock_changes_count
			break;

		case GET_STOCK_REMINDERS:
			var stockreminders = action.payload.stockreminders
			nextState.stockreminders = stockreminders
			var stockremindersCount = action.payload.stockremindersCount
			nextState.stockremindersCount = stockremindersCount
			break;

		case ADD_STOCK_REMINDER:
			nextState.stockreminders.push(action.payload)
			nextState.stockremindersCount++;
			break;

		case EDIT_PRODUCT_STOCK:
			var products = nextState.products;
			var product = products.find((p) => {
				return p.id == action.payload.product_id;
			});
			product.amount = parseInt(product.amount) + action.payload.value;
			break;

    case CREATE_NEW_PRODUCT:
      nextState.products.push(action.payload)
      nextState.productsCount++;
      break;

		case SET_INITIAL_VALUES_PRODUCT:
			var edit_product = {post_image:{}};
			edit_product.id = action.payload.id;
			edit_product.name = action.payload.name;
			edit_product.category = action.payload.category;
			edit_product.amount = action.payload.amount;
			edit_product.sort_order = action.payload.sort_order;
			edit_product.translations = action.payload.translations;
			nextState.initialValuesProduct = edit_product;
			//console.log(nextState.initialValuesProduct);
			break;

		case SET_INITIAL_VALUES_PRODUCT_STOCK:
			nextState.initialValuesProductStock = action.payload;
		break;

		case EDIT_PRODUCT:
			var products = nextState.products;
			var product = products.find((p) => {
				return p.id == action.payload.id;
			});
			product = Object.assign(product, action.payload.obj);
			nextState.products = products;
			break;

		case EDIT_STOCK_REMINDER:
			var stockreminders = nextState.stockreminders;
			var stockreminder = stockreminders.find((s) => {
				return s.id == action.payload.id;
			});
			stockreminder = Object.assign(stockreminder, action.payload.obj);
			nextState.stockreminders = stockreminders;
			break;

		case DELETE_PRODUCT:
			var products = nextState.products.filter((p) => {
				return p.id != action.payload.id;
			});
			nextState.products = products;
			break;

		case DELETE_STOCK_REMINDER:
			var stockreminders = nextState.stockreminders.filter((s) => {
				return s.id != action.payload.id;
			});
			nextState.stockreminders = stockreminders;
			break;
	}

	return state.merge(nextState);
}
