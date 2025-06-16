import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import { Field, reduxForm, FieldArray } from 'redux-form/immutable';
import { editLanguage } from '../../actions/languages_actions.js';
import FroalaEditor from '../../components/FroalaEditor'

var fie = [
  "pphwcc1",
  "pphwcs1",
  "pphwcss1",
  "ppomtdshort",
  "ppomtdlong",
  "ppomttdshort",
  "ppomttdlong",
  "left_ul",
  "text2hb2",
  "text_404",
  'mainContent'
]

class LanguageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount(){
  };

  updateLanguage(data) {
    data = data.toJS();
    var languages = this.props.selectedLang;
    languages.map(language => {
      for (var i in data) {
        if (language.data[i]) {
          if (language.data[i].value || language.data[i].value == "") {
            language.data[i].value = data[i]
          } else {
            let d = data[i];
            language.data[i] = d
          }
        }
      }
    })
    this.props.editLanguage(languages)
  }

  render(){
    const { handleSubmit, initialValues, tab } = this.props

    var val = initialValues && initialValues.toJS();
    return (
      <form onSubmit={handleSubmit(this.updateLanguage.bind(this))} >
        <div className="row">
          {val && Object.keys(val).map((key, index) => {
            var inc = fie.includes(key)
            if (inc) {
              return (
                <div key={index} className="col-md-12 mb-3">
                  <label>{key}</label>
                  <Field
                  name={key}
                  component={renderBigTextArea}
                  />
                </div>
              )
            } else if (key != 'datas') {
              return (
                <div key={index} className="col-md-4 mb-3">
                  <label>{key}</label>
                  <Field
                  name={key}
                  component={renderField}
                  />
                </div>
              )
            }
          })}
        </div>
        {val && val.datas ? <FieldArray tab={tab} name="datas" component={renderDatas} /> : '' }
        <div className="row mt-4 mb-2">
          <div className="col-md-12 right">
            <button type="submit" className="btn btn-primary">Shrani</button>
          </div>
        </div>
      </form>
      )
    }
  }

  const renderDatas = ({tab, fields, meta: {error, submitFailed}}) => {
    return (
      <div className="row">
        {fields.map((member, index) => {
          return (
            <div key={index} className="col-md-12">
              <label>{index}</label>
              {tab == 'faq' && <Field
                name={`${member}.category`}
                component={renderField}
                place="Kategorija"
              />}
              <Field
                name={`${member}.name`}
                component={renderField}
                place="Ime"
              />
              {tab == 'testers' && <Field
                name={`${member}.image`}
                place="Image" component={renderField}
              />}
              <Field
                name={`${member}.value`}
                component={renderBigTextArea}
              />
              <button type="button" className="btn btn-primary" onClick={() => fields.remove(index)}>Zbriši</button>
            </div>
            )
          }
        )}
        <div className="col-md-12 right">
          <button type="button" className="btn btn-primary" onClick={() => {
            if (tab == 'testers') {
              fields.push({name: '', value: '', image: ''})
            } else {
              fields.push({name: '', value: ''})
            }
          }}>Dodaj polje</button>
        </div>
      </div>
    )
  }

  const renderField = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning } }) => (
    <textarea rows="3" placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control`} ></textarea>
  )

  const renderBigTextArea = ({ input, field, label, inputclass, place, type, meta: { touched, error, warning } }) => (
    <FroalaEditor
      tag='textarea'
      input={input}
    />
  )

  const mapDispatchToProps = (dispatch) => {
    return {
      editLanguage: (data) => { dispatch(editLanguage(data)) }
    }
  }

  export default compose(
    reduxForm({
      form: 'LanguageForm',
      enableReinitialize: true
    }), connect(null, mapDispatchToProps)
  )(LanguageForm);
