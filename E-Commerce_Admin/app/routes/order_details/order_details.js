import React, {Component} from 'react';
import Moment from 'moment';
import {Link, browserHistory} from 'react-router';
import Immutable from 'immutable';
import {compose} from 'redux';
import moment from "moment";
import Switch from 'react-switch';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import {getOrderDetails, createComment, deleteComment, editOrderDetails, takeOrder, show_color, add_color, sendEmail, deleteDiscount, editOrderInfo,
clearTherapy, clearTherapyStorno, show_therapies_upsell, deleteTherapy, editOrderTherapies, changeOrderStatus, removeOccupiedOrder, deleteAccessory, isAccessoryGift, changeTherapyQuantityStorno,
addAdditionalDiscount, checkDiscount, callCustomer, endCall, editOrderGifts, changeTherapyQuantity, endVccCall, accessoryOption, makeStorno, changeAccQuantity, editHistoryInfo, payDifference } from '../../actions/order_details_actions';

import { printInvoices, printPreInvoices } from '../../actions/orders_dashboard_actions';
import {getColorDashboard} from '../../actions/colors_actions';
import { createNotification } from '../../App.js'
import DetailsForm from './order_details_form.js';
import DateNaknadno from '../orders_dashboard/date_naknadno.js';
//import Snowfall from 'react-snowfall';

class OrderDetails extends Component {
    constructor(props) {
      super(props);

      this.state = {activeTab: "Informacije", editButton: false, editButtonText: false, buttonDisabled: false,
      kuponDiv: false, popustDiv: false, dType: null, discountType: null, individualTherapies:[], user:null,
      upsellDiv: false, accDiv: false, discountDiv: false, couponDiv: false, show_therapy:null, checkedGift: false,
      order_details_data: null, order_history_modal:false, order_history_id:null, gifts:[], changeStatusButton: false, reinput: false, popustValue: null};
    }

    componentDidMount() {
      var self = this;
      if (this.props.socket) {
        this.props.socket.on('clientEvent', function (data) {
            self.props.endVccCall(data);
        });
      }

      var user = localStorage.getItem('user');
      user = JSON.parse(user);
      this.setState({user});

      var location = browserHistory.getCurrentLocation();
      var order_id = location.query.id;
      browserHistory.replace(location);
      this.props.getOrderDetails(order_id);
      this.props.getColorDashboard();
    };

    componentWillUnmount(){
      var location = browserHistory.getCurrentLocation();
      if(location.query.id){
        this.props.removeOccupiedOrder(location.query.id);
      }
    }

    orderDetailsTab(e)
    {
      this.setState({activeTab: e.currentTarget.textContent})
    }

    showUpsellDiv()
    {
      if (this.state.upsellDiv) {
        this.editOrder();
      } else {
        var t = this.props.order.therapies.find(ot => {
            return ot;
        })

        var arr = [], categories = [];
        arr.push(this.props.categories)

        for(var i=0; i<arr.length; i++) {
  				for(var j=0; j<arr[i].length; j++) {
  					categories.push(arr[i][j]);
  				}
  			}

        var therapy = this.props.categories.find(c => {return c.name == t.category})
        this.get_product_name(therapy);
        this.setState({selectedProduct: t.category});

        this.setState({upsellDiv: !this.state.upsellDiv, accDiv: false, popustDiv: false, kuponDiv: false});
      }
    }

    showAccDiv()
    {
      if (this.state.accDiv) {
        this.editOrder();
      } else {
        var a = this.props.order.accessories.find(a => {
            return a;
        })

        var brr = [], categories = [];
        var acc_category = [{name: "accessories", category: "accessories"}]
        brr.push(acc_category)

        for(var i=0; i<brr.length; i++) {
          for(var j=0; j<brr[i].length; j++) {
            categories.push(brr[i][j]);
          }
        }

          var accessory = {name: "accessories", category: "accessories"};
          this.get_product_name(accessory);
          this.setState({selectedProduct: accessory.category});

        this.setState({accDiv: !this.state.accDiv, upsellDiv: false, popustDiv: false, kuponDiv: false});
      }
    }

    changeEditButton()
    {
      this.setState({editButton: !this.state.editButton});
      this.setState({editButtonText: !this.state.editButtonText});
    }

    hideUpsellBox() {
      this.setState({upsellDiv: !this.state.upsellDiv})
    }
    hideAccBox() {
      this.setState({accDiv: !this.state.accDiv})
    }


    add_agent_to_order()
    {
      this.props.takeOrder(this.props.order.id);
    }

    showColors() {
      var location = browserHistory.getCurrentLocation();
      this.props.show_color(location.query.id);
    }

    changeOrderColor(color) {
      var location = browserHistory.getCurrentLocation();
      this.props.add_color(location.query.id, color);
      this.props.show_color(location.query.id);
    }

    DeleteOrderComment(comment)
    {
      var comment_id = comment.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati komentarja?"))
        this.props.deleteComment(comment_id);
    }

    CreateComment(obj)
    {
      obj = obj.toJS();
      obj.author = this.props.user.username;
      obj.date_added = new Date().toISOString();

      var data = {}
      data.content = obj.content;
      data.author = obj.author;
      data.date_added = obj.date_added;

      this.props.createComment(data, obj);
      this.props.reset();
  	}

    renderOrderComment(comment, index)
    {
      return(
        <tr key={index}>
          <td>{comment.author}</td>
          <td>{comment.content}</td>
          <td>{Moment (comment.date_added).format("DD. MM. YYYY")}</td>
          <td onClick={this.DeleteOrderComment.bind(this, comment)} className="pointer align-center"><span className="fas fa-trash"></span></td>
        </tr>
      )
    }

    renderOldOrders(old_order, index)
    {
      return(
        <tr key={index}>
          <td>{old_order.order_id2}</td>
          <td>{Moment (old_order.date_added).format("DD. MM. YYYY")}</td>
          <td>{old_order.order_status}</td>
          <td>{parseFloat(old_order.total).toFixed(2)} {old_order.currency_symbol}</td>
          <td className="ordersTable align-center"><Link target="_blank" to={{pathname: '/order_details', query: {id: old_order.id}}}><i className="fas fa-search-plus fa-big" style={{color: "#30465F"}} aria-hidden="true"></i></Link></td>
        </tr>
      )
    }

