import Router from 'next/router'
import React from 'react'
import { connect } from 'react-redux'
import { FacebookShareButton } from 'react-share'
import { bindActionCreators } from 'redux'
import { addToCart, openCartModal } from '../actions/cartActions.js'
import { subscribe } from '../actions/mainActions'
import BlogWrap from '../components/blog-wrap'
import CartModal from '../components/cart_modal'
import CategoryTag from '../components/category-tag'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class BlogPost extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.subscribe = this.subscribe.bind(this)
    this.renderSingleProduct = this.renderSingleProduct.bind(this)
    this.changeCategory = this.changeCategory.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  addToCart = therapy => () => {
    this.props.addToCart({ therapy, new_quantity: 1 }, this.props.currency)
    this.props.openCartModal()
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  renderSingleProduct(row, index) {
    return (
      <div key={index} className='col-md-12 acc-wrap align-self-end'>
        <div
          className='ac-image-w'
          style={{
            backgroundImage: `url(${
              row.profile_image && row.profile_image.link
            })`,
          }}></div>
        <div className='ac-text-wrap'>
          <p className='rose'>{row.view_label || row.name}</p>
          <p className='precrtana'>
            {(row.inflated_price || row.regular_price || 0).toFixed(
              this.props.fixed,
            )}{' '}
            {this.props.currency.symbol}
          </p>
          <p className='cena'>
            {' '}
            {(row.total_price || row.reduced_price || 0).toFixed(
              this.props.fixed,
            )}{' '}
            {this.props.currency.symbol}
          </p>
          <button
            onClick={this.addToCart(row)}
            className='btn btn-primary btn-cart-small'>
            <img
              alt='image'
              className='cart-image'
              src='/static/images/add-to-cart.svg'
            />
            {this.props.language.main.data.addtocart.value}
          </button>
        </div>
      </div>
    )
  }

  changeCategory(row) {
    Router.push(
      `${ROOT_URL}/${this.props.lang}-${this.props.country}/blog/category/${row.name}`,
    )
  }

  closeCartModal = () => {
    this.props.closeCartModal()
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      blogpost,
      blog_categories,
      currency,
      countries,
      sticky_note,
      addedTherapy,
      open_cart_modal,
      cart,
      locale,
      fixed,
      all_routes,
    } = this.props
    var tags = []
    if (blogpost)
      blogpost.tags.map(c => {
        tags.push({ active: false, name: c })
      })
    var categories = []
    blog_categories.map(c => {
      categories.push({ active: false, name: c.name })
    })
    var products = (blogpost && blogpost.accessories) || []
    if (products.length == 0) {
      products = (blogpost && blogpost.therapies) || []
    }
    if (blogpost && blogpost.profile_image) {
      var timage = blogpost.profile_image[0],
        timage1 = blogpost.profile_image[1],
        timage2 = blogpost.profile_image[2]
    }
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        routes={routes}
        blogDet={blogpost}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='blog-title-wrap'>
          <div className='container'>
            <h2
              className='blog-post-title'
              dangerouslySetInnerHTML={{
                __html: language.blog.data.blogsitetitle.value,
              }}></h2>
            <div className='blog-p-t-border'></div>
          </div>
        </div>
        <div className='container categories-cont b-p'>
          <CategoryTag
            renderTags={false}
            changeCategory={this.changeCategory}
            blog_categories={categories}
            blog_tags={tags}
          />
        </div>
        <div className='container blog-post-wrap'>
          <div className='row'>
            <div className='col-md-8 post-wrap'>
              <div className='border-b-p'></div>
              <h1 className='title'>{blogpost && blogpost.title}</h1>
              <img
                className='w-100 blog-t-image'
                alt='blog-image'
                src={timage && timage.link}
                srcSet={`
              ${timage && timage.link} 1000w, ${timage1 && timage1.link} 500w,
              ${timage2 && timage2.link} 240w`}
              />
              <div
                className='content'
                dangerouslySetInnerHTML={{
                  __html: blogpost && blogpost.content,
                }}></div>
            </div>
            <div className='col-md-4 products-wrap'>
              <div className='border-b-p'></div>
              <p className='title'>{language.blog.data.btshare.value}</p>
              <div className='soc-wrap d-flex'>
                <FacebookShareButton
                  url={`https://E-Commerce.com/${this.props.lang}-${
                    this.props.country
                  }/blog/${blogpost && blogpost.url}`}>
                  <img
                    className='soc-i pointer'
                    alt='image'
                    src='/static/images/footer-facebook.1.svg'
                  />
                </FacebookShareButton>
              </div>
              <div className='border-b-p'></div>
              <p className='title'>{language.blog.data.btoiz.value}</p>
              <div className='row'>
                {products.map(this.renderSingleProduct)}
              </div>
            </div>
          </div>
        </div>
        <div className='blog'>
          <BlogWrap
            multiple={true}
            post={true}
            language={language}
            lang={lang}
            country={country}
            blogposts={(blogpost && blogpost.related_blogposts) || []}
          />
        </div>
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
      </Layout>
    )
  }
}

BlogPost.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/blog_post`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    closeCartModal: bindActionCreators(openCartModal, dispatch),
    subscribe: bindActionCreators(subscribe, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    subscribe_result: state.main.subscribe_result,
    blogpost: props.blogpost,
    blog_categories: props.blog_categories,
    blog_tags: props.blog_tags,
    routes: props.language.routes,
    cart: state.cart.cart,
    open_cart_modal: state.cart.open_cart_modal,
    currency: props.initData.currency,
    addedTherapy: state.cart.addedTherapy,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlogPost)
