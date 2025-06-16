import React, { Component } from "react";
import { Link, browserHistory } from 'react-router';
import Moment from "moment"

var location;;

class DashboardTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.activeRowColor !== nextProps.activeRowColor) {
  //     return true
  //   }

  //   if (this.props.checkAll !== nextProps.checkAll) {
  //     return true
  //   }

  //   if (this.props.colors.length !== nextProps.colors.length) {
  //     return true
  //   }

  //   if (this.props.orders.length !== nextProps.orders.length) {
  //     return true
  //   }

  //   if (this.props.orderstatuses.length !== nextProps.orderstatuses.length) {
  //     return true
  //   }

  //   if (this.props.selected_type.value !== nextProps.selected_type.value) {
  //     return true
  //   }

  //   if (this.props.selected_orders.length !== nextProps.selected_orders.length) {
  //     return true
  //   }

  //   return false;
  // }

  renderTabs = (orderStatusTab, index) => {
    const { orderStatusesTabs, activeStatusTab } = this.props
    location = browserHistory.getCurrentLocation();

    var activeTab = '';
    if(location.query.order_statuses) {
      activeTab = location.query.order_statuses;
    } else {
      activeTab = activeStatusTab;
    }

    return (
      <li className={`${activeTab == orderStatusTab.id ? 'active': ''}`} onClick={orderStatusesTabs} data-color={orderStatusTab.color} data-name={orderStatusTab.name} data-id={orderStatusTab.id} key={index}
      style={{borderTopColor: orderStatusTab.color}}>
        <a style={{backgroundColor: activeTab == orderStatusTab.id ? orderStatusTab.color : ''}}>{orderStatusTab.name}</a>
      </li>
    )
  }