    renderOrderHistory(order_history, index)
    {
      var responsible_agent = this.props.admins.find(a => {
        return a.id == order_history.responsible_agent_id;
      }) || {}

      if(order_history.data.discountData){
        delete order_history.data.discountData;
      }

      if(order_history.data.additional_discount_data){
        delete order_history.data.additional_discount_data;
      }

      var color = '#fff'
      if (index % 2 != 0) {
        color = "#f5f5f5"
      }

      return(
        <tbody key={index} style={{backgroundColor: color}}>
          <tr>
            <td onClick={this.getOrderHistoryID.bind(this, order_history)} className="pointer"><b>{index}</b></td>
            <td onClick={this.getOrderHistoryID.bind(this, order_history)} className="pointer">{Moment (order_history.date_added).format("DD. MM. YYYY, hh:mm:ss")}</td>
            <td onClick={this.getOrderHistoryID.bind(this, order_history)} className="pointer">{order_history.changes}</td>
            <td onClick={this.getOrderHistoryID.bind(this, order_history)} className="pointer center">{responsible_agent.first_name} {responsible_agent.last_name}</td>
          </tr>
          <tr>
            <td className={`hidden-tr ${this.state.order_history_id == order_history.id ? '' : 'closed'}`} colSpan="12">
            <div className="main-hidden">
               <table className="new-table-history my-4">
                 <thead>
                   <tr>
                     <th className="left table-pad-l-8">Tip spremembe</th>
                     <th className="left table-pad-l-8">Vrednost</th>
                   </tr>
                 </thead>
                 {order_history.data && Object.keys(order_history.data).map(this.renderOrderHistoryDetails.bind(this, order_history.data))}
               </table>
                {order_history.data && order_history.data.therapies &&
                    <div>
                      <h4 className="m-t-30 center">Sprememba terapije</h4>
                      <table className="new-table-history">
                       <thead>
                         <tr>
                           <th className="left table-pad-l-8">Izdelek</th>
                           <th className="left table-pad-l-8">Količina</th>
                         </tr>
                       </thead>
                      <tbody>
                      {order_history.data.therapies.map(this.renderOrderHistoryTherapies.bind(this))}
                       </tbody>
                     </table>
                   </div>
                 }
             </div>
            </td>
          </tr>
        </tbody>
      )
    }

    getOrderHistoryID(order_history)
    {
      this.setState({order_history_id: order_history.id})
    }

    renderOrderHistoryDetails(details, key, index) {
      if(!Array.isArray(details[key]) && key != 'additional_discount_data'){
        return(
          <tbody key={index}>
            <tr>
              <td className="left table-pad-l-8">{key}</td>
              <td className="left table-pad-l-8">{details[key]}</td>
            </tr>
          </tbody>
        )
      }
      if(key=="gifts"){
        if(details[key].length>0){
          return(
            <tbody key={index}>
              <tr>
                <td className="left table-pad-l-8">Darilo</td>
                <td className="left table-pad-l-8">Dodano darilo</td>
              </tr>
            </tbody>
          )
        }
        else{
          return(
            <tbody key={index}>
              <tr>
                <td className="left table-pad-l-8">Darilo</td>
                <td className="left table-pad-l-8">Odstranjeno darilo</td>
              </tr>
            </tbody>
          )
        }
      }
    }

    renderOrderHistoryTherapies(therapy, index) {
      return(
        <tr key={index}>
          <td className="left table-pad-l-8">{therapy.name}</td>
          <td className="left table-pad-l-8">{therapy.quantity}</td>
        </tr>
      )
    }

    renderProducts(product, index)
    {
      if (product.price) {
        var total_price = product.price;
      } else {
        var total_price = product.total_price;
      }
      if (this.props.order.additionalDiscountData && this.props.order.additionalDiscountData.isOtoCoupon) {
        if (this.props.order.additionalDiscountData.therapies.length > 0) {
          var therapy_id = this.props.order.additionalDiscountData.therapies[0].id
          if (therapy_id == product.id && product.oto) {
            total_price -= this.props.order.additional_discount
          }
        } else {
          var acc_id = this.props.order.additionalDiscountData.accessories[0].id
          if (acc_id == product.id && product.oto) {
            total_price -= this.props.order.additional_discount
          }
        }
      }

      return(
        <tr key={index} className="product-information">
          <td>{product.name}</td>
          <td></td>
          {this.state.upsellDiv || this.state.accDiv ?
            <td className="center">
              <span onClick={this.getTherapiesNumber.bind(this, product, -1)} className="pointer mr-10 fas fa-minus"></span>
                {product.quantity}
              <span onClick={this.getTherapiesNumber.bind(this, product, 1)} className="fas fa-plus pointer ml-10"></span>
            </td>
            :
            <td className="center">{product.quantity}</td>
          }
          <td className="center">{parseFloat(total_price).toFixed(2)} {this.props.order.currency_symbol}</td>
          <td className="center">{parseFloat(total_price*product.quantity).toFixed(2)} {this.props.order.currency_symbol}</td>
          <td className="center"></td>
          <td className="center">{this.state.user && this.state.user.id != this.props.order.responsible_agent_id ? "" : <i onClick={this.removeTherapy.bind(this, product)} className="fas fa-trash pointer" aria-hidden="true"></i>}</td>
        </tr>
      )
    }

    renderAccessories(accessory, index)
    {
      if (accessory.price) {
        var total_price = accessory.price;
      } else {
        var total_price = accessory.reduced_price;
      }
      if (this.props.order.additionalDiscountData && this.props.order.additionalDiscountData.isOtoCoupon) {
        if (this.props.order.additionalDiscountData.therapies.length > 0) {
          var therapy_id = this.props.order.additionalDiscountData.therapies[0].id
          if (therapy_id == accessory.id && accessory.oto) {
            total_price -= this.props.order.additional_discount
          }
        } else {
          var acc_id = this.props.order.additionalDiscountData.accessories[0].id
          if (acc_id == accessory.id && accessory.oto) {
            total_price -= this.props.order.additional_discount
          }
        }
      }
      var options = accessory?.options?.filter(a => {
        return a.lang.toLowerCase() === this.props.order.lang.toLowerCase()
      })
      return(
        <tr key={index} className="product-information">
          {accessory.acc_name ? <td>{accessory.acc_name}</td> : accessory.acc_name ? <td>{accessory.acc_name} - {accessory.name}</td> : <td>{accessory.name}</td>}
          <td>
            {options ? <select value={accessory.product_id} style={{width: '100%'}} onChange={this.changeOptionSelect.bind(this, accessory)}>
              <option key={index} value={null}></option>
              {options.map((o, index) => {
                return (
                <option key={index} value={o.id}>
                  {o.name}
                </option>)
              })}
            </select>
            : ""
          }
          </td>
          {this.state.accDiv ?
            <td className="center">
              <span onClick={this.getAccNumber.bind(this, accessory, -1)} className="pointer mr-10 fas fa-minus"></span>
                {accessory.quantity}
              <span onClick={this.getAccNumber.bind(this, accessory, 1)} className="fas fa-plus pointer ml-10"></span>
            </td>
            :
            <td className="center">{accessory.quantity}</td>
          }
          <td className="center">{accessory.isGift == 1 ? parseFloat(0).toFixed(2) : parseFloat(total_price).toFixed(2)} {this.props.order.currency_symbol}</td>
          <td className="center">{accessory.isGift == 1 ? parseFloat(0).toFixed(2) : parseFloat(total_price*accessory.quantity).toFixed(2)} {this.props.order.currency_symbol}</td>
          <td className="center">{(this.state.accDiv || accessory.isFreeProduct == 1) ? "" : <input type="checkbox" checked={accessory.isGift == "1"} onChange={this.isAccessoryGift.bind(this, accessory)} className="mr-2 pointer"/>}</td>
          {
            accessory.isFreeProduct
            ? null
            : <td className="center"><span onClick={this.deleteAccessory.bind(this, accessory)} className="fas fa-trash pointer"></span></td>
          }
        </tr>
      )
    }

