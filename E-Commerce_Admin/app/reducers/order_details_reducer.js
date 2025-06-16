import Immutable from 'immutable';
import {GET_ORDER_DETAILS, CREATE_NEW_COMMENT, DELETE_COMMENT, DELETE_ORDER_ACCESSORY,
ADD_AGENT_TO_ORDER, ADD_NEW_ORDER, SHOW_COLORS_EDIT, DELETE_THERAPY_EDIT, EDIT_THERAPIES, EDIT_ORDER_INFO,
SHOW_THERAPIES_UPSALE, CLEAR_THERAPY_EDIT, EDIT_ORDER_GIFTS, CALLING, CHANGE_THERAPY_QUANTITY, CHANGE_ACC_QUANTITY, CHANGE_THERAPY_QUANTITY_STORNO,
END_VCC_CALL, ADD_OCCUPIED_ORDER, REMOVE_OCCUPIED_ORDER, IS_ACCESSORY_GIFT, ACCESSORY_OPTION, CLEAR_THERAPY_EDIT_STORNO} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({orders:[], ordersCount:0, initial_order: {}, countries: [], therapies:[], localDeliveryMethods: [],
order:{additionalDiscountData: {}, order_history:[], gifts:[], comments:[], customer:{ old_orders:[] }, discountData:{}, emails:[], order_status:{}, therapies:[]},
changedData: null, show_therapies: [], openColorPicker: false, calling: false});

