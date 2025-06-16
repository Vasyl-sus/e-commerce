import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import { format } from 'date-fns';


const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '15%',
    left                  : '25%',
    right                 : '25%',
    bottom                : '15%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditStickyNote extends Component {
	constructor(props) {
		super(props)

    var dateTo = new Date()

    dateTo.setHours(23)
    dateTo.setMinutes(59)

    this.state = {dateFrom: new Date(), dateTo: dateTo, languages:[] }

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

    this.setState({dateFrom: new Date(this.props.initialValues.toJS().from_date), dateTo: new Date(this.props.initialValues.toJS().to_date)})
  }

	editStickyNote(obj)
  {
    obj = obj.toJS();
    obj.active = obj.active ? 1 : 0;
    obj.has_button = obj.has_button ? 1 : 0;
    obj.to_date = format(this.state.dateTo, 'yyyy-MM-dd HH:mm:ss');
    obj.from_date = format(this.state.dateFrom, 'yyyy-MM-dd HH:mm:ss');
    this.props.EditExistingStickyNote(obj);
	}

	closeModal()
  {
    this.props.reset();
		this.props.closeEditModal();
	}

  handleDateChange(dates) {
    var dateFrom = dates[0] ? new Date(dates[0]) : null;
    var dateTo = dates[1] ? new Date(dates[1]) : null;

    if (dateFrom) dateFrom.setHours(0, 0, 1);
    if (dateTo) dateTo.setHours(23, 59, 59);

    this.setState({
      dateFrom: dateFrom,
      dateTo: dateTo
    });
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
    const { handleSubmit} = this.props;

		return (
			<Modal
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi sticky bar</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editStickyNote.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="content" place="Vnesi vsebino" inputclass="col-lg-12" type="text" component={renderArea} label="Vsebina"/>
            <Field name="link" place="Vnesi povezavo" inputclass="col-lg-12" type="text" component={renderField} label="Povezava"/>
            <Field name="button_text" place="Vnesi vsebino gumba" inputclass="col-lg-6" type="text" component={renderField} label="Vsebina gumba"/>
            <Field name="has_button" component={renderSwitch} label="Prikaži gumb"/>
            <Field name="active" component={renderSwitch} label="Aktivni"/>
            <div className="col-lg-6">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(l => {return {label: l.name, value: l.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-lg-6">
              <Field name="language" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} label="Jezik"/>
            </div>
            <div className={`col-lg-12`}>
              <label className="form-label">Obdobje</label>
              <DatePicker
                selected={this.state.dateFrom}
                onChange={this.handleDateChange.bind(this)}
                startDate={this.state.dateFrom}
                endDate={this.state.dateTo}
                selectsRange
                dateFormat="dd.MM.yyyy"
                placeholderText="Izberi obdobje"
                maxDate={dateMax}
                className="multi-dateinput"
                locale="sl"
                showIcon
              />
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

const renderArea = ({ input, label, inputclass, place, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <textarea placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-exclamation warning_i warning_color"></i>) || (valid && (input.value != "" && <i className="fas fa-check success_i success_color"></i>)))}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-warning">{warning}</span>))}
  </div>
);

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

  if (!values.content) {
    errors.content = 'Obvezno polje';
  }
  if (!values.link) {
    errors.link = 'Obvezno polje';
  }
  if (!values.button_text) {
    errors.button_text = 'Obvezno polje';
  }
  if (!values.country) {
    errors.country = 'Obvezno polje';
  }
  if (!values.language) {
    errors.language = 'Obvezno polje';
  }
  if (!values.to_date) {
    errors.to_date = 'Obvezno polje';
  }
  if (!values.from_date) {
    errors.from_date = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditStickyNoteForm',
    enableReinitialize: true,
    validate
  })
)(EditStickyNote);
