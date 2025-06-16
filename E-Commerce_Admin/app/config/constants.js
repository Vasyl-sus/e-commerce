var ttid;
var url;
var apiUrl;
var prodApiUrl;
var socketUrl;

if (process.env.NODE_ENV == 'development') {
  url = 'http://localhost:4000';
  apiUrl = 'http://localhost:3000';
  prodApiUrl = 'http://localhost:3000';
  socketUrl = 'http://localhost:3002';
  ttid = "UA-55801992-2"
} else {
  url = 'https://admin.E-commerce.com';
  apiUrl = 'https://E-commerce.com';
  prodApiUrl = 'https://E-commerce.com';
  socketUrl = 'https://E-commerce.com';
  ttid = "UA-55801992-1"
}

export const tid = ttid;

export const ROOT_URL = url;
export const PROD_API_URL = prodApiUrl;
export const API_URL = apiUrl;
export const LOADING = "LOADING";
export const SOCKET_URL = socketUrl;

//const login, logout
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const ERROR_LOGIN = "ERROR_LOGIN";
export const ADD_NEW_EXPENSE_STAT = "ADD_NEW_EXPENSE_STAT";
export const SET_T_LANGUAGE = "SET_T_LANGUAGE";

export const GET_THERAPIES1 = "GET_THERAPIES1";

export const SET_SUB_LANGUAGE = "SET_SUB_LANGUAGE";

//const local statuses, countries
export const GET_LOCAL_STATUSES = "GET_LOCAL_STATUSES";
export const GET_LOCAL_COUNTRIES = "GET_LOCAL_COUNTRIES";

//abandoned cart mails const
export const GET_AC_MAIL = "GET_AC_MAIL";
export const CREATE_AC_MAIL = "CREATE_AC_MAIL";
export const SET_INITIAL_VALUES_AC_MAIL = "SET_INITIAL_VALUES_AC_MAIL";
export const EDIT_AC_MAIL = "EDIT_AC_MAIL";
export const DELETE_AC_MAIL = "DELETE_AC_MAIL";

export const CHANGE_ACC_QUANTITY = "CHANGE_ACC_QUANTITY"

//customer profiles const
export const GET_CUSTOMER_PROFILES = "GET_CUSTOMER_PROFILES";
export const CREATE_NEW_CUSTOMER_PROFILE = "CREATE_NEW_CUSTOMER_PROFILE";
export const SET_INITIAL_VALUES_CUSTOMER_PROFILE = "SET_INITIAL_VALUES_CUSTOMER_PROFILE";
export const SET_INITIAL_VALUES_NEW_ORDER = "SET_INITIAL_VALUES_NEW_ORDER";
export const EDIT_CUSTOMER_PROFILE = "EDIT_CUSTOMER_PROFILE";
export const DELETE_CUSTOMER_PROFILE = "DELETE_CUSTOMER_PROFILE";
export const GET_CUSTOMER_DETAILS = "GET_CUSTOMER_DETAILS";
export const CHECK_COUNTRY = "CHECK_COUNTRY";
export const TOGGLE_COUNTRY = "TOGGLE_COUNTRY";
export const SHOW_NEW_ORDER_GIFTS = "SHOW_NEW_ORDER_GIFTS";
export const TOGGLE_GIFT = "TOGGLE_GIFT";

//infobip
export const GET_INFOBIT_CUSTOMERS = "GET_INFOBIT_CUSTOMERS";
export const CHECK_CUSTOMER = "CHECK_CUSTOMER";
export const CHECK_ALL_CUSTOMERS = "CHECK_ALL_CUSTOMERS";
export const GET_INFOBIT_SCENARIOS = "GET_INFOBIT_SCENARIOS";
export const GET_INFOBIT_MESSAGES = "GET_INFOBIT_MESSAGES";
export const GET_INFOBIT_REPORT = "GET_INFOBIT_REPORT";

//customers bd const
export const GET_CUSTOMERS_BD = "GET_CUSTOMERS_BD";
export const GET_CUSTOMERS_BAZA = "GET_CUSTOMERS_BAZA"
export const GET_PRECOMPUTED_CUSTOMERS_BAZA = "GET_PRECOMPUTED_CUSTOMERS_BAZA"

//discounts const
export const GET_DISCOUNTS = "GET_DISCOUNTS";
export const GET_DISCOUNT_DETAILS = "GET_DISCOUNT_DETAILS";
export const CREATE_NEW_DISCOUNT = "CREATE_NEW_DISCOUNT";
export const SET_INITIAL_VALUES_DISCOUNT = "SET_INITIAL_VALUES_DISCOUNT";
export const EDIT_DISCOUNT = "EDIT_DISCOUNT";
export const DELETE_DISCOUNT = "DELETE_DISCOUNT";
export const GET_DISCOUNTSS = "GET_DISCOUNTSS"

//therapies const
export const GET_THERAPIES = "GET_THERAPIES";
export const CREATE_NEW_THERAPY = "CREATE_NEW_THERAPY";
export const SET_INITIAL_VALUES_THERAPY = "SET_INITIAL_VALUES_THERAPY";
export const EDIT_THERAPY = "EDIT_THERAPY";
export const DELETE_THERAPY = "DELETE_THERAPY";

//localstorage const
export const GET_LOCAL_STORAGE_VERSION = "GET_LOCAL_STORAGE_VERSION";

