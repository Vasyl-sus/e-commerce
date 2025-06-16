import React from "react";
import { Field, reduxForm } from 'redux-form';
import ReCaptcha from 'react-recaptcha'
import { validatePhoneNumber } from './services.js';

let recaptchaInstance;

class InfoForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
    this.callback = this.callback.bind(this)
    this.verifyCallback = this.verifyCallback.bind(this)
  }

  submitInfoData(data) {
    this.props.submitInfoData(data)
    this.props.reset();
    recaptchaInstance.reset();
  }

  verifyCallback(data) {
    this.props.verifyCallback(data)
  }

  callback(data) {
  }

  render() {
    const { handleSubmit, language, enableSendMessage, lang } = this.props

    var l = lang == 'si' ? 'sl' : lang
    return (
      <form
          onSubmit={handleSubmit(this.submitInfoData.bind(this))}
          className="checkout-form-wrap mt-5">
        <Field label={language.contact.data.labelname.value} name="name" errorText={language.contact.data.formname.value}  placeholder={language.contact.data.formname.value} nameclass="double-input" type="text" component={renderField} />
        <Field label={language.contact.data.labelemail.value} name="email" errorText={language.contact.data.formemail.value} placeholder={language.contact.data.formemail.value} nameclass="double-input" type="text" component={renderField} />
        <Field label={language.contact.data.labelcontent.value} name="content" errorText={language.contact.data.formcontent.value} placeholder={language.contact.data.formcontent.value} nameclass="double-input" type="text" component={renderFieldArea} />
        <div className="row">
          <div className="col-12 col-md-6 text-center text-md-left captcha">
            <ReCaptcha
              ref={e => recaptchaInstance = e}
              sitekey=""
              hl={l}
              type="image"
              render="explicit"
              onloadCallback={this.callback}
              verifyCallback={this.verifyCallback}
            />
          </div>
          <div className="col-12 col-md-6 text-left text-md-right">
            <button type="submit" disabled={!enableSendMessage} className="btn btn-contact-us">{language.contact.data.sendbtn.value}</button>
          </div>
        </div>
      </form>
    );
  }
}

InfoForm.propTypes = {

};

const validate = values => {
  const errors = {}
  if (!values.name) {
    errors.name = true
  }
  if (!values.email) {
    errors.email = true
  }
  if (values.email) {
    if (!validateEmail(values.email)) {
      errors.email = true
    }
  }
  if (!values.telephone) {
    errors.telephone = true
  } else {
    errors.telephone = !validatePhoneNumber(values.telephone)
  }
  if (!values.content) {
    errors.content = true
  }

  return errors;
}

const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const renderField = ({ input, placeholder, disabled, type, errorText, label, meta: { touched, error } }) => (
  <div className="">
    <p className="contact-label">{label}</p>
    <input {...input} disabled={disabled} placeholder={touched && error ? errorText : placeholder} className={`w-100 input ${touched && error && 'red-border'}`} type={type} />
  </div>
);

const renderFieldArea = ({ input, placeholder, type, errorText, label, meta: { touched, error, warning } }) => (
  <div>
    <p className="contact-label">{label}</p>
    <textarea rows="8" {...input} className={`w-100 ${touched && error && 'red-border'}`} placeholder={touched && error ? errorText : placeholder} type={type} ></textarea>
  </div>
);

export default
reduxForm({
  form: 'AskUsForm',
  enableReinitialize: true,
  validate,
})
(InfoForm);
