import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  addToCart,
  openCartModal,
  submitReview,
} from '../actions/cartActions.js'
import { getReviews, verifyCallback } from '../actions/mainActions'
import AmbasadorWrap from '../components/ambasador-wrap'
import ProductPromoWrap from '../components/product-promo-wrap'
import UserTestimonialCarousel from '../components/user-testimonial-carousel'
import CartModal from '../components/cart_modal'
import HowItWorksDoctor from '../components/h-works-doctor.js'
import Layout from '../components/layout'
import ListReviewModal from '../components/list_review_modal'
import MediumsAboutUs from '../components/mediums-about'
import ProductInfoWrap from '../components/product-info-wrap'
import ProductInfoWrapSimple from '../components/product-info-wrap-simple'
import ProductTestimonials from '../components/product-testimonials'
import { addToDataLayer } from '../components/services'
import { parseLanguageModules } from '../components/services.js'
import Therapies from '../components/therapies-wrap'
import TopProductImage from '../components/top-product-image'
import {ROOT_URL} from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView, ViewContent } from '../actions/facebookActions'
import { PageView as GA4PageView, ViewItem } from '../actions/googleAnalyticsActions'
import { v4 as uuidv4 } from 'uuid';  // Import uuid

class ProductPage extends React.Component {
  constructor(props) {
    super(props)
    const { therapies } = this.props;
    let options = [];
    if (therapies?.[0]?.category?.toLowerCase() === 'lotion') {
      options = ['Sparkle of Amber', 'Fruity Bomb'];
    }

    this.state = {
      visibleClass: '',
      listReviewOpen: false,
      options,
      selectedKind: options?.[0] ?? null,
    }

    this.closeCartModal = this.closeCartModal.bind(this)
  }

  componentDidMount() {
    const { therapies, currency } = this.props
    let therapies1 = therapies.map((c, index) => {
      return {
        id: c.id,
        name: c.name,
        price: c.total_price,
        brand: 'E-Commerce',
        category: c.category,
        position: index,
        quantity: 1,
      }
    })
    let therapies2 = therapies.map((c, index) => {
      return {
        item_id: c.id,
        item_name: c.name,
        price: c.total_price,
        item_brand: 'E-Commerce',
        item_category: c.category,
        index: index,
        quantity: 1,
      }
    })
    if (currency.code == 'FT') currency.code = 'HUF'

    // Generate separate event IDs for PageView and ViewContent
    const pageViewEventId = uuidv4();
    const viewContentEventId = uuidv4();

      // PageView data
    const pageViewData = {
      url: window.location.href,
      eventId: pageViewEventId
    }
    // Send to Facebook
    PageView(pageViewData);
    // Send to Google Analytics
    GA4PageView({
      url: window.location.href,
      title: document.title
    });
    
    const viewContentData = {
      url: window.location.href,
      currency: currency.code,
      item: therapies1,
      eventId: viewContentEventId
    }
    // Send to Facebook
    ViewContent(viewContentData);
    // Send to Google Analytics
    ViewItem({
      url: window.location.href,
      currency: currency.code,
      item: therapies1
    });


    addToDataLayer('EEProductDetail', {
      therapies: therapies1,
      therapiesGA4: therapies2,
      currencycode: this.props.currency.code,
      productname: this.props.therapies[0].product_name,
      productid: this.props.therapies[0].category,
      viewContentEventId: viewContentEventId,
      pageViewEventId: pageViewEventId
    })
  }

  addToCart = therapy => {
    const { currency } = this.props
    this.props.addToCart({ therapy, new_quantity: 1 }, currency)
    this.props.openCartModal()
  }

  closeCartModal() {
    this.props.closeCartModal()
  }

  submitReview = data => {
    data.product_id = this.props.therapies[0].product_id
    this.props.submitReview(data)
  }

  changeClass = visibleClass => {
    this.setState({ visibleClass })
  }

  addToCartShort = () => {
    const { currency } = this.props
    this.props.addToCart(
      { therapy: this.props.therapies[0], new_quantity: 1 },
      currency,
    )
    this.props.openCartModal()
    dataLayer.push({
      event: 'eventTracking',
      eventCategory: 'Product Page',
      eventAction: 'click',
      eventLabel: 'Bottom bar - ' + this.props.therapies[0].name,
    })
  }

  getReviews = () => {
    this.setState({ listReviewOpen: true })
    this.props.getReviews(this.props.page_route)
  }

  closeListModal = () => {
    this.setState({ listReviewOpen: false })
  }

  verifyCallback = data => {
    this.props.verifyCallback(data)
  }

