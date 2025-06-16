import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {compose} from 'redux';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import { editOrderInfo, addOrderBadge, newOrderOccupied, removeOccupiedOrder } from '../../actions/order_details_actions.js';
import {getBadges} from '../../actions/badges_actions';

class DetailsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {addBadgeBtn:false};
  }

  componentDidMount(){
    this.props.getBadges();
    this.orderOccupation();
  };

  orderOccupation(){
    var self = this;
    if(this.props.socket){
      this.props.socket.on('orderOccupied',function(order){
        self.props.newOrderOccupied(order.id);
      });

      this.props.socket.on('orderReleased',function(order){
        self.props.removeOccupiedOrder(order.id);
      });
    }
  }

  updateOrderInfo(data) {
    data = data.toJS();
    var location = browserHistory.getCurrentLocation();
    var initialValues = this.props.initialValues.toJS();
    if(data.utm_source == "")
      data.utm_source = null;
    var changes = this.checkForChanges(initialValues, data);
    console.log(changes)
    if (changes.payment_method_code) {
      let pm = this.props.paymentmethods.find(p => {
        return p.code == changes.payment_method_code
      })
      changes.payment_method_name = pm.translations[this.props.order.lang.toUpperCase()];
      changes.payment_method_id = pm.id
    }

    if (changes.delivery_method_code) {
      console.log(this.props.deliverymethods)
      let dm = this.props.deliverymethods.find(p => {
        return p.code == changes.delivery_method_code
      })
      changes.delivery_method_code = dm.translations[this.props.order.lang.toUpperCase()];
      changes.delivery_method_id = dm.id

      if (dm.to_price > this.props.order.subtotal) {
        if (this.props.order.shipping_fee > 0) {
          changes.total = (this.props.order.total - this.props.order.shipping_fee) + dm.price
          changes.shipping_fee = dm.price
        } else {
          changes.total = this.props.order.total + dm.price
          changes.shipping_fee = dm.price
        }
      } else {
        if (this.props.order.shipping_fee > 0) {
          changes.total = this.props.order.total - this.props.order.shipping_fee
          changes.shipping_fee = 0;
        }
      }
    }

    this.props.editOrderInfo(location.query.id, changes);
    this.props.exitEdit();
    this.setState({editButton: !this.state.editButton});
    this.setState({editButtonText: !this.state.editButtonText});
    this.setState({editButtonIcon: !this.state.editButtonIcon});
  }

  checkForChanges(initialValues, data) {
    var changes = {}
    for (var i in initialValues) {
      if (initialValues[i] != data[i]) {
        changes[i] = data[i]
      }
    }
    return changes
  }

  changeEditButton()
  {
    this.setState({editButton: !this.state.editButton});
    this.setState({editButtonText: !this.state.editButtonText});
    this.setState({editButtonIcon: !this.state.editButtonIcon});
    if(!this.state.editButton){
      if(this.props.socket){
        this.props.socket.emit('orderOccupation', {id: this.props.order.id, occupied: true});
      }
    }
    else{
      console.log('clicked prekliči')
      if(this.props.socket){
        this.props.socket.emit('orderOccupation', {id: this.props.order.id, occupied: false});
      }
    }
  }

  addBadgeClick(){
    this.setState({addBadgeBtn:true})
  }

  cancelClick() {
    this.setState({addBadgeBtn: false})
  }

  newBadge(customer, data){
    var status = data.target.value;
    var tmp = [];
    if(customer.badges){
      for(var i=0; i<customer.badges.length; i++)
        tmp.push(customer.badges[i].id)
    }
    tmp.push(status);
    if(status!=""){
      this.props.addOrderBadge(customer.id, {badges:tmp}, this.props.order.id)
      this.setState({addBadgeBtn: false})
    }
  }

  deleteBadge(badge, customer) {
    var badges = customer.badges.filter(b => {
      return b.id != badge.id
    })
    badges = badges.map(b => {
      return b.id
    })
    if(window.confirm("Ali ste sigurni da hočete izbrisati značko?"))
      this.props.addOrderBadge(customer.id, {badges}, this.props.order.id)
  }

  changeStornoStatus = (storno_status) => () => {
    let data = {
      storno_status
    }
    this.props.editOrderInfo(this.props.order.id, data)
  }

  changeDeclinedStatus = (declined_order_status) => () => {
    let data = {
      declined_order_status
    }
    this.props.editOrderInfo(this.props.order.id, data)
  }

  render(){
    const { handleSubmit, order, countries, paymentmethods, formValues,
    deliverymethods, utmmedia, user } = this.props;

    const {editButton} = this.state

    var p = [];
    paymentmethods.map(m => {
      var fm = m.countries.find(c => {
        return c == formValues.shipping_country
      })
      if (fm)
      p.push(m)
    })

    var d = [];
    deliverymethods.map(m => {
      if (m.country == formValues.shipping_country)
      d.push(m)
    })

    let editButtonClass = this.state.editButton ? "btn btn-cancel btn-lg float-right d-block ml-3" : "btn btn-primary btn-lg float-right d-block";
    let editButtonText = this.state.editButton ? "Prekliči" : "Uredi";


    let pmm = []
    this.props.paymentmethods.map(p => {
      let title = p.translations[order.lang] || p.translations["SL"] || ""
      pmm.push({
        value: p.code,
        label: title
      })
    })

    return (
        <form className="row" onSubmit={handleSubmit(this.updateOrderInfo.bind(this))} >
          <div className="col-lg-7">
            <div className="d-block d-md-flex align-items-center m-b-30">
              <h5 className="details-heading m-r-30">STRANKA</h5>
              {order.customer.upsale_count>0 && <span className="customer-flags gold-badge">{order.customer.upsale_count}x UPSELL</span>}
              {order.customer.no_upsale_count>0 && <span className="customer-flags red">{order.customer.no_upsale_count}x BREZ UPSELL</span>}
              {order.customer.declined_count >0 && <span className="customer-flags red">{order.customer.declined_count}x NEPREVZEM</span>}
              {order.customer.badges &&
                order.customer.badges.map((u, index) => {
                  return (
                    <span key={index} className="customer-flags" style={{backgroundColor: u.color}}>{u.name} <i className="x-button" onClick={this.deleteBadge.bind(this, u, order.customer)}>X</i></span>
                  )
                })
              }
              {!this.state.addBadgeBtn ? <span className="btn btn-tag btn-sm" onClick={this.addBadgeClick.bind(this)}>DODAJ ZNAČKO</span>: ''}
              {this.state.addBadgeBtn?
              <Field name="order_status" className={`form-control new-select-badges m-t-0`} component='select' onChange={this.newBadge.bind(this, order.customer)} >
                <option key="12" value=""></option>
                {this.props.badges.map((u, index) => {
                  return (
                    <option key={index} value={u.id}>{u.name}</option>
                  )
                })}
              </Field> : ''}
              {this.state.addBadgeBtn ? <span onClick={this.cancelClick.bind(this)} className="btn btn-tag btn-sm ml-1">PREKLIČI</span>: ''}
            </div>
              <label className="details-up-cust mb-2">Podatki plačnika</label>
              <div className="row">
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Ime</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_first_name}</p> : ''}
                    {editButton ? <Field name="payment_first_name" place="Ime" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Priimek</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_last_name}</p> : ''}
                    {editButton ? <Field name="payment_last_name" place="Priimek" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-12 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Naslov</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_address}</p> : '' }
                    {editButton ? <Field name="payment_address" place="Naslov" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Poštna številka</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_postcode}</p> : '' }
                    {editButton ? <Field name="payment_postcode" place="Poštna številka" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Mesto</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_city}</p> : ''}
                    {editButton ? <Field name="payment_city" place="Mesto" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Telefonska številka</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_telephone}</p> : '' }
                    {editButton ? <Field name="shipping_telephone" place="Telefonska številka" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">E-pošta</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_email}</p> : ''}
                    {editButton ? <Field name="shipping_email" place="E-pošta" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-12 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Država</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_country}</p> : ''}
                    {editButton ?
                      <Field name="payment_country" placeholder="Država" options={countries.map(c => {return {label: c, value: c}})} component={renderSelect} label="Država"/>
                    : ''}
                  </div>
                </div>
              </div>
              <span className="border-top w-50 d-block pb-4 mt-2"></span>
              <label className="details-up-cust mb-2">Podatki za dostavo</label>
              <div className="row">
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Ime</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_first_name}</p> : ''}
                    {editButton ? <Field name="shipping_first_name" place="Ime" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Priimek</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_last_name}</p> : ''}
                    {editButton ? <Field name="shipping_last_name" place="Priimek" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-12 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Naslov</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_address}</p> : '' }
                    {editButton ? <Field name="shipping_address" place="Naslov" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Poštna številka</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_postcode}</p> : '' }
                    {editButton ? <Field name="shipping_postcode" place="Poštna številka" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Mesto</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_city}</p> : ''}
                    {editButton ? <Field name="shipping_city" place="Mesto" component={renderField}/> : ''}
                  </div>
                </div>
                <div className="col-12 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">Država</label>
                    {!editButton ? <p className="details-bot-cust">{order.shipping_country}</p> : ''}
                    {editButton ?
                      <Field name="shipping_country" placeholder="Država" options={countries.map(c => {return {label: c, value: c}})} component={renderSelect} label="Država"/>
                    : ''}
                    </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-3">
              <h5 className="details-heading">MARKETING</h5>
              <div className="row m-t-30">
                <div className="col-lg-6 font-new">
                  <div className="input-group input">
                    <label className="details-up-cust">UTM source</label>
                    {!editButton ? <p className="details-bot-cust">{order.utm_source}</p> : '' }
                    {editButton ? <Field name="utm_source" place="UTM source" component={renderField}/> : ''}
                  </div>
                  <div className="input-group input">
                      <label className="details-up-cust">UTM campaign</label>
                      {!editButton ? <p className="details-bot-cust">{order.utm_campaign}</p> : '' }
                      {editButton ? <Field name="utm_campaign" place="UTM campaign" component={renderField}/> : ''}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input-group input">
                      <label className="details-up-cust">UTM medium</label>
                      {!editButton ? <p className="details-bot-cust">{order.utm_medium}</p> : ''}
                      {editButton ?
                        <Field name="utm_medium" placeholder="UTM medium" options={utmmedia.map(u => {return {label: u.name, value: u.name}})} component={renderSelect}/>
                      : ''}
                    </div>
                    <div className="input-group input">
                      <label className="details-up-cust">UTM content</label>
                      {!editButton ? <p className="details-bot-cust">{order.utm_content}</p> : ''}
                      {editButton ? <Field name="utm_content" place="UTM Content" component={renderField}/> : ''}
                    </div>
                  </div>
                </div>
                <span className="border-top w-50 d-block pb-4 mt-2"></span>
                <h5 className="details-heading mt-2">DOSTAVA IN PLAČILO</h5>
                <div className="row m-t-30">
                  <div className="col-6">
                    <label className="details-up-cust">Način dostave</label>
                    {!editButton ? <p className="details-bot-cust">{order.delivery_method_code ? order.delivery_method_code : "Ni določeno"}</p> : '' }
                    {editButton ? <Field name="delivery_method_code" placeholder="Način dostave" options={this.props.deliverymethods.map(d => {return {label: d.code, value: d.code}})} component={renderSelect} label="Način dostave"/> : ''}
                  </div>
                  <div className="col-6">
                    <label className="details-up-cust">Način plačila</label>
                    {!editButton ? <p className="details-bot-cust">{order.payment_method_name ? order.payment_method_name : "Ni določeno"}</p> : '' }
                    {editButton ? <Field name="payment_method_code" placeholder="Način plačila" options={pmm} component={renderSelect} label="Način plačila"/> : ''}
                  </div>
                </div>
                {order.order_status.name == "Storno" &&
                <React.Fragment>
                  <span className="border-top w-50 d-block pb-4 mt-2"></span>
                  <h5 className="details-heading mt-2">STORNO STATUS</h5>
                  <div className="d-flex align-items-center flex-row pt-2">
                    <div className="dropdown">
                      <button className="btn btn-secondary btn-lg dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="fas fa-tag fa-lg"></i>
                      </button>
                      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a onClick={this.changeStornoStatus("Zavrnjena pošiljka")} className="dropdown-item" href="#">Zavrnjena pošiljka</a>
                        <a onClick={this.changeStornoStatus("Reklamacija")} className="dropdown-item" href="#">Reklamacija</a>
                        <a onClick={this.changeStornoStatus("Vračilo")} className="dropdown-item" href="#">Vračilo</a>
                      </div>
                    </div>
                    {this.props.order.storno_status === "Zavrnjena pošiljka" && <div className="dropdown ml-2">
                      <button className="btn btn-secondary btn-lg dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="fas fa-phone-alt fa-lg"></i>
                      </button>
                      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a onClick={this.changeDeclinedStatus("Poklicano (novo naročilo)")} className="dropdown-item" href="#">Poklicano in poslano ponovno</a>
                        <a onClick={this.changeDeclinedStatus("Poklicano (ne želi)")} className="dropdown-item" href="#">Poklicano - ne želi izdelkov</a>
                        <a onClick={this.changeDeclinedStatus("Se ne javi 1x")} className="dropdown-item" href="#">Se ne javi 1x</a>
                        <a onClick={this.changeDeclinedStatus("Se ne javi 2x")} className="dropdown-item" href="#">Se ne javi 2x</a>
                      </div>
                    </div>}
                  </div>
                  <div className="row m-t-30">
                    <div className="col-6">
                      <label className="details-up-cust">Storno status</label>
                      <p className="details-bot-cust">{order.storno_status || "/"}</p>
                    </div>
                    {this.props.order.storno_status === "Zavrnjena pošiljka" &&
                      <div className="col-6">
                          <label className="details-up-cust">Status klica - Zavrnjeni paketi</label>
                          <p className="details-bot-cust">{order.declined_order_status || "/"}</p>
                      </div>}
                  </div>
                </React.Fragment>}
              </div>
              <div className="col-md-2 float-right">
              <button type="button" disabled={localStorage.getItem('occupiedOrders') && (localStorage.getItem('occupiedOrders').includes(this.props.order.id) || localStorage.getItem('occupiedOrders') == this.props.order.id) && editButtonText == 'POSODOBI' ? true : false} onClick={this.changeEditButton.bind(this)} className={`${editButtonClass}`}>{editButtonText}</button>
                {editButton ? <button type="submit" className="btn btn-primary btn-lg d-block float-right mb-10"><i className="fas fa-save fa-lg" aria-hidden="true"></i> SHRANI</button> : ''}
              </div>
            </form>
    )
  }
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input type={type} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times fa-lg error_i error_color"></i>) || (warning && <i className="fas fa-exclamation fa-lg warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check fa-lg success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className="popust-select">
    <Select
      className={`${touched && error ? 'form-input-error' : touched && (valid && input.value != "") ? 'form-input-success' : ''} form-white mb-1`}
      name=""
      placeholder={placeholder}
      value={input.value}
      {...input}
      onBlur={() => {input.onBlur(input.value.value)}}
      options={options}
      multi={false}
    />
    {touched && ((error && <i className="fas fa-times fa-lg error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check fa-lg success_select success_color"></i>)))}
    {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

  const mapDispatchToProps = (dispatch) => {
    return {
        editOrderInfo: (id, data) => { dispatch(editOrderInfo(id, data)) },
        addOrderBadge: (id, obj, order_id) => {dispatch(addOrderBadge(id, obj, order_id))},
        newOrderOccupied: (id) => {dispatch(newOrderOccupied(id))},
        removeOccupiedOrder: (id) => {dispatch(removeOccupiedOrder(id))},
        getBadges: () => {dispatch(getBadges())}
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
    if (!values.delivery_method_code) {
      errors.delivery_method_code = 'Obvezno polje';
    }
    if (!values.payment_method_code) {
      errors.payment_method_code = 'Obvezno polje';
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

  function mapStateToProps(state) {
    var nextState = state.toJS();
    return {
      paymentmethods: nextState.main_data.paymentmethods,
      formValues: nextState.form.DetailsForm && nextState.form.DetailsForm.values,
      deliverymethods: nextState.order_details_data.localDeliveryMethods,
      utmmedia: nextState.main_data.utmmedia,
      badges: nextState.main_data.badges,
      socket: nextState.main_data.socket,
      user: nextState.main_data.user
    }
  }

  export default compose(
    reduxForm({
      form: 'DetailsForm',
      validate: validate,
      enableReinitialize: true,
      warn
    }), connect(mapStateToProps, mapDispatchToProps)
  )(DetailsForm);
