import React from "react";
import ModalVideo from 'react-modal-video'

class VideoWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };

    this.toggleVideo = this.toggleVideo.bind(this)
  }

  componentDidMount(){

  };

  toggleVideo() {
    this.setState({isOpen: !this.state.isOpen})
  }

  render() {
    const { language } = this.props;
    return (
      <div className="container video-wrap-1">
        <p className="main-title text-center">{language.data.ppdt.value}</p>
        <p className="title center-margin text-center">{language.data.ppdtb.value}</p>
        <div className="video-box">
          {language.data.ppdvid.value && <div className="v-play-b pointer" onClick={this.toggleVideo}>
            <img alt="image" src="/static/images/play-video-w.svg" />
            <p>{language.data.ppavi.value}</p>
          </div>}
          <ModalVideo channel='youtube' autoplay='1' modestbranding='1' rel='0' isOpen={this.state.isOpen} videoId={language.data.ppdvid.value} onClose={() => this.setState({isOpen: false})} />
        </div>
        <div className="border-product-dark"></div>
      </div>
    );
  }
}

VideoWrap.propTypes = {
};

export default VideoWrap;
