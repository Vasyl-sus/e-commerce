import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '25%',
    left                  : '35%',
    right                 : '35%',
    bottom                : '25%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewLanguage extends Component {
	constructor(props) {
		super(props)

		this.state = {}

	}

	createLanguage(obj)
  {
    obj = obj.toJS();
		this.props.addNewLanguage(obj);
    this.props.reset();
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
	}

	render() {
    const { handleSubmit} = this.props;

		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header>
          <h2 className="center">Dodaj jezik</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createLanguage.bind(this))} >
          <div className={`lang modal-body col-lg-12`}>
            <div className="row">
              <Field name="language" place="Vnesi kratico jezika" inputclass="col-lg-12" type="text" component={renderField} label="Kratica"/>
              <Field name="languageName" place="Vnesi naziv jezika" inputclass="col-lg-12" type="text" component={renderField} label="Naziv"/>
            </div>
          </div>
          <div className={`modal-footer col-lg-12`}>
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

  if (!values.language) {
    errors.language = 'Obvezno polje';
  }

  if (!values.languageName) {
    errors.languageName = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewLanguageForm',
    enableReinitialize: true,
    validate
  })
)(NewLanguage);
