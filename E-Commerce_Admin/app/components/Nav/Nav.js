import React, {Component} from 'react';
import {Link, browserHistory} from 'react-router';
import { ROOT_URL } from '../../config/constants'
import {connect} from 'react-redux';
import {logout_user} from '../../actions/main_actions.js';
import { getNotification, pushNotification, markReadNotification, toggleMenu } from '../../actions/notifications_actions.js';
import InfiniteScroll from "react-infinite-scroll-component";
import Moment from 'moment';

class Nav extends Component {
  constructor(props) {
    super(props)

    var statisticsRoutes = ['/order_statistics', '/call_center_statistics', '/agent_statistics', '/agents', '/daily_statistics', '/monthly_statistics']
    var dashboardRotues = ['/dashboard', '/customer_profiles', '/customers_bd', '/customers_oto', '/customers_baza', '/order_details', '/influencers', '/influencer_orders']
    var configRoutes = ['/add_edit', '/expense_configurator', '/languages', '/blog', '/testimonials', '/reviews']
    var pharmaciesRoutes = ['/pharmacies', '/pharmacies_orders']
    var activeTab = 0;
    if (dashboardRotues.includes(location.pathname)) {
      activeTab = 1
    } else if (statisticsRoutes.includes(location.pathname)) {
      activeTab = 2
    } else if (pharmaciesRoutes.includes(location.pathname)) {
      activeTab = 5
    } else {
      activeTab = 3
    }

    this.state = {activeTab, active:false, showNotifications: false, hasMore:true}
  }

  componentDidMount(){
    browserHistory.listen( location =>  {
     if(document.body.classList.contains('sidebar-open')){
        document.body.classList.remove('sidebar-open');
      }
    });

  }

  setActiveTab(activeTab) {
    this.setState({activeTab})
  }

  componentWillMount() {
    if(this.props.socket){
      this.supplyInfo(this.props.socket);
    }

    if(localStorage.getItem('user')){
      var user = JSON.parse(localStorage.getItem('user'));
      this.props.getNotification(user.adminGroup.name,0);
    }
  }

  logout(token, id) {
    if(this.props.socket){
      this.props.logout_user(token, this.props.socket, id);
    } else {
      this.props.logout_user(token, this.props.socket, id);
    }
  }

  supplyInfo(socketListener){
    if(socketListener){
      socketListener.on('emitSupplyInfo', function(data){
        this.props.pushNotification(data);
      });
    }
  }

  detailsShow(notification){
    this.setState({details : !this.state.details})
    !this.state.details ? this.setState({notificationDetail: notification}) : this.setState({notificationDetail: null});
  }

  clickedNotif(notif){
    this.detailsShow(notif);
    if(notif.seen==0)
      this.props.markReadNotification(notif.id);
  }

  renderSingleNotificaton(notification, index){
    return(
      <div key={index} className={`notification-single ${(notification.seen == 0) ? 'unread' : ''} mx-2 flex`} onClick={this.clickedNotif.bind(this, notification)}>
       {/* <td onClick={() => {this.detailsShow.bind(this, notification); this.props.markReadNotification(notification.id)}}></td>*/}
        <div className="notif-title">{notification.type == 'stockReminder_notification' ? 'Primanjkuje produktov!' : 'notification.type'}</div>
        <div className="notif-chev text-right"><i className="fa fa-chevron-right" aria-hidden="true"></i></div>

      </div>
    )
  }

  fetchMoreData() {
        setTimeout(() => {
          var fr = this.state.from + 5;
          this.setState({from:fr})
          var user = JSON.parse(localStorage.getItem('user'));
          this.props.getNotification(user.adminGroup.name,fr);
          setTimeout(() => {
            if (this.props.notifications.length == this.props.allNotificationsCount) {
              this.setState({ hasMore: false });
              return;
            }
          }, 1000);
        }, 500);
  };

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

  toggleClass () {

  }

