import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm, formValueSelector } from 'redux-form/immutable';
import {compose} from 'redux';
import moment from "moment";
import {connect} from 'react-redux';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import Select from 'react-select';
import Dropzone from 'react-dropzone';
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

class NewInfluencer extends Component {
	constructor(props) {
		super(props)

		this.state = {preview:null, image:[], date_from: new Date()}
	}

	createInfluencer(obj) {

    obj = obj.toJS();
    var influencer_data = new FormData();

    influencer_data.append("first_name", obj.first_name);
    influencer_data.append("last_name", obj.last_name);
    influencer_data.append("email", obj.email);
    influencer_data.append("address", obj.address);
    influencer_data.append("telephone", obj.telephone);
    influencer_data.append("postcode", obj.postcode);
    influencer_data.append("city", obj.city);
    influencer_data.append("country", obj.country);
    influencer_data.append("nickname", obj.nickname);
    influencer_data.append("payment_type", obj.payment_type);
    influencer_data.append("type", this.state.type);
    influencer_data.append("facebook_url", obj.facebook_url);
    influencer_data.append("youtube_url", obj.youtube_url);
    influencer_data.append("instagram_url", obj.instagram_url);
    influencer_data.append("webpage_url", obj.webpage_url);
    influencer_data.append("opomba", obj.opomba);
    influencer_data.append("state", obj.state ? "active" : "archived");

    if(this.state.image.length != 0)
    {
      influencer_data.append("profile_image", this.state.image);
    }

    if (obj.payment_type === "monthly" && this.state.date_from) {
      influencer_data.append("date_from", moment(this.state.date_from).format("YYYY-MM-DD"));
    }

    this.props.createNewInfluencer(influencer_data);
    this.props.reset();
    this.setState({preview: null});
	}