export default function (state = INITIAL_STATE, action) {
	let nextState = state.toJS();
	switch (action.type) {
		case GET_ORDER_DETAILS:
			var order = action.payload.order

			nextState.order = {additionalDiscountData: {}, order_history:[], gifts:[], comments:[], customer:{ old_orders:[] }, discountData:{}, emails:[], order_status:{}, therapies:[]}

			nextState.order = {...nextState.order, ...order};


			var localDeliveryMethods = localStorage.getItem("deliverymethods") && JSON.parse(localStorage.getItem("deliverymethods")) || [];

			if (localDeliveryMethods.length > 0 && order.customer) {
				localDeliveryMethods = localDeliveryMethods.filter(m => {
					return m.country === order.customer.country
				})
			}
      		nextState.localDeliveryMethods = localDeliveryMethods

			var customerChanges = ["shipping_address", "shipping_city", "shipping_country", "shipping_email", "shipping_first_name", "shipping_last_name", "shipping_postcode", "shipping_telephone"];
			var therapiesChanges = ["therapies"];
			var paymentChanges = ["delivery_method_code", "delivery_method_id", "delivery_method_price", "delivery_method_to_price", "payment_method_code", "payment_method_id"];
			var otherChanges = false;

			var history = nextState.order.order_history;

			var customer = false, therapies = false, payment = false, other = false;

			for(var i=1; i<history.length; i++){
				var data_obj = Object.keys(history[i].data);
				for(var k=0; k<data_obj.length; k++) {
					if(customerChanges.includes(data_obj[k]))
						customer = true;
					else if(therapiesChanges.includes(data_obj[k]))
						therapies = true;
					else if(paymentChanges.includes(data_obj[k]))
						payment = true;
					else
						other = true;
				}

				var arr_str = [];

				if(history[i].responsible_agent_id != null) {
					if(customer) arr_str.push("Sprememba stranke");
					if(therapies) arr_str.push("Sprememba izdelkov");
					if(payment) arr_str.push("Sprememba plačila ali dostave");
					if(other) arr_str.push("Druga sprememba");
					if(arr_str.length>0) {
						var str = arr_str.join(", ").toString();
						history[i].changes = str;
					}
				}

				else {
					history[i].changes = "Novo naročilo";
				}
			}

			nextState.order.order_history = history;
			var therapies = localStorage.getItem("therapies") && JSON.parse(localStorage.getItem("therapies")) || []
			var accessories = localStorage.getItem("accessories") && JSON.parse(localStorage.getItem("accessories")) || []

			nextState.therapies = therapies.filter(t => {
				return t.country == order.shipping_country
			})
			nextState.therapies.map(t => {
				t.quantity = 1;
				if(order.therapies){
					var therapy = order.therapies.find(th => {
						return th.id == t.id
					})
					if (therapy) {
						t.selected = true
					} else {
						t.selected = false
					}
				}
			})

			nextState.accessories = accessories.filter(a => {
				return a.country == order.shipping_country
			})
			nextState.accessories.map(a => {
				a.quantity = 1;
				if(order.accessories){
					var accessory = order.accessories.find(acc => {
						return acc.id == a.id
					})
					if (accessory) {
						a.selected = true
					} else {
						a.selected = false
					}
				}
			})

			if(order.accessories) {
				order.accessories.map(a => {
					nextState.accessories.map(aa => {
						if(a.id == aa.id) {
							a.options = aa.options
						}
					})
				})
			}

			nextState.initial_order = {
				shipping_first_name: order.shipping_first_name,
				shipping_last_name: order.shipping_last_name,
				shipping_email: order.shipping_email,
				shipping_telephone: order.shipping_telephone,
				shipping_address: order.shipping_address,
				shipping_city: order.shipping_city,
				shipping_postcode: order.shipping_postcode,
				shipping_country: order.shipping_country,

				payment_first_name: order.payment_first_name,
				payment_last_name: order.payment_last_name,
				payment_email: order.payment_email,
				payment_telephone: order.payment_telephone,
				payment_address: order.payment_address,
				payment_city: order.payment_city,
				payment_postcode: order.payment_postcode,
				payment_country: order.payment_country,

				delivery_method_code: order.delivery_method_code,
				payment_method_code: order.payment_method_code,
				payment_method_name: order.payment_method_name,
				utm_medium: order.utm_medium,
				utm_content: order.utm_content,
				utm_campaign: order.utm_campaign,
				utm_source: order.utm_source,
				post_expenses: order.post_expenses,
				additional_expenses: order.additional_expenses,
				tracking_code: order.tracking_code
			}
			var countries = localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [];
			nextState.countries = countries.map(c => {return c.name})
      break;

		case EDIT_ORDER_GIFTS:
			var order = nextState.order;
			order.gifts = action.payload.gifts;
			nextState.order = order;
			break;

		case CREATE_NEW_COMMENT:
			nextState.order.comments.push(action.payload);
			break;

		case DELETE_COMMENT:
			var comment = nextState.order.comments.filter((c) => {
				return c.id != action.payload.id;
			});
			nextState.order.comments = comment;
			break;

		case ADD_NEW_ORDER:
			nextState.orders.push(action.payload);
			nextState.ordersCount++;
			break;

		case ADD_AGENT_TO_ORDER:
			var admin_id = action.payload.admin_id;
			nextState.order.responsible_agent_id = admin_id;
		break;

		case SHOW_COLORS_EDIT:
			var order = nextState.order;
			order.openColorPicker = !order.openColorPicker;
		break;

		case EDIT_ORDER_INFO:
			nextState.order = {...nextState.order, ...action.payload}
		break;

		case CALLING:
			nextState.calling = action.payload
		break;

		case EDIT_THERAPIES:
			nextState.order = {...nextState.order, ...action.payload}
		break;

		case CLEAR_THERAPY_EDIT:
			var therapy = nextState.show_therapies.find(e => {
				return e.id == action.payload.id
      		})
			therapy.selected = true;
			if(therapy.reduced_price) {
				let acc = therapy;
				acc.options = acc.options.filter(a => {
					return a.lang.toLowerCase() === nextState.order.lang.toLowerCase()
				})
				nextState.order.accessories.push(acc)
			} else {
				nextState.order.therapies.push(action.payload)
			}
      		var order = {};//calculateOrder(nextState.order);
      if (nextState.order.additionalDiscountData.isOtoCoupon) {
				if (nextState.order.additionalDiscountData.therapies.length > 0) {
					var th = nextState.order.additionalDiscountData.therapies[0];
					var found = nextState.order.therapies.find(t => {
						return t.id == th.id
					})
					if (found) {
						order = calculateOrder(nextState.order, true, false);
					} else {
						order = calculateOrder(nextState.order);
					}
				} else if (nextState.order.additionalDiscountData.accessories.length > 0) {
					var th = nextState.order.additionalDiscountData.accessories[0];
					var found = nextState.order.accessories.find(t => {
						return t.id == th.id
					})
					if (found) {
						order = calculateOrder(nextState.order, true, false);
					} else {
						order = calculateOrder(nextState.order);
					}
				}
			} else {
				order = calculateOrder(nextState.order);
			}
			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
		break;

    case CLEAR_THERAPY_EDIT_STORNO:
			var therapy = nextState.show_therapies.find(e => {
				return e.id == action.payload.id
			})
			therapy.selected = true;
			if(therapy.reduced_price) {
        let acc = action.payload;
        acc.options = acc.options.filter(a => {
          return a.lang.toLowerCase() === nextState.order.lang.toLowerCase()
        })
				nextState.order.accessories.push(acc)
			} else {
        action.payload.total_price = -action.payload.total_price
				nextState.order.therapies.push(action.payload)
			}
      var order = {};//calculateOrder(nextState.order);
      if (nextState.order.additionalDiscountData.isOtoCoupon) {
				if (nextState.order.additionalDiscountData.therapies.length > 0) {
					var th = nextState.order.additionalDiscountData.therapies[0];
					var found = nextState.order.therapies.find(t => {
						return t.id == th.id
					})
					if (found) {
						order = calculateOrderStorno(nextState.order, true, false);
					} else {
						order = calculateOrderStorno(nextState.order);
					}
				} else if (nextState.order.additionalDiscountData.accessories.length > 0) {
					var th = nextState.order.additionalDiscountData.accessories[0];
					var found = nextState.order.accessories.find(t => {
						return t.id == th.id
					})
					if (found) {
						order = calculateOrderStorno(nextState.order, true, false);
					} else {
						order = calculateOrderStorno(nextState.order);
					}
				}
      } else {
        order = calculateOrderStorno(nextState.order);
      }
			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
		break;

		case CHANGE_THERAPY_QUANTITY:
			var therapy = nextState.order.therapies.filter(e => {
				return e.id == action.payload.row.id;
      })
      var order = {}
      therapy.map(t => {t.quantity += action.payload.quantity})
      if (nextState.order.additionalDiscountData.isOtoCoupon) {
				if (nextState.order.additionalDiscountData.therapies.length > 0) {
					var th = nextState.order.additionalDiscountData.therapies[0];
					if (th.id == action.payload.row.id) {
						order = calculateOrder(nextState.order, true, false);
					} else {
						order = calculateOrder(nextState.order);
					}
				} else if (nextState.order.additionalDiscountData.accessories.length > 0) {
					var th = nextState.order.additionalDiscountData.accessories[0];
					if (th.id == action.payload.row.id) {
						order = calculateOrder(nextState.order, true, false);
					} else {
						order = calculateOrder(nextState.order);
					}
				}

      } else {
        order = calculateOrder(nextState.order);
      }

			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
			break;

      case CHANGE_THERAPY_QUANTITY_STORNO:
        var therapy = nextState.order.therapies.filter(e => {
          return e.id == action.payload.row.id;
        })
        var order = {}
        therapy.map(t => {t.quantity += action.payload.quantity})
        if (nextState.order.additionalDiscountData.isOtoCoupon) {
          if (nextState.order.additionalDiscountData.therapies.length > 0) {
            var th = nextState.order.additionalDiscountData.therapies[0];
            if (th.id == action.payload.row.id) {
              order = calculateOrderStorno(nextState.order, true, false);
            } else {
              order = calculateOrderStorno(nextState.order);
            }
          } else if (nextState.order.additionalDiscountData.accessories.length > 0) {
            var th = nextState.order.additionalDiscountData.accessories[0];
            if (th.id == action.payload.row.id) {
              order = calculateOrderStorno(nextState.order, true, false);
            } else {
              order = calculateOrderStorno(nextState.order);
            }
          }

        } else {
          order = calculateOrder(nextState.order);
        }

        nextState.changedData = order;
        nextState.order = Object.assign(nextState.order, order);
			break;

      case CHANGE_ACC_QUANTITY:
        var accessory = nextState.order.accessories.filter(e => {
				  return e.id == action.payload.row.id;
        })
        var order = {}
        accessory.map(t => {t.quantity += action.payload.quantity})
        if (nextState.order.additionalDiscountData.isOtoCoupon) {
          if (nextState.order.additionalDiscountData.therapies.length > 0) {
            var th = nextState.order.additionalDiscountData.therapies[0];
            if (th.id == action.payload.row.id) {
              order = calculateOrder(nextState.order, true, false);
            } else {
              order = calculateOrder(nextState.order);
            }
          } else if (nextState.order.additionalDiscountData.accessories.length > 0) {
            var th = nextState.order.additionalDiscountData.accessories[0];
            if (th.id == action.payload.row.id) {
              order = calculateOrder(nextState.order, true, false);
            } else {
              order = calculateOrder(nextState.order);
            }
          }

        } else {
          order = calculateOrder(nextState.order);
        }

        nextState.changedData = order;
        nextState.order = Object.assign(nextState.order, order);
      break;

		case SHOW_THERAPIES_UPSALE:
      var arr = [], products = [];
			arr.push(nextState.therapies, nextState.accessories)
			for(var i=0; i<arr.length; i++) {
				for(var j=0; j<arr[i].length; j++) {
					products.push(arr[i][j]);
				}
			}

 			var show_products_upsell = products.filter(p => {
				if(action.payload.name == "accessories") {
					return p.reduced_price;
				} else {
					return p.category == action.payload.name;
				}
			})

			var sorted_arr = [];
      if(show_products_upsell && show_products_upsell.length > 0) {
        sorted_arr = show_products_upsell.sort(function(a, b){
          var price1 = a.reduced_price || a.total_price;
          var price2 = b.reduced_price || b.total_price;

          if (price1 < price2) {
              return -1;
          } else if (price1 == price2) {
              return 0;
          } else {
              return 1;
          }
        })
      }

			nextState.show_therapies = sorted_arr;
			break;

		case DELETE_THERAPY_EDIT:
			if (nextState.order.therapies.length > 0) {
				var therapy = nextState.therapies.find(t => {
					return t.id == action.payload.id
				})
				therapy.selected = false;
				if(therapy.reduced_price) {
					nextState.order.accessories = nextState.order.accessories.filter(a => {
						return a.id != action.payload.id
					})
				} else {
					nextState.order.therapies = nextState.order.therapies.filter(t => {
						return t.id != action.payload.id
					})
				}
        var order = {};//calculateOrder(nextState.order);
        if (nextState.order.additionalDiscountData.isOtoCoupon) {
					if (nextState.order.additionalDiscountData.therapies.length > 0) {
						var th = nextState.order.additionalDiscountData.therapies[0];
						var found = nextState.order.therapies.find(t => {
							return t.id == th.id
						})
						if (found) {
							order = calculateOrder(nextState.order, true, false);
						} else {
							order = calculateOrder(nextState.order);
						}
					} else if (nextState.order.additionalDiscountData.accessories.length > 0) {
						var th = nextState.order.additionalDiscountData.accessories[0];
						var found = nextState.order.accessories.find(t => {
							return t.id == th.id
						})
						if (found) {
							order = calculateOrder(nextState.order, true, false);
						} else {
							order = calculateOrder(nextState.order);
						}
					}
        } else {
          order = calculateOrder(nextState.order);
        }
				nextState.changedData = order;
				nextState.order = Object.assign(nextState.order, order);
			}
		break;

		case ACCESSORY_OPTION:
			var accessory = nextState.order.accessories.filter(e => {
				return e.id == action.payload.row.id;
			})
			accessory.map(a => {a.product_id = action.payload.option})
			var order = {};
			order = calculateOrder(nextState.order);
			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
		break;

		case DELETE_ORDER_ACCESSORY:
			// let found1 = nextState.order.accessories.find(a => {
			// 	return a.id === action.payload.id
			// })
			nextState.order.accessories = nextState.order.accessories.filter(a => {
				return a.acc_name && a.id != action.payload.id
			})
			if (nextState.order.order_status.name === "Storno") {
				nextState.order.shipping_fee = nextState.order.shipping_fee != 0 ? -Math.abs(nextState.order.shipping_fee) : 0;
				nextState.order.discount = nextState.order.discount > 0 ? -Math.abs(nextState.order.discount) : 0;
				nextState.order.additional_discount = nextState.order.additional_discount > 0 ? -Math.abs(nextState.order.additional_discount) : 0;
			}
			var order = {};
			order = calculateOrder(nextState.order);

			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
		break;

		case IS_ACCESSORY_GIFT:
			var accessory = nextState.order.accessories.filter(a => {
				return a.id == action.payload.id
			})
			accessory.map(aa => {
				if(aa.isGift == 1) {
					aa.isGift = 0;
				} else {
					aa.isGift = 1;
				}
			})
			var order = {};
			order = calculateOrder(nextState.order);
			nextState.changedData = order;
			nextState.order = Object.assign(nextState.order, order);
			//console.log(nextState.order)
		break;

		case END_VCC_CALL:
			nextState.order.calls.push(action.payload);
			localStorage.setItem('callingOrder', action.payload.display_order_id);
		break;

		case ADD_OCCUPIED_ORDER:
			if(!localStorage.getItem('occupiedOrders')){
				var tmp = [];
				tmp.push(action.payload);
				localStorage.setItem('occupiedOrders', JSON.stringify(tmp));
			}
			else{
				var tmp = JSON.parse(localStorage.getItem('occupiedOrders'));
				tmp.push(action.payload);
				localStorage.setItem('occupiedOrders', JSON.stringify(tmp));
			}
		break;

		case REMOVE_OCCUPIED_ORDER:
			// var tmp = JSON.parse(localStorage.getItem('occupiedOrders'));
			// var index = tmp.indexOf(action.payload);
			// if (index > -1) {
			// 	tmp.splice(index, 1);
			// }
			// if(tmp.length == 0){
			// 	localStorage.removeItem('occupiedOrders');
			// }
			// else{
			// 	localStorage.setItem('occupiedOrders', JSON.stringify(tmp));
			// }
		break;
	}

	return state.merge(nextState);
}