  render() {
    const { user, notifications } = this.props;
    const token = this.props.user.token;
    const user_id = this.props.user.id;
    var location = browserHistory.getCurrentLocation();
    var call_center = user && user.adminGroup && (user.adminGroup.name === "Call center") || false;
    var marketing = user && user.adminGroup && user.adminGroup.permission_names.find(a => {return a == 'expense'}) || false;
    var super_admin = user && user.adminGroup && (user.adminGroup.name === "Super Admin") || false;


    return (
      <aside className="left-sidebar">
        <section className="sidebar">
          <div className="user-panel">
            <div className="d-flex align-items-center justify-content-between side-section">
              <div className="logo-width hidden-on">
              <img className="img-width" src="/images/admin/logo-black.svg" alt="Lux Factor Admin"/>
              </div>
              <div className="hamp-span">
                <button onClick={this.toggleMenu.bind(this)} data-toggle="push-menu" role="button" className="pointer fas fa-bars toggle-btn" ref="toggle"></button>
              </div>
            </div>
            <div className="side-section section-padding-l py-2">
              <p className="hidden-on no-bottom-margin"><b>{user.firstname} {user.lastname}</b></p>
              <p className="hidden-on smaller mt-1 mb-0">{user.adminGroup.name}</p>
            </div>

            <div className={`notifications-holder ${this.state.showNotifications?'opened':''}`}>
              <div className={`middle-wrap123 ${this.state.details ? 'animate-left123':''}`}>
                <div className="inner-wrap123">
                  <div className="text-right pb-3"><span className="pr-2 read-all-notif">Preberi vse</span></div>
                  <div className="notif-div">
                    {notifications &&
                      <InfiniteScroll
                        dataLength={this.props.allNotificationsCount}
                        next={this.fetchMoreData.bind(this)}
                        hasMore={this.state.hasMore}
                        loader={<img src='/images/admin/loadSmall.gif' className="loadSmall"/>}
                        height={200}
                      >
                      {notifications.map(this.renderSingleNotificaton.bind(this))}

                    </InfiniteScroll>
                    }
                  </div>
                </div>
                <div className="inner-wrap123">
                  {this.state.notificationDetail &&
                    <div>
                      <span className="ml-3 notif-date">{Moment (this.state.notificationDetail.date_created).format("DD. MM. YYYY")}</span>
                      <span onClick={this.detailsShow.bind(this,false)} className="fas fa-times pointer desno-iks pr-3"></span>
                      <div className="notif-content-title mt-3 ml-2 text-center">{this.state.notificationDetail.type == 'stockReminder_notification' ? 'Primanjkuje produktov!' : 'notification.type'}</div>
                      <div className="notif-content mx-3 mt-3">
                        {this.state.notificationDetail.content}
                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>

          </div>
          <ul className="sidebar-menu" data-widget="tree">
          { call_center || marketing || super_admin ? <li onClick={() => {this.setState({activeTab: 1})}} className={`${(this.state.activeTab == 1) ? 'active treeview' : ' treeview'} `} >
             <a href="#" >
                <i className="fas fa-shopping-cart"></i> <span className="pl-1">Naročila</span>
                <span className="pull-right-container">
                  <i className="fa fa-angle-left pull-right"></i>
                </span>
              </a>
              <ul className="treeview-menu">
                { call_center || marketing || super_admin ? <li className={`${(location.pathname == "/dashboard") ? 'active' : ''} `}>
                  <Link to="/dashboard">Naročila</Link>
                </li> : "" }
                { call_center || marketing || super_admin ? <li className={`${(location.pathname == "/customer_profiles") ? 'active' : ''} `}>
                  <Link to="/customer_profiles">Stranke</Link>
                </li> : "" }
                { call_center || super_admin ? <li className={`${(location.pathname == "/customers_bd") ? 'active' : ''} `}>
                  <Link to="/customers_bd">Stranke RD</Link>
                </li> : ""}
                {call_center || super_admin ? <li className={`${(location.pathname == "/customers_oto") ? 'active' : ''}`}>
                  <Link to="/customers_oto">Stranke OTO</Link>
                </li> : '' }
                {/* call_center || super_admin ? <li className={`${(location.pathname == "/customers_baza") ? 'active' : ''}`}>
                  <Link to="/customers_baza">Stranke Baza</Link>
                </li> : '' */}
                {call_center || super_admin ? <li className={`${(location.pathname == "/precomputed_customers_baza") ? 'active' : ''}`}>
                  <Link to="/precomputed_customers_baza">Stranke Baza NOVO</Link>
                </li> : '' }
                { call_center || super_admin || marketing ? <li className={`${(location.pathname == "/influencers") ? 'active' : ''} `}>
                  <Link to='/influencers'>
                    <span>Influencerji</span>
                  </Link>
                </li> : "" }
                { call_center || super_admin || marketing ? <li className={`${(location.pathname == "/influencer_orders") ? 'active' : ''} `}>
                  <Link to='/influencer_orders'>
                    <span>Paketi influencerjem</span>
                  </Link>
                </li> : "" }
              </ul>
            </li> : "" }
            { marketing  || super_admin  ? <li onClick={() => {this.setState({activeTab: 2})}} className={`${(this.state.activeTab == 2) ? 'active treeview ' : ' treeview'} `} >
             <a href="#" onClick={this.toggleClass.bind(this)} >
                <i className="fa fa-line-chart"></i> <span className="pl-1">Statistika</span>
                <span className="pull-right-container">
                  <i className="fa fa-angle-left pull-right"></i>
                </span>
              </a>
              <ul className="treeview-menu">
                <li className={`${(location.pathname == "/order_statistics") ? 'active' : ''} `}>
                  <Link to="/order_statistics">Statistika naročila</Link>
                </li>
                <li className={`${(location.pathname == "/agents") || (location.pathname == "/agent_statistics") ? 'active' : ''} `}>
                  <Link to="/agents"> Call center statistika</Link>
                </li>
              { super_admin ? <li className={`${(location.pathname == "/daily_statistics") ? 'active' : ''} `}>
                  <Link to="/daily_statistics"> Dnevni pregled</Link>
                </li> : "" }
               { super_admin ? <li className={`${(location.pathname == "/monthly_statistics") ? 'active' : ''} `}>
                  <Link to="/monthly_statistics"> Mesečni pregled</Link>
                </li> : "" }
                <li className={`${(location.pathname == "/monthly_income") ? 'active' : ''} `}>
                  <Link to="/monthly_income"> Mesečni prihodki</Link>
                </li>
                <li className={`${(location.pathname == "/daily_income") ? 'active' : ''} `}>
                  <Link to="/daily_income"> Dnevni prihodki</Link>
                </li>
                <li className={`${(location.pathname == "/discounts") ? 'active' : ''} `}>
                  <Link to="/discounts"> Kuponi za popust</Link>
                </li>
                { super_admin ? <li className={`${(location.pathname == "/add_expense_page") ? 'active' : ''} `}>
                  <Link to="/add_expense_page"> Dodaj strošek</Link>
                </li> : "" }
              </ul>
            </li> : ""}
            { super_admin ? <li onClick={() => {this.setState({activeTab: 3})}} className={`${(this.state.activeTab == 3) ? 'active treeview' : ' treeview'} `} >
             <a href="#" >
                <i className="fas fa-cogs"></i> <span className="pl-1">Nastavitve</span>
                <span className="pull-right-container">
                  <i className="fa fa-angle-left pull-right"></i>
                </span>
              </a>
              <ul className="treeview-menu">
                { super_admin ? <li className={`${(location.pathname == "/add_edit_web") ? 'active' : ''} `}>
                  <Link to='/add_edit_web'>
                    <span>Spletna stran</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/add_edit") ? 'active' : ''} `}>
                  <Link to='/add_edit'>
                    <span>Sistemske nastavitve</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/languages") ? 'active' : ''} `}>
                  <Link to='/languages'>
                    <span>Jeziki</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/reviews") ? 'active' : ''} `}>
                  <Link to='/reviews'>
                    <span>Mnenja</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/blog") ? 'active' : ''} `}>
                  <Link to='/blog'>
                    <span>Blog</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/oto") ? 'active' : ''} `}>
                  <Link to='/oto'>
                    <span>OTO</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/smscampaign") ? 'active' : ''} `}>
                  <Link to='/smscampaign'>
                    <span>SMS Campaign</span>
                  </Link>
                </li> : "" }
                { super_admin ? <li className={`${(location.pathname == "/smscampaigns") ? 'active' : ''} `}>
                  <Link to='/smscampaigns'>
                    <span>SMS Campaigns</span>
                  </Link>
                </li> : "" }
              </ul>
            </li> : "" }
            { super_admin ? <li onClick={() => {this.setState({activeTab: 5})}} className={`${(this.state.activeTab == 5) ? 'active treeview ' : ' treeview'} `} >
             <a href="#" onClick={this.toggleClass.bind(this)} >
                <i className="fa fa-line-chart"></i> <span className="pl-1">Lekarne</span>
                <span className="pull-right-container">
                  <i className="fa fa-angle-left pull-right"></i>
                </span>
              </a>
              <ul className="treeview-menu">
                <li className={`${(location.pathname == "/pharmacies") ? 'active' : ''}`}>
                  <Link to="/pharmacies"> Seznam lekarn</Link>
                </li>
                <li className={`${(location.pathname == "/pharmacies_orders") ? 'active' : ''}`}>
                  <Link to="/pharmacies_orders"> Pregled naročil</Link>
                </li>
              </ul>
            </li> : "" }
            <li onClick={this.logout.bind(this, token, user_id)} className={`${this.state.activeTab == 4 ? 'active' : ''}`}>
              <a href='#'>
                <i className="fa fa-frown-o"></i><span className="pl-1">Odjavi se</span>
              </a>
            </li>
          </ul>
        </section>
      </aside>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
    logout_user: (token, socket, id) => {
      dispatch(logout_user(token, socket, id));
    },
    getNotification: (userGroup,from) => {
      dispatch(getNotification(userGroup,from))
    },
    pushNotification: (data) => {
      dispatch(pushNotification(data))
    },
    markReadNotification: (notificationId) => {
      dispatch(markReadNotification(notificationId))
    },
    toggleMenu: (menuState) => {
      dispatch(toggleMenu(menuState))
    }
	}
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    notifications: nextState.notifications_data.notifications,
    allNotificationsCount: nextState.notifications_data.allNotificationsCount,
    unreadNotificationsCount: nextState.notifications_data.unreadNotificationsCount,
    socket: nextState.main_data.socket
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
