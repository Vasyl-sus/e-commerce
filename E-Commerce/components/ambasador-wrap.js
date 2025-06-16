import React from "react";
import ModalVideo from 'react-modal-video'

class AmbasadorWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false,
      toggled: false
    };

    this.toggleText = this.toggleText.bind(this)
    this.goToAmbasador = this.goToAmbasador.bind(this)
    this.toggleVideo = this.toggleVideo.bind(this)
  }

  componentDidMount(){

  };

  toggleText() {
    this.setState({toggled: !this.state.toggled})
  }

  goToAmbasador() {

  }

  toggleVideo() {
    this.setState({isOpen: !this.state.isOpen})
  }

  render() {
    const { language, therapies, categories, moreLang } = this.props;
    const { toggled } = this.state;

    var category = therapies && therapies[0] && therapies[0].category
    var c = categories?.find(cc => {
      return cc.name == category
    })
    return (
      <div className="container ambasador-wrap">
        <div style={{backgroundImage: `url(${c && c.pattern_image && c.pattern_image.link})`}}  className="row blue-row">
          <div className="col-md-12 top">
            <p className="title">{language?.data.ppah.value}</p>
            <p className="title-a">{language?.data.ppahn.value}</p>
            <div className="border"></div>
            <div className="row">
              <div className="col-12 col-md-10 d-flex text-wraper-i center-margin">
                <p className="text text-center">{language?.data.ppahd.value}</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{backgroundImage: `url(${language?.data.ppahimg.value})`}} className="am-image-w row">
          {language?.data.ppahv.value && <div onClick={this.toggleVideo} className="col-12 bottom pl-0 pr-0 text-center">
            <div className="d-flex align-items-center out-ambasador-image">
              <div className="inner-ambasador-image">
                <img alt="image" className="pointer" src="/static/images/play-video-w.svg" />
                <div className="border"></div>
                <p>{language?.data.ppavi.value}</p>
              </div>
            </div>
          </div>}
          <ModalVideo channel='youtube' autoplay='1' modestbranding='1' rel='0' isOpen={this.state.isOpen} videoId={language?.data.ppahv.value} onClose={() => this.setState({isOpen: false})} />
        </div>
        <div className="row am-info-w">
          <div className="col-12 pl-md-0 pr-md-0 am-info">
            <p className="naslov">{moreLang?.data.ppomt.value}</p>
            <p className="title">{moreLang?.data.ppomtb.value}</p>
            <div className={`description ${toggled ? 'active' : ''}`} >
              <div dangerouslySetInnerHTML={{__html: moreLang?.data.ppomtdlong.value}}></div>
            </div>
          </div>
          <div className="border-product-dark col-12"></div>
        </div>
      </div>
    );
  }
}

AmbasadorWrap.propTypes = {

};

export default AmbasadorWrap;
