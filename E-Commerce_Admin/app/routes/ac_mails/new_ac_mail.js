import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Select from 'react-select';
import Dropzone from 'react-dropzone';
import '!style-loader!css-loader!react-select/dist/react-select.css';
import FroalaEditor from '../../components/FroalaEditor'


const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '7%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '7%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewACMail extends Component {
	constructor(props) {
		super(props)

		this.state = {languages:[], preview: null, image: []}

  }

  componentDidMount() {
    if(this.props.languages) {
      var language = [];
      for(var i in this.props.languages) {
        language = this.props.languages[i]
      }

      var languages = [];
      language.map(l => {
        languages.push({label: l, value: l})
      })
      this.setState({languages})
    }
  }

  createACMail(obj){
    obj = obj.toJS();
    obj.time = parseInt(obj.time);
    obj.send_after = obj.send_after ? obj.send_after : "";

    var acmail_data = new FormData();
    acmail_data.append("title", obj.title);
    acmail_data.append("subject", obj.subject);
    acmail_data.append("content", obj.content);
    acmail_data.append("time", obj.time);
    acmail_data.append("btn_text", obj.btn_text);
    acmail_data.append("btn_link", obj.btn_link);
    acmail_data.append("send_after", obj.send_after);
    acmail_data.append("lang", obj.lang);
    acmail_data.append("country", obj.country);
    acmail_data.append("discount_id", obj.discount_id);
    if(this.state.image.length != 0)
    {
      acmail_data.append("profile_image", this.state.image);
    } else {
      acmail_data.append("img_link", "");
    }

    obj.profile_image = this.state.image;
    this.setState({preview: null, image:[]})
    this.props.reset();
    this.props.createACMail(acmail_data);
  }

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
  }

  changeLanguage(country) {
    var language = [];
    for(var i in this.props.languages) {
      if (i == country) {
        language = this.props.languages[i]
      }
    }

    var languages = [];
    language.map(l => {
      languages.push({label: l, value: l})
    })
    this.setState({languages})
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

  renderSelect1 = ({ input, placeholder, type, label, options, meta: { touched, error, warning, valid } }) => (
    <div className="form-group popust-select">
      <label className="form-label">{label}</label>
        <Select
          className={`${touched && error ? 'form-input-error' : touched && (valid && input.value != "") ? 'form-input-success' : ''} form-white mb-1`}
          name=""
          placeholder={placeholder}
          value={input.value}
          {...input}
          onBlur={() => {input.onBlur(input.value.value), this.changeLanguage(input.value.value)}}
          options={options}
          multi={false}
        />
        {touched && ((error && <i className="fa fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fa fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )

	render() {
    const { handleSubmit } = this.props;
    const { preview } = this.state;

    const dropzoneStyle = {
      width  : "100px",
      height : "35px",
      cursor : "pointer"
    };

    const img_style = {
      height : "160px"
    };

		return (
			<Modal
      isOpen={this.props.newModal}
      style={otherModalStyles}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fa fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj mail</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createACMail.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="title" place={`Vnesi naslov`} inputclass="col-lg-6" type="text" component={renderField} label="Naslov"/>
            <Field name="subject" place={`Vnesi zadevo`} inputclass="col-lg-6" type="text" component={renderField} label="Zadeva"/>
            <Field name="content" type="text" inputclass="col-lg-12" component={renderBigTextArea} label="Vsebina"/>
            <Field name="btn_text" place={`Vnesi vsebino gumba`} inputclass="col-lg-6" type="text" component={renderField} label="Vsebina gumba"/>
            <Field name="btn_link" place={`Vnesi gumb link`} inputclass="col-lg-6" type="text" component={renderField} label="Gumb link"/>
            <Field name="time" place={`Vnesi čas v urah`} inputclass="col-lg-6" type="number" component={renderField} label="Čas"/>
            <div className="col-lg-6">
              <Field name="send_after" placeholder="Pošlji za..." options={this.props.acMails.map(acm => {return {label: acm.title, value: acm.id}})} component={renderSelect} label="Send after"/>
            </div>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} label="Jezik"/>
            </div>
            <div className="col-lg-6">
              <Field name="discount_id" placeholder="Izberi popust..." options={this.props.discounts.map(d => {return {label: d.name, value: d.id}})} component={renderSelect} label="Popust"/>
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={ preview }/> }
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
      {touched && ((error && <i className="fa fa-times error_i error_color"></i>) || (warning && <i className="fa fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fa fa-check success_i success_color"></i>)))}
      {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
    </div>
  )
}

const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning, valid } }) => (
  <div className="form-group popust-select">
    <label className="form-label">{label}</label>
      <Select
        className={`${touched && error ? 'form-input-error' : touched && (valid && input.value != "") ? 'form-input-success' : ''} form-white mb-1`}
        name=""
        placeholder={placeholder}
        value={input.value}
        {...input}
        onBlur={() => {input.onBlur(input.value.value)}}
        options={options}
        multi={false}
      />
      {touched && ((error && <i className="fa fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fa fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <div className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}>
      <FroalaEditor
        tag='textarea'
        config={{
          placeholderText: 'Vnesi vsebino...',
          charCounterCount: false,
          height: 250
          }
        }
        input={input}
      />
    </div>
    {touched && ((error && <i className="fa fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fa fa-check success_select success_color"></i>)))}
    {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();
  if (!values.content) {
    errors.content = 'Obvezno polje';
  }
  if (!values.title) {
    errors.title = 'Obvezno polje';
  }
  if (!values.subject) {
    errors.subject = 'Obvezno polje';
  }
  if (!values.btn_text) {
    errors.btn_text = 'Obvezno polje';
  }
  if (!values.btn_link) {
    errors.btn_link = 'Obvezno polje';
  }
  if (!values.time) {
    errors.time = 'Obvezno polje';
  }
  if (!values.country) {
    errors.country = 'Obvezno polje';
  }
  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewACMailForm',
    enableReinitialize: true,
    validate
  })
)(NewACMail);
