import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Immutable from 'immutable';
import { compose } from 'redux';
import Switch from 'react-switch';
import { connect } from 'react-redux';
import Select from 'react-select';
import { reduxForm } from "redux-form/immutable"
import {
  toggleGift, clear_therapy, clear_acc, delete_from_therapies,
  delete_from_accessories, setInitialValuesNewOrder
} from '../../actions/customer_profile_actions';
import { addNewOrder } from '../../actions/order_details_actions';
import CustomerDetails from './new_order_customer_data.js';
import { createNotification } from '../../App.js'
import { ROOT_URL } from '../../config/constants';
import axios from "axios";

class NewOrder extends Component {
  constructor(props) {
    super(props);

  this.state = {
    therapy: [], accessories: [], hidden: "", therapies: [], currency: null, discount: null, deliveryMethod: null, subtotal: 0, shipping_fee: 0, a_PopustDiv: false,
    shipping_fee_to_price: 0, total: 0, d_value: 0, deliverymethod_id: 0, new_order_gifts: [], popustDiv: false, newCustomerData: null, therapiesNumber: 1,
    popustValue: null, dType: null, discountType: null, individualTherapies: [], customer_id: null, selectedOption: null, thisCustomer: {}, thisOrder: {},
    discount_name: ""
  };
  }

  componentDidMount() {
    var location = browserHistory.getCurrentLocation();
    var order_id = location.query.order_id;
    var customer_id = location.query.customer_id;
    browserHistory.replace(location);

    if (customer_id)
      this.getCustomerDetails(customer_id);
    else
      this.getOrderDetails(order_id);
  };

async checkDiscount(discount_name, country) {
  try {
    const response = await axios.post(`${ROOT_URL}/admin/discount/name`, { discountcode: discount_name, country });
    if (response.data.success) {
      return response.data.discount;
    } else {
      createNotification('error', 'Invalid discount code or country');
      return null;
    }
  } catch (error) {
    console.error(error);
    createNotification('error', 'Error checking discount');
    return null;
  }
}

async discount_data() {
  const selectedDiscount = this.state.discount_name;
  const country = this.state.thisCustomer.country || this.state.thisOrder.country;
  const discount = await this.checkDiscount(selectedDiscount, country);

  if (discount) {
    if (discount.utm_medium != null && discount.utm_source != null) {
      this.setState({ utm_medium: discount.utm_medium, utm_source: discount.utm_source });
      this.setState({ customerData: this.state.newCustomerData });
      this.setState({ selected_orders: this.props.newOrderGifts });
      if (this.state.customer_id) {
        this.getCustomerDetails(this.state.customer_id);
      } else {
        this.getOrderDetails(this.state.order_id);
      }
    }

    const discount_value = calculateDiscount(discount, this.state);
    this.setState({ discount });
    this.setState({ d_value: discount_value });
    this.setState({ total: this.state.subtotal - discount_value + this.state.shipping_fee });
    this.setState({ checked: false });
  }
}


// filepath: /Users/tomaz/HYPEdev/admin-E-commerce/app/routes/customer_profile/add_order_new.js
async getOrderDetails(order_id) {
    var result = await axios.get(`${ROOT_URL}/admin/order/details/${order_id}`);
    var data = result.data.order;
    var obj = {};
    obj.first_name = data.payment_first_name || data.shipping_first_name;
    obj.last_name = data.payment_last_name || data.shipping_last_name;
    obj.email = data.payment_email || data.shipping_email;
    obj.telephone = data.payment_telephone || data.shipping_telephone;
    obj.address = data.payment_address || data.shipping_address;
    obj.city = data.payment_city || data.shipping_city;
    obj.postcode = data.payment_postcode || data.shipping_postcode;
    obj.country = data.payment_country || data.shipping_country;
  
    obj.shipping_first_name = data.shipping_first_name;
    obj.shipping_last_name = data.shipping_last_name;
    obj.shipping_email = data.shipping_email;
    obj.shipping_telephone = data.shipping_email;
    obj.shipping_address = data.shipping_address;
    obj.shipping_city = data.shipping_city;
    obj.shipping_postcode = data.shipping_postcode;
    obj.shipping_country = data.shipping_country;
    obj.isFreeProduct = data.isFreeProduct;
  
    this.setState({ thisCustomer: obj });
  
    obj.order_type = data.order_type ? data.order_type : "inbound";
    obj.utm_source = data.discountData ? data.discountData.utm_source : data.utm_source;
    obj.utm_medium = data.discountData ? data.discountData.utm_medium : data.utm_medium;
    this.setState({ customer_id: data.customer_id });
    this.setState({ order_id: data.id });
    if (data.additional_discount_id) {
      this.setState({ ad_id: data.additional_discount_id });
    }
    this.props.setInitialValuesNewOrder(obj, { deliverymethod: data.delivery_method_code, paymentmethod: data.payment_method_code });
    this.setState({ thisOrder: obj });
  
    var order_gifts = data.gifts.map(g => { return { id: g.gift_id, name: g.name, isChosen: true } });
  
    var gifts = [];
    if (order_gifts) {
      for (var i = 0; i < order_gifts.length; i++) {
        for (var j = 0; j < this.props.newOrderGifts.length; j++) {
          if (order_gifts[i].id == this.props.newOrderGifts[j].id) {
            gifts.push(order_gifts[i]);
            for (var k = 0; k < gifts.length; k++) {
              this.props.toggleGift(gifts[k].id, gifts[k].isChosen);
            }
          }
        }
      }
    }
  
    if (data.therapies) {
      data.therapies.map(t => {
        this.add_therapy(t);
      });
    }
  
    if (data.accessories) {
      for (var i = 0; i < this.props.accessories.length; i++) {
        for (var j = 0; j < data.accessories.length; j++) {
          if (this.props.accessories[i].id == data.accessories[j].id) {
            data.accessories[j].options = this.props.accessories[i].options;
          }
        }
      }
      data.accessories.map(t => {
        this.add_therapy(t, "accessory");
      });
    }
  
    if (data.discountData) {
      this.setState({ discount_name: data.discountData.name });
      this.discount_data();
    }
  
    if (data.additionalDiscountData) {
      var dValue = data.additionalDiscountData.discount_value;
      var type = data.additionalDiscountData.type;
      var discount_type = data.additionalDiscountData.discount_type;
      this.setState({ additional_discount_data: { discount_value: parseFloat(dValue), type, discount_type }, additional_discount: data.additional_discount, th: data.additionalDiscountData.therapies });
      this.setState({ total: data.total });
    }
  
    // Set the shipping fee based on the delivery method
    var deliveryMethod = this.props.deliverymethods.find(dm => dm.code === data.delivery_method_code);
    if (deliveryMethod) {
      var shipping_fee = deliveryMethod.price;
      var shipping_fee_to_price = deliveryMethod.to_price;
  
      this.setState({
        shipping_fee: shipping_fee,
        shipping_fee_to_price: shipping_fee_to_price
      });
  
      // Log the values to check
    } else {
      console.error("Delivery method not found for code:", data.delivery_method_code);
    }
  }
  
// filepath: /Users/tomaz/HYPEdev/admin-E-commerce/app/routes/customer_profile/add_order_new.js
async getCustomerDetails(customer_id) {
    var result = await axios.get(`${ROOT_URL}/admin/customer/details/${customer_id}`);
    var data = result.data.customer;
    var obj = {};
    obj.first_name = this.state.customerData ? this.state.customerData.payment_first_name : data.first_name;
    obj.last_name = data.last_name || this.state.customerData.payment_last_name;
    obj.email = data.email || this.state.customerData.payment_email;
    obj.telephone = data.telephone || this.state.customerData.payment_telephone;
    obj.address = data.address || this.state.customerData.payment_address;
    obj.city = data.city || this.state.customerData.payment_city;
    obj.postcode = data.postcode || this.state.customerData.payment_postcode;
    obj.country = data.country || this.state.customerData.payment_country;
  
    obj.shipping_first_name = this.state.customerData && this.state.customerData.shipping_first_name || data.first_name;
    obj.shipping_last_name = this.state.customerData && this.state.customerData.shipping_last_name || data.last_name;
    obj.shipping_email = this.state.customerData && this.state.customerData.shipping_email || data.email;
    obj.shipping_telephone = this.state.customerData && this.state.customerData.shipping_telephone || data.telephone;
    obj.shipping_address = this.state.customerData && this.state.customerData.shipping_address || data.address;
    obj.shipping_city = this.state.customerData && this.state.customerData.shipping_city || data.city;
    obj.shipping_postcode = this.state.customerData && this.state.customerData.shipping_postcode || data.postcode;
    obj.shipping_country = this.state.customerData && this.state.customerData.shipping_country || data.country;
  
    obj.order_type = this.state.customerData ? this.state.customerData.order_type : "inbound";
    obj.utm_source = data.utm_source || this.state.utm_source;
    obj.utm_medium = data.utm_medium || this.state.utm_medium;
    this.setState({ customer_id: data.id, thisCustomer: data });
  
    var deliverymethod = this.props.deliverymethods.filter(d => { return d.country == (data.country || this.state.customerData.shipping_country) });
    var paymentmethod = [];
    for (var i = 0; i < this.props.paymentmethods.length; i++) {
      if (this.props.paymentmethods[i].countries.includes(data.country)) {
        paymentmethod.push(this.props.paymentmethods[i]);
      }
    }
  
    var dm = deliverymethod.find(d => {
      return d.default_method == 1;
    }).code;
    var pm = paymentmethod.find(p => {
      return p.default_method == 1;
    }).title;
  
    this.props.setInitialValuesNewOrder(obj, { deliverymethod: dm, paymentmethod: pm });
  
    var gifts = [];
    if (this.state.selected_orders) {
      for (var i = 0; i < this.state.selected_orders.length; i++) {
        for (var j = 0; j < this.props.newOrderGifts.length; j++) {
          if (this.state.selected_orders[i].id == this.props.newOrderGifts[j].id) {
            gifts.push(this.state.selected_orders[i]);
            for (var k = 0; k < gifts.length; k++) {
              this.props.toggleGift(gifts[k].id, gifts[k].isChosen);
            }
          }
        }
      }
    }
  
    if (this.state.therapies) {
      this.state.therapies.map(t => {
        this.props.clear_therapy(t);
      });
    }
  
    if (this.state.accessories) {
      this.state.accessories.map(a => {
        this.props.clear_acc(a, "accessory");
      });
    }

    // Filter delivery methods for the customer's country
    var deliverymethod = this.props.deliverymethods.filter(d => 
        d.country == (data.country || this.state.customerData.shipping_country)
    );

    // Find the default delivery method
    var dm = deliverymethod.find(d => d.default_method == 1)?.code;


    // Ensure we have a valid delivery method before proceeding
    var deliveryMethod = deliverymethod.find(d => d.code === dm);


    var shipping_fee = deliveryMethod.price;
    var shipping_fee_to_price = deliveryMethod.to_price;

    this.setState({
        shipping_fee: shipping_fee,
        shipping_fee_to_price: shipping_fee_to_price
    });

   
  

  }

