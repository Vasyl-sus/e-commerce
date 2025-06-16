const express = require('express')
const next = require('next')
var path = require('path')
var bodyParser = require('body-parser')
var config = require('./config/environment')
var logger = require('./utils/logger')
const session = require('express-session')
var pool = require('./utils/mysqlService')
var MySQLStore = require('express-mysql-session')(session)
var bluebird = require('bluebird')
var compression = require('compression')
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
const { parse } = require('url')
const cors = require('cors')
const services = require('./utils/services')
const langController = require('./modules/lang/langController.js')
const Lang = require('./modules/lang/langModel.js')
const utmMiddleware = require('./middleware/utmMiddleware')
const couponMiddleware = require('./middleware/couponMiddleware')
const cookieParser = require('cookie-parser')

const port = config.server.port
gracefulFs.gracefulify(realFs)
process.env.UV_THREADPOOL_SIZE = 128

const dev =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
const app = next({ dev })
const handle = app.getRequestHandler()

const unless = (paths, middleware) => {
  return function (req, res, next) {
    let isHave = false
    paths.forEach(path => {
      if (path === req.path || req.path.includes(path)) {
        isHave = true
      }
    })
    if (isHave) {
      return next()
    }
    return middleware(req, res, next)
  }
}

const redirects = {
  blog: '/sl-si/blog',
  'krema-proti-gubicam': '/sl-si/krema-proti-gubicam-4d-hyaluron',
  'serum-za-rast-trepalnic': '/sl-si/serum-za-rast-trepalnic-eyelash',
  'serum-za-rast-trepalnic-eyelash': '/sl-si/serum-za-rast-trepalnic-eyelash',
  'Serum-za-rast-trepalnic-E-Commerce-je-popolnoma-naraven':
    '/sl-si/serum-za-rast-trepalnic-eyelash',
  'mazilo-za-nego-tetovaze': '/sl-si/mazilo-za-nego-tetovaze-tattoo-nano-shock',
  'izjave-zadovoljnih-uporabnikov': '/sl-si/izjave-zadovoljnih-uporabnikov',
  hr: '/hr-hr/index',
  'hr/krema-protiv-bora': '/hr-hr/krema-protiv-bora-4d-hyaluron',
  'hr/serum-za-rast-trepavica': '/hr-hr/serum-za-rast-trepavica-eyelash',
  'hr/krema-za-njegu-tetovaze':
    '/hr-hr/krema-za-njegu-tetovaze-tattoo-nano-shock',
  'hr/blog': '/hr-hr/blog',
  sk: '/sk-sk/index',
  'sk/krem-proti-vraskam': '/sk-sk/krem-proti-vraskam-4d-hyaluron',
  'sk/serum-na-rast-mihalnic': '/sk-sk/serum-na-rast-mihalnic-eyelash',
  'sk/krem-na-starostlivost-o-tetovanie':
    '/sk-sk/krem-na-starostlivost-o-tetovanie-tattoo-nano-shock',
  'sk/blog': '/sk-sk/blog',
  hu: '/hu-hu/index',
  'hu/ranctalanito-krem': '/hu-hu/4d-hyaluron-ranctalanito-krem',
  'hu/szempillanoveszto-szerum': '/hu-hu/eyelash-szempillanoveszto-szerum',
  'hu/kenocs-a-tetovalas-apolasara':
    '/hu-hu/tattoo-nano-shock-kenocs-a-tetovalas-apolasara',
  'hu/blog': '/hu-hu/blog',
  'serum-za-rast-trepavica': '/hr-hr/serum-za-rast-trepavica-eyelash',
  'ranctalanito-krem': '/hu-hu/4d-hyaluron-ranctalanito-krem',
  'serum-na-rast-mihalnic': '/sk-sk/serum-na-rast-mihalnic-eyelash',
  'szempillanoveszto-szerum': '/hu-hu/eyelash-szempillanoveszto-szerum',
  'hu-hu/szempillanoveszto-szerumeyelashm':
    '/hu-hu/eyelash-szempillanoveszto-szerum',
  'krem-proti-vraskam': '/sk-sk/krem-proti-vraskam-4d-hyaluron',
  'krema-protiv-bora': '/hr-hr/krema-protiv-bora-4d-hyaluron',
  '%20': '/',
  'krem-na-starostlivost-o-tetovanie':
    '/sk-sk/krem-na-starostlivost-o-tetovanie-tattoo-nano-shock',
  'serum-za-rast-las': '/',
  'serum-za-rast-kose': '/',
  'krema-za-njegu-tetovaze': '/hr-hr/krema-za-njegu-tetovaze-tattoo-nano-shock',
  'crema-contro-le-rughe': '/',
  'krema-protiv-bora%20': '/hr-hr/krema-protiv-bora-4d-hyaluron',
  'siero-per-la-crescita-delle-ciglia': '/',
}

