import React from 'react';
import {compose} from 'redux';
import { Field, reduxForm } from 'redux-form/immutable';

const Search = ({handleSubmit, type="text", setSearch}) => {

    const _setSearch = (data) => {
      data = data.toJS()
      setSearch(data)
    }

    return (
    <form onSubmit={handleSubmit(_setSearch)}>
        <div className="search-div">
            <Field place="Išči..." name="searchString" type={type} component={renderField}></Field>
            <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
        </div>
    </form>
    )
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
  })
)(Search);
