import Link from 'next/link'
import Router from 'next/router'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getBlogPosts, getBlogPosts1 } from '../actions/blogActions'
import { subscribe } from '../actions/mainActions'
import BlogWrap from '../components/blog-wrap'
import CategoryTag from '../components/category-tag'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import Subscribe from '../components/subscribe'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'
import { PageView as GA4PageView } from '../actions/googleAnalyticsActions'

class Blog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      categories: [],
      tags: [],
      pagination: 1,
    }

    this.blogRef = React.createRef()

    this.subscribe = this.subscribe.bind(this)

    this.changeCategory = this.changeCategory.bind(this)
    this.changeTag = this.changeTag.bind(this)
    this.getMoreBlogs = this.getMoreBlogs.bind(this)
    this.trackScrolling = this.trackScrolling.bind(this)
  }

  componentDidMount() {
    // Send to Facebook
    PageView(window.location.href);
    // Send to Google Analytics
    GA4PageView({
      url: window.location.href,
      title: document.title
    });
    
    var categories = []
    var tags = []
    this.props.blog_categories.map(b => {
      categories.push({ active: false, ...b })
    })
    let found = null
    var path = Router.router.asPath
    let splited = path.split('/')
    let cat = splited[4]
    if (cat) {
      found = categories.find(c => {
        return c.name == cat
      })
      found.active = true
    }
    this.props.blog_tags.map(b => {
      tags.push({ active: false, name: b })
    })
    this.setState({ tags, categories })
    this.props.getBlogPosts({
      cnt: this.props.country,
      category: found && found.name,
      lang: this.props.lang,
      pagination: 1,
    })
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight
  }

  trackScrolling() {
    var pagination = this.state.pagination + 1
    this.setState({ pagination })
    this.getMoreBlogs(pagination)
  }

  componentWillUnmount() {}

  getMoreBlogs(data) {
    var path = Router.router && Router.router.asPath
    let splited = path.split('/')
    let cat = splited[4]

    var statetags = this.state.tags
    let t = statetags
      .filter(s => {
        return s.active
      })
      .map(s => {
        return s.name
      })

    if (cat) {
      this.props.getBlogPosts1({
        cnt: this.props.country,
        lang: this.props.lang,
        category: cat,
        tags: t,
        pagination: data,
      })
    } else {
      this.props.getBlogPosts1({
        cnt: this.props.country,
        lang: this.props.lang,
        pagination: data,
        tags: t,
      })
    }
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  changeTag(data) {
    var statetags = this.state.tags
    var fd = statetags.find(f => {
      return f.name == data.name
    })
    fd.active = !fd.active
    this.setState({ tags: statetags, pagination: 1 })
    let t = statetags
      .filter(s => {
        return s.active
      })
      .map(s => {
        return s.name
      })

    var path = Router.router.asPath
    let splited = path.split('/')
    let cat = splited[4]

    if (cat) {
      this.props.getBlogPosts({
        pagination: 1,
        cnt: this.props.country,
        category: cat,
        lang: this.props.lang,
        tags: t,
      })
    } else {
      this.props.getBlogPosts({
        pagination: 1,
        cnt: this.props.country,
        lang: this.props.lang,
        tags: t,
      })
    }
  }

  changeCategory(data) {
    let cat = data.sef_link || data

    var query = cat != 'all' ? '/category/' + cat : ''

    var url = `/${this.props.lang}-${this.props.country}/blog${query}`

    Router.push(url)
  }

  render() {
    const {
      language,
      lang,
      country,
      langConfig,
      blogposts,
      subscribe_result,
      starredBlogpost = {},
      routes,
      hasMoreBlogs,
      currency,
      countries,
      sticky_note,
      locale,
      all_routes,
    } = this.props
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='blog'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='blog-title-wrap'>
          <div className='container'>
            <h1
              className='blog-post-title'
              dangerouslySetInnerHTML={{
                __html: language.blog.data.blogsitetitle.value,
              }}></h1>
            <div className='blog-t-border'></div>
          </div>
        </div>
        <div className='container-fluid'>
          <Link href={`/${lang}-${country}/blog/${starredBlogpost.url}`}>
            <div className='row pointer'>
              <div
                className='col-lg-8 pl-0 pr-0 main-blog-intro-article'
                style={{
                  backgroundImage: `url(${
                    starredBlogpost.big_image &&
                    starredBlogpost.big_image[0] &&
                    starredBlogpost.big_image[0].link
                  })`,
                }}></div>
              <div className='col-lg-4 main-blog-text-wrap pb-5 pb-lg-0 pl-0'>
                <h2 className='title'>{starredBlogpost.title}</h2>
                <div
                  className='description'
                  dangerouslySetInnerHTML={{
                    __html: starredBlogpost.short_content,
                  }}></div>
                <p className='button-text uppercase'>
                  {language.blog.data.middle_button.value}
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className='container categories-cont'>
          <CategoryTag
            changeTag={this.changeTag}
            changeCategory={this.changeCategory}
            blog_categories={this.state.categories}
            blog_tags={this.state.tags}
          />
          <div className='border'></div>
        </div>
        <div className='container subs-blog'>
          <Subscribe
            language={language}
            subscribe_result={subscribe_result}
            subscribe={this.subscribe}
            type='home'
          />
        </div>
        <div ref={this.blogRef} className='blog'>
          <BlogWrap
            hasMoreBlogs={hasMoreBlogs}
            loadMore={this.trackScrolling}
            language={language}
            multiple={true}
            lang={lang}
            country={country}
            blogposts={blogposts}
          />
        </div>
      </Layout>
    )
  }
}

Blog.getInitialProps = async function (context) {

  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/blog`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    subscribe: bindActionCreators(subscribe, dispatch),
    getBlogPosts: bindActionCreators(getBlogPosts, dispatch),
    getBlogPosts1: bindActionCreators(getBlogPosts1, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    subscribe_result: state.main.subscribe_result,
    blogposts: state.blog.blogs,
    blog_categories: props.blog_categories,
    blog_tags: props.blog_tags,
    query: props.query,
    starredBlogpost: props.starredBlogpost,
    routes: props.language.routes,
    currency: props.initData.currency,
    countries: props.initData.countries,
    hasMoreBlogs: state.blog.hasMoreBlogs,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Blog)
