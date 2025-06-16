import React from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '5%',
    left                  : '35%',
    right                 : '35%',
    bottom                : '10%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const NewColor = ({ CreateColor, reset, colorModalClose, handleSubmit, newColorModal }) => {

	const _createColor = (obj) => {
    obj = obj.toJS();
		CreateColor(obj);
    reset();
	}

	const closeColorModal = () => {
		colorModalClose();
	}

  return (
    <Modal
    isOpen={newColorModal}
    ariaHideApp={false}
    contentLabel="new-customer-prof Modal"
    onRequestClose={closeColorModal}
    style={otherModalStyles}>
      <header className={`confirm_box clearfix`}>
        <h2 className="align-center">Ustvari barvo</h2>
      </header>
      <form onSubmit={handleSubmit(_createColor)} >
        <div className={`modal-body col-lg-12`}>
          <Field name="description" place="Vnesi opis barve" inputclass="col-lg-12" type="text" component={renderField} label="Opis"/>
          <Field name="value" inputclass="col-lg-12" component={renderColor} label="Barva"/>
        </div>
        <div className={`modal-footer col-lg-12`}>
          <button type="submit" className="btn btn-primary b-c-new-customer">SHRANI</button>
          <button className="btn btn-primary b-c-edit-customer" onClick={closeColorModal}>ZAPRI</button>
        </div>
      </form>
    </Modal>
  );
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control`} />
  </div>
)

const renderColor = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <ColorPicker saturationWidth={200} saturationHeight={200} onChange={(color) => input.onChange(!input.value)} color={input.value} {...input}/>
    <p style={{
        background: input.value,
        width: 200,
        height: 25,
        color: 'white'
      }}>
    </p>
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.description) {
    errors.description = 'Incomplete';
  }

  if (!values.value) {
    errors.value = 'Incomplete';
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