//currencies const
export const GET_CURRENCIES = "GET_CURRENCIES";
export const CREATE_NEW_CURRENCY = "CREATE_NEW_CURRENCY";
export const SET_INITIAL_VALUES_CURRENCY = "SET_INITIAL_VALUES_CURRENCY";
export const EDIT_CURRENCY = "EDIT_CURRENCY";
export const DELETE_CURRENCY = "DELETE_CURRENCY";

//influencers const
export const GET_INFLUENCERS = "GET_INFLUENCERS";
export const CREATE_NEW_INFLUENCER = "CREATE_NEW_INFLUENCER";
export const SET_INITIAL_VALUES_INFLUENCER = "SET_INITIAL_VALUES_INFLUENCER";
export const EDIT_INFLUENCER = "EDIT_INFLUENCER";
export const DELETE_INFLUENCER = "DELETE_INFLUENCER";
export const GET_INFLUENCER_DETAILS = "GET_INFLUENCER_DETAILS";
export const SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER = "SET_INITIAL_VALUES_INFLUENCER_NEW_ORDER";
export const DELETE_FROM_ACCESSORIES_INFLUENCER = "DELETE_FROM_ACCESSORIES_INFLUENCER";
export const CLEAR_ACC_INFLUENCER = "CLEAR_ACC_INFLUENCER";
export const CLEAR_THERAPY_INFLUENCER = "CLEAR_THERAPY_INFLUENCER";
export const DELETE_FROM_THERAPIES_INFLUENCER = "DELETE_FROM_THERAPIES_INFLUENCER";

//payment_methods const
export const GET_PAYMENT_METHODS = "GET_PAYMENT_METHODS";
export const CREATE_NEW_PAYMENT_METHOD = "CREATE_NEW_PAYMENT_METHOD";
export const SET_INITIAL_VALUES_PAYMENT_METHOD = "SET_INITIAL_VALUES_PAYMENT_METHOD";
export const EDIT_PAYMENT_METHOD = "EDIT_PAYMENT_METHOD";
export const DELETE_PAYMENT_METHOD = "DELETE_PAYMENT_METHOD";
export const UPDATE_PAYMENT_METHOD_PICTURE = "UPDATE_PAYMENT_METHOD_PICTURE";

//delivery_methods const
export const GET_DELIVERY_METHODS = "GET_DELIVERY_METHODS";
export const CREATE_NEW_DELIVERY_METHOD = "CREATE_NEW_DELIVERY_METHOD";
export const SET_INITIAL_VALUES_DELIVERY_METHOD = "SET_INITIAL_VALUES_DELIVERY_METHOD";
export const EDIT_DELIVERY_METHOD = "EDIT_DELIVERY_METHOD";
export const DELETE_DELIVERY_METHOD = "DELETE_DELIVERY_METHOD";

//utm const
export const GET_UTMS = "GET_UTMS";
export const CREATE_NEW_UTM = "CREATE_NEW_UTM";
export const SET_INITIAL_VALUES_UTM = "SET_INITIAL_VALUES_UTM";
export const EDIT_UTM = "EDIT_UTM";
export const DELETE_UTM = "DELETE_UTM";
export const GET_UTM_EXPENSE_REPORTS_1 = "GET_UTM_EXPENSE_REPORTS_1";

//blogpost const
export const GET_BLOG_POSTS = "GET_BLOG_POSTS";
export const GET_BLOG_POSTS_ALL = "GET_BLOG_POSTS_ALL";
export const CREATE_BLOG_POST = "CREATE_BLOG_POST";
export const SET_INITIAL_VALUES_BLOG_POST = "SET_INITIAL_VALUES_BLOG_POST";
export const EDIT_BLOG_POST = "EDIT_BLOG_POST";
export const DELETE_BLOG_POST = "DELETE_BLOG_POST";
export const GET_BLOG_CATEGORIES = "GET_BLOG_CATEGORIES";

//blog categories const
export const CREATE_BLOG_CATEGORY = "CREATE_BLOG_CATEGORY";
export const SET_INITIAL_VALUES_BLOG_CATEGORY = "SET_INITIAL_VALUES_BLOG_CATEGORY";
export const EDIT_BLOG_CATEGORY = "EDIT_BLOG_CATEGORY";
export const DELETE_BLOG_CATEGORY = "DELETE_BLOG_CATEGORY";

//message templates const
export const GET_MESSAGE_TEMPLATES = "GET_MESSAGE_TEMPLATES";
export const CREATE_NEW_MESSAGE_TEMPLATE = "CREATE_NEW_MESSAGE_TEMPLATE";
export const SET_INITIAL_VALUES_MESSAGE_TEMPLATE = "SET_INITIAL_VALUES_MESSAGE_TEMPLATE";
export const EDIT_MESSAGE_TEMPLATE = "EDIT_MESSAGE_TEMPLATE";
export const DELETE_MESSAGE_TEMPLATE = "DELETE_MESSAGE_TEMPLATE";

//instagram_feed const
export const GET_INSTAGRAM_FEEDS = "GET_INSTAGRAM_FEEDS";
export const NEW_INSTAGRAM_FEED = "NEW_INSTAGRAM_FEED";
export const SET_INITIAL_VALUES_INSTAGRAM_FEED = "SET_INITIAL_VALUES_INSTAGRAM_FEED";
export const EDIT_INSTAGRAM_FEED = "EDIT_INSTAGRAM_FEED";
export const DELETE_INSTAGRAM_FEED = "DELETE_INSTAGRAM_FEED";

