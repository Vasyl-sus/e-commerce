import React, {Component} from 'react';
import {connect} from 'react-redux';
import { ROOT_URL } from '../../config/constants';
import { toggleMenu } from '../../actions/notifications_actions.js';

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {};
  }


  signOut() {
    this.props.signoutUser();
  }

  toggleMenu() {
    let menuState = localStorage.getItem("menuState")

    if (!menuState) {
      menuState = "closed";
    } else {
      if (menuState === "closed") {
        menuState = "open";
      } else {
        menuState = "closed";
      }
    }
    localStorage.setItem("menuState", menuState)
    this.props.toggleMenu(menuState)
  } 

  render() {
    return (
        <header className="main-header">
          {/* <nav className="navbar navbar-static-top" role="navigation">
            <a href="#" className="sidebar-toggle" onClick={this.toggleMenu.bind(this)} role="button">
              <span className="sr-only">Toggle navigation</span>
            </a>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li className="dropdown messages-menu">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                    <span className="glyphicon glyphicon-log-out"></span> Odjava
                  </a>
                </li>
              </ul>
            </div>
          </nav> */}
        </header>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
    toggleMenu: (menuState) => {
      dispatch(toggleMenu(menuState))
    }
	}
}

export default connect(null, mapDispatchToProps)(Header);
