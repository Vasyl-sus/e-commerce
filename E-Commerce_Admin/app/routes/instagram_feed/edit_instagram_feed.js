import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import {deleteInstagramPicture} from '../../actions/instagram_feed_actions';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '10%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '10%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditInstagramFeed extends Component {
	constructor(props) {
		super(props)

		this.state = {preview:null, image:[], hideImage:'', insta_image: null, languages:[]}
	}

  componentDidMount() {
    this.setState({insta_image: this.props.initialValues.toJS().profile_image})
  }

	editInstagramFeed(obj) {

    obj = obj.toJS();

    obj.showed = obj.showed ? 1 : 0;

    if(obj.products && obj.products.length > 0) {
      obj.products = obj.products.map(t => {return t.value});
    } else {
      obj.products = [];
    }
    if(obj.accessories && obj.accessories.length > 0) {
      obj.accessories = obj.accessories.map(a => {return a.value});
    } else {
      obj.accessories = [];
    }

    var instagram_feed_data = new FormData();

    instagram_feed_data.append("name", obj.name);
    instagram_feed_data.append("showed", obj.showed);
    instagram_feed_data.append("link", obj.link);
    if(obj.products && obj.products.length > 0) {
      for(var i=0; i<obj.products.length; i++){
        instagram_feed_data.append("products[]", obj.products[i]);
      }
    } else {
      instagram_feed_data.append("products[]", obj.products);
    }
    if(obj.accessories && obj.accessories.length > 0) {
      for(var i=0; i<obj.accessories.length; i++){
        instagram_feed_data.append("accessories[]", obj.accessories[i]);
      }
    } else {
      instagram_feed_data.append("accessories[]", obj.accessories);
    }
    if(obj.countries) {
      for(var i=0; i<obj.countries.length; i++){
        instagram_feed_data.append("countries[]", obj.countries[i].value || obj.countries[i]);
      }
    }
    if(this.state.image.length != 0)
    {
      instagram_feed_data.append("profile_image", this.state.image);
    }

    this.props.EditInstagramFeed(obj, instagram_feed_data);
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

  DeleteInstagramPicture(id)
  {
    this.props.deleteInstagramPicture(id);
    this.setState({hideImage: 'hide'})
  }

  changeLanguage(country) {
    var language = [];
    for(var i in this.props.languages) {
      if (i == country) {
        language = this.props.languages[i]
      }
    }

    var languages = [];
    var therapies = [];
    var accessories = [];

    language.map(l => {
      languages.push({label: l, value: l})
    })

    for (var j = 0; j < this.props.accessories.length; j++) {
      if (this.props.accessories[j].country == country) {
        accessories.push({value: this.props.accessories[j].id, label: this.props.accessories[j].name})
      }
    }

    this.setState({languages, therapies, accessories})
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
    const { handleSubmit, categories, countries } = this.props;
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

    var aa = [];

    this.props.accessories.map(a => {
      aa.push({value: a.id, label: a.name})
    })

		return (
			<Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi instagram feed</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editInstagramFeed.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi naslov" inputclass="col-lg-12" type="text" component={renderField} label="Naslov"/>
            <Field name="link" place="Vnesi povezavo" inputclass="col-lg-12" type="text" component={renderField} label="Povezava"/>
            <div className="col-lg-12">
              <Field name="countries" placeholder="Izberi države..." options={countries.map(c => {return {value: c.name, label: c.name}})} multi={true} component={renderSelect} label="Države"/>
            </div>
            <div className="col-lg-12">
              <Field name="products" placeholder="Izberi produkte..." options={categories.map(c => {return {value: c.id, label: c.name}})} multi={true} component={renderSelect} label="Produkte"/>
            </div>
            <div className="col-lg-12">
              <Field name="accessories" placeholder="Izberi dodatke..." options={aa} multi={true} component={renderSelect} label="Dodatki"/>
            </div>
            <Field name="showed" component={renderSwitch} label="Prikaži"/>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
              { preview == null && this.state.insta_image != null ?
                <div className={`${this.state.hideImage} div-i-wrapper`}>
                  <img style={img_style} src={this.state.insta_image.link} />
                  <div onClick={this.DeleteInstagramPicture.bind(this, this.state.insta_image.id)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
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
    <div className="col-lg-6">
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
          className={`${touched && error ? 'form-input-error' : touched && (valid && input.value.length > 0) ? 'form-input-success' : ''} form-white mb-1`}
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

const mapDispatchToProps = (dispatch) => {
  return {
    deleteInstagramPicture: (id) => {
      dispatch(deleteInstagramPicture(id))
    }
  }
}


const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.link) {
    errors.link = 'Obvezno polje';
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
    form: 'EditInstagramFeedForm',
    enableReinitialize: true,
    validate
  }), connect(null, mapDispatchToProps)
)(EditInstagramFeed);