  add_new_order(obj) {
    var location = browserHistory.getCurrentLocation();
    var paymentmethod = this.state.newCustomerData == null ? this.props.initialValues.toJS().payment_method_code : this.state.newCustomerData.payment_method_code;
    var deliverymethod = this.state.newCustomerData == null ? this.props.initialValues.toJS().delivery_method_code : this.state.newCustomerData.delivery_method_code;

    var pm = this.props.paymentmethods.find((pm) => {
      return pm.code == paymentmethod || pm.title == paymentmethod;
    });
    var dm = this.props.deliverymethods.find((dm) => {
      return dm.code == deliverymethod;
    });
    var shipping_fee_order = this.state.discount != null && this.state.discount.type.toLowerCase() == "shipping" ? parseFloat(0).toFixed(2) : this.state.subtotal < this.state.shipping_fee_to_price ? parseFloat(this.state.shipping_fee).toFixed(2) : parseFloat(0).toFixed(2);

    obj = obj.toJS();

    obj.shipping_first_name = this.state.newCustomerData ? this.state.newCustomerData.shipping_first_name : this.props.initialValues.toJS().shipping_first_name;
    obj.shipping_last_name = this.state.newCustomerData ? this.state.newCustomerData.shipping_last_name : this.props.initialValues.toJS().shipping_last_name;
    obj.shipping_email = this.state.newCustomerData ? this.state.newCustomerData.payment_email : this.props.initialValues.toJS().payment_email;
    obj.shipping_telephone = this.state.newCustomerData ? this.state.newCustomerData.payment_telephone : this.props.initialValues.toJS().payment_telephone;
    obj.shipping_address = this.state.newCustomerData ? this.state.newCustomerData.shipping_address : this.props.initialValues.toJS().shipping_address;
    obj.shipping_city = this.state.newCustomerData ? this.state.newCustomerData.shipping_city : this.props.initialValues.toJS().shipping_city;
    obj.shipping_postcode = this.state.newCustomerData ? this.state.newCustomerData.shipping_postcode : this.props.initialValues.toJS().shipping_postcode;

    obj.shipping_country = this.state.newCustomerData ? this.state.newCustomerData.shipping_country : this.props.initialValues.toJS().shipping_country;

    obj.payment_first_name = this.state.newCustomerData ? this.state.newCustomerData.payment_first_name : this.props.initialValues.toJS().payment_first_name;
    obj.payment_last_name = this.state.newCustomerData ? this.state.newCustomerData.payment_last_name : this.props.initialValues.toJS().payment_last_name;
    obj.payment_email = this.state.newCustomerData ? this.state.newCustomerData.payment_email : this.props.initialValues.toJS().payment_email;
    obj.payment_telephone = this.state.newCustomerData ? this.state.newCustomerData.payment_telephone : this.props.initialValues.toJS().payment_telephone;
    obj.payment_address = this.state.newCustomerData ? this.state.newCustomerData.payment_address : this.props.initialValues.toJS().payment_address;
    obj.payment_city = this.state.newCustomerData ? this.state.newCustomerData.payment_city : this.props.initialValues.toJS().payment_city;
    obj.payment_postcode = this.state.newCustomerData ? this.state.newCustomerData.payment_postcode : this.props.initialValues.toJS().payment_postcode;
    obj.payment_country = this.state.newCustomerData ? this.state.newCustomerData.payment_country : this.props.initialValues.toJS().payment_country;

    obj.order_type = this.state.newCustomerData ? this.state.newCustomerData.order_type : this.props.initialValues.toJS().order_type;
    if (this.state.newCustomerData) {
      obj.utm_source = this.state.newCustomerData.utm_source || null;
      obj.utm_medium = this.state.newCustomerData.utm_medium || null;
    }
    else {
      delete obj.utm_source;
      delete obj.utm_medium;
    }
    obj.delivery_method_code = this.state.newCustomerData ? this.state.newCustomerData.delivery_method_code : this.props.initialValues.toJS().delivery_method_code;
    obj.payment_method_code = pm.code;
    obj.currency_code = this.props.country.code;
    obj.currency_symbol = this.props.country.symbol;

    let ccname = this.state.newCustomerData ? this.state.newCustomerData.payment_country : this.props.initialValues.toJS().payment_country;

    let l = this.props.languages[ccname]
    obj.lang = l && l[0];
    obj.payment_method_name = pm.translations[l && l[0].toUpperCase()]
    obj.currency_value = this.props.country.value;
    obj.payment_method_id = pm.id;
    obj.date_added = new Date().toISOString();
    obj.customer_id = location.query.customer_id || this.state.customer_id;

    obj.delivery_method_id = dm.id;

    obj.delivery_method_price = this.state.shipping_fee == 0 ? dm.price : this.state.shipping_fee;
    obj.delivery_method_to_price = this.state.shipping_fee_to_price == 0 ? dm.to_price : this.state.shipping_fee_to_price;

    var go = true;

    if (this.state.therapies.length == 0 && this.state.accessories.length == 0) {
      createNotification('error', 'Izberite vsaj en izdelek!');
    } else {
      obj.therapies = this.state.therapies;
      obj.accessories = this.state.accessories.map(a => {
        if (a.isGift) {
          a.reduced_price = 0;
          a.isGift = 1;
          a.is_gift = 1;
        } else {
          a.isGift = 0;
          a.is_gift = 0;
        }
        if (!a.product_id) {
          createNotification('error', 'Izberite opcijo!');
          go = false;
        }
        return a;
      });
    }

    if (go) {
      if (this.state.checked) {
        obj.additional_discount = 0;
        delete obj.additional_discount_id;
        delete obj.additionalDiscountData;
      } else {
        if (this.state.additional_discount_data && this.state.additional_discount) {
          obj.additional_discount_data = this.state.additional_discount_data
          if (obj.additional_discount_data.type == 'individual') {
            if (this.state.individualTherapies.length > 0) {
              obj.additional_discount_data.therapies = this.state.individualTherapies.map(t => {
                return t.value
              })
            } else {
              obj.additional_discount_data.therapies = this.state.th.map(t => {
                return t.id
              })
            }
          }
          else {
            delete obj.additional_discount_data.therapies;
          }
          obj.additional_discount = this.state.additional_discount
        }
      }

      if (this.state.checked && !this.state.discount) {
        obj.discount = this.state.d_value;
      } else {
        if (this.state.discount) {
          obj.discount = this.state.d_value;
          obj.discount_id = this.state.discount.id;
        }
      }

      obj.total = this.state.total;
      obj.subtotal = this.state.subtotal;
      obj.shipping_fee = parseFloat(shipping_fee_order);

      var tmp = [];

      for (var i = 0; i < this.props.newOrderGifts.length; i++) {
        if (this.props.newOrderGifts[i].isChosen == true) {
          tmp.push({ gift_id: this.props.newOrderGifts[i].id })
        }
      }
      obj.gifts = tmp;

      this.props.addNewOrder(obj);
      this.setState({ discount: null, additional_discount_data: null, additional_discount: null })
      this.props.reset();
    }
  }

