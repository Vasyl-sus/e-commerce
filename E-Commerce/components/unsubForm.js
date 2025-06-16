import React from "react";
import { Field, reduxForm } from 'redux-form';
import { COUNTRY_NUMBERS } from "../constants/constants";
import PhoneInput from 'react-phone-number-input/input'
import { isValidPhoneNumber,formatPhoneNumberIntl } from 'react-phone-number-input'

class UnsubForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      poziven: {}
    };

    this.submit = this.submit.bind(this)
  }

  componentDidMount() {
    let poziven = COUNTRY_NUMBERS.find(c => {
      return c.country === this.props.country.toUpperCase()
    })
    this.setState({poziven})
  }

  submit(data) {
    this.props.unsubscribeInfoBip(data.telephone)
  }

  checkNum = (num) => {
    var x = num
    if(x.substring(0,1)=='0')
      x = x.slice( 1 );
    num = x;

    return num
  }

  render() {
    const { handleSubmit, country, language, unsubscribe_result } = this.props

    const { poziven } = this.state

    return (
      <form onSubmit={handleSubmit(this.submit)} className="">
        <Field customerror={language.sms_unsub.data.noNumberFormat.value} name="telephone" poziven={poziven.num} errorText={"error"} placeholder={"placeholder"} label={"label"} language={language} country={country.toUpperCase()} type="text" component={renderTelField1} />
        <div className="row align-items-center">
          <div className="col-7 offset-4 pl-0 pr-0">
            {unsubscribe_result && unsubscribe_result=="unsubscribed" && <p className="">{language.sms_unsub.data.unsubSuccess.value}</p>}
            {unsubscribe_result && unsubscribe_result=="error" && <p className="">{language.sms_unsub.data.noNumberBaza.value}</p>}
          </div>
        </div>
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary btn-checkout">
            {language.sms_unsub.data.unsubButton.value}
          </button>
        </div>
      </form>
    );
  }
}

const validate = values => {
  const errors = {}

  if (!values.telephone) {
    errors.telephone = true
  } else {
    errors.telephone = !isValidPhoneNumber(values.telephone)
  }

  return errors;
}

const renderTelField1 = ({ input, poziven, language, placeholder, country, disabled, type, errorText, errorText1, label, customerror, meta: { touched, error } }) => {
  return(
    <React.Fragment>
      <div className="o-in">
        <label htmlFor="num-value" className={`static-value ph-ii ${touched && error && "plus-bottom"}`}>+{poziven}</label>
        <div className="col-4 pl-0 pr-0 center-margin">
          <PhoneInput
          {...input}
          defaultCountry={country}
          international={false}
          placeholder={touched && error ? errorText : ''}
          className={`tel-input ${touched && error && 'red-border'}`}
          onChange={value => {
            if (value === undefined) value = ''

            input.onChange(value)
          }}
          onBlur={e => {
            e.persist()

            let phoneNumValue = `${e.target.value}`

            if(!phoneNumValue.startsWith(poziven)){
              phoneNumValue = `+${poziven}${phoneNumValue}`
            }

            const formattedNum = formatPhoneNumberIntl(phoneNumValue).replaceAll(' ','')
            input.onBlur(formattedNum)
          }}
          value={input.value}
            />
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-7 offset-4 pl-0 pr-0">
          {touched && error && <p className="error-text">{customerror}</p>}
        </div>
      </div>
    </React.Fragment>
  )
};

export default reduxForm({
  form: 'UnsubForm',
  validate,
  enableReinitialize: true,
})
(UnsubForm);
