import React, { useState, useEffect } from 'react';
import Moment from 'moment';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import 'react-select/dist/react-select.css';
import { useSelector, useDispatch } from 'react-redux';
import { getOmniMessages, getOmniReport } from '../../actions/sms_campaign_actions';
import { selectMessages, selectMessagesCount, selectReports } from "./selectors";
import OmniReport from './omni_report';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);

const SMSCampaigns = (props) => {
  const dispatch = useDispatch();
  var dateFrom = new Date(new Date().getTime() - 2592000000)
  var dateTo = new Date(new Date().getTime() + 86400000)

  dateFrom.setHours(0);
  dateFrom.setMinutes(0);

  dateTo.setHours(23)
  dateTo.setMinutes(59)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageLimit, setPageLimit] = useState(15);
  const [startDateFrom, setStartDateFrom] = useState(dateFrom);
  const [startDateTo, setStartDateTo] = useState(dateTo);
  const [reportModal, setReportModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState({})

  const messages = useSelector(selectMessages)
  const messagesCount = useSelector(selectMessagesCount)
  const reports = useSelector(selectReports)

  const mountFunction = () => {
    var location = browserHistory.getCurrentLocation();

    if(location.query.pageLimit)
      setPageLimit(location.query.pageLimit)
    else
      location.query.pageLimit = 15;

    if(location.query.pageNumber)
      setPageNumber(location.query.pageNumber)
    else
      location.query.pageNumber = 1;

    if(location.query.from_date)
      setStartDateFrom(new Date(parseInt(location.query.from_date)));
    else
      location.query.from_date = startDateFrom.getTime();

    if(location.query.to_date)
      setStartDateTo(new Date(parseInt(location.query.to_date)));
    else
      location.query.to_date = startDateTo.getTime();

    browserHistory.replace(location);
    dispatch(getOmniMessages());
  }

  useEffect(mountFunction, [])

  const pageChange = (page) => {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = page;
    browserHistory.replace(location);
    setPageNumber(page);
    dispatch(getOmniMessages());
  }

  const renderSingleMessages = (message, index) => {
    return (
      <tr key={index}>
        <td>{message.name}</td>
        <td>{Moment(message.date_added).format('DD-MM-YYYY')}</td>
        <td className="center">
          <span onClick={toggleReportModal(message)} className="fas fa-clone pointer"></span>
        </td>
      </tr>
    )
  }

  const handleChangeStart = (dates) => {
    let location = browserHistory.getCurrentLocation();
    var dateFrom = new Date(dates[0]);
    var dateTo = dates[1] ? new Date(dates[1]) : null;
  
    dateFrom.setHours(0);
    dateFrom.setMinutes(0);
  
    if (dateTo) {
      dateTo.setHours(23);
      dateTo.setMinutes(59);
    }
  
    location.query.from_date = dateFrom.getTime();
    location.query.to_date = dateTo ? dateTo.getTime() : null; 
  

    setStartDateFrom(dateFrom);
    setStartDateTo(dateTo)
    if (dateTo) {
      browserHistory.replace(location);
      dispatch(getOmniMessages());
    }
  }

  const toggleReportModal = (message) => () => {
    setReportModal(!reportModal)
    setSelectedMessage(message)
    if(message && message.bulkId) {
      dispatch(getOmniReport(message.bulkId));
    }
  }

  return (
    <div className="content-wrapper container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h2 className="box-title">SMS Campaigns</h2>
        </div>
      </div>
      <div className="box box-default">
        <div className="row main-box-head">
          <div className="col-md-12">
            <div className="mb-3">
              <DatePicker
              selected={startDateFrom}
              onChange={handleChangeStart}
              startDate={startDateFrom}
              endDate={startDateTo}
              selectsRange
              dateFormat="dd.MM.yyyy"
              placeholderText="Izberi obdobje"
              maxDate={dateMax}
              className="multi-dateinput"
              locale="sl"
              showIcon
            />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive no-padding">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="left table-pad-l-8">Ime</th>
                    <th className="left table-pad-l-8">Datum</th>
                    <th className="center table-pad-l-8">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(renderSingleMessages)}
                </tbody>
              </table>
            </div>
            <div className="box-footer w-100 pb-3">
              <div className="row w-100">
                <div className="col-sm-6 col-xs-8 w-100">
                  <div className="pagination-block">
                    <Pagination defaultPageSize={parseInt(pageLimit)} defaultCurrent={parseInt(pageNumber)} onChange={pageChange} total={messagesCount}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {reportModal && <OmniReport reportModal={reportModal} reports={reports} selectedMessage={selectedMessage} closeReportModal={toggleReportModal(null)}/>}
    </div>
  )
}
export default SMSCampaigns;