function calculateOrderStorno(order, flag=true, obj=true) {
	var subtotal = 0;
	var total = 0;
	var discount = 0;
	var shipping = 0;
	var additional_discount = 0;
	var therapy_total_price = order.therapies.map(t => {
		if(t.quantity)
			return t.total_price*t.quantity
		else
			t.quantity = 1
			return t.total_price*t.quantity;
	});

	var acc_total_price = order.accessories.map(t => {
		if(t.quantity) {
			if(t.isGift == 1) {
				return 0*t.quantity
			} else {
				return t.reduced_price*t.quantity
			}
		}
		else {
			if(t.isGift == 1) {
				t.quantity = 1
				return 0*t.quantity;
			} else {
				t.quantity = 1
				return t.reduced_price*t.quantity
			}
		}
	});

	for (var i = 0; i < order.therapies.length; i ++) {
		subtotal += therapy_total_price[i];
	}

	for (var i = 0; i < order.accessories.length; i ++) {
		subtotal += acc_total_price[i];
	}

	// Calculate the subtotal of non-free products for shipping calculation
	var nonFreeSubtotal = 0;
	
	// Add up non-free therapies
	order.therapies.forEach(t => {
		if (!t.isFreeProduct && !t.isGift) {
			nonFreeSubtotal += t.total_price * (t.quantity || 1);
		}
	});
	
	// Add up non-free accessories
	order.accessories.forEach(a => {
		if (!a.isFreeProduct && !a.isGift) {
			nonFreeSubtotal += a.reduced_price * (a.quantity || 1);
		}
	});
	
	console.log("Non-free subtotal for shipping calculation:", nonFreeSubtotal);
	console.log("Delivery method threshold:", order.delivery_method_to_price);
	
	// Determine shipping based on non-free subtotal
	if (order.order_status.name === "Storno") {
		if (-Math.abs(subtotal) > -Math.abs(order.delivery_method_to_price)) {
			shipping = -Math.abs(order.delivery_method_price)
		}
	} else {
		if (nonFreeSubtotal < order.delivery_method_to_price) {
			shipping = order.delivery_method_price
		}
	}

	if (order.discountData.type) {
		if (order.discountData.type.toLowerCase() == 'general') {
			if (order.discountData.discount_type.toLowerCase() == 'percent') {
				discount = subtotal * (order.discountData.discount_value / 100)//subtotal - (subtotal / ((order.discountData.discount_value / 100) + 1))
			} else {
				discount = order.discountData.discount_value
			}
		} else if (order.discountData.type.toLowerCase() == 'individual') {

			var discountTherapies = order.discountData.therapies;
			var pickedTherapies = [];
			var subtotalForDiscount = 0;
			for (var i = 0; i < discountTherapies.length; i++) {
				var th = order.therapies.find(t => {
					return t.id == discountTherapies[i].id
				})
				if (th) {
					subtotalForDiscount += th.total_price * th.quantity;
					if (order.discountData.discount_type.toLowerCase() == 'percent') {
						discount = subtotalForDiscount * (order.discountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.discountData.discount_value / 100) + 1))
					} else {
						discount = order.discountData.discount_value
					}
				}
			}
		} else if (order.discountData.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price > subtotal) {
				discount = order.delivery_method_price
			}
		}
	}

	if (order.additionalDiscountData.type && flag) {
		if (order.additionalDiscountData.type.toLowerCase() == 'general') {
			if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
				additional_discount = subtotal * (order.additionalDiscountData.discount_value / 100)//subtotal - (subtotal / ((order.additionalDiscountData.discount_value / 100) + 1))
			} else {
				additional_discount = order.additionalDiscountData.discount_value
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'individual') {
			if (order.additionalDiscountData.therapies.length > 0) {
				var discountTherapies = order.additionalDiscountData.therapies;
				var pickedTherapies = [];
				var subtotalForDiscount = 0;
				for (var i = 0; i < discountTherapies.length; i++) {
					var th = order.therapies.find(t => {
						return t.id == discountTherapies[i].id
					})
					if (th) {
						subtotalForDiscount += th.total_price * th.quantity;
						if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
							additional_discount = subtotalForDiscount * (order.additionalDiscountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.additionalDiscountData.discount_value / 100) + 1))
						} else {
							additional_discount = order.additionalDiscountData.discount_value
						}
					}
				}
			} else if (order.additionalDiscountData.accessories.length > 0) {
				var discountTherapies = order.additionalDiscountData.accessories;
				var pickedTherapies = [];
				var subtotalForDiscount = 0;
				for (var i = 0; i < discountTherapies.length; i++) {
					var th = order.accessories.find(t => {
						return t.id == discountTherapies[i].id
					})
					if (th) {
						subtotalForDiscount += th.reduced_price * 1;
						if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
							additional_discount = subtotalForDiscount * (order.additionalDiscountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.additionalDiscountData.discount_value / 100) + 1))
						} else {
							additional_discount = order.additionalDiscountData.discount_value
						}
					}
				}
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price > subtotal) {
				additional_discount = order.delivery_method_price
			}
		}
  }
  var minus = 0
  if (!obj) {
    minus = additional_discount
  }

	return {
		discount,
		shipping_fee: -shipping,
		subtotal: (subtotal - minus),
		total: (subtotal - discount - additional_discount + shipping),
		therapies: order.therapies,
		accessories: order.accessories,
		additional_discount: -additional_discount
	}

}