  handleSelectKind = (v) => {
    this.setState({
      ...this.state,
      selectedKind: v,
    });
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      testimonials,
      therapies,
      categories,
      currency,
      mediums,
      countries,
      open_cart_modal,
      cart,
      addedTherapy,
      reviewStatus,
      sticky_note,
      reviewData,
      reviews,
      locale,
      fixed,
      enableSendMessage,
      all_routes,
      testimonials_product,
    } = this.props
    const { options, selectedKind } = this.state

    var category = categories && categories.find(c => {
      return c.name === therapies[0].category
    })

      var pageLanguage = language.product
      var headerLang = pageLanguage.find(p => {
        return p.section == 'header'
      })
      var productPromoLang = pageLanguage.find(p => {
        return p.section == 'product_promo'
      })
      var ambasadorLang = pageLanguage.find(p => {
        return p.section == 'ambasador'
      })
      var aboutProduktLang = pageLanguage.find(p => {
        return p.section == 'about_product'
      })
      var howItWorksLang = pageLanguage.find(p => {
        return p.section == 'how_it_works'
      })
      var ingridientsLang = pageLanguage.find(p => {
        return p.section == 'ingridients'
      })
      var howItsUsedLang = pageLanguage.find(p => {
        return p.section == 'how_its_used'
      })
      var belowContentLang = pageLanguage.find(p => {
        return p.section == 'below_content'
      })
      var productUsersLang = pageLanguage.find(p => {
        return p.section == 'product_users'
      })
      var belowCtaLang = pageLanguage.find(p => {
        return p.section == 'below_cta'
      })
      var mainLangData = language.main
      var headerLangData = language.header


      var className = ''
      className = category && category.css_class_name
      var therapiesMeta = category || {}

      if (category && category.name == 'cream') {
        therapiesMeta.image = headerLang.data.ogimagekp.value
      } else if (category && category.name == 'eyelash') {
        therapiesMeta.image = headerLang.data.ogimagesz.value
      } else if (category && category.name == 'caviar') {
        therapiesMeta.image = headerLang.data.ogimagecaviar.value
      } else if (category && category.name == 'procollagen') {
        therapiesMeta.image = headerLang.data.ogimageprocollagen.value
      } else if (category && category.name == 'lotion') {
        therapiesMeta.image = headerLang.data.ogimagelotion.value
      } else {
        therapiesMeta.image = headerLang.data.ogimagemz.value
      }


