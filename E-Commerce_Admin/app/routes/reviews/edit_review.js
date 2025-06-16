import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Switch from 'react-switch';
import 'react-select/dist/react-select.css';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '20%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '20%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditReview extends Component {
	constructor(props) {
		super(props)

		this.state = {}

	}

	editReview(obj)
  {
    obj = obj.toJS();
    delete obj.date_added;
    delete obj.product_name;
    delete obj.product_id;
    obj.grade = obj.grade ? obj.grade : 0;
    obj.active = obj.active ? 1 : 0;
    this.props.editReview(obj);
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
          <h2 className="center">Uredi mnenje</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editReview.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="review" place="Vnesi mnenje" inputclass="col-lg-12" type="text" component={renderArea} label="Mnenje"/>
            <Field name="grade" place="Vnesi oceno" inputclass="col-lg-6" type="number" min={0} max={5} component={renderField} label="Ocena"/>
            <Field name="active" component={renderSwitch} label="Aktivno"/>
            <Field name="name" place="Vnesi ime uporabnika" inputclass="col-lg-12" type="text" component={renderField} label="Uporabnik"/>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
      </Modal>
		);
	}
}

const renderField = ({ input, label, min, max, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input type={type} min={min} max={max} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.grade) {
    errors.grade = 'Obvezno polje';
  }

  if (!values.review) {
    errors.review = 'Obvezno polje';
  }

  return errors;
}

export default reduxForm({
    form: 'EditReviewForm',
    enableReinitialize: true,
    validate,
  })
(EditReview);
