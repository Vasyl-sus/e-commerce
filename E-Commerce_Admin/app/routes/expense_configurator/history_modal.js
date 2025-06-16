import React, {Component} from 'react';
import Modal from 'react-modal';
import Moment from 'moment';

const otherModalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    padding               : '30px',
    width                 : '50%',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    overflow              : 'auto',
    minWidth              : '25%',
    boxShadow             : '0px 0px 28px 10px #333',
    maxHeight             : '70%'
  }
};

class HistoryModal extends Component {
  constructor(props) {
    super(props)

    this.state = {};
  }

  closeModal() {
    this.props.closeHistory();
  }

  renderData(data, row, index){

    if(typeof data[row] != 'object'){
      return(
          <div key={index}>
            <b>{row}:</b> {data[row]}
          </div>
      )
    }
    else{
      if(Array.isArray(data[row])){
        return(
            <div key={index}>
              <b>{row}:</b> {data[row].map((item,i) => <span key={i}>{item}, </span>)}
            </div>

        )
      }
      else{
        var length = data[row] && Object.keys(data[row]).length || 0;
        var obj = data[row];
        if(length>0){
          return(
            <div key={index}>
              <b>{row}:</b> {Object.keys(obj).map((item,i) => <span key={i}>{item}: {obj[item]}, </span>)}
            </div>
          )
        }
      }
    }
  }

  renderTable(row,index){
    return(
      <tr key={index}>
        <td>{Moment (row.date_added).format("DD. MM. YYYY, HH:mm")}</td>
        <td>{row.agent}</td>
        <td className="w-50">{row.data && Object.keys(row.data).map(this.renderData.bind(this,row.data))}</td>
      </tr>
    )
  }

  render() {

    return (
      <Modal
      isOpen={this.props.newModal}
      style={otherModalStyles}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <header>
          <h2 className="align-center">Zgodovina</h2>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Agent</th>
              <th>Spremembe</th>
            </tr>
          </thead>
          <tbody>
            {this.props.history && this.props.history.map(this.renderTable.bind(this))}
          </tbody>
        </table>
        <span className={`modal_close_btn`} onClick={this.closeModal.bind(this)}></span>
      </Modal>
    );
  }
}

export default HistoryModal;
