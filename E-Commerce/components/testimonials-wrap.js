import React from "react";
import PropTypes from "prop-types";

class TestimonialsWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.testimonials && this.props.testimonials[0] || {}
    };

    this.changeSelected1 = this.changeSelected1.bind(this)
    this.changeSelected2 = this.changeSelected2.bind(this)
  }

  componentDidMount(){
  };

  changeSelected1() {
    var index = this.props.testimonials.indexOf(this.state.selected);

    if (index > 0) {
      index -= 1;
      this.setState({selected: this.props.testimonials[index]})
    } else {
      this.setState({selected: this.props.testimonials[this.props.testimonials.length - 1]})
    }
  }

  changeSelected2() {
    var length = this.props.testimonials.length;
    var index = this.props.testimonials.indexOf(this.state.selected);

    if (index < length - 1) {
      index += 1;
      this.setState({selected: this.props.testimonials[index]})
    } else {
      this.setState({selected: this.props.testimonials[0]})
    }
  }


  render() {
    var img = null;
    const { selected = {} } = this.state
    if(selected.images && selected.images.length>0){
      img = selected.images.find(i =>{if(i.profile_img==1) return i});
    }

    return (
      <div className="container">
        <div className="row d-flex justify-content-center">
          <div onClick={this.changeSelected1} className="align-self-center pointer">
            <img alt="image" className="arrow-img left-i" src="/static/images/arrow-right.svg" />
          </div>
          <div className="testimonial-content">
              <div className="text-wraper">
                <div className="text"><p dangerouslySetInnerHTML={{__html: selected.favourite}}></p></div>
              </div>
            <div className="bottom-name">
              <div className="data">
                <div className="row justify-content-center justify-content-md-end align-items-center resp-test-person">
                  <img alt="image" className="round" src={img && img.link} />
                  <div className="name-text">
                    <p>{selected.full_name}</p>
                    <p className="name-title">{selected.profession}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div onClick={this.changeSelected2} className="align-self-center pointer">
            <img alt="image"  className="arrow-img right-i" src="/static/images/arrow-right.svg" />
          </div>
        </div>
      </div>
    );
  }
}

TestimonialsWrap.propTypes = {
  testimonials: PropTypes.array.isRequired
};

export default TestimonialsWrap;
