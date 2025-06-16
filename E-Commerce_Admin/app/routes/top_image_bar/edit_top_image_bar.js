import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import {deleteBillboardImage} from '../../actions/top_image_bar_actions';
import FroalaEditor from '../../components/FroalaEditor'
import { ROOT_URL } from '../../config/constants';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '10%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '10%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditTopImageBar extends Component {
	constructor(props) {
		super(props)

		this.state = {preview:null, image:[], checked: false, image_link:null, image_id:null, hideP:'', languages:[]}
	}

  componentDidMount() {
    if(this.props.initialValues.toJS().display_video == 1) {
      this.setState({checked: true})
    } else {
      this.setState({checked: false})
    }

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

    this.setState({image_link: this.props.initialValues.toJS().img_link})
    this.setState({image_id: this.props.initialValues.toJS().image_id})
  }

	editTopImageBar(obj) {

    obj = obj.toJS();

    obj.display_video = this.state.checked ? 1 : 0;
    obj.active = obj.active ? 1 : 0;

    var top_image_bar_data = new FormData();

    top_image_bar_data.append("text", obj.text);
    top_image_bar_data.append("link", obj.link);
    top_image_bar_data.append("video_link", obj.video_link);
    top_image_bar_data.append("display_video", obj.display_video);
    top_image_bar_data.append("country", obj.country);
    top_image_bar_data.append("lang", obj.lang);
    top_image_bar_data.append("active", obj.active);
    if(this.state.image.length != 0)
    {
      top_image_bar_data.append("image", this.state.image);
    }

    this.props.EditBillboard(obj, top_image_bar_data);
    console.log(obj);
	}

	closeModal() {
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

  changeCheck() {
    this.setState({checked: !this.state.checked})
  }

  DeleteBillboardImage(id)
  {
    this.props.deleteBillboardImage(id);
    this.setState({hideP: 'hide'})
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
          className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}
          name=""
          placeholder={placeholder}
          value={input.value}
          {...input}
          onBlur={() => {input.onBlur(input.value.value), this.changeLanguage(input.value.value)}}
          options={options}
          multi={false}
        />
        {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fas fa-check success_select success_color"></i>)))}
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
          <h2 className="center">Uredi naslovni slider</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editTopImageBar.bind(this))} >
          <div className={`modal-body row`}>
            <div className="col-lg-12">
              <Field name="text" component={renderBigTextArea} label="Vsebina"/>
            </div>
            <Field name="link" place="Vnesi povezavo" inputclass="col-lg-12" type="text" component={renderField} label="Povezava"/>
            <div className="col-lg-12">
              <div className="row">
                <Field name="video_link" place="Vnesi video povezavo" inputclass="col-lg-9" type="text" component={renderField} label="Video povezava"/>
                <div className="col-lg-3">
                  <label className="form-label">Prikaži video</label><br/>
                  <input checked={this.state.checked} onClick={this.changeCheck.bind(this)} name="display_video" className="pointer" type="checkbox"/>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} label="Jezik"/>
            </div>
            <Field name="active" component={renderSwitch} label="Aktivni"/>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
              { preview == null && this.state.image_link != null ?
                <div className={`${this.state.hideP} div-i-wrapper`}>
                  <img style={img_style} src={this.state.image_link} />
                  <div onClick={this.DeleteBillboardImage.bind(this, this.state.image_id)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
                </div>
              : "" }
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

const renderSelect = ({ input, placeholder, type, label, options, meta: { touched, error, warning, valid } }) => (
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
        multi={false}
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

const mapDispatchToProps = (dispatch) => {
  return {
    deleteBillboardImage: (id) => {
      dispatch(deleteBillboardImage(id))
    }
  }
}

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.text) {
    errors.text = 'Obvezno polje';
  }

  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditTopImageBarForm',
    enableReinitialize: true,
    validate
  }), connect(null, mapDispatchToProps)
)(EditTopImageBar);
