export const ROOT_URL =
  (process.env.NODE_ENV !== 'production' && 'http://localhost:3000') ||
  'https://E-Commerce.com'
export const API_URL =
  (process.env.NODE_ENV !== 'production' && 'http://localhost:4000') ||
  'https://E-Commerce.com'

export const GET_LANGUAGES = 'GET_LANGUAGES'
export const GET_INIT_DATA = 'GET_INIT_DATA'
export const ADD_TO_CART = 'ADD_TO_CART'
export const LOADING = 'LOADING'
export const GET_CART = 'GET_CART'
export const EDIT_QTY = 'EDIT_QTY'
export const REMOVE_THERAPY = 'REMOVE_THERAPY'
export const TOGGLE_DELIVERY = 'TOGGLE_DELIVERY'
export const TOGGLE_PAYMENT = 'TOGGLE_PAYMENT'
export const GET_ORDER = 'GET_ORDER'
export const UPDATE_CART = 'UPDATE_CART'
export const GET_ORDER_ID = 'GET_ORDER_ID'
export const INITIAL_SUBMITTED = 'INITIAL_SUBMITTED'
export const DISCOUNT_NOT_FOUND = 'DISCOUNT_NOT_FOUND'
export const GET_BLOG_POSTS = 'GET_BLOG_POSTS'
export const GET_BLOG_POST = 'GET_BLOG_POST'
export const GET_BLOG_CATEGORIES = 'GET_BLOG_CATEGORIES'
export const GET_INSTA = 'GET_INSTA'
export const OPEN_CART_MODAL = 'OPEN_CART_MODAL'
export const CLOSE_CART_MODAL = 'CLOSE_CART_MODAL'
export const OPEN_ACCESSORY_MODAL = 'OPEN_ACCESSORY_MODAL'
export const CLOSE_ACCESSORY_MODAL = 'CLOSE_ACCESSORY_MODAL'
export const SUBSCRIBE_TO_NEWSLETTER = 'SUBSCRIBE_TO_NEWSLETTER'
export const SET_ACTIVES = 'SET_ACTIVES'
export const OPEN_LANGUAGES = 'OPEN_LANGUAGES'
export const GET_BLOG_POSTS_HOME = 'GET_BLOG_POSTS_HOME'
export const GET_NEW_BLOG_POSTS = 'GET_NEW_BLOG_POSTS'
export const SUCCESS_REVIEW = 'SUCCESS_REVIEW'
export const ERROR_REVIEW = 'ERROR_REVIEW'
export const GET_REVIEWS = 'GET_REVIEWS'
export const ADD_SEND_BUTTON = 'ADD_SEND_BUTTON'
export const AKS_US_SUCCESS = 'AKS_US_SUCCESS'
export const UNSUBSCRIBE_INFOBIP = 'UNSUBSCRIBE_INFOBIP'
export const UNSUBSCRIBE_INFOBIP_ERROR = 'UNSUBSCRIBE_INFOBIP_ERROR'
export const CUSTOMER = 'CUSTOMER'

export const GET_OTO_DATA = 'GET_OTO_DATA'

export const COUNTRY_NUMBERS = [
  {
    country: 'SI',
    num: '386',
  },
  {
    country: 'HR',
    num: '385',
  },
  {
    country: 'HU',
    num: '36',
  },
  {
    country: 'GB',
    num: '44',
  },
  {
    country: 'SK',
    num: '421',
  },
  {
    country: 'CZ',
    num: '420'
  }
]

export const homePageRoute = '/home'
export const blogPostRoute = '/blog-post'
export const blogRoute = '/blog'
export const checkoutRoute = '/checkout'
export const successPageRoute = '/checkout-success'
export const productPageRoute = '/product-page'
export const ambasadorsRoute = '/all-ambasadors'
export const productsRoute = '/products'
export const kontaktPage = '/contact'
export const oNasPage = '/about-us'
export const ppPage = '/terms'
export const zpPage = '/private-cookies'
export const deliveryPage = '/delivery'
export const returnsPage = '/returns'
export const cartPage = '/cart'
export const htbPage = '/how_to_buy'
export const promoPage = '/promo_page'
export const promoPageFreeGifts = '/promo_page_free_gifts'
export const promoPageSimple = '/promo_page_simple'
export const freeLotion = '/free_lotion'
export const freeHandCream = '/free_hand_cream'
export const blackFridayPage = '/black_friday'
export const WinterSalePage = '/winter_sale'
export const CaviarSalePage = '/caviar_sale'
export const BackToSchoolPage = '/back_to_school'
export const EasterSalePage = '/easter_sale'
export const SummerSalePage = '/summer_sale'
export const valentinesDayPage = '/valentines_day'
export const womensDayPage = '/womens_day'
export const springDayPage = '/spring_day'
export const halloweenPage = '/halloween'
export const easterPage = '/easter'
export const mothersDayPage = '/mothers_day'
export const smsUnsubPage = '/sms_unsub'
export const page404 = '/page_404'
export const testersPage = '/testers'
export const faqPage = '/faq'
