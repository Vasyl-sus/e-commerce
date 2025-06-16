import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '23%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '23%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditProductStock extends Component {
	constructor(props) {
		super(props)

		this.state = {}
	}

	editProductStock(obj)
  {
    obj = obj.toJS();
    var data = {};
    var user = JSON.parse(localStorage.getItem('user'))

    data.admin_full_name = user.firstname + " " + user.lastname;
    data.admin_id = user.id;
    data.product_id = this.props.product.id;
    data.product_name = this.props.product.name;
    data.comment = obj.comment;
    data.value = parseInt(-obj.stock);
    this.props.EditProductStock(this.props.product.id, data);
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModalProduct();
	}

	render() {
    const { handleSubmit } = this.props;

		return (
			<Modal
      isOpen={this.props.editModalProduct}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Zmanjšaj zalogo za {this.props.product.name}</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editProductStock.bind(this))} >
          <div className={`modal-body row`}>
            <div className="col-md-12">
              <label className="form-label">Trenutna količina: </label> {this.props.initialValues.toJS().value}
            </div>
            <Field name="stock" place="Vnesi število" inputclass="col-lg-12" type="number" component={renderField} label="Število za koliko želite zmanjšati količino produkta"/>
            <Field name="comment" place="Vnesi opombo" inputclass="col-lg-12" type="text" component={renderArea} label="Opomba"/>
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

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.stock) {
    errors.stock = 'Obvezno polje';
  }

  return errors;
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    formValues: nextState.form.EditProductStockForm && nextState.form.EditProductStockForm.values
  }
}

export default compose(
  reduxForm({
    form: 'EditProductStockForm',
    enableReinitialize: true,
    validate,
  }), connect(mapStateToProps, null)
)(EditProductStock);
