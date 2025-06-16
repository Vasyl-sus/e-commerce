import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import {deleteTestimonialImages} from '../../actions/testimonials_actions';
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

const dropzoneStyle = {
  width  : "100px",
  height : "35px",
  cursor : "pointer"
};

const img_style = {
  width : "200px",
  height : "160px"
};

class EditTestimonial extends Component {
	constructor(props) {
		super(props)

		this.state = {preview: null, image: [], images_preview: [], show_images:[], languages:[], instagram_images:[], show_instagram_images:[]}
	}

  componentDidMount() {
    if(this.props.languages) {
      var language = [];
      var initialValues = this.props.initialValues.toJS();
      for(var i in this.props.languages) {
        if(i == initialValues.country) {
          language = this.props.languages[i]
        }
      }

      var languages = [];
      language.map(l => {
        languages.push({label: l, value: l})
      })
      this.setState({languages})
    }

    this.setState({show_images: this.props.a_images})
    this.setState({show_instagram_images: this.props.a_instagram_images, images_preview: {preview: this.props.a_images && this.props.a_images[0] && this.props.a_images[0].link}})
  }

  closeModal()
  {
    this.props.reset();
    this.props.closeEditModal();
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


  editTestimonial(obj)
  {
    obj = obj.toJS();
    var testimonial_data = new FormData();
    testimonial_data.append("full_name", obj.full_name);
    testimonial_data.append("show_home", obj.show_home ? 1 : 0);
    testimonial_data.append("profession", obj.profession);
    testimonial_data.append("gender", obj.gender);
    testimonial_data.append("category", obj.category);
    testimonial_data.append("country", obj.country);
    testimonial_data.append("facebook_link", obj.facebook_link || '');
    testimonial_data.append("instagram_link", obj.instagram_link || '');
    testimonial_data.append("language", obj.language);
    testimonial_data.append("favourite", obj.favourite);
    testimonial_data.append("content", obj.content);
    testimonial_data.append("url", obj.url);
    if(this.state.image.length != 0)
    {
      testimonial_data.append("profile_image", this.state.image);
    }
    if(this.state.images_preview && this.state.images_preview.type)
    {
      testimonial_data.append("timeline_image", this.state.images_preview);

    }
    if(this.state.instagram_images.length != 0)
    {
      for(var i=0; i<this.state.instagram_images.length; i++)
      {
        testimonial_data.append(`instagram_images[${i}]`, this.state.instagram_images[i]);
      }
    }

    if(obj.therapies) {
      for(var i=0; i<obj.therapies.length; i++){
        testimonial_data.append("therapies[]", obj.therapies[i].value);
      }
    }

    this.props.EditTestimonial(testimonial_data, obj);
    console.log(obj);
  }

  DeleteTestimonialImages(image)
  {
    this.props.deleteTestimonialImages(image.id);
    var imgs = this.state.show_images.filter(i => {
      return i.id != image.id
    })
    this.setState({show_images: imgs})
  }

  renderTestimonialImages(image, index)
  {
    return (
      <div key={index} className={`div-i-wrapper`}>
        <img src={image.link || image.preview} style={img_style} className="img-t-m"/>
        <div onClick={this.DeleteTestimonialImages.bind(this, image)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
      </div>
    )
  }

  DeleteTestimonialInstagramImages(image)
  {
    this.props.deleteTestimonialImages(image.id);
    var imgs = this.state.show_instagram_images.filter(i => {
      return i.id != image.id
    })
    this.setState({show_instagram_images: imgs})
  }

  renderTestimonialInstagramImages(image, index)
  {
    return (
      <div key={index} className={`div-i-wrapper`}>
        <img src={image.link || image.preview} style={img_style} className="img-t-m"/>
        <div onClick={this.DeleteTestimonialInstagramImages.bind(this, image)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
      </div>
    )
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
    const { handleSubmit, a_profile_image, categories } = this.props;
    const { preview, images_preview, instagram_images,show_instagram_images } = this.state;

		return (
			<Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi izjavo</h2>
        </header>
        <form onSubmit={handleSubmit(this.editTestimonial.bind(this))}>
          <div className={`modal-body row`}>
            <Field name="full_name" place={`Vnesi ime in priimek`} inputclass="col-lg-12" type="text" component={renderField} label="Ime in priimek"/>
            <Field name="profession" place={`Vnesi poklic`} inputclass="col-lg-6" type="text" component={renderField} label="Poklic"/>
            <div className="col-lg-6">
              <Field name="gender" placeholder="Izberi spol..." options={this.props.gender} multi={false} component={renderSelect} label="Spol"/>
            </div>
            <Field name="facebook_link" place={`Vnesi facebook povezavo`} inputclass="col-lg-6" type="text" component={renderField} label="Facebook povezava"/>
            <Field name="instagram_link" place={`Vnesi instagram povezavo`} inputclass="col-lg-6" type="text" component={renderField} label="Instagram povezava"/>
            <div className="col-lg-6">
              <Field name="category" placeholder="Izberi, na katerem izdelku se prikazuje..." options={this.props.category} multi={false} component={renderSelect} label="Prikaži na izdelkih"/>
            </div>
            <div className="col-lg-6">
              <Field name="therapies" placeholder="Izberi izdelke na profilu ambasadorja..." options={categories.map(t => {return {label: t.name, value: t.id}})} multi={true} component={renderSelect} label="Prikaži na strani influencerja"/>
            </div>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="language" placeholder="Izberi jezik..." options={this.state.languages} multi={false} component={renderSelect} label="Jezik"/>
            </div>
            <Field name="url" place={`Vnesi SEO URL`} inputclass="col-lg-12" type="text" component={renderField} label="SEO URL (brez šumnikov, namesto presledkov -, male črke)"/>
            <Field name="favourite" place={`Vnesi izpostavljeno prednost`} inputclass="col-lg-12" type="text" component={renderArea} label="Izpostavljena prednost"/>
            <Field name="content" place={`Vnesi vsebino`} inputclass="col-lg-12" type="text" component={renderBigTextArea} label="Vsebina"/>
            <Field name="show_home" component={renderSwitch} label="Prikaži na home"/>
            <div className="col-lg-6">
              <label className="form-label">Profilna slika (300px x 300px)</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={ preview }/> }
              { !preview && a_profile_image &&
                <div className="div-i-wrapper">
                  <img style={img_style} src={a_profile_image.link || a_profile_image.preview} />
                </div> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Glavna slika (350px x 300px)</label>
              <Dropzone name="timeline_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDropImages.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              {images_preview.preview && <img src={images_preview.preview} style={img_style} className="img-t-m"/>}
            </div>
            <div className="col-lg-6">
              <label className="form-label">Galerija slik (300px x 300px)</label>
              <Dropzone name="instagram_images" style={dropzoneStyle} multiple={ true } onDrop={this.onDropInstagramImages.bind(this)}>
                <p>Izberi slike...</p>
              </Dropzone>
              {instagram_images &&
                instagram_images.map((image, index) => (
                  <img key={index} src={image.preview} style={img_style} className="img-t-m"/>
                ))
              }
              {show_instagram_images && show_instagram_images.map(this.renderTestimonialInstagramImages.bind(this)) }
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => {
  if (Immutable.Iterable.isIterable(input.value)) {
    input.value = input.value.toJS();
  }
  return (
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
}

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

  if (!values.full_name) {
    errors.full_name = 'Obvezno polje';
  }

  if (!values.profession) {
    errors.profession = 'Obvezno polje';
  }

  if (!values.category) {
    errors.category = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.language) {
    errors.language = 'Obvezno polje';
  }

  if (!values.gender) {
    errors.gender = 'Obvezno polje';
  }

  if (!values.content) {
    errors.content = 'Obvezno polje';
  }

  if (!values.url) {
    errors.url = 'Obvezno polje';
  }

  if (!values.sort_order) {
    errors.sort_order = 'Obvezno polje';
  }

  return errors;
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteTestimonialImages: (id) => {
      dispatch(deleteTestimonialImages(id))
    }
  }
}

export default compose(
  reduxForm({
    form: 'EditTestimonialForm',
    enableReinitialize: true,
    validate
  }), connect(null, mapDispatchToProps)
)(EditTestimonial);