//products const
export const GET_PRODUCTS = "GET_PRODUCTS";
export const CREATE_NEW_PRODUCT = "CREATE_NEW_PRODUCT";
export const SET_INITIAL_VALUES_PRODUCT = "SET_INITIAL_VALUES_PRODUCT";
export const SET_INITIAL_VALUES_PRODUCT_STOCK = "SET_INITIAL_VALUES_PRODUCT_STOCK";
export const EDIT_PRODUCT = "EDIT_PRODUCT";
export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const UPDATE_PRODUCT_PICTURE = "UPDATE_PRODUCT_PICTURE";
export const GET_REVIEWS = "GET_REVIEWS";
export const SET_INITIAL_VALUES_REVIEW = "SET_INITIAL_VALUES_REVIEW";

//order statuses const
export const GET_ORDER_STATUSES = "GET_ORDER_STATUSES";
export const CREATE_ORDER_STATUS = "CREATE_ORDER_STATUS";
export const SET_INITIAL_VALUES_ORDER_STATUS = "SET_INITIAL_VALUES_ORDER_STATUS";
export const EDIT_ORDER_STATUS = "EDIT_ORDER_STATUS";
export const DELETE_ORDER_STATUS = "DELETE_ORDER_STATUS";

//admins const
export const GET_ADMINS = "GET_ADMINS";
export const CREATE_ADMIN = "CREATE_ADMIN";
export const SET_INITIAL_VALUES_ADMIN = "SET_INITIAL_VALUES_ADMIN";
export const EDIT_ADMIN = "EDIT_ADMIN";
export const DELETE_ADMIN = "DELETE_ADMIN";

//user groups const
export const GET_USER_GROUPS = "GET_USER_GROUPS";
export const CREATE_NEW_USER_GROUP = "CREATE_NEW_USER_GROUP";
export const SET_INITIAL_VALUES_USER_GROUP = "SET_INITIAL_VALUES_USER_GROUP";
export const EDIT_USER_GROUP = "EDIT_USER_GROUP";
export const DELETE_USER_GROUP = "EDIT_USER_GROUP";

//top image bar const
export const GET_TOP_IMAGE_BAR = "GET_TOP_IMAGE_BAR";
export const CREATE_TOP_IMAGE_BAR = "CREATE_TOP_IMAGE_BAR";
export const SET_INITIAL_VALUES_TOP_IMAGE_BAR = "SET_INITIAL_VALUES_TOP_IMAGE_BAR";
export const EDIT_TOP_IMAGE_BAR = "EDIT_TOP_IMAGE_BAR";
export const DELETE_TOP_IMAGE_BAR = "DELETE_TOP_IMAGE_BAR";

//languages const
export const GET_COUNTRIES = "GET_COUNTRIES";
export const SET_LANGUAGE = "SET_LANGUAGE";
export const GET_LANGUAGE = "GET_LANGUAGE";
export const ADD_LANGUAGE = "ADD_LANGUAGE";
export const GET_LANGUAGES_ALL = "GET_LANGUAGES_ALL";
export const GET_OTOM_LANGS = "GET_OTOM_LANGS";
export const ADD_OTOM_LANGS = "ADD_OTOM_LANGS";
export const EDIT_OTOM_LANGS = "EDIT_OTOM_LANGS";
export const REMOVE_OTOM_LANGS = "REMOVE_OTOM_LANGS";
export const SET_LOCAL_COUNTRIES = "SET_LOCAL_COUNTRIES";
export const CHANGE_ACTIVE_COUNTRY = "CHANGE_ACTIVE_COUNTRY";
export const GET_COUNTRIES_AFTER = "GET_COUNTRIES_AFTER";
export const GET_COUNTRIES_LIST = "GET_COUNTRIES_LIST";
export const INITIAL_COUNTRY = "INITIAL_COUNTRY"
export const ADD_COUNTRY = "ADD_COUNTRY";
export const DELETE_COUNTRY = "DELETE_COUNTRY";
export const GET_LANGUAGES = "GET_LANGUAGES";

//orders dashboard const
export const GET_ORDERS_DASHBOARD = "GET_ORDERS_DASHBOARD";
export const CHECK_ORDER = "CHECK_ORDER";
export const CHECK_ALL_ORDERS = "CHECK_ALL_ORDERS";
export const CLEAR_SELECTED_ORDERS = "CLEAR_SELECTED_ORDERS";
export const SHOW_COLORS = "SHOW_COLORS";
export const ADD_COLOR = "ADD_COLOR";
export const CHANGE_SELECTED_ORDERS = "CHANGE_SELECTED_ORDERS";
export const CHECK_COUNTRY_DASHBOARD = "CHECK_COUNTRY_DASHBOARD";
export const TOGGLE_COUNTRY_DASHBOARD = "TOGGLE_COUNTRY_DASHBOARD";

//colors dashboard const
export const GET_COLOR_DASHBOARD = "GET_COLOR_DASHBOARD";

//colors const
export const GET_COLORS = "GET_COLORS";
export const CREATE_COLOR = "CREATE_COLOR";
export const DELETE_COLOR = "CREATE_COLOR";

//oto mails const
export const GET_OTO_MAILS = "GET_OTO_MAILS";
export const CREATE_OTO_MAIL = "CREATE_OTO_MAIL";
export const SET_INITIAL_VALUES_OTO_MAIL = "SET_INITIAL_VALUES_OTO_MAIL";
export const EDIT_OTO_MAIL = "EDIT_OTO_MAIL";
export const DELETE_OTO_MAIL = "DELETE_OTO_MAIL";
export const ADD_NEW_OTO_DISCOUNT = "ADD_NEW_OTO_DISCOUNT";
export const GET_DISCOUNTS_FOR_OTOMS = "GET_DISCOUNTS_FOR_OTOMS";

