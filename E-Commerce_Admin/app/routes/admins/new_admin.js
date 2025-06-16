import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Select from 'react-select';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '13%',
    left                  : '28%',
    right                 : '28%',
    bottom                : '13%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};
class NewAdmin extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	createAdmin(obj)
  {
    obj = obj.toJS();
    obj.countries = obj.countries ? obj.countries.map(country => {return country.value}) : [];
    obj.call_countries = obj.call_countries ? obj.call_countries.map(country => {return country.value}) : [];
    this.props.createNewAdmin(obj);
    this.props.reset();
	}

	closeModal()
  {
		this.props.closeNewModal();
	}

	render() {
    const { handleSubmit } = this.props;

		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj uporabnik</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createAdmin.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="first_name" place="Vnesi ime" inputclass="col-lg-6" type="text" component={renderField} label="Ime"/>
            <Field name="last_name" place="Vnesi priimek" inputclass="col-lg-6" type="text" component={renderField} label="Priimek"/>
            <Field name="email" place="Vnesi e-pošto" inputclass="col-lg-12" type="email" component={renderField} label="E-pošta"/>
            <Field name="username" place="Vnesi uporabniško ime" inputclass="col-lg-6" type="text" component={renderField} label="Uporabniško ime"/>
            <Field name="vcc_username" place="Vnesi vcc uporabniško ime" inputclass="col-lg-6" type="text" component={renderField} label="VCC uporabniško ime"/>
            <Field name="password" place="Vnesi geslo" inputclass="col-lg-6" type="password" component={renderField} label="Geslo"/>
            <div className="col-lg-6">
              <Field name="userGroupId" placeholder="Izberi skupino..." options={this.props.admingroups.map(ag => {return {label: ag.name, value: ag.id}})} multi={false} component={renderSelect} label="Uporabniška skupina"/>
            </div>
            <div className="col-lg-6">
              <Field name="countries" placeholder="Izberi države..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} multi={true} component={renderSelect} label="Države"/>
            </div>
            <div className="col-lg-6">
              <Field name="call_countries" placeholder="Izberi države za klicanje..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} multi={true} component={renderSelect} label="Države za klicanje"/>
            </div>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
            {/*<button className="btn btn-primary b-c-edit-customer" onClick={this.closeModal.bind(this)}>ZAPRI</button>*/}
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className="form-group popust-select">
    <label className="form-label">{label}</label>
      <Select
        className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}
        name=""
        placeholder={placeholder}
        value={input.value}
        {...input}
        onBlur={() => {input.onBlur(input.value.value)}}
        options={options}
        multi={multi}
      />
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    formValues: nextState.form.NewAdminForm && nextState.form.NewAdminForm.values
  }
}

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

  if (!values.username) {
    errors.username = 'Obvezno polje';
  }

  if (!values.password) {
    errors.password = 'Obvezno polje';
  }

  if (!values.userGroupId) {
    errors.userGroupId = 'Obvezno polje';
  }

  if (!values.countries || (values.countries && values.countries.length == 0)) {
    errors.countries = 'Obvezno polje';
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
    form: 'NewAdminForm',
    enableReinitialize: true,
    validate,
    warn
  }), connect(mapStateToProps, mapDispatchToProps)
)(NewAdmin);
