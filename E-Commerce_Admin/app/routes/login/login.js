import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {login_user} from '../../actions/main_actions.js'

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {username:"", password:"", status: ""}
  }

  changeUsername(event) {
    this.setState({ username: event.target.value });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token !== "") {
      browserHistory.push("/login");
    }
  }

  login(obj) {
    this.props.login_user(obj.toJS())
  }

  render () {
    const { handleSubmit, error_login } = this.props;

    return (
      <form onSubmit={handleSubmit(this.login.bind(this))} className="login-div">
          <img src="/images/admin/logo-black.svg" className="login-logo"/>
          <Field type="text" name="username" label="Uporabniško ime" component={renderField} />
          <Field type="password" name="password" label="Geslo" component={renderField} />
          {error_login ? <p className="center mt-3">Podatki za prijavo so napačni.</p> : ''}
          <button type="submit" className="btn btn-primary login-btn">
              Prijava
          </button>
      </form>
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

  if (!values.username) {
    errors.username = "Obvezno polje"
  }

  if (!values.password) {
    errors.password = "Obvezno polje"
  }

  return errors;
}

const mapDispatchToProps = (dispatch) => {
  return {
    login_user: (obj) => {
      dispatch(login_user(obj));
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();

  return {
    error_login: nextState.main_data.error_login
  }
}

export default compose(
  reduxForm({
    form: 'LoginForm',
    enableReinitialize: true,
    validate
  }), connect(mapStateToProps, mapDispatchToProps)
)(Login);