function calculateOrder(order, flag=true, obj=true) {
	var subtotal = 0;
	var total = 0;
	var discount = 0;
	var shipping = 0;
	var additional_discount = 0;
	var therapy_total_price = order.therapies.map(t => {
		if(t.quantity)
			return t.total_price*t.quantity
		else
			t.quantity = 1
			return t.total_price*t.quantity;
	});

	var acc_total_price = order.accessories.map(t => {
		if(t.quantity) {
			if(t.isFreeProduct == 1) {
				return t.quantity*t.reduced_price
			} else if (t.isGift == 1) {
				return 0*t.quantity
			} else {
				return t.reduced_price*t.quantity
			}
		} else {
			if(t.isFreeProduct == 1) {
				t.quantity = 1
				return t.quantity*t.reduced_price;
			} else if (t.isGift == 1) {
				t.quantity = 1
				return 0*t.quantity;
			} else {
				t.quantity = 1
				return t.reduced_price*t.quantity
			}
		}
	});

	for (var i = 0; i < order.therapies.length; i ++) {
		subtotal += therapy_total_price[i];
	}

	for (var i = 0; i < order.accessories.length; i ++) {
		subtotal += acc_total_price[i];
	}

	if (order.discountData.type) {
		if (order.discountData.type.toLowerCase() == 'general') {
			if (order.discountData.discount_type.toLowerCase() == 'percent') {
				var therapiesInCart = order.therapies || "";
				var bundles = [];
				for (var i=0; i < therapiesInCart.length; i++) {
	        if (therapiesInCart[i].category === 'bundle') {
	          bundles.push(therapiesInCart[i]);
	        }
	      }
	      var sumBundle = 0;
	      if (bundles) {
	        for (var i in bundles) {
	          sumBundle += +bundles[i].price * bundles[i].quantity;
	        }
	      }
				discount = (subtotal - sumBundle) * (order.discountData.discount_value / 100)//subtotal - (subtotal / ((order.discountData.discount_value / 100) + 1))
			} else {
				discount = order.discountData.discount_value
			}
		} else if (order.discountData.type.toLowerCase() == 'individual') {

			var discountTherapies = order.discountData.therapies;
			var pickedTherapies = [];
			var subtotalForDiscount = 0;
			for (var i = 0; i < discountTherapies.length; i++) {
				var th = order.therapies.find(t => {
					return t.id == discountTherapies[i].id
				})
				if (th) {
					subtotalForDiscount += th.total_price * th.quantity;
					if (order.discountData.discount_type.toLowerCase() == 'percent') {
						discount = subtotalForDiscount * (order.discountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.discountData.discount_value / 100) + 1))
					} else {
						discount = order.discountData.discount_value
					}
				}
			}
		} else if (order.discountData.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price > subtotal) {
				discount = order.delivery_method_price
			}
		} else if (order.discountData.type.toLowerCase() == 'free product') {
			var freeTherapaiesPrice = 0;
			order.therapies.map(t => {
				if (t.isFreeProduct) {
					if(t.quantity)
						freeTherapaiesPrice += t.total_price*t.quantity;
					// else
					// 	t.quantity = 1
					// 	freeTherapaiesPrice += t.total_price*t.quantity;
				}
			});

			var freeAccessoriesPrice = 0;
			order.accessories.map(a => {
				if (a.isFreeProduct) {
					if (a.quantity) {
						freeAccessoriesPrice += a.reduced_price*a.quantity;
					}	else {
						a.quantity = 1;
						freeAccessoriesPrice += a.reduced_price*a.quantity;
					}
				}
			});

			var subtotalForDiscount = 0;

			var accessories_prices = order.accessories.map(t => {
				if(t.isFreeProduct == 1) {
					return 0;
				} else if (t.isGift == 1) {
					return 0;
				} else {
					return t.reduced_price*t.quantity
				}
			});

			for (var i = 0; i < order.accessories.length; i ++) {
				subtotalForDiscount += accessories_prices[i];
			}

			var therapies_prices = order.therapies.map(t => {
					if(t.isFreeProduct == 1) {
						return 0;
					} else if (t.isGift == 1) {
						return 0;
					} else {
						return t.total_price*t.quantity
					}
			});

			for (var i = 0; i < order.therapies.length; i ++) {
				subtotalForDiscount += therapies_prices[i];
			}

			if (order.discountData.discount_type.toLowerCase() == 'percent') {
				//		discount = freeTherapaiesPrice + freeAccessoriesPrice + (subtotal * (order.additionalDiscountData.discount_value / 100));
				discount = subtotalForDiscount * (order.discountData.discount_value / 100) + freeTherapaiesPrice + freeAccessoriesPrice ;
			} else {
				discount = freeTherapaiesPrice + freeAccessoriesPrice;
			}

		}
	}

	if (order.additionalDiscountData.type && flag) {
		if (order.additionalDiscountData.type.toLowerCase() == 'general') {
			if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
				additional_discount = subtotal * (order.additionalDiscountData.discount_value / 100)//subtotal - (subtotal / ((order.additionalDiscountData.discount_value / 100) + 1))
			} else {
				additional_discount = order.additionalDiscountData.discount_value
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'individual') {
			if (order.additionalDiscountData.therapies.length > 0) {
				var discountTherapies = order.additionalDiscountData.therapies;
				var pickedTherapies = [];
				var subtotalForDiscount = 0;
				for (var i = 0; i < discountTherapies.length; i++) {
					var th = order.therapies.find(t => {
						return t.id == discountTherapies[i].id
					})
					if (th) {
						subtotalForDiscount += th.total_price * th.quantity;
						if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
							additional_discount = subtotalForDiscount * (order.additionalDiscountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.additionalDiscountData.discount_value / 100) + 1))
						} else {
							additional_discount = order.additionalDiscountData.discount_value
						}
					}
				}
			} else if (order.additionalDiscountData.accessories.length > 0) {
				var discountTherapies = order.additionalDiscountData.accessories;
				var pickedTherapies = [];
				var subtotalForDiscount = 0;
				for (var i = 0; i < discountTherapies.length; i++) {
					var th = order.accessories.find(t => {
						return t.id == discountTherapies[i].id
					})
					if (th) {
						subtotalForDiscount += th.reduced_price * 1;
						if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
							additional_discount = subtotalForDiscount * (order.additionalDiscountData.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((order.additionalDiscountData.discount_value / 100) + 1))
						} else {
							additional_discount = order.additionalDiscountData.discount_value
						}
					}
				}
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price > subtotal) {
				additional_discount = order.delivery_method_price
			}
		}
  	}
	var minus = 0
	if (!obj) {
		minus = additional_discount
	}


	// Calculate the subtotal of non-free products for shipping calculation
	var nonFreeSubtotal = 0;
	
	// Add up non-free therapies
	order.therapies.forEach(t => {
		if (!t.isFreeProduct && !t.isGift) {
			nonFreeSubtotal += t.total_price * (t.quantity || 1);
		}
	});
	
	// Add up non-free accessories
	order.accessories.forEach(a => {
		if (!a.isFreeProduct && !a.isGift) {
			nonFreeSubtotal += a.reduced_price * (a.quantity || 1);
		}
	});
	
	console.log("Non-free subtotal for shipping calculation:", nonFreeSubtotal);
	console.log("Delivery method threshold:", order.delivery_method_to_price);
	
	// Determine shipping based on non-free subtotal
	if (order.order_status.name === "Storno") {
		if (-Math.abs(subtotal) > -Math.abs(order.delivery_method_to_price)) {
			shipping = -Math.abs(order.delivery_method_price)
		}
	} else {
		if (nonFreeSubtotal < order.delivery_method_to_price) {
			shipping = order.delivery_method_price
		}
	}

	total = subtotal - discount - additional_discount + shipping;

	return {
		discount,
		shipping_fee: shipping,
		subtotal: subtotal - minus,
		total,
		therapies: order.therapies,
		accessories: order.accessories,
		additional_discount
	}
}
