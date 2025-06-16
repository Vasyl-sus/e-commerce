import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';

class Search extends Component {
    constructor(props) {
      super(props);

      this.state = {};
    }

    setSearch(data) {
      data = data.toJS();

      this.props.setSearch(data.searchString)
    }

    render(){
      const { handleSubmit, type="text" } = this.props;

      return (
        <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
          <Field place="Išči..." name="searchString" type={type} component={renderField}></Field>
          <button type="submit" className="btn btn-secondary btn-search">Išči</button>
        </form>
      )
    }
 }

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
   <div className={inputclass}>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} new-search-input`} />
   </div>
 )
export default compose(
  reduxForm({
    form: 'Search',
    enableReinitialize: true
  }), connect(null, null)
)(Search);
