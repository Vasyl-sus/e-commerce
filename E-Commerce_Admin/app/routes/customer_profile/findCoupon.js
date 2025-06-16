import React from "react";
import { Field, reduxForm } from 'redux-form/immutable';

const FindCouponForm = ({handleSubmit}) => {

    const submitCoupon = (data) => {
        console.log(data.toJS())
    }

    return (
        <form onSubmit={handleSubmit(submitCoupon)} className="input-group input mb-3">
            <label className="control-label">Vnesi kodo kupona</label>
            <div className="flex">
                <Field name="discount_code" inputclass="col-md-6" place="Vnesi kodo" type="number" component={renderField} />
                <button type="submit" className={`btn-cta cta-active cta-big`}><i className="fa fa-heart"></i> Potrdi</button>
            </div>
        </form>
    )
}

const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning, valid } }) => {
  return (
    <input type="text" {...input} placeholder={place} className="form-control mr-10" />
  )
}

export default
    reduxForm({
        form: 'FindCouponForm',
        enableReinitialize: true
    })
(FindCouponForm);