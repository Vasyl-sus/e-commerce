var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');
var config = require("./config/environment/index");
var logger = require('./utils/logger');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var expressWinston = require('express-winston');
var helmet = require('helmet');
var compression = require('compression');
var cors = require('cors');
var realFs = require('graceful-fs');
var gracefulFs = require('graceful-fs');
var pool = require('./utils/mysqlService');
gracefulFs.gracefulify(realFs);
process.env.UV_THREADPOOL_SIZE = 128;
const customBodyParser = require('./utils/customParser');

var initilize = require('./initialize');
const cron = require('./cron');

const isDev = process.env.NODE_ENV !== "production";

/* MIDDLEWARE */
// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://stackpath.bootstrapcdn.com",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
          isDev ? "'unsafe-inline'" : "",
          isDev ? "'unsafe-eval'" : "", // Allow eval only in development
        ].filter(Boolean), // Removes empty values
        imgSrc: [
          "'self'", 
          "data:", 
          "blob:",
          "https://E-commerce.com", 
          "https://admin.E-commerce.com", 
          "https://cdn.E-commerce.com", 
          "https://E-commerce.s3.eu-central-1.amazonaws.com",
          "https://c8276b7cf5d90cd6906189089ae426c5.r2.cloudflarestorage.com",
          "http://localhost:8080"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Needed for inline styles (consider removing)
          "https://stackpath.bootstrapcdn.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: [
          "'self'", 
          "data:", 
          "https://fonts.gstatic.com", 
          "https://ka-f.fontawesome.com"
        ],
        connectSrc: [
          "'self'",
          ...(isDev ? ["http://localhost:3000"] : []), // Allow localhost only in dev
          "http://localhost:12255", // VCC app URL for both dev and production
          "https://E-commerce.com",
          "https://www.google-analytics.com",
          "https://ka-f.fontawesome.com",
          "https://luxapi.dev",
        ],
        mediaSrc: ["'self'", "https://E-commerce.com"], // Add if media files are loaded
        frameSrc: ["'none'"], // If embedding YouTube/Vimeo, add domains here
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [], // Enforces HTTPS
      },
    },
  })
);
app.use(compression({ 
  level: 9,
  filter: (req, res) => {
    if (res.getHeader('Content-Type') === 'application/pdf') {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(customBodyParser());

var options = {
  charset: 'utf8mb4_bin',
  schema: {
      tableName: 'sessions_admin',
      columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
      }
  }
}

var sessionStore = new MySQLStore(options, pool);

app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 2592000000
  }
}));

app.use(function (err, req, res, next) {
  if (err) {
    logger.error(err);
    res.status(500).json({ error: "Something bad happened" });
  }
  else {
    res.status(404).json({ error: "Not found" });
  }
});

app.use(expressWinston.logger({
  transports: [logger.transports[0], logger.transports[2]],
  meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: true,
  ignoreRoute: function (req, res) {
    var ignore_paths = ["/_next", "/__webpack_hmr", "/static", "/css/", "/js/", "/dist/", "/fonts/", "/images/" ];
    for(var i=0;i<ignore_paths.length;i++){
      if(ignore_paths[i] == req.path || req.path.includes(ignore_paths[i]))
        return true;
    }
    return false;
  }
}));


app.get('/*', function (req, res, next) {
  // if (req.url.indexOf("/admin/admin/init") === 0 || req.url.indexOf("/dist") === 0 || req.url.indexOf("/js" || req.url.indexOf("/css") === 0) === 0) {
  if (req.url.indexOf("/dist") === 0 || req.url.indexOf("/js" || req.url.indexOf("/css") === 0) === 0) {
    res.setHeader("Cache-Control", "public, max-age=86400000");
    res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());
  }
  next();
});

/* ROUTES */
var authRouter = require('./modules/auth/authRouter');
app.use('/auth', authRouter);

var customerRouter = require('./modules/customer/customerRouter');
app.use('/admin/customer', customerRouter);

var discountRouter = require('./modules/discount/discountRouter');
app.use('/admin/discount', discountRouter);

var productRouter = require('./modules/product/productRouter');
app.use('/admin/product', productRouter);

var influencersRouter = require('./modules/influencers/influencersRouter');
app.use('/admin/influencers', influencersRouter);

var currencyRouter = require('./modules/currency/currencyRouter');
app.use('/admin/currency', currencyRouter);

var paymentmethodRouter = require('./modules/paymentmethod/paymentmethodRouter');
app.use('/admin/paymentmethod', paymentmethodRouter);

var deliverymethodRouter = require('./modules/deliverymethod/deliverymethodRouter');
app.use('/admin/deliverymethod', deliverymethodRouter);

var smstemplateRouter = require('./modules/smstemplate/smstemplateRouter');
app.use('/admin/smstemplate', smstemplateRouter);

var orderstatusRouter = require('./modules/orderstatus/orderstatusRouter');
app.use('/admin/orderstatus', orderstatusRouter);

var utmmediumRouter = require('./modules/utmmedium/utmmediumRouter');
app.use('/admin/utmmedium', utmmediumRouter);

var admingroupRouter = require('./modules/admingroup/admingroupRouter');
app.use('/admin/admingroup', admingroupRouter);

var adminRouter = require('./modules/admin/adminRouter');
app.use('/admin/admin', adminRouter);

var therapyRouter = require('./modules/therapy/therapyRouter');
app.use('/admin/therapy', therapyRouter);

var blogpostRouter = require('./modules/blogpost/blogpostRouter');
app.use('/admin/blogpost', blogpostRouter);

