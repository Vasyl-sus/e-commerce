import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Select from 'react-select';
import Dropzone from 'react-dropzone';

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

class NewDeliveryMethod extends Component {
	constructor(props) {
		super(props)

		this.state = { additional:[], checked: false, therapies:[], preview: null, image: [] }
	}

	createDeliveryMethod(obj)
  {
    obj = obj.toJS();
    var deliverymethod_data = new FormData();

    obj.active = obj.active ? 1 : 0;
    obj.is_other = obj.is_other ? 1 : 0;
    obj.therapies = obj.therapies ? obj.therapies.map(t => {return t.value}) : [];
    obj.price = parseFloat(obj.price);
    obj.to_price = parseFloat(obj.to_price);

    var translations = {};

    if(!this.state.checked) {
      for(var i=0; i<this.state.additional.length; i++){
        translations[this.state.additional[i].key] = this.state.additional[i].value
        delete obj[this.state.additional[i].key]
      }
    }
    else {
      var lang = Object.keys(this.props.langs);
      for(var i=0; i<lang.length; i++) {
        translations[lang[i]] = this.state.code
        if(this.state.additional[i] && obj[this.state.additional[i].key])
          delete obj[this.state.additional[i].key]
      }
    }

    obj.translations = translations;

    deliverymethod_data.append("translations", JSON.stringify(obj.translations));
    deliverymethod_data.append("active", obj.active);
    deliverymethod_data.append("is_other", obj.is_other);
    deliverymethod_data.append("country", obj.country);
    deliverymethod_data.append("code", obj.code);
    deliverymethod_data.append("price", obj.price);
    deliverymethod_data.append("default_method", obj.default_method ? 1 : 0)
    deliverymethod_data.append("to_price", obj.to_price);

    for(var i=0; i<obj.therapies.length; i++)
    {
      deliverymethod_data.append("therapies[]", JSON.stringify(obj.therapies[i]));
    }

    if(this.state.image.length != 0)
    {
      deliverymethod_data.append("post_image", this.state.image);
    }

		this.props.createNewDeliveryMethod(deliverymethod_data);
    this.props.reset();
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeNewModal();
	}

  componentDidMount(){
    let additional = [...this.state.additional];
    var size = Object.keys(this.props.langs);
    for(var i=0; i<size.length; i++){
      additional.push({key:size[i], value:""})
      this.setState({ additional });
    }

    var therapies = this.props.therapies.map(t => {
      return {value: t.id, label: t.name}
    })

    this.setState({therapies})
  }

  changeCheck() {
    this.setState({checked: !this.state.checked});
  }

  handleChangeCode(event){
    this.setState({code: event.target.value})
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

  handleChange(i, key, event) {
    let additional = [...this.state.additional];
    additional[i].value = event.target.value;
    additional[i].key = key;
    this.setState({ additional });
  }

  changeCountry(country) {
    var therapies = [];
    for (var i = 0; i < this.props.therapies.length; i++) {
      if (this.props.therapies[i].country == country) {
        therapies.push({value: this.props.therapies[i].id, label: this.props.therapies[i].name})
      }
    }

    this.setState({therapies})
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
          onBlur={() => {input.onBlur(input.value.value), this.changeCountry(input.value.value)}}
          options={options}
          multi={false}
        />
        {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
        {touched && (error && <span className="text-danger">{error}</span>)}
    </div>
  )

  renderLangs(row, index){
    if(this.state.checked){
      return(
        <div key={index}>
          <div>
            <label className="form-label">{this.props.langs[row]}</label>
            <input name={row} type="text" disabled={true} value={''} className={`form-control`}
            onChange={this.handleChange.bind(this, index, row)}/>
          </div>
        </div>
      )
    }
    else{
      return(
        <div key={index}>
          <div>
            <label className="form-label">{this.props.langs[row]}</label>
            <input name={row} type="text" disabled={false} className={`form-control`}
            onChange={this.handleChange.bind(this, index, row)}/>
          </div>
        </div>
      )
    }
  }

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
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj način dostave</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createDeliveryMethod.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="code" place="Vnesi kodo" onChange={this.handleChangeCode.bind(this)} inputclass="col-lg-6" type="text" component={renderField} label="Koda"/>
            <Field name="price" place="Vnesi ceno dostave" inputclass="col-lg-6" type="number" component={renderField} label="Cena dostave"/>
            <Field name="to_price" place="Vnesi znesek" inputclass="col-lg-6" type="number" component={renderField} label="Minimalni znesek za brezplačno dostavo"/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="therapies" placeholder="Izberi terapije..." options={this.state.therapies} multi={true} component={renderSelect} label="Brezplačna dostava za naslednje izdelke ne glede na minimalni znesek"/>
            </div>
            <Field name="active" component={renderSwitch} label="Aktivni"/>
            <Field name="is_other" component={renderSwitch} label="Samo v administraciji"/>
            <div className="col-lg-6">
              <label className="form-label mb-2">Prevodi</label><br/>
              <input type="checkbox" className="pointer mr-1" name="test" checked={this.state.checked} onChange={this.changeCheck.bind(this)}/>Kot original
              {this.props.langs && Object.keys(this.props.langs).map(this.renderLangs.bind(this))}
            </div>
            <div className="col-lg-6">
              <label className="form-label">Slika</label>
              <Dropzone name="post_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
            </div>
            <Field name="default_method" component={renderSwitch} label="Privzeta"/>
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => (
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
        multi={multi}
      />
      {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_select success_color"></i>)))}
      {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-3">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.code) {
    errors.code = 'Obvezno polje';
  }

  if (!values.price) {
    errors.price = 'Obvezno polje';
  }

  if (!values.to_price) {
    errors.to_price = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.translations) {
    errors.translations = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'NewDeliveryMethodForm',
    enableReinitialize: true,
    validate
  })
)(NewDeliveryMethod);
