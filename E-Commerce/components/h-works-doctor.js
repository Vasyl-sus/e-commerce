import React from "react";
import ModalVideo from 'react-modal-video'

class HowItWorksDoctor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false,
      activeTab: 1,
      setActive: true,
      visibleClass: "",
      ytLink: ""
    };

    this.myRef = React.createRef()
  }

  componentDidMount() {
    window.addEventListener("scroll", this.onScrollEvent);
    window.addEventListener("mousedown", this.onClickEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScrollEvent);
    window.removeEventListener("mousedown", this.onClickEvent);
  }

  onClickEvent = (event) => {
    if (event.srcElement.dataset && event.srcElement.dataset.name === "click") {
      this.setState({isOpen: true, ytLink: event.srcElement.dataset.link})
    }
  }

  onScrollEvent = (event) => {
    let bounding = this.myRef.current.getBoundingClientRect();
    if (bounding.top <= 73) {
      this.setState({visibleClass: "visible"})
    } else {
      this.setState({visibleClass: ""})
    }
  }

  toggleTab = (activeTab) => () => {
    this.setState({activeTab, setActive: false})
    setTimeout(
      function() {
        this.setState({setActive: true});
      }
      .bind(this),
      200
    );
    window.scrollTo(0, this.myRef.current.offsetTop)
  }

  openYTVideo = (link) => () => {
    this.setState({isOpen: true, ytLink: link})
  }

  render() {
    const { language, moreLang, hiLang } = this.props;

    var text = language?.data.pphwcc1.value

    if (this.state.activeTab == 2) {
      text = moreLang?.data.pphwcs1.value
    } else if (this.state.activeTab == 3) (
      text = hiLang?.data.pphwcss1.value
    )

    return (
      <div ref={this.myRef} className="container h-w-d ">
        <div className={`${this.state.visibleClass}`}>
          <div className="row first-c justify-content-between">
            <div onClick={this.toggleTab(1)} className={`pointer blocked-w how-it-works col-lg-3 col-4 text-center ${this.state.activeTab == 1 && 'active'}`}>
              <p className="main-t">{language?.data.pphw1t.value}</p>
            </div>
            <div onClick={this.toggleTab(2)}  className={`pointer ${this.state.activeTab == 2 && 'active'} col-4 blocked-w ingredients col-lg-3 text-center`}>
              <p className="main-t">{moreLang?.data.pphw2t.value}</p>
            </div>
            <div onClick={this.toggleTab(3)} className={`pointer ${this.state.activeTab == 3 && 'active'} col-4 blocked-w how-to-use col-lg-3 text-center`}>
              <p className="main-t">{hiLang?.data.pphw3t.value}</p>
            </div>
          </div>
          <div className={`second-c ${this.state.setActive && `active${this.state.activeTab}`}`}>

            <div className={`inner-second`} dangerouslySetInnerHTML={{__html: text}}>
            </div>
          </div>
          <div className="row border-product"></div>
        </div>

        <ModalVideo channel='youtube' autoplay='1' modestbranding='1' rel='0' isOpen={this.state.isOpen} videoId={this.state.ytLink} onClose={() => this.setState({isOpen: false})} />
      </div>
    );
  }
}

HowItWorksDoctor.propTypes = {

};

export default HowItWorksDoctor;
