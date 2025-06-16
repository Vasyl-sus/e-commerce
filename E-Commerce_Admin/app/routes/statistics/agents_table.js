import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

class AgentTable extends Component {
    constructor(props) {
      super(props);

      this.state = {};
    }

    componentDidMount()
    {

    };

    renderAdmins(admin, index){
      return(
        <tr key={index}>
          <td>{admin.first_name} {admin.last_name}</td>
          <td>{admin.username}</td>
          <td>{admin.email}</td>
          <td className={`right`}>
            <button type="submit" className="btn btn-secondary btn-sm"><Link to={{pathname: '/agent_statistics', query: {agent_id: admin.id}}}>POGLEJ</Link></button>
          </td>
        </tr>
      )
    }

    render(){
      const {admins} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12 ">
              <h2 className="box-title">Seznam agentov</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head table-cust table-striped table-responsive no-bottom-border">
              <table className="table">
                <thead>
                  <tr>
                    <th className="left table-pad-l-8">Ime in priimek</th>
                    <th className="left table-pad-l-8">Uporabniško ime</th>
                    <th className="left table-pad-l-8">E-pošta</th>
                    <th className="center table-pad-l-8 right"></th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(this.renderAdmins.bind(this))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }
 }

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    admins: nextState.main_data.admins
  }
}

export default connect(mapStateToProps, null)(AgentTable);
