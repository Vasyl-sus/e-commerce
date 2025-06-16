import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import { createNotification } from '../../App.js'
import { ROOT_URL } from '../../config/constants';
import InfluencerDetails from './influencer_details_form.js';
import axios from "axios";
import { clear_therapy, clear_acc, delete_from_therapies, delete_from_accessories,
setInitialValuesNewOrderInfluencer, addNewOrder } from '../../actions/influencers_actions';

class NewInfluencerOrder extends Component {
    constructor(props) {
      super(props);

      this.state = {therapy:[], accessories: [], hidden: "", therapies:[], currency: null, discount: null, deliveryMethod: null, subtotal:0, shipping_fee:0, a_PopustDiv:false,
      shipping_fee_to_price:0, total:0, d_value:0, deliverymethod_id:0, new_order_gifts:[], popustDiv: false, newInfluencerData:null, therapiesNumber:1,
      popustValue: null, dType: null, discountType: null, individualTherapies:[], customer_id: null};
    }

    componentDidMount(){
      var location = browserHistory.getCurrentLocation();
      var influencer_id = location.query.id;
      var order_id = location.query.order_id;
      browserHistory.replace(location);

      if (influencer_id)
        this.getInfluencerDetails(influencer_id);
      else
        this.getOrderDetails(order_id);
    };

