import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import { compose } from 'redux';
import moment from 'moment';
import { connect } from 'react-redux';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import { getExpensesByLang, toggleExpense, addExpense } from '../../actions/statistics_actions';

class AddExpensePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startDateFrom: new Date(),
      activeCountry: null,
      expenseID: null,
      expenseData: null,
      additional_fields: null,
      field_key: null,
      dateValue: 0
    };
  }

  componentDidMount() {
    this.props.getExpensesByLang();
  }

  setCountry(event) {
    this.setState({ activeCountry: event });
  }

  dateFrom(date) {
    var newDate = new Date(date);
    newDate.setHours(0);
    newDate.setMinutes(0);
    this.setState({ startDateFrom: newDate });
  }

  handleOneDay(value) {
    var newDate = new Date(moment(new Date()).add(value, 'days').toDate());
    this.setState({ startDateFrom: newDate });
    this.setState({ dateValue: value });
  }

  getExpenseID(expense) {
    this.setState({
      expenseID: expense.id,
      expenseData: {
        name: expense.name,
        expense_type: expense.expense_type,
        id: expense.id,
        value: expense.value,
        billing_period: expense.billing_period,
        billing_type: expense.billing_type
      },
      additional_fields: expense.additional_fields
    });
  }

  CreateExpense(obj) {
    obj = obj.toJS();
    var add_data = {};

    if (this.state.activeCountry.length > 0) {
      obj.expense_id = this.state.expenseID;
      obj.date_added = moment(this.state.startDateFrom).format('YYYY-MM-DD');
      if (this.state.expenseData.expense_type == "variable") {
        obj.expense_value = parseFloat(obj.expense_value / this.state.activeCountry.length);
      }
      for (var key in this.state.additional_fields) {
        if (this.state.additional_fields.hasOwnProperty(key)) {
          if (obj.hasOwnProperty(key)) {
            add_data[key] = obj[key];
            delete obj[key];
          } else {
            add_data[key] = this.state.additional_fields[key];
          }
        }
      }

      obj.countries = this.state.activeCountry.map(ac => {
        return ac.value;
      });

      obj.additional_data = add_data;

      this.props.addExpense(obj);
      this.props.reset();
      this.setState({ expenseID: null });
    }
  }

  renderAdditionalFields(details, key, index) {
    return (
      <div key={index}>
        <div key={index}>
          <div className="flex">
            <span>{key}: </span>
            <Field
              inputclass="ml-3"
              name={key}
              component={renderField}
              type='text'
              value={details[key] == null ? '' : details[key]}
            />
          </div>
        </div>
      </div>
    );
  }

  renderExpenseSections(section, index) {
    return (
      <div className="costs-div-box " key={index}>
        <h3>{section.title}</h3>
        {section.content.map(this.renderExpenseSubSections.bind(this))}
      </div>
    );
  }

  renderExpenseSubSections(sub_section, index) {
    return (
      <div key={index}>
        <div className={`${(this.state.expenseID == sub_section.id) ? 'active-expense-new' : ''} pointer`} onClick={this.getExpenseID.bind(this, sub_section)}>
          {sub_section.name}
        </div>
      </div>
    );
  }

  render() {
    const { handleSubmit, expenses, localCountries } = this.props;
    const { expenseID, expenseData } = this.state;

    const c = localCountries.map(c => { return { label: c, value: c } });

    return (
      <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Vnos stroška</h2>
            </div>
          </div>
          <div className="box box-default pb-5 mb-4">
          <div className="row main-box-head">
          <div className="col-md-12">
            <h4>1. Izberi strošek</h4>
            <div className="new-cost-modal pt-4">
              <div className="flex">
                {expenses.map(this.renderExpenseSections.bind(this))}
              </div>
            </div>
          </div>
          {expenseID &&
            <div className="px-3">
              <h4 className="m-t-30">2. Vnesi podatke</h4>
              <div className="new-stat-info">
                Izbran strošek: <b>{expenseData.name}</b> <br />
                Tip stroška: <b>{expenseData.expense_type == "variable" ? "Spremenljivi strošek" : "Fiksni strošek"}</b><br />
                Časovna opredelitev: <b>{expenseData.billing_period == "day" ? "Dnevni strošek" : "Mesečni strošek"}</b>
              </div>
              <form onSubmit={handleSubmit(this.CreateExpense.bind(this))}>
                <div className="row sp-bet new-exp-modal-f">
                  <div className="col-lg-10 col-md-6 sp-bet">
                    <div className="datepic new-stat-date">
                      <label>Datum</label><br />
                      <div className="flex">
                        <i className="fa fa-calendar-check-o check-abs" aria-hidden="true"></i>
                         <DatePicker
                          selected={this.state.startDateFrom}
                          onChange={this.dateFrom.bind(this)}
                          minDate={new Date(2017, 1, 1)}
                          maxDate={dateMax}
                          dateFormat="dd.MM.yyyy"
                          className="single-dateinput"
                          locale="sl"
                        />
                        <span className={`${(this.state.dateValue == 0) ? 'active-expense-new' : ''} ml-3 mt-2 span-days-stat pointer`} onClick={this.handleOneDay.bind(this, 0)}>Danes </span>
                        <span className="pointer mt-2 span-days-stat">/</span>
                        <span className={`${(this.state.dateValue == -1) ? 'active-expense-new' : ''} mt-2 span-days-stat pointer`} onClick={this.handleOneDay.bind(this, -1)}> Včeraj </span>
                        <span className="pointer mt-2 span-days-stat">/</span>
                        <span className={`${(this.state.dateValue == 1) ? 'active-expense-new' : ''} mt-2 span-days-stat pointer`} onClick={this.handleOneDay.bind(this, 1)}> Jutri</span>
                      </div>
                    </div>
                    <div>
                      <label>Znesek</label>
                      <Field
                        name='expense_value'
                        component={renderField}
                        type='text'
                        place="Vnesi znesek v EUR"
                      />
                    </div>
                    <div>
                      <label>Države</label>
                      <Select
                        className="form-white"
                        name=""
                        placeholder="Izberi državo..."
                        value={this.state.activeCountry}
                        options={c}
                        multi={true}
                        onChange={this.setCountry.bind(this)}
                      />
                    </div>
                    <div>
                      <label>Opombe</label>
                      {this.state.additional_fields != null ? Object.keys(this.state.additional_fields).map(this.renderAdditionalFields.bind(this, this.state.additional_fields)) : ""}
                    </div>
                    <button className="pointer new-btn-add-stat" ref={ref => { this.btn = ref }} type="submit">POTRDI</button>
                  </div>
                </div>
              </form>
            </div>}
        </div>
      </div>
      </div>
    );
  }
}

const renderField = ({ input, field, ref, label, value, inputclass, place, type, meta: { touched, error, warning } }) => (
  <input type={type} placeholder={place} value={value} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control ${inputclass}`} />
)

const mapDispatchToProps = (dispatch) => {
  return {
    getExpensesByLang: (lang) => {
      dispatch(getExpensesByLang(lang))
    },

    toggleExpense: (id, flag) => {
      dispatch(toggleExpense(id, flag))
    },

    addExpense: (obj) => {
      dispatch(addExpense(obj))
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    expenses: nextState.statistics_data.expenses,
    countries: nextState.main_data.countries,
    formValues: nextState.form.ExpenseDataForm && nextState.form.ExpenseDataForm.values,
    user: nextState.main_data.user,
    localCountries: nextState.main_data.localCountries
  }
}

export default compose(
  reduxForm({
    form: 'ExpenseDataForm',
    enableReinitialize: true,
  }), connect(mapStateToProps, mapDispatchToProps)
)(AddExpensePage);