var testimonialRouter = require('./modules/testimonial/testimonialRouter');
app.use('/admin/testimonial', testimonialRouter);

var userTestimonialRouter = require('./modules/user-testimonial/userTestimonialRouter');
app.use('/admin/user-testimonial', userTestimonialRouter);

var mediumRouter = require('./modules/medium/mediumRouter');
app.use('/admin/medium', mediumRouter);

var stockreminderRouter = require('./modules/stockreminder/stockreminderRouter');
app.use('/admin/stockreminder', stockreminderRouter);

var orderRouter = require('./modules/order/orderRouter');
app.use('/admin/order', orderRouter);

var statisticsRouter = require('./modules/statistics/statisticsRouter');
app.use('/admin/statistics', statisticsRouter);

var landingsRouter = require('./modules/landings/landingsRouter');
app.use('/admin/landings', landingsRouter);

var colorRouter = require('./modules/color/colorRouter');
app.use('/admin/color', colorRouter);

var countryRouter = require('./modules/country/countryRouter');
app.use('/admin/country', countryRouter);

var stickynoteRouter = require('./modules/stickynote/stickynoteRouter');
app.use('/admin/stickynote', stickynoteRouter);

var vccRouter = require('./modules/vcc/vccRouter');
app.use('/admin/vcc', vccRouter);

var expenseRouter = require('./modules/expense/expenseRouter');
app.use('/admin/expense', expenseRouter);

var giftRouter = require('./modules/gift/giftRouter');
app.use('/admin/gift', giftRouter);

var accessoryRouter = require('./modules/accessory/accessoryRouter');
app.use('/admin/accessory', accessoryRouter);

var badgeRouter = require('./modules/badge/badgeRouter');
app.use('/admin/badge', badgeRouter);

var categoryRouter = require('./modules/category/categoryRouter');
app.use('/admin/category', categoryRouter);

var otomRouter = require('./modules/otom/otomRouter');
app.use('/admin/otom', otomRouter);

var predictionRouter = require('./modules/prediction/predictionRouter');
app.use('/admin/prediction', predictionRouter);

var notificationsRouter = require('./modules/notifications/notificationsRouter');
app.use('/admin/notifications', notificationsRouter);

var blogcategoryRouter = require('./modules/blogcategory/blogcategoryRouter');
app.use('/admin/blogcategories', blogcategoryRouter);

var otomLangRouter = require('./modules/otomLangs/otomLangRouter');
app.use('/admin/otom_langs', otomLangRouter);

var settingsRouter = require('./modules/settings/settingsRouter');
app.use('/admin/settings', settingsRouter);

var billboardRouter = require('./modules/billboard/billboardRouter');
app.use('/admin/billboard', billboardRouter);

var igfeedRouter = require('./modules/instagramFeed/igFeedRouter');
app.use('/admin/ig_feed', igfeedRouter);

var otoRouter = require('./modules/oto/otoRouter');
app.use('/admin/oto', otoRouter);

var uploadRouter = require('./modules/upload/uploadRouter');
app.use('/admin/upload', uploadRouter);

var acMailRouter = require('./modules/abandonedCartMail/abandonedCartMailRouter');
app.use('/admin/acMail', acMailRouter);

var infoBipRouter = require('./modules/infoBip/infoBipRouter');
app.use('/admin/infobip', infoBipRouter);

var stripeRouter = require('./modules/stripe/stripeRouter');
app.use('/admin/stripe', stripeRouter);

var googleSheetOrderRouter = require('./modules/googleSheetOrder/googleSheetOrderRouter');
app.use('/googlesheet/order', googleSheetOrderRouter);

app.use("/", express.static(path.join(config.server.basePath, "/public")));

app.use('/*', function (req, res) {
  res.render(path.join(process.cwd() + '/public/index.ejs'));
});

app.use(express.json()); // for parsing application/json

app.post('/send-ga-event', async (req, res) => {
  const data = req.body;

  try {
    const response = await axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=G-B6FNNK3CWP&api_secret=BCyEVQKSTBKS_aT9rHfd7Q`, data);
    res.sendStatus(response.status);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Place this at the end, after all other middleware and routes
app.use(function (err, req, res, next) {
  if (err) {
    logger.error(err);
    console.error("🚨 FULL ERROR:", err.stack || err); // Log full error
    res.status(500).json({ error: "Something bad happened", details: err.message });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});


/* SERVER START */

(function startServer() {
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error("server.js: pool.getConnection - ERROR: "+err);
      return;
    }
    else {
      logger.info('Connected to database : ' + config.connection.host);
      server.listen(config.server.port, function () {
        // todo remove this after initializing
        // initilize.initializeNewFields();
        logger.info('Server started on port : ' + config.server.port);
      });
    }

  });
  pool.on('connection', function (connection) {
    logger.debug('New pool connection');
  });

  pool.on('enqueue', function () {
    logger.debug('Waiting for available connection slot');
  });

  process.on('SIGINT', () => {
    const cleanUp = () => {
      logger.info("MySQL pool closed");
      pool.end(function (err) {
        if (err) {
          logger.error("server.js: pool.end - ERROR: " + err.message);
        }
      });
    };
  
    logger.debug('Closing server...');
  
    server.close(() => {
      cleanUp();
      logger.info('Server closed !!!');
      process.exit();
    });
  
    // Force close server after 10secs
    setTimeout((e) => {
      logger.info('Forcing server close !!!', e);
  
      cleanUp();
      process.exit(1);
    }, 10000);
  });

})();
