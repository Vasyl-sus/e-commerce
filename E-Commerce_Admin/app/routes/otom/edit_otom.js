import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import Switch from 'react-switch';
import FroalaEditor from '../../components/FroalaEditor'
import { createNotification } from '../../App.js';
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

class EditOTOM extends Component {
	constructor(props) {
		super(props)

		this.state = {languages:[], selectedTherapies:[], preview: null, image: [], t: [], image_link:null}
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

    var data = this.props.initialValues.toJS();
    var tt = [];
    this.changeLanguage(data.country);

    if(data.image_link) {
      this.setState({image_link: data.image_link})
    }

    var selectedTherapies = [];
    for(var i=0; i<data.therapies.length;i++){
      selectedTherapies.push(data.therapies[i]);
    }
    this.setState({selectedTherapies})

    this.props.therapies.map(t => {
      if (t.country == data.country) {
        tt.push({value: t.id, label: t.name})
      }
    })
  }

  editOTOMail(obj)
  {
    obj = obj.toJS();

    obj.active = obj.active ? 1 : 0;

    obj.send_after_days = parseInt(obj.send_after_days);

    var forward = true;
    var therapies = this.state.selectedTherapies;
    var arr = [];

    for(var i=0; i<therapies.length;i++){
      if(!therapies[i].quantity) {
        forward = false;
      }
      else{
        delete therapies[i].label;
        if(therapies[i].value) {
          therapies[i].id = therapies[i].value;
          delete therapies[i].value;
          arr.push(therapies[i])
        } else {
          arr.push(therapies[i])
        }
      }
    }

    obj.therapies = arr;

    var data = new FormData();

    if(obj.therapies.length > 0) {
      if(forward) {
        data.append("title", obj.title)
        data.append("label", obj.label)
        data.append("send_after_days", obj.send_after_days)
        data.append("subject", obj.subject)
        data.append("btn_text", obj.btn_text)
        data.append("active", obj.active)
        data.append("data", obj.data)
        data.append("sender", obj.sender)
        data.append("discount_id", obj.discount_id)
        data.append("country", obj.country)
        data.append("lang", obj.lang)
        for(var i=0; i<obj.therapies.length; i++)
        {
          data.append("therapies[]", JSON.stringify(obj.therapies[i]));
        }
        if(this.state.image.length != 0)
        {
          data.append("post_image", this.state.image);
        }

        this.props.EditOTOMail(obj.id, data);
        console.log(obj);
      }
    } else {
      createNotification('error', 'Izberite vsaj eno terapijo in vnesite količino za vsako izbrano terapijo!');
    }
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
    language.map(l => {
      languages.push({label: l, value: l})
    })

    var t = [];
    for (var i = 0; i < this.props.therapies.length; i++) {
      if (this.props.therapies[i].country == country) {
        t.push({value: this.props.therapies[i].id, label: this.props.therapies[i].name})
      }
    }

    this.setState({languages, t})
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

  changedTher(event){
    this.setState({selectedTherapies: event})
  }

  changedQ(id, value){
    var q = value.target.value;
    var selectedTherapies = this.state.selectedTherapies;
    for(var i=0; i<selectedTherapies.length;i++){
      if(selectedTherapies[i].value == id)
        selectedTherapies[i].quantity = parseInt(q);
    }
    this.setState({selectedTherapies});
  }

  renderTherQ(row, index){
    return(
      <div key={index}>
        <label className="form-label">{row.label}</label>
        <input className={`form-control`} type="number" value={row.quantity} name={row.index} onChange={this.changedQ.bind(this, row.value)}/>
      </div>
    )
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
    const { preview, t } = this.state;

    const dropzoneStyle = {
      width  : "100px",
      height : "35px",
      cursor : "pointer"
    };

    const img_style = {
      width : "200px",
      height : "160px"
    };

    var discounts = [];
    this.props.discounts.map(d => {
      if(d.type == "General") {
        discounts.push({label: d.name, value: d.id})
      }
    })

		return (
      <div>
  			<Modal
        isOpen={this.props.editModal}
        ariaHideApp={false}
        contentLabel="new-customer-prof Modal"
        onRequestClose={this.closeModal.bind(this)}
        style={otherModalStyles}>
          <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
          <header className={`confirm_box clearfix`}>
            <h2 className="center">Uredi OTO maila</h2>
          </header>
        	<form onSubmit={handleSubmit(this.editOTOMail.bind(this))}>
            <div className={`modal-body row`}>
              <Field name="title" place="Vnesi naslov" inputclass="col-lg-6" type="text" component={renderField} label="Naslov"/>
              <Field name="label" place="Vnesi naslov maila (pod sliko)" inputclass="col-lg-6" type="text" component={renderField} label="Naslov maila (pod sliko)"/>
              <Field name="send_after_days" place="Vnesi dneve" inputclass="col-lg-6" type="number" component={renderField} label="Dneve"/>
              <Field name="subject" place="Vnesi zadevo" inputclass="col-lg-6" type="text" component={renderField} label="Zadeva"/>
              <Field name="sender" place="Vnesi pošiljatel" inputclass="col-lg-6" type="text" component={renderField} label="Pošiljatel"/>
              <Field name="btn_text" place="Vnesi vsebino gumba" inputclass="col-lg-6" type="text" component={renderField} label="Vsebina gumba"/>
              <Field name="active" component={renderSwitch} label="Aktivni"/>
              <Field name="data" type="text" inputclass="col-lg-12" component={renderBigTextArea} label="Vsebina"/>
              <div className="col-lg-6">
                <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
              </div>
              <div className="col-lg-6">
                <Field name="lang" placeholder="Izberi jezik..." options={this.state.languages} component={renderSelect} multi={false} label="Jezik"/>
              </div>
              <div className="col-lg-6">
                <Field name="discount_id" placeholder="Izberi popust..." options={discounts} component={renderSelect} multi={false} label="Popust"/>
              </div>
              <div className="col-lg-6">
                <div className="form-group popust-select">
                  <label className="form-label">Terapije</label>
                    <Select
                      className="form-white"
                      name="therapies"
                      placeholder="Izberi terapije..."
                      value={this.state.selectedTherapies}
                      onChange={this.changedTher.bind(this)}
                      options={t}
                      multi={true}
                    />
                </div>
              </div>
              <div className="col-lg-6">
                <label className="form-label">Slika</label>
                <Dropzone name="post_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                  <p>Izberi sliko...</p>
                </Dropzone>
                { preview && <img style={img_style} src={preview}/> }
                { preview == null && this.state.image_link ? <img style={img_style} src={this.state.image_link} /> : "" }
              </div>
              <div className="col-lg-6">
                {this.state.selectedTherapies.length>0 && <label>Količina posameznega produkta:</label>}
                {this.state.selectedTherapies && this.state.selectedTherapies.map(this.renderTherQ.bind(this))}
              </div>
            </div>
            <div className={`modal-footer row`}>
              <button type="submit" className="btn btn-primary">SHRANI</button>
            </div>
          </form>
        </Modal>
      </div>
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

const renderSelect = ({ input, placeholder, multi, type, label, options, meta: { touched, error, warning, valid } }) => (
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

const renderSwitch = ({input, label, placeholder, divClass, type, meta: {touched, warning, error}}) => {
  return (
    <div className="col-lg-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <div className={`${touched && error ? 'form-input-error' : touched && (valid && (input.value != "" || input.value.length > 0)) ? 'form-input-success' : ''} form-white mb-1`}>
      <FroalaEditor
        tag='textarea'
        config={{
          placeholderText: 'Vnesi vsebino...',
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
        {...input}
        model={input.value}
        onModelChange={input.onChange}
      />
    </div>
    {touched && ((error && <i className="fas fa-times error_select error_color"></i>) || (valid && ((input.value != "" || input.value.length > 0) && <i className="fas fa-check success_select success_color"></i>)))}
    {touched && (error && <span className="text-danger">{error}</span>)}
  </div>
)

const validate = values => {
  const errors = {}
  values = values.toJS();

  if (!values.label) {
    errors.label = 'Obvezno polje';
  }

  if (!values.send_after_days) {
    errors.send_after_days = 'Obvezno polje';
  }

  if (!values.discount_id) {
    errors.discount_id = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.lang) {
    errors.lang = 'Obvezno polje';
  }

  if (!values.therapies || (values.therapies && values.therapies.length == 0)) {
    errors.therapies = 'Obvezno polje';
  }

  if (!values.title) {
    errors.title = 'Obvezno polje';
  }

  if (!values.data) {
    errors.data = 'Obvezno polje';
  }

  if (!values.subject) {
    errors.subject = 'Obvezno polje';
  }

  if (!values.sender) {
    errors.sender = 'Obvezno polje';
  }

  if (!values.btn_text) {
    errors.btn_text = 'Obvezno polje';
  }

  return errors;
}

export default compose(
  reduxForm({
    form: 'EditOTOMForm',
    enableReinitialize: true,
    validate
  })
)(EditOTOM);
