import React, {Component} from 'react';

class PharmaciesOrders extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render(){

    return (
      <div className="content-wrapper container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2 className="box-title">Pregled naročil</h2>
          </div>
        </div>
        <div className="box box-default">
          <div className="row table-cust table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="left table-pad-l-8">ŠT. DOKUMENTA</th>
                  <th className="left table-pad-l-8">TIP DOKUMENTA</th>
                  <th className="left table-pad-l-8">DATUM DOKUMENTA</th>
                  <th className="left table-pad-l-8">POSLOVNI PARTNER</th>
                  <th className="left table-pad-l-8">ZNESEK</th>
                  <th className="left table-pad-l-8">STATUS PLAČILA</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
            <div className="box-footer w-100">
              <div className="row w-100">
                <div className="col-sm-6 col-xs-8 w-100">
                  <div className="pagination-block">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default (PharmaciesOrders);
