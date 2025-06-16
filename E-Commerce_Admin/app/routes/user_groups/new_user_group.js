import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {routes} from '../../config/constants';
import {createNotification} from '../../App.js'

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '5%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '5%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewUserGroup extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	createUserGroup(obj)
  {
    obj = obj.toJS();
    var data = {};
    var permissions = [];

    for(var o in obj) {
      var permission = routes.find(r => {
        return r.name == o;
      })

      if(permission) {
        for(var i=0; i<permission.routes.length; i++) {
          permission.routes[i].category = permission.name;
          permissions.push(permission.routes[i]);
        }
      }
    }

    if(permissions.length == 0) {
      createNotification('error','Izberite vsaj eno dovoljenje!');
    } else {
      data.name = obj.name;
      data.permissions = permissions
      this.props.createNewUserGroup(data);
      this.props.reset();
    }
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
	}

  renderUserGroup(userGroup, index) {
    return (
      <div key={index}>
        <Field name={userGroup.name} type="text" component={renderUserGroup} label={userGroup.name} />
          <ul>
            {userGroup.routes.map((u, i) => {return (
              <li key={i}>{u.route} - {u.method}</li>
            )})}
          </ul>
      </div>
    )
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
          <h2 className="center">Dodaj skupino</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createUserGroup.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi ime skupine" inputclass="col-lg-12" type="text" component={renderField} label="Ime skupine"/>
            <div className="col-lg-12">
              <label className="form-label mb-3">Dovoljenja</label>
              {routes.map(this.renderUserGroup.bind(this))}
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

const renderUserGroup = ({ input, label, defaultValue, inputclass, place, type, meta: { touched, error, warning } }) => (
  <label><input className="pointer mr-2" {...input} type="checkbox"/><span>{label}</span></label>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.permissions) {
    errors.permissions = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewUserGroupForm',
    enableReinitialize: true,
    validate
  })
)(NewUserGroup);