  renderSingleOrder = (order, index) => {
    const { orderstatuses, selected_type, showColors, colors, _changeOrderColor, checkOrder, _changeOrderStatus } = this.props

    location = browserHistory.getCurrentLocation();
    let selectedStatus = orderstatuses.find(s => {
      return s.id === location.query.order_statuses
    })
    let color = "";
    if (!selectedStatus) {
      color = order.order_status.color
    }
    return (
      <tr style={{backgroundColor: color}} className={order.order_status.name != "Storno" && order.storno_id ? "storno" : ""} key={index}>
        <td className="ordersTable center"><input className="input-checkbox-style pointer" onChange={checkOrder(order)} checked={order.checked} type="checkbox"/></td>
        <td className="ordersTable center">
          { !order.order_color_id ?
            <a onClick={showColors(order)} className="pointer">
              <span className="show dash-sign"><i className="fas fa-th"></i></span>
            </a>
            :
            <a onClick={showColors(order)} className="pointer">
              <span style={{backgroundColor: order.order_color_value}} className={`order-color-litle-box ${order.order_color_value ? 'show-litle-box' : 'hidden'}`}></span>
            </a>
          }
          <div className={`pick-color-litle pick-color-litle-style ${order.openColorPicker ? 'show' : 'hidden'}`}>
            <ul>
              {colors.map((color, index)=>
                {
                  return (
                    <li onClick={_changeOrderColor(order, color, 1)} key={index} style={{backgroundColor: color.value}}></li>
                  );
                }
              )}
            </ul>
          </div>
        </td>
        <td className="ordersTable center">{order.order_id2} {order.payment_method_code == "PROFORMA" ? <span className="waiting-payment">P</span> : ""}</td>
        <td className="ordersTable">{order.shipping_first_name} {order.shipping_last_name}</td>
        <td className="ordersTable">{order.therapies.map(t => {return t.name}).join(", ")} <br/> {order.accessories.map(a => {return a.name}).join(", ")}</td>
        {selected_type.value == "marketing" && <td className="ordersTable">{order.discountData ? order.discountData.name : ""}</td>}
        {selected_type.value == "marketing" && <td className="ordersTable">{order.utm_source != null ? order.utm_source : ""}</td>}
        {selected_type.value == "marketing" && <td className="ordersTable">{order.utm_medium != null ? order.utm_medium : ""}</td>}
        {selected_type.value == "marketing" && <td className="ordersTable">{order.utm_campaign != null ? order.utm_campaign : ""}</td>}
        {selected_type.value == "marketing" && <td className="ordersTable">{order.utm_content != null ? order.utm_content : ""}</td>}
        {selected_type.value == "marketing" && <td className="ordersTable">{order.order_type}</td>}
        {selected_type.value == "storno" && <td className="ordersTable">{order.responsible_agent_username != null ? order.responsible_agent_username : ""}</td>}
        {selected_type.value == "storno" && <td className="ordersTable">{order.storno_status ? order.storno_status : ""}</td>}
        {selected_type.value == "storno" && <td className="ordersTable">{order.declined_order_status ? order.declined_order_status : ""}</td>}
        {selected_type.value == "storno" && <td className="ordersTable">{order.order_type}</td>}
        {selected_type.value == "agent" && <td className="ordersTable">{order.responsible_agent_username != null ? order.responsible_agent_username : ""}</td>}
        {selected_type.value == "agent" && <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.initial_total).toFixed(2) : "0.00"} {order.currency_symbol}</td>}
        {selected_type.value == "agent" && <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.upsale).toFixed(2) : "0.00"} {order.currency_symbol}</td>}
        {selected_type.value == "agent" && <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.total).toFixed(2) : "0.00"} {order.currency_symbol}</td>}
        {selected_type.value == "agent" && <td className="ordersTable">{order.order_type}</td>}
        {selected_type.value == "normal" && <td className="ordersTable">{order.responsible_agent_username != null ? order.responsible_agent_username : ""}</td>}
        {selected_type.value == "normal" && <td className="ordersTable center">{order.shipping_country}</td>}
        {selected_type.value == "normal" && <td className="ordersTable center">{parseFloat(order.total).toFixed(2)} {order.currency_symbol}</td>}
        {selected_type.value == "normal" && <td className="ordersTable center">{Moment (order.date_added).format("DD. MM. YYYY, HH:mm:ss")}</td>}
        {selected_type.value == "normal" && <td className="ordersTable center">
          <select onChange={_changeOrderStatus(order, 1)} value={order.order_status.name}>
            <option>{order.order_status.name}</option>
            {order.order_status.next_statuses.map((s, index) => {
              return (<option key={index} value={s}>
                {s}
              </option>)
            })}
          </select>
        </td>}
        <td className="ordersTable center"><Link target="_blank" to={`/order_details?id=${order.id}`}><span className="fas fa-info-circle pointer"></span></Link></td>
      </tr>
    )
  }

  render() {
    const { orderstatuses, orders, selected_type, _checkAll, checkAll, activeRowColor } = this.props

    return (
      <React.Fragment>
        <div className="row d-none d-md-flex">
          <div className="col-md-12">
            <div className="nav-tabs-custom">
              <ul className="nav nav-tabs">
                {orderstatuses.map(this.renderTabs)}
              </ul>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="table-responsive col-md-12">
            <table className="table table-striped f-size-c">
              <thead>
                <tr className="tr-text-color" style={{backgroundColor: activeRowColor ? activeRowColor : ""}}>
                  <th className="ordersTable center table-pad-l-8">
                    <input className="pointer" value={checkAll} checked={checkAll} onChange={_checkAll} type="checkbox"/></th>
                  <th className="ordersTable center table-pad-l-8">Barva</th>
                  <th className="ordersTable center table-pad-l-8">ID</th>
                  <th className="ordersTable table-pad-l-8">Stranka</th>
                  <th className="ordersTable table-pad-l-8">Izdelki</th>
                  {selected_type.value == "normal" && <th className="ordersTable table-pad-l-8">Agent</th>}
                  {selected_type.value == "normal" && <th className="ordersTable table-pad-l-8">Država</th>}
                  {selected_type.value == "normal" && <th className="ordersTable center table-pad-l-8">Skupna cena</th>}
                  {selected_type.value == "normal" && <th className="ordersTable center table-pad-l-8">Datum oddaje</th>}
                  {selected_type.value == "normal" && <th className="ordersTable center table-pad-l-8">Status</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">Kupon</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">UTM Source</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">UTM Medium</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">UTM Campaign</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">UTM Content</th>}
                  {selected_type.value == "marketing" && <th className="ordersTable table-pad-l-8">Tip naročila</th>}
                  {selected_type.value == "storno" && <th className="ordersTable table-pad-l-8">Agent</th>}
                  {selected_type.value == "storno" && <th className="ordersTable table-pad-l-8">Vrsta storna</th>}
                  {selected_type.value == "storno" && <th className="ordersTable table-pad-l-8">Klic</th>}
                  {selected_type.value == "storno" && <th className="ordersTable table-pad-l-8">Tip naročila</th>}
                  {selected_type.value == "agent" && <th className="ordersTable table-pad-l-8">Agent</th>}
                  {selected_type.value == "agent" && <th className="ordersTable center table-pad-l-8">Prvotni znesek</th>}
                  {selected_type.value == "agent" && <th className="ordersTable center table-pad-l-8">Upsell</th>}
                  {selected_type.value == "agent" && <th className="ordersTable center table-pad-l-8">Končni znesek</th>}
                  {selected_type.value == "agent" && <th className="ordersTable center table-pad-l-8">Tip naročila</th>}
                  <th className="ordersTable center table-pad-l-8">Info</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(this.renderSingleOrder)}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default DashboardTable
