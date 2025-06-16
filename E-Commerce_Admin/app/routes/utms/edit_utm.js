import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '30%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '30%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditUTM extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	editUTM(obj)
  {
    obj = obj.toJS();
		this.props.EditExistingUTM(obj);
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

	render() {
    const { handleSubmit } = this.props;

		return (
			<Modal
      isOpen={this.props.editModal}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi UTM mediuma</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editUTM.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi UTM medium" inputclass="col-lg-12" type="text" component={renderField} label="UTM medium"/>
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

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditUTMForm',
    enableReinitialize: true,
    validate
  })
)(EditUTM);
