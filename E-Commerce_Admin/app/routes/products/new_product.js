import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Dropzone from 'react-dropzone';
import { createNotification } from '../../App.js'
import Switch from 'react-switch';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '17%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '17%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const  NewProduct = (props) => {
  const { handleSubmit } = props;

  const [translations, setTranslations] = useState([])
  const [preview, setPreview] = useState(null)
  const [image, setImage] = useState([])

  const mountFunction = () => {
    let t = [...translations];
    if(props.languages) {
      var size = Object.keys(props.languages);
      for(var i=0; i<size.length; i++){
        t.push({lang:size[i], display_name:""})
        setTranslations(t);
      }
    }
  }

  useEffect(mountFunction, [])

	const closeModal = () => {
    props.reset();
		props.closeNewModal();
	}

	const createProduct = (obj) =>
  {
    obj = obj.toJS();
    var translation = translations
    var product_data = new FormData();
    obj.date_added = new Date().toISOString();
    obj.amount = parseInt(obj.amount);
    obj.active = obj.active ? 1 : 0;
    obj.sort_order = parseInt(obj.sort_order);
    var t = [];
    for(var i=0; i<translation.length; i++) {
      if(translation[i].display_name != "" && translation.link_name != "" && translation.description != "") {
        t.push(translation[i]);
      }
    }
    if(t.length != Object.keys(props.languages).length) {
      createNotification('error', 'Izpolnite vsa polja!')
    } else {
      obj.translations = t;
      for (var i in obj) {
        if (i === "translations") {
          product_data.append(i, JSON.stringify(obj[i]))
        } else {
          product_data.append(i, obj[i]);
        }
      }
      product_data.append("amount", obj.amount);
      product_data.append("active", obj.active);
      if(image.length != 0)
      {
        product_data.append("post_image", image);
      }
      product_data.append("category", obj.category);
      product_data.append("date_added", obj.date_added);
      product_data.append("name", obj.name);
      product_data.append("sort_order", obj.sort_order);

      props.createNewProduct(product_data);
      props.reset();
      setPreview(null);
    }
	}

  const onDrop = (preview) =>
  {
    setPreview(preview[0].preview);
    setImage(preview[0])
  }

  const handleChangeDisplayName = (i, key) => (event) => {
    let t = [...translations];
    t[i].lang = key;
    t[i].display_name = event.target.value;
    setTranslations(t)
  }

  const renderLangs = (row, index) => {
    var r = props.languages ? props.languages[row] : "";

    return(
      <div key={index}>
        <label className="form-label">{r}</label>
        <div key={index}>
          <label className="form-label">Display name</label>
          <input
            className="form-control"
            name="display_name"
            placeholder="Vnesi display name"
            onChange={handleChangeDisplayName(index, row)}
            type='text'
            />
        </div>
      </div>
    )
  }

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
    isOpen={props.newModal}
    contentLabel="new-customer-prof Modal"
    onRequestClose={closeModal}
    ariaHideApp={false}
    style={otherModalStyles}>
      <div className="pointer text-right"><i onClick={closeModal} className="fas fa-times"/></div>
      <header className={`confirm_box clearfix`}>
        <h2 className="center">Dodaj produkt</h2>
      </header>
      <form onSubmit={handleSubmit(createProduct)} >
        <div className={`modal-body row`}>
          <Field name="name" place="Vnesi ime produkta" inputclass="col-lg-12" type="text" component={renderField} label="Ime produkta"/>
          <Field name="category" place="Vnesi kategorijo produkta" inputclass="col-lg-12" type="text" component={renderField} label="Kategorija"/>
          <Field name="amount" place="Vnesi količino" inputclass="col-lg-12" type="number" component={renderField} label="Količina"/>
          <Field name="sort_order" place="Vnesi zaporedno št." inputclass="col-lg-12" type="number" component={renderField} label="Zaporedna št."/>
          <Field name="active" component={renderSwitch} label="Aktiven/Neaktiven"/>
          <div className="col-lg-12">
            <label className="form-label">Slika produkta</label>
            <Dropzone name="post_image" style={dropzoneStyle} multiple={ false } onDrop={onDrop}>
              <p>Izberi sliko...</p>
            </Dropzone>
            { preview && <img style={img_style} src={preview}/> }
          </div>
          <div className="col-lg-12">
            <label className="form-label">Jeziki</label><br/>
            {props.languages ? Object.keys(props.languages).map(renderLangs) : ""}
          </div>
        </div>
        <div className={`modal-footer row`}>
          <button type="submit" className="btn btn-primary">SHRANI</button>
        </div>
      </form>
    </Modal>
  )
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

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-12">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.category) {
    errors.category = 'Obvezno polje';
  }

  if (!values.amount) {
    errors.amount = 'Obvezno polje';
  }

  if (!values.sort_order) {
    errors.sort_order = 'Obvezno polje';
  }

  return errors;
}

export default
  reduxForm({
    form: 'NewProductForm',
    enableReinitialize: true,
    validate
  })
  (NewProduct);