  changeCustomerData(obj) {
    obj = obj.toJS();
    this.setState({ newCustomerData: obj })
  }

changeOptionSelect(accessory, event) {
  var a = this.state.accessories.filter(a => { return a.id == accessory.id });
  a.map(aa => {
    aa.product_id = event.target.value;
  })
}

isAccessoryGift(accessory) {
  this.setState(prevState => {
    const accessories = prevState.accessories.map(a => {
      if (a.id === accessory.id) {
        a.isGift = !a.isGift;
      }
      return a;
    });
    return { accessories };
  }, this.updateOrderTotals);
}

renderDiscount(discount, index) {
  return (
    <option key={index} value={discount.id}>{discount.name}</option>
  );
}

renderTherapyDetails(t_details, index)
{
  var type = "";

  if (t_details.total_price) {
    type = "therapy";
  }

  if (t_details.reduced_price) {
    type = "accessory";
  }

  return (
    <tr key={index} className="customer-information-font-size">
      <td>{t_details.name}</td>
      <td>
        {t_details.options ? <select style={{ width: '100%' }} onChange={this.changeOptionSelect.bind(this, t_details)}>
          <option></option>
          {t_details.options.map((o, index) => {
            return (
              <option key={index} value={o.id}>
                {o.name}
              </option>)
          })}
        </select>
          : ""
        }
      </td>
      <td className="center">
        {t_details.total_price ? <span onClick={this.getTherapiesNumber.bind(this, t_details, -1)} className="pointer fas fa-minus pr-3"></span> : <span onClick={this.getAccessoriesNumber.bind(this, t_details, -1)} className="pointer fas fa-minus pr-3"></span>}
        {t_details.quantity}
        {t_details.total_price ? <span onClick={this.getTherapiesNumber.bind(this, t_details, 1)} className="pointer pl-3 fas fa-plus"></span> : <span onClick={this.getAccessoriesNumber.bind(this, t_details, 1)} className="pointer pl-3 fas fa-plus"></span>}
      </td>
      <td className="center">{parseFloat(t_details.total_price || (t_details.isGift == true ? 0 : t_details.reduced_price)).toFixed(2)} {this.props.country.symbol}</td>
      <td className="center">{parseFloat(t_details.quantity * (t_details.total_price || (t_details.isGift == true ? 0 : t_details.reduced_price))).toFixed(2)} {this.props.country.symbol}</td>
      <td className="center">{t_details.options ? <input type="checkbox" checked={t_details.isGift} onClick={this.isAccessoryGift.bind(this, t_details)} className="mr-2 pointer" /> : ""}</td>
      <td className="center"><a onClick={this.remove_therapy.bind(this, t_details, type)} className="pointer"><span className="fas fa-trash"></span></a></td>
    </tr>
  )
}

renderAllGifts(gift, index)
{
  return (
    <div key={index} className="flex m-t-10">
      {gift.isChosen ? <i className="fa fa-check checked-i" aria-hidden="true"></i> : <i className="fa fa-lock lock-i" aria-hidden="true"></i>}
      <Switch checked={gift.isChosen} onChange={this.changeGift.bind(this, gift)} className="form-white flag_icon_dashboard-flag" /><span className="details-bot-cust font-new m-t-gift"> {gift.name}</span>
    </div>
  )
}

getAccessoriesNumber(t_details, value) {
  this.setState(prevState => {
    const accessories = prevState.accessories.map(a => {
      if (a.id === t_details.id) {
        a.quantity += parseInt(value);
        if (a.quantity < 1) {
          a.quantity = 1;
        }
      }
      return a;
    });
    return { accessories };
  }, this.updateOrderTotals);
}

getTherapiesNumber(t_details, value) {
  this.setState(prevState => {
    const therapies = prevState.therapies.map(t => {
      if (t.id === t_details.id) {
        t.quantity += parseInt(value);
        if (t.quantity < 1) {
          t.quantity = 1;
        }
      }
      return t;
    });
    return { therapies };
  }, this.updateOrderTotals);
}

changeGift(gift) {
  this.props.toggleGift(gift.id, !gift.isChosen)
}

remove_therapy(t, type) {
  if (type == "therapy") {
    delete t.quantity;
    this.props.delete_from_therapies(t);
    this.setState(prevState => ({
      therapies: prevState.therapies.filter(rt => rt.id !== t.id)
    }), this.updateOrderTotals);
  } else {
    delete t.quantity;
    t.isGift = false;
    t.is_gift = 0;
    this.props.delete_from_accessories(t);
    this.setState(prevState => ({
      accessories: prevState.accessories.filter(a => a.id !== t.id)
    }), this.updateOrderTotals);
  }
}

add_therapy(new_order_therapy, type) {
  if (type == "accessory") {
    this.props.clear_acc(new_order_therapy);
    this.setState(prevState => ({
      accessories: [...prevState.accessories, new_order_therapy]
    }), this.updateOrderTotals);
  } else {
    this.props.clear_therapy(new_order_therapy);
    this.setState(prevState => ({
      therapies: [...prevState.therapies, new_order_therapy]
    }), this.updateOrderTotals);
  }
}


addReklamacija() {
  this.setState({ checked: !this.state.checked })
  setTimeout(
    function () {
      if (this.state.checked) {
        this.setState({ d_value: this.state.subtotal });
        this.setState({ total: 0 });
      } else {
        var therapy_total_price = this.state.therapies.map(t => { return t.total_price * t.quantity });

        var acc_total_price = this.state.accessories.map(t => {
          if (t.quantity) {
            if (t.isGift == true) {
              return 0 * t.quantity
            } else {
              return t.reduced_price * t.quantity
            }
          }
          else {
            if (t.isGift == true) {
              t.quantity = 1
              return 0 * t.quantity;
            } else {
              t.quantity = 1
              return t.reduced_price * t.quantity
            }
          }
        });
        var sum = 0;
        var sum_total = 0;
        var discount_value = 0;
        var aDiscount = 0
        var additional_discount = 0;

        for (var i = 0; i < this.state.therapies.length; i++) {
          sum += therapy_total_price[i];
        }

        for (var i = 0; i < this.state.accessories.length; i++) {
          sum += acc_total_price[i];
        }

        if (sum < this.state.shipping_fee_to_price) {
          sum_total += sum + this.state.shipping_fee;
        }

        else {
          sum_total += sum + 0;
        }

        if (this.state.discount != null) {
          if (this.state.discount.type.toLowerCase() == "individual") {
            var individual_subtotal = 0;

            for (var i = 0; i < this.state.discount.therapies.length; i++) {
              var t = this.state.therapies.find(th => { return th.id == this.state.discount.therapies[i].id })

              if (t) {
                individual_subtotal += t.total_price * t.quantity;
                if (this.state.discount.discount_type.toLowerCase() == "percent") {
                  discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                  sum_total -= discount_value;
                }

                if (this.state.discount.discount_type.toLowerCase() == "amount") {
                  discount_value = this.state.discount.discount_value;
                  sum_total -= discount_value;
                }
              }
            }
          }

          else if (this.state.discount.type.toLowerCase() == "general") {
            if (this.state.discount.discount_type.toLowerCase() == "percent") {
              discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
              sum_total -= discount_value;
            }

            if (this.state.discount.discount_type.toLowerCase() == "amount") {
              discount_value = this.state.discount.discount_value;
              sum_total -= discount_value;
            }
          }

          else if (this.state.discount.type.toLowerCase() == "shipping") {
            if (sum < this.state.shipping_fee_to_price) {
              discount_value = this.state.shipping_fee;
            }
          }
        }

        if (this.state.additional_discount_data) {

          var type = this.state.additional_discount_data.type;
          var discount_type = this.state.additional_discount_data.discount_type;
          var discount_value_a = this.state.additional_discount_data.discount_value;

          if (discount_value_a && type && discount_type) {
            if (type.toLowerCase() == 'general') {
              if (discount_type.toLowerCase() == 'percent') {
                additional_discount = sum * (discount_value_a / 100)//sum - (sum / ((discount_value_a / 100) + 1))
              } else {
                additional_discount = discount_value_a
              }
            } else if (type.toLowerCase() == 'individual') {

              var discountTherapies = this.state.individualTherapies;
              var discountTherapies1 = this.state.th;
              var pickedTherapies = [];
              var subtotalForDiscount = 0;
              if (discountTherapies.length > 0) {
                for (var i = 0; i < discountTherapies.length; i++) {
                  var th = this.state.therapies.find(t => {
                    return t.id == discountTherapies[i].value
                  })
                  if (th) {
                    subtotalForDiscount += th.total_price * th.quantity;
                    if (discount_type.toLowerCase() == 'percent') {
                      additional_discount = subtotalForDiscount * (discount_value_a / 100)//subtotalForDiscount - (subtotalForDiscount / ((discount_value_a / 100) + 1))
                    } else {
                      additional_discount = discount_value_a
                    }
                  }
                }
              } else {
                for (var i = 0; i < discountTherapies1.length; i++) {
                  var th = this.state.therapies.find(t => {
                    return t.id == discountTherapies1[i].id
                  })
                  if (th) {
                    subtotalForDiscount += th.total_price * th.quantity;
                    if (discount_type.toLowerCase() == 'percent') {
                      additional_discount = subtotalForDiscount * (discount_value_a / 100)//subtotalForDiscount - (subtotalForDiscount / ((discount_value_a / 100) + 1))
                    } else {
                      additional_discount = discount_value_a
                    }
                  }
                }
              }
            } else if (type.toLowerCase() == 'shipping') {
              if (this.state.subtotal < this.state.shipping_fee_to_price) {
                additional_discount = this.state.shipping_fee
              }
            }

            this.setState({ additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type }, additional_discount: parseFloat(additional_discount) })
          }
        }

        this.setState({ d_value: discount_value });
        this.setState({ subtotal: sum });
        this.setState({ total: sum_total - additional_discount });
      }
    }
      .bind(this),
    0
  );
}

