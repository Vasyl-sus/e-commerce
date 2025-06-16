import React, { Component } from 'react';
import PropTypes from 'proptypes'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { clubRoutes, playerRoutes, coachRoutes } from '../config/constants.js';

export default function (ComposedComponent) {
	class PermissionMiddleware extends Component {
		static contextTypes = {
			router : PropTypes.object
		}

		componentWillMount() {
      var location = this.props.location;
			if (!this.checkRoute(location.pathname, this.props.user)) browserHistory.push('/')
      // var user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      // this.props.checkUser(user)
		}

		// componentWillReceiveProps(nextProps) {
    //   if (!this.checkRoute(location.pathname, nextProps.user)) browserHistory.push('/')
		// }
    checkRoute(route, user) {
      var isClubRoute = clubRoutes.find((r) => { return r == route })
      var isPlayerRoute = playerRoutes.find((r) => { return r == route })
      var isCoachRoute = coachRoutes.find((r) => { return r == route });
      if (user.isAuthanticate) {
        if (isClubRoute) {
          if (user.type == 'club')
            return true;
          return false;
        } else if (isPlayerRoute) {
          if (user.type == 'player') {
            return true;
					}
          return false;
        } else if (isCoachRoute) {
          if (user.type == 'coach')
            return true;
          return false;
        }
      } else {
        if (isClubRoute || isPlayerRoute || isCoachRoute) {
          return false;
        }
        return true;
      }

      return true;
    }

		componentWillUpload() {
      var location = this.props.location;

      if (!this.checkRoute(location.pathname, this.props.user)) browserHistory.push('/')
		}

		render() {
			return <ComposedComponent {...this.props} />;
		}
	}

  function mapStateToProps(state) {
    let nextState = state.toJS();
    return {
      user: nextState.userData.user
    }
  }

	return connect(mapStateToProps, null)(PermissionMiddleware);
}