    add_new_order(obj)
    {
      var location = browserHistory.getCurrentLocation();
      var paymentmethod = this.state.newInfluencerData == null ? this.props.initialValues.toJS().payment_method_code : this.state.newInfluencerData.payment_method_code;
      var deliverymethod = this.state.newInfluencerData == null ? this.props.initialValues.toJS().delivery_method_code : this.state.newInfluencerData.delivery_method_code;
      var pm = this.props.paymentmethods.find((pm) => {
        return pm.code == paymentmethod;
      });
      var dm = this.props.deliverymethods.find((dm) => {
        return dm.code == deliverymethod && dm.is_other == 1;
      });

      var shipping_fee_order = this.state.discount != null && this.state.discount.type.toLowerCase() == "shipping" ? parseFloat(0).toFixed(2) : this.state.subtotal < this.state.shipping_fee_to_price ? parseFloat(this.state.shipping_fee).toFixed(2) : parseFloat(0).toFixed(2);

      obj = obj.toJS();

      obj.shipping_first_name = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_first_name : this.props.initialValues.toJS().shipping_first_name;
      obj.shipping_last_name = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_last_name : this.props.initialValues.toJS().shipping_last_name;
      obj.shipping_email = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_email : this.props.initialValues.toJS().shipping_email;
      obj.shipping_telephone = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_telephone : this.props.initialValues.toJS().shipping_telephone;
      obj.shipping_address = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_address : this.props.initialValues.toJS().shipping_address;
      obj.shipping_city = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_city : this.props.initialValues.toJS().shipping_city;
      obj.shipping_postcode = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_postcode.toString() : this.props.initialValues.toJS().shipping_postcode.toString();
      obj.shipping_country = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_country : this.props.initialValues.toJS().shipping_country;
      obj.order_type = this.state.newInfluencerData ? this.state.newInfluencerData.order_type : this.props.initialValues.toJS().order_type;
      obj.description = this.state.newInfluencerData ? this.state.newInfluencerData.description : null;
      obj.tracking_code = this.state.newInfluencerData ? this.state.newInfluencerData.tracking_code : null;
      if(this.state.newInfluencerData) {
        obj.utm_source = this.state.newInfluencerData.utm_source || null;
        obj.utm_medium = this.state.newInfluencerData.utm_medium || null;
      }
      else {
        delete obj.utm_source;
        delete obj.utm_medium;
      }
      obj.delivery_method_code = this.state.newInfluencerData ? this.state.newInfluencerData.delivery_method_code : this.props.initialValues.toJS().delivery_method_code;
      obj.payment_method_code = this.state.newInfluencerData ? this.state.newInfluencerData.payment_method_code : this.props.initialValues.toJS().payment_method_code;
      obj.currency_code = this.props.country.code;
      obj.currency_symbol = this.props.country.symbol;
      let ccname = this.state.newInfluencerData ? this.state.newInfluencerData.shipping_country : this.props.initialValues.toJS().shipping_country;

      let l = this.props.languages[ccname]
      obj.lang = l && l[0];
      obj.currency_value = this.props.country.value;
      obj.payment_method_id = pm.id;
      obj.date_added = new Date().toISOString();
      obj.customer_id = this.state.customer_id;
      obj.influencer_id = this.state.influencer_id;;
      obj.delivery_method_id = this.state.deliverymethod_id == 0 ? dm.id : this.state.deliverymethod_id;
      obj.delivery_method_price = this.state.shipping_fee == 0 ? dm.price : this.state.shipping_fee;
      obj.delivery_method_to_price = this.state.shipping_fee_to_price == 0 ? dm.to_price : this.state.shipping_fee_to_price;

      var go = true;

      if(this.state.therapies.length == 0 && this.state.accessories.length == 0) {
        createNotification('error', 'Izberite vsaj en izdelek!');
      } else {
        obj.therapies = this.state.therapies;
        obj.accessories = this.state.accessories.map(a => {
          if(a.is_gift == 1) {
            a.reduced_price = 0;
            a.isGift = 1;
          }
          if (!a.product_id) {
            createNotification('error', 'Izberite opcijo!');
            go = false;
          }
          return a;
        });
      }

      if(go) {
        if (this.state.additional_discount_data && this.state.additional_discount) {
          obj.additional_discount_data = this.state.additional_discount_data
          if (obj.additional_discount_data.type == 'individual') {
            if(this.state.individualTherapies.length > 0) {
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

        if (this.state.discount) {
          obj.discount = this.state.d_value;
          obj.discount_id = this.state.discount.id;
        }

        obj.total = 0;//this.state.total;
        obj.subtotal = this.state.subtotal;
        obj.shipping_fee = parseInt(shipping_fee_order);

        this.props.addNewOrder(obj, location.query.id);
        this.props.reset();
      }
    }

    async getOrderDetails(order_id) {
      var result = await axios.get(`${ROOT_URL}/admin/order/details/${order_id}`);
      var data = result.data.order;
      var obj = {};
      obj.first_name = data.shipping_first_name
      obj.last_name = data.shipping_last_name;
      obj.email = data.shipping_email;
      obj.telephone = data.shipping_telephone;
      obj.address = data.shipping_address;
      obj.city = data.shipping_city;
      obj.postcode = data.shipping_postcode;
      obj.country = data.shipping_country;
      obj.order_type = data.order_type ? data.order_type : "influencer";
      obj.utm_source = data.discountData ? data.discountData.utm_source : data.utm_source;
      obj.utm_medium = data.discountData ? data.discountData.utm_medium : data.utm_medium;
      obj.description = data.description ? data.description : null;
      obj.tracking_code = data.tracking_code ? data.tracking_code : null;
      this.setState({customer_id: data.customer_id})
      this.setState({influencer_id: data.customer_id})
      this.setState({order_id: data.id})
      if(data.additional_discount_id) {
        this.setState({ad_id: data.additional_discount_id})
      }

      this.props.setInitialValuesNewOrderInfluencer(obj, {deliverymethod: data.delivery_method_code, paymentmethod: data.payment_method_code});

      if (data.therapies) {
        data.therapies.map(t => {
          this.add_therapy(t)
        })
      }

      if (data.accessories) {
        for(var i=0; i<this.props.accessories.length; i++) {
          for(var j=0; j<data.accessories.length; j++) {
            if(this.props.accessories[i].id == data.accessories[j].id) {
              data.accessories[j].options = this.props.accessories[i].options;
            }
          }
        }
        data.accessories.map(t => {
          this.add_therapy(t, "accessory");
        })
      }

      if (data.discountData) {
        this.setState({discount_name: data.discountData.name})
        this.discount_data();
      }

      if(data.additionalDiscountData) {
        var dValue = data.additionalDiscountData.discount_value;
        var type = data.additionalDiscountData.type;
        var discount_type = data.additionalDiscountData.discount_type;
        this.setState({additional_discount_data: { discount_value: parseFloat(dValue), type, discount_type }, additional_discount: data.additional_discount, th: data.additionalDiscountData.therapies})
        this.setState({total: data.total})
      }
    }

    async getInfluencerDetails(influencer_id) {
      var result = await axios.get(`${ROOT_URL}/admin/influencers/${influencer_id}`);
      var data = result.data.influencer;
      var obj = {};
      obj.first_name = this.state.influencerData ? this.state.influencerData.shipping_first_name : data.first_name;
      obj.last_name = this.state.influencerData ? this.state.influencerData.shipping_last_name : data.last_name;
      obj.email = this.state.influencerData ? this.state.influencerData.shipping_email : data.email;
      obj.telephone = this.state.influencerData ? this.state.influencerData.shipping_telephone : data.telephone;
      obj.address = this.state.influencerData ? this.state.influencerData.shipping_address : data.address;
      obj.city = this.state.influencerData ? this.state.influencerData.shipping_city : data.city;
      obj.postcode = this.state.influencerData ? this.state.influencerData.shipping_postcode : data.postcode;
      obj.country = this.state.influencerData ? this.state.influencerData.shipping_country : data.country;
      obj.order_type = this.state.influencerData ? this.state.influencerData.order_type : "influencer";
      obj.tracking_code = this.state.influencerData ? this.state.influencerData.tracking_code : null;
      obj.description = this.state.influencerData ? this.state.influencerData.description : null;
      obj.utm_source = data.utm_source || this.state.utm_source;
      obj.utm_medium = data.utm_medium || this.state.utm_medium;
      this.setState({customer_id: data.id})
      this.setState({influencer_id: data.id})

      var deliverymethod = this.props.deliverymethods.filter(d => {return d.country == (data.country || this.state.influencerData.shipping_country) && d.is_other == 1});
      var paymentmethod = [];
      for(var i=0; i<this.props.paymentmethods.length; i++) {
        if(this.props.paymentmethods[i].countries.includes(data.country)) {
          paymentmethod.push(this.props.paymentmethods[i]);
        }
      }

      var dm = this.state.influencerData ? this.state.influencerData.delivery_method_code : deliverymethod[0].code;
      var pm = this.state.influencerData ? this.state.influencerData.payment_method_code : paymentmethod[0].code;
      this.props.setInitialValuesNewOrderInfluencer(obj, {deliverymethod: dm, paymentmethod: pm});

      if (this.state.therapies) {
        this.state.therapies.map(t => {
          this.props.clear_therapy(t)
        })
      }

      if (this.state.accessories) {
        this.state.accessories.map(a => {
          this.props.clear_acc(a, "accessory");
        })
      }
    }

    changeInfluencerData(obj) {
      obj = obj.toJS();
      this.setState({newInfluencerData: obj})
    }

    discount_data(event)
    {
      var discount_value = 0;
      var sum_total = 0;
      var aDiscount = 0
      var additional_discount = 0;
      var selectedDiscount = this.state.discount_name;
      var d = this.props.discounts.find((d) => {
        return d.name == selectedDiscount;
      });

      if(d != null && d.utm_medium != null && d.utm_source != null) {
        this.setState({utm_medium: d.utm_medium, utm_source: d.utm_source})
        this.setState({influencerData: this.state.newInfluencerData})
        if(this.state.influencer_id)
          this.getInfluencerDetails(this.state.influencer_id);
        else
          this.getOrderDetails(this.state.order_id);
      }

      if(d != null)
      {
        if(d.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<d.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == d.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;

              if(d.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (d.discount_value / 100)//individual_subtotal - (individual_subtotal / ((d.discount_value / 100) + 1))
              }

              if(d.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  d.discount_value;
              }
            }
          }
        }

        else if(d.type.toLowerCase() == "general")
        {
          if(d.discount_type.toLowerCase() == "percent")
          {
             discount_value = this.state.subtotal * (d.discount_value / 100)//this.state.subtotal - (this.state.subtotal / ((d.discount_value / 100) + 1))
          }

          if(d.discount_type.toLowerCase() == "amount")
          {
             discount_value =  d.discount_value;
          }
        }

        else if(d.type.toLowerCase() == "shipping")
        {
          if(this.state.subtotal < this.state.shipping_fee_to_price)
          {
            discount_value = this.state.shipping_fee;
          }
        }
      }

      if(this.state.subtotal < this.state.shipping_fee_to_price)
      {
        sum_total += this.state.subtotal + this.state.shipping_fee;
      }

      else
      {
        sum_total += this.state.subtotal + 0;
      }

      if (this.state.additional_discount_data) {

        var type = this.state.additional_discount_data.type;
        var discount_type = this.state.additional_discount_data.discount_type;
        var discount_value_a = this.state.additional_discount_data.discount_value;

        if (discount_value_a && type && discount_type) {
          if (type.toLowerCase() == 'general') {
            if (discount_type.toLowerCase() == 'percent') {
              additional_discount = this.state.subtotal * (discount_value_a / 100)//this.state.subtotal - (this.state.subtotal / ((discount_value_a / 100) + 1))
            } else {
              additional_discount = discount_value_a
            }
          } else if (type.toLowerCase() == 'individual') {

            var discountTherapies = this.state.individualTherapies;
            var discountTherapies1 = this.state.th;
            var pickedTherapies = [];
            var subtotalForDiscount = 0;
            if(discountTherapies.length > 0) {
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

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type }, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({discount: d});
      this.setState({d_value: discount_value});
      this.setState({total: sum_total - discount_value - additional_discount});
      this.setState({checked: false});
    }

    changeOptionSelect(accessory, event) {
      var a = this.state.accessories.filter(a => {return a.id == accessory.id});
      a.map(aa => {
        aa.product_id = event.target.value;
      })
    }

    isAccessoryGift(accessory) {
      var a = this.state.accessories.find(a => {return a.id == accessory.id});
      // a.map(aa => {
        if(!a.isGift) {
          a.is_gift = 1;
          a.isGift = true
        } else {
          a.is_gift = 0;
          a.isGift = false;
        }
      // })

      var therapy_total_price = this.state.therapies.map(t => {return t.total_price*t.quantity});

      var acc_total_price = this.state.accessories.map(t => {
        if(t.quantity) {
          if(t.isGift == true) {
            return 0*t.quantity
          } else {
            return t.reduced_price*t.quantity
          }
        }
        else {
          if(t.isGift == true) {
            t.quantity = 1
            return 0*t.quantity;
          } else {
            t.quantity = 1
            return t.reduced_price*t.quantity
          }
        }
      });
      var sum = 0;
      var sum_total = 0;
      var discount_value = 0;
      var aDiscount = 0
      var additional_discount = 0;

      for(var i=0; i<this.state.therapies.length; i++)
      {
        sum += therapy_total_price[i];
      }

      for(var i=0; i<this.state.accessories.length; i++)
      {
        sum += acc_total_price[i];
      }

      if(sum < this.state.shipping_fee_to_price)
      {
        sum_total += sum + this.state.shipping_fee;
      }

      else
      {
        sum_total += sum + 0;
      }

      if(this.state.discount != null)
      {
        if(this.state.discount.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<this.state.discount.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == this.state.discount.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;
              if(this.state.discount.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                 sum_total -= discount_value;
              }

              if(this.state.discount.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  this.state.discount.discount_value;
                 sum_total -= discount_value;
              }
            }
          }
        }

        else if(this.state.discount.type.toLowerCase() == "general")
        {
          if(this.state.discount.discount_type.toLowerCase() == "percent")
          {
             discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
             sum_total -= discount_value;
          }

          if(this.state.discount.discount_type.toLowerCase() == "amount")
          {
             discount_value =  this.state.discount.discount_value;
             sum_total -= discount_value;
          }
        }

        else if(this.state.discount.type.toLowerCase() == "shipping")
        {
          if(sum < this.state.shipping_fee_to_price)
          {
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
            if(discountTherapies.length > 0) {
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

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type}, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({d_value: discount_value});
      this.setState({subtotal: sum});
      this.setState({total: sum_total - additional_discount});
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

      return(
        <tr key={index} className="customer-information-font-size">
          <td>{t_details.name}</td>
          <td>
            {t_details.options ? <select style={{width: '100%'}} onChange={this.changeOptionSelect.bind(this, t_details)}>
              <option></option>
              {t_details.options.map((o, index) => {
                return (<option key={index} value={o.id}>
                  {o.name}
                </option>)
              })}
            </select> : ""}
          </td>
          <td className="center">
            {t_details.total_price ? <span onClick={this.getTherapiesNumber.bind(this, t_details, -1)} className="pointer fas fa-minus pr-3"></span> : <span onClick={this.getAccessoriesNumber.bind(this, t_details, -1)} className="pointer fas fa-minus pr-3"></span>}
            {t_details.quantity}
            {t_details.total_price ? <span onClick={this.getTherapiesNumber.bind(this, t_details, 1)} className="pointer pl-3 fas fa-plus"></span> : <span onClick={this.getAccessoriesNumber.bind(this, t_details, 1)} className="pointer pl-3 fas fa-plus"></span>}
          </td>
          <td className="center">{parseFloat(t_details.total_price || (t_details.isGift == true ? 0 : t_details.reduced_price)).toFixed(2)} {this.props.country.symbol}</td>
          <td className="center">{parseFloat(t_details.quantity * (t_details.total_price || (t_details.isGift == true ? 0 : t_details.reduced_price))).toFixed(2)} {this.props.country.symbol}</td>
          <td className="center">{t_details.options ? <input type="checkbox" checked={t_details.isGift} onClick={this.isAccessoryGift.bind(this, t_details)} className="mr-2 pointer"/> : ""}</td>
          <td className="center"><a onClick={this.remove_therapy.bind(this, t_details, type)} className="pointer"><span className="fas fa-trash"></span></a></td>
        </tr>
      )
    }

    getAccessoriesNumber(t_details, value) {
      var t = this.state.accessories.filter(t => {return t.id == t_details.id});
      t.map(tt => {
        tt.quantity += parseInt(value);
        if(tt.quantity < 1) {
          tt.quantity = 1;
        }
      })
      var therapy_total_price = this.state.therapies.map(t => {return t.total_price*t.quantity});
      var acc_total_price = this.state.accessories.map(t => {
        if(t.quantity) {
          if(t.isGift == true) {
            return 0*t.quantity
          } else {
            return t.reduced_price*t.quantity
          }
        }
        else {
          if(t.isGift == true) {
            t.quantity = 1
            return 0*t.quantity;
          } else {
            t.quantity = 1
            return t.reduced_price*t.quantity
          }
        }
      });
      var sum = 0;
      var sum_total = 0;
      var discount_value = 0;
      var aDiscount = 0
      var additional_discount = 0;

      var deliverymethod_order = this.state.newCustomerData == null ? this.props.deliveryMethod[0].code : this.state.newCustomerData.delivery_method_code;
      var dm = this.props.deliveryMethod.find((dm) => {
        return dm.code == deliverymethod_order;
      });

      for(var i=0; i<this.state.therapies.length; i++)
      {
        sum += therapy_total_price[i];
      }

      for(var i=0; i<this.state.accessories.length; i++)
      {
        sum += acc_total_price[i];
      }

      if(sum < dm.to_price)
      {
        sum_total += sum + dm.price;
      }

      else
      {
        sum_total += sum + 0;
      }

      if(this.state.discount != null)
      {
        if(this.state.discount.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<this.state.discount.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == this.state.discount.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;
              if(this.state.discount.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                 sum_total -= discount_value;
              }

              if(this.state.discount.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  this.state.discount.discount_value;
                 sum_total -= discount_value;
              }
            }
          }
        }

        else if(this.state.discount.type.toLowerCase() == "general")
        {
          if(this.state.discount.discount_type.toLowerCase() == "percent")
          {
             discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
             sum_total -= discount_value;
          }

          if(this.state.discount.discount_type.toLowerCase() == "amount")
          {
             discount_value =  this.state.discount.discount_value;
             sum_total -= discount_value;
          }
        }

        else if(this.state.discount.type.toLowerCase() == "shipping")
        {
          if(sum < dm.to_price)
          {
            discount_value = dm.price;
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
            if(discountTherapies.length > 0) {
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
            if (sum < dm.to_price) {
              additional_discount = dm.price
            }
          }

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type}, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({d_value: discount_value});
      this.setState({subtotal: sum});
      this.setState({total: sum_total - additional_discount});
      this.setState({shipping_fee_to_price: dm.to_price});
      this.setState({shipping_fee: dm.price});
      this.setState({deliverymethod_id: dm.id});
      this.setState({checked: false});
    }

    getTherapiesNumber(t_details, value) {
      var t = this.state.therapies.filter(t => {return t.id == t_details.id});
      t.map(tt => {
        tt.quantity += parseInt(value);
        if(tt.quantity < 1) {
          tt.quantity = 1;
        }
      })
      var therapy_total_price = this.state.therapies.map(t => {return t.total_price*t.quantity});
      var acc_total_price = this.state.accessories.map(t => {
        if(t.quantity) {
          if(t.isGift == true) {
            return 0*t.quantity
          } else {
            return t.reduced_price*t.quantity
          }
        }
        else {
          if(t.isGift == true) {
            t.quantity = 1
            return 0*t.quantity;
          } else {
            t.quantity = 1
            return t.reduced_price*t.quantity
          }
        }
      });
      var sum = 0;
      var sum_total = 0;
      var discount_value = 0;
      var aDiscount = 0
      var additional_discount = 0;

      var deliverymethod_order = this.state.newCustomerData == null ? this.props.deliveryMethod[0].code : this.state.newCustomerData.delivery_method_code;
      var dm = this.props.deliveryMethod.find((dm) => {
        return dm.code == deliverymethod_order;
      });

      for(var i=0; i<this.state.therapies.length; i++)
      {
        sum += therapy_total_price[i];
      }

      for(var i=0; i<this.state.accessories.length; i++)
      {
        sum += acc_total_price[i];
      }

      if(sum < dm.to_price)
      {
        sum_total += sum + dm.price;
      }

      else
      {
        sum_total += sum + 0;
      }

      if(this.state.discount != null)
      {
        if(this.state.discount.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<this.state.discount.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == this.state.discount.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;
              if(this.state.discount.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                 sum_total -= discount_value;
              }

              if(this.state.discount.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  this.state.discount.discount_value;
                 sum_total -= discount_value;
              }
            }
          }
        }

        else if(this.state.discount.type.toLowerCase() == "general")
        {
          if(this.state.discount.discount_type.toLowerCase() == "percent")
          {
             discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
             sum_total -= discount_value;
          }

          if(this.state.discount.discount_type.toLowerCase() == "amount")
          {
             discount_value =  this.state.discount.discount_value;
             sum_total -= discount_value;
          }
        }

        else if(this.state.discount.type.toLowerCase() == "shipping")
        {
          if(sum < dm.to_price)
          {
            discount_value = dm.price;
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
            if(discountTherapies.length > 0) {
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
            if (sum < dm.to_price) {
              additional_discount = dm.price
            }
          }

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type}, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({d_value: discount_value});
      this.setState({subtotal: sum});
      this.setState({total: sum_total - additional_discount});
      this.setState({shipping_fee_to_price: dm.to_price});
      this.setState({shipping_fee: dm.price});
      this.setState({deliverymethod_id: dm.id});
      this.setState({checked: false});
    }

    remove_therapy(t, type)
    {
      var removed_therapy = [];
      var removed_accessory = [];
      if(type == "therapy") {
        delete t.quantity;
        this.props.delete_from_therapies(t);
        removed_therapy = this.state.therapies.filter(rt => {return rt.id != t.id});
        this.state.therapies = removed_therapy;
      } else {
        delete t.quantity;
        t.isGift = false;
        t.is_gift = 0;
        this.props.delete_from_accessories(t);
        removed_accessory = this.state.accessories.filter(a => {return a.id != t.id});
        this.state.accessories = removed_accessory;
      }

      var therapy_total_price = this.state.therapies.map(t => {return t.total_price*t.quantity});

      var acc_total_price = this.state.accessories.map(t => {
        if(t.quantity) {
          if(t.isGift == true) {
            return 0*t.quantity
          } else {
            return t.reduced_price*t.quantity
          }
        }
        else {
          if(t.isGift == true) {
            t.quantity = 1
            return 0*t.quantity;
          } else {
            t.quantity = 1
            return t.reduced_price*t.quantity
          }
        }
      });

      var sum = 0;
      var sum_total = 0;
      var discount_value = 0;
      var aDiscount = 0
      var additional_discount = 0;

      for(var i=0; i<this.state.therapies.length; i++)
      {
        sum += therapy_total_price[i];
      }

      for(var i=0; i<this.state.accessories.length; i++)
      {
        sum += acc_total_price[i];
      }

      if(sum < this.state.shipping_fee_to_price)
      {
        sum_total += sum + this.state.shipping_fee;
      }

      else
      {
        sum_total += sum + 0;
      }

      if(this.state.discount != null)
      {
        if(this.state.discount.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<this.state.discount.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == this.state.discount.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;
              if(this.state.discount.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                 sum_total -= discount_value;
              }

              if(this.state.discount.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  this.state.discount.discount_value;
                 sum_total -= discount_value;
              }
            }
          }
        }

        else if(this.state.discount.type.toLowerCase() == "general")
        {
          if(this.state.discount.discount_type.toLowerCase() == "percent")
          {
             discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
             sum_total -= discount_value;
          }

          if(this.state.discount.discount_type.toLowerCase() == "amount")
          {
             discount_value =  this.state.discount.discount_value;
             sum_total -= discount_value;
          }
        }

        else if(this.state.discount.type.toLowerCase() == "shipping")
        {
          if(sum < this.state.shipping_fee_to_price)
          {
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
            if(discountTherapies.length > 0) {
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

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type}, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({d_value: discount_value});
      this.setState({subtotal: sum});
      this.setState({total: sum_total - additional_discount});
      this.setState({checked: false});
    }

    add_therapy(new_order_therapy, type)
    {
      if (type == "accessory") {
        this.props.clear_acc(new_order_therapy);
        this.state.accessories.push(new_order_therapy);
      } else {
        this.props.clear_therapy(new_order_therapy);
        this.state.therapies.push(new_order_therapy);
      }


      var therapy_total_price = this.state.therapies.map(t => {
        if(t.quantity)
          return t.total_price*t.quantity
        else
          t.quantity = 1
          return t.total_price*t.quantity;
      });

      var acc_total_price = this.state.accessories.map(t => {
        if(t.quantity) {
          if(t.isGift == true) {
            return 0*t.quantity
          } else {
            return t.reduced_price*t.quantity
          }
        }
        else {
          if(t.isGift == true) {
            t.quantity = 1
            return 0*t.quantity;
          } else {
            t.quantity = 1
            return t.reduced_price*t.quantity
          }
        }
      });
      var sum = 0;
      var sum_total = 0;
      var discount_value = 0;
      var aDiscount = 0
      var additional_discount = 0;

      var deliverymethod_order = this.props.deliveryMethod[0].code || this.state.newCustomerData.delivery_method_code;
      var dm = this.props.deliveryMethod.find((dm) => {
        return dm.code == deliverymethod_order;
      });

      for(var i=0; i<this.state.therapies.length; i++)
      {
        sum += therapy_total_price[i];
      }

      for(var i=0; i<this.state.accessories.length; i++)
      {
        sum += acc_total_price[i];
      }

      if(sum < dm.to_price)
      {
        sum_total += sum + dm.price;
      }

      else
      {
        sum_total += sum + 0;
      }

      if(this.state.discount != null)
      {
        if(this.state.discount.type.toLowerCase() == "individual")
        {
          var individual_subtotal = 0;

          for(var i=0; i<this.state.discount.therapies.length; i++)
          {
            var t = this.state.therapies.find(th => {return th.id == this.state.discount.therapies[i].id})

            if(t)
            {
              individual_subtotal += t.total_price*t.quantity;
              if(this.state.discount.discount_type.toLowerCase() == "percent")
              {
                 discount_value = individual_subtotal * (this.state.discount.discount_value / 100)//individual_subtotal - (individual_subtotal / ((this.state.discount.discount_value / 100) + 1))
                 sum_total -= discount_value;
              }

              if(this.state.discount.discount_type.toLowerCase() == "amount")
              {
                 discount_value =  this.state.discount.discount_value;
                 sum_total -= discount_value;
              }
            }
          }
        }

        else if(this.state.discount.type.toLowerCase() == "general")
        {
          if(this.state.discount.discount_type.toLowerCase() == "percent")
          {
             discount_value = sum * (this.state.discount.discount_value / 100)//sum - (sum / ((this.state.discount.discount_value / 100) + 1))
             sum_total -= discount_value;
          }

          if(this.state.discount.discount_type.toLowerCase() == "amount")
          {
             discount_value =  this.state.discount.discount_value;
             sum_total -= discount_value;
          }
        }

        else if(this.state.discount.type.toLowerCase() == "shipping")
        {
          if(sum < dm.to_price)
          {
            discount_value = dm.price;
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
            if(discountTherapies.length > 0) {
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
            if (sum < dm.to_price) {
              additional_discount = dm.price
            }
          }

          this.setState({additional_discount_data: { discount_value: parseFloat(discount_value_a), type, discount_type}, additional_discount: parseFloat(additional_discount)})
        }
      }

      this.setState({d_value: discount_value});
      this.setState({subtotal: sum});
      this.setState({total: sum_total - additional_discount});
      this.setState({shipping_fee_to_price: dm.to_price});
      this.setState({shipping_fee: dm.price});
      this.setState({deliverymethod_id: dm.id});
      this.setState({checked: false});
    }

    showPopustDiv() {
      this.setState({popustDiv: !this.state.popustDiv, a_PopustDiv: false})
    }

    showAPopustDiv() {
      this.setState({popustDiv: false, a_PopustDiv: !this.state.a_PopustDiv})
    }

    toggleDiscount() {
      this.setState({discountFlag: !this.state.discountFlag, additionalDiscountFlag: false})
    }

    toggleAdditionalDiscount() {
      this.setState({additionalDiscountFlag: !this.state.additionalDiscountFlag, discountFlag: false})
    }

    changeKuponValue(event) {
      this.setState({discount_name: event.target.value})
    }

    changePopustValue(event) {
      this.setState({popustValue: event.target.value})
    }

    changeDType(event) {
      this.setState({dType: event.target.value})
    }

    changeDiscountType(event) {
      this.setState({discountType: event.target.value})
    }

    changeIndividualTherapies(individualTherapies) {
      this.setState({individualTherapies})
    }

    addAdditionalDiscount() {
      var type = this.state.dType;
      var discount_type = this.state.discountType;
      var discount_value = this.state.popustValue;
      var therapies = this.state.individualTherapies;
      if (discount_value && type && discount_type) {
        var aDiscount = this.calculateAdditionalDiscount({discount_value, type, discount_type, therapies}, this.state.therapies)
        this.setState({d_value: this.state.d_value, additional_discount_data: { discount_value: parseFloat(discount_value), type, discount_type}, additional_discount: parseFloat(aDiscount), total: this.state.total - aDiscount, popustValue: null, discountType: null, dType: null})
        this.showAPopustDiv();
      }
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
        if(discountTherapies.length > 0) {
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
          <div className="lightgray-box max-height pl-3 pr-3 pb-3">
            <div className="text-center pt-3 pb-3">
              <label>{row.name}</label>
            </div>
            <div className="row">
            <div className="col-8 text-left mb-3">
              <label>{row.name == "DODATKI" ? "Dodatek" : "Terapija"}</label>
            </div>
            <div className="col-4 text-center mb-3">
              <label>Cena</label>
            </div>
            </div>
            {row.therapies.map((t, index) => {
              if (t.reduced_price) {
                type = "accessory";
              }
              return (
                <div key={index} className="row pointer product-add" onClick={this.add_therapy.bind(this, t, type)}>
                    <div className="col-8 text-left">
                      <p>{t.name}</p>
                    </div>
                    <div className="col-4 text-center">
                      <p>{this.props.country.symbol} {parseFloat(t.total_price || t.reduced_price).toFixed(2)}</p>
                    </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    render(){
      const {handleSubmit, countries,
      initialValues, country, select_therapies,
      show_therapies, } = this.props;

      var deliverymethod = this.props.deliverymethods.filter(d => {return d.country == country.name && d.is_other == 1})
      var p = this.props.paymentmethods.filter(p => {return p.is_other == 1})

      var paymentmethod = [];
      for(var i=0; i<p.length; i++) {
        if(p[i].countries.includes(country.name)) {
          paymentmethod.push(p[i]);
        }
      }

      if(show_therapies) {
        for(var i=0; i<show_therapies.length; i++) {
          if(show_therapies[i].therapies && show_therapies[i].therapies.length > 0) {
            show_therapies[i].therapies = show_therapies[i].therapies.sort(function(a, b){
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
                <InfluencerDetails deliverymethods={deliverymethod} countries={countries} paymentmethods={paymentmethod}
                utmmedia={this.props.utmmedia} order_types={this.props.order_types} initialValues={initialValues}
                onChange={this.changeInfluencerData.bind(this)}/>
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
                  <div className={`col-md-1`}>
                  </div>
                  <div className={`col-md-11 mb-5`}>
                    <div className="row justify-content-center order-details-wrap">
                      <div className="col-md-6">
                        <table className="table">
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
                            { this.state.additional_discount_data && <tr>
                              <td className="text-right column" colSpan="6"><label className="therapies-table-label-text-size">DODATNI POPUST</label></td>
                              <td className="text-center customer-information-font-size">{this.state.checked ? parseFloat(0).toFixed(2) : parseFloat(this.state.additional_discount).toFixed(2) }
                                {this.props.country && this.props.country.symbol}
                              </td>
                            </tr> }
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
                                  <input type="text" value={this.state.discount_name} className="form-control mr-10" onChange={this.changeKuponValue.bind(this)} />
                                  <button type="button" onClick={this.discount_data.bind(this)} className={`btn-cta cta-active cta-big`}>Potrdi</button>
                                </div>
                              </div>
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
                              options={select_therapies.map(tt => {return {label: tt.name, value: tt.id}})}
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
                      </div> : '' }
                      <div className="col-md-2">
                        <div>
                          <button onClick={this.toggleDiscount.bind(this)} type="button" className={`pointer btn-cta ${this.state.discountFlag && 'cta-active'} mb-10`}>Kupon</button>
                        </div>
                        <div>
                          <button onClick={this.toggleAdditionalDiscount.bind(this)}  type="button" className={`pointer btn-cta ${this.state.additionalDiscountFlag && 'cta-active'} mb-10`}>Popust</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 center mt-5">
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
    setInitialValuesNewOrderInfluencer: (obj, data) => {
      dispatch(setInitialValuesNewOrderInfluencer(obj, data))
    },

    clear_therapy : (obj) => {
      dispatch(clear_therapy(obj));
    },

    clear_acc : (obj) => {
      dispatch(clear_acc(obj));
    },

    delete_from_therapies : (obj) => {
      dispatch(delete_from_therapies(obj));
    },

    delete_from_accessories : (obj) => {
      dispatch(delete_from_accessories(obj));
    },

    addNewOrder: (obj, id) => {
      dispatch(addNewOrder(obj, id))
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    deliverymethods: nextState.main_data.deliverymethods,
    countries: nextState.main_data.countries,
    paymentmethods: nextState.main_data.paymentmethods,
    utmmedia: nextState.main_data.utmmedia,
    order_types: [{label: 'inbound', value: 'inbound'}, {label: 'splet', value: 'splet'}, {label: 'baza', value: 'baza'},
                  {label: 'rojstni dan', value: 'rojstni_dan'}, {label: 'influencer', value: 'influencer'}],
    initialValues: Immutable.fromJS(nextState.influencers_data.initialValuesNewOrderInfluencer),
    deliveryMethod: nextState.influencers_data.deliveryMethod,
    country: nextState.influencers_data.country,
    localTherapies: nextState.influencers_data.localTherapies,
    localAcc: nextState.influencers_data.localAcc,
    show_therapies: nextState.influencers_data.show_therapies,
    select_therapies: nextState.influencers_data.select_therapies,
    discounts: nextState.main_data.discounts,
    products: nextState.main_data.products,
    currencies: nextState.main_data.currencies,
    languages: nextState.main_data.languages,
    accessories: nextState.main_data.accessories
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

const warn = values => {
  const warnings = {}

  values = values.toJS();

  if(values.shipping_email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.shipping_email)) {
    warnings.shipping_email = "Nepravilen elektronski naslov";
  }

  return warnings;
}

export default compose(
  reduxForm({
    form: 'NewInfluencerOrderForm',
    enableReinitialize: true,
    validate,
    warn
  }), connect(mapStateToProps, mapDispatchToProps)
)(NewInfluencerOrder);