showPopustDiv() {
  this.setState({ popustDiv: !this.state.popustDiv, a_PopustDiv: false })
}

showAPopustDiv() {
  this.setState({ popustDiv: false, a_PopustDiv: !this.state.a_PopustDiv })
}

toggleDiscount() {
  this.setState({ discountFlag: !this.state.discountFlag, additionalDiscountFlag: false })
}

toggleAdditionalDiscount() {
  this.setState({ additionalDiscountFlag: !this.state.additionalDiscountFlag, discountFlag: false })
}

changeKuponValue(event) {
  this.setState({ discount_name: event.target.value })
}

changePopustValue(event) {
  this.setState({ popustValue: event.target.value })
}

changeDType(event) {
  this.setState({ dType: event.target.value })
}

changeDiscountType(event) {
  this.setState({ discountType: event.target.value })
}

changeIndividualTherapies(individualTherapies) {
  this.setState({ individualTherapies })
}

updateOrderTotals() {
  let subtotal = 0;
  let shipping_fee = 0;
  let discount_value = 0;

  this.state.therapies.forEach(t => {
    subtotal += t.total_price * t.quantity;
  });

  this.state.accessories.forEach(a => {
    subtotal += a.isGift ? 0 : a.reduced_price * a.quantity;
  });

  if (this.state.discount) {
    discount_value = calculateDiscount(this.state.discount, this.state);
  }

  // Recalculate the shipping fee based on the subtotal
  if (subtotal < this.state.shipping_fee_to_price) {
    shipping_fee = this.state.original_shipping_fee || this.state.shipping_fee;
  } else {
    shipping_fee = 0;
  }

  const total = subtotal - discount_value + shipping_fee;

  this.setState({
    subtotal: Math.round(subtotal * 100) / 100,
    d_value: Math.round(discount_value * 100) / 100,
    total: Math.round(total * 100) / 100,
    shipping_fee: Math.round(shipping_fee * 100) / 100,
    original_shipping_fee: this.state.original_shipping_fee || this.state.shipping_fee
  }, () => {
    // Log the values to check
  });
}

