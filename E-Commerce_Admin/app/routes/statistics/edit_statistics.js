import React, {Component} from 'react';
import Modal from 'react-modal';
import { Field, reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import moment from 'moment';
import {connect} from 'react-redux';


import { getDataByLang } from '../../actions/expense_configurator_actions.js'


const otherModalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    padding               : '30px 30px 80px',
    width                 : '700px',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    overflow              : 'visible',
    minWidth              : '25%',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class EditStat extends Component {
	constructor(props) {
    super(props)
		this.state = {
      choosenExpense:{}, startDateFrom:new Date()
    };
	}

  componentDidMount() {
  }

	closeModal() {
		this.props.closeModal();
	}

  renderAdditional(details, key, index){
    return(
      <div key={index}>
        <div key={index}>
          <div className="flex">
            <span>{key}: </span>
            <Field
            name={key}
            component={renderField}
            type='text'
            value={details[key]==null ? '':details[key]}
            />
          </div>
        </div>
      </div>
    );
  }

  addExpense(data){
    var dataToSend = {};
    data = data.toJS();
    dataToSend.expense_value = parseFloat(data.value);
    dataToSend.date_added = moment(this.props.inputDate).format('YYYY-MM-DD');
    dataToSend.expense_id = data.expense_id;
    dataToSend.additional_data = data.additional_data || {};
    // dataToSend.countries = [data.country]
    dataToSend.id = data.id
    console.log(data)
    this.props.editStat(dataToSend);
  }

	render() {
    const { handleSubmit, initialValues } = this.props;

    var values = initialValues && initialValues.toJS();

		return (
			<Modal
        isOpen={this.props.isOpen}
        style={otherModalStyles}
        contentLabel="new-customer-prof Modal"
        onRequestClose={this.closeModal.bind(this)}>
        <header>
          <h2>Urejanje stroška {values.name}</h2>
        </header>
        <div className="p-3">
          <h4 className="m-t-30">Vnesi podatke</h4>
          <form onSubmit={handleSubmit(this.addExpense.bind(this))}>
            <div className="row sp-bet new-exp-modal-f">
              <div className="col-lg-4 col-md-6 sp-bet">
                <div>
                  <label>Znesek</label>
                  <Field
                  name='value'
                  component={renderField}
                  type='text'
                  place="Vnesi znesek v EUR"
                  />
                </div>
                <button className="pointer new-btn-add-stat" ref={ref => {this.btn = ref}} type="submit"><i className="fa fa-floppy-o" aria-hidden="true"></i>POTRDI</button>
              </div>
            </div>
          </form>
        </div>
        <span className={`modal_close_btn`} onClick={this.closeModal.bind(this)}></span>
      </Modal>
		);
	}
}

  const renderField = ({ input, field, ref, label, value, inputclass, place, type, meta: { touched, error, warning } }) => (
    <input type={type} placeholder={place} value={value} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} form-control`} />
  )


const mapDispatchToProps = (dispatch) => {
  return {
    getDataByLang: (lang) => { dispatch(getDataByLang(lang)) },
    //addExpenseToBase: (data) => { dispatch(addExpenseToBase(data)) }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    data_expenses: nextState.expense_configurator.data_expenses_stat
  }
}

export default compose(
  reduxForm({
    form: 'EditStatForm',
    enableReinitialize: true,
    // validate
  }), connect(mapStateToProps, mapDispatchToProps)
)(EditStat);
