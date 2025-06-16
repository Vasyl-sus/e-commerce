import React from "react";
import Router from 'next/router';
import SmoothScrolling from "./smoothScroll";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import Link from 'next/link'

const tt = {
  images: []
}

class ProductTestimonialsWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orderNum: this.props.testimonials?.length,
      showBig: false,
      selectedIndex: null,
      thisTestimonial: tt
    };

    this.renderSingleRow = this.renderSingleRow.bind(this)
    this.myRef = React.createRef()
  }

  componentDidMount(){

  };

  openTestimonial = (row, index) => () => {
    if (this.props.linked) {
      Router.push('/ambasadors', `/${this.props.lang}-${this.props.country}/ambassadors/${row.url}`, { shallow: true })
    } else {
      if (this.state.selectedIndex == index && this.state.showBig == true) {
        this.setState({showBig: false, selectedIndex: null, thisTestimonial: tt});
      } else {
        this.setState({showBig: true, selectedIndex: index, thisTestimonial: row});setTimeout(
          function() {
            SmoothScrolling.scrollTo("begin");
          }
          .bind(this),
          200
        );
      }
    }

    var num = 3 - index % 3;
    this.setState({orderNum: index + num})
  }

  closeBig = () => {
    this.setState({showBig: false, selectedIndex: null, thisTestimonial: tt});
  }

  renderSingleRow(row, index) {
    var timeline = row.images.find(i => {
      return i.timeline_img == 1
    }) || {}
    var profiles = row.images.filter(i => {
      return i.profile_img == 1
    }) || {}
    return (
      <div key={index} onClick={this.openTestimonial(row, index)} className={`${this.state.selectedIndex == index ? 'active' : ''} product-t col-6 col-md-4 pointer order-${index}`}>
        <div className="upper">
          <p className="title">{row.full_name}</p>
          <p className="interest">{row.profession}</p>
          {profiles[1] ? <img alt="image" className="circle-i" srcSet={`
                      ${profiles[1].link} 1x, ${profiles[0] && profiles[0].link} 2x`} src={profiles[1].link} />
                      :
                      <img alt="image" className="circle-i" src={profiles[0] && profiles[0].link} />
          }
        </div>
        <div className="down" style={{backgroundImage: `url(${timeline.link})`}}>
          <div className="orange"></div>
        </div>
      </div>
    )
  }

  render() {
    const { language, testimonials, header } = this.props;

    const { thisTestimonial } = this.state

    var splited = [];
    var insta_images = thisTestimonial.images.filter(i => {
      return i.instagram_img
    })
    var profile_image = thisTestimonial.images.filter(image => image.profile_img == 1)
    
    var big_profile = profile_image.find(p => {
      return p.img_size == 1
    })
    return (
      <div className="product-testimonials">
        {!header && <div className="t-header row">
        <div className="col-12 pl-md-0 pr-md-0">
          <p>{language?.data.ppttt.value}</p>
          </div>
        </div>}
        <div className="row">
          {testimonials?.map(this.renderSingleRow)}
          <div id="begin" className={`big-product-t lightergray-b col-md-12 ${!this.state.showBig && 'd-none'} order-${this.state.orderNum} order-md-${this.state.orderNum-1}`}>
            <div className="row big-product-t-w">
              <img onClick={this.closeBig} className="x-img pointer x-testimonial" width="30" height="30" alt="image" src="/static/images/times.svg" />
              <div className="col-md-4">
                <img alt="image" className="circle-i" src={big_profile && big_profile.link} />
              </div>
              <div className="col-md-8 info-wrap">
                <p className="title">{thisTestimonial.full_name}</p>
                <p className="description">{thisTestimonial.profession}</p>
                <div className="text">
                  <p dangerouslySetInnerHTML={{__html: thisTestimonial.content}} className="t-description"></p>
                </div>
                <div className="border"></div>
                <div className="t-images row">
                  <div className="col-md-12">
                    <p className="t-title">{language?.data.ppttnt.value}</p>
                  </div>
                  <div className="col-md-12">
                  <ResponsiveMasonry columnsCountBreakPoints={{350: 2, 750: 3, 900: 4}}>
                    <Masonry gutter="16px">
                      {insta_images.map((t, index) => {
                        return (
                            <div key={index} className="image-container">
                              <img alt="image" className="w-100 insta-galery-image" src={t.link} />
                            </div>
                        )
                      })}
                    </Masonry>
                  </ResponsiveMasonry>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProductTestimonialsWrap.propTypes = {
};

export default ProductTestimonialsWrap;