    changeOptionSelect(accessory, event) {
      this.props.accessoryOption(accessory, event.target.value)
      setTimeout(
        function() {
          this.props.editOrderInfo(this.props.order.id, this.props.changedData);
        }
        .bind(this),
        0
      );
    //  this.props.editOrderInfo(this.props.order.id, this.props.changedData);
    //  this.editOrder();
    //  this.setState({accDiv: false, upsellDiv: false, popustDiv: false, kuponDiv: false});
    }

    render_product_buttons_uppsale(product, index)
    {
      return (
        <div key={index} className="mb-1">
          <button onClick={this.get_product_name.bind(this, product)} key={index} className={`btn-products-style w-100 btn btn-product ${product.name == this.state.selectedProduct ? "active-ther-btn" : ""}`}> {product.name.toUpperCase()}</button>
        </div>
      )
    }

    isAccessoryGift(accessory) {
      this.props.isAccessoryGift(accessory);

      setTimeout(
        function() {
          this.props.editOrderInfo(this.props.order.id, this.props.changedData);
        }
        .bind(this),
        0
      );
    }

    deleteAccessory(obj) {
      if (this.state.accDiv) {
        if(window.confirm("Ali ste sigurni da hočete izbrisati dodatek?")) {
          this.props.deleteAccessory(obj);

          setTimeout(
            function() {
              this.props.editOrderInfo(this.props.order.id, this.props.changedData);
            }
            .bind(this),
            200
          );
        }
      }
    }

    getTherapiesNumber(therapy, value) {
      if (this.props.order.order_status.name === "Storno") {
        this.props.changeTherapyQuantityStorno(therapy, parseInt(value))
      } else {
        this.props.changeTherapyQuantity(therapy, parseInt(value))
      }
    }

    getAccNumber(acc, value) {
      this.props.changeAccQuantity(acc, parseInt(value))
    }

    addTherapy(row) {
      if (this.props.order.order_status.name === "Storno") {
        this.props.clearTherapyStorno(row);
      } else {
        this.props.clearTherapy(row);
      }
    }

    removeTherapy(row) {
      if (this.state.upsellDiv)
        this.props.deleteTherapy(row);
    }

    render_therapies_uppsale(therapy, index) {
      return (
        <div
          className="flex baseling-align-items font-ther"
          key={index}
          onClick={!therapy.selected ? this.addTherapy.bind(this, therapy) : this.removeTherapy.bind(this, therapy)}
        >
          <span className={`${therapy.selected ? 'hidden': ''} fas fa-plus mr-10 pointer`}></span>
          <span className={`${!therapy.selected ? 'hidden': ''} fas fa-times mr-10 pointer`}></span>
          <p className={`${therapy.selected ? 'active-ther': ''} font-size pointer`}> {therapy.name} / {parseFloat(therapy.total_price || therapy.reduced_price).toFixed(2)} {this.props.order.currency_symbol}</p>
        </div>
      )
    }

    get_product_name(e) {
      this.setState({selectedProduct: e.name})
      this.props.show_therapies_upsell(e)
    }

    editOrder() {
      var edit = true;
      if(this.props.order.accessories && this.props.order.accessories.length > 0) {
        this.props.order.accessories.map(a => {
          if (!a.product_id) {
            createNotification('error', 'Izberite opcijo!');
            edit = false;
            this.setState({accDiv: true})
          }
        })
      }

      if (this.props.changedData) {
        if(edit) {
          this.setState({upsellDiv: false, accDiv: false})
          this.props.editOrderTherapies(this.props.order.id, this.props.changedData)
        }
      }
    }

    toggleButton() {
      this.setState({buttonDisabled: !this.state.buttonDisabled})
    }

    callCustomer(flag) {
      if (flag) {
        localStorage.setItem('callingOrder', '0');
        this.props.callCustomer(this.props.order.id,
          flag, this.props.order.shipping_telephone,
          this.props.user.vcc_username,
          this.props.order.shipping_country,
          {
            name: `${this.props.order.shipping_first_name} ${this.props.order.shipping_last_name}`,
            email: this.props.order.shipping_email,
            order_id: this.props.order.order_id2
          }
        )
      } else {
        localStorage.setItem('callingOrder', '1');
        this.props.endCall();
      }
    }

    exitEdit() {
      this.setState({editButton: false})
    }

    changeGift(gift) {
      gift.isChosen = gift.isChosen ? 0 : 1;
      var tmp = [];
      var gifts = this.props.order.gifts;

      if(gifts.length > 0) {

        if(gift.isChosen) {

          for(var i=0; i<gifts.length; i++) {
            tmp.push({gift_id:gifts[i].gift_id});
          }

          tmp.push({gift_id:gift.id});
        }

        else {
          var tmp = gifts.filter((g) => {
            return g.gift_id != gift.id;
          });
        }
      }

      else {
        tmp.push({gift_id:gift.id});
      }

      this.props.editOrderGifts(this.props.order.id, {gifts:tmp})
    }

    renderAllGifts(gift, index)
    {
      return (
        <div key={index} className="flex">
          {gift.isChosen ? <i className="fa fa-check checked-i" aria-hidden="true"></i> : <i className="fa fa-lock lock-i" aria-hidden="true"></i>}
          <Switch disabled={!this.props.order.responsible_agent_id} checked={gift.isChosen} onChange={this.changeGift.bind(this, gift)} className="form-white flag_icon_dashboard-flag" /><span className="details-bot-cust font-new m-t-gift"> {gift.name}</span>
        </div>
      )
    }

    showKuponDiv() {
      this.setState({kuponDiv: !this.state.kuponDiv, popustDiv: false, upsellDiv: false, accDiv: false})
    }

    changeKuponValue(event) {
      this.setState({kuponValue: event.target.value})
    }

