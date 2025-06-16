import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';

class InfluencerDetails extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	render() {

		return (
      <div className="row flex mb-4">
        <div className="col-lg-6 border-right">
          <label>INFLUENCER</label>
          <div className="row">
            <Field name="shipping_first_name" inputclass="col-md-6" place="Vnesi ime" type="text" component={renderField} label="Ime"/>
            <Field name="shipping_last_name" inputclass="col-md-6" place="Vnesi priimek" type="text" component={renderField} label="Priimek"/>
          </div>
          <div className="row">
            <Field name="shipping_address" inputclass="col-md-12" place="Vnesi naslov" type="text" component={renderField} label="Naslov"/>
          </div>
          <div className="row">
            <Field name="shipping_postcode" inputclass="col-md-6" place="Vnesi poštno številko" type="number" component={renderField} label="Poštna številka"/>
            <Field name="shipping_city" inputclass="col-md-6" place="Vnesi mesto" type="text" component={renderField} label="Mesto"/>
          </div>
          <div className="row">
            <Field name="shipping_telephone" inputclass="col-md-6" place="Vnesi telefonsko številko" type="text" component={renderField} label="Telefonska številka"/>
            <Field name="shipping_email" inputclass="col-md-6" place="Vnesi e-pošto" type="email" component={renderField} label="E-pošta"/>
          </div>
          <div className="row">
            <Field name="shipping_country" inputclass="col-md-12" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
          </div>
        </div>
        <div className="col-lg-3 border-right">
          <label>DOSTAVA & PLAČILO</label>
          <div className="row">
            <Field name="delivery_method_code" inputclass="col-md-12 mb-0" placeholder="Izberi način dostave..." options={this.props.deliverymethods.map(d => {return {label: d.code, value: d.code}})} component={renderSelect} label="Način dostave"/>
          </div>
          <div className="row">
            <Field name="payment_method_code" inputclass="col-md-12 mb-0" placeholder="Izberi plačilno metodo..." options={this.props.paymentmethods.map(p => {return {label: p.code, value: p.code}})} component={renderSelect} label="Plačilna metoda"/>
          </div>
        </div>
        <div className="col-lg-3">
          <label>OSTALO</label>
          <div className="row">
            <Field name="utm_medium" inputclass="col-md-12 mb-0" placeholder="Izberi utm medium..." options={this.props.utmmedia.map(u => {return {label: u.name, value: u.name}})} component={renderSelect} label="UTM medium"/>
          </div>
          <div className="row">
            <Field name="utm_source" inputclass="col-md-12 mb-0" place="Vnesi utm source" type="text" component={renderField} label="UTM source"/>
          </div>
          <div className="row">
            <Field name="order_type" inputclass="col-md-12 mb-0" placeholder="Izberi tip naročila... (privzeto - influencer)" options={this.props.order_types} component={renderSelect} label="Tip naročila"/>
          </div>
          <div className="row">
            <Field name="tracking_code" inputclass="col-md-12 mb-0" place="Vnesi sledilno številko" type="text" component={renderField} label="Sledilna številka"/>
          </div>
          <div className="row">
            <Field name="description" inputclass="col-md-12 mb-0" place="Vnesi opomba" type="text" component={renderArea} label="Opomba"/>
          </div>
        </div>
      </div>
		);
	}
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input type={type} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

const renderSelect = ({ input, placeholder, inputclass, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className={`${inputclass} form-group popust-select`}>
    <label className="form-label">{label}</label>
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
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

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

export default reduxForm({
    form: 'InfluencerDetailsForm',
    enableReinitialize: true,
    validate,
    warn
  })
(InfluencerDetails);
