import React, {Component} from 'react';

class Pharmacies extends Component {
    constructor(props) {
      super(props);

      this.state = {};
    }

    render(){

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Seznam lekarn</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row table-cust table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="left table-pad-l-8">Naziv</th>
                    <th className="left table-pad-l-8">Naslov</th>
                    <th className="center table-pad-l-8">Nov račun</th>
                    <th className="center table-pad-l-8">Nova konsignacija</th>
                    <th className="center table-pad-l-8">Pregled naročil</th>
                    <th className="center table-pad-l-8">Uredi</th>
                    <th className="center table-pad-l-8">Izbriši</th>
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


export default (Pharmacies);
