import React from "react";

class CustomCounter extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
			newNum: 0,
      oldNum: 0,
      newMin:0,
      oldMin:0,
      change: true,
      change1:false
    }
	}
	
	componentDidMount() { 
    this.setState({newNum:this.props.seconds});
    this.setState({oldNum:this.props.seconds-1});
    this.setState({newMin:this.props.minutes});
    this.setState({oldMin:this.props.minutes-1});
		this.timerID = setInterval(
			() => this.tick(),
			50
		);
	}
	
	componentWillUnmount() {
		clearInterval(this.timerID);
	}
	
	tick() {
    const newNum = this.props.seconds;
		if( this.state.newNum !== newNum) {
			const oldNum = newNum === 59 ? newNum : newNum + 1;
			const change = !this.state.change;
			this.setState({
				newNum,
				oldNum,
				change
			});
    }
    
    const newMin = this.props.minutes;
		if( this.state.newMin !== newMin) {
			const oldMin = newMin -1 === 0 ? 59 : newMin + 1;
			const change1 = !this.state.change1;
			this.setState({
				newMin,
				oldMin,
				change1
			});
		}
	}
	
	render() {
    const { newNum, oldNum, oldMin, newMin, change, change1} = this.state;
		const animation1 = change ? 'fold' : 'unfold';
		const animation2 = !change ? 'fold' : 'unfold';
		const number1 = change ? oldNum : newNum;
    const number2 = !change ? oldNum : newNum;

    const number3 = change1 ? oldMin : newMin;
    const number4 = !change1 ? oldMin : newMin;
    const animation3 = change1 ? 'fold' : 'unfold';
    const animation4 = !change1 ? 'fold' : 'unfold';

		return(
      <div className={`d-flex justify-content-center mt-4 ${this.props.page=='checkout'?'c-counter':''}`}>
        <div className={'flipCounter mx-3'}>
          <div className={'upperCard'}>
            <span>{newMin<10? "0"+newMin : newMin}</span>
          </div>
          <div className={'lowerCard'}>
            <span>{oldMin<10? "0"+oldMin : oldMin}</span>
          </div>
          <div className={`flipCard first ${animation3}`}>
            <span>{number3<10? "0"+number3 : number3}</span>
          </div>
          <div className={`flipCard second ${animation4}`}>
            <span>{number4<10? "0"+number4 : number4}</span>
          </div>
        </div>
        <span className="counter-divider">:</span>
        <div className={'flipCounter mx-3'}>
          <div className={'upperCard'}>
            <span>{newNum<10? "0"+newNum : newNum}</span>
          </div>
          <div className={'lowerCard'}>
            <span>{oldNum<10? "0"+oldNum : oldNum}</span>
          </div>
          <div className={`flipCard first ${animation1}`}>
            <span>{number1<10? "0"+number1 : number1}</span>
          </div>
          <div className={`flipCard second ${animation2}`}>
            <span>{number2<10? "0"+number2 : number2}</span>
          </div>
        </div>
      </div>
		);
	}
}

CustomCounter.propTypes = {

};

export default CustomCounter;
