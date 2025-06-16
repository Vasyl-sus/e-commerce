import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import FroalaEditor from '../../components/FroalaEditor'
import { ROOT_URL } from '../../config/constants';

const otherModalStyles = {
  content : {
    display               : 'block',
    opacity               : 1,
    top                   : '7%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '7%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class NewAccessory extends Component {
	constructor(props) {
		super(props)

		this.state = {preview: null, image: [], images_preview: [], languages: [], product_image: [], preview_product_image: null}

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

	createAccessory(obj)
  {
    obj = obj.toJS();
    obj.regular_price = parseFloat(obj.regular_price);
    obj.reduced_price = parseFloat(obj.reduced_price);
    obj.sort_order = parseInt(obj.sort_order);
    obj.min_order_total = parseFloat(obj.min_order_total);

    var accessories_data = new FormData();
    accessories_data.append("name", obj.name);
    accessories_data.append("description", obj.description);
    accessories_data.append("long_description", obj.long_description);
    accessories_data.append("regular_price", obj.regular_price);
    accessories_data.append("reduced_price", obj.reduced_price);
    accessories_data.append("min_order_total", obj.min_order_total);
    accessories_data.append("meta_title", obj.meta_title);
    accessories_data.append("meta_description", obj.meta_description);
    accessories_data.append("category", obj.category);
    accessories_data.append("seo_link", obj.seo_link);
    accessories_data.append("sort_order", obj.sort_order);
    accessories_data.append("lang", obj.lang);
    accessories_data.append("country", obj.country);
    accessories_data.append("status", obj.status ? 1 : 0);
    accessories_data.append("is_gift", obj.is_gift ? 1 : 0);
    if(this.state.image.length != 0)
    {
      accessories_data.append("profile_image", this.state.image);
    }
    if(this.state.product_image.length != 0)
    {
      accessories_data.append("product_image", this.state.product_image);
    }
    if(this.state.images_preview.length != 0)
    {
      for(var i=0; i<this.state.images_preview.length; i++)
      {
        accessories_data.append("images["+i+"]", this.state.images_preview[i]);
      }
    }

    this.props.createNewAccessory(accessories_data);
    this.setState({preview: null, image:[], preview_product_image: null, product_image:[], images_preview:[]})
    this.props.reset();
	}

	closeModal()
  {
		this.props.closeNewModal();
    this.props.reset();
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

  onDropProductImage(preview)
  {
    this.setState({preview_product_image:preview[0].preview, product_image:preview[0]})
  }

  onDropImages(images_preview){
    this.setState({images_preview});
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
        {touched && ((error && <i className="fa fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fa fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )

	render() {
    const { handleSubmit } = this.props;
    const { preview, preview_product_image } = this.state;
    const { images_preview } = this.state;

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
      contentLabel="new-customer-prof Modal"
      ariaHideApp={false}
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
      <React.Fragment>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fa fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj dodatek</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createAccessory.bind(this))}>
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi naziv" inputclass="col-lg-12" type="text" component={renderField} label="Naziv"/>
            <Field name="description" place="Vnesi kratki opis" inputclass="col-lg-12" type="text" component={renderArea} label="Kratki opis"/>
            <Field name="long_description" type="text" inputclass="col-lg-12" component={renderBigTextArea} label="Dolgi opis"/>
            <Field name="seo_link" place="Vnesi SEO link" inputclass="col-lg-6" type="text" component={renderField} label="SEO Link"/>
            <Field name="sort_order" place="Pozicija na strani" inputclass="col-lg-6" type="number" component={renderField} label="Pozicija na strani"/>
            <Field name="regular_price" place="Vnesi redno ceno" inputclass="col-lg-6" type="number" component={renderField} label="Redna cena"/>
            <Field name="reduced_price" place="Vnesi ceno s popustom" inputclass="col-lg-6" type="number" component={renderField} label="Cena s popustom"/>
            <Field name="category" place="Vnesi kategorijo" inputclass="col-lg-6" type="text" component={renderField} label="Kategorija"/>
            <Field name="min_order_total" place="Vnesi minimalni znesek naročila" inputclass="col-lg-6" type="number" component={renderField} label="Minimalni znesek naročila za prikaz darila"/>
            <Field name="status" component={renderSwitch} label="Status"/>
            <Field name="is_gift" component={renderSwitch} label="Is Gift"/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} label="Jezik"/>
            </div>
            <Field name="meta_title" place="Vnesi meta title" inputclass="col-lg-12" type="text" component={renderField} label="Meta title"/>
            <Field name="meta_description" place="Vnesi meta description" inputclass="col-lg-12" type="text" component={renderArea} label="Meta description"/>
            <div className="col-lg-6">
              <label className="form-label">Slika dodatka</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={ preview }/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika na produktni strani</label>
              <Dropzone name="product_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDropProductImage.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview_product_image && <img style={img_style} src={ preview_product_image }/> }
            </div>
            <div className="col-lg-6">
              <label className="form-label">Dodatne slike</label>
              <Dropzone name="images" style={dropzoneStyle} multiple={ true } onDrop={this.onDropImages.bind(this)}>
                <p>Izberi slike...</p>
              </Dropzone>
              {images_preview &&
                images_preview.map((image, i) => (
                  <img key={i} src={image.preview} style={img_style} className="img-t-m"/>
                ))
              }
            </div>
          </div>
          <div className={`modal-footer row`}>
            <button type="submit" className="btn btn-primary">SHRANI</button>
          </div>
        </form>
        </React.Fragment>
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

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fa fa-times error_i error_color"></i>) || (warning && <i className="fa fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fa fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <div className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}>
      <FroalaEditor
        tag='textarea'
        config={{
          placeholderText: 'Vnesi dolgi opis...',
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
    {touched && ((error && <i className="fa fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fa fa-check success_select success_color"></i>)))}
    {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-6">
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
  if (!values.description) {
    errors.description = 'Obvezno polje';
  }
  if (!values.regular_price) {
    errors.regular_price = 'Obvezno polje';
  }
  if (!values.reduced_price) {
    errors.reduced_price = 'Obvezno polje';
  }
  if (!values.country) {
    errors.country = 'Obvezno polje';
  }
  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }
  if (!values.meta_title) {
    errors.meta_title = 'Obvezno polje';
  }
  if (!values.meta_description) {
    errors.meta_description = 'Obvezno polje';
  }

  return errors;
}

export default
  reduxForm({
    form: 'NewAccessoryForm',
    enableReinitialize: true,
    validate
  })
(NewAccessory);
