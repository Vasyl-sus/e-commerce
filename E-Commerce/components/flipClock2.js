import React, { Component, createRef } from 'react';

class FlipClock extends Component {
  element$ = null;
  constructor() {
    super();
    this.flipclockRef = createRef();
  }

  componentDidMount() {
    var self = this
    const flipclockRef = this.flipclockRef.current;
    this.element$ = $(flipclockRef).FlipClock(this.props.time, {
      countdown: true,
      callbacks: {
        stop: function() {
          self.props.onStop();
        }
      },
      ...this.props
    });
  }

  // componentDidUpdate(prevProps) {
  //   this.setTimeWhenChanges(prevProps);
  // }

  setTimeWhenChanges = ({ time: prevTime }) => {
    const { time } = this.props;
    if (time !== prevTime) {
      this.element$.setTime(time);
      this.element$.start();
    }
  };

  render() {
    return <div ref={this.flipclockRef} />;
  }
}

export default FlipClock;