const deepunless = (paths, middleware) => {
  return function (req, res, next) {
    let rp = req.path.split('/')
    let isHave = false
    paths.forEach(path => {
      if (path !== rp[1] || !rp[1].includes(path)) {
        isHave = true
      }
    })
    if (isHave) {
      return next()
    }
    return middleware(req, res, next)
  }
}

app
  .prepare()
  .then(() => {
    const server = express()

    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(cookieParser());

    var sessionStore = new MySQLStore({}, pool)


    server.use(
      session({
        key: 'E-Commerce-cookie',
        secret: 'lux-cookie-secret',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 2592000000,
        },
      }),
    )

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error('server.js: pool.getConnection - ERROR: ' + err.message)
        return
      }

      logger.info('Connected to database : ' + config.connection.host)
      server.use((req, res, next) => {
        // Also expose the Mysql database handle so Next.js can access it.
        req.db = connection
        next()
      })

      server.use(cors())
      server.use(compression({ level: 9 }))

      server.use(
        unless(
          ['/_next', '/_webpack', '/static', '/public'],
          (req, res, next) => {
            const { method, url } = req
            logger.info(`${method} ${url} ${res.statusCode}`)
            next()
          },
        ),
      )

      server.get('/*', function (req, res, next) {
        if (
          req.url.indexOf('/public/') === 0 ||
          req.url.indexOf('/_next/') === 0
        ) {
          res.setHeader('Cache-Control', 'public, max-age=2592000')
          res.setHeader(
            'Expires',
            new Date(Date.now() + 2592000000).toUTCString(),
          )
        } else {
          res.setHeader('Expires', new Date(Date.now() + 1).toUTCString())
        }
        next()
      })

      // Dynamic routing
      var orderRouter = require('./modules/order/orderRouter')
      server.use('/order', orderRouter)

      var cartRouter = require('./modules/cart/cartRouter')
      server.use('/cart', cartRouter)

      var langRouter = require('./modules/lang/langRouter')
      server.use('/lang', langRouter)

      var languageRouter = require('./modules/language/languageRouter')
      server.use('/language', languageRouter)

      var subscriberRouter = require('./modules/subscriber/subscriberRouter')
      server.use('/subscribe', subscriberRouter)

      var blogRouter = require('./modules/blog/blogRouter')
      server.use('/blogpost', blogRouter)

      var mailRouter = require('./modules/mail/mailRouter')
      server.use('/mail', mailRouter)

      var stripeRouter = require('./modules/stripe-payment/stripeRouter')
      server.use('/stripe', stripeRouter)

      var facebookRouter = require("./modules/facebook/facebookRouter")
      server.use('/facebook', facebookRouter)
      
      var googleAnalyticsRouter = require("./modules/google-analytics/gaRouter")
      server.use('/google-analytics', googleAnalyticsRouter)

      var paymentRouter = require("./modules/payment/paymentRouter")
      server.use('/payment', paymentRouter)

      server.use(
        '/',
        express.static(path.join(config.server.basePath, '/public'), {
          maxAge: 86400000,
        }),
      )

      // Server side rendering

      server.use(
        unless(
          [
            '/_next',
            '/_webpack',
            '/static',
            '/public',
            '/lang',
            '/cart',
            '/favicon.ico',
            '/order',
            '/site.webmanifest',
          ],
          function (req, res, next) {
            const parsedUrl = parse(req.url, true)
            const { pathname } = parsedUrl
            var splited = pathname.split('/')
            var queryLang = splited[1]
            var langC = queryLang.split('-')

            queryLang = langC[0] && langC[0].toUpperCase()
            var queryCountry = langC[1] && langC[1].toUpperCase()

            var prev_country = req.session.country
            var prev_lang = req.session.lang

            if (queryCountry && queryCountry != prev_country) {
              Lang.getCountry(queryCountry)
                .then(country_exists => {
                  if (country_exists) {
                    req.session.country = queryCountry
                    req.session.country_ddv = country_exists.ddv
                  } else {
                    req.session.country = 'SI'
                    req.session.country_ddv = 22
                  }

                  Lang.getFullLangConfig(req.session.country)
                    .then(langConfig => {
                      if (
                        langConfig &&
                        langConfig[req.session.country] &&
                        langConfig[req.session.country].length > 0
                      ) {
                        if (queryLang) {
                          var foundLang = langConfig[req.session.country].find(
                            c => {
                              return c == queryLang
                            },
                          )
                          if (foundLang) {
                            req.session.lang = queryLang
                          }
                        } else {
                          req.session.lang = langConfig[req.session.country][0]
                        }
                      }

                      if (!req.session.lang) {
                        req.session.country = 'SI'
                        req.session.country_ddv = 22
                      }
                      req.session.currency = {}
                      Lang.getCurrencyByCountry(req.session.country)
                        .then(result => {
                          req.session.currency = result
                          if (
                            req.session.currency &&
                            req.session.currency.value
                          ) {
                            req.session.currency.value = parseFloat(
                              req.session.currency.value,
                            )
                          }
                          if (
                            prev_country != req.session.country &&
                            prev_lang != req.session.lang
                          ) {
                            req.session.cart = null
                            req.session.cart = {}
                            req.session.cart.therapies = []
                            req.session.cart.accessories = []
                            req.session.cart.subtotal = 0
                            req.session.cart.discount = 0
                            req.session.cart.recalculate = false;
                            req.session.cart.shipping_fee = 0
                            req.session.cart.total = 0
                          }
                          next()
                        })
                        .catch(error => {
                          logger.error(error)
                          next()
                        })
                    })
                    .catch(error => {
                      logger.error(error)
                      next()
                    })
                })
                .catch(error => {
                  logger.error(error)
                  next()
                })
            } else {
              next()
            }
          },
        ),
      )

      server.get(
        '/',
        bluebird.coroutine(function* (req, res, next) {
          const parsedUrl = parse(req.url, true)
          const { search } = parsedUrl

          if (!req.session.country || !req.session.lang) {
            return res.redirect(
              301,
              `${config.server.url}en-gb/index${search || ''}`,
            )
          } else {
            utmMiddleware.handleUTM(req, res, next)
            couponMiddleware.handleCoupon(req, res, next)
            Lang.getAllRoutes()
              .then(all_routes => {
                var country =
                  req.session.country && req.session.country.toLowerCase()
                var lang = req.session.lang && req.session.lang.toLowerCase()

                var foundRoute = services.findRouteByPage(
                  `${lang}-${country}`,
                  '/home',
                  all_routes,
                )
                if (foundRoute)
                  return res.redirect(
                    307,
                    `${config.server.url}${lang}-${country}/${
                      foundRoute.route
                    }${search || ''}`,
                  )
                else
                  return res.redirect(
                    301,
                    `${config.server.url}en-gb/index${search || ''}`,
                  )
              })
              .catch(err => {
                logger.error(
                  'server.js: server.get("/") - ERROR: Lang.getAllRoutes: ' +
                    err.message,
                )
                return
              })
          }
        }),
      )

      server.get(
        '/:lang',
        bluebird.coroutine(function* (req, res, next) {
          const parsedUrl = parse(req.url, true)
          const { pathname } = parsedUrl
          const { search } = parsedUrl
          var splited1 = pathname.split('/')

          if (redirects[splited1[1]]) {
            console.log(1221, redirects[splited1[1]])
            console.log(
              1331,
              `${config.server.url}${redirects[splited1[1]]}${search || ''}`,
            )
            return res.redirect(
              301,
              `${config.server.url1}${redirects[splited1[1]]}${search || ''}`,
            )
          }

          var results = yield Lang.getAllRoutes()
          if (splited1[1] && splited1[1] != '') {
            let found = results.find(r => {
              return r.lang === splited1[1]
            })
            if (found) {
              var splited2 = splited1[1].split('-')

              var tasks = []
              utmMiddleware.handleUTM(req, res, next)
              couponMiddleware.handleCoupon(req, res, next)
              var country = splited2[1] //req.session.country && req.session.country.toLowerCase();
              var lang = splited2[0] //req.session.lang && req.session.lang.toLowerCase();

              var foundRoute = services.findRouteByPage(
                splited1[1],
                '/home',
                results,
              )
              if (foundRoute) {
                return res.redirect(
                  307,
                  `${config.server.url}${lang}-${country}/${foundRoute.route}${
                    search || ''
                  }`,
                )
              } else {
                next()
                // return res.redirect(301, `${config.server.url}en-gb/page404${search || ""}`);
              }
            } else {
              next()
              // return res.redirect(307, `${config.server.url}en-gb/page404`);
            }
          } else {
            next()
            // return res.redirect(307, `${config.server.url}en-gb/page404`);
          }
        }),
      )

      server.get(
        '/:lang/blog',
        bluebird.coroutine(function* (req, res, next) {
          var { lang } = req.params
          const query = req.query
          const parsedUrl = parse(req.url, true)
          const { pathname } = parsedUrl
          var splited = pathname.split('/')
          var queryLang = splited[1]
          var route = splited[2]
          if (redirects[`${queryLang}/${route}`]) {
            return res.redirect(
              301,
              `${config.server.url1}${redirects[`${queryLang}/${route}`]}`,
            )
          }
          var langC = lang.split('-')
          if (langC[0] && langC[1]) {
            var locale = yield langController.getLanguageReturn(req, res)
            utmMiddleware.handleUTM(req, res, next)
            couponMiddleware.handleCoupon(req, res, next)
            return app.render(req, res, '/blog', {
              url: req.url,
              route,
              query,
              locale,
            })
          }
        }),
      )

      server.get(
        '/:lang/blog/category/:category_link',
        bluebird.coroutine(function* (req, res, next) {
          var { lang, category_link } = req.params

          var langC = lang.split('-')
          if (langC[0] && langC[1]) {
            const query = req.query
            const parsedUrl = parse(req.url, true)
            const { pathname } = parsedUrl
            var splited = pathname.split('/')
            var route = splited[2]
            var locale = yield langController.getLanguageReturn(req, res)
            utmMiddleware.handleUTM(req, res, next)
            couponMiddleware.handleCoupon(req, res, next)
            return app.render(req, res, '/blog-category', {
              url: req.url,
              route,
              query,
              category_link,
              locale,
            })
          }
        }),
      )

      server.get(
        '/:lang/blog/:blogpost_link',
        bluebird.coroutine(function* (req, res, next) {
          var { lang, blogpost_link } = req.params
          if (blogpost_link && blogpost_link != 'undefined') {
            var langC = lang.split('-')
            if (langC[0] && langC[1]) {
              const query = req.query
              var locale = yield langController.getLanguageReturn(req, res)
              return app.render(req, res, '/blog-post', {
                url: req.url,
                route: 'blog-post',
                query,
                locale,
              })
            }
          } else {
            next()
          }
        }),
      )

      server.get(
        '/:lang/accessories/:acc_category',
        bluebird.coroutine(function* (req, res, next) {
          var { lang, acc_category } = req.params

          var langC = lang.split('-')
          if (langC[0] && langC[1]) {
            const query = req.query
            var locale = yield langController.getLanguageReturn(req, res)
            utmMiddleware.handleUTM(req, res, next)
            couponMiddleware.handleCoupon(req, res, next)
            return app.render(req, res, '/accessory-page', {
              url: req.url,
              route: 'accessory-page',
              query,
              acc_category,
              locale,
            })
          }
        }),
      )

      server.get(
        '/:lang/:routename',
        bluebird.coroutine(function* (req, res, next) {
          const parsedUrl = parse(req.url, true)
          const { pathname } = parsedUrl
          var splited = pathname.split('/')
          var queryLang = splited[1]
          var route = splited[2]
          var query = req.query
          var langC = queryLang.split('-')

          if (redirects[`${queryLang}/${route}`]) {
            return res.redirect(
              301,
              `${config.server.url1}${redirects[`${queryLang}/${route}`]}`,
            )
          } else if (queryLang == 'posts') {
            let lang = req.session.lang || 'en'
            let country = req.session.country || 'gb'
            return res.redirect(
              301,
              `${
                config.server.url
              }${lang.toLowerCase()}-${country.toLowerCase()}/blog`,
            )
          }

          if (
            langC[0] &&
            langC[1] &&
            route != 'on-demand-entries-ping' &&
            route != 'webpack-hmr'
          ) {
            var searchData = {
              country: langC[1].toUpperCase(),
              language: langC[0].toUpperCase(),
              seo_link: route,
            }
            var tasks0 = []
            tasks0.push(Lang.getAllRoutes())
            tasks0.push(Lang.getTherapiesBy(searchData))
            var results0 = yield bluebird.all(tasks0)
            var all_routes = results0[0]
            var product_therapies = results0[1]

            if (product_therapies[0]) {
              var setProductPage = true
            }
            var locale = yield langController.getLanguageReturn(req, res)

            var page
            if (setProductPage) {
              page = { page: '/product-page', redirect: false }
            } else {
              page = services.routesWithPages(queryLang, route, all_routes)
            }
            if (page.redirect) {
              utmMiddleware.handleUTM(req, res)
              couponMiddleware.handleCoupon(req, res)
              var foundRoute = services.findRouteByPage(
                queryLang,
                route,
                all_routes,
              )
              if (foundRoute)
                return res.redirect(
                  307,
                  `${config.server.url}${foundRoute.lang}/${foundRoute.route}`,
                )
              else {
                next()
                // return res.redirect(301, `${config.server.url}en-gb/page404`);
              }
            } else {
              utmMiddleware.handleUTM(req, res)
              couponMiddleware.handleCoupon(req, res)
              return app.render(req, res, page.page, {
                url: req.url,
                route,
                query,
                page,
                locale,
              })
            }
          } else {
            return handle(req, res)
          }
        }),
      )

      server.get(
        '/:lang/ambassadors/:testimonial_link',
        bluebird.coroutine(function* (req, res, next) {
          var { lang, testimonial_link } = req.params

          var langC = lang.split('-')
          if (
            langC[0] &&
            langC[1] &&
            testimonial_link &&
            testimonial_link != 'undefined'
          ) {
            const query = req.query
            var locale = yield langController.getLanguageReturn(req, res)
            utmMiddleware.handleUTM(req, res, next)
            couponMiddleware.handleCoupon(req, res, next)
            return app.render(req, res, '/ambasadors', {
              url: req.url,
              route: '/ambassadors',
              query,
              testimonial_link,
              locale,
            })
          }
        }),
      )

      server.get('*', (req, res) => {
        return handle(req, res)
      })


      server.listen(port, err => {
        if (err) {
          logger.error('server.js: server.listen - ERROR: ' + err.message)
          throw err
        }
        logger.info('> Ready on ' + config.server.hostname + ', PORT: ' + port)
      })
    })
  })
  .catch(ex => {
    logger.error('server.js: catch - ERROR: ' + ex.message)
    process.exit(1)
  })
