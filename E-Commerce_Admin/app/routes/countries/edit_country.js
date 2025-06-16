import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import Select from 'react-select';
import Switch from 'react-switch';

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

class EditCountry extends Component {
  constructor(props) {
    super(props)

    this.state = {currencies: [], selectedLanguages: [], options: []};
  }

  editCountry(obj) {
    obj = obj.toJS();
    obj.send_reminders = obj.send_reminders ? 1 : 0;

    var data = {
        full_name: obj.full_name,
        ddv: parseFloat(obj.ddv),
        id: obj.id,
        name: obj.name.toUpperCase(),
        currency: obj.currency_name,
        country_number:obj.country_number,
        send_reminders: obj.send_reminders
    }

    var arr = [];


    for(var i=0; i<obj.langs.length; i++) {
      if(obj.langs[i].value)
        arr.push(obj.langs[i].value);
      else
        arr.push(obj.langs[i]);
    }

    var langData = {};
    langData.country = obj.name.toUpperCase();
    langData.langs = arr;

    this.props.editCountry(data, langData);
    this.closeModal();
  }

  componentDidMount()
  {
    var currencies = localStorage.getItem('currencies');
    this.setState({currencies:JSON.parse(currencies)});
  };

  closeModal() {
    this.props.reset();
    this.props.closeEditModal();
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      style={otherModalStyles}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi državo</h2>
        </header>
        <form onSubmit={handleSubmit(this.editCountry.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi kratico" inputclass="col-lg-6" type="text" component={renderField} label="Kratica"/>
            <Field name="full_name" place="Vnesi naziv države" inputclass="col-lg-6" type="text" component={renderField} label="Naziv"/>
            <Field name="ddv" place="Vnesi DDV" inputclass="col-lg-6" type="number" component={renderField} label="DDV"/>
            <Field name="country_number" place="Vnesi klicno številko" inputclass="col-lg-6" type="number" component={renderField} label="Klicna številka"/>
            <div className="col-lg-6">
              <Field name="currency_name" placeholder="Izberi valuto..." options={this.state.currencies.map(c => {return {label: c.code, value: c.name}})} multi={false} component={renderSelect} label="Valuta"/>
            </div>
            <div className="col-lg-6">
              <Field name="langs" placeholder="Izberite jezike..." options={this.props.langs} component={renderSelect} multi={true} label="Jeziki"/>
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => {

  if (Immutable.Iterable.isIterable(input.value)) {
    input.value = input.value.toJS();
  }

  return(
    <div className="form-group popust-select">
      <label className="form-label">{label}</label>
        <Select
          className={`${touched && error ? 'form-input-error' : touched && (valid && input.value.length > 0) ? 'form-input-success' : ''} form-white mb-1`}
          name=""
          placeholder={placeholder}
          value={input.value}
          {...input}
          onBlur={() => {input.onBlur(input.value.value)}}
          options={options}
          multi={multi}
        />
        {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value.length > 0 && <i className="fas fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )
}

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
  if (!values.currency_name) {
    errors.currency_name = 'Obvezno polje';
  }
  return errors;
}

export default compose(
  reduxForm({
    form: 'EditCountryForm',
    enableReinitialize: true,
    validate
  })
)(EditCountry);
