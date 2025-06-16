import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import { SketchPicker } from 'react-color';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '7%',
    left                  : '35%',
    right                 : '35%',
    bottom                : '14%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditBadge extends Component {
	constructor(props) {
		super(props)

		this.state = {}
	}

	editBadge(obj)
  {
    obj = obj.toJS();
    obj.color = obj.color.hex != null ? obj.color.hex : obj.color;
		this.props.EditBadge(obj);
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
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi značko</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editBadge.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi naziv" inputclass="col-lg-12" type="text" component={renderField} label="Naziv"/>
            <Field name="color" inputclass="col-lg-12" component={renderColor} label="Barva"/>
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

const renderColor = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <SketchPicker saturationWidth={200} saturationHeight={200} color={input.value} {...input}/>
    {touched && ((error && <div className="text-danger pt-2">{error}</div>) || (warning && <div className="text-warning pt-2">{warning}</div>))}
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.color) {
    errors.color = 'Obvezno polje - izberite barvo';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditBadgeForm',
    enableReinitialize: true,
    validate
  })
)(EditBadge);
