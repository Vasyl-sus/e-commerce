import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import FroalaEditor from '../../components/FroalaEditor'
import { ROOT_URL } from '../../config/constants';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '7%',
    left                  : '20%',
    right                 : '20%',
    bottom                : '7%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewUserTestimonial extends Component {
	constructor(props) {
		super(props)

		this.state = {
      preview: null,
      image: [],
      images_preview: [],
      languages:[],
      instagram_images: []
    }
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

  createNewUserTestimonial(obj)
  {
    obj = obj.toJS();
    var testimonial_data = new FormData();
    testimonial_data.append("user_name", obj.user_name);
    testimonial_data.append("country", obj.country);
    testimonial_data.append("category", obj.category);
    testimonial_data.append("lang", obj.lang);
    testimonial_data.append("text", obj.text);
    testimonial_data.append("rating", obj.rating);

    if(this.state.image.length != 0)
    {
      testimonial_data.append("image", this.state.image);
    }

    this.props.CreateUserTestimonial(testimonial_data);
    this.props.reset();
  }

  closeModal()
  {
    this.props.reset();
    this.props.closeNewModal();
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

  onDropImages(images_preview){
    this.setState({images_preview: images_preview[0]});
  }

  onDropInstagramImages(instagram_images){
    this.setState({instagram_images});
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
        {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )

	render() {
    const { handleSubmit, categories } = this.props;
    const { preview, images_preview, instagram_images } = this.state;

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
          <h2 className="center">Dodaj izjavo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createNewUserTestimonial.bind(this))}>
          <div className={`modal-body row`}>
            <Field name="user_name" place={`Vnesi ime in priimek`} inputclass="col-lg-12" type="text" component={renderField} label="Ime in priimek"/>
            <div className="col-lg-6">
              <Field
                name="country"
                placeholder="Izberi državo..."
                options={this.props.countries.map(c => {return {label: c.name, value: c.name}})}
                component={this.renderSelect1}
                label="Država"
              />
            </div>
            <div className="col-lg-6">
              <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} multi={false} component={renderSelect} label="Jezik"/>
            </div>
            <div className="col-lg-6">
              <Field name="rating" placeholder="Vnesite oceno..." options={[1,2,3,4,5].map(c => {return {label: c, value: c}})} multi={false} component={renderSelect} label="Oceno"/>
            </div>
            <div className="col-lg-6">
              <label className="form-label">Profilna slika (300px x 300px)</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={ preview }/> }
            </div>
            <div className="col-lg-6">
              <Field name="active" component={renderSwitch} label="Aktivno"/>
            </div>
            <div className="col-lg-6">
              <Field
                name="category"
                placeholder="Izberite kategorijo..."
                options={this.props.categories.map(c => {return {label: c.name, value: c.name}})}
                multi={false}
                component={renderSelect}
                label="Kategorija"
              />
            </div>
            <Field name="text" place={`Vnesi vsebino`} inputclass="col-lg-12" type="text" component={renderBigTextArea} label="Vsebina"/>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
      </Modal>
		);
	}
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : touched && valid && input.value != "" ? 'input_success' : ''} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-times error_i error_color"></i>))}
    {touched && input.value != "" && (valid && <i className="fas fa-check success_i success_color"></i>)}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-danger">{warning}</span>))}
  </div>
)

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

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

const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <div className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}>
      <FroalaEditor
        tag='textarea'
        config={{
          placeholderText: 'Vnesi vsebino...',
          charCounterCount: false,
          height: 250,
          imageUploadURL: `${ROOT_URL}/admin/upload`,
          imageUploadParam: 'images[0]',
          events: {
            'froalaEditor.image.uploaded': (e, editor, response) => {
              response = JSON.parse(response);
              editor.image.insert(response.uploaded_files[0].link, true, null, editor.image.get(), null)
              return false
            }
          }
        }}
        input={input}
      />
    </div>
    {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fas fa-check success_select success_color"></i>)))}
    {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
      </div>
  );
};

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.user_name) {
    errors.full_name = 'Obvezno polje';
  }

  if (!values.rating) {
    errors.rating = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.category) {
    errors.category = 'Obvezno polje';
  }

  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewUserTestimonialForm',
    enableReinitialize: true,
    validate
  })
)(NewUserTestimonial);
