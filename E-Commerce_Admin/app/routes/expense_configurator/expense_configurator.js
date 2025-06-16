import React, {Component} from 'react';
import { browserHistory} from 'react-router';
import {connect} from 'react-redux';
import 'react-select/dist/react-select.css';
import NewExpenseForm from './new_expenseForm.js';
import {createNotification} from '../../App.js'
import EditExpenseForm from './edit_expenseForm.js';
import HistoryModal from './history_modal.js';

import { getDataByLang, openNewExpense, openEditExpense, deleteExpense, getHistory } from '../../actions/expense_configurator_actions.js'

class ExpenseConfigurator extends Component {
    constructor(props) {
      super(props);

      this.state = {
        activeCountry : null,
        category: null,
        title: null,
        initialValues:null,
        editOpen:false,
        historyOpen:false
      };
    }

    componentDidMount() {
      this.props.getDataByLang();
      this.props.getHistory();
    };

    newExpense(category, title){
      this.props.openEditExpense(false);
      this.setState({editOpen:false})
      this.props.openNewExpense(true);
      this.setState({category})
      this.setState({title})
    }

    openHistory(){
      this.setState({historyOpen:true})
    }

    closeHistory(){
      this.setState({historyOpen:false})
    }

    editExpense(initialValues){
      if(this.state.editOpen==false || this.props.editExpenseOpen == false){
        var tmp1 = initialValues;
        var tmpA = [];

        for(var field in tmp1.additional_fields){
          var tmpO = {};
          tmpO.content = field;
          tmpA.push(tmpO);
        }
        var tmp
        if (initialValues.billing_type == 'gift') {
          tmp = initialValues.gifts;
          initialValues.gifts = [];
          tmp.map(g => {
            initialValues.gifts.push({label: g.name, value: g.id})
          })
        } else if (initialValues.billing_type == 'deliverymethod') {
          tmp = initialValues.deliverymethods;
          initialValues.deliverymethods = [];
          tmp.map(d => {
            initialValues.deliverymethods.push({label: d.code, value: d.id})
          })
        } else if (initialValues.billing_type == 'accessory') {
          tmp = initialValues.accessories;
          initialValues.accessories = [];
          tmp.map(a => {
            initialValues.accessories.push({label: a.name, value: a.id})
          })
        } else {
          tmp = initialValues.products;
          initialValues.products = [];
          tmp.map(p => {
            initialValues.products.push({label: p.name, value: p.id})
          })
        }

        initialValues.additional_fields = tmpA;

        this.setState({initialValues})
        this.setState({editOpen:true})
        this.props.openNewExpense(false);
        this.props.openEditExpense(true);
      }
      else{
        createNotification('warning','Ste v načinu nastavljanja stroška, zato najprej shranite spremembe oz. zaprite podokno. ')
      }
    }

    closeNewExpense(){
      this.props.openNewExpense(false);
    }

    closeEditExpense(){
      this.props.openEditExpense(false);
      this.setState({editOpen:false})
    }

    setCountry(event) {
      this.setState({activeCountry: event})
      var location = browserHistory.getCurrentLocation();
      location.query.country = event.value;
      browserHistory.replace(location);
      this.props.getDataByLang();
      this.props.getHistory();
      this.closeNewExpense();
      this.closeEditExpense();
    }

    DeleteExpense(data) {
      if(window.confirm("Ali ste sigurni da hočete izbrisati strošek?"))
        this.props.deleteExpense(data.id, this.state.activeCountry)
    }

    renderSections(data, index){
      return(
        <div className="col-md-2" key={index}>
          <h5 className="m-t-30">{data.title}</h5>
          {data.content.map(this.renderSubSections.bind(this))}
          <button className="btn btn-primary btn-sm m-t-20" onClick={this.newExpense.bind(this, data.category, data.title)}>Dodaj</button>
        </div>
      )
    }

    renderSubSections(data, index){
      return(
        <div className="expense-div d-flex justify-content-between align-items-center" key={index}>
          <div className="p-2">
            {data.name}
          </div>
          <div className="p-2">
            <button className="btn btn-icon btn-sm btn-set" onClick={this.editExpense.bind(this, data)}><i className="fa fa-edit" aria-hidden="true"></i></button>
            <button className="btn btn-icon btn-sm btn-delete" onClick={this.DeleteExpense.bind(this, data)}><i className="fa fa-trash" aria-hidden="true"></i></button>
          </div>
        </div>
      )
    }

    render(){
      const { data_expenses, newExpenseOpen, editExpenseOpen } = this.props;

      return(
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Konfigurator stroškov</h2>
            </div>
          </div>
          <div className="box box-default pb-4">
            <div className="row main-box-head">
              <div className="col-md-2">
                <button onClick={this.openHistory.bind(this)} className="btn btn-primary btn-lg ml-2 mt-2"><i className="fa fa-history" aria-hidden="true"></i> ZGODOVINA</button>
              </div>
            </div>
            <div className="row">
              {data_expenses.map(this.renderSections.bind(this))}
            </div>
            <div className="row">
              <div className={`configurator-div col-md-12 flex sliderNew ${(newExpenseOpen) ? '' : 'closed'}`}>
                <div className="exit-conf pointer" onClick={this.closeNewExpense.bind(this)}><i className="fa fa-times" aria-hidden="true"></i></div>
                {newExpenseOpen ? <NewExpenseForm category={this.state.category} title={this.state.title} /> : ''}
              </div>
              <div className={`configurator-div col-md-12 flex sliderNew ${(editExpenseOpen) ? '' : 'closed'}`}>
                <div className="pointer exit-conf" onClick={this.closeEditExpense.bind(this)}><i className="fa fa-times" aria-hidden="true"></i></div>
                {editExpenseOpen ? <EditExpenseForm initialValues={this.state.initialValues} closed={this.state.editOpen}/> : ''}
              </div>
            </div>
          </div>
          {this.state.historyOpen && <HistoryModal newModal={this.state.historyOpen} history={this.props.history} closeHistory={this.closeHistory.bind(this)}/>}
        </div>
      );
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getDataByLang: () => { dispatch(getDataByLang()) },
    openNewExpense: (bool) => { dispatch(openNewExpense(bool)) },
    openEditExpense: (bool) => { dispatch(openEditExpense(bool)) },
    deleteExpense: (id, country) => { dispatch(deleteExpense(id, country)) },
    getHistory: () => {dispatch(getHistory())}
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    data_expenses: nextState.expense_configurator.data_expenses,
    newExpenseOpen:nextState.expense_configurator.newExpenseOpen,
    editExpenseOpen:nextState.expense_configurator.editExpenseOpen,
    countries: nextState.main_data.countries,
    user: nextState.main_data.user,
    localCountries: nextState.main_data.localCountries,
    history: nextState.expense_configurator.history
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpenseConfigurator);
