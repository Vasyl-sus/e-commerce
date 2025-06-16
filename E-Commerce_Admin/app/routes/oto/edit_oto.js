import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Select from 'react-select';
import Immutable from 'immutable';
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

class EditOto extends Component {
	constructor(props) {
		super(props)

		this.state = {therapies:[], accessories:[]}
	}

  replaceAll(str,mapObj){
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

    return str.replace(re, function(matched){
        return mapObj[matched];
    });
  }

  componentDidMount() {
    var data = this.props.initialValues.toJS();
    this.changeLanguage(data.country)
    var tt = []; var aa = [];

    this.props.therapies.map(t => {
      if (t.country == data.country) {
        tt.push({value: t.id, label: t.name})
      }
    })

    this.props.accessories.map(a => {
      if (a.country == data.country) {
        aa.push({value: a.id, label: a.name})
      }
    })

    this.setState({therapies: tt, accessories: aa})
  }

  EditOto(obj)
  {
    obj = obj.toJS();

    if(obj.therapies && obj.therapies.length > 0) {
      obj.therapies = obj.therapies.map(t => {return t.value});
    } else {
      obj.therapies = [];
    }

    if(obj.accessories && obj.accessories.length > 0) {
      obj.accessories = obj.accessories.map(a => {return a.value});
    } else {
      obj.accessories = [];
    }
    if(obj.payment_method_id && obj.payment_method_id.length > 0) {
      obj.payment_method_id = obj.payment_method_id.map(a => {return a.value || a});
    } else {
      obj.payment_method_id = [];
    }

    if(obj.offer_on && obj.offer_on.length > 0) {
      obj.offer_on = obj.offer_on.map(a => {return a.value});
    } else {
      obj.offer_on = [];
    }

    obj.time = parseInt(obj.time)
    obj.discount = obj.discount.toString();

    this.props.editOto(obj);
    console.log(obj)
  }

  closeModal()
  {
    this.props.reset();
    this.props.closeEditModal();
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

    for (var i = 0; i < this.props.therapies.length; i++) {
      if (this.props.therapies[i].country == country) {
        therapies.push({value: this.props.therapies[i].id, label: this.props.therapies[i].name})
      }
    }

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
    const { handleSubmit } = this.props;

		return (
			<Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi OTO</h2>
        </header>
      	<form onSubmit={handleSubmit(this.EditOto.bind(this))}>
          <div className={`modal-body row`}>
            <Field name="title" place={`Vnesi naziv`} inputclass="col-lg-4" type="text" component={renderField} label="Naziv"/>
            <div className="col-lg-4">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            {/* <div className="col-lg-4">
              <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} multi={false} component={renderSelect} label="Jezik"/>
            </div> */}
            <div className="col-lg-4">
              <Field name="payment_method_id" placeholder="Izberi plačilno metodo..." options={this.props.paymentmethods.map(p => {return {label: p.code, value: p.id}})} multi={true} component={renderSelect} label="Plačilna metoda"/>
            </div>
            <div className="col-lg-12">
              <Field name="offer_on" placeholder="Izberi terapije..." multi={true} options={this.state.therapies} component={renderSelect} label="Terapije za OTO"/>
            </div>
            <Field name="time" place={`Vnesi čas trajanja v minutah`} inputclass="col-lg-6" type="number" component={renderField} label="Čas trajanja"/>
            <Field name="discount" place={`Vnesi vrednost popusta`} inputclass="col-lg-6" type="number" component={renderField} label="Popust"/>
            <Field name="additional_text" inputclass="col-lg-12" type="text" component={renderBigTextArea} label="Dodatno polje"/>
            <h4 className="center mt-4 col-lg-12">OTO ponudba</h4>
            <div className="col-lg-12">
              <Field name="therapies" placeholder="Izberi terapije..." multi={true} options={this.state.therapies} component={renderSelect} label="Terapije"/>
            </div>
            <div className="col-lg-12">
              <Field name="accessories" placeholder="Izberi dodatke..." multi={true} options={this.state.accessories} component={renderSelect} label="Dodatki"/>
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

const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <div className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}>
      <FroalaEditor
        tag='textarea'
        config={{
          placeholderText: 'Vnesi dodatno vsebino...',
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

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.time) {
    errors.time = 'Obvezno polje';
  }

  if (!values.discount) {
    errors.discount = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }

  if (!values.payment_method_id) {
    errors.payment_method_id = 'Obvezno polje';
  }

  if (!values.offer_on || (values.offer_on && values.offer_on.length == 0)) {
    errors.offer_on = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditOtoForm',
    enableReinitialize: true,
    validate
  })
)(EditOto);
