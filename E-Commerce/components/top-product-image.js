import React from "react";

class TopProductImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount(){
    
  };


  render() {
    const { category } = this.props;
    return (
      <div style={{backgroundImage: `url(${category?.background_image?.link})`}} className="container-fluid top-product-image">
        
      </div>
    );
  }
}

TopProductImage.propTypes = {

};

export default TopProductImage;
