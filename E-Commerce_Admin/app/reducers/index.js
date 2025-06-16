import { combineReducers } from 'redux-immutable'
import {reducer as formReducer} from 'redux-form/immutable'
import customer_profile_reducer from './customer_profile_reducer'
import main_reducer from './main_reducer'
import discounts_reducer from './discount_reducer'
import therapies_reducer from './therapy_reducer'
import currencies_reducer from './currency_reducer'
import payment_methods_reducer from './payment_method_reducer'
import delivery_methods_reducer from './delivery_method_reducer'
import utms_reducer from './utm_reducer'
import message_templates_reducer from './message_template_reducer';
import products_reducer from './product_reducer';
import order_statuses_reducer from './order_status_reducer';
import admins_reducer from './admin_reducer';
import user_groups_reducer from './user_group_reducer';
import order_dashboard_reducer from './orders_dashboard_reducer';
import order_details_reducer from './order_details_reducer';
import color_reducer from './colors_reducer';
import language from './languages_reducer';
import expense_configurator from './expense_configurator_reducer';
import statistics_reducer from './statistics_reducer';
import sticky_note_reducer from './sticky_notes_reducer';
import testimonials_reducer from './testimonials_reducer';
import gifts_reducer from './gift_reducer';
import accessories_reducer from './accessories_reducer';
import badges_reducer from './badges_reducer';
import blogpost_reducer from './blogpost_reducer';
import otom_reducer from './otom_reducer';
import customers_bd_reducer from './customers_bd_reducer';
import blog_categories_reducer from './blog_categories_reducer';
import countries_reducer from './countries_reducer';
import notifications_reducer from './notifications_reducer';
import top_image_bar_reducer from './top_image_bar_reducer';
import instagram_feed_reducer from './instagram_feed_reducer';
import ac_mails_reducer from './ac_mails_reducer';
import categories_reducer from './categories_reducer'
import oto_reducer from './oto_reducer'
import mediums_reducer from './mediums_reducer';
import reviews_reducer from './reviews_reducer';
import gift_configurator_reducer from './gift_configurator_reducer';
import influencers_reducer from './influencers_reducer';
import sms_campaign_reducer from './sms_campaign_reducer';
import user_testimonials_reducer from './user_testimonials_reducer';

const rootReducer = combineReducers({
    form: formReducer,
    customer_profile_data: customer_profile_reducer,
    main_data:main_reducer,
    discounts_data:discounts_reducer,
    therapies_data:therapies_reducer,
    currencies_data:currencies_reducer,
    payment_methods_data:payment_methods_reducer,
    delivery_methods_data:delivery_methods_reducer,
    utms_data:utms_reducer,
    message_templates_data:message_templates_reducer,
    products_data:products_reducer,
    order_statuses_data:order_statuses_reducer,
    admins_data:admins_reducer,
    language_data: language,
    user_groups_data:user_groups_reducer,
    orders_dashboard_data:order_dashboard_reducer,
    order_details_data: order_details_reducer,
    colors_data: color_reducer,
    expense_configurator: expense_configurator,
    statistics_data: statistics_reducer,
    sticky_notes_data: sticky_note_reducer,
    testimonials_data: testimonials_reducer,
    gifts_data: gifts_reducer,
    accessories_data: accessories_reducer,
    badges_data: badges_reducer,
    notifications_data: notifications_reducer,
    blogpost_data: blogpost_reducer,
    otom_data: otom_reducer,
    customers_bd_data: customers_bd_reducer,
    blog_categories_data: blog_categories_reducer,
    countries_data:countries_reducer,
    top_image_bar_data: top_image_bar_reducer,
    instagram_feed_data: instagram_feed_reducer,
    categories_data: categories_reducer,
    oto_data: oto_reducer,
    ac_mail_data: ac_mails_reducer,
    mediums: mediums_reducer,
    reviews_data: reviews_reducer,
    gift_configurator_data: gift_configurator_reducer,
    influencers_data: influencers_reducer,
    sms_campaign_data: sms_campaign_reducer,
    user_testimonials_data: user_testimonials_reducer,
});

export default rootReducer;