addAdditionalDiscount() {
  var type = this.state.dType;
  var discount_type = this.state.discountType;
  var discount_value = this.state.popustValue;
  var therapies = this.state.individualTherapies;
  if (discount_value && type && discount_type) {
    var aDiscount = this.calculateAdditionalDiscount({ discount_value, type, discount_type, therapies }, this.state.therapies)
    this.setState({ d_value: this.state.d_value, additional_discount_data: { discount_value: parseFloat(discount_value), type, discount_type }, additional_discount: parseFloat(aDiscount), total: this.state.total - aDiscount, popustValue: null, discountType: null, dType: null })
    this.showAPopustDiv();
  }
  this.setState({ checked: false });
  
}

calculateAdditionalDiscount(aDiscount, therapies) {
  var additional_discount = 0;
  if (aDiscount.type.toLowerCase() == 'general') {
    if (aDiscount.discount_type.toLowerCase() == 'percent') {
      additional_discount = this.state.subtotal * (aDiscount.discount_value / 100)//this.state.subtotal - (this.state.subtotal / ((aDiscount.discount_value / 100) + 1))
    } else {
      additional_discount = aDiscount.discount_value
    }
  } else if (aDiscount.type.toLowerCase() == 'individual') {

    var discountTherapies = this.state.individualTherapies;
    var discountTherapies1 = this.state.th;
    var pickedTherapies = [];
    var subtotalForDiscount = 0;
    if (discountTherapies.length > 0) {
      for (var i = 0; i < discountTherapies.length; i++) {
        var th = this.state.therapies.find(t => {
          return t.id == discountTherapies[i].value
        })
        if (th) {
          subtotalForDiscount += th.total_price * th.quantity;
          if (aDiscount.discount_type == 'percent') {
            additional_discount = subtotalForDiscount * (aDiscount.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((discount_value_a / 100) + 1))
          } else {
            additional_discount = aDiscount.discount_value
          }
        }
      }
    } else {
      for (var i = 0; i < discountTherapies1.length; i++) {
        var th = this.state.therapies.find(t => {
          return t.id == discountTherapies1[i].id
        })
        if (th) {
          subtotalForDiscount += th.total_price * th.quantity;
          if (aDiscount.discount_type == 'percent') {
            additional_discount = subtotalForDiscount * (aDiscount.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((discount_value_a / 100) + 1))
          } else {
            additional_discount = aDiscount.discount_value
          }
        }
      }
    }
  } else if (aDiscount.type.toLowerCase() == 'shipping') {
    if (this.state.shipping_fee_to_price < this.state.subtotal) {
      additional_discount = this.state.shipping_fee
    }
  }

  return additional_discount
}

