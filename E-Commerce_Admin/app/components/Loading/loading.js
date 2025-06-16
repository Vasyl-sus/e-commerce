import React, {Component, PropTypes} from 'react';
import {Link, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import {ROOT_URL} from '../../config/constants'

class Loading extends Component {
    constructor(props) {
      super(props);

      this.state = {};
    }
    render(){
    	return(
	    	<div>
	    		{this.props.loading ?
	    		<div className="loadingDiv">
	    			<img src={`${ROOT_URL}/images/admin/loading_white.gif`} className="loading-pic"/>
	    		</div>
	    		:''}
	    	</div>
    	)
    }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
  	loading:nextState.main_data.loading
  }
}

export default connect(mapStateToProps, null)(Loading);
