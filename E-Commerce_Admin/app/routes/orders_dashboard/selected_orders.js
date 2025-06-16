import React, { useState } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import DateNaknadno from './date_naknadno.js';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '7%',
    left                  : '17%',
    right                 : '17%',
    bottom                : '15%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

const SelectedOrders = ({ closeSelectedOrdersModal, clearSelectedOrders, changeSelectedOrdersStatus, change_selected_orders, printInvoices, printInvoicesKnjizara, printPreInvoices, printPS, printPC, printGLS, printZasilkovna, printExpedico, printCustomList, printStornoList, printTaxList, printThankYou, selected_orders, addColor, nextStatusSelected, colors, selectedOrdersModal }) => {

  const [selectedStatus, setselectedStatus] = useState(null)
  const [openColor, setopenColor] = useState(false)
  const [naknadnoModal, setnaknadnoModal] = useState(false)
  const [change_status, setchange_status] = useState(null)

  const closeModal = () => {
    closeSelectedOrdersModal();
    clearSelectedOrders();
  }

  const changeStatus = (event) => {
    setselectedStatus(event.value);
    if(event.value == "Naknadno") {
      openNaknadnoModal();
      setchange_status(event.value)
    } else {
      changeSelectedOrdersStatus(event.value, null, 0);
    }
  }

  const openNaknadnoModal = () => {
    setnaknadnoModal(true);
  }

  const closeNaknadnoModal = () => {
    setnaknadnoModal(false);
  }

  const EditDateNaknadno = (obj) => {
    changeSelectedOrdersStatus(change_status, obj, 0)
    closeNaknadnoModal();
  }

  const _change_selected_orders = (event) => {
    change_selected_orders(event);
    closeModal();
  }

  const _printInvoices = () => {
    printInvoices();
  }

  const _printInvoicesKnjizara = () => {
    printInvoicesKnjizara();
  }

  const _printPreInvoices = () => {
    printPreInvoices();
  }

  const _printPS = () => {
    printPS();
  }

  const _printPC = () => {
    printPC();
  }

  const _printGLS = () => {
    printGLS();
  }

  const _printZasilkovna = () => {
    printZasilkovna();
  }

  const _printExpedico = () => {
    printExpedico();
  }

  const _printCustomList = () => {
    printCustomList();
  }

  const _printTaxList = () => {
    printTaxList();
  }

  const _printStornoList = () => {
    printStornoList();
  }

  const _printThankYou = () => {
    printThankYou();
  }

  const openColors = () => {
    setopenColor(!openColor)
  }

  const changeOrdersColor = (color) => () => {
    var orders_ids = selected_orders.map(os => {return os.id});

    addColor(orders_ids, color, 0);
    setopenColor(false)
  }

  var selected_order = selected_orders.map(o => {
    return {value: o.order_id2, label: o.order_id2}
  })



  var next_status = nextStatusSelected.next_statuses && nextStatusSelected.next_statuses.map(ns => {
    return {value: ns, label: ns}
  }) || [];

  return (
    <div>
      <Modal
      isOpen={selectedOrdersModal}
      contentLabel="new-customer-prof Modal"
      onRequestClose={closeModal}
      ariaHideApp={false}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={closeModal} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center">Izbrana naročila</h2>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-md-12 margin-bottom-big">
              <Select
                className="form-white"
                name=""
                placeholder="Ni izbranih naročil"
                value={selected_order}
                onChange={_change_selected_orders}
                options={[]}
                multi={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 logistics-col">
            <h4>Logistika</h4>
              <div>
                <button onClick={_printInvoices} className="btn btn-secondary">Prenesi račune</button>
              </div>
              <div>
                <button onClick={_printPreInvoices} className="btn btn-secondary">Prenesi predračune</button>
              </div>
              <div>
                <button onClick={_printThankYou} className="btn btn-secondary">Thank you letter</button>
              </div>
              <div>
                <button onClick={_printZasilkovna} className="btn btn-secondary">Izvozi Excel za Zasilkovno</button>
              </div>
              <div>
                <button onClick={_printExpedico} className="btn btn-secondary">Izvozi Excel za Expedico</button>
              </div>
              <div>
                <button onClick={_printGLS} className="btn btn-secondary">Izvozi Excel za GLS</button>
              </div>
              <div>
                <button onClick={_printPS} className="btn btn-secondary">Izvozi Excel za Pošta</button>
              </div>
              <div>
                <button onClick={_printPC} className="btn btn-secondary">Izvozi Excel za Hrvatska Pošta</button>
              </div>
              <div>
                <button onClick={_printCustomList} className="btn btn-secondary">Izvozi Excel seznam - basic</button>
              </div>
              <div>
                <button onClick={_printStornoList} className="btn btn-secondary">Izvozi Excel seznam - storno</button>
              </div>
              <div>
                <button onClick={_printTaxList} className="btn btn-secondary">Izvozi Excel seznam - davčna</button>
              </div>
              <div>
                <button onClick={_change_selected_orders} className="btn btn-secondary">Počisti izbrana naročila</button>
              </div>
              <div>
                <button onClick={_printInvoicesKnjizara} className="btn btn-secondary">Prenesi račune - Knjižara</button>
              </div>
            </div>
            <div className="col-md-4 status-col">
            <h4>Statusi naročil</h4>
              <Select
                className="form-white"
                name=""
                placeholder="Spremeni status..."
                onChange={changeStatus}
                value={selectedStatus}
                options={next_status}
                multi={false}
              />
            </div>
            <div className="col-md-4 color-col">
              <h4>Barve naročil</h4>
              <div>
                <a onClick={openColors} className="pointer">
                  <i className="s-colors-c color-font new-color-icon fas fa-th show color_sign_size cursor_style flag_icon_dashboard-flag"></i>
                </a>
                <div className={`color-picker-newest pick-color-litle1 pick-color-margin ${openColor ? 'show' : 'hidden'}`}>
                  <ul>
                    {colors.map((color, index)=>
                      {
                        return(
                          <li onClick={changeOrdersColor(color)} key={index} style={{backgroundColor: color.value}}></li>
                        );
                      }
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {naknadnoModal ? <DateNaknadno closeNaknadnoModal={closeNaknadnoModal} status={change_status} naknadnoModal={naknadnoModal} EditDateNaknadno={EditDateNaknadno}/> : ""}
    </div>
  );
}

export default SelectedOrders;
