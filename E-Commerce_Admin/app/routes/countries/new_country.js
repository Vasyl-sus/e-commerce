import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import moment from 'moment';
import Switch from 'react-switch';
import Select from 'react-select';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '20%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '20%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewCountry extends Component {
  constructor(props) {
    super(props)

    this.state = {currencies: [], startDateFrom: moment(new Date().getTime() - 2592000000), selectedLanguages:[]};
  }

  addCountry(obj) {
    obj = obj.toJS();
    obj.name = obj.name.toUpperCase();
    obj.ddv = parseFloat(obj.ddv);
    obj.send_reminders = obj.send_reminders ? 1 : 0;
    this.props.reset();
    this.props.addNewCountry(obj);
  }

  componentDidMount()
  {
    var currencies = localStorage.getItem('currencies');
    this.setState({currencies:JSON.parse(currencies)});
  };

  closeModal() {
    this.props.reset();
    this.props.closeNewModal();
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      style={otherModalStyles}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj državo</h2>
        </header>
        <form onSubmit={handleSubmit(this.addCountry.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi kratico" inputclass="col-lg-6" type="text" component={renderField} label="Kratica"/>
            <Field name="full_name" place="Vnesi naziv države" inputclass="col-lg-6" type="text" component={renderField} label="Naziv"/>
            <Field name="ddv" place="Vnesi DDV" inputclass="col-lg-6" type="number" component={renderField} label="DDV"/>
            <Field name="country_number" place="Vnesi klicno številko" inputclass="col-lg-6" type="number" component={renderField} label="Klicna številka"/>
            <div className="col-lg-6">
              <Field name="currency" placeholder="Izberi valuto..." options={this.state.currencies.map(c => {return {label: c.code, value: c.name}})} component={renderSelect} label="Valuta"/>
            </div>
            <Field name="send_reminders" component={renderSwitch} label="Maili za prevzem naročila"/>
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

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

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
  if (!values.name) {
    errors.name = 'Obvezno polje';
  }
  if (!values.full_name) {
    errors.full_name = 'Obvezno polje';
  }
  if (!values.currency) {
    errors.currency = 'Obvezno polje';
  }
  if (!values.ddv) {
    errors.ddv = 'Obvezno polje';
  }
  if (!values.country_number) {
    errors.country_number = 'Obvezno polje';
  }
  return errors;
}

export default compose(
  reduxForm({
    form: 'NewCountryForm',
    enableReinitialize: true,
    validate
  })
)(NewCountry);
