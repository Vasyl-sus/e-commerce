import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import {deleteBlogPostImage, getAllBlogPosts} from '../../actions/blogpost_actions';
import FroalaEditor from '../../components/FroalaEditor'
import { ROOT_URL } from '../../config/constants';

const otherModalStyles = {
  content : {
    display               : 'block',
    opacity               : 1,
    top                   : '7%',
    left                  : '15%',
    right                 : '15%',
    bottom                : '7%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditBlogPost extends Component {
	constructor(props) {
		super(props)

		this.state = {preview: null, image: [], slider: false, starred: false, profile_image: null, languages:[], selected_option: null}
	}

  componentDidMount() {

    var data = this.props.initialValues.toJS();

    this.changeLanguage(data.country);
    this.setState({profile_image: this.props.profile_image})

    if(data.therapies.length > 0) {
      this.setState({selected_option: 'terapija'})
    }
    if(data.accessories.length > 0) {
      this.setState({selected_option: 'dodatek'})
    }

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

    this.props.getAllBlogPosts();
  }

  editBlogPost(obj)
  {
    obj = obj.toJS();
    delete obj.linked_posts;
    delete obj.therapies;
    delete obj.accessories;

    obj.starred = obj.starred ? 1:0;
    obj.slider = obj.slider ? 1:0;

    obj.meta_description = obj.meta_description ? obj.meta_description : null;
    obj.url = obj.url ? obj.url : null;
    obj.seo_link = obj.seo_link ? obj.seo_link : null;

    var cat_arr = [];
    for(var i=0; i<obj.categories.length; i++){
      cat_arr.push(obj.categories[i].value);
    }

    obj.categories = cat_arr;

    var accessories = [];
    var blog_accessories = this.props.formValues && this.props.formValues.accessories;

    if(this.state.selected_option != null && this.state.selected_option == "dodatek" && blog_accessories.length != 0) {
      for(var i=0; i<blog_accessories.length; i++) {
        if(blog_accessories[i].value) {
          accessories.push(blog_accessories[i].value);
        } else {
          accessories.push(blog_accessories[i]);
        }
      }
    } else {
      accessories = [];
    }

    obj.accessories = accessories;

    var therapies = [];
    var blog_therapies = this.props.formValues && this.props.formValues.therapies;

    if(this.state.selected_option != null && this.state.selected_option == "terapija" && blog_therapies.length != 0) {
      for(var i=0; i<blog_therapies.length; i++) {
        if(blog_therapies[i].value) {
          therapies.push(blog_therapies[i].value);
        } else {
          therapies.push(blog_therapies[i]);
        }
      }
    } else {
      therapies = [];
    }

    obj.therapies = therapies;

    var linked = [];
    var linked_posts = this.props.formValues && this.props.formValues.linked_posts;

    if(linked_posts.length != 0) {
      for(var i=0; i<linked_posts.length; i++) {
        if(linked_posts[i].value) {
          linked.push(linked_posts[i].value);
        } else {
          linked.push(linked_posts[i]);
        }
      }
    } else {
      linked = [];
    }

    obj.linked_posts = linked;

    var tags = obj.tags ? obj.tags.replace(/\s/g,'').split(",") : [];
    obj.tags = tags;

    var blogpost_data = new FormData();
    blogpost_data.append("title", obj.title);

    for(var k=0; k<obj.categories.length; k++){
      blogpost_data.append("categories[]", obj.categories[k]);
    }

    blogpost_data.append("content", obj.content);
    blogpost_data.append("short_content", obj.short_content);
    blogpost_data.append("meta_description", obj.meta_description);
    blogpost_data.append("url", obj.url);
    blogpost_data.append("seo_link", obj.seo_link);
    blogpost_data.append("language", obj.language);
    blogpost_data.append("country", obj.country);
    if(linked_posts.length != 0) {
      for(var j=0; j<obj.linked_posts.length; j++){
        blogpost_data.append("linked_posts[]", obj.linked_posts[j]);
      }
    } else {
      blogpost_data.append("linked_posts[]", obj.linked_posts);
    }
    for(var x=0; x<obj.tags.length; x++){
      blogpost_data.append("tags[]", obj.tags[x]);
    }
    if(this.state.selected_option != null && this.state.selected_option == "terapija" && blog_therapies.length != 0) {
      for(var j=0; j<obj.therapies.length; j++){
        blogpost_data.append("therapies[]", obj.therapies[j]);
      }
    } else {
      blogpost_data.append("therapies[]", obj.therapies);
    }
    if(this.state.selected_option != null && this.state.selected_option == "dodatek" && blog_accessories.length != 0) {
      for(var i=0; i<obj.accessories.length; i++){
        blogpost_data.append("accessories[]", obj.accessories[i]);
      }
    } else {
      blogpost_data.append("accessories[]", obj.accessories);
    }

    blogpost_data.append("slider", obj.slider);
    blogpost_data.append("starred", obj.starred);
    if(this.state.image.length != 0)
    {
      blogpost_data.append("profile_image", this.state.image);
    }

    this.props.EditBlogPost(blogpost_data, obj);
    console.log(obj)
  }

  closeModal()
  {
    this.props.reset();
    this.props.closeEditModal();
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

  chooseOption(event) {
    if(event != null) {
      this.setState({selected_option: event.value})
    } else {
      this.setState({selected_option: null})
    }
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
    const { handleSubmit, blogpostsAllDrop } = this.props;
    const { preview, selected_option } = this.state;

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
      isOpen={this.props.editModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Uredi objavo na blogu</h2>
        </header>
      	<form onSubmit={handleSubmit(this.editBlogPost.bind(this))}>
          <div className={`modal-body row`}>
            <Field name="title" place={`Vnesi naslov objave`} inputclass="col-6" type="text" component={renderField} label="Naslov objave"/>
            <div className="col-6">
              <div className="row">
                <Field name="slider" component={renderSwitch} label="Intro članek v magazine"/>
                <Field name="starred" component={renderSwitch} label="Izpostavljen članek v mreži"/>
              </div>
            </div>
            <div className="col-6">
              <Field name="categories" placeholder="Izberi kategorijo..." options={this.props.category} multi={true} component={renderSelect} label="Kategorija"/>
            </div>
            <div className="col-6">
              <Field name="tags" place={`Vnesi značke, ločene z vejico (brez presledka)`} type="text" component={renderField} label="Značke"/>
            </div>
            <Field name="content" type="text" inputclass="col-lg-12" component={renderBigTextArea} label="Vsebina"/>
            <Field name="short_content" type="text" inputclass="col-lg-12" component={renderBigTextArea} label="Kratka vsebina"/>
            <Field name="seo_link" place={`Vnesi meta title`} inputclass="col-6" type="text" component={renderField} label="Meta title"/>
            <Field name="meta_description" place={`Vnesi meta description`} inputclass="col-6" type="text" component={renderArea} label="Meta description"/>
            <Field name="url" place={`Vnesi povezavo do objave`} inputclass="col-4" type="text" component={renderField} label="SEO povezava"/>
            <div className="col-4">
              <Field name="country" placeholder="Izberi državo..." options={this.props.countries.map(c => {return {label: c.name, value: c.name}})} component={this.renderSelect1} label="Država"/>
            </div>
            <div className="col-4">
              <Field name="language" placeholder="Izberi jezik..." options={this.state.languages} multi={false} component={renderSelect} label="Jezik"/>
            </div>
            <div className="col-lg-6">
              <div className="form-group popust-select">
                <label className="form-label">Izberi povezan izdelek</label>
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi..."
                  value={selected_option}
                  onChange={this.chooseOption.bind(this)}
                  options={this.props.blog_select_options}
                  multi={false}
                />
              </div>
            </div>
            {selected_option == "terapija" ? <div className="col-lg-6">
              <Field name="therapies" placeholder="Izberi terapije..." options={this.state.therapies} multi={true} component={renderSelect} label="Terapija"/>
            </div> : ""}
            {selected_option == "dodatek" ? <div className="col-lg-6">
              <Field name="accessories" placeholder="Izberi dodatke..." options={this.state.accessories} multi={true} component={renderSelect} label="Dodatek"/>
            </div> : ""}
            <div className="col-lg-12">
              <Field name="linked_posts" placeholder="Izberi povezane bloge..." options={blogpostsAllDrop} component={renderSelect} multi={true} label="Povezani blogi (jezikovne različice)"/>
            </div>
            <div className="col-lg-6">
              <label className="form-label">Glavna slika (najmanj 800px širine)</label>
              <Dropzone name="profile_image" style={dropzoneStyle} multiple={ false } onDrop={this.onDrop.bind(this)}>
                <p>Izberi sliko...</p>
              </Dropzone>
              { preview && <img style={img_style} src={ preview }/> }
              { preview == null && this.state.profile_image != null ?
                <img style={img_style} src={this.state.profile_image.link || this.state.profile_image.preview} />
              : ""}
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

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => (
  <div className={inputclass}>
    <label className="form-label">{label}</label>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : touched && valid && input.value != "" ? 'input_success' : ''} form-control mb-1`} />
    {touched && ((error && <i className="fas fa-times error_i error_color"></i>) || (warning && <i className="fas fa-times error_i error_color"></i>))}
    {touched && input.value != "" && (valid && <i className="fas fa-check success_i success_color"></i>)}
    {touched && ((error && <span className="text-danger">{error}</span>) || (warning && <span className="text-danger">{warning}</span>))}
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
    <div className="col-6">
      <label className="form-label">{label}</label><br/>
      <Switch onChange={() => input.onBlur(!input.value)} checked={input.value} className="form-white" />
    </div>
  );
};

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

  if (!values.title) {
    errors.title = 'Obvezno polje';
  }

  if (!values.categories || (values.categories && values.categories.length == 0)) {
    errors.categories = 'Obvezno polje';
  }

  if (!values.content) {
    errors.content = 'Obvezno polje';
  }

  if (!values.short_content) {
    errors.short_content = 'Obvezno polje';
  }

  if (!values.country) {
    errors.country = 'Obvezno polje';
  }

  if (!values.language) {
    errors.language = 'Obvezno polje';
  }

  return errors;
}

const warn = values => {
  const warnings = {}

  values = values.toJS();

  return warnings;
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteBlogPostImage: (id) => {
      dispatch(deleteBlogPostImage(id))
    },
    getAllBlogPosts: () => {
      dispatch(getAllBlogPosts())
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    blogpostsAllDrop: nextState.blogpost_data.blogpostsAllDrop,
    formValues: nextState.form.EditBlogPostForm && nextState.form.EditBlogPostForm.values,
  }
}

export default compose(
  reduxForm({
    form: 'EditBlogPostForm',
    enableReinitialize: true,
    validate,
    warn
  }), connect(mapStateToProps, mapDispatchToProps)
)(EditBlogPost);
