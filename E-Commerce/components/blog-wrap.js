import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import LazyLoad from 'react-lazy-load'

class BlogWrap extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.renderMoreBlogPosts = this.renderMoreBlogPosts.bind(this)
    this.loadMore = this.loadMore.bind(this)
  }

  loadMore() {
    this.props.loadMore()
  }

  renderMoreBlogPosts(b, index) {
    const { blogposts = [], country, lang } = this.props
    var arr = []
    for (var i = 3; i < blogposts.length; i += 3) {
      if (blogposts[i]) {
        var fimage = blogposts[i].profile_image[0],
          fimage1 = blogposts[i].profile_image[1]
      }

      if (blogposts[i + 1]) {
        var simage = blogposts[i + 1].profile_image[0],
          simage1 = blogposts[i + 1].profile_image[1]
      }

      if (blogposts[i + 2]) {
        var timage = blogposts[i + 2].profile_image[0],
          timage1 = blogposts[i + 2].profile_image[1]
      }

      arr.push(
        <div key={Math.random()} className='row row-wrap w'>
          {blogposts[i] && (
            <Link
              href={'/blog-post'}
              as={`/${lang}-${country}/blog/${blogposts[i].url}`}>
              <a className='col-md-6 h-100 no-underline'>
                <div className='blog-widget-wrap'>
                  <div className='top pointer'>
                    <p className='title'>{blogposts[i].title}</p>
                    <div className='arrow-wrap-2'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 40.59 40.59'>
                        <title>arrow-right</title>
                        <g data-name='PRODUKT 4d'>
                          <circle
                            className='blog-read-more-icon'
                            cx='20.29'
                            cy='20.29'
                            r='19.54'
                          />
                          <polyline
                            className='blog-read-more-icon'
                            points='18.93 10.37 28.86 20.29 18.93 30.22'
                          />
                          <line
                            className='blog-read-more-icon'
                            x1='9.22'
                            y1='20.1'
                            x2='28.86'
                            y2='20.1'
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className='bottom'>
                    <LazyLoad offset={0} debounce={false}>
                      <img
                        alt={blogposts[i].title}
                        className='w-100 h-100'
                        srcSet={`
                    ${fimage && fimage.link} 1x, ${
                          fimage1 && fimage1.link
                        } 2x, ${fimage && fimage.link} 3x`}
                        src={fimage && fimage.link}
                      />
                    </LazyLoad>
                  </div>
                </div>
              </a>
            </Link>
          )}
          <div className='col-md-6 second mt-3 mt-md-0'>
            <div className='row-wrap h-100 pt-2 pt-md-0'>
              {blogposts[i + 1] && (
                <Link
                  href='/blog-post'
                  as={`/${lang}-${country}/blog/${blogposts[i + 1].url}`}>
                  <a className='no-underline'>
                    <div className='top-b blog-widget-wrap'>
                      <div className='row h-100'>
                        <div className='col-md-5 right order-2 order-md-1 h-100 pointer'>
                          <LazyLoad offset={0} debounce={false}>
                            <img
                              alt={blogposts[i + 1].title}
                              className='w-100 h-100'
                              srcSet={`
                      ${simage && simage.link} 1x, ${
                                simage1 && simage1.link
                              } 2x, ${simage && simage.link} 3x`}
                              src={simage && simage.link}
                            />
                          </LazyLoad>
                        </div>
                        <div className='col-md-7 order-1 order-md-2 left-wrap'>
                          <div className='left h-100'>
                            <p className='title'>{blogposts[i + 1].title}</p>
                            <div className='arrow-wrap'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 40.59 40.59'>
                                <title>arrow-right</title>
                                <g data-name='PRODUKT 4d'>
                                  <circle
                                    className='blog-read-more-icon'
                                    cx='20.29'
                                    cy='20.29'
                                    r='19.54'
                                  />
                                  <polyline
                                    className='blog-read-more-icon'
                                    points='18.93 10.37 28.86 20.29 18.93 30.22'
                                  />
                                  <line
                                    className='blog-read-more-icon'
                                    x1='9.22'
                                    y1='20.1'
                                    x2='28.86'
                                    y2='20.1'
                                  />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              )}
              {blogposts[i + 2] && (
                <Link
                  href={'/blog-post'}
                  as={`/${lang}-${country}/blog/${blogposts[i + 2].url}`}>
                  <a className='no-underline'>
                    <div className='bott-b blog-widget-wrap'>
                      <div className='row h-100'>
                        <div className='col-md-5 right order-2 order-md-1 h-100 pointer'>
                          <LazyLoad offset={0} debounce={false}>
                            <img
                              alt={blogposts[i + 2].title}
                              className='w-100 h-100'
                              srcSet={`
                          ${timage && timage.link} 1x, ${
                                timage1 && timage1.link
                              } 2x, ${timage && timage.link} 3x`}
                              src={timage && timage.link}
                            />
                          </LazyLoad>
                        </div>
                        <div className='col-md-7 left-wrap order-1 order-md-2'>
                          <div className='left h-100'>
                            <p className='title'>{blogposts[i + 2].title}</p>
                            <div className='arrow-wrap'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 40.59 40.59'>
                                <title>arrow-right</title>
                                <g data-name='PRODUKT 4d'>
                                  <circle
                                    className='blog-read-more-icon'
                                    cx='20.29'
                                    cy='20.29'
                                    r='19.54'
                                  />
                                  <polyline
                                    className='blog-read-more-icon'
                                    points='18.93 10.37 28.86 20.29 18.93 30.22'
                                  />
                                  <line
                                    className='blog-read-more-icon'
                                    x1='9.22'
                                    y1='20.1'
                                    x2='28.86'
                                    y2='20.1'
                                  />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>,
      )
    }

    return arr
  }

  render() {
    const {
      language,
      lang,
      country,
      blogposts = [],
      multiple,
      hasMoreBlogs,
      post,
      withHeading = true,
    } = this.props
    if (blogposts[0]) {
      var fimage = blogposts[0].profile_image[0],
        fimage1 = blogposts[0].profile_image[1]
    }

    if (blogposts[1]) {
      var simage = blogposts[1].profile_image[0],
        simage1 = blogposts[1].profile_image[1]
    }

    if (blogposts[2]) {
      var timage = blogposts[2].profile_image[0],
        timage1 = blogposts[2].profile_image[1]
    }
    if (blogposts[3]) {
      var dimage = blogposts[3].profile_image[0],
        dimage1 = blogposts[3].profile_image[1],
        dimage2 = blogposts[3].profile_image[2]
    }
    return (
      <div className='container-fluid blog-wraper'>
        <div className='container'>
          {withHeading && (
            <React.Fragment>
              {' '}
              <h2 className='blog-heading'>
                {language.blog.data.blogtitle.value}
              </h2>
              <div className='border blog-border'></div>
            </React.Fragment>
          )}
          <div className='posts-wrap row'>
            {blogposts[0] && (
              <Link
                href={'/blog-post'}
                as={`/${lang}-${country}/blog/${blogposts[0].url}`}>
                <a className='col-md-6 blog-left-col h-100 no-underline'>
                  <div className='blog-widget-wrap'>
                    <div className='top pointer'>
                      <p className='title'>{blogposts[0].title}</p>
                      <div className='arrow-wrap-2'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 40.59 40.59'>
                          <title>arrow-right</title>
                          <g data-name='PRODUKT 4d'>
                            <circle
                              className='blog-read-more-icon'
                              cx='20.29'
                              cy='20.29'
                              r='19.54'
                            />
                            <polyline
                              className='blog-read-more-icon'
                              points='18.93 10.37 28.86 20.29 18.93 30.22'
                            />
                            <line
                              className='blog-read-more-icon'
                              x1='9.22'
                              y1='20.1'
                              x2='28.86'
                              y2='20.1'
                            />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className='bottom pointer'>
                      <LazyLoad offset={0} debounce={false}>
                        <img
                          alt={blogposts[0].title}
                          className='w-100 h-100'
                          srcSet={`
                ${fimage && fimage.link} 1x, ${fimage1 && fimage1.link} 2x, ${
                            fimage && fimage.link
                          } 3x`}
                          src={fimage && fimage.link}
                        />
                      </LazyLoad>
                    </div>
                  </div>
                </a>
              </Link>
            )}
            <div className='col-md-6 second blog-right-col mt-3 mt-md-0'>
              <div className='row-wrap h-100 pt-2 pt-md-0'>
                {blogposts[1] && (
                  <Link
                    href={'/blog-post'}
                    as={`/${lang}-${country}/blog/${blogposts[1].url}`}>
                    <a className='no-underline'>
                      <div className='top-b blog-widget-wrap'>
                        <div className='row h-100'>
                          <div className='col-md-5 right order-2 order-md-1 h-100 pointer'>
                            <LazyLoad offset={0} debounce={false}>
                              <img
                                alt={blogposts[1].title}
                                className='w-100 h-100'
                                srcSet={`
                      ${simage && simage.link} 1x, ${
                                  simage1 && simage1.link
                                } 2x, ${simage && simage.link} 3x`}
                                src={simage && simage.link}
                              />
                            </LazyLoad>
                          </div>
                          <div className='col-md-7 order-1 order-md-2 left-wrap'>
                            <div className='left h-100'>
                              <p className='title'>{blogposts[1].title}</p>
                              <div className='arrow-wrap'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  viewBox='0 0 40.59 40.59'>
                                  <title>arrow-right</title>
                                  <g data-name='PRODUKT 4d'>
                                    <circle
                                      className='blog-read-more-icon'
                                      cx='20.29'
                                      cy='20.29'
                                      r='19.54'
                                    />
                                    <polyline
                                      className='blog-read-more-icon'
                                      points='18.93 10.37 28.86 20.29 18.93 30.22'
                                    />
                                    <line
                                      className='blog-read-more-icon'
                                      x1='9.22'
                                      y1='20.1'
                                      x2='28.86'
                                      y2='20.1'
                                    />
                                  </g>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                )}
                <div className='bott-b blog-widget-wrap'>
                  {blogposts[2] && (
                    <Link
                      href={'/blog-post'}
                      as={`/${lang}-${country}/blog/${blogposts[2].url}`}>
                      <a className='no-underline'>
                        <div className='row h-100'>
                          <div className='col-md-5 right order-2 order-md-1 h-100 pointer'>
                            <LazyLoad offset={0} debounce={false}>
                              <img
                                alt={blogposts[2].title}
                                className='w-100 h-100'
                                srcSet={`
                      ${timage && timage.link} 1x, ${
                                  timage1 && timage1.link
                                } 2x, ${timage && timage.link} 3x`}
                                src={timage && timage.link}
                              />
                            </LazyLoad>
                          </div>
                          <div className='col-md-7 left-wrap order-1 order-md-2'>
                            <div className='left h-100'>
                              <p className='title'>{blogposts[2].title}</p>
                              <div className='arrow-wrap'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  viewBox='0 0 40.59 40.59'>
                                  <title>arrow-right</title>
                                  <g data-name='PRODUKT 4d'>
                                    <circle
                                      className='blog-read-more-icon'
                                      cx='20.29'
                                      cy='20.29'
                                      r='19.54'
                                    />
                                    <polyline
                                      className='blog-read-more-icon'
                                      points='18.93 10.37 28.86 20.29 18.93 30.22'
                                    />
                                    <line
                                      className='blog-read-more-icon'
                                      x1='9.22'
                                      y1='20.1'
                                      x2='28.86'
                                      y2='20.1'
                                    />
                                  </g>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          {blogposts[3] && !multiple ? (
            <div className='down-wrap row'>
              <Link
                href={'/blog-post'}
                as={`/${lang}-${country}/blog/${blogposts[3].url}`}>
                <a className='col-md-6 b-image-wrap no-underline'>
                  <div className='blog-widget-wrap h-100'>
                    <div className='row h-100'>
                      <div className='col-md-5 right order-2 order-md-1 h-100 pointer'>
                        <LazyLoad offset={0} debounce={false}>
                          <img
                            alt={blogposts[3].title}
                            className='w-100 h-100'
                            srcSet={`
                    ${dimage2 && dimage2.link} 1x, ${
                              dimage1 && dimage1.link
                            } 2x, ${dimage && dimage.link} 3x`}
                            src={dimage && dimage.link}
                          />
                        </LazyLoad>
                      </div>
                      <div className='col-md-7 left-wrap  order-1 order-md-'>
                        <div className='left blue-back h-100'>
                          <p className='title'>{blogposts[3].title}</p>
                          <div className='arrow-wrap'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 40.59 40.59'>
                              <title>arrow-right</title>
                              <g data-name='PRODUKT 4d'>
                                <circle
                                  className='blog-read-more-icon'
                                  cx='20.29'
                                  cy='20.29'
                                  r='19.54'
                                />
                                <polyline
                                  className='blog-read-more-icon'
                                  points='18.93 10.37 28.86 20.29 18.93 30.22'
                                />
                                <line
                                  className='blog-read-more-icon'
                                  x1='9.22'
                                  y1='20.1'
                                  x2='28.86'
                                  y2='20.1'
                                />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
              <Link href={'/blog'} as={`/${lang}-${country}/blog`}>
                <a className='no-underline col-md-6 rose-wrap mt-xs-3 pointer'>
                  <div className='rose h-100'>
                    <p className='blog-link'>
                      {language.blog.data.bloglastlink.value}
                    </p>
                    <div className='arrow-wrap'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 40.59 40.59'>
                        <title>arrow-right</title>
                        <g data-name='PRODUKT 4d'>
                          <circle
                            className='blog-read-more-icon'
                            cx='20.29'
                            cy='20.29'
                            r='19.54'
                          />
                          <polyline
                            className='blog-read-more-icon'
                            points='18.93 10.37 28.86 20.29 18.93 30.22'
                          />
                          <line
                            className='blog-read-more-icon'
                            x1='9.22'
                            y1='20.1'
                            x2='28.86'
                            y2='20.1'
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ) : (
            this.renderMoreBlogPosts()
          )}
        </div>
        {multiple && !post && hasMoreBlogs && (
          <div className='text-center button-w-amb bot-blog-m'>
            <button
              onClick={this.loadMore}
              className='mx-auto btn btn-primary amb-b'>
              {language.blog.data.blogbuttonmore.value}
            </button>
          </div>
        )}
      </div>
    )
  }
}

BlogWrap.propTypes = {
  blogposts: PropTypes.array.isRequired,
  lang: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
}

export default BlogWrap
