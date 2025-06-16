import React from "react";
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'redux'

class DiscountForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showCode: false
    };

    this.submit = this.submit.bind(this)
  }

  submit(data) {
    if (!this.state.showCode) {
      this.setState({showCode: true})
      return;
    }

    this.props.submitF(data.discount);
    this.props.reset();
  }

  render() {
    const { handleSubmit, language, discount_not_found, cart_form=false } = this.props
    return (
      <form onSubmit={handleSubmit(this.submit)} className="coupon-box coupon-right d-flex justify-content-end align-items-center">
        {cart_form ?
          <React.Fragment>
            <div className="coupon-txt">{!this.state.showCode && language.checkout.data.kpp.value}</div>

            <div className="d-flex align-items-center">
              {this.state.showCode && <Field discount_not_found={discount_not_found} name="discount" errorText={language.checkout.data.kppe.value} placeholder={language.checkout.data.kpp2.value} type="text" component={renderField} />}

              <button type="submit" className="btn coupon-cta">{!this.state.showCode ? language.checkout.data.kpp1.value : language.checkout.data.kpp11.value}</button>
            </div>
          </React.Fragment>

        :

          <React.Fragment>
            {!this.state.showCode && <div className="coupon-txt">{language.checkout.data.kpp.value}</div>}
            {this.state.showCode && <Field discount_not_found={discount_not_found} name="discount" errorText={language.checkout.data.kppe.value} placeholder={language.checkout.data.kpp2.value} type="text" component={renderField} />}

            <button type="submit" className="btn coupon-cta">{!this.state.showCode ? language.checkout.data.kpp1.value : language.checkout.data.kpp11.value}</button>
          </React.Fragment>
        }
      </form>
    );
  }
}

DiscountForm.propTypes = {

};

const validate = values => {
  const errors = {}

  if (!values.discount) {
    errors.discount = true
  }

  return errors;
}

const renderField = ({ input, placeholder, disabled, type, errorText, discount_not_found, label, meta: { touched, error } }) => (
   <div>
    <input {...input} disabled={disabled} placeholder={!touched && discount_not_found == 2 ? errorText : placeholder} className={`input coupon-input ${!touched && discount_not_found == 2 && 'red-border'}`} type={type} />
  </div>
);

export default
compose(reduxForm({
  form: 'DiscountForm',
  enableReinitialize: true,
  validate,
}), connect(null, null))
(DiscountForm);
