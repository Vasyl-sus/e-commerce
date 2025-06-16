import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCoverflow, EffectCube, Navigation } from 'swiper/modules';
import PropTypes from 'prop-types';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cube';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

class UserTestimonialCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  componentDidMount(){
  };

  slideConfig = {
    tag: 'section',
    loop: true,
    speed: 800,
    autoplay: { delay: 6000 },
    autoHeight: true,
    spaceBetween: 10,
    slidesPerView: 'auto',
    navigation: true,
    breakpoints: {
      520: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: this.props.countSlides ? 2 : 1,
      },
      1200: {
        slidesPerView: this.props.countSlides ? this.props.countSlides : 1,
      },
    }
  }

  renderSlide = () => {
    const { testimonials_product } = this.props
    return (
      testimonials_product && testimonials_product.map((item, index) => {
        return (
          <SwiperSlide tag='li' key={`slide${index + 1}`} className="swiperItem">
            <div key={`testimonial-${item.id}`} className="swiperItemContainer">
              <div className="col-12">
                <img alt={item.user_name} className="user-testimonial-image" src={item.image ? item.image : "/static/images/peopleDefault.png"} />
                <div className="user-testimonial-content" dangerouslySetInnerHTML={{__html: item.text}}></div>
                <p className="user-testimonial-user">{item.user_name}</p>
              </div>
            </div>
          </SwiperSlide>
        )})
    )
  }

  render() {
    const { testimonials_product, language } = this.props
    return (
      (testimonials_product != "") &&
      <div className="container user-testimonial-carousel">
        <div className="row">
          <h2 className="user-testimonials-title">{language?.data?.userTestimonialsTitle?.value}</h2>
          <Swiper
            modules={[Pagination, Autoplay, EffectCoverflow, EffectCube, Navigation]}
            {...this.slideConfig}
          >
            {this.renderSlide()}
          </Swiper>
        </div>
      </div>
    )
  }
}

UserTestimonialCarousel.propTypes = {
  testimonials_product: PropTypes.array,
  countSlides: PropTypes.number
};

export default UserTestimonialCarousel;