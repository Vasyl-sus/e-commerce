import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import { format } from 'date-fns';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '20%',
    left                  : '35%',
    right                 : '35%',
    bottom                : '20%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewPayment extends Component {
	constructor(props) {
		super(props)

		this.state = {paymentDate: new Date()}

	}

	createPayment(obj)
  {
    obj = obj.toJS();
    obj.date_added = format(this.state.paymentDate, 'yyyy-MM-dd HH:mm:ss');
    obj.price = parseFloat(obj.price);
		this.props.createNewPayment(obj);
    this.props.reset();
	}

	closeModal()
  {
    this.props.reset();
		this.props.closePaymentModal();
	}

  handleDateChange(date) {
    var paymentDate = new Date(date);
    this.setState({paymentDate})
  }

	render() {
    const { handleSubmit } = this.props;

		return (
			<Modal
      isOpen={this.props.paymentModal}
      contentLabel="new-customer-prof Modal"
      ariaHideApp={false}
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj plačilo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createPayment.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="description" place="Vnesi način plačila" inputclass="col-lg-12" type="text" component={renderField} label="Način plačila"/>
            <Field name="price" place="Vnesi znesek plačila" inputclass="col-lg-12" type="number" component={renderField} label="Znesek plačila"/>
            <div className={`col-lg-6`}>
              <label className="form-label">Datum plačila</label><br/>
              <DatePicker
                selected={this.state.paymentDate}
                onChange={this.handleDateChange.bind(this)}
                minDate={new Date(2017, 1, 1)}
                maxDate={dateMax}
                dateFormat="dd.MM.yyyy"
                className="single-dateinput"
                locale="sl"
              />
            </div>
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

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.date_added) {
    errors.date_added = 'Obvezno polje';
  }

  if (!values.description) {
    errors.description = 'Obvezno polje';
  }

  if (!values.price) {
    errors.price = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewPaymentForm',
    enableReinitialize: true,
    validate
  })
)(NewPayment);