//order details const
export const GET_ORDER_DETAILS = "GET_ORDER_DETAILS";
export const CREATE_NEW_COMMENT = "CREATE_NEW_COMMENT";
export const DELETE_COMMENT = "DELETE_COMMENT";
export const CLEAR_THERAPY = "CLEAR_THERAPY";
export const CLEAR_ACC = "CLEAR_ACC";
export const DELETE_FROM_ACCESSORIES = "DELETE_FROM_ACCESSORIES";
export const DELETE_FROM_THERAPIES = "DELETE_FROM_THERAPIES";
export const ADD_NEW_ORDER = "ADD_NEW_ORDER";
export const ADD_AGENT_TO_ORDER = "ADD_AGENT_TO_ORDER";
export const SHOW_COLORS_EDIT = "SHOW_COLORS_EDIT";
export const DELETE_THERAPY_EDIT = "DELETE_THERAPY_EDIT";
export const EDIT_THERAPIES = "EDIT_THERAPIES";
export const EDIT_ORDER_INFO = "EDIT_ORDER_INFO";
export const SHOW_THERAPIES_UPSALE = "SHOW_THERAPIES_UPSALE";
export const ADD_DISCOUNT = "ADD_DISCOUNT";
export const CALLING = "CALLING";
export const CLEAR_THERAPY_EDIT = "CLEAR_THERAPY_EDIT";
export const GET_DATA_FOR_LANGUAGE = "GET_DATA_FOR_LANGUAGE";
export const ADD_NEW_EXPENSE = "ADD_NEW_EXPENSE";
export const OPEN_NEW_EXPENSE = "OPEN_NEW_EXPENSE";
export const OPEN_EDIT_EXPENSE  = "OPEN_EDIT_EXPENSE";
export const EDIT_EXPENSE  = "EDIT_EXPENSE";
export const HISTORY_EXPENSE  = "HISTORY_EXPENSE";
export const CHANGE_THERAPY_QUANTITY = "CHANGE_THERAPY_QUANTITY";
export const CHANGE_ACCESSORY_QUANTITY = "CHANGE_ACCESSORY_QUANTITY";
export const NEW_ORDER = "NEW_ORDER";
export const END_VCC_CALL = "END_VCC_CALL";
export const ADD_OCCUPIED_ORDER = "ADD_OCCUPIED_ORDER";
export const REMOVE_OCCUPIED_ORDER = "REMOVE_OCCUPIED_ORDER";
export const DELETE_ORDER_ACCESSORY = "DELETE_ORDER_ACCESSORY";
export const COMMON_ERROR = "Prišlo je do napake, prosim poskusite kasneje.";
export const ERROR_COUNTRY = "Napačna država v VCC";
export const SUCCESS_CALLING = "Preklopite na VCC, vaš klic se je začel.";
export const ERROR_TELEPHONE = "Telefonska št. ni v pravilnem formatu.";
export const SET_INITIAL_VALUES_NEW_ORDER_THERAPIES = "SET_INITIAL_VALUES_NEW_ORDER_THERAPIES";
export const IS_ACCESSORY_GIFT = "IS_ACCESSORY_GIFT";
export const ACCESSORY_OPTION = "ACCESSORY_OPTION";

//statistics const
export const GET_DAILY_STATISTICS = "GET_DAILY_STATISTICS";
export const GET_DAILY_INCOME_REPORT = "GET_DAILY_INCOME_REPORT";
export const GET_AGENT_STATISTICS = "GET_AGENT_STATISTICS";
export const GET_UTM_STATISTICS = "GET_UTM_STATISTICS";
export const GET_AGENT_ORDERS = "GET_AGENT_ORDERS";
export const CREATE_EXPENSE = "CREATE_EXPENSE";
export const GET_EXPENSES = "GET_EXPENSES";
export const TOGGLE_EXPENSE = "TOGGLE_EXPENSE";
export const CHANGED_UTM_FILTERS = "CHANGED_UTM_FILTERS";
export const CHANGED_UTM_FILTERS1 = "CHANGED_UTM_FILTERS1";
export const GET_MONTHLY_STATISTICS = "GET_MONTHLY_STATISTICS";
export const GET_ORDER_STATISTICS = "GET_ORDER_STATISTICS";
export const REPORT_DATA_PARAM = "REPORT_DATA_PARAM";


//sticky notes const
export const GET_STICKY_NOTES = "GET_STICKY_NOTES";
export const ADD_STICKY_NOTE = "ADD_STICKY_NOTE";
export const SET_INITIAL_VALUES_STICKY_NOTE = "SET_INITIAL_VALUES_STICKY_NOTE";
export const EDIT_STICKY_NOTE = "EDIT_STICKY_NOTE";
export const DELETE_STICKY_NOTE = "DELETE_STICKY_NOTE";

//testimonials const
export const GET_TESTIMONIALS = "GET_TESTIMONIALS";
export const ADD_TESTIMONIAL = "ADD_TESTIMONIAL";
export const SET_INITIAL_VALUES_TESTIMONIALS = "SET_INITIAL_VALUES_TESTIMONIALS";
export const EDIT_TESTIMONIAL = "EDIT_TESTIMONIAL";
export const DELETE_TESTIMONIAL = "DELETE_TESTIMONIAL";
export const DELETE_TESTIMONIAL_IMAGES = "DELETE_TESTIMONIAL_IMAGES";