    showPopustDiv() {
      this.setState({popustDiv: !this.state.popustDiv, kuponDiv: false, upsellDiv: false, accDiv: false})
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

    addAdditionalDiscount(val=null, dType=null, discountType=null) {
      var type = this.state.dType || dType;
      var discount_type = this.state.discountType || discountType;
      var discount_value = this.state.popustValue || val;
      var therapies = this.state.individualTherapies;

      var t = []

      if(type == "individual")
        t = this.state.individualTherapies.map(tt => {return tt.value});
      else
        t = undefined;

      if (therapies.length == 0) {
        therapies = undefined;
      }
      if (discount_value && type && discount_type) {
        var aDiscount = this.calculateAdditionalDiscount({discount_value, type, discount_type, therapies})
        this.props.addAdditionalDiscount(this.props.order.total, this.props.order.id, aDiscount, {discount_value: parseInt(discount_value), type, discount_type, therapies: t})
        this.showPopustDiv();
        this.setState({popustValue: null, discountType: null, dType: null})
      }
    }

    calculateAdditionalDiscount(aDiscount) {
      var order = this.props.order
      var additional_discount = 0;
      if (aDiscount.type.toLowerCase() == 'general') {
        if (aDiscount.discount_type.toLowerCase() == 'percent') {
          additional_discount = order.subtotal * (aDiscount.discount_value / 100)//order.subtotal - (order.subtotal / ((aDiscount.discount_value / 100) + 1))
        } else {
          additional_discount = aDiscount.discount_value
        }
      } else if (aDiscount.type.toLowerCase() == 'individual') {

        var discountTherapies = aDiscount.therapies;
        var pickedTherapies = [];
        var subtotalForDiscount = 0;
        for (var i = 0; i < discountTherapies.length; i++) {
          var th = order.therapies.find(t => {
            return t.id == discountTherapies[i].value;
          })
          if (th) {
            subtotalForDiscount += th.total_price * th.quantity;
            if (aDiscount.discount_type.toLowerCase() == 'percent') {
              additional_discount = subtotalForDiscount * (aDiscount.discount_value / 100)//subtotalForDiscount - (subtotalForDiscount / ((aDiscount.discount_value / 100) + 1))
            } else {
              additional_discount = aDiscount.discount_value
            }
          }
        }
      } else if (aDiscount.type.toLowerCase() == 'shipping') {
        if (order.delivery_method_to_price > order.subtotal) {
          additional_discount = order.delivery_method_price
        }
      }

      return additional_discount
    }

    checkDiscount() {
      if (this.state.kuponValue) {
        this.props.checkDiscount(this.props.order, this.state.kuponValue, this.props.order.shipping_country)
      }
    }

    changeIndividualTherapies(individualTherapies) {
      this.setState({individualTherapies})
    }

    changeStatusButton() {
      this.setState({changeStatusButton: !this.state.changeStatusButton})
    }

    openNaknadnoModal()
    {
      this.setState({naknadnoModal: true});
    }

    openNaknadnoModalChange()
    {
      var status = "Naknadno";
      this.setState({naknadnoModal: true});
      this.setState({orders_ids: [this.props.order.id], change_status: status})
    }

    closeNaknadnoModal()
    {
      this.setState({naknadnoModal: false});
    }

    EditDateNaknadno(obj) {
      this.props.changeOrderStatus(this.state.orders_ids, this.state.change_status)
      this.props.editOrderDetails(this.state.orders_ids, obj);
      this.closeNaknadnoModal();
      this.setState({changeStatusButton: !this.state.changeStatusButton});
    }

    ChangeOrderStatus(event)
    {
      var status = event.target.value;

      if(status == "Naknadno") {
        this.openNaknadnoModal();
        this.setState({orders_ids: [this.props.order.id], change_status: status})
      } else {
        this.props.changeOrderStatus([this.props.order.id], status)
        //this.props.editOrderDetails([this.props.order.id], {date_naknadno: null});
        this.setState({changeStatusButton: !this.state.changeStatusButton})
      }
    }

    renderSingleMail(mail, index) {
      return (
        <tr key={index}>
          <td className="pointer">{mail.date_added && Moment (mail.date_added).format("DD. MM. YYYY")}</td>
          <td className="pointer">{mail.date_opened && Moment (mail.date_opened).format("DD. MM. YYYY")}</td>
          <td className="pointer">{mail.opened}</td>
        </tr>
      )
    }

    /*addReklamacija(event) {
      event.preventDefault();
      if (this.props.order && this.props.order.additionalDiscountData.discount_value != 100) {
        this.props.addReklamacija(this.props.order.id);
      }
    }*/

    renderSingleCall(call, index) {
      var cd = {};
      if(call.client_data)
        cd = JSON.parse(call.client_data);

      var exclude = ['order_id', 'name', 'email', 'phone1', 'contacts'];

      return (
        <tr key={index}>
          <td>{index}</td>
          <td>{Moment(call.create_time).format('DD-MM-YYYY HH:mm')}</td>
          <td className="center">{call.disposition_label}</td>
          <td className="center">{call.direction}</td>
          <td>
            {cd && Object.keys(cd).map( function( el, i ){
              if(!exclude.includes(el)){
                if(Array.isArray(cd[el]))
                  return <div key={i}><b>{el}: </b> {cd[el][0].label}</div>
                else
                  return <div key={i}><b>{el}: </b> {cd[el]}</div>
              }
            })}
          </td>
        </tr>
      )
    }

    ponastaviZnesek() {
      this.props.editHistoryInfo(this.props.order.id, {total: this.props.order.total});
    }

    payTheDifference() {
      var location = browserHistory.getCurrentLocation();
      var order_id = location.query.id;
      const { setup_intent_id } = this.props.order.payment;
      const { payment_amount, currency_code, total, order_id2, customer  } = this.props.order;
      const amountToPay = (total*100).toFixed(2) - payment_amount;

      this.props.payDifference({setupPaymentId: setup_intent_id, amount: amountToPay, oldAmount: payment_amount, currency: currency_code, id: order_id, order_id: order_id2, customer_name: customer.shipping_first_name, customer_last_name: customer.shipping_last_name, customer_phone: customer.shipping_telephone, customer_email: customer.shipping_email, customer_country: customer.country});
    }

    sendEmail() {
      var obj = this.props.order;
      var country = this.props.all_countries.find(c => {return c.name == this.props.order.shipping_country})

      obj.country_ddv = country.ddv;
      obj.discount_value = obj.discount;
      obj.order_id = parseInt(obj.order_id2);
      obj.therapies.map(t => {t.price = t.total_price})
      obj.accessories.map(a => {
        a.product_name = a.name;
        a.name = a.acc_name
      })
      this.props.sendEmail(obj);
    }

    deleteCoupon() {
      var obj = {};
      var deletedAccessoryReducedPrice = 0;
      var deletedTheraphyReducedPrice = 0;
      var therapiesSubtotal = 0;
      var accessoriesSubtotal = 0;
      obj.total = this.props.order.total + this.props.order.discount;
      obj.discount = 0;
      obj.discount_id = null;
      obj.delete_free_accessories = this.props.order.accessories.map(el => {
        if (el.isFreeProduct) {
          deletedAccessoryReducedPrice += +el.reduced_price;
          return el.product_id;
        } else {
          accessoriesSubtotal += +el.reduced_price * el.quantity;
        }
      }).filter(el => el);
      if (deletedAccessoryReducedPrice) obj.total -= deletedAccessoryReducedPrice;
      obj.delete_free_therapies = this.props.order.therapies.map(el => {
        if (el.isFreeProduct) {
          deletedTheraphyReducedPrice += (el.price || el.total_price);
          return el.products[0].id;
        } else {
          therapiesSubtotal += +(el.price || el.total_price) * el.quantity;
        }
      }).filter(el => el);
      if (deletedTheraphyReducedPrice) obj.total -= deletedTheraphyReducedPrice;
      obj.subtotal = therapiesSubtotal + accessoriesSubtotal;
      if (this.props.order.discountData.utm_medium == this.props.order.utm_medium && this.props.order.discountData.utm_source == this.props.order.utm_source) {
        obj.utm_source = null;
        obj.utm_medium = null;
      }
      if (window.confirm('Ali ste sigurni da hočete izbrisati popusta?'))
        this.props.deleteDiscount(this.props.order.id, obj);
    }

    deleteAdditional(){
      var obj = {};
      obj.total = this.props.order.total + this.props.order.additional_discount;
      obj.additional_discount = 0;
      obj.additional_discount_id = null;
      if (window.confirm('Ali ste sigurni da hočete izbrisati popusta?'))
        this.props.deleteDiscount(this.props.order.id, obj)
    }

    makeStornoF = () => {
      var location = browserHistory.getCurrentLocation();
      var order_id = location.query.id;
      this.props.makeStorno(order_id);
    }


    printInvoices = () => {
      let ids = [];
      let location = browserHistory.getCurrentLocation();
      ids.push({id: location.query.id})
      this.props.printInvoices(ids);
    }

    printPreInvoices = () => {
      let ids = [];
      let location = browserHistory.getCurrentLocation();
      ids.push({id: location.query.id})
      this.props.printPreInvoices(ids);
    }


    render(){
      const { order, countries, orderInitialValues, show_gifts, admins, therapies, show_therapies, categories } = this.props;
      const { handleSubmit, user } = this.props;

      var upsell_div = this.state.upsellDiv ? "show" : "hidden";
      var kupon_div = this.state.kuponDiv ? "show" : "hidden";
      var popust_div = this.state.popustDiv ? "show" : "hidden";
      var acc_div = this.state.accDiv ? "show" : "hidden";

      var editingUser = admins.find(a => {
        return a.id == order.responsible_agent_id;
      });

      var isCalling = localStorage.getItem('callingOrder');
      var checkTmp = false;

      if(isCalling == '0'){
        checkTmp = true;
      }
      else if(isCalling == '1'){
        checkTmp = false;
      }
      else{
        if(isCalling == order.order_id){
          checkTmp = false;
        }
      }

      var firstTotal = order.order_history && order.order_history[0] && order.order_history[0].data && order.order_history[0].data.total || 0

      var flag_classname = this.props.flag_countries.find((fc) => {return fc.name == this.props.order.shipping_country});

      var t = therapies.map(t => {return {label: t.name, value: t.id}})

      var orderDifference = (order.total - (order.payment_amount / 100)).toFixed(2);

      var arr = [], upsell_categories = [];
      arr.push(categories)
      for(var i=0; i<arr.length; i++) {
        for(var j=0; j<arr[i].length; j++) {
          upsell_categories.push(arr[i][j]);
        }
      }

      var super_admin = user && user.adminGroup && (user.adminGroup.name === "Super Admin") || false;


      return (
        <div className="content-wrapper container-fluid content-wrapper-details">
        {/*  <Snowfall color="#fff" snowflakeCount={250} /> */}

          <div className="row h-100 d-flex align-items-center order-details-row">
            <div className="col-6 col-md-4 d-flex align-items-center">
              <div className="d-flex flex-column align-items-center mr-3 pr-3 border-right">

                {order.order_status.name != "Storno" && order.storno_id ?
                <React.Fragment>
                  <div className="order-metadata order-details-number">
                    <span className="text-danger">Stornirano naročilo</span>
                    <span className={`${flag_classname}`}></span>
                  </div>
                  <div className="order-number-title font-weight-bold"><del>#{order.order_id2}</del></div>
                  <div className="order-type">{order.order_type}</div>
                </React.Fragment> : order.order_status.name == "Storno" && order.primary_order_id ?
                <React.Fragment>
                  <div className="order-metadata order-details-number">
                    Storno naročilo
                    <span className={`${flag_classname}`}></span>
                  </div>
                  <div className="order-number-title font-weight-bold">#{order.order_id2}</div>
                  <div className="order-type">{order.order_type}</div>
                </React.Fragment> :
                <React.Fragment>
                  <div className="order-metadata order-details-number">
                    Naročilo
                    <span className={`${flag_classname}`}></span>
                  </div>
                  <div className="order-number-title font-weight-bold">#{order.order_id2}</div>
                  <div className="order-type">{order.order_type}</div>
                </React.Fragment>
               }


                {order.order_status.name != "Storno" && order.storno_id &&
                  <React.Fragment>
                    <div className="order-metadata">Storno naročilo: <span className="font-weight-bold"><Link href={`/order_details?id=${order.storno_id}`}><a>#{order.storno_order_id2}</a></Link></span></div>
                  </React.Fragment>
                }


                {order.order_status.name == "Storno" && order.primary_order_id &&
                  <React.Fragment>
                    <div className="order-metadata">Prvotno naročilo: <span className="font-weight-bold"><Link href={`/order_details?id=${order.primary_order_id}`}><a>#{order.primary_order_id2}</a></Link></span></div>
                  </React.Fragment>
                }
              </div>
              <div className="mr-3">{Moment (order.date_added).format("DD. MM. YYYY")}
                <br/>
                {Moment (order.date_added).format("hh:mm:ss")}
              </div>
              { !order.order_color_id ?
                <a onClick={this.showColors.bind(this)} className="pointer order-color-picker mr-2">
                  <i className="color-font new-color-icon fas fa-th show color_sign_size cursor_style flag_icon_dashboard-flag"></i>
                </a>
                :
                <div onClick={this.showColors.bind(this)} style={{height: '46px', width: '40px', backgroundColor: this.props.order.order_color_value}} className={`pointer mr-3 btn-details-header`}></div>

              }
              <div className={`color-picker-new pick-color-litle1 pick-color-margin ${this.props.order.openColorPicker ? 'show' : 'hidden'}`}>
                <ul>
                  {this.props.colors.map((color, index)=>
                    {
                      return(
                        <li onClick={this.changeOrderColor.bind(this, color)} key={index} style={{backgroundColor: color.value}}></li>
                      );
                    }
                  )}
                </ul>
              </div>
              <Link href={`${order.order_type == "influencer" ? `/influencer_new_order?order_id=${order.id}` : `/new_order?order_id=${order.id}`}`}><button className="btn btn-white-header btn-details-header" data-toggle="tooltip" data-placement="top" title="Podvoji naročilo"><i className="fas fa-copy fa-lg"></i></button></Link>
              <button onClick={this.makeStornoF} className="btn btn-white-header btn-red btn-details-header ml-2" data-toggle="tooltip" data-placement="top" title="Storniraj naročilo"><i className="fas fa-cut fa-lg"></i></button>
              <div className="dropdown ml-2">
                <button className="btn btn-white-header btn-details-header dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-download fa-lg"></i>
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <a onClick={this.printInvoices} className="dropdown-item" href="#">Prenesi račun</a>
                  <a onClick={this.printPreInvoices} className="dropdown-item" href="#">Prenesi predračun</a>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center">
              {!order.responsible_agent_id ?
                <div className="d-block d-md-flex align-items-center">
                  <button onClick={this.add_agent_to_order.bind(this)} className="btn btn-white-header btn-details-header mr-1"><i className="fas fa-user-circle fa-lg" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Prevzemi naročilo"></i></button>
                  <label className="agent_order_align agent_order_label new-label-editing">Trenutno ureja<br/> <span>/</span> </label>
                </div>
                :
                <div className="d-block d-md-flex align-items-center">
                  <button onClick={this.add_agent_to_order.bind(this)} className="btn btn-white-header btn-details-header mr-1"><i className="fas fa-user-circle fa-lg" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Prevzemi naročilo"></i></button>
                  <label className="agent_order_align agent_order_label new-label-editing">Trenutno ureja<br/> <label className="agent_name_order_label">{editingUser.first_name} {editingUser.last_name}</label></label>
                </div> }
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center">
            {orderDifference > 0 ?
              <div className="d-block d-md-flex align-items-center">
                <p>Potrebno je poravnati razliko s kreditno kartico!</p>
              </div>
              :
              <div className="d-block d-md-flex align-items-center">
                <button onClick={this.changeStatusButton.bind(this)} className="btn btn-white-header btn-details-header mr-1" data-toggle="tooltip" data-placement="top" title="Spremeni status"><i className={`${!this.state.changeStatusButton ? 'fas fa-edit fa-lg' : 'fas fa-times fa-lg'}`} aria-hidden="true"></i></button>
                {!this.state.changeStatusButton ? <label className="left agent_order_align agent_order_label new-label-editing">Status naročila<br/>
                <label className="agent_name_order_label upper">{order.order_status.name}</label></label>: ''}
                {order.order_status.name == "Naknadno" && <div className="d-block" onClick={this.openNaknadnoModalChange.bind(this)}>{moment(order.date_naknadno).format('DD. MM. YYYY')}</div>}
                {this.state.changeStatusButton ?
                <Field name="order_status" className={`form-control w-100`} component='select' onChange={this.ChangeOrderStatus.bind(this)} >
                  <option key="12" value=""></option>
                  {order.order_status.next_statuses.map((u, index) => {
                    return (
                      <option key={index} value={u}>{u}</option>
                    )
                  })}
                </Field> : ''}
              </div>
            }




            </div>
            <div className="col-6 col-md-2 right dashboard_select_margin d-flex align-items-center justify-content-end">


              {!checkTmp && <button onClick={this.callCustomer.bind(this, true)} className="btn btn-white-header">Kliči</button>}
              {checkTmp && <button onClick={this.callCustomer.bind(this, false)} className="btn btn-white-header">Končaj klic</button>}



            </div>
          </div>
          <div className="row">
            <div className="col-md-12 m-t-30 d-flex">
              <div className={`mr-10 box-border-style tab-new ${this.state.activeTab=="Informacije" ? 'tab-new-active t-active' : ''}`} onClick={this.orderDetailsTab.bind(this)}><p className="">Informacije</p></div>
              <div className={`mr-10 box-border-style tab-new ${this.state.activeTab=="Komentarji" ? 'tab-new-active t-active' : ''}`}  onClick={this.orderDetailsTab.bind(this)}><p className="">Komentarji</p></div>
              <div className={`mr-10 box-border-style tab-new ${this.state.activeTab=="Prejšnja naročila" ? 'tab-new-active t-active' : ''}`} onClick={this.orderDetailsTab.bind(this)}><p className="">Prejšnja naročila</p></div>
              <div className={`mr-10 box-border-style tab-new ml-auto ${this.state.activeTab=="Zgodovina naročila" ? 'tab-new-active t-active' : ''}`} onClick={this.orderDetailsTab.bind(this)}><p className="">Zgodovina naročila</p></div>
              <div className={`box-border-style tab-new ${this.state.activeTab=="Zgodovina klicev" ? 'tab-new-active t-active' : ''}`} onClick={this.orderDetailsTab.bind(this)}><p className="">Zgodovina klicev</p></div>
            </div>
          </div>
          {this.state.activeTab == "Informacije" ?
            <div className="box-order-details container-fluid">
              <DetailsForm initialValues={orderInitialValues} countries={countries} order={order} editButton={this.state.editButton} exitEdit={this.exitEdit.bind(this)} />
              {order.alt_shipping_first_name != null && order.alt_shipping_last_name != null && order.alt_shipping_address != null &&
               order.alt_shipping_city != null && order.alt_shipping_postcode != null ? <div className="row mt-4">
                <div className="col-lg-7">
                  <div className="m-b-30">
                    <h5 className="details-heading m-r-30">INFORMACIJE ZA DOSTAVO</h5>
                  </div>
                  <div className="row">
                    <div className="col-7 font-new">
                      <div className="input-group input">
                        <label className="details-up-cust">Ime</label>
                        <p className="details-bot-cust">{order.alt_shipping_first_name}</p>
                      </div>
                      <div className="input-group input">
                        <label className="details-up-cust">Priimek</label>
                        <p className="details-bot-cust">{order.alt_shipping_last_name}</p>
                      </div>
                      <div className="input-group input">
                        <label className="details-up-cust">Naslov</label>
                        <p className="details-bot-cust">{order.alt_shipping_address}</p>
                      </div>
                    </div>
                    <div className="col-5 font-new">
                      <div className="input-group input">
                        <label className="details-up-cust">Mesto</label>
                        <p className="details-bot-cust">{order.alt_shipping_city}</p>
                      </div>
                      <div className="input-group input">
                        <label className="details-up-cust">Poštna številka</label>
                        <p className="details-bot-cust">{order.alt_shipping_postcode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              : ""}
              <hr className="hr_style"/>
              <div className="row">
                <div className="col-10">
                  <h5 className="headers-margins details-heading m-b-30 mt-2">NAROČILO</h5>
                </div>
                <div className="col-md-2 right">
                  <button onClick={this.sendEmail.bind(this)} className="btn btn-primary btn-lg">Pošlji e-mail</button>
                </div>
              </div>
              <div className="row">
                <div className={`${upsell_div == 'show' || acc_div == "show" || popust_div == "show" || kupon_div == 'show' ? 'col-12' : 'col-12'}`}>
                  <div className="row justify-content-center">
                    <div className={`col-md-7`}>
                      <table className="table order-products-table">
                        <thead>
                          <tr>
                            <th><label className="e">IZDELEK</label></th>
                            <th><label className="e">OPCIJE</label></th>
                            <th className="center"><label className="">KOLIČINA</label></th>
                            <th className="center"><label className="">CENA / KOS</label></th>
                            <th className="center"><label className="">SKUPAJ</label></th>
                            <th className="center"><label className="">DARILO</label></th>
                            <th className="center"><label className="">IZBRIŠI</label></th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.therapies && order.therapies.map(this.renderProducts.bind(this))}
                          {order.accessories && order.accessories.map(this.renderAccessories.bind(this))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="column border-top-table" colSpan="4"><label className="product-total-label">SUB-TOTAL</label></td>
                            <td className="center border-top-table product-information">{parseFloat(order.subtotal).toFixed(2)} {order.currency_symbol}</td>
                          </tr>
                          <tr>
                            <td className="column" colSpan="4"><label className="product-total-label">POPUST ({order.discountData && order.discountData.name})</label></td>
                            <td className="center product-information">{order.discount ? parseFloat(order.discount).toFixed(2) : parseFloat(0).toFixed(2)} {order.currency_symbol}</td>
                            <td></td>
                            {this.state.upsellDiv ? "" : order.discount_id != null ? <td className="center" onClick={this.deleteCoupon.bind(this)}><span className="fas fa-trash pointer"></span></td> : ""}
                          </tr>
                          {order.additional_discount && !order.additionalDiscountData.isOtoCoupon ? <tr>
                            <td className="column" colSpan="4"><label className="product-total-label">DODATNI POPUST</label></td>
                            <td className="center product-information">{parseFloat(order.additional_discount).toFixed(2)} {order.currency_symbol}</td>
                            <td></td>
                            {this.state.upsellDiv ? "" : order.additionalDiscountData ? <td className="center" onClick={this.deleteAdditional.bind(this)}><span className="fas fa-trash pointer"></span></td> : ""}
                          </tr> : "" }
                          <tr>
                            <td className="column" colSpan="4"><label className="product-total-label">DOSTAVA</label></td>
                            <td className=" center product-information">{parseFloat(order.shipping_fee).toFixed(2)} {order.currency_symbol}</td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="column last-total-t td_total_font_size border-top-table right"><b>SKUPAJ</b></td>
                            <td className="center last-total td_total_font_size border-top-table">{parseFloat(order.total).toFixed(2)} {order.currency_symbol}
                            {order.currency_code != "EUR" ? <span className="font-weight-bold"> ({order.eur_value} EUR)</span> : ""}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className={`${upsell_div} col-md-4`}>
                      <div className={`col-md-12 upsell-div-background max-height`}>
                        <label className="upsell-headers pb-4 pt-2 pl-2">UPSELL</label>
                        <div className="row">
                          <div className="col-md-7 upsell-list">
                            {show_therapies && show_therapies.map(this.render_therapies_uppsale.bind(this))}
                          </div>
                          <div className="col-md-5 right upsell-main-products">
                            {upsell_categories.map(this.render_product_buttons_uppsale.bind(this))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${acc_div} col-md-4`}>
                      <div className={`col-md-12 upsell-div-background max-height`}>
                        <label className="upsell-headers pb-4 pt-2 pl-2">ACCESSORIES</label>
                        <div className="row">
                          <div className="col-md-12 upsell-list">
                            {show_therapies && show_therapies.map(this.render_therapies_uppsale.bind(this))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${kupon_div} pt-3 pb-2 col-md-4 blue-back`}>
                      <label className="upsell-headers pb-4 pt-2 pl-2">KUPON</label>
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="input-group input">
                            <label className="control-label">Vnesi kodo kupona</label>
                            <div className="flex">
                              <input type="text" value={this.state.kuponValue} className="form-control mr-10" onChange={this.changeKuponValue.bind(this)} />
                              <button onClick={this.checkDiscount.bind(this)} className={`btn-cta cta-active cta-big`}>Potrdi</button>
                            </div>
                          </div>
                          <div className="mt-10">
                            <p>Tip: <b>{order.discountData && order.discountData.type}</b></p>
                            <p>Vrsta popusta: <b>{order.discountData && order.discountData.discount_type}</b></p>
                            <p>Vrednost: <b>{order.discountData &&order.discountData.discount_value}</b></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${popust_div} pt-3 pb-2 col-md-4 blue-back`}>
                      <label className="upsell-headers pb-4 pt-2 pl-2">DODATNI POPUST</label>
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
                        {this.state.dType == 'individual' ?
                          <div className="col-lg-12 mb-10 popust-select">
                          <Select
                            className="form-control"
                            name=""
                            placeholder="Izberi terapije"
                            value={this.state.individualTherapies}
                            onChange={this.changeIndividualTherapies.bind(this)}
                            options={t}
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
                          <button onClick={this.addAdditionalDiscount.bind(this)} className={`btn-cta cta-active`}>Potrdi</button>
                        </div>
                      </div>
                    </div>
                    <div className={`pt-3 pb-2 col-md-1`}>
                      {this.state.user && order.responsible_agent_id == this.state.user.id &&
                      <div>
                        <button onClick={this.showUpsellDiv.bind(this)} className={`btn-cta cta-active mb-10`}>Upsell</button>
                      </div>
                      }
                      <div>
                        <button onClick={this.showAccDiv.bind(this)} className={`btn-cta cta-active mb-10`}>Dodatek</button>
                      </div>
                      <div>
                        <button disabled={upsell_div == 'show' || acc_div == "show"} onClick={this.showKuponDiv.bind(this)} className={`btn-cta mb-10`}>Kupon</button>
                      </div>
                      <div>
                        <button disabled={upsell_div == 'show' || acc_div == "show"} onClick={this.showPopustDiv.bind(this)} className={`btn-cta mb-10`}>Popust</button>
                      </div>
                      <div>
                        <button onClick={this.hideUpsellBox.bind(this)} className={`${this.state.upsellDiv  ? '' : 'hidden'} btn btn-cta btn-red`}>Prekliči</button>
                        <button onClick={this.hideAccBox.bind(this)} className={`${this.state.accDiv ? '' : 'hidden'} btn btn-cta btn-red`}>Prekliči</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
              <div>
                {show_gifts && show_gifts.map(this.renderAllGifts.bind(this))}
              </div>
              </div>
              <div className="row order-details-bottom">
                <div className="col center">
                  <h5 className="headers-margins">PRVOTNI ZNESEK NAROČILA</h5>
                  <h2 className="h2-top-margin">{firstTotal && firstTotal.toFixed(2)} {this.props.order.currency_symbol}</h2>
                  {super_admin && (<button onClick={this.ponastaviZnesek.bind(this)} className="btn btn-secondary btm-sm">Ponastavi znesek</button>)}
                </div>
                <div className="col center">
                  <h5 className="headers-margins">KONČNI ZNESEK NAROČILA</h5>
                  <h2 className="h2-top-margin">{order && order.total && order.total.toFixed(2) || 0} {this.props.order.currency_symbol}</h2>
                </div>
                <div className="col center">
                  <h5 className="headers-margins">UPSELL</h5>
                  <h2 className="h2-top-margin">{order.upsales && order.upsales.upsale.toFixed(2) || 0} {this.props.order.currency_symbol}</h2>
                </div>
                {
                  order.payment_method_code && order.payment_method_code == 'stripe'
                  ?
                    <div className="col center">
                      <h5 className="headers-margins">ŽE PLAČANO S KARTICO</h5>
                      <h2 className="h2-top-margin">{(order.payment_amount / 100).toFixed(2)} {this.props.order.currency_symbol}</h2>
                        {
                          orderDifference > 0
                          ? <button onClick={this.payTheDifference.bind(this)} className="btn btn-secondary btm-sm btn-difference">Plačaj razliko<br/> {orderDifference} {this.props.order.currency_symbol}</button>
                          : null
                        }
                    </div>
                  : null
                }
              </div>
            </div>
          : ""}
          {this.state.activeTab == "Komentarji" ?
            <div className="box-order-details container-fluid komentarji">
              <div className="row">
                <div className="col-md-12">
                  <h5 className="details-heading m-b-30">KOMENTARJI</h5>
                  <div className="table-responsive pb-4">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th className="">Uporabnik</th>
                          <th className="">Komentar</th>
                          <th className="">Datum oddaje</th>
                          <th className="align-center">Izbriši</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.comments.map(this.renderOrderComment.bind(this))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <form onSubmit={handleSubmit(this.CreateComment.bind(this))}>
                      <div className={`form-group`}>
                        <div className="class comment">
                          <Field name="content" place="Dodaj komentar" component={renderArea}/>
                        </div>
                      </div>
                      <div className={`form-group`}>
                        <div className="comment order-details-comments">
                          <button type="submit" className="btn btn-default">Shrani</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          : ""}
          {this.state.activeTab == "Zgodovina naročila" ?
            <div className="box-order-details container-fluid zgodovina-narocila pb-3">
              <div className="row">
                <div className="col-md-12">
                  <h5 className="details-heading m-b-30">ZGODOVINA NAROČILA</h5>
                  <div className="table-responsive no-padding overflow-table">
                    <table className="table table-cust">
                      <thead>
                        <tr>
                          <th className="">#</th>
                          <th className="">Datum spremembe</th>
                          <th className="">Vrsta spremembe</th>
                          <th className="center">Agent</th>
                        </tr>
                      </thead>
                      {order.order_history.map(this.renderOrderHistory.bind(this))}
                    </table>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mt-4">
                <h5 className="details-heading m-b-30">OPOMNIKI PREVZEMA</h5>
                <div className="table-responsive no-padding overflow-table">
                    <table className="table table-cust table-tr-hover transparent">
                      <thead>
                        <tr>
                          <th className="left table-pad-l-8">datum pošiljanja</th>
                          <th className="left table-pad-l-8">datum odpiranja</th>
                          <th className="left table-pad-l-8">odprt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.delivery_reminder_mails.length > 0 ? order.delivery_reminder_mails.map(this.renderSingleMail.bind(this)) : ""}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          : ""}
          {this.state.activeTab == "Zgodovina klicev" ?
            <div className="box-order-details container-fluid zgodovina-klicev pb-3">
              <div className="row">
                <div className="col-md-12">
                <h5 className="details-heading m-b-30">ZGODOVINA KLICEV</h5>
                <div className="table-responsive no-padding overflow-table">
                    <table className="table table-cust">
                      <thead>
                        <tr>
                          <th className="">#</th>
                          <th className="">Datum klicanja</th>
                          <th className="center">Ime dispozicije</th>
                          <th className="center">Tip klica</th>
                          <th className="">Podrobnosti</th>
                        </tr>
                      </thead>
                      {order.calls.map(this.renderSingleCall.bind(this))}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          : ""}
          {this.state.activeTab == "Prejšnja naročila" ?
            <div className="box-order-details container-fluid prejsnja-narocila pb-3">
              <div className="row">
                <div className="col-md-12">
                  <h5 className="details-heading m-b-30">PREJŠNJA NAROČILA</h5>
                  <div className="table-responsive no-padding overflow-table">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th className="">ID</th>
                          <th className="">Datum oddaje</th>
                          <th className="">Status</th>
                          <th className="">Skupna cena</th>
                          <th className="text-center">Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.customer.old_orders.map(this.renderOldOrders.bind(this))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          : ""}
          {this.state.naknadnoModal ? <DateNaknadno closeNaknadnoModal={this.closeNaknadnoModal.bind(this)} status={this.state.change_status} naknadnoModal={this.state.naknadnoModal} EditDateNaknadno={this.EditDateNaknadno.bind(this)}/> : ""}
        </div>
      )
    }
 }

 const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning } }) => (
   <div>
     <textarea placeholder={place} {...input} className={'t-new-f form-control new-textarea-comment'} />
   </div>
 );

const mapDispatchToProps = (dispatch) => {
  return {
    getOrderDetails: (order_id) => {
      dispatch(getOrderDetails(order_id))
    },

    createComment: (obj, data) => {
      dispatch(createComment(obj, data))
    },

    deleteComment: (id) => {
      dispatch(deleteComment(id))
    },

    takeOrder: (id) => {
      dispatch(takeOrder(id))
    },

    show_color: (id) => {
      dispatch(show_color(id))
    },

    add_color: (id, color) => {
      dispatch(add_color(id, color))
    },

    getColorDashboard: () => {
      dispatch(getColorDashboard())
    },

    clearTherapy: (therapy) => {
      dispatch(clearTherapy(therapy))
    },

    clearTherapyStorno: (therapy) => {
      dispatch(clearTherapyStorno(therapy))
    },

    show_therapies_upsell: (e) => {
      dispatch(show_therapies_upsell(e))
    },

    deleteTherapy: (e) => {
      dispatch(deleteTherapy(e))
    },

    editOrderTherapies: (id, data) => {
      dispatch(editOrderTherapies(id, data))
    },

    addAdditionalDiscount: (total, id, discount, data) => {
      dispatch(addAdditionalDiscount(total, id, discount, data))
    },

    checkDiscount: (order, name, country) => {
      dispatch(checkDiscount(order, name, country))
    },

    callCustomer: (id, flag, tel, username, country, data) => {
      dispatch(callCustomer(id, flag, tel, username, country, data))
    },

    endCall: () => {
      dispatch(endCall())
    },

    editOrderGifts: (id, data) => {
      dispatch(editOrderGifts(id, data))
    },

    editOrderInfo: (id, data) => {
      dispatch(editOrderInfo(id, data))
    },

    changeOrderStatus: (id, status) => {
      dispatch(changeOrderStatus(id, status));
    },

    changeTherapyQuantity: (row, quantity) => {
      dispatch(changeTherapyQuantity(row, quantity))
    },

    changeTherapyQuantityStorno: (row, quantity) => {
      dispatch(changeTherapyQuantityStorno(row, quantity))
    },

    changeAccQuantity: (row, quantity) => {
      dispatch(changeAccQuantity(row, quantity))
    },

    endVccCall: (data) => {
      dispatch(endVccCall(data));
    },

    removeOccupiedOrder: (id) => {
      dispatch(removeOccupiedOrder(id))
    },

    sendEmail: (obj) => {
      dispatch(sendEmail(obj))
    },

    deleteDiscount: (id, obj) => {
      dispatch(deleteDiscount(id, obj))
    },

    deleteAccessory: (obj) => {
      dispatch(deleteAccessory(obj))
    },

    editOrderDetails: (id, obj) => {
      dispatch(editOrderDetails(id, obj))
    },

    isAccessoryGift: (obj) => {
      dispatch(isAccessoryGift(obj))
    },

    accessoryOption: (obj, option) => {
      dispatch(accessoryOption(obj, option))
    },

    makeStorno: (id) => {
      dispatch(makeStorno(id))
    },
    printInvoices: (id) => {
      dispatch(printInvoices(id))
    },

    printPreInvoices: (id) => {
      dispatch(printPreInvoices(id))
    },

    editHistoryInfo: (id, data) => {
      dispatch(editHistoryInfo(id, data))
    },

    payDifference: (data) => {
      dispatch(payDifference(data))
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    order: nextState.order_details_data.order,
    user: nextState.main_data.user,
    colors: nextState.colors_data.colors,
    colorsCount: nextState.colors_data.colorsCount,
    products: nextState.main_data.products,
    therapies: nextState.order_details_data.therapies,
    show_therapies: nextState.order_details_data.show_therapies,
    changedData: nextState.order_details_data.changedData,
    orderInitialValues: Immutable.fromJS(nextState.order_details_data.initial_order),
    countries: nextState.order_details_data.countries,
    openColorPicker: nextState.order_details_data.openColorPicker,
    calling: nextState.order_details_data.calling,
    admins: nextState.main_data.admins,
    show_gifts: nextState.gifts_data.orderGifts,
    flag_countries: nextState.main_data.countries,
    all_countries: nextState.main_data.countries,
    categories: nextState.main_data.categories
  }
}

export default compose(
  reduxForm({
    form: 'OrderDetailsForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(OrderDetails);
