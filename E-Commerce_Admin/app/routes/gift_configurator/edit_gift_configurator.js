import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Select from 'react-select';

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

class EditGiftConfig extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	editGiftConfigurator(obj)
  {
    obj = obj.toJS();
    obj.count = parseInt(obj.count);
    if (!obj.price) {
      obj.price = null
    } else {
      obj.price = parseFloat(obj.price);
    }
    if (!obj.num_therapies) {
      obj.num_therapies = null
    } else {
      obj.num_therapies = parseInt(obj.num_therapies)
    }
		this.props.editGiftConfigurator(obj);
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

  changeQ() {
    this.setState({qToggle: !this.state.qToggle})
  }

	render() {
    const { handleSubmit } = this.props;

		return (
			<Modal
      ariaHideApp={false}
      isOpen={this.props.editModal}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Konfigurator daril - nastavljanje</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editGiftConfigurator.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="count" place="Vnesi število" inputclass="col-lg-12" type="number" component={renderField} label="Število"/>
            <Field name="price" place="Vnesi ceno" inputclass="col-lg-12" type="number" component={renderField} label="Cena"/>
            <Field name="num_therapies" place="Vnesi št. terapij" inputclass="col-lg-12" type="number" component={renderField} label="Št. terapij"/>
            <div className="col-lg-12">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
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

const renderField = ({ disabled, input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input disabled={disabled} type={type} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}


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

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.count) {
    errors.count = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditGiftConfigForm',
    enableReinitialize: true,
    validate
  })
)(EditGiftConfig);
