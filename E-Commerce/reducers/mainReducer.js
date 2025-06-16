import {
    GET_LANGUAGES,
    GET_INIT_DATA,
    LOADING,
    TOGGLE_DELIVERY,
    TOGGLE_PAYMENT,
    GET_INSTA,
    SUBSCRIBE_TO_NEWSLETTER,
    OPEN_LANGUAGES,
    GET_REVIEWS,
    ADD_SEND_BUTTON,
    AKS_US_SUCCESS,
    UNSUBSCRIBE_INFOBIP,
    UNSUBSCRIBE_INFOBIP_ERROR
} from "../constants/constants.js";

const INITIAL_STATE = {
    therapiesToShow: {
        pattern_image: {},
        display_image: {}
    },
    countries: [],
    currency: {},
    delivery_methods: [],
    payment_methods: [],
    therapies: [],
    isLanguagesOpen: false,
    subscribe_result: {
        success: false,
        message: ""
    },
    unsubscribe_result: "",
    reviews: [],
    enableSendMessage: false,
    isSent: false,
    fixed: 2
};

export default function MainReducerFunction(state = INITIAL_STATE, action) {
    let nextState = state;
    switch (action.type) {
        case GET_INIT_DATA:
            let country = action.payload.country;
            let fixed = country === "hu" || country === "hr" ? 0 : 2
            nextState.fixed = fixed;
            break;
        case SUBSCRIBE_TO_NEWSLETTER:
            nextState.subscribe_result = {
                success: action.payload.response.data.success,
                message: action.payload.response.data.message
            }
            break;
        case UNSUBSCRIBE_INFOBIP:
            nextState.unsubscribe_result = "unsubscribed"
            break;

        case UNSUBSCRIBE_INFOBIP_ERROR:
            nextState.unsubscribe_result = "error"
            break;
        case ADD_SEND_BUTTON:
            nextState.enableSendMessage = true
            break;
        case OPEN_LANGUAGES:
            nextState.isLanguagesOpen = action.payload
            break;
        case GET_INSTA:
            nextState.instaCount = action.payload.counts.followed_by;
            break;
        case LOADING:
            if (action.payload == true) {
                nextState.isLoading = true
            } else {
                nextState.isLoading = false
            }
            break;

        case AKS_US_SUCCESS:
            nextState.enableSendMessage = false
            nextState.isSent = true;
            break;
        case GET_REVIEWS:
            nextState.reviews = action.payload.data;
            break;
        case TOGGLE_DELIVERY:
            var deliveries = nextState.delivery_methods;
            var delivery = deliveries.find(d => {
                return d.id == action.payload
            })
            delivery.checked = !delivery.checked
            var lastDeliveries = deliveries.filter(d => {
                return d.id != action.payload
            })
            lastDeliveries = lastDeliveries.map(d => {
                return d.checked = false
            })
            nextState.delivery_methods = deliveries;
            break;
        case TOGGLE_PAYMENT:
            var payments = nextState.payment_methods;
            var payment = payments.find(d => {
                return d.id == action.payload
            })
            payment.checked = !payment.checked
            var lastPayments = payments.filter(d => {
                return d.id != action.payload
            })
            lastPayments = lastPayments.map(d => {
                return d.checked = false
            })
            nextState.payment_methods = payments;
            break;
        case GET_LANGUAGES:
            var backLanguages = modules;
            nextState.header = backLanguages.find(l => {
                return l.name == 'header'
            })
            nextState.home_top = backLanguages.find(l => {
                return l.name == 'home_top'
            })
            nextState.home_bottom = backLanguages.find(l => {
                return l.name == 'home_bottom'
            })
            nextState.footer = backLanguages.find(l => {
                return l.name == 'footer'
            })
            nextState.choose_language = backLanguages.find(l => {
                return l.name == 'choose_language'
            })
            nextState.language = action.payload.languageModules;
            nextState.lang = action.payload.language
            break;
    }
    return {...state, ...nextState};
}
