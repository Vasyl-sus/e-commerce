import { GET_LANGUAGE, GET_INIT_DATA, LOADING, TOGGLE_DELIVERY, TOGGLE_PAYMENT, SET_LANGUAGE, GET_LANGUAGES_ALL, ADD_LANGUAGE, SET_SUB_LANGUAGE, SET_T_LANGUAGE } from "../config/constants.js";

const INITIAL_STATE = {language: {
		header_footer: [],
		product: [],
		home: [],
		terms: [],
		blog: [],
		breadcrumbs: [],
    allLanguages: [],
	}, langFields: [], selectedLang: []};

export default function (state = INITIAL_STATE, action) {
	let nextState = state;
	switch(action.type) {
		case GET_LANGUAGE:
			var backLanguages = action.payload.results;
      nextState.language.header_footer = backLanguages.filter(l => {
        return l.category == 'header_footer'
      })
      nextState.language.home = backLanguages.filter(l => {
        return l.category == 'home'
      })
      nextState.language.cream = backLanguages.filter(l => {
        return l.real_name == 'cream'
      })
      nextState.language.tattoo = backLanguages.filter(l => {
        return l.real_name == 'tattoo'
      })
			nextState.language.caviar = backLanguages.filter(l => {
				return l.real_name == 'caviar'
			})
			nextState.language.aqua = backLanguages.filter(l => {
				return l.real_name == 'aqua'
			})
			nextState.language.royal = backLanguages.filter(l => {
				return l.real_name == 'royal'
			})
      nextState.language.eyelash = backLanguages.filter(l => {
        return l.real_name == 'eyelash'
      })
			nextState.language.lotion = backLanguages.filter(l => {
				return l.real_name == 'lotion'
			})
			nextState.language.procollagen = backLanguages.filter(l => {
				return l.real_name == 'procollagen'
			})
      nextState.language.blog = backLanguages.filter(l => {
        return l.category == 'blog'
      })
      nextState.language.terms = backLanguages.filter(l => {
        return l.category == 'terms'
      })
      nextState.language.breadcrumbs = backLanguages.filter(l => {
        return l.category == 'breadcrumbs'
      })
      nextState.language.ambassadors = backLanguages.filter(l => {
        return l.category == 'ambasadors'
      })
      nextState.language.testers = backLanguages.filter(l => {
        return l.category == 'testers'
      })
      nextState.language.checkout = backLanguages.filter(l => {
        return l.category == 'checkout'
      })
      nextState.language.checkout_oto = backLanguages.filter(l => {
        return l.name == 'checkout_oto'
      })
      nextState.language.main = backLanguages.filter(l => {
        return l.name == 'main'
      })
      nextState.language.mail = backLanguages.filter(l => {
        return l.category == 'mail'
      })
			nextState.language.mail_sent = backLanguages.filter(l => {
        return l.name == 'mail_sent'
      })
      nextState.language.mail_canceled = backLanguages.filter(l => {
        return l.name == 'mail_canceled'
      })
      nextState.language.mail_delivered = backLanguages.filter(l => {
        return l.name == 'mail_delivered'
      })
      nextState.language.mail_before_delivered = backLanguages.filter(l => {
        return l.name == 'mail_before_delivered'
      })
      nextState.language.question_mail = backLanguages.filter(l => {
        return l.name == 'question_mail'
      })
      nextState.language.routes = backLanguages.filter(l => {
        return l.name == 'routes_data'
      })
      nextState.language.meta_data = backLanguages.filter(l => {
        return l.name == 'meta_data'
      })
      nextState.language.mail_complete = backLanguages.filter(l => {
        return l.name == 'mail_complete'
      })
      nextState.language.meta_data = backLanguages.filter(l => {
        return l.name == 'meta_data'
      })
      nextState.language.private_cookies = backLanguages.filter(l => {
        return l.name == 'private_cookies'
      })
      nextState.language.delivery = backLanguages.filter(l => {
        return l.name == 'delivery'
      })
      nextState.language.returns = backLanguages.filter(l => {
        return l.name == 'returns'
      })
      nextState.language.faq = backLanguages.filter(l => {
        return l.name == 'faq'
      })
      nextState.language.how_to_buy = backLanguages.filter(l => {
        return l.name == 'how_to_buy'
      })
			nextState.language.valentines_day = backLanguages.filter(l => {
				return l.name == 'valentines_day'
			})
			nextState.language.black_friday = backLanguages.filter(l => {
				return l.name == 'black_friday'
			})
			// console.log(nextState.language.product)
		break;
    case SET_LANGUAGE:
      var lang = action.payload.lang;
			var flag = action.payload.flag
			console.log(nextState.language)
			var fields = {};
			if (!flag) {
				var language = nextState.language[lang];
				language.map((l) => {
					for (var i in l.data) {
						if (l.data[i].name) {
							fields[l.data[i].name] = l.data[i].value
						} else {
							fields['datas'] = l.data[i]
						}
					}
				})
			} else {
				var language = nextState.language.product.filter(p => {
					return p.name == lang
				});
				language.map((l) => {
					for (var i in l.data) {
						if (l.data[i].name) {
							fields[l.data[i].name] = l.data[i].value
						} else {
							fields['datas'] = l.data[i]
						}
					}
				})
			}
      nextState.langFields = fields
      nextState.selectedLang = language;
    break;
		case SET_SUB_LANGUAGE:
      var lang = action.payload.lang;
			var name = action.payload.name

			var fields = {};
			var language = nextState.language[name].filter(l => {
				return l.section == lang
			});
			language.map((l) => {
				for (var i in l.data) {
					if (l.data[i].name) {
						fields[l.data[i].name] = l.data[i].value
					} else {
						fields['datas'] = l.data[i]
					}
				}
			})
      nextState.langFields = fields
      nextState.selectedLang = language;
		break;
		case SET_T_LANGUAGE:
      var lang = action.payload.lang;
			var name = action.payload.name
			console.log(lang, name)
			var fields = {};
			var language = nextState.language[name].filter(l => {
				return l.name == lang
			});
			language.map((l) => {
				for (var i in l.data) {
					if (l.data[i].name) {
						fields[l.data[i].name] = l.data[i].value
					} else {
						fields['datas'] = l.data[i]
					}
				}
			})
			console.log(lang, name, language, fields)
      nextState.langFields = fields
      nextState.selectedLang = language;
    break;
		case GET_LANGUAGES_ALL:
			nextState.allLanguages = action.payload.languages;

			var languages = [];
			var l = Object.keys(action.payload.languages);

			for(var i=0; i<l.length; i++) {
				var obj = {};
				obj.label = l[i] + ' - ' + action.payload.languages[l[i]];
				obj.value = l[i];
				languages.push(obj)
			}

			nextState.languages = languages;
		break;

		case ADD_LANGUAGE:
			var obj = {};
			obj.label = action.payload.language + ' - ' + action.payload.languageName;
			obj.value = action.payload.language;
			nextState.languages.push(obj);
		break;

	}
	return {...state, ...nextState};
}
