import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Immutable from 'immutable';
import rootReducer from './reducers/index';
import {Router, Route, browserHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';
import thunk from 'redux-thunk';
import customer_profile_view from './routes/customer_profile/customer_profile';
import discounts_view from './routes/discounts/discounts';
import therapies_view from './routes/therapies/therapies';
import currencies_view from './routes/currencies/currencies';
import delivery_methods_view from './routes/delivery_methods/delivery_methods';
import utms_view from './routes/utms/utms';
import message_templates_view from './routes/message_templates/message_templates';
import products_view from './routes/products/products';
import payment_methods_view from './routes/payment_methods/payment_methods';
import order_statuses_view from './routes/order_statuses/order_statuses';
import admins_view from './routes/admins/admins';
import user_groups_view from './routes/user_groups/user_groups';
import orders_dashboard_view from './routes/orders_dashboard/orders_dashboard';
import add_edit_view from './routes/add_edit/add_edit';
import add_edit_web_view from './routes/add_edit_web/add_edit_web';
import agent_statistics_view from './routes/statistics/agent_statistics';
import agents_view from './routes/statistics/agents_table';
import daily_statistics_view from './routes/statistics/daily_statistics';
import monthly_statistics_view from './routes/statistics/monthly_statistics';
import monthly_income_view from './routes/statistics/monthly_income';
import add_expense_page from './routes/statistics/add_expense_page';
import daily_income_view from './routes/statistics/daily_income';
import order_statistics_view from './routes/statistics/order_statistics';
import blog_view from './routes/blog/blog';
import testimonials_view from './routes/testimonials/testimonials';
import order_details_view from './routes/order_details/order_details';
import new_order_view from './routes/customer_profile/add_order';
import languages_view from './routes/languages/languages';
import expense_configurator_view from './routes/expense_configurator/expense_configurator';
import sticky_notes_view from './routes/sticky_notes/sticky_notes';
import gifts_view from './routes/gifts/gifts';
import colors_view from './routes/colors/colors';
import accessories_view from './routes/accessories/accessories';
import badges_view from './routes/badges/badges';
import otom_view from './routes/otom/otom';
import customers_bd_view from './routes/customers_bd/customers_bd';
import blog_categories_view from './routes/blog_categories/blog_categories';
import countries_view from './routes/countries/countries';
import Login from './routes/login/login.js';
import Auth from './components/Services/auth.js'
import customers_oto from './routes/customers_oto/customers_oto';
import customers_baza from './routes/customers_baza/customers_baza';
import precomputed_customers_baza from './routes/customers_baza/precomputed_customers_baza';
import top_image_bar from './routes/top_image_bar/top_image_bar';
import instagram_feed from  './routes/instagram_feed/instagram_feed';
import categories from  './routes/categories/categories';
import oto from  './routes/oto/oto';
import pharmacies_view from './routes/pharmacies/pharmacies';
import pharmacies_orders_view from './routes/pharmacies_orders/pharmacies_orders';
import ac_mails_view from './routes/ac_mails/ac_mails';
import mediums from  './routes/mediums/mediums';
import stock_view from  './routes/stock/stock';
import reviews_view from './routes/reviews/reviews';
import gift_configurator_view from './routes/gift_configurator/gift_configurator';
import influencers_view from './routes/influencers/influencers';
import influencer_orders_view from './routes/influencers/influencer_orders';
import influencer_new_order_view from './routes/influencers/influencer_new_order';
import sms_campaign from './routes/sms_campaign/sms_campaign';
import sms_campaigns from './routes/sms_campaign/sms_campaigns';
import user_testimonials from './routes/user-testimonials/user-testimonials';

//Components(containers)
import App from './App';
import logger from 'redux-logger'

const isDev = process.env.NODE_ENV === 'development'
const middlewares = [thunk, isDev && logger].filter(Boolean);
const middleware = routerMiddleware(browserHistory)
middlewares.push(middleware);
const initialState = Immutable.Map();
export const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
);

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/login" component={Login} />
        <Route path="/" component={Auth(App)}>
          <Route path="customer_profiles" component={Auth(customer_profile_view)}/>
          <Route path="discounts" component={Auth(discounts_view)}/>
          <Route path="languages" component={Auth(languages_view)}/>
          <Route path="expense_configurator" component={Auth(expense_configurator_view)}/>
          <Route path="therapies" component={Auth(therapies_view)}/>
          <Route path="currencies" component={Auth(currencies_view)}/>
          <Route path="deliveryMethods" component={Auth(delivery_methods_view)}/>
          <Route path="utms" component={Auth(utms_view)}/>
          <Route path="messageTemplates" component={Auth(message_templates_view)}/>
          <Route path="product" component={Auth(products_view)}/>
          <Route path="paymentMethods" component={Auth(payment_methods_view)}/>
          <Route path="orderStatuses" component={Auth(order_statuses_view)}/>
          <Route path="admins" component={Auth(admins_view)}/>
          <Route path="userGroups" component={Auth(user_groups_view)}/>
          <Route path="dashboard" component={Auth(orders_dashboard_view)}/>
          <Route path="add_edit" component={Auth(add_edit_view)}/>
          <Route path="add_edit_web" component={Auth(add_edit_web_view)}/>
          <Route path="agent_statistics" component={Auth(agent_statistics_view)}/>
          <Route path="daily_statistics" component={Auth(daily_statistics_view)}/>
          <Route path="monthly_statistics" component={Auth(monthly_statistics_view)}/>
          <Route path="monthly_income" component={Auth(monthly_income_view)}/>
          <Route path="add_expense_page" component={Auth(add_expense_page)}/>
          <Route path="daily_income" component={Auth(daily_income_view)}/>
          <Route path="order_statistics" component={Auth(order_statistics_view)}/>
          <Route path="blog" component={Auth(blog_view)}/>
          <Route path="testimonials" component={Auth(testimonials_view)}/>
          <Route path="order_details" component={Auth(order_details_view)}/>
          <Route path="new_order" component={Auth(new_order_view)}/>
          <Route path="stickyNotes" component={Auth(sticky_notes_view)}/>
          <Route path="agents" component={Auth(agents_view)}/>
          <Route path="gifts" component={Auth(gifts_view)}/>
          <Route path="accessories" component={Auth(accessories_view)}/>
          <Route path="badges" component={Auth(badges_view)}/>
          <Route path="otoms" component={Auth(otom_view)}/>
          <Route path="customers_bd" component={Auth(customers_bd_view)}/>
          <Route path="blog_categories" component={Auth(blog_categories_view)}/>
          <Route path="colors" component={Auth(colors_view)}/>
          <Route path="countries" component={Auth(countries_view)}/>
          <Route path="customers_oto" component={Auth(customers_oto)}/>
          <Route path="customers_baza" component={Auth(customers_baza)}/>
          <Route path="precomputed_customers_baza" component={Auth(precomputed_customers_baza)}/>
          <Route path="top_image_bar" component={Auth(top_image_bar)}/>
          <Route path="instagram_feed" component={Auth(instagram_feed)}/>
          <Route path="categories" component={Auth(categories)}/>
          <Route path="oto" component={Auth(oto)}/>
          <Route path="pharmacies" component={Auth(pharmacies_view)}/>
          <Route path="pharmacies_orders" component={Auth(pharmacies_orders_view)}/>
          <Route path="ac_mails" component={Auth(ac_mails_view)}/>
          <Route path="mediums" component={Auth(mediums)}/>
          <Route path="stock" component={Auth(stock_view)}/>
          <Route path="reviews" component={Auth(reviews_view)}/>
          <Route path="gift_configurator" component={Auth(gift_configurator_view)}/>
          <Route path="influencers" component={Auth(influencers_view)}/>
          <Route path="influencer_orders" component={Auth(influencer_orders_view)}/>
          <Route path="influencer_new_order" component={Auth(influencer_new_order_view)}/>
          <Route path="smscampaign" component={Auth(sms_campaign)}/>
          <Route path="smscampaigns" component={Auth(sms_campaigns)}/>
          <Route path="user-testimonials" component={Auth(user_testimonials)}/>
        </Route>
      </Router>
    </Provider>
    , document.getElementById('app')
);
