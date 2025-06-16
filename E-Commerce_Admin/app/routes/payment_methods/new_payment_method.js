import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '10%',
    left                  : '20%',
    right                 : '20%',
    bottom                : '10%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewPaymentMethod extends Component {
	constructor(props) {
		super(props)

		this.state = { preview: null, image: [], checked: false, langs:[], title: null }
	}

	createPaymentMethod(obj)
  {
    obj = obj.toJS();
    var translations = {};
    var paymentmethod_data = new FormData();

    obj.countries = obj.countries.map(country_value => {
      return country_value.value
    });
    obj.active = obj.active ? 1 : 0;
    obj.is_other = obj.is_other ? 1 : 0;

    if(!this.state.checked) {
      for(var i=0; i<this.state.langs.length; i++){
        translations[this.state.langs[i].key] = this.state.langs[i].value
        delete obj[this.state.langs[i].key]
      }
    }
    else {
      var lang = Object.keys(this.props.languages);
      for(var i=0; i<lang.length; i++) {
        translations[lang[i]] = this.state.title
        if(this.state.langs[i] && obj[this.state.langs[i].key])
          delete obj[this.state.langs[i].key]
      }
    }

    obj.translations = translations;

    paymentmethod_data.append("translations", JSON.stringify(obj.translations));
    paymentmethod_data.append("code", obj.code);
    paymentmethod_data.append("active", obj.active);
    paymentmethod_data.append("is_other", obj.is_other);
    paymentmethod_data.append("title", obj.title);
    paymentmethod_data.append("default_method", obj.default_method ? 1:0);

    for(var i=0; i<obj.countries.length; i++)
    {
      paymentmethod_data.append("countries[]", JSON.stringify(obj.countries[i]));
    }

    if(this.state.image.length != 0)
    {
      paymentmethod_data.append("post_image", this.state.image);
    }

    this.props.createNewPaymentMethod(paymentmethod_data);
    this.props.reset();
	}

  componentDidMount() {
    let langs = [...this.state.langs];
    var lang = Object.keys(this.props.languages);
    for(var i=0; i<lang.length; i++) {
      langs.push({key: lang[i], value: ""})
      this.setState({langs})
    }
  }

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
	}

  changeCheck() {
    this.setState({checked: !this.state.checked})
  }

  handleChangeTitle(event) {
    this.setState({title: event.target.value})
  }

  handleChangeLang(i, key, event) {
    let langs = [...this.state.langs];
    langs[i].value = event.target.value;
    langs[i].key = key;
    this.setState({langs});
  }

  onDrop(files)
  {
    if (files && files.length > 0) {
      const file = files[0];      
      // Create a preview URL manually if it doesn't exist
      if (!file.preview) {
        file.preview = URL.createObjectURL(file);
      }
      
      this.setState({preview: file.preview, image: file});
    }
  }

  renderLanguages(language, index) {
    var lang = this.props.languages[language];

    if(this.state.checked) {
      return (
        <div key={index}>
          <div>
            <label className="form-label">{lang}</label>
            <input name={language} value={''} type="text" disabled={true} className={`form-control`}
            onChange={this.handleChangeLang.bind(this, index, language)}/>
          </div>
        </div>
      )
    }
    else {
      return (
        <div key={index}>
          <div>
            <label className="form-label">{lang}</label>
            <input name={language} type="text" disabled={false} className={`form-control`}
            onChange={this.handleChangeLang.bind(this, index, language)}/>
          </div>
        </div>
      )
    }
  }

	render() {
    const { handleSubmit } = this.props;
    const { preview } = this.state;

    const dropzoneStyle = {
      width  : "100px",
      height : "35px",
      cursor : "pointer"
    };

    const img_style = {
      width : "200px",
      height : "160px"
    };

		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj plačilno metodo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createPaymentMethod.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="title" place="Vnesi ime plačilne metode" inputclass="col-lg-6" type="text" onChange={this.handleChangeTitle.bind(this)} component={renderField} label="Ime"/>
            <Field name="code" place="Vnesi plačilno kodo" inputclass="col-lg-6" type="text" component={renderField} label="Koda"/>
            <div className="col-lg-6">
              <Field name="countries" placeholder="Izberi države..." options={this.props.countries.map(c => {return {label: c.name, value: c.id}})} multi={true} component={renderSelect} label="Države"/>
            </div>
            <Field name="active" component={renderSwitch} label="Aktivna"/>
            <Field name="is_other" component={renderSwitch} label="Samo v administraciji"/>
            <div className="col-lg-6">
              <label className="form-label mb-2">Viber / SMS sporočila</label><br/>
              <input name="check" value={this.state.checked} onClick={this.changeCheck.bind(this)} className="pointer mb-3 mt-1" type="checkbox"/> Kot original
              {this.props.languages && Object.keys(this.props.languages).map(this.renderLanguages.bind(this))}
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="post_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
            </div>
            <Field name="default_method" component={renderSwitch} label="Privzeto"/>
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className="form-group popust-select">
    <label className="form-label">{label}</label>
      <Select
        className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}
        name=""
        placeholder={placeholder}
        value={input.value}
        {...input}
        onBlur={() => {input.onBlur(input.value.value)}}
        options={options}
        multi={multi}
      />
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-3">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.title) {
    errors.title = 'Obvezno polje';
  }

  if (!values.code) {
    errors.code = 'Obvezno polje';
  }

  if (!values.countries || (values.countries && values.countries.length == 0)) {
    errors.countries = 'Obvezno polje';
  }

  if (!values.active) {
    errors.active = 'Obvezno polje';
  }

  if (!values.translations) {
    errors.translations = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewPaymentMethodForm',
    enableReinitialize: true,
    validate
  })
)(NewPaymentMethod);