//user testimonials
export const GET_USER_TESTIMONIALS = "GET_USER_TESTIMONIALS";
export const ADD_USER_TESTIMONIAL = "ADD_USER_TESTIMONIAL";
export const DELETE_USER_TESTIMONIAL = "DELETE_USER_TESTIMONIAL";
export const EDIT_USER_TESTIMONIAL = "EDIT_USER_TESTIMONIAL";

//gifts const
export const GET_GIFTS = "GET_GIFTS";
export const CREATE_GIFT = "CREATE_GIFT";
export const SET_INITIAL_VALUES_GIFT = "SET_INITIAL_VALUES_GIFT";
export const EDIT_GIFT = "EDIT_GIFT";
export const DELETE_GIFT = "DELETE_GIFT";
export const GET_GIFTS_FOR_ORDER = "GET_GIFTS_FOR_ORDER";
export const EDIT_ORDER_GIFTS = "EDIT_ORDER_GIFTS";
export const GET_GIFT_CONFIGURATOR = "GET_GIFT_CONFIGURATOR";
export const ADD_GIFT_CONFIGURATOR = "ADD_GIFT_CONFIGURATOR";
export const SET_INITIAL_VALUES_GIFT_CONFIGURATOR = "SET_INITIAL_VALUES_GIFT_CONFIGURATOR";
export const EDIT_GIFT_CONFIGURATOR = "EDIT_GIFT_CONFIGURATOR";
export const DELETE_GIFT_CONFIGURATOR = "DELETE_GIFT_CONFIGURATOR";

//accessories const
export const GET_ACCESSORIES = "GET_ACCESSORIES";
export const CREATE_ACCESSORY = "CREATE_ACCESSORY";
export const SET_INITIAL_VALUES_ACCESSORY = "SET_INITIAL_VALUES_ACCESSORY";
export const EDIT_ACCESSORY = "EDIT_ACCESSORY";
export const DELETE_ACCESSORY = "DELETE_ACCESSORY";
export const DELETE_ACCESSORY_IMAGES = "DELETE_ACCESSORY_IMAGES";

//badges const
export const GET_BADGES = "GET_BADGES";
export const CREATE_BADGE = "CREATE_BADGE";
export const SET_INITIAL_VALUES_BADGE = "SET_INITIAL_VALUES_BADGE";
export const EDIT_BADGE = "EDIT_BADGE";
export const DELETE_BADGE = "DELETE_BADGE";

//stock const
export const GET_STOCK_CHANGES = "GET_STOCK_CHANGES";
export const GET_ALL_STOCK_CHANGES = "GET_ALL_STOCK_CHANGES";
export const EDIT_PRODUCT_STOCK = "EDIT_PRODUCT_STOCK";
export const GET_STOCK_REMINDERS = "GET_STOCK_REMINDERS";
export const ADD_STOCK_REMINDER = "ADD_STOCK_REMINDER";
export const EDIT_STOCK_REMINDER = "EDIT_STOCK_REMINDER";
export const DELETE_STOCK_REMINDER = "DELETE_STOCK_REMINDER";

//socket const
export const SHARE_SOCKET_CONNECTION = "SHARE_SOCKET_CONNECTION";

//notifications const
export const GET_NOTIFICATIONS = "GET_NOTIFICATIONS";
export const PUSH_NOTIFICATION = "PUSH_NOTIFICATION";
export const MARK_AS_READ = "MARK_AS_READ";


export const CONNECT_USER = "CONNECT_USER";
export const DISCONNECT_USER = "DISCONNECT_USER";
export const GET_USERS = "GET_USERS";

export const GET_PRODUCT_CATEGORIES = "GET_PRODUCT_CATEGORIES";
export const CREATE_PRODUCT_CATEGORY = "CREATE_PRODUCT_CATEGORY"
export const SET_INITIAL_VALUES_PRODUCT_CATEGORY = "SET_INITIAL_VALUES_PRODUCT_CATEGORY"
export const EDIT_PRODUCT_CATEGORY = "EDIT_PRODUCT_CATEGORY";
export const DELETE_PRODUCT_CATEGORY = "DELETE_PRODUCT_CATEGORY"

export const GET_FILES = "GET_FILES";
export const CLOSE_FILES_MODAL = "CLOSE_FILES_MODAL";

//oto const
export const GET_OTOS = "GET_OTOS";
export const REMOVE_OTO = "REMOVE_OTO";
export const EDIT_OTO = "EDIT_OTO";

//mediums
export const GET_MEDIUMS = "GET_MEDIUMS";
export const NEW_MEDIUM = "NEW_MEDIUM";
export const EDIT_MEIDUM = "EDIT_MEDIUM";
export const DELETE_MEDIUM = "DELETE_MEDIUM";
export const SET_INITIAL_VALUES_MEDIUM = "SET_INITIAL_VALUES_MEDIUM";

export const CHAGE_EXCHANGE_COUNTRY = "CHAGE_EXCHANGE_COUNTRY";
export const TOGGLE_MENU = "TOGGLE_MENU"

export const CLEAR_THERAPY_EDIT_STORNO = "CLEAR_THERAPY_EDIT_STORNO"
export const CHANGE_THERAPY_QUANTITY_STORNO = "CHANGE_THERAPY_QUANTITY_STORNO";

