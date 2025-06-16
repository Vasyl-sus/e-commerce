import React from "react";
import PropTypes from "prop-types";
import Link from 'next/link'
import ModalVideo from 'react-modal-video'
import { youtube_parser } from './services';

class TopImageWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false
    };

    this.closeVideoModal = this.closeVideoModal.bind(this)
  }

  componentDidMount(){

  };

  openVideoModal = (link) => () => {
    if (link) {
      var url = youtube_parser(link);
      this.setState({openedUrl: url, isOpen: !this.state.isOpen})
    }
  }

  closeVideoModal() {
    this.setState({isOpen: false})
  }

  render() {
    const { language, billboard } = this.props;
    var bill = billboard && billboard[0] || {}
    return (
      <div className="col-md-12">
        <div className="row">
          <div className="container-fluid text-side">
            <div className="d-flex align-items-end align-items-md-center justify-content-around">
              <img src={bill.image_link} alt="img" className="image-slider" />
              <div className="quoted-text">
                <div className="row align-items-start w-100-resp slider-text">
                  <img alt="img" className="left-i" width="65" src="/static/images/quote.svg" />
                  <div dangerouslySetInnerHTML={{__html: bill.text}} className="big-text break"></div>
                  <img className="right-i" width="65" alt="img" src="/static/images/quote.svg" />
                </div>
                <div className="video-wrap">
                  {bill.video_link && <p className="video-text" onClick={this.openVideoModal(bill.video_link)}><span className="before-video-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88.59 88.59"><defs><style>{`.cls-1{fill:none;stroke:#211f20;stroke-miterlimit:10;stroke-width:1.5px;}`}</style></defs><title>play-video</title><g id="Layer_26" data-name="Layer 2"><g id="page11"><g id="NATALIJA"><circle className="cls-1" cx="44.29" cy="44.29" r="43.54" transform="translate(-9.14 76.99) rotate(-76.46)"/><polygon className="cls-1" points="38.3 25.05 60.3 44.29 38.3 63.53 38.3 25.05"/></g></g></g></svg></span>{language.main.data.pogv.value}</p>}
                  {bill.link && <Link href={bill.link}><a className="video-text link"><span className="before-video-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88.59 88.59"><defs><style>{`.cls-1{fill:none;stroke:#211f20;stroke-miterlimit:10;stroke-width:1.5px;}`}</style></defs><title>play-video</title><g id="Layer_26" data-name="Layer 2"><g id="page11"><g id="NATALIJA"><circle className="cls-1" cx="44.29" cy="44.29" r="43.54" transform="translate(-9.14 76.99) rotate(-76.46)"/><polygon className="cls-1" points="38.3 25.05 60.3 44.29 38.3 63.53 38.3 25.05"/></g></g></g></svg></span>{language.main.data.pogvv1.value}</a></Link>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ModalVideo channel='youtube' autoplay='1' modestbranding='1' rel='0' isOpen={this.state.isOpen} videoId={this.state.openedUrl} onClose={this.closeVideoModal} />
      </div>
    );
  }
}

TopImageWrap.propTypes = {
  billboard: PropTypes.array.isRequired
};

export default TopImageWrap;
