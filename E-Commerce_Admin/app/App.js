import React, {Component} from 'react';
import {connect} from 'react-redux';

import "rc-pagination/assets/index.css";

import Swal from 'sweetalert2';
import Nav from './components/Nav/Nav.js';
import Header from './components/Header/Header.js';
import Loading from './components/Loading/loading.js';
import { get_languages, getInitData} from './actions/main_actions';

export function createNotification(type, text) {
  switch (type) {
    case 'info':
      Swal.fire({
         toast: true,
         position: 'top-end',
         icon: 'info',
         title: `${text}`,
         showConfirmButton: false,
         timer: 5000,
         timerProgressBar: true,
         background: '#AED6F1',
         iconColor: '#1F618D'
       })
    break;
    case 'success':
     Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${text}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#ABEBC6',
        iconColor: '#145A32'
      })
    break;
    case 'warning':
      Swal.fire({
         toast: true,
         position: 'top-end',
         icon: 'warning',
         title: `${text}`,
         showConfirmButton: false,
         timer: 5000,
         timerProgressBar: true,
         background: '#FAD7A0',
         iconColor: '#9C640C'
       })
    break;
    case 'error':
      Swal.fire({
         toast: true,
         position: 'top-end',
         icon: 'error',
         title: `${text}`,
         showConfirmButton: false,
         timer: 5000,
         timerProgressBar: true,
         background: '#F5B7B1',
         iconColor: '#641E16'
       });
    break;
  }
}

export function errorNotification(error_msg) {
  var error = "";
  if(Array.isArray(error_msg)) {
    if(error_msg[0].keyword == "additionalProperties") {
      error = "<div>" + "Error: " + error_msg[0].message + " - " + error_msg[0].params.additionalProperty + "</div>";
    } else if (error_msg[0].keyword == "type") {
      error = "<div>" + "Error: " + error_msg[0].dataPath + " - " + error_msg[0].message + "</div>";
    } else if (error_msg[0].keyword == "required") {
      error = "<div>" + "Error: " + error_msg[0].message + "</div>";
    } else if (error_msg[0].keyword == "format") {
      error = "<div>" + "Error: " + error_msg[0].message + "</div>";
    } else if (error_msg[0].keyword == "minItems") {
      error = "<div>" + "Error: " + error_msg[0].dataPath + " - " + error_msg[0].message + "</div>";
    } else {
      error = "<div>" + JSON.stringify(error_msg[0]) + "</div>";
    }
  } else {
    error = "<div>" + error_msg + "</div>";
  }
  createNotification('error', error);
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      socket: null, resp:false
    }

  }

  componentWillMount() {
      this.props.get_languages();
      this.props.getInitData()

    if(window.innerWidth<769){
      setTimeout(() => {
        this.setState({resp:true})
      }, 1000);
    }
  };

  render() {
    const { user, menuState } = this.props

    return(
      <div className={`fix-sidebar ${menuState === "closed" ? "sidebar-collapse" : ""}`}>
        <Loading />
        <Header />
        <Nav user={user}/>
        {this.state.resp && <div><button data-toggle="push-menu" role="button" className="pointer fa fa-bars toggle-btn black-btn" ref="toggle"></button></div>}
        {this.props.children && React.cloneElement(this.props.children, {socket: this.state.socket})}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    get_languages: () => {
      dispatch(get_languages());
    },
    getInitData: () => {
      dispatch(getInitData())
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();

  return {
    user: nextState.main_data.user,
    menuState: nextState.notifications_data.menuState
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