	closeModal() {
    this.props.reset();
		this.props.closeNewModal();
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

  influencerType(type) {
    this.setState({type: type})
  }

  dateFrom(date) {
    var newDate = new Date(date);
    newDate.setHours(0);
    newDate.setMinutes(0);
    this.setState({date_from: newDate})
  }

	render() {
    const { handleSubmit, typeValue } = this.props;
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

    let isMonth = false;
    if (typeValue && (typeValue == "monthly" || typeValue.value == "monthly")) {
      isMonth = true;
    }
		return (
			<Modal
      isOpen={this.props.newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Dodaj influencer</h2>
        </header>
      	<form onSubmit={handleSubmit(this.createInfluencer.bind(this))} >
          <div className={`modal-body row`}>
            <Field name="first_name" place="Vnesi ime" inputclass="col-lg-4" type="text" component={renderField} label="Ime"/>
            <Field name="last_name" place="Vnesi priimek" inputclass="col-lg-4" type="text" component={renderField} label="Priimek"/>
            <Field name="nickname" place="Vnesi vzdevek" inputclass="col-lg-4" type="text" component={renderField} label="Vzdevek"/>
            <Field name="address" place="Vnesi naslov" inputclass="col-lg-12" type="text" component={renderField} label="Naslov"/>
            <Field name="postcode" place="Vnesi poštno številko" inputclass="col-lg-6" type="text" component={renderField} label="Poštna številka"/>
            <Field name="city" place="Vnesi mesto" inputclass="col-lg-6" type="text" component={renderField} label="Mesto"/>
            <Field name="telephone" place="Vnesi telefon" inputclass="col-lg-6" type="text" component={renderField} label="Telefon"/>
            <Field name="email" place="Vnesi e-pošta" inputclass="col-lg-6" type="email" component={renderField} label="E-pošta"/>
            <div className="col-lg-12">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={renderSelect} label="Država"/>
            </div>
            <Field name="state" inputclass="col-lg-4" type="text" component={renderSwitch} label="Aktiven / Arhiviran"/>
            <div className="col-lg-4">
              <Field name="payment_type" placeholder="Izberi način plačila..." options={this.props.payment_types} component={renderSelect} label="Način plačila"/>
            </div>
            <div className="col-lg-4">
              {isMonth && <div><label className="d-block mb-0 form-label">Začetek sodelovanja:</label>
              <DatePicker
                selected={this.state.date_from}
                onChange={this.dateFrom.bind(this)}
                minDate={new Date(2017, 1, 1)}
                maxDate={dateMax}
                dateFormat="dd.MM.yyyy"
                className="single-dateinput"
                locale="sl"
              />
              </div>}
            </div>
            <div className="col-md-12 py-3">
              <div className="row">
                <div className="col-md-4">
                  <input onChange={this.influencerType.bind(this, "ambasador")} checked={this.state.type == "ambasador" ? true : false} type="checkbox" className="mr-2 pointer"/>
                  <label>Ambasador</label>
                </div>
                <div className="col-md-4">
                  <input onChange={this.influencerType.bind(this, "influencer")} checked={this.state.type == "influencer" ? true : false} type="checkbox" className="mr-2 pointer"/>
                  <label>Influencer</label>
                </div>
                <div className="col-md-4">
                  <input onChange={this.influencerType.bind(this, "microinfluencer")} checked={this.state.type == "microinfluencer" ? true : false} type="checkbox" className="mr-2 pointer"/>
                  <label>Microinfluencer</label>
                </div>
              </div>
            </div>
            <Field name="facebook_url" place="Facebook page URL" inputclass="col-lg-12" type="text" component={renderField} label="Facebook page URL"/>
            <Field name="instagram_url" place="Instagram profil URL" inputclass="col-lg-12" type="text" component={renderField} label="Instagram profil URL"/>
            <Field name="youtube_url" place="YouTube channel URL" inputclass="col-lg-12" type="text" component={renderField} label="YouTube channel URL"/>
            <Field name="webpage_url" place="Spletna stran" inputclass="col-lg-12" type="text" component={renderField} label="Spletna stran"/>
            <Field name="opomba" place="Opomba" inputclass="col-lg-12" type="text" component={renderTextArea} label="Opomba"/>
            <div className="col-lg-6">
              <label className="form-label">Profilna slika</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={preview}/> }
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

const renderTextArea = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <div className={inputclass}>
      <label className="form-label">{label}</label>
      <textarea rows="7" placeholder={place} {...input} className={`${touched && error ? 'input_error' : touched && warning ? 'input_warning' : touched && valid && input.value != "" ? 'input_success' : ""} form-control mb-1`} />
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

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-4">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const selector = formValueSelector('NewInfluencerForm')
function mapStateToProps(state) {
  return {
    typeValue: selector(state, 'payment_type')
  }
}

const validate = values => {
  const errors = {}
  values = values.toJS();
  if (!values.first_name) {
    errors.first_name = 'Obvezno polje';
  }
  if (!values.last_name) {
    errors.last_name = 'Obvezno polje';
  }
  if (!values.email) {
    errors.email = 'Obvezno polje';
  }
  if (!values.address) {
    errors.address = 'Obvezno polje';
  }
  if (!values.postcode) {
    errors.postcode = 'Obvezno polje';
  }
  if (!values.city) {
    errors.city = 'Obvezno polje';
  }
  if (!values.country) {
    errors.country = 'Obvezno polje';
  }
  if (!values.type) {
    errors.type = 'Obvezno polje';
  }
  if (!values.payment_type) {
    errors.payment_type = 'Obvezno polje';
  }

  return errors;
}

const warn = values => {
  const warnings = {}

  values = values.toJS();

  if(values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    warnings.email = "Nepravilen elektronski naslov";
  }

  return warnings;
}

export default compose(
  reduxForm({
    form: 'NewInfluencerForm',
    enableReinitialize: true,
    validate,
    warn
  }), connect(mapStateToProps, mapDispatchToProps)
)(NewInfluencer);
