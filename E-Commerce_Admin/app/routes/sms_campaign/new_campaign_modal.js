import React from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from "immutable"
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '17%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '17%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const  NewCampaign = (props) => {
  const { handleSubmit, scenarios, customers, selector, formEnabled } = props;

	const closeModal = () => {
    props.reset();
		props.closeNewModal();
	}

  const createCampaign = (data) => {
    data = data.toJS();
    let destinations = data.destinations.map(d => {
      return {
        to: {
          phoneNumber: d.value[0] === "+" && d.value.substring(1, d.value.length) || d.value
        }
      }

    })
    data.destinations = destinations
    props.createCampaign(data, false);
  }

  const sendExperimental = () => {
    let data = selector.toJS();
    if (formEnabled) {
      data.destinations = [
        {
          to: {
            phoneNumber: '38640245014'
          }
        },
        {
          to: {
            phoneNumber: '38640200257'
          }
        }
      ]
      props.createCampaign(data, true);
    }
  }

  return (
    <Modal
    isOpen={props.newModal}
    contentLabel="new-customer-prof Modal"
    onRequestClose={closeModal}
    ariaHideApp={false}
    style={otherModalStyles}>
      <div className="pointer text-right"><i onClick={closeModal} className="fas fa-times"/></div>
      <header className={`confirm_box clearfix`}>
        <h2 className="center">Dodaj kampanja</h2>
      </header>
      <form onSubmit={handleSubmit(createCampaign)} >
        <div className={`modal-body row`}>
          <Field name="name" place="Vnesi sporočilo" inputclass="col-lg-12" type="text" component={renderField} label="Ime"/>
          <div className="col-md-12">
            <Field name="scenarioKey" placeholder="Izberi scenario..." options={scenarios} multi={false} component={renderSelect} label="Scenario"/>
          </div>
          <div className="col-md-12">
            <Field name="destinations" placeholder="Izberi stranke..." options={customers} multi={true} component={renderSelect} label="Stranke"/>
          </div>
          <label>Viber</label>
          <Field name="viber.text" place="Vnesi sporočilo" inputclass="col-lg-12" type="text" component={renderField} label="Sporočilo"/>
          <Field name="viber.imageURL" place="Vnesi URL slike" inputclass="col-lg-12" type="text" component={renderField} label="Slika"/>
          <Field name="viber.buttonText" place="Vnesi text gumba" inputclass="col-lg-12" type="text" component={renderField} label="Text gumba"/>
          <Field name="viber.buttonURL" place="Vnesi URL gumba" inputclass="col-lg-12" type="text" component={renderField} label="URL gumba"/>
          <label>SMS</label>
          <Field name="sms.text" place="Vnesi sporočilo" inputclass="col-lg-12" type="text" component={renderField} label="Sporočilo"/>
        </div>
        <div className={`modal-footer row`}>
          <button type="button" onClick={sendExperimental} className="btn btn-primary">Pošlji poskusno</button>
          <button type="submit" className="btn btn-primary">Pošlji</button>
        </div>
      </form>
    </Modal>
  )
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => {

  if (Immutable.Iterable.isIterable(input.value)) {
    input.value = input.value.toJS();
  }
  return(
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
}

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.scenarioKey) {
    errors.scenarioKey= 'Obvezno polje';
  }

  if (values.viber && !values.viber.text) {
    errors.viber.text = 'Obvezno polje';
  }

  if (values.sms && !values.sms.text) {
    errors.sms.text = 'Obvezno polje';
  }

  return errors;
}

export default
  reduxForm({
    form: 'NewCampaignForm',
    enableReinitialize: true,
    validate
  })
  (NewCampaign);
