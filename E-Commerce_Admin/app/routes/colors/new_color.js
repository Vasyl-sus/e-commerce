import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import { SketchPicker } from 'react-color';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '15%',
    left                  : '35%',
    right                 : '35%',
    bottom                : '15%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewColor extends Component {
	constructor(props) {
		super(props)

		this.state = {}
	}

	createColor(obj)
  {
    obj = obj.toJS();
    obj.value = obj.value.hex;
		this.props.CreateColor(obj);
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
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj barvo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createColor.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="description" place="Vnesi opis barve" inputclass="col-lg-12" type="text" component={renderField} label="Opis"/>
            <Field name="value" inputclass="col-lg-12" component={renderColor} label="Barva"/>
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

  if (!values.description) {
    errors.description = 'Obvezno polje';
  }

  if (!values.value) {
    errors.value = 'Obvezno polje - izberite barvo';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewColorForm',
    enableReinitialize: true,
    validate
  })
)(NewColor);
