import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import 'react-select/dist/react-select.css';
import { createNotification } from '../../App.js'
import Dropzone from 'react-dropzone';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '1%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '7%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditCategory extends Component {
	constructor(props) {
		super(props)

		this.state = {translations:[], preview: null, backPreview: null, image: [], background_image: [], paternPreview: null, patern_image: [], addPreview: null, add_image: []}

	}

	editProductCategory(obj)
  {
    obj = obj.toJS();
    var data = new FormData();
    obj.sort_order = parseInt(obj.sort_order)
    var translation = this.state.translations
    var t = [];
    for(var i=0; i<translation.length; i++) {
      if(translation[i].display_name != "" && translation.link_name != "") {
        t.push(translation[i]);
      }
    }
    if(t.length != Object.keys(this.props.languages).length) {
      createNotification('error', 'Izpolnite vsa polja!')
    } else {
      obj.translations = t;
      for (var i in obj) {
        if (i === "translations") {
          data.append(i, JSON.stringify(obj[i]))
        } else {
          if (i != 'id' && i != 'profile_image' && i != 'background_image' && i != 'pattern_image' && i != 'additional_image' )
            data.append(i, obj[i]);
        }
      }
      if(this.state.image.length != 0)
      {
        data.append("profile_image", this.state.image);
      }

      if(this.state.background_image.length != 0)
      {
        data.append("background_image", this.state.background_image);
      }

      if(this.state.patern_image.length != 0)
      {
        data.append("pattern_image", this.state.patern_image);
      }

      if(this.state.add_image.length != 0)
      {
        data.append("additional_image", this.state.add_image);
      }
      this.props.EditProductCategory(obj.id, data);
    }
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

  componentDidMount(){
    var initialValues = this.props.initialValues.toJS();
    var data = initialValues.translations;
    // console.log(initialValues)
    this.setState({preview: initialValues.profile_image, backPreview: initialValues.background_image, paternPreview: initialValues.pattern_image, addPreview: initialValues.additional_image})
    if(data) {
      let translations = [...this.state.translations];
      var lang = Object.keys(this.props.languages);
      for(var i=0; i<lang.length; i++) {
        if (data.filter(function(e) { return e.lang === lang[i]; }).length > 0) {
          if (data[i])
            translations.push({lang:data[i].lang, display_name:data[i].display_name, link_name:data[i].link_name, description: data[i].description, display_name_wrap:data[i].display_name_wrap})
        } else {
          translations.push({lang:lang[i], display_name:"", link_name:"", description: "", display_name_wrap: ""})
        }
        this.setState({ translations });
      }
    } else {
      let translations = [...this.state.translations];
      if(this.props.languages) {
        var size = Object.keys(this.props.languages);
        for(var i=0; i<size.length; i++) {
          translations.push({lang:size[i], display_name: "", link_name:"", description: "", display_name_wrap: ""})
          this.setState({ translations });
        }
      }
    }
  }

   handleChangeDisplayName(i, key, event) {
     let translations = [...this.state.translations];
     translations[i].lang = key;
     translations[i].display_name = event.target.value;
     this.setState({ translations });
   }

   handleChangeDisplayNameWrap(i, key, event) {
     let translations = [...this.state.translations];
     translations[i].lang = key;
     translations[i].display_name_wrap = event.target.value;
     this.setState({ translations });
   }

   handleChangeLinkName(i, key, event) {
     let translations = [...this.state.translations];
     translations[i].lang = key;
     translations[i].link_name = event.target.value;
     this.setState({ translations });
   }

   handleChangeDescription(i, key, event) {
      let translations = [...this.state.translations];
     translations[i].lang = key;
     translations[i].description = event.target.value;
     this.setState({ translations });
   }


  onDrop(files) {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a preview URL manually if it doesn't exist
      if (!file.preview) {
        file.preview = URL.createObjectURL(file);
      }
      
      this.setState({preview: file, image: file});
    }
  }

  onDropBack(files) {
    console.log('Files dropped (background):', files);
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File (background):', file);
      
      // Create a preview URL manually if it doesn't exist
      if (!file.preview) {
        file.preview = URL.createObjectURL(file);
      }
      
      console.log('Preview URL (background):', file.preview);
      this.setState({backPreview: file, background_image: file});
    }
  }

  onDropPatern(files) {
    console.log('Files dropped (pattern):', files);
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File (pattern):', file);
      
      // Create a preview URL manually if it doesn't exist
      if (!file.preview) {
        file.preview = URL.createObjectURL(file);
      }
      
      console.log('Preview URL (pattern):', file.preview);
      this.setState({paternPreview: file, patern_image: file});
    }
  }

  onDropAdd(files) {
    console.log('Files dropped (additional):', files);
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File (additional):', file);
      
      // Create a preview URL manually if it doesn't exist
      if (!file.preview) {
        file.preview = URL.createObjectURL(file);
      }
      
      console.log('Preview URL (additional):', file.preview);
      this.setState({addPreview: file, add_image: file});
    }
  }

  renderLangs(row, index){
    var r = this.props.languages ? this.props.languages[row.lang] : "";
    return(
      <div key={index}>
        <label className="form-label">{r}</label>
        <div key={index}>
          <label className="form-label">Display name</label>
          <input
            className="form-control"
            name="display_name"
            value={row.display_name ? row.display_name : ""}
            placeholder="Vnesi display name"
            onChange={this.handleChangeDisplayName.bind(this, index, row.lang)}
            type='text'
            />
          <label className="form-label">Display name on therapy wrap</label>
          <input
            className="form-control"
            name="display_name_wrap"
            value={row.display_name_wrap ? row.display_name_wrap : ""}
            placeholder="Vnesi display name za therapy wrap"
            onChange={this.handleChangeDisplayNameWrap.bind(this, index, row.lang)}
            type='text'
            />
          <label className="form-label">Link name</label>
          <input
            className="form-control"
            name="link_name"
            value={row.link_name ? row.link_name : ""}
            placeholder="Vnesi link name"
            onChange={this.handleChangeLinkName.bind(this, index, row.lang)}
            type='text'
          />
          <label className="form-label">Opis</label>
          <textarea
            className="form-control"
            name="description"
            rows="5"
            value={row.description ? row.description : ""}
            placeholder="Vnesi opis"
            onChange={this.handleChangeDescription.bind(this, index, row.lang)}
            type='text'
          />
        </div>
      </div>
    )
  }

	render() {
    const { handleSubmit } = this.props;
    const dropzoneStyle = {
      width  : "100px",
      height : "35px",
      cursor : "pointer"
    };

    const img_style = {
      width : "200px",
      height : "160px"
    };
    const { preview, backPreview, paternPreview, addPreview } = this.state
		return (
			<Modal
      ariaHideApp={false}
      isOpen={this.props.editModal}
      contentLabel="new-customer-prof Modal"
      style={otherModalStyles}
      onRequestClose={this.closeModal.bind(this)}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi kategorijo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editProductCategory.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi kategorijo produkta" inputclass="col-lg-12" type="text" component={renderField} label="Kategorija"/>
            <Field name="sort_order" place="Vnesi zaporedno št." inputclass="col-lg-12" type="number" component={renderField} label="Zaporedna št."/>
            <Field name="css_class_name" place="Vnesi className" inputclass="col-lg-12" type="text" component={renderField} label="Classname"/>
            <div className="col-lg-12">
              <label className="form-label">Jeziki</label><br/>
              {this.props.languages ? this.state.translations.map(this.renderLangs.bind(this)) : ""}
            </div>
            <div className="col-lg-6">
              <label className="form-label">Profilna slika</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview.preview || preview.link}/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika ozadja</label>
              <Dropzone name="background_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDropBack.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { backPreview && <img style={img_style} src={backPreview.preview || backPreview.link}/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Pattern slika</label>
              <Dropzone name="pattern_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDropPatern.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { paternPreview && <img style={img_style} src={paternPreview.preview || paternPreview.link}/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Dodatna slika</label>
              <Dropzone name="additional_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDropAdd.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { addPreview && <img style={img_style} src={addPreview.preview || addPreview.link}/> }
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

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.sort_order) {
    errors.sort_order = 'Obvezno polje';
  }

  if (!values.css_class_name) {
    errors.css_class_name = 'Obvezno polje';
  }

  if (!values.translations) {
    errors.translations = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditCategoryForm',
    enableReinitialize: true,
    validate
  })
)(EditCategory);