renderTherapies(row, index) {
  let type = "therapy";

  return (
    <div key={index} className="col-md-3 mb-5">
      <div className="lightgray-box max-height pl-3 pr-3 pb-3 therapies-box">
        <div className="text-center pt-4 pb-4 title">
          <label>{row.name}</label>
        </div>
        <div className="row">
          <div className="col-8 text-left mb-2 subtitle">
            <label>{row.name == "DODATKI" ? "Dodatek" : "Terapija"}</label>
          </div>
          <div className="col-4 text-center mb-2 subtitle">
            <label>Cena</label>
          </div>
        </div>
        {row.therapies.filter(t => t.status === 1 || t.active === 1).map((t, index) => {
          if (t.reduced_price) {
            type = "accessory";
          }
          return (
            <div key={index} className="row pointer product-add adding-new" onClick={this.add_therapy.bind(this, t, type)}>
              <div className="col-8 text-left">
                {t.name}
              </div>
              <div className="col-4 text-center">
                {parseFloat(t.total_price || t.reduced_price).toFixed(2)} {this.props.country.symbol}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

keyPressed(event) {
  if (event.key === "Enter") {
    this.discount_data();
  }
}

render(){
  const { initialValues, countries, newOrderGifts, select_therapies,
    show_therapies, handleSubmit } = this.props;

  var deliverymethod = this.props.deliverymethods.filter(d => { return d.country == this.state.thisCustomer.country || this.state.thisOrder.country }) || {}

  var paymentmethod = [];
  for (var i = 0; i < this.props.paymentmethods.length; i++) {
    if (this.props.paymentmethods[i].countries.includes(this.state.thisCustomer.country || this.state.thisOrder.country)) {
      paymentmethod.push(this.props.paymentmethods[i]);
    }
  }

  if (show_therapies) {
    for (var i = 0; i < show_therapies.length; i++) {
      if (show_therapies[i].therapies && show_therapies[i].therapies.length > 0) {
        show_therapies[i].therapies = show_therapies[i].therapies.sort(function (a, b) {
          var price1 = show_therapies[i].name == "DODATKI" ? a.reduced_price : a.total_price;
          var price2 = show_therapies[i].name == "DODATKI" ? b.reduced_price : b.total_price;

          if (price1 < price2) {
            return -1;
          } else if (price1 == price2) {
            return 0;
          } else {
            return 1;
          }
        })
      }
    }
  }
  return (
    <div className="content-wrapper container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h2 className="box-title">Novo naročilo</h2>
        </div>
      </div>
      <div className="box box-default">
        <div className="row py-4">
          <form className="col-md-12" onSubmit={handleSubmit(this.add_new_order.bind(this))}>
            <CustomerDetails thisCustomer={this.state.thisCustomer} paymentmethods={paymentmethod} deliverymethods={deliverymethod}
              utmmedia={this.props.utmmedia} order_types={this.props.order_types} initialValues={initialValues}
              countries={countries} onChange={this.changeCustomerData.bind(this)} />
            <div className="row mb-4">
              <div className="col-md-12 mb-0 mt-4">
                <label>IZBERI IZDELEK</label>
              </div>
            </div>
            <div className="row mb-4">
              {show_therapies && show_therapies.map(this.renderTherapies.bind(this))}
            </div>
            <label className="mb-4 mt-4">NAROČILO</label>
            <div className="row">
              <div className={`col-md-2`}>
                <div className={``}>
                  {newOrderGifts && newOrderGifts.map(this.renderAllGifts.bind(this))}
                </div>
              </div>
              <div className={`col-md-10 mb-5`}>
                <div className="row justify-content-center order-details-wrap">
                  <div className="col-md-6" >
                    <table className="table ">
                      <thead>
                        <tr>
                          <th><label className="therapies-table-label-text-size">IZDELEK</label></th>
                          <th><label className="therapies-table-label-text-size">OPCIJE</label></th>
                          <th className="center"><label className="therapies-table-label-text-size">ŠT. PRODUKTOV</label></th>
                          <th className="center"><label className="therapies-table-label-text-size">CENA NA KOS</label></th>
                          <th className="center"><label className="therapies-table-label-text-size">SKUPAJ</label></th>
                          <th className="center"><label className="therapies-table-label-text-size">DARILO</label></th>
                          <th className="center"><label className="therapies-table-label-text-size">ODSTRANI</label></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.therapies.map(this.renderTherapyDetails.bind(this))}
                        {this.state.accessories.map(this.renderTherapyDetails.bind(this))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="text-right column border-top-table" colSpan="6"><label className="therapies-table-label-text-size">SUB-TOTAL</label></td>
                          <td className="center border-top-table customer-information-font-size">{parseFloat(this.state.subtotal).toFixed(2)} {this.props.country && this.props.country.symbol}</td>
                        </tr>
                        <tr>
                          <td className="text-right column" colSpan="6"><label className="therapies-table-label-text-size">POPUST</label></td>
                          <td className="text-center customer-information-font-size">{this.state.d_value != 0 ? parseFloat(this.state.d_value).toFixed(2) : parseFloat(0).toFixed(2)}
                            {this.props.country && this.props.country.symbol}
                          </td>
                        </tr>
                        {this.state.additional_discount_data && <tr>
                          <td className="text-right column" colSpan="6"><label className="therapies-table-label-text-size">DODATNI POPUST</label></td>
                          <td className="text-center customer-information-font-size">{this.state.checked ? parseFloat(0).toFixed(2) : parseFloat(this.state.additional_discount).toFixed(2)}
                            {this.props.country && this.props.country.symbol}
                          </td>
                        </tr>}
                        <tr>
                          <td className="text-right column" colSpan="6"><label className="therapies-table-label-text-size">DOSTAVA</label></td>
                          <td className=" center customer-information-font-size">{this.state.checked ? parseFloat(0).toFixed(2) : this.state.subtotal < this.state.shipping_fee_to_price ? parseFloat(this.state.shipping_fee).toFixed(2) : parseFloat(0).toFixed(2)} {this.props.country && this.props.country.symbol}</td>
                        </tr>
                        <tr>
                          <td className="column last-total-t td_total_font_size" colSpan="5"></td>
                          <td className="text-right column last-total-t td_total_font_size border-top-table"><b>SKUPAJ</b></td>
                          <td className="center last-total td_total_font_size border-top-table">{parseFloat(this.state.total).toFixed(2)} {this.props.country && this.props.country.symbol}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {this.state.discountFlag ? <div className={`pt-3 pb-3 show col-md-4 blue-back`}>
                    <label className="upsell-headers pb-4">KUPON</label>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="input-group input mb-3">
                          <label className="control-label">Vnesi kodo kupona</label>
                          <div className="flex">
                            <input type="text" onKeyPress={this.keyPressed.bind(this)} value={this.state.discount_name} className="form-control mr-10" onChange={this.changeKuponValue.bind(this)} />
                            <button type="button" onClick={this.discount_data.bind(this)} className={`btn-cta cta-active cta-big`}><i className="fa fa-heart"></i> Potrdi</button>
                          </div>
                        </div>
                        {/* <CouponForm submitCode={this.discount_data.bind(this)} /> */}
                        <div className="mt-10">
                          <p>Tip: {this.state.discount && this.state.discount.type}<b></b></p>
                          <p>Vrsta popusta: {this.state.discount && this.state.discount.discount_type}<b></b></p>
                          <p>Vrednost: {this.state.discount && this.state.discount.discount_value}<b></b></p>
                        </div>
                      </div>
                    </div>
                  </div> : ""}
                  {this.state.additionalDiscountFlag ? <div className={`pt-3 pb-3 show col-md-4 blue-back`}>
                    <label className="upsell-headers pb-4">DODATNI POPUST</label>
                    <div className="row">
                      <div className="col-lg-12 mb-10">
                        <input placeholder="Vnesi vrednost popusta" type="number" value={this.state.popustValue} className="form-control" onChange={this.changePopustValue.bind(this)} />
                      </div>
                      <div className="col-lg-12 mb-10">
                        <select className="form-control" value={this.state.dType} onChange={this.changeDType.bind(this)}>
                          <option value="">Izberi vrsto popusta</option>
                          <option value="individual">Individual</option>
                          <option value="general">General</option>
                          <option value="shipping">Shipping</option>
                        </select>
                      </div>
                      {this.state.dType == 'individual' ? <div className="col-lg-12 mb-10 popust-select">
                        <Select
                          className="form-control"
                          name=""
                          placeholder="Izberi terapije"
                          value={this.state.individualTherapies}
                          onChange={this.changeIndividualTherapies.bind(this)}
                          options={select_therapies.map(tt => { return { label: tt.name, value: tt.id } })}
                          multi={true}
                        />
                      </div> : ''}
                      <div className="col-lg-12 mb-10">
                        <select className="form-control" value={this.state.discountType} onChange={this.changeDiscountType.bind(this)}>
                          <option value="">Izberi tip popusta</option>
                          <option value="amount">Vsota</option>
                          <option value="percent">Procent</option>
                        </select>
                      </div>
                      <div className="col-lg-12">
                        <button type="button" onClick={this.addAdditionalDiscount.bind(this)} className={`btn-cta cta-active mb-10`}>Potrdi</button>
                      </div>
                    </div>
                  </div> : ''}
                  <div className="col-md-2">
                    <div>
                      <button onClick={this.toggleDiscount.bind(this)} type="button" className={`pointer btn-cta ${this.state.discountFlag && 'cta-active'} mb-10`}>Kupon</button>
                    </div>
                    <div>
                      <button onClick={this.toggleAdditionalDiscount.bind(this)} type="button" className={`pointer btn-cta ${this.state.additionalDiscountFlag && 'cta-active'} mb-10`}>Popust</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 center mt-5">
                <div className="my-3">
                  <input checked={this.state.checked} onClick={this.addReklamacija.bind(this)} type="checkbox" className="mr-2 pointer" />
                  <label>Reklamacija</label>
                </div>
                <button type="submit" className="btn btn-primary">Shrani in nadaljuj</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
 }

const mapDispatchToProps = (dispatch) => {
  return {
    clear_therapy: (obj) => {
      dispatch(clear_therapy(obj));
    },

    clear_acc: (obj) => {
      dispatch(clear_acc(obj));
    },

    delete_from_therapies: (obj) => {
      dispatch(delete_from_therapies(obj));
    },

    delete_from_accessories: (obj) => {
      dispatch(delete_from_accessories(obj));
    },

    addNewOrder: (obj) => {
      dispatch(addNewOrder(obj));
    },

    toggleGift: (id, flag) => {
      dispatch(toggleGift(id, flag));
    },

    setInitialValuesNewOrder: (obj, id) => {
      dispatch(setInitialValuesNewOrder(obj, id))
    }
  }
}

function calculateDiscount(discount, order) {
  if (!discount) {
    return 0;
  }

  var discount_value = 0;
  var tip = discount.type.toLowerCase();
  if (tip != "shipping") {
    var tip_popusta = discount.discount_type.toLowerCase();
    var vrednost_popusta = discount.discount_value;
    var min_order_amount = discount.min_order_amount;
    if (tip == "individual" && tip_popusta == "percent") {
      discount_value = 0;
      for (var i = 0; i < discount.therapies.length; i++) {
        var elt = discount.therapies[i].id;
        var tmp = order.therapies.find(t => {
          return t.id == elt
        });
        if (tmp) {
          discount_value += tmp.quantity * tmp.total_price * (vrednost_popusta / 100);
        }
      }
      for (var i = 0; i < discount.accessories.length; i++) {
        var elt = discount.accessories[i].id;
        var tmp1 = order.accessories.find(t => {
          return t.id == elt
        });
        if (tmp1) {
          discount_value += tmp1.quantity * tmp1.reduced_price * (vrednost_popusta / 100);
        }
      }
      return discount_value;
    } else if (tip == "individual" && tip_popusta == "amount") {
      discount_value = 0;
      for (var i = 0; i < discount.therapies.length; i++) {
        var elt = discount.therapies[i].id;
        var tmp = order.therapies.find(t => {
          return t.id == elt
        });
        if (tmp) {
          discount_value += (tmp.quantity * vrednost_popusta);
        }
      }
      return discount_value;
    } else if (tip == "general" && tip_popusta == "percent") {
      var therapiesInCart = order.therapies || "";
      var bundles = [];
      for (var i = 0; i < therapiesInCart.length; i++) {
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
      if (min_order_amount == null || (min_order_amount < order.subtotal)) {
        discount_value = (order.subtotal - sumBundle) * (vrednost_popusta / 100);
      } else {
        discount_value = 0;
      }
      return discount_value;
    } else if (tip_popusta == "amount") {
      if (min_order_amount == null || (min_order_amount < order.subtotal)) {
        discount_value = vrednost_popusta;
      } else {
        discount_value = 0;
      }
      return discount_value;
    } else if (tip == "free product") {
      if (min_order_amount == null || (min_order_amount < order.subtotal)) {
        var freeTherapies = discount.free_therapies;
        var newTherapies = Array.from(order.therapies);
        var freeAccessories = discount.free_accessories;
        var newAccessories = Array.from(order.accessories);
        var discount = 0;

        if (freeTherapies && freeTherapies.length) {
          freeTherapies.forEach(element => {
            if (!order.therapies.some(therapy => therapy.id === element.id && therapy.isFreeProduct)) {
              element.product_quantity = 1;
              element.quantity = 1;
              element.isGift = 1;
              element.price = element.total_price;
              element.isFreeProduct = 1;
              newTherapies.push(element);
              discount += +element.total_price;
            }
          })
        }

        if (freeAccessories && freeAccessories.length) {
          freeAccessories.forEach(element => {
            if (!order.accessories.some(acc => acc.id === element.id && acc.isFreeProduct)) {
              element.product_quantity = 1;
              element.quantity = 1;
              element.isFreeProduct = 1;
              element.product_id = element.product_id;
              element.price = element.reduced_price;
              newAccessories.push(element);
              discount += +element.reduced_price;
            }
          })
        }

        if (typeof discount == 'number') {
          if (tip_popusta == "percent") {
            discount_value = (order.subtotal * (vrednost_popusta / 100)) + discount;
            order.subtotal = order.subtotal + discount;
          } else {
            discount_value = discount_value + discount + vrednost_popusta;
            order.subtotal = order.subtotal + discount + vrednost_popusta;
          }
        }

        order.therapies = newTherapies;
        order.accessories = newAccessories;

      }
      return discount_value;
    }

  } else if (tip == "shipping") {
    discount_value = order.delivery_method_price;
    return discount_value;
  }

  discount_value = Math.round(100 * discount_value) / 100;
  order.total = order.subtotal - discount_value + order.delivery_method_price;
  order.total = Math.round(100 * order.total) / 100;
  if (order.total < 0) order.total = 0;

  return discount_value;
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    initialValues: Immutable.fromJS(nextState.customer_profile_data.initialValuesNewOrder),
    paymentmethods: nextState.main_data.paymentmethods,
    deliverymethods: nextState.main_data.deliverymethods,
    countries: nextState.main_data.countries,
    utmmedia: nextState.main_data.utmmedia,
    formValues: nextState.form.NewOrderForm && nextState.form.NewOrderForm.values,
    customer: nextState.customer_profile_data.customer,
    discounts: nextState.main_data.discounts,
    orders: nextState.order_details_data.orders,
    ordersCount: nextState.order_details_data.ordersCount,
    order_types: [{ label: 'inbound', value: 'inbound' }, { label: 'splet', value: 'splet' }, { label: 'baza', value: 'baza' }, { label: 'rojstni dan', value: 'rojstni_dan' }],
    colors: nextState.colors_data.colors,
    gifts: nextState.main_data.gifts,
    newOrderGifts: nextState.customer_profile_data.newOrderGifts,
    products: nextState.main_data.products,
    accessories: nextState.main_data.accessories,
    localTherapies: nextState.customer_profile_data.localTherapies,
    localAcc: nextState.customer_profile_data.localAcc,
    deliveryMethod: nextState.customer_profile_data.deliveryMethod,
    country: nextState.customer_profile_data.country,
    currencies: nextState.main_data.currencies,
    show_therapies: nextState.customer_profile_data.show_therapies,
    select_therapies: nextState.customer_profile_data.select_therapies,
    languages: nextState.main_data.languages
  }
}

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.shipping_first_name) {
    errors.shipping_first_name = 'Obvezno polje';
  }

  if (!values.shipping_last_name) {
    errors.shipping_last_name = 'Obvezno polje';
  }

  if (!values.shipping_email) {
    errors.shipping_email = 'Obvezno polje';
  }

  if (!values.shipping_telephone) {
    errors.shipping_telephone = 'Obvezno polje';
  }

  if (!values.shipping_address) {
    errors.shipping_address = 'Obvezno polje';
  }

  if (!values.shipping_city) {
    errors.shipping_city = 'Obvezno polje';
  }

  if (!values.shipping_postcode) {
    errors.shipping_postcode = 'Obvezno polje';
  }

  if (!values.shipping_country) {
    errors.shipping_country = 'Obvezno polje';
  }

  if (!values.payment_method_code) {
    errors.payment_method_code = 'Obvezno polje';
  }

  if (!values.delivery_method_code) {
    errors.delivery_method_code = 'Obvezno polje';
  }

  if (!values.order_type) {
    errors.order_type = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewOrderForm',
    enableReinitialize: true,
    validate
  }), connect(mapStateToProps, mapDispatchToProps)
)(NewOrder);
