import React, {useState} from 'react';
import Modal from 'react-modal';
import { reduxForm } from 'redux-form/immutable';
import {compose} from 'redux';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
import { format } from 'date-fns';
registerLocale('sl', sl);


const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '30%',
    left                  : '30%',
    right                 : '30%',
    bottom                : '30%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const DateNaknadno = ({ reset, closeNaknadnoModal, handleSubmit, naknadnoModal, EditDateNaknadno }) => {
	const [dateNaknadno, setdateNaknadno] = useState(new Date())

	const editDateNaknadno = (obj) => {
    obj = obj.toJS();
    obj.date_naknadno = format(dateNaknadno, 'yyyy-MM-dd HH:mm:ss');
    EditDateNaknadno(obj);
	}

	const closeModal = () => {
    reset();
		closeNaknadnoModal();
	}

  const handleDateChange = (dateNaknadno) => {
    setdateNaknadno(dateNaknadno)
  }

  return (
    <Modal
    isOpen={naknadnoModal}
    ariaHideApp={false}
    contentLabel="new-customer-prof Modal"
    onRequestClose={closeModal}
    style={otherModalStyles}>
      <div className="pointer text-right"><i onClick={closeModal} className="fas fa-times"/></div>
      <header className={`confirm_box clearfix`}>
        <h2 className="center">Dodaj naknadni datum pošiljanja</h2>
      </header>
      <form onSubmit={handleSubmit(editDateNaknadno)} >
        <div className={`modal-body row`}>
          <div className={`col-lg-6`}>
            <label className="form-label mb-1">Sprememba status naročila v:</label><br/>
            <span>{status}</span>
          </div>
          <div className={`col-lg-6`}>
            <label className="form-label">Naknadni datum</label><br/>
            <DatePicker
              selected={dateNaknadno}
              onChange={handleDateChange}
              minDate={new Date(2017, 1, 1)}
              maxDate={dateMax}
              dateFormat="dd.MM.yyyy"
              className="single-dateinput"
              locale="sl"
            />
          </div>
        </div>
        <div className={`modal-footer row`}>
          <button type="submit" className="btn btn-primary">SHRANI</button>
        </div>
      </form>
    </Modal>
  );
}


export default compose(
  reduxForm({
    form: 'DateNaknadnoForm',
    enableReinitialize: true
  })
)(DateNaknadno);