export const routes = [
  { name: 'admin',
    routes: [
      {route: '/admin/admin/', method: 'GET'},
      {route: '/admin/admin/', method: 'POST'},
      {route: '/admin/admin/', method: 'PUT'},
      {route: '/admin/admin/', method: 'DELETE'},
      {route: '/admin/upload/', method: 'POST'}
    ]
  },
  { name: 'abandonedCartMail',
    routes: [
      {route: '/admin/acMail/', method: 'GET'},
      {route: '/admin/acMail/', method: 'POST'},
      {route: '/admin/acMail/', method: 'PUT'},
      {route: '/admin/acMail/', method: 'DELETE'}
    ]
  },
  { name: 'accessory',
    routes: [
      {route: '/admin/accessory/', method: 'GET'},
      {route: '/admin/accessory/', method: 'POST'},
      {route: '/admin/accessory/', method: 'PUT'},
      {route: '/admin/accessory/', method: 'DELETE'},
      {route: '/admin/accessory/images/', method: 'DELETE'}
    ]
  },
  { name: 'admingroup',
    routes: [
      {route: '/admin/admingroup/', method: 'GET'},
      {route: '/admin/admingroup/', method: 'POST'},
      {route: '/admin/admingroup/', method: 'PUT'},
      {route: '/admin/admingroup/', method: 'DELETE'}
    ]
  },
  { name: 'badge',
    routes: [
      {route: '/admin/badge/', method: 'GET'},
      {route: '/admin/badge/', method: 'POST'},
      {route: '/admin/badge/', method: 'PUT'},
      {route: '/admin/badge/', method: 'DELETE'}
    ]
  },
  { name: 'billboard',
    routes: [
      {route: '/admin/billboard/', method: 'GET'},
      {route: '/admin/billboard/active', method: 'GET'},
      {route: '/admin/billboard/', method: 'POST'},
      {route: '/admin/billboard/', method: 'PUT'},
      {route: '/admin/billboard/', method: 'DELETE'},
      {route: '/admin/billboard/image/', method: 'DELETE'}
    ]
  },
  { name: 'blogcategories',
    routes: [
      {route: '/admin/blogcategories/', method: 'GET'},
      {route: '/admin/blogcategories/', method: 'POST'},
      {route: '/admin/blogcategories/', method: 'PUT'},
      {route: '/admin/blogcategories/', method: 'DELETE'}
    ]
  },
  { name: 'blogpost',
    routes: [
      {route: '/admin/blogpost/', method: 'GET'},
      {route: '/admin/blogpost/', method: 'POST'},
      {route: '/admin/blogpost/', method: 'PUT'},
      {route: '/admin/blogpost/', method: 'DELETE'},
      {route: '/admin/blogpost/image/', method: 'DELETE'}
    ]
  },
  { name: 'category',
    routes: [
      {route: '/admin/category/', method: 'GET'},
      {route: '/admin/category/', method: 'POST'},
      {route: '/admin/category/', method: 'PUT'},
      {route: '/admin/category/', method: 'DELETE'}
    ]
  },
  { name: 'color',
    routes: [
      {route: '/admin/color/', method: 'GET'},
      {route: '/admin/color/', method: 'POST'},
      {route: '/admin/color/', method: 'PUT'},
      {route: '/admin/color/', method: 'DELETE'}
    ]
  },
  { name: 'country',
    routes: [
      {route: '/admin/country/', method: 'GET'},
      {route: '/admin/country/', method: 'POST'},
      {route: '/admin/country/', method: 'PUT'},
      {route: '/admin/country/', method: 'DELETE'}
    ]
  },
  { name: 'currency',
    routes: [
      {route: '/admin/currency/', method: 'GET'},
      {route: '/admin/currency/', method: 'POST'},
      {route: '/admin/currency/', method: 'PUT'},
      {route: '/admin/currency/', method: 'DELETE'}
    ]
  },
  { name: 'customer',
    routes: [
      {route: '/admin/customer/', method: 'GET'},
      {route: '/admin/customer/bd', method: 'GET'},
      {route: '/admin/customer/oto/', method: 'GET'},
      {route: '/admin/customer/baza1/', method: 'GET'},
      {route: '/admin/customer/baza2/', method: 'GET'},
      {route: '/admin/customer/baza3/', method: 'GET'},
      {route: '/admin/customer/baza4/', method: 'GET'},
      {route: '/admin/customer/bazap1/', method: 'GET'},
      {route: '/admin/customer/bazap2/', method: 'GET'},
      {route: '/admin/customer/bazap3/', method: 'GET'},
      {route: '/admin/customer/bazap4/', method: 'GET'},
      {route: '/admin/customer/details/', method: 'GET'},
      {route: '/admin/customer/', method: 'POST'},
      {route: '/admin/customer/', method: 'PUT'},
      {route: '/admin/customer/', method: 'DELETE'}
    ]
  },
  { name: 'deliverymethod',
    routes: [
      {route: '/admin/deliverymethod/', method: 'GET'},
      {route: '/admin/deliverymethod/', method: 'POST'},
      {route: '/admin/deliverymethod/', method: 'PUT'},
      {route: '/admin/deliverymethod/', method: 'DELETE'}
    ]
  },
  { name: 'discount',
    routes: [
      {route: '/admin/discount/', method: 'GET'},
      {route: '/admin/discount/', method: 'POST'},
      {route: '/admin/discount/name/', method: 'POST'},
      {route: '/admin/discount/', method: 'PUT'},
      {route: '/admin/discount/', method: 'DELETE'}
    ]
  },
  { name: 'expense',
    routes: [
      {route: '/admin/expense/', method: 'GET'},
      {route: '/admin/expense/fields/', method: 'GET'},
      {route: '/admin/expense/report', method: 'GET'},
      {route: '/admin/expense/reportincome', method: 'GET'},
      {route: '/admin/expense/report1', method: 'GET'},
      {route: '/admin/expense/history', method: 'GET'},
      {route: '/admin/expense/', method: 'POST'},
      {route: '/admin/expense/add/', method: 'POST'},
      {route: '/admin/expense/', method: 'PUT'},
      {route: '/admin/expense/', method: 'DELETE'},
      {route: '/admin/expense/remove/', method: 'DELETE'}
    ]
  },
  { name: 'gift',
    routes: [
      {route: '/admin/gift/', method: 'GET'},
      {route: '/admin/gift/', method: 'POST'},
      {route: '/admin/gift/', method: 'PUT'},
      {route: '/admin/gift/', method: 'DELETE'}
    ]
  },
  { name: 'influencers',
    routes: [
      {route: '/admin/influencers/', method: 'GET'},
      {route: '/admin/influencers/', method: 'POST'},
      {route: '/admin/influencers/payments/', method: 'POST'},
      {route: '/admin/influencers/order/', method: 'POST'},
      {route: '/admin/influencers/', method: 'PUT'},
      {route: '/admin/influencers/', method: 'DELETE'}
    ]
  },
  { name: 'landings',
    routes: [
      {route: '/admin/landings/', method: 'POST'}
    ]
  },
  { name: 'medium',
    routes: [
      {route: '/admin/medium/', method: 'GET'},
      {route: '/admin/medium/', method: 'POST'},
      {route: '/admin/medium/', method: 'PUT'},
      {route: '/admin/medium/', method: 'DELETE'},
      {route: '/admin/medium/images/', method: 'DELETE'}
    ]
  },
  { name: 'order',
    routes: [
      {route: '/admin/order/', method: 'GET'},
      {route: '/admin/order/details/', method: 'GET'},
      {route: '/admin/order/', method: 'POST'},
      {route: '/admin/order/status/', method: 'POST'},
      {route: '/admin/order/setAgent/', method: 'POST'},
      {route: '/admin/order/setColor/', method: 'POST'},
      {route: '/admin/order/invoice/', method: 'POST'},
      {route: '/admin/order/invoiceknjizara/', method: 'POST'},
      {route: '/admin/order/thankyou/', method: 'POST'},
      {route: '/admin/order/excel/', method: 'POST'},
      {route: '/admin/order/excelgls/', method: 'POST'},
      {route: '/admin/order/excelzasilkovna/', method: 'POST'},
      {route: '/admin/order/excelexpedico/', method: 'POST'},
      {route: '/admin/order/excelcustomlist/', method: 'POST'},
      {route: '/admin/order/exceltaxlist/', method: 'POST'},
      {route: '/admin/order/excelposta/', method: 'POST'},
      {route: '/admin/order/', method: 'PUT'},
      {route: '/admin/order/comments', method: 'PUT'},
      {route: '/admin/order/emails', method: 'PUT'},
      {route: '/admin/order/therapies', method: 'PUT'},
      {route: '/admin/order/', method: 'DELETE'},
      {route: '/admin/order/comments/', method: 'DELETE'},
      {route: '/admin/order/emails/', method: 'DELETE'},
      {route: '/admin/order/therapies/', method: 'DELETE'},
    ]
  },
  { name: 'orderstatus',
    routes: [
      {route: '/admin/orderstatus/', method: 'GET'},
      {route: '/admin/orderstatus/', method: 'POST'},
      {route: '/admin/orderstatus/', method: 'PUT'},
      {route: '/admin/orderstatus/', method: 'DELETE'}
    ]
  },
  { name: 'otom',
    routes: [
      {route: '/admin/otom/', method: 'GET'},
      {route: '/admin/otom/', method: 'POST'},
      {route: '/admin/otom/', method: 'PUT'},
      {route: '/admin/otom/', method: 'DELETE'}
    ]
  },
  { name: 'paymentmethod',
    routes: [
      {route: '/admin/paymentmethod/', method: 'GET'},
      {route: '/admin/paymentmethod/', method: 'POST'},
      {route: '/admin/paymentmethod/', method: 'PUT'},
      {route: '/admin/paymentmethod/', method: 'DELETE'},
      {route: '/admin/paymentmethod/image/', method: 'DELETE'}
    ]
  },
  { name: 'product',
    routes: [
      {route: '/admin/product/', method: 'GET'},
      {route: '/admin/product/stock/', method: 'GET'},
      {route: '/admin/product/stock', method: 'GET'},
      {route: '/admin/product/reviews', method: 'GET'},
      {route: '/admin/product/', method: 'POST'},
      {route: '/admin/product/', method: 'PUT'},
      {route: '/admin/product/reviews/', method: 'PUT'},
      {route: '/admin/product/stock/', method: 'PUT'},
      {route: '/admin/product/', method: 'DELETE'},
      {route: '/admin/product/image/', method: 'DELETE'},
      {route: '/admin/product/reviews/', method: 'DELETE'}
    ]
  },
  { name: 'smstemplate',
    routes: [
      {route: '/admin/smstemplate/', method: 'GET'},
      {route: '/admin/smstemplate/', method: 'POST'},
      {route: '/admin/smstemplate/', method: 'PUT'},
      {route: '/admin/smstemplate/', method: 'DELETE'}
    ]
  },
  { name: 'statistics',
    routes: [
      {route: '/admin/statistics/ordersIncomeStatistics', method: 'GET'},
      {route: '/admin/statistics/ordersCountStatistics', method: 'GET'},
      {route: '/admin/statistics/productsCountStatistics', method: 'GET'},
      {route: '/admin/statistics/utmStatistics', method: 'GET'},
      {route: '/admin/statistics/discountsUsageStatistics', method: 'GET'},
      {route: '/admin/statistics/ordersVisitorsRateStatistics', method: 'GET'},
      {route: '/admin/statistics/ordersUpsaleStatistics', method: 'GET'},
      {route: '/admin/statistics/vccStatistics', method: 'GET'},
      {route: '/admin/statistics/agentStatistics', method: 'GET'},
      {route: '/admin/statistics/filterAgentOrders', method: 'GET'},
      {route: '/admin/statistics/callCenterCountStatistics', method: 'GET'},
      {route: '/admin/statistics/callCenterProductsStatistics', method: 'GET'},
      {route: '/admin/statistics/callCenterIncomeStatistics', method: 'GET'},
      {route: '/admin/statistics/addExpenses/', method: 'POST'},
      {route: '/admin/statistics/addVisits/', method: 'POST'}
    ]
  },
  { name: 'stickynote',
    routes: [
      {route: '/admin/stickynote/', method: 'GET'},
      {route: '/admin/stickynote/', method: 'POST'},
      {route: '/admin/stickynote/', method: 'PUT'},
      {route: '/admin/stickynote/', method: 'DELETE'}
    ]
  },
  {
    name: 'stripe',
    routes: [
      {route: '/admin/stripe/', method: 'POST'},
      {route: '/admin/stripe/pay-difference', method: 'POST'}
    ]
  },
  { name: 'stockreminder',
    routes: [
      {route: '/admin/stockreminder/', method: 'GET'},
      {route: '/admin/stockreminder/', method: 'POST'},
      {route: '/admin/stockreminder/', method: 'PUT'},
      {route: '/admin/stockreminder/', method: 'DELETE'}
    ]
  },
  { name: 'testimonial',
    routes: [
      {route: '/admin/testimonial/', method: 'GET'},
      {route: '/admin/testimonial/', method: 'POST'},
      {route: '/admin/testimonial/', method: 'PUT'},
      {route: '/admin/testimonial/', method: 'DELETE'},
      {route: '/admin/testimonial/images/', method: 'DELETE'},
    ]
  },
  { name: 'user-testimonial',
    routes: [
      {route: '/admin/user-testimonial/', method: 'GET'},
      {route: '/admin/user-testimonial/', method: 'POST'},
      {route: '/admin/user-testimonial/', method: 'DELETE'},
      {route: '/admin/user-testimonial/', method: 'PUT'},
    ]
  },
  { name: 'therapy',
    routes: [
      {route: '/admin/therapy/', method: 'GET'},
      {route: '/admin/therapy/', method: 'POST'},
      {route: '/admin/therapy/', method: 'PUT'},
      {route: '/admin/therapy/', method: 'DELETE'},
      {route: '/admin/therapy/image/', method: 'DELETE'}
    ]
  },
  { name: 'utmmedium',
    routes: [
      {route: '/admin/utmmedium/', method: 'GET'},
      {route: '/admin/utmmedium/', method: 'POST'},
      {route: '/admin/utmmedium/', method: 'PUT'},
      {route: '/admin/utmmedium/', method: 'DELETE'}
    ]
  },
  { name: 'customers_oto',
    routes: [
      {route: '/admin/customer/oto', method: 'GET'},
      {route: '/admin/customer/oto', method: 'POST'},
      {route: '/admin/customer/oto', method: 'PUT'},
      {route: '/admin/customer/oto', method: 'DELETE'}
    ]
  },
  { name: 'oto',
    routes: [
      {route: '/admin/oto', method: 'GET'},
      {route: '/admin/oto', method: 'POST'},
      {route: '/admin/oto', method: 'PUT'},
      {route: '/admin/oto', method: 'DELETE'}
    ]
  }
];

export const pozivni = [
  {
      country: 'SI',
      num: '386'
  },
  {
      country: 'HR',
      num: '385'
  },
  {
      country: 'HU',
      num: '47'
  },
  {
      country: 'EU',
      num: ''
  },
  {
      country: 'CZ',
      num: '420'
  }
]

export const date_shortcuts = [
    {label: 'Danes', dateRange:[new Date(), new Date()]},
    {label: 'Včeraj', dateRange:[new Date(new Date().setDate(new Date().getDate() - 1)), new Date()]},
    {label: 'Zadnjih 7 dni', dateRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]},
    {label: 'Zadnjih 30 dni', dateRange: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()]},
    {label: 'Prejšni teden', dateRange: [new Date(new Date().setDate(new Date().getDate() - 14)), new Date(new Date().setDate(new Date().getDate() - 7))]},
    {label: 'Prejšni mesec', dateRange: [new Date(new Date().setDate(new Date().getDate() - 60)), new Date(new Date().setDate(new Date().getDate() - 30))]}
]

export const dateMax = new Date("2030-01-01");
