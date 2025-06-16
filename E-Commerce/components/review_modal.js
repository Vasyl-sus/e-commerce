import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';
import Modal from "react-modal";
import Rating from 'react-rating';

class ReviewModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      success: false
    }
  }

  componentDidMount() {

  };

  closeModal = () => {
    this.props.closeModal();
  }

  verifyCallback(data) {
    this.props.verifyCallback(data)
  }

  callback(data) {
  }

  timeout = () => {
    setTimeout(() => {
      this.closeModal();
    }, 2500);
  }

  submit = (data) => {
    if (!data.grade) {
      data.grade = 5;
    }
    this.props.submitReview(data)
    this.props.reset();
    this.setState({success: true})
    this.timeout();
    clearTimeout(this.timeout)
  }

  render() {
    const { language, handleSubmit } = this.props;
    let text = language.data.oddmnb.value;
    if (this.state.success) {
      text = language.data.uumnu.value
    }
    return (
      <Modal isOpen={this.props.isOpen} onRequestClose={this.closeModal} className="react-modal-style" overlayClassName="react-modal-overlay" ariaHideApp={false} >
        <img onClick={this.closeModal} className="x-img pointer" width="25" height="25" alt="image" src="/static/images/times.svg" />
        {!this.state.success ? <form onSubmit={handleSubmit(this.submit)} >
          <div className="modal-header-gray text-center mb-5">
            <h1 className="text-center">{language.data.oddmn.value}</h1>
          </div>
          <div className="modal-container pt-4">
            <Field name="name" label={language.data.mnip.value} errorText={language.data.ppobv.value} placeholder={""} type="text" component={renderField} />
            <Field name="grade" label={language.data.mnoc.value} placeholder={""} type="text" component={renderStars} />
            <Field name="review" label={language.data.mnrw.value} errorText={language.data.ppobv.value} placeholder={""} type="text" component={renderAreaField} />
            <div className="col-12 col-md-6 text-center text-md-left captcha">
            </div>
          </div>
          <div className="modal-footer-pink text-center">
            <button type="submit" className="btn btn-primary new-btn-to-order" >{text}</button>
          </div>
        </form> :

        <h1 className="text-center">{language.main.data.uumnu.value}</h1>}
      </Modal>
    );
  }
}

const renderField = ({ input, placeholder, disabled, type, errorText, label, meta: { touched, error } }) => (
  <div className="col-md-12 review-input mb-3">
    <p>{label}</p>
    <input {...input} disabled={disabled} placeholder={touched && error ? errorText : placeholder} className={`w-100 ${touched && error && 'red-border'}`} type={type} />
  </div>
);

const renderAreaField = ({ input, placeholder, disabled, type, errorText, label, meta: { touched, error } }) => (
  <div className="col-md-12 review-input mb-3">
    <p>{label}</p>
    <textarea rows="10" {...input} disabled={disabled} placeholder={touched && error ? errorText : placeholder} className={`w-100 ${touched && error && 'red-border'}`} type={type} />
  </div>
);

const renderStars = ({ input, placeholder, disabled, type, errorText, label, meta: { touched, error } }) => (
  <div className="col-md-12 review-input mb-3 reviews">
    <p>{label}</p>
    <Rating
      placeholderRating="5"
      initialRating={input.value || 5}
      {...input}
      emptySymbol={<img src="/static/images/star-empty.svg" className="icon" />}
      fullSymbol={<img src="/static/images/star-full.svg" className="icon" />}
      placeholderSymbol={<img src="/static/images/star-empty.svg" className="icon" />}
    />
  </div>
);

ReviewModal.propTypes = {
};

const validate = values => {
  const errors = {}

  if (!values.name) {
    errors.name = true
  }

  if (!values.review) {
    errors.review = true
  }

  return errors;
}

export default reduxForm({
  form: 'ReviewForm',
  validate,
  enableReinitialize: true,
})
(ReviewModal);
