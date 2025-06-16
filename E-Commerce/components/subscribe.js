import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from 'redux-form';

class Subscribe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.subscribe = this.subscribe.bind(this)
  }

  componentDidMount(){

  }

  subscribe(data) {
    this.props.subscribe(data.email)
    this.props.reset();
  }

  render() {
    const { language, handleSubmit, type, subscribe_result } = this.props;
    return (
      <React.Fragment>
      <form onSubmit={handleSubmit(this.subscribe)} className={`${type == "home" ? "subscribe-wrap" : "footer-subscribe-wrap"} ${subscribe_result.success ? "hide-form" : ""}`}>
        <div className={`${type == "home" ? "row justify-content-center" : ""}`}>
          <div className={`${type == "home" ? "col-md-8" : ""}`}>
            <p>{language.footer.data.substitle.value}</p>
          </div>
        </div>
        <div className={`${type == "home" ? "row justify-content-center" : ""}`}>
          <div className={`d-flex ${type == "home" ? "col-md-9" : ""}`}>
            <Field name="email" placeError={!subscribe_result.success && subscribe_result.message.length > 0} placeholder={`${!subscribe_result.success && subscribe_result.message.length > 0 ? language.footer.data.newserror.value : language.footer.data.subsplace.value}`} component={renderField} />
            <button className="submit-image" type="submit"><img  alt="image" src="/static/images/arrow-right.svg" /></button>
          </div>
        </div>
      </form>
      {subscribe_result.success && <p className="sub-success-text">{language.footer.data.newssuccess.value}</p>}
      </React.Fragment>
    );
  }
}

const renderField = ({ input, label, inputclass, placeholder, type, placeError, meta: { touched, error, warning } }) => (
  <div className="l-input">
    <input type={type} placeholder={placeholder} {...input} className={`${touched && (error || warning || placeError) || !touched && (error && placeError) ? 'input_error' : ''} form-control `} />
  </div>
)

Subscribe.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  subscribe: PropTypes.func.isRequired,
  subscribe_result: PropTypes.object
};

const validate = (values) => {
  const errors = {}
  if (!values.email) {
    errors.email = true
  }

  return errors;
}

export default
  reduxForm({
    form: 'SubscribeForm',
    validate,
    enableReinitialize: true
  })(Subscribe);
