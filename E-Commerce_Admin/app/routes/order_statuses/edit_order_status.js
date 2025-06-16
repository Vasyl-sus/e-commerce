import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import { SketchPicker } from 'react-color';
import Select from 'react-select';
import Switch from 'react-switch';

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

class EditOrderStatus extends Component {
	constructor(props) {
		super(props)

		this.state = { translations: null, langs:[] };
	}

	editOrderStatus(obj)
  {
    obj = obj.toJS();

    var translations = {};
    for(var i=0; i<this.state.langs.length; i++){
      translations[this.state.langs[i].name] = this.state.langs[i].value

      if(translations[this.state.langs[i].name])
        delete obj[this.state.langs[i].name]
    }

    obj.translations = JSON.stringify(translations);
    obj.next_statuses = obj.next_statuses.map(status => {return status.value});
    obj.color = obj.color.hex != null ? obj.color.hex : obj.color;
    obj.sort_order = parseInt(obj.sort_order);
    obj.new_sort_order = parseInt(obj.new_sort_order);
    obj.hidden = obj.hidden ? 1 : 0

    this.props.EditExistingOrderStatus(obj);
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

  componentDidMount() {
    var translations = this.props.translations != "" ? JSON.parse(this.props.translations) : "";
    var lang;
    if(translations && translations != "") {
      var keys = Object.keys(translations);

      lang = Object.keys(this.props.languages);

      let langs = [...this.state.langs];
      for(var i=0; i<lang.length; i++) {
        if(keys.includes(lang[i]))
          langs.push({key: this.props.languages[lang[i]], name: lang[i], value: translations[lang[i]]})
        else
          langs.push({key: this.props.languages[lang[i]], name: lang[i], value: ""})
        this.setState({langs})
      }
    }
    else {
      let langs = [...this.state.langs];
      lang = Object.keys(this.props.languages);
      for(var i=0; i<lang.length; i++) {
        langs.push({key: this.props.languages[lang[i]], name: lang[i], value: ""})
        this.setState({langs})
      }
    }
  }

  handleChangeLang(i, key, name, event) {
    let langs = [...this.state.langs];
    langs[i].value = event.target.value;
    langs[i].key = key;
    langs[i].name = name;
    this.setState({langs});
  }

  renderLanguages(language, index) {
    return (
      <div key={index}>
        <div>
          <label className="form-label">{language.key}</label>
          <textarea name={language.name} type="text" value={language.value} className={`form-control`}
          onChange={this.handleChangeLang.bind(this, index, language.key, language.name)}/>
        </div>
      </div>
    )
  }

	render() {
    const { handleSubmit } = this.props;

    var statuses = JSON.parse(localStorage.getItem('orderstatuses'));

		return (
			<Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi statusa</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editOrderStatus.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="name" place="Vnesi status" inputclass="col-lg-12" type="text" component={renderField} label="Status"/>
            <Field name="sort_order" place="Vnesi zaporedno številko" inputclass="col-lg-4" type="number" component={renderField} label="Zaporedna številka"/>
            <div className="col-lg-8">
              <Field name="next_statuses" placeholder="Izberi naslednji status..." options={statuses.map(s => {return {label: s.name, value: s.name}})} multi={true} component={renderSelect} label="Naslednji status"/>
            </div>
            <Field name="hidden" component={renderSwitch} label="Skrito"/>
            <Field name="color" inputclass="col-lg-6" component={renderColor} label="Barva"/>
            <div className="col-lg-6">
              <label className="form-label mb-2">Viber / SMS sporočila</label><br/>
              {this.state.langs.map(this.renderLanguages.bind(this))}
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

  if (!values.name) {
    errors.name = 'Obvezno polje';
  }

  if (!values.new_sort_order) {
    errors.new_sort_order = 'Obvezno polje';
  }

  if (!values.color) {
    errors.color = 'Obvezno polje - izberite barvo';
  }

  if (!values.translations) {
    errors.translations = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditOrderStatusForm',
    enableReinitialize: true,
    validate
  })
)(EditOrderStatus);
