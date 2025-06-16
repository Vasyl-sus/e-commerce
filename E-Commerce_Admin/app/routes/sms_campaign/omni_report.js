import React from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'react-modal';
import Moment from 'moment';
import 'react-select/dist/react-select.css';
import { showCustomerData } from '../../actions/customer_profile_actions';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '15%',
    left                  : '15%',
    right                 : '15%',
    bottom                : '15%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const OmniReport = (props) => {
  const { reports, selectedMessage } = props;
  const dispatch = useDispatch();

	const closeModal = () => {
		props.closeReportModal();
	}

  const customerDetails = (id) => () => {
    dispatch(showCustomerData(id));
    window.open('customer_profiles');
  }

  const renderReports = (report, index) => {
    return (
      <tr key={index}>
        <td>{report.first_name} {report.last_name}</td>
        <td>{report.telephone}</td>
        <td className="center">{report.channel}</td>
        <td className="center">{Moment(report.date_created).format('DD. MM. YYYY')}</td>
        <td className="center">{Moment(report.sentAt).format('DD. MM. YYYY')}</td>
        <td className="center">{report.status.name || report.status}</td>
        <td>{report.status_description || report.status.description}</td>
        <td>{report.error_name || report.error.name}</td>
        <td className="center"><span onClick={customerDetails(report.customer_id)} className="fas fa-user pointer"></span></td>
      </tr>
    )
  }

  return (
    <Modal
    isOpen={props.reportModal}
    contentLabel="new-customer-prof Modal"
    onRequestClose={closeModal}
    ariaHideApp={false}
    style={otherModalStyles}>
      <div className="pointer text-right"><i onClick={closeModal} className="fas fa-times"/></div>
      <header className={`confirm_box clearfix`}>
        <h2 className="center mb-3">SMS Campaign report - {selectedMessage.name}</h2>
      </header>
      <table className="table table-striped">
       <thead>
         <tr>
           <th className="left table-pad-l-8">Ime in priimek</th>
           <th className="left table-pad-l-8">Telefonska številka</th>
           <th className="center table-pad-l-8">Kanal</th>
           <th className="center table-pad-l-8">Datum kreiranja</th>
           <th className="center table-pad-l-8">Datum pošiljanja</th>
           <th className="center table-pad-l-8">Status</th>
           <th className="left table-pad-l-8">Opis</th>
           <th className="left table-pad-l-8">Napaka</th>
           <th className="center table-pad-l-8">Stranka</th>
         </tr>
       </thead>
       <tbody>
         {reports.map(renderReports)}
       </tbody>
      </table>
    </Modal>
  )
}

export default OmniReport;
