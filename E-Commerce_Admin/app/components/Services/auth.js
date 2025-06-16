import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

export default function (ComposedComponent) {
	class PermissionMiddleware extends Component {
		static contextTypes = {
			router : PropTypes.object
		}

		componentWillMount() {
			var token = localStorage.getItem('token')
      if (!token) {
        browserHistory.push('/login')
      } else {
				var location = browserHistory.getCurrentLocation();
				if (location.pathname == '/') {
					browserHistory.push('/dashboard')
				}
			}
		}

		componentWillUpload() {
      var token = localStorage.getItem('token')
      if (!token) {
        browserHistory.push('/login')
      } else {
				var location = browserHistory.getCurrentLocation();
				if (location.pathname == '/') {
					browserHistory.push('/dashboard')
				}
			}
		}

		render() {
			return <ComposedComponent {...this.props} />;
		}
	}

	return connect(null, null)(PermissionMiddleware);
}
