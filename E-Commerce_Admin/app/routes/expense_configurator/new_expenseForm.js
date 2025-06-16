import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import {addNewExpense} from '../../actions/expense_configurator_actions';

class NewExpenseForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products:[],
      gifts:[],
      deliverymethods:[],
      accessories:[],
      additional1:[],
      additional:[{content:null}]
    };
  }

  componentDidMount(){
    var tmp = localStorage.getItem('products');
    var tmp1 = localStorage.getItem('gifts');
    var tmp2 = localStorage.getItem('deliverymethods');
    var tmp3 = localStorage.getItem('accessories');
    var products = JSON.parse(tmp);
    var gifts = JSON.parse(tmp1);
    var deliverymethods = JSON.parse(tmp2);
    var accessories = JSON.parse(tmp3);
    this.setState({products});
    this.setState({gifts});
    this.setState({deliverymethods});
    this.setState({accessories});
  };

  addExpense(data) {
    var sendData = {};
    data = data.toJS();
    // data.country=this.props.country;
    data.category=this.props.category;

    if(data.expense_type == "fixed"){
      sendData.billing_type = data.billing_type;
      sendData.category = data.category;
      // sendData.country = data.country;
      sendData.expense_type = data.expense_type;
      sendData.name = data.name;
      if (sendData.billing_type == 'product') {
        sendData.products = [];
        data.products.map(p => {
          sendData.products.push(p.value)
        })
      } else if(sendData.billing_type == 'gift') {
        sendData.gifts = [];
        data.gifts.map(g => {
          sendData.gifts.push(g.value)
        })
      } else if(sendData.billing_type == 'deliverymethod') {
        sendData.deliverymethods = [];
        data.deliverymethods.map(d => {
          sendData.deliverymethods.push(d.value)
        })
      } else if(sendData.billing_type == 'accessory') {
        sendData.accessories = [];
        data.accessories.map(a => {
          sendData.accessories.push(a.value);
        })
      } else {
        if (data.products) {
          sendData.products = [];
          data.products.map(p => {
            sendData.products.push(p.value)
          })
        }
      }
      sendData.value = parseFloat(data.value);
    }
    else if(data.expense_type == "variable"){
      sendData.billing_period = data.billing_period;
      sendData.category = data.category;
      sendData.country = data.country;
      sendData.expense_type = data.expense_type;
      sendData.name = data.name;
      sendData.additional_fields = JSON.stringify(this.state.additional);
    }
    sendData.active = 1;
    this.props.addNewExpense(sendData);
  }

  componentWillReceiveProps(nextProps){
    var first_title = this.props.title;
    var title = nextProps.title;

    if(first_title!=title)
      this.props.reset();

  }

  addClick(){
    this.setState(prevState => ({ additional: [...prevState.additional, {content:null}]}))
  }

  deleteClick(element) {
    var additional = this.state.additional.filter(t => {
      return t.content != element.content
    })
    this.setState({additional})
  }

  handleChange(i, event) {
     let additional = [...this.state.additional];
     additional[i].content = event.target.value;
     this.setState({ additional });
  }

  buildAdditionalFields(){
     return this.state.additional.map((el, i) =>
        <div key={i}>
         <div  className="flex">
         <Field
          value={el.content||''}
          name={'add'+i}
          component={renderField}
          type='text'
          onChange={this.handleChange.bind(this, i)}
          />
          <button type="button" className="btn btn-set" onClick={this.addClick.bind(this)}><i className="fa fa-plus" aria-hidden="true"></i></button>
          <button type="button" className="btn btn-set" onClick={this.deleteClick.bind(this, el)}><i className="fa fa-trash" aria-hidden="true"></i></button>
         </div>
         <br/>
      </div>
     )
  }
  renderAdditionalField(data, index){
    return(
      <div key={index}>
         <Field
          name='value'
          component={renderField}
          type='text'
          onChange={this.handleChange.bind(this, i)}
          />
          <button className="btn btn-set">Dodaj</button>
      </div>
    )
  }

  render(){
    const { handleSubmit, title, formValues} = this.props

    return (
      <form onSubmit={handleSubmit(this.addExpense.bind(this))} >
        <span className="span-conf">Konfigurator stroška - dodajanje novega stroška</span>
        <h2 className="conf-title">{title}</h2>
        <div className="row sp-bet">
          <div className="col-lg-4 col-md-6 sp-bet">
            <div className="flex">
              <label>Naziv stroška:</label>
              <Field
              name='name'
              component={renderField}
              type='text'
              />
            </div>
          </div>
        </div>
        <div className="row sp-bet">
          <div className="col-lg-3 col-md-6 sp-bet">
            <div className="flex">
              <label>Tip stroška:</label>
              <div className="block-checkbox">
                <label className="label-radio">
                  <Field
                  name='expense_type'
                  component={renderFieldRadio}
                  value='fixed'
                  type='radio'
                  />
                  <span className="checkmark"></span>
                  Fiksni strošek
                </label>
                <label className="label-radio">
                  <Field
                  name='expense_type'
                  component={renderFieldRadio}
                  value='variable'
                  type='radio'
                  />
                  <span className="checkmark"></span>
                  Spremenljivi strošek
                </label>
              </div>
            </div>
          </div>
        </div>
        {formValues && formValues.expense_type && (formValues.expense_type=='fixed') ?
        <div>
          <div className="row sp-bet more-bottom">
            <div className="col-lg-3 col-md-6">
              <div className="flex">
                <label>Obračun <br/>stroška:</label>
                <div className="block-checkbox-second">
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='product'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek izdelka
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='product_single'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek izdelka 1X
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='order'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek naročila
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='gift'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek darila
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='accessory'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek dodatka
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_type'
                    component={renderFieldRadio}
                    value='deliverymethod'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Strošek dostave
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="row sp-bet">
            <div className="col-lg-6 col-md-9 sp-bet">
              {formValues.billing_type && (formValues.billing_type == 'product' || formValues.billing_type == 'product_single' || formValues.billing_type == 'order') ?
              <div className="flex">
                <label>Izdelek:</label>
                <Field name="products" placeholder="Izberi izdelek..." options={this.state.products.map(p => {return {label: p.name, value: p.id}})} component={renderSelect}/>
              </div>
              :
               formValues.billing_type && (formValues.billing_type == 'gift') ?
              <div className="flex">
                <label>Darilo:</label>
                <Field name="gifts" placeholder="Izberi darilo..." options={this.state.gifts.map(g => {return {label: g.name, value: g.id}})} component={renderSelect}/>
              </div>
              :
               formValues.billing_type && (formValues.billing_type == 'accessory') ?
              <div className="flex">
                <label>Dodatek:</label>
                <Field name="accessories" placeholder="Izberi dodatek..." options={this.state.products.map(a => {return {label: a.name, value: a.id}})} component={renderSelect}/>
              </div>
              :
              formValues.billing_type && (formValues.billing_type == 'deliverymethod') ?
              <div className="flex">
                <label>Način dostave:</label>
                <Field name="deliverymethods" placeholder="Izberi način dostave..." options={this.state.deliverymethods.map(d => {return {label: d.code, value: d.id}})} component={renderSelect}/>
              </div>
              : ""}
            </div>
          </div>
          <div className="row sp-bet">
            <div className="col-lg-6 col-md-9 sp-bet">
              <div className="flex price-box">
                <label>Vrednost:</label>
                <Field
                name='value'
                component={renderField}
                type='text'
                />
                <label>EUR</label>
              </div>
            </div>
          </div>
        </div>
        :''}
        {formValues && formValues.expense_type && (formValues.expense_type=='variable') ?
        <div>
          <div className="row sp-bet more-bottom">
            <div className="col-lg-3 col-md-6">
              <div className="flex">
                <label>Časovna <br/>opredelitev:</label>
                <div className="block-checkbox">
                  <label className="label-radio">
                    <Field
                    name='billing_period'
                    component={renderFieldRadio}
                    value='day'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Dnevni strošek
                  </label>
                  <label className="label-radio">
                    <Field
                    name='billing_period'
                    component={renderFieldRadio}
                    value='month'
                    type='radio'
                    />
                    <span className="checkmark"></span>
                    Mesečni strošek
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="row sp-bet">
            <div className="col-lg-6 col-md-9 sp-bet">
              <div className="row">
                <div className="col-lg-2 col-md-5">
                  <label>Dodatna <br/> polja:</label>
                </div>
                <div className="col-lg-9 col-md-7">
                  {this.buildAdditionalFields()}
                </div>
              </div>
            </div>
          </div>
        </div>
        :''}
        <button className="btn btn-primary btn-lg" type="submit"><i className="fa fa-floppy-o" aria-hidden="true"></i>SHRANI</button>
      </form>
      )
    }
  }

  const renderField = ({ input, field, label, value, inputclass, place, type, meta: { touched, error, warning } }) => (
    <input type={type} placeholder={place} value={value} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control`} />
  )

  const renderFieldRadio = ({ input, field, onChange, label, value, inputclass, place, type, meta: { touched, error, warning } }) => (
    <input type={type} placeholder={place} onChange={onChange} value={value} {...input} className={`${touched && (error || warning) ? 'input_error' : ''}`} />
  )

  const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning } }) => (
    <div className="select-new-conf">
      <Select
        className={`${touched && (error || warning) ? 'input_error' : ''} form-white`}
        name=""
        placeholder={placeholder}
        value={input.value}
        {...input}
        onBlur={() => {input.onBlur(input.value.value)}}
        options={options}
        multi={true}
      />
    </div>
  )

  const mapDispatchToProps = (dispatch) => {
    return {
       addNewExpense : (obj) => {
        dispatch(addNewExpense(obj));
      }
    }
  }

  const validate = values => {
    const errors = {}
    values = values.toJS();

    if (!values.name) {
      errors.name = 'Obvezno polje';
    }
    if (!values.expense_type) {
      errors.expense_type = 'Obvezno polje';
    }
    if (!values.country) {
      errors.country = 'Obvezno polje';
    }
    if (!values.category) {
      errors.category = 'Obvezno polje';
    }

    return errors;
  }

  function mapStateToProps(state) {
    var nextState = state.toJS();
    return {
      formValues:nextState.form.NewExpenseForm && nextState.form.NewExpenseForm.values,
      successNew:nextState.expense_configurator.successNew
    }
  }

  export default compose(
    reduxForm({
      form: 'NewExpenseForm',
      validate: validate,
      enableReinitialize: true
    }), connect(mapStateToProps, mapDispatchToProps)
  )(NewExpenseForm);
