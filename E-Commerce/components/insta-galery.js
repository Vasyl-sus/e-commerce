import React from "react";
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

class InstaGalery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false
    };

    this.renderSingleImage = this.renderSingleImage.bind(this)
    this.handleOnDragStart = this.handleOnDragStart.bind(this)
  }

  componentDidMount(){

  };

  renderSingleImage(row, index) {
    return (
      <div key={index} className="image-container">
        <img onClick={this.openImage(index)} className="w-100 insta-galery-image" alt="img" onDragStart={this.handleOnDragStart} src={row.link} />
      </div>
    )
  }

  openImage = (index) => () => {
    this.setState({isOpen: true, photoIndex: index})
  }

  handleOnDragStart(e) { e.preventDefault()}

  render() {
    const { language, images } = this.props;
    const { photoIndex, isOpen } = this.state;

    return (
      <div className="insta-galery-wrap">
        <p className="title">{language.ambasadors.data.ag1.value}</p>
        <div className="container">
          <ResponsiveMasonry columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}>
            <Masonry gutter="16px">
              {images.map(this.renderSingleImage)}
            </Masonry>
          </ResponsiveMasonry>
        </div>
        {isOpen && (
          <Lightbox
            open={isOpen}
            close={() => this.setState({ isOpen: false })}
            slides={images.map(image => ({ src: image.link }))}
            currentIndex={photoIndex}
            onPrev={() => this.setState({ photoIndex: (photoIndex + images.length - 1) % images.length })}
            onNext={() => this.setState({ photoIndex: (photoIndex + 1) % images.length })}
          />
        )}
      </div>
    );
  }
}

export default InstaGalery;