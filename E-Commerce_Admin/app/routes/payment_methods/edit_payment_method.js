import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import {deletePaymentMethodImage} from '../../actions/payment_methods_actions';

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

class EditPaymentMethod extends Component {
	constructor(props) {
		super(props)

		this.state = {preview: null, image: [], hideImage:'', title: null, translations: null, langs:[], post_image: null}

	}

	editPaymentMethod(obj)
  {
    obj = obj.toJS();
    var translations = {};
    var paymentmethod_data = new FormData();

    if (obj.countries[0].value) {
      obj.countries = obj.countries.map(country_value => {
        return country_value.value
      });
    }
    obj.active = obj.active ? 1 : 0;
    obj.is_other = obj.is_other ? 1 : 0;

    for(var i=0; i<this.state.langs.length; i++){
      if(!this.state.checked)
        translations[this.state.langs[i].name] = this.state.langs[i].value
      else
        translations[this.state.langs[i].name] = this.state.title

      if(translations[this.state.langs[i].name])
        delete obj[this.state.langs[i].name]
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

    this.props.EditPaymentMethod(obj, paymentmethod_data);
    console.log(obj);
	}

  componentDidMount() {
    var data = this.props.initialValues.toJS();
    var translations = data.translations;

    this.setState({title: data.title})

    this.setState({post_image: data.post_image})
    var lang;
    if(translations) {
      var keys = Object.keys(translations);

      lang = Object.keys(this.props.languages);

      let langs = [...this.state.langs];
      for(var i=0; i<lang.length; i++) {
        if(keys.includes(lang[i]))
          langs.push({key: this.props.languages[lang[i]], name: lang[i], value: translations[lang[i]]})
        else
          langs.push({key: this.props.languages[lang[i]], name: lang[i], value: ""})
        this.setState({langs})
      }
    }
    else {
      let langs = [...this.state.langs];
      lang = Object.keys(this.props.languages);
      for(var i=0; i<lang.length; i++) {
        langs.push({key: this.props.languages[lang[i]], name: lang[i], value: ""})
        this.setState({langs})
      }
    }
  }

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

  changeCheck() {
    this.setState({checked: !this.state.checked})
  }

  handleChangeTitle(event) {
    this.setState({title: event.target.value})
  }

  handleChangeLang(i, key, name, event) {
    let langs = [...this.state.langs];
    langs[i].value = event.target.value;
    langs[i].key = key;
    langs[i].name = name;
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

  DeletePicture(id)
  {
    this.setState({hideImage: 'hide'})
    this.props.deletePaymentMethodImage(id);
  }

  renderLanguages(language, index) {
    if(this.state.checked) {
      return (
        <div key={index}>
          <div>
            <label className="form-label">{language.key}</label>
            <input name={language.name} type="text" disabled={true} value={''} className={`form-control`}
            onChange={this.handleChangeLang.bind(this, index, language.key, language.name)}/>
          </div>
        </div>
      )
    }
    else {
      return (
        <div key={index}>
          <div>
            <label className="form-label">{language.key}</label>
            <input name={language.name} type="text" disabled={false} value={language.value} className={`form-control`}
            onChange={this.handleChangeLang.bind(this, index, language.key, language.name)}/>
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
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi plačilno metodo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editPaymentMethod.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="title" place="Vnesi ime plačilne metode" onChange={this.handleChangeTitle.bind(this)} inputclass="col-lg-6" type="text" component={renderField} label="Ime"/>
            <Field name="code" place="Vnesi plačilno kodo" inputclass="col-lg-6" type="text" component={renderField} label="Koda"/>
            <div className="col-lg-6">
              <Field name="countries" placeholder="Izberi države..." options={this.props.countries.map(c => {return {label: c.name, value: c.id}})} multi={true} component={renderSelect} label="Države"/>
            </div>
            <Field name="active" component={renderSwitch} label="Aktivna"/>
            <Field name="is_other" component={renderSwitch} label="Samo v administraciji"/>
            <div className="col-lg-6">
              <label className="form-label mb-2">Prevodi</label><br/>
              <input name="check" value={this.state.checked} onClick={this.changeCheck.bind(this)} className="pointer mb-3 mt-1" type="checkbox"/> Kot original
              {this.state.langs.map(this.renderLanguages.bind(this))}
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="post_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
              { preview == null && this.state.post_image ?
                <div className={`${this.state.hideImage} div-i-wrapper`}>
                  <img style={img_style} src={this.state.post_image.link} />
                  <div onClick={this.DeletePicture.bind(this, this.state.post_image.id)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
                </div>
              : "" }
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

const renderField = ({ input, label, inputclass, value, disabled, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <input type={type} value={value} disabled={disabled} placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
      {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-3">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => {

  if (Immutable.Iterable.isIterable(input.value)) {
    input.value = input.value.toJS();
  }

  return(
    <div className="form-group popust-select">
      <label className="form-label">{label}</label>
        <Select
          className={`${touched && error ? 'form-input-error' : touched && (valid && input.value.length > 0) ? 'form-input-success' : ''} form-white mb-1 select-box`}
          name=""
          placeholder={placeholder}
          value={input.value}
          {...input}
          onBlur={() => {input.onBlur(input.value.value)}}
          options={options}
          multi={multi}
        />
        {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value.length > 0 && <i className="fas fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )
}


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


const mapDispatchToProps = (dispatch) => {
  return {
    deletePaymentMethodImage: (id) => {
      dispatch(deletePaymentMethodImage(id))
    }
  }
}

export default compose(
  reduxForm({
    form: 'EditPaymentMethodForm',
    enableReinitialize: true,
    validate
  }), connect(null, mapDispatchToProps)
)(EditPaymentMethod);
