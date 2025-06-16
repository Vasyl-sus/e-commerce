import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import { format } from 'date-fns';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '10%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '10%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewDiscount extends Component {
	constructor(props) {
		super(props)

    var dateTo = new Date()

    dateTo.setHours(23)
    dateTo.setMinutes(59)

		this.state = {dateFrom: new Date(), dateTo: dateTo}
	}

	createDiscount(obj)
  {
    obj = obj.toJS();
    obj.active = obj.active ? 1 : 0;
    obj.date_start = format(this.state.dateFrom, 'yyyy-MM-dd HH:mm:ss');
    obj.date_end = format(this.state.dateTo, 'yyyy-MM-dd HH:mm:ss');
    obj.countries = obj.countries.map(country => {return country.value});
    obj.type = this.props.formValues.type;

    if(obj.discount_value) {
      obj.discount_value = parseFloat(obj.discount_value);
    }

    if(obj.min_order_amount) {
      obj.min_order_amount = parseFloat(obj.min_order_amount);
    }

    if(this.props.formValues.type.toLowerCase() == "individual")
    {
      obj.therapies = obj.therapies.map(t => {return t.value});
      obj.free_therapies = [];
      obj.free_accessories = [];
    }

    if(this.props.formValues.type.toLowerCase() == "free product")
    {
      obj.therapies = [];
      obj.free_therapies = obj.free_therapies ? obj.free_therapies.map(t => {return t.value}) : [];
      obj.free_accessories = obj.free_accessories ? obj.free_accessories.map(t => {return t.value}) : [];
    }

    if(this.props.formValues.type.toLowerCase() == "shipping")
    {
      obj.therapies = [];
      obj.free_therapies = [];
      obj.free_accessories = [];
      obj.discount_type = null;
      obj.discount_value = null;
      obj.min_order_amount = null;
    }

    if(this.props.formValues.type.toLowerCase() == "general")
    {
      obj.therapies = [];
      obj.free_therapies = [];
      obj.free_accessories = [];
    }

    obj.accessories = [];

    this.props.createNewDiscount(obj);
    this.props.reset();
	}

  handleDateChange = (dates) => {
    const [start, end] = dates;
  
    if (start) {
      start.setHours(0, 0, 1);
    }
  
    if (end) {
      end.setHours(23, 59, 59);
    }
  
    this.setState({
      dateFrom: start,
      dateTo: end
    });
  };

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
	}

	render() {
    const { handleSubmit, formValues } = this.props;


		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj kupon</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createDiscount.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place={`Vnesi kodo`} inputclass="col-lg-12" type="text" component={renderField} label="Koda"/>
            <Field name="dodatni_naziv" place={`Vnesi naziv`} inputclass="col-lg-12" type="text" component={renderField} label="Dodatni naziv"/>
            <div className="col-lg-12">
              <Field name="type" placeholder="Izberi tip kupona..." options={this.props.discount_coupon_types.map(d => {return {label: d, value: d}})} multi={false} component={renderSelect} label="Tip kupona"/>
            </div>
            {formValues && formValues.type == "Shipping" ? "" : <div className="col-lg-12">
              <Field name="discount_type" placeholder="Izberi tip popusta..." options={this.props.discount_types} component={renderSelect} multi={false} label="Tip popusta"/>
            </div> }
            {formValues && formValues.type == "Shipping" ? "" : <Field name="discount_value" place="Vnesi vrednost" inputclass="col-lg-12" type="number" component={renderField} label="Vrednost"/> }
            {formValues && formValues.type == "Shipping" ? "" : <Field name="min_order_amount" place="Vnesi minimalno vrednost naročila" inputclass="col-lg-12" type="number" component={renderField} label="Minimalna vrednost naročila"/> }
            <div className={`col-lg-12`}>
              <label className="form-label">Velja od-do:</label><br/>
              <DatePicker
                selected={this.state.dateFrom}
                onChange={this.handleDateChange.bind(this)}
                startDate={this.state.dateFrom}
                endDate={this.state.dateTo}
                selectsRange
                dateFormat="dd.MM.yyyy"
                placeholderText="Izberi obdobje"
                maxDate={dateMax}
                className="multi-dateinput"
                locale="sl"
                showIcon
              />
            </div>
            <Field name="utm_source" place="Vnesi utm source" inputclass="col-lg-12" type="text" component={renderField} label="UTM source"/>
            <div className="col-lg-12">
              <Field name="utm_medium" placeholder="Izberi utm medium..." options={this.props.utmmedia.map(u => {return {label: u.name, value: u.name}})} multi={false} component={renderSelect} label="UTM medium"/>
            </div>
            <div className="col-lg-12">
              <Field name="countries" placeholder="Izberi države..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} multi={true} label="Države"/>
            </div>
            {formValues && formValues.type == "Individual" ? <div className="col-lg-12">
              <Field name="therapies" placeholder="Izberi terapije..." options={this.props.therapies.map(t => {return {label: t.name, value: t.id}})} component={renderSelect} multi={true} label="Terapije"/>
            </div> : ""}
            {formValues && formValues.type == "Free product" ? <div className="col-lg-12">
              <Field name="free_therapies" placeholder="Izberi terapije..." inputclass="col-lg-6" options={this.props.free_therapies.map(t => {return {label: t.name, value: t.id}})} component={renderSelect} multi={true} label="Free Terapije"/>
              <Field name="free_accessories" placeholder="Izberi dodatke..."  inputclass="col-lg-6" options={this.props.free_accessories.map(t => {return {label: t.name, value: t.id}})} component={renderSelect} multi={true} label="Free Dodatki"/>
            </div> : ""}
            <Field name="active" component={renderSwitch} label="Aktivni"/>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
      </Modal>
		);
	}
}

const renderField = ({ input, label, inputclass, value, disabled, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input type={type} value={value} disabled={disabled} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => (
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
        multi={multi}
      />
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-12">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    formValues: nextState.form.NewDiscountForm && nextState.form.NewDiscountForm.values
  }
}

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }
  if (!values.type) {
    errors.type = 'Obvezno polje';
  }
  if (!values.date_start) {
    errors.date_start = 'Obvezno polje';
  }
  if (!values.date_end) {
    errors.date_end = 'Obvezno polje';
  }
  if (!values.countries || (values.countries && values.countries.length == 0)) {
    errors.countries = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewDiscountForm',
    enableReinitialize: true,
    validate
  }), connect(mapStateToProps, mapDispatchToProps)
)(NewDiscount);
