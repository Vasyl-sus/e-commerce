import React, { Component } from 'react'
import { connect } from 'react-redux'

class Loading extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div className={this.props.isLoading ? 'all-loading' : 'hidden'}>
        <img
          className='loading-image'
          src='/static/images/loading.svg'
          alt='loading'
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoading: state.main.isLoading,
  }
}

export default connect(mapStateToProps, null)(Loading)
