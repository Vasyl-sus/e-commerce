import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm, change } from 'redux-form/immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Select from 'react-select';
import { createNotification } from '../../App.js'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '15%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '15%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewProfile extends Component {
	constructor(props) {
		super(props)

		this.state = {activeStar: 0, isShippings: true};
	}

	createProfile(obj) {
    obj = obj.toJS();
		obj.rating = this.state.activeStar;
    if (this.state.isShippings && !obj.shipping_first_name) {
      obj.shipping_first_name = obj.first_name
      obj.shipping_last_name = obj.last_name
      obj.shipping_address = obj.address
      obj.shipping_postcode = obj.postcode
      obj.shipping_city = obj.city
      obj.shipping_country = obj.country
    }
    if (obj.birthdate) {
      var splited = obj.birthdate.split('.');
      var validateDate = this.checkDate(obj.birthdate)
      if (validateDate) {
        obj.birthdate = `${splited[2]}-${splited[1]}-${splited[0]}`
      } else {
        createNotification('error', 'Format datuma ne ustreza DD.MM.YYYY')
      }
    }
		this.props.createCustomerProfile(obj);
    this.props.reset();
    console.log(obj);
	}

	closeModal() {
    this.props.reset();
		this.props.closeNewModal();
	}

	onStarClick(activeStar) {
		this.setState({activeStar})
	}

  checkDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split(".");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  };

  openShippings = () => {
    this.setState({isShippings: !this.state.isShippings})
    if (!this.state.isShippings === false && this.props.customerFormValues) {
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_first_name", this.props.customerFormValues.first_name))
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_last_name", this.props.customerFormValues.last_name))
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_address", this.props.customerFormValues.address))
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_postcode", this.props.customerFormValues.postcode))
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_city", this.props.customerFormValues.city))
      this.props.dispatch(change("NewCustomerProfileForm", "shipping_country", this.props.customerFormValues.country))
    }
  }

	render() {
    const { handleSubmit } = this.props;
    const normalizePhone = value => {
      if (!value) return value;
      // Always ensure it starts with +
      if (!value.startsWith('+')) {
        value = '+' + value;
      }
      // Remove any non-digit characters except the leading +
      return value.replace(/[^\d+]/g, '').replace(/\+{2,}/g, '+');
    };

		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header>
          <h2 className="center">Dodaj stranko</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createProfile.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="first_name" place="Vnesi ime" inputclass="col-lg-6" type="text" component={renderField} label="Ime"/>
            <Field name="last_name" place="Vnesi priimek" inputclass="col-lg-6" type="text" component={renderField} label="Priimek"/>
            <Field name="address" place="Vnesi naslov" inputclass="col-lg-12" type="text" component={renderField} label="Naslov"/>
            <Field name="postcode" place="Vnesi poštno številko" inputclass="col-lg-6" type="number" component={renderField} label="Poštna številka"/>
            <Field name="city" place="Vnesi mesto" inputclass="col-lg-6" type="text" component={renderField} label="Mesto"/>
            <Field name="telephone" normalize={normalizePhone} place="Vnesi telefon (+386...)" inputclass="col-lg-6" type="text" component={renderField} label="Telefon"/>
            <Field name="email" place="Vnesi e-pošta" inputclass="col-lg-6" type="email" component={renderField} label="E-pošta"/>
            <Field name="birthdate" place="Format: DD.MM.YYYY" inputclass="col-lg-6" component={renderField} label="Rojstni datum"/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
            </div>
            <div className="col-md-6 cust-s d-flex align-items-center">
              <label className="form-label mt-0 mr-2">Naslov plačnika je enak naslovu prejemnika</label>
              <Switch onChange={this.openShippings} checked={this.state.isShippings} className="form-white" />
            </div>
            {!this.state.isShippings && <React.Fragment>
              <div className="col-md-12">
                <label className="form-label">Podatki za dostavo</label>
              </div>
              <Field name="shipping_first_name" place="Vnesi ime" inputclass="col-lg-6" type="text" component={renderField} label="Ime"/>
              <Field name="shipping_last_name" place="Vnesi priimek" inputclass="col-lg-6" type="text" component={renderField} label="Priimek"/>
              <Field name="shipping_address" place="Vnesi naslov" inputclass="col-lg-12" type="text" component={renderField} label="Naslov"/>
              <Field name="shipping_postcode" place="Vnesi poštno številko" inputclass="col-lg-6" type="number" component={renderField} label="Poštna številka"/>
              <Field name="shipping_city" place="Vnesi mesto" inputclass="col-lg-6" type="text" component={renderField} label="Mesto"/>
              <div className="col-lg-12">
                <Field name="shipping_country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
              </div>
            </React.Fragment>}
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
      </Modal>
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

const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className="form-group popust-select">
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
  if (!values.first_name) {
    errors.first_name = 'Obvezno polje';
  }
  if (!values.last_name) {
    errors.last_name = 'Obvezno polje';
  }
  if (!values.email) {
    errors.email = 'Obvezno polje';
  }
  if (!values.telephone) {
    errors.telephone = 'Obvezno polje';
  } else {
    try {
      if (!isValidPhoneNumber(values.telephone)) {
        errors.telephone = 'Neveljavna telefonska številka';
      } else {
        // Format the number according to international format
        const phoneNumber = parsePhoneNumber(values.telephone);
        if (!phoneNumber.isValid()) {
          errors.telephone = 'Neveljavna telefonska številka';
        }
      }
    } catch (error) {
      errors.telephone = 'Neveljavna telefonska številka';
    }
  }
  if (!values.address) {
    errors.address = 'Obvezno polje';
  }
  if (!values.postcode) {
    errors.postcode = 'Obvezno polje';
  }
  if (!values.city) {
    errors.city = 'Obvezno polje';
  }
  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  return errors;
}

const warn = values => {
  const warnings = {}

  values = values.toJS();

  if(values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    warnings.email = "Nepravilen elektronski naslov";
  }

  return warnings;
}

export default compose(
  reduxForm({
    form: 'NewCustomerProfileForm',
    enableReinitialize: true,
    validate,
    warn
  })
)(NewProfile);