      return (
        <Layout
          all_routes={all_routes}
          locale={locale}
          sticky_note={sticky_note}
          countries={countries}
          therapiesMeta={therapiesMeta}
          page='product-page'
          product_page={category && category.name}
          cssClassName={className}
          routes={routes}
          langConfig={langConfig}
          language={language}
          lang={lang}
          country={country}
          currency={currency}>
          <TopProductImage category={category} language={language} />
          <ProductInfoWrap
            enableSendMessage={enableSendMessage}
            verifyCallback={this.verifyCallback}
            lang={lang}
            getReviews={this.getReviews}
            reviewData={reviewData}
            changeClass={this.changeClass}
            reviewStatus={reviewStatus}
            submitReview={this.submitReview}
            categories={categories}
            mlang={mainLangData}
            hlang={headerLangData}
            mainLang={language.main}
            language={headerLang}
            addToCart={this.addToCart}
            therapies={therapies}
            currency={currency}
            fixed={fixed}
            options={options}
            selectedKind={selectedKind}
            handleSelectKind={this.handleSelectKind}
          />
           {(category && category.name == 'prazno') ?
            <ProductPromoWrap
              categories={categories}
               therapies={therapies}
               language={productPromoLang}
             />
           : '' }
          <AmbasadorWrap
            moreLang={aboutProduktLang}
            categories={categories}
            therapies={therapies}
            language={ambasadorLang}
          />
          <UserTestimonialCarousel
            testimonials_product={testimonials_product}
            countSlides={2}
            language={mainLangData}
          />
          <HowItWorksDoctor
            moreLang={ingridientsLang}
            hiLang={howItsUsedLang}
            language={howItWorksLang}
          />
          <MediumsAboutUs mediums={mediums} language={belowContentLang} />
          <div className='container product-testimonials-container'>
            <ProductTestimonials
              language={productUsersLang}
              testimonials={testimonials}
            />
            <div className='border-product'></div>
          </div>
          {category && category.name == 'caviar' ? "" :
          <Therapies
            currency={currency}
            fixed={fixed}
            addToCart={this.addToCart}
            language={belowCtaLang}
            mlang={mainLangData}
            therapies={therapies}
            options={options}
            selectedKind={selectedKind}
            handleSelectKind={this.handleSelectKind}
          />
          }
          <div className={`fixed-bottom the-bar ${this.state.visibleClass}`}>
            <div className='the-bar-container d-flex align-items-center justify-content-between'>
              <div className='bar-product-name d-none d-md-block'>
                {language.main.data.izbf.value}: <span>{therapies[0].name}</span>
              </div>
              <div className='bar-product-price-cart d-flex flex-row align-items-center'>
                <div className='bar-product-price d-none d-md-block'>
                  <span>
                    {therapies[0].inflated_price.toFixed(fixed)} {currency.code}
                  </span>
                  {therapies[0].total_price.toFixed(fixed)} {currency.code}
                </div>
                <button
                  onClick={this.addToCartShort}
                  className='btn btn-bar-not-full d-none d-md-block'>
                  {language.main.data.addtocart.value}
                </button>
                <button
                  onClick={this.addToCartShort}
                  className='btn btn-bar-full d-block d-md-none'>
                  {language.main.data.addtocart.value}{' '}
                  <span className='mobile-regular-price'>
                    {therapies[0].inflated_price.toFixed(fixed)} {currency.code}
                  </span>
                  <span className='mobile-price'>
                    {therapies[0].total_price.toFixed(fixed)} {currency.code}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: `
            {
              "@context": "http://schema.org",
              "@type": "Product",
              "name": "${therapies[0].product_name_long}",
              "description": "${therapies[0].product_desc}",
              "image": "${
                therapies[0].display_image && therapies[0].display_image.link
              }",
              "brand": "E-Commerce Cosmetics",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": ${reviewData.grade && reviewData.grade.toFixed(2)},
                "reviewCount": ${reviewData.count},
                "bestRating": "5"
              },
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "${
                  therapies[0].total_price > 0 ? therapies[0].total_price : 0
                }",
                "highPrice": "${
                  therapies[2].total_price > 0 ? therapies[2].total_price : 0
                }",
                "offerCount": "3",
                "priceCurrency": "${currency.code ? currency.code : 'EUR'}",
                "offers": [
                  {
                    "@type": "Offer",
                    "availability": "http://schema.org/InStock",
                    "price": "${
                      therapies[0].total_price > 0 ? therapies[0].total_price : 0
                    }",
                    "priceCurrency": "${currency.code ? currency.code : 'EUR'}"
                  },
                  {
                    "@type": "Offer",
                    "availability": "http://schema.org/InStock",
                    "price": "${
                      therapies[1].total_price > 0 ? therapies[1].total_price : 0
                    }",
                    "priceCurrency": "${currency.code ? currency.code : 'EUR'}"
                  },
                  {
                    "@type": "Offer",
                    "availability": "http://schema.org/InStock",
                    "price": "${
                      therapies[2].total_price > 0 ? therapies[2].total_price : 0
                    }",
                    "priceCurrency": "${currency.code ? currency.code : 'EUR'}"
                  }
                ]
              }
            }
          `,
            }}
          />
          <CartModal
            fixed={fixed}
            addedTherapy={addedTherapy}
            closeCartModal={this.closeCartModal}
            routes={routes}
            cartModal={open_cart_modal}
            cart={cart}
            language={language}
            lang={lang}
            country={country}
            currency={currency}
          />
          <ListReviewModal
            language={language}
            reviews={reviews}
            closeModal={this.closeListModal}
            listReviewOpen={this.state.listReviewOpen}
          />
        </Layout>
      )

  }
}

ProductPage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfigproduct`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    closeCartModal: bindActionCreators(openCartModal, dispatch),
    submitReview: bindActionCreators(submitReview, dispatch),
    verifyCallback: bindActionCreators(verifyCallback, dispatch),
    getReviews: bindActionCreators(getReviews, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    testimonials: props.initData.testimonials,
    therapies: props.initData.therapies,
    page_route: props.page_route,
    routes: props.language.routes,
    currency: props.initData.currency,
    categories: props.initData.categories,
    mediums: props.initData.mediums,
    open_cart_modal: state.cart.open_cart_modal,
    countries: props.initData.countries,
    cart: state.cart.cart,
    reviewStatus: state.cart.reviewStatus,
    enableSendMessage: state.main.enableSendMessage,
    addedTherapy: state.cart.addedTherapy,
    sticky_note: props.initData.sticky_note,
    reviewData: props.initData.reviewData,
    reviews: state.main.reviews,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
    testimonials_product: props.initData.testimonials_product,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductPage)
