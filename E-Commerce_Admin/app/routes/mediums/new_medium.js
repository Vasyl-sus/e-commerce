import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Dropzone from 'react-dropzone';
import Select from 'react-select';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '17%',
    left                  : '27%',
    right                 : '27%',
    bottom                : '17%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewMedium extends Component {
	constructor(props) {
		super(props)

		this.state = {preview:null, preview1:null, image:[], image1:[], languages:[]}
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

	newMedium(obj) {

    obj = obj.toJS();

    var mediumData = new FormData();

    mediumData.append("name", obj.name);
    mediumData.append("sort_order", obj.sort_order);
    mediumData.append("country", obj.country);
    mediumData.append("language", obj.language);

    if(this.state.image.length != 0)
    {
      mediumData.append("profile_image", this.state.image);
    }

    if(this.state.image1.length != 0)
    {
      mediumData.append("big_image", this.state.image1);
    }

    obj.image = this.state.image;
    this.props.createMedium(mediumData);
    this.setState({preview: null, image:[]})
    this.props.reset();
	}

	closeModal() {
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

  onDrop1(preview)
  {
    this.setState({preview1:preview[0].preview, image1:preview[0]})
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
    const { handleSubmit } = this.props;
    const { preview, preview1 } = this.state;

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
          <h2 className="center">Dodaj medij</h2>
        </header>
      	<form onSubmit={handleSubmit(this.newMedium.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi naslov" inputclass="col-lg-8" type="text" component={renderField} label="Naslov"/>
            <Field name="sort_order" place="Vnesi zaporedno št." inputclass="col-lg-4" type="number" component={renderField} label="Zaporedna št."/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="language" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} label="Jezik"/>
            </div>
            <div className="col-lg-6">
              <label className="form-label">Logotip</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika članka</label>
              <Dropzone name="big_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop1.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview1 && <img style={img_style} src={preview1}/> }
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
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.sort_order) {
    errors.sort_order = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.language) {
    errors.language = 'Obvezno polje';
  }

  return errors;
}

export default reduxForm({
    form: 'NewMediumForm',
    enableReinitialize: true,
    validate
  })
(NewMedium);
