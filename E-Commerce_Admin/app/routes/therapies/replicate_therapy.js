import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import { SketchPicker } from 'react-color';
import Select from 'react-select';
import {deleteTherapyImage} from '../../actions/therapies_actions';

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

class ReplicateTherapy extends Component {
	constructor(props) {
		super(props)

		this.state = {preview:null, preview1:null, preview2:null, image:[], patern_image:[], background_image:[],
      display_image:null, p_image:null, b_image:null, hideProfile:'', display_image_id:null, hidePattern:'',
      hideBackground:'', p_image_id:null, b_image_id:null, languages:[]}
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
  }

  componentDidMount()
  {
    this.props.images.map(t => {
      if(t.img_type == "profile_img") {
        this.setState({display_image: t.link})
        this.setState({display_image_id: t.id})
      }
    })
  };

	replicateTherapy(obj) {

    obj = obj.toJS();
    var therapy_data = new FormData();

    delete obj.id;
    obj.total_price = parseFloat(obj.total_price);
    obj.products = obj.products.map(p => {return {id: p.value, product_quantity: parseInt(obj.product_quantity) / obj.products.length}});
    obj.title_color = obj.title_color.hex != null ? obj.title_color.hex : obj.title_color;
    obj.active = obj.active ? 1 : 0;
    obj.view_label = obj.view_label ? obj.view_label : "";
    obj.percent = obj.percent ? obj.percent : 0;
    obj.therapy_name = obj.therapy_name ? obj.therapy_name : null;
    obj.box_title = obj.box_title ? obj.box_title : null;
    obj.box_subtitle = obj.box_subtitle ? obj.box_subtitle : null;
    obj.bonus = obj.bonus ? obj.bonus : null;
    obj.second_bonus = obj.second_bonus ? obj.second_bonus : null;
    obj.inflated_price = obj.inflated_price ? parseFloat(obj.inflated_price) : 0;
    obj.inflated_price_label = obj.inflated_price_label ? obj.inflated_price_label : null;

    therapy_data.append("name", obj.name);
    therapy_data.append("category", obj.category);
    therapy_data.append("language", obj.language);
    therapy_data.append("total_price", obj.total_price);
    therapy_data.append("title_color", obj.title_color);
    therapy_data.append("active", obj.active);
    therapy_data.append("second_bonus", obj.second_bonus);
    therapy_data.append("bonus", obj.bonus);
    therapy_data.append("therapy_name", obj.therapy_name);
    therapy_data.append("box_title", obj.box_title);
    therapy_data.append("box_subtitle", obj.box_subtitle);
    therapy_data.append("inflated_price", obj.inflated_price);
    therapy_data.append("inflated_price_label", obj.inflated_price_label);
    therapy_data.append("percent", obj.percent);

    for(var i=0; i<obj.products.length; i++)
    {
      therapy_data.append("products[]", JSON.stringify(obj.products[i]));
    }
    therapy_data.append("view_label", obj.view_label);
    therapy_data.append("country", obj.country);

    if(this.state.image.length != 0)
    {
      therapy_data.append("display_image", this.state.image);
    } else {
      if(this.props.images.length > 0) {
        for(var i=0; i<this.props.images.length; i++)
        {
          therapy_data.append("display_image", this.props.images[i].link);
          obj.display_image = this.props.images[i].link;
        }
      }
    }

		this.props.replicateTherapy(therapy_data);
    console.log(obj);
	}

	closeModal() {
    this.props.reset();
		this.props.closeReplicateModal();
	}

