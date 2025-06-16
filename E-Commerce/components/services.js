export function getQueryVariable (variable, url) {
    var query = url;
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

export function getURLParam(key,target){
    var values = [];
    if (!target) target = location.href;

    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

    var pattern = key + '=([^&#]+)';
    var o_reg = new RegExp(pattern,'ig');
    while (true){
        var matches = o_reg.exec(target);
        if (matches && matches[1]){
            values.push(matches[1]);
        } else {
            break;
        }
    }

    if (!values.length){
        return null;
    } else {
        return values.length == 1 ? values[0] : values;
    }
}

export function youtube_parser(url) {
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}

export function validatePhoneNumber (num) {
  var regex = /^[\+]?[0-9]{2}[\s\.]?[0-9]{3}[-\s\.]?[0-9]{3}$/im
  if (num)
    return regex.test(num)
}

export function rounder (value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals).toFixed(2);
}

export function groupTherapies(therapies, type) {
	var types = [];

	therapies.map(t => {
		var founded = types.find(tt => {
			return tt == t[type]
		})
		if (!founded) {
			types.push(t[type])
		}
	})

	return types
}

export const parseLanguageModules = modules => {
  let INITIAL_STATE = {
  		header: {
  			data: {
  			  img1h: {},
  				top_p_1: {},
  				top_p_2: {},
  				top_p_3: {},
  				top_p_4: {},
  				nav_1: {},
  				nav_2: {},
  				nav_3: {},
  				nav_4: {},
          nav_5: {}
  			}
      },
      stripeCodes: {},
  		home_bottom: {
  			data: {
  				banner_pic: {},
  				news_h2: {},
  				news_btn: {}
  			}
  		},
  		footer: {
  			data: {
  				first_footer_title: {},
  				first_footer_one: {},
  				first_footer_two: {},
  				first_footer_three: {},
  				second_footer_title: {},
  				second_footer_one: {},
  				second_footer_two: {},
  				third_footer_title: {},
  				third_footer_one: {},
  				logo: {},
  				img_cert: {},
  				img_fb: {},
  				img_ig: {},
  				img_yt: {},
  				bottom_text: {}
  			}
  		}
  	};

    let nextState = INITIAL_STATE


    var backLanguages = modules;
    nextState.header = backLanguages.find(l => {
      return l.name == 'header'
    })
    nextState.blog = backLanguages.find(l => {
      return l.name == 'blog'
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
    nextState.product = backLanguages.filter(l => {
      return l.category == 'product_page'
    })
    nextState.main = backLanguages.find(l => {
      return l.name == 'main'
    })
    nextState.terms = backLanguages.find(l => {
      return l.name == 'terms'
    })
    nextState.about_us = backLanguages.find(l => {
      return l.name == 'about_us'
    })
    nextState.contact = backLanguages.find(l => {
      return l.name == 'contact'
    })
    nextState.private_cookies = backLanguages.find(l => {
      return l.name == 'private_cookies'
    })
    nextState.ambasadors = backLanguages.find(l => {
      return l.name == 'ambasadors'
    })
    nextState.checkout = backLanguages.find(l => {
      return l.name == 'checkout'
    })
    nextState.checkout_oto = backLanguages.find(l => {
      return l.name == 'checkout_oto'
    })
    nextState.testers = backLanguages.find(l => {
      return l.name == 'testers'
    })
    nextState.tester_categories = backLanguages.filter(l => {
      return l.category == 'testers' && l.name != 'testers'
    })
    nextState.meta_data = backLanguages.find(l => {
      return l.name == 'meta_data'
    })
    nextState.choose_language = backLanguages.find(l => {
      return l.name == 'choose_language'
    })
    nextState.delivery = backLanguages.find(l => {
      return l.name == 'delivery'
    })
    nextState.payment = backLanguages.find(l => {
      return l.name == 'payment'
    })
    nextState.returns = backLanguages.find(l => {
      return l.name == 'returns'
    })
    nextState.accessories_page = backLanguages.find(l => {
      return l.name == 'accessories-page'
    })
    nextState.faq = backLanguages.find(l => {
      return l.name == 'faq'
    })
    nextState.how_to_buy = backLanguages.find(l => {
      return l.name == 'how_to_buy'
    })
    nextState.promo_page = backLanguages.find(l => {
      return l.name == 'promo_page'
    })
    nextState.promo_page_free_gifts = backLanguages.find(l => {
      return l.name == 'promo_page_free_gifts'
    })
    nextState.promo_page_simple = backLanguages.find(l => {
      return l.name == 'promo_page_simple'
    })
    nextState.free_lotion = backLanguages.find(l => {
      return l.name == 'free_lotion'
    })
    nextState.free_hand_cream = backLanguages.find(l => {
      return l.name == 'free_hand_cream'
    })
    nextState.black_friday = backLanguages.find(l => {
      return l.name == 'black_friday'
    })
    nextState.winter_sale = backLanguages.find(l => {
      return l.name == 'winter_sale'
    })
    nextState.caviar_sale = backLanguages.find(l => {
      return l.name == 'caviar_sale'
    })
    nextState.back_to_school = backLanguages.find(l => {
      return l.name == 'back_to_school'
    })
    nextState.easter_sale = backLanguages.find(l => {
      return l.name == 'easter_sale'
    })
    nextState.summer_sale = backLanguages.find(l => {
      return l.name == 'summer_sale'
    })
    nextState.valentines_day = backLanguages.find(l => {
      return l.name == 'valentines_day'
    })
    nextState.womens_day = backLanguages.find(l => {
      return l.name == 'womens_day'
    })
    nextState.spring_day = backLanguages.find(l => {
      return l.name == 'spring_day'
    })
    nextState.halloween = backLanguages.find(l => {
      return l.name == 'halloween'
    })
    nextState.easter = backLanguages.find(l => {
      return l.name == 'easter'
    })
    nextState.mothers_day = backLanguages.find(l => {
      return l.name == 'mothers_day'
    })
    nextState.sms_unsub = backLanguages.find(l => {
      return l.name == 'sms_unsub'
    })
    nextState.page404 = backLanguages.find(l => {
      return l.name == 'page404'
    })
    nextState.stripeCodes = backLanguages.find(l => {
      return l.name == 'stripe_codes'
    })

    return nextState
}

export function addToDataLayer(event, data, listname) {
  switch (event) {
    case "removeFromCart":
      window.dataLayer.push({
        "event":"removeFromCart",
          "ecommerce": {
            "remove": {
              "products": data.therapies
          }
        }
      })
    break;
    case "addToCart":
      window.dataLayer.push({
        "event":"addToCart",
          "ecommerce": {
            "currencyCode": data.currencycode,
            "add": {
              "products": data.therapies
          }
        },
        "custom_data": {
          "product_name": data.productname,
          "product_id": data.productid,
          "product_price": data.productprice,
          "product_quantity": data.productquantity,
          "addToCartValue": data.valueOfProduct,
          "currency": data.currencycode
        }
      })
      window.dataLayer.push({
        "event":"add_to_cart",
          "ecommerce": {
            "currency":data.currencycode,
            "value": data.valueOfProduct,
            "items": data.therapiesGA4
        }
      })
    break;
    case "viewCart":
      window.dataLayer.push({
        "event":"view_cart",
          "ecommerce": {
            "items": data.therapiesGA4
        }
      })
    break;
    case "EEproductClick":
      window.dataLayer.push({
        "event":"EEproductClick",
          "ecommerce": {
            "currencyCode": data.currencycode,
            "click": {
              "actionField": {"list": listname},
              "products": data.therapies
          }
        }
      })
      window.dataLayer.push({
        "event":"select_item",
          "ecommerce": {
              "items": data.therapiesGA4
          }
      })
    break;
    case "EEproductImpression":
      window.dataLayer.push({
        "event":"EEproductImpression",
          "ecommerce": {
            "currencyCode": data.currencycode,
            "impressions": {
              "products": data.therapies
          },
          "detail": {
            "actionField": {"list": listname},
            "products": data.therapies
          }
        }
      }),
      window.dataLayer.push({
        "event":"view_item_list",
          "ecommerce": {
            "items": data.therapiesGA4,
        }
      })
    break;
    case "EEcheckout":
      window.dataLayer.push({
        "event":"EEcheckout",
        "ecommerce": {
          "currencyCode": data.currencycode,
          "checkout": {
            "actionField": {"step": data.step},
            "products": data.therapies
          }
        }
      }),
      window.dataLayer.push({
        "event":"begin_checkout",
        "ecommerce": {
          "items": data.therapiesGA4
        }
      })
    break;
    case "EEProductDetail":
      window.dataLayer.push({
        "event":"EEProductDetail",
        "ecommerce": {
          "currencyCode": data.currencycode,
          "detail": {
            "products": data.therapies
          }
        },
        "custom_data": {
          "product_name": data.productname,
          "product_id": data.productid,
          "event_id_vc": data.viewContentEventId,
          "event_id_pv": data.pageViewEventId
        }
      }),
      window.dataLayer.push({
        "event": "view_item",
        "ecommerce": {
          "items": data.therapiesGA4
        }
      })
    break;
    case "EEtransaction":
      window.dataLayer.push({
        "event":"EEtransaction",
          "ecommerce": {
            "currencyCode": data.currencycode,
            "purchase": {
              "actionField": {
                "id": data.order_id,
                "affiliation":"Lux Store " + data.ordercountry,
                "revenue": data.total_price,
                "tax": "0",
                "shipping":data.shipping_fee,
                "coupon": data.discount_name
            },
              "products": data.therapies
          }
        },
        "custom_data": {
          "customer_email": data.customer_email,
          "customer_first_name": data.customer_first_name,
          "customer_last_name": data.customer_last_name,
          "customer_phone": data.customer_phone,
          "new_customer": data.new_customer
        }
      }),
      window.dataLayer.push({
        "event":"purchase",
          "ecommerce": {
            "transaction_id": data.order_id,
            "affiliation": "Lux Store " + data.ordercountry,
            "value": data.total_price,
            "tax": "0",
            "shipping": data.shipping_fee,
            "currency": data.currencycode,
            "coupon": data.discount_name,
            "items": data.therapiesGA4
        }
      })
    break;
  }
}
