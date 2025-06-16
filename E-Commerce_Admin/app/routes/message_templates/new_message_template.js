import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Select from 'react-select';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '15%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '20%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewMessageTemplate extends Component {
	constructor(props) {
		super(props)

		this.state = { }

	}

	createMessageTemplate(obj)
  {
    obj = obj.toJS();
		this.props.createNewMessageTemplate(obj);
	}

	closeModal()
  {
		this.props.closeNewModal();
	}

	render() {
    const { handleSubmit } = this.props;

    return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Ustvari template</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createMessageTemplate.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="title" place="Vnesi naziv" inputclass="col-lg-12" type="text" component={renderField} label="Naziv"/>
            <div className="col-lg-12">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
            </div>
            <Field name="text" place="Vnesi vsebino" inputclass="col-lg-12" component={renderArea} label="Vsebina"/>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
      </Modal>
		);
	}
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control`} />
  </div>
)

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={'form-control new-textarea-comment'} />
  </div>
);

const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning } }) => (
  <div className="form-group popust-select">
    <label className="form-label">{label}</label>
      <Select
        className="form-white"
        name=""
        placeholder={placeholder}
        value={input.value}
        {...input}
        onBlur={() => {input.onBlur(input.value.value)}}
        options={options}
      />
      {touched && ((error && <span className="red-text abs-error">{error}</span>) || (warning && <span className="red-text abs-error">{warning}</span>))}
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.title) {
    errors.title = 'Incomplete';
  }

  if (!values.text) {
    errors.text = 'Incomplete';
  }

  if (!values.country) {
    errors.country = 'Incomplete';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewMessageTemplateForm',
    enableReinitialize: true,
    validate
  })
)(NewMessageTemplate);