  renderProduct(product, index) {
	    return (
	      <option key={index} value={product.id}>{product.name}</option>
	    );
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

  DeleteProfileImage(id)
  {
    this.setState({hideProfile: 'hide'})
    this.props.deleteTherapyImage(id);
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
      isOpen={this.props.replicateModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dupliciraj terapijo</h2>
        </header>
      	<form onSubmit={handleSubmit(this.replicateTherapy.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi ime terapije" inputclass="col-lg-12" type="text" component={renderField} label="Ime terapije"/>
            <div className="col-lg-6">
              <Field name="category" placeholder="Izberi kategorijo..." options={this.props.therapy_category} multi={false} component={renderSelect} label="Kategorija"/>
            </div>
            <Field name="inflated_price" place="Vnesi redno ceno" inputclass="col-lg-6" type="number" component={renderField} label="Redna cena"/>
            <Field name="inflated_price_label" place="Vnesi label redne cene" inputclass="col-lg-6" type="text" component={renderField} label="Label redne cene"/>
            <Field name="total_price" place="Vnesi ceno v eurih" inputclass="col-lg-6" type="number" component={renderField} label="Cena"/>
            <Field name="percent" place="Odstotek" inputclass="col-lg-6" type="number" component={renderField} label="Odstotek"/>
            <div className="col-lg-6">
              <Field name="products" placeholder="Izberi produkte..." options={this.props.products.map(p => { return {label : p.name, value : p.id}})} multi={true} component={renderSelect} label="Produkte"/>
            </div>
            <Field name="product_quantity" place="Vnesi št. produktov" inputclass="col-lg-6" type="number" component={renderField} label="Št. produktov"/>
            <Field name="view_label" place="Vnesi view label" inputclass="col-lg-6" type="text" component={renderField} label="Naziv v adminu"/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="language" placeholder="Izberi jezik..." options={this.state.languages} multi={false} component={renderSelect} label="Jezik"/>
            </div>
            <Field name="therapy_name" place="Vnesi ime terapije (HTML)" inputclass="col-lg-6" type="text" component={renderField} label="Ime terapije (HTML)"/>
            <Field name="box_title" place="Vnesi ime na izbiri količin" inputclass="col-lg-6" type="text" component={renderField} label="Box title"/>
            <Field name="box_subtitle" place="Vnesi zgornji podnaslov na izbiri količin" inputclass="col-lg-6" type="text" component={renderField} label="Box subtitle"/>
            <Field name="bonus" place="Bonus polje 1" inputclass="col-lg-6" type="text" component={renderField} label="Bonus polje 1"/>
            <Field name="second_bonus" place="Bonus polje 2" inputclass="col-lg-6" type="text" component={renderField} label="Bonus polje 2"/>
            <Field name="active" component={renderSwitch} label="Aktivna"/>
            <Field name="title_color" inputclass="col-lg-6" component={renderColor} label="Barva naslova"/>
            <div className="col-lg-6">
              <label className="form-label">Slika terapija</label>
              <Dropzone name="display_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
              { preview == null && this.state.display_image ?
                <div className={`${this.state.hideProfile} div-i-wrapper`}>
                  <img style={img_style} src={this.state.display_image} />
                  <div onClick={this.DeleteProfileImage.bind(this, this.state.display_image_id)} className="d-p-img pointer"><i className="fas fa-times"></i></div>
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
    <div className="col-lg-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const renderColor = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <SketchPicker saturationWidth={200} saturationHeight={200} color={input.value} {...input}/>
    {touched && ((error && <div className="text-danger pt-2">{error}</div>) || (warning && <div className="text-warning pt-2">{warning}</div>))}
  </div>
)

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => {

  if (Immutable.Iterable.isIterable(input.value)) {
    input.value = input.value.toJS();
  }
  return(
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

const mapDispatchToProps = (dispatch) => {
  return {
    deleteTherapyImage: (id) => {
      dispatch(deleteTherapyImage(id));
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    formValues: nextState.form.ReplicateTherapyForm && nextState.form.ReplicateTherapyForm.values
  }
}

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.products || (values.products && values.products.length == 0)) {
    errors.products = 'Obvezno polje';
  }

  if (!values.total_price) {
    errors.total_price = 'Obvezno polje';
  }

  if (!values.category) {
    errors.category = 'Obvezno polje';
  }

  if (!values.language) {
    errors.language = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.product_quantity) {
    errors.product_quantity = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'ReplicateTherapyForm',
    enableReinitialize: true,
    validate
  }), connect(mapStateToProps, mapDispatchToProps)
)(ReplicateTherapy);
