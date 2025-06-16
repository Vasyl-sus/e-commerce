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
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class BlogCategory extends React.Component {
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
    PageView(window.location.href);
    var categories = []
    var tags = []
    this.props.blog_categories.map(b => {
      categories.push({ active: false, ...b })
    })

    this.props.blog_tags.map(b => {
      tags.push({ active: false, name: b })
    })
    this.setState({ tags, categories })
    this.props.getBlogPosts({
      cnt: this.props.country,
      category: this.props.category_link,
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
    this.setState({ tags: statetags })
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
      blog_categories,
      routes,
      currency,
      countries,
      category_link,
      sticky_note,
      locale,
      all_routes,
    } = this.props
    let thisCategory =
      blog_categories.find(b => {
        return b.sef_link === category_link
      }) || null
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        categoryMetas={thisCategory}
        countries={countries}
        page='blog-category'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='blog-title-wrap'>
          <div className='container'>
            <h1
              className='blog-title'
              dangerouslySetInnerHTML={{
                __html: language.blog.data.blogsitetitle.value,
              }}></h1>
            <div className='blog-t-border'></div>
          </div>
        </div>
        <div className='container categories-cont'>
          <CategoryTag
            changeTag={this.changeTag}
            renderTags={false}
            changeCategory={this.changeCategory}
            blog_categories={this.state.categories}
            blog_tags={this.state.tags}
          />
        </div>
        <div ref={this.blogRef} className='blog'>
          <BlogWrap
            withHeading={false}
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

BlogCategory.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
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
    hasMoreBlogs: state.blog.hasMoreBlogs,
    currency: props.initData.currency,
    countries: props.initData.countries,
    category_link: props.category_link,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlogCategory)
