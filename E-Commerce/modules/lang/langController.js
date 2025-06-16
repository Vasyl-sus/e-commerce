var logger = require('../../utils/logger');
var bluebird = require('bluebird');
var geoip = require('geoip-country');
var services = require('../../utils/services');
var Lang = require('./langModel.js');
var Order = require("../order/orderModel");
const {parse} = require('url')
var Blog = require("../blog/blogModel.js");
var Ajv = require('ajv');
var mailingService = require('../../utils/mailingService.js')

var langController = function () {
};

langController.prototype.getLanguageReturn = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var langC = queryLang.split('-');
        req.session.location = "getLanguage2";
        req.session.ip = req.connection && req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        req.session.ip = req.session.ip.replace(/^\\/, '');

        var country = "HR";
        var lang = "EN"

        var geo = geoip.lookup(req.session.ip);
        if (geo)
            var result = yield Lang.getCountry(geo.country);
        if (result) {
            country = geo.country;
        } else {
            country = "HR";
        }

        if (req.session.ip == "::1") {
            country = "SI"
            lang = "SL"
        }

        if (!req.session.lang) {
            let l = langC && langC[0] || "SL"
            req.session.lang = l;
        }

        let ccountry = langC && langC[1] || "SI"
        req.session.currency = yield Lang.getCurrencyByCountry(ccountry);
        if (req.session.currency && req.session.currency.value) {
            req.session.currency.value = parseFloat(req.session.currency.value);
        }
        return {success: true, country, lang}

    } catch (err) {
        // res.status(500).json({success: false, message: err.message});
        logger.error("langController: getLanguage - ERROR: try-catch: " + err);
        return {success: false, message: err};
    }
})

// function clearCart(req) {
//     req.session.cart=null;
//     req.session.cart={};
//     req.session.cart.therapies=[];
//     req.session.cart.accessories=[];
//     req.session.cart.subtotal=0;
//     req.session.cart.discount=0;
//     req.session.cart.shipping_fee=0;
//     req.session.cart.total=0;
//     //req.session.save();
//     return;
//   }

langController.prototype.getLangConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();
        page = services.routesWithPages(queryLang, route, all_routes);

        if (!page) {
            page = {page: "/product-page", redirect: false};
        }
        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        // tasks.push(getLanguageReturn(req, res))
        // tasks.push(Lang.getTherapiesByCountrySEO(langC[1], langC[0], route))
        let result = yield bluebird.all(tasks)
        // result[2].therapies = result[3];
        let obj = {
            language: result[0],
            langConfig: result[1],
            initData: result[2],
            all_routes
            // local: result[3]
        }
        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, error});
        return;
    }
});

langController.prototype.getProductLangConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = {page: "/product-page", redirect: false};

        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        tasks.push(Lang.getTherapiesByCountrySEO(langC[1], langC[0], route))
        tasks.push(Lang.getReviewGrade(route))
        let result = yield bluebird.all(tasks)
        result[1].therapies = result[2];
        result[1].reviewData = result[3];
        let therapies = result[2];
        let language = yield getLanguage2(langC[0], langC[1], req, page.page, therapies[0].category);

        let obj = {
            language,
            langConfig: result[0],
            initData: result[1],
            all_routes
        }
        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, error});
        return;
    }
});

langController.prototype.getTestimonialsProduct = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var langC = queryLang.split('-');
        let reviews = yield Lang.getTestimonialsProduct(langC[1], langC[0])

        res.status(200).json({success: true, data: {testimonials_product: reviews}});

        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, error});
        return;
    }
});

langController.prototype.getReviews = bluebird.coroutine(function* (req, res) {
    try {
        let route = req.params.link
        let reviews = yield Lang.getReviews(route)

        res.status(200).json({success: true, data: reviews});
        return;
    } catch (error) {
        res.status(500).json({success: false, error});
        return;
    }
});

langController.prototype.getBlogConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = services.routesWithPages(queryLang, route, all_routes);

        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, null, langC[1], langC[0]))
        tasks.push(Blog.getBlogCategories(langC[1], langC[0]));
        tasks.push(Blog.getBlogTags(langC[1], langC[0]));
        tasks.push(Blog.getFavourites({country: langC[1], lang: langC[0]}));

        let results1 = yield bluebird.all(tasks)
        let obj = {
            language: results1[0],
            langConfig: results1[1],
            initData: results1[2],
            blog_categories: results1[3],
            blog_tags: results1[4],
            starredBlogpost: results1[5][0],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, error});
        return;
    }
});

langController.prototype.getBlogPostConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var link = splited[3];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = services.routesWithPages(queryLang, route, all_routes);

        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, null, langC[1], langC[0]))
        tasks.push(Blog.getBlogCategories(langC[1], langC[0]));
        tasks.push(Blog.getBlogTags(langC[1], langC[0]));
        tasks.push(Blog.getBlogpostDetailsByUrl(link, langC[1], langC[0]));

        let results1 = yield bluebird.all(tasks)
        let obj = {
            language: results1[0],
            langConfig: results1[1],
            initData: results1[2],
            blog_categories: results1[3],
            blog_tags: results1[4],
            blogpost: results1[5],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        return;
    }
});

langController.prototype.getTEConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = services.routesWithPages(queryLang, route, all_routes);

        if (!page) {
            page = {page: "/product-page", redirect: false};
        }
        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        let result = yield bluebird.all(tasks)
        let obj = {
            language: result[0],
            langConfig: result[1],
            initData: result[2],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        return;
    }
});

langController.prototype.getACConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var acc_category = splited[3];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = services.routesWithPages(queryLang, route, all_routes);

        if (!page) {
            page = {page: "/product-page", redirect: false};
        }
        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        if (acc_category) {
            tasks.push(Lang.getAccessoriesByCategory(acc_category, langC[0]))
        }
        let result = yield bluebird.all(tasks)
        let obj = {
            language: result[0],
            langConfig: result[1],
            initData: result[2],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        return;
    }
});

langController.prototype.getTELConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var link = req.params && req.params.link  && req.params.link !== 'undefined' ? req.params.link : splited[3];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();

        page = services.routesWithPages(queryLang, route, all_routes);

        if (!page) {
            page = {page: "/product-page", redirect: false};
        }
        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        tasks.push(Lang.getTestimonialsBYUrl(langC[1], langC[0], link));
        let result = yield bluebird.all(tasks)
        let obj = {
            language: result[0],
            langConfig: result[1],
            initData: result[2],
            testimonials: result[3][0],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        return;
    }
});

langController.prototype.getACDConfigs = bluebird.coroutine(function* (req, res) {
    try {
        const parsedUrl = parse(req.body.url ? req.body.url : req.params.acc_category, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var route = splited[2];
        var langC = queryLang.split('-');
        let tasks = [];
        var page;
        var all_routes = yield Lang.getAllRoutes();
        var link = req.params && req.params.link  && req.params.link !== 'undefined' ? req.params.link : splited[3];

        page = {page: "/accessories-page", redirect: false};

        tasks.push(getLanguage2(langC[0], langC[1], req, page.page, route));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, page.page, langC[1], langC[0]))
        tasks.push(Lang.getAccessoriesByCategory(link, langC[0]))
        let result = yield bluebird.all(tasks)
        let obj = {
            language: result[0],
            langConfig: result[1],
            initData: result[2],
            accessory: result[3],
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log('error: ', error)
        return;
    }
});

langController.prototype.getCLConfigs = bluebird.coroutine(function* (req, res) {
    try {
        var all_routes = yield Lang.getAllRoutes();
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var queryLang = splited[1];
        var langC = queryLang.split('-');

        var country = req.session.country && req.session.country.toUpperCase();
        var lang = req.session.lang && req.session.lang.toUpperCase();

        var geo = geoip.lookup(req.session.ip);
        if (!geo) {
            geo = {
                country: "SI"
            }
        }

        if (!country || !lang) {
            country = geo.country;
            var countryLangs = yield Lang.getLangConfig(geo.country);
            if (countryLangs[0]) {
                lang = countryLangs[0];
            } else {
                country = "SI";
                lang = "SL";
            }
        }

        var tasks = [];
        tasks.push(getLanguage2(lang, country, req, "/choose_language", "choose_language"));
        tasks.push(Lang.getFullLangConfig());
        tasks.push(initCountry(req, null, langC[1], langC[0]))

        let results = yield bluebird.all(tasks)
        let obj = {
            language: results[0],
            langConfig: results[1],
            initData: results[2],
            found_country: geo.country,
            all_routes
        }

        res.status(200).json({success: true, data: obj});
        return;
    } catch (error) {
        console.log(error)
        return;
    }
});
const getLanguage2 = bluebird.coroutine(function* (lang, country, req, route, r) {
    try {
        // Default to Slovenian if language is undefined
        if (!lang || lang === 'UNDEFINED') {
            lang = 'SL';
            console.log("Warning: Language was undefined, defaulting to SL");
        }
        
        var languageModules = yield Lang.getLanguageModules(lang);

        let parsedLanguage = parseLanguageForPage(route, languageModules, r, lang);

        var all_routes = yield Lang.getAllRoutes();
        var routes = all_routes.filter(r => {
            return r.lang == `${lang.toLowerCase()}-${country.toLowerCase()}`
        });

        return {
            success: true,
            country: country,
            language: lang,
            languageModules: parsedLanguage,
            routes: routes
        };

    } catch (err) {
        logger.error("langController: getLanguage2 - ERROR: try-catch: " + err.message);
        console.error("getLanguage2: Error - " + err.message);
        return {success: false, message: err.message};
    }
});

function parseLanguageForPage(path, lang, route, l) {
    let mainLanguage = [], otherLanguage = [];
    switch (path) {
        case "/home":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "home")];
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "blog")];
            break;
        case "/products":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "home")];
            break;
        case "/accessories":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "home")];
            break;
        case "/accessories-page":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "accessories-page")];
            break;
        case "/product-page":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.real_name === route)];
            break;
        case "/all-ambasadors":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "ambasadors")];
            break;
        case "/ambasadors":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "ambasadors")];
            break;
        case "/ambassadors":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "ambasadors")];
            break;
        case "/contact":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "breadcrumbs")];
            break;
        case "/about-us":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "breadcrumbs")];
            break;
        case "/private-cookies":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "private_cookies")];
            break;
        case "/terms":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "terms")];
            break;
        case "/delivery":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "delivery")];
            break;
        case "/returns":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "returns")];
            break;
        case "/testers":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "testers")];
            break;
        case "/cart":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "checkout")];
            break;
        case "/checkout":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "checkout")];
            break;
        case "/checkout-success":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "checkout")];
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "checkout_oto")];
            break;
        case "/blog":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "blog")];
            break;
        case "/choose_language":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.category === "choose_language")];
            break;
        case "/faq":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "faq")];
            break;
        case "/how_to_buy":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "how_to_buy")];
            break;
        case "/promo_page":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "promo_page")];
            break;
        case "/promo_page_free_gifts":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "promo_page_free_gifts")];
            break;
        case "/promo_page_simple":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "promo_page_simple")];
            break;
        case "/free_lotion":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "free_lotion")];
            break;
        case "/free_hand_cream":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "free_hand_cream")];
            break;
        case "/black_friday":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "black_friday")];
            break;
        case "/winter_sale":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "winter_sale")];
            break;
        case "/caviar_sale":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "caviar_sale")];
            break;
        case "/back_to_school":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "back_to_school")];
            break;
        case "/easter_sale":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "easter_sale")];
            break;
        case "/summer_sale":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "summer_sale")];
            break;
        case "/valentines_day":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "valentines_day")];
            break;
        case "/womens_day":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "womens_day")];
            break;
        case "/spring_day":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "spring_day")];
            break;
        case "/halloween":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "halloween")];
            break;
        case "/easter":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "easter")];
            break;
        case "/mothers_day":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "mothers_day")];
            break;
        case "/sms_unsub":
            mainLanguage = [...mainLanguage, ...lang.filter(l => l.name === "sms_unsub")];
            break;
    }
    let meta = lang.find(l => l.category === "meta");
    const metas = [];
    for (var i in meta.data) {
        var d = meta.data[i]
        if (d.page === path.slice(1))
            metas.push(d)
    }
    let metaData = [{
        "name": "meta_data",
        "language": l.toUpperCase(),
        "category": "meta",
        "data": metas
    }]
    otherLanguage = [...otherLanguage, ...lang.filter(l => l.category === "header_footer")]
    otherLanguage = [...otherLanguage, ...metaData];
    otherLanguage = [...otherLanguage, ...lang.filter(l => l.category === "main")];

    return [...mainLanguage, ...otherLanguage]
}

langController.prototype.getLanguageModules = bluebird.coroutine(function* (lang) {
    try {
        var languageModules = yield Lang.getLanguageModules(lang);
        return {
            success: true,
            language: lang,
            languageModules: languageModules
        };
    } catch (err) {
        logger.error("langController: getLanguageModules - ERROR: try-catch: " + err.message);
        return {success: false, message: err.message};
    }
});


langController.prototype.setCountry = bluebird.coroutine(function* (req, res) {
    try {
        var data = req.body;
        var country = data.country;
        var lang = data.lang;

        var languages = ["EN"];
        var result = yield Lang.getCountry(country);
        if (result) {
            req.session.country = country;
            languages.push(result.lang);
        } else {
            req.session.country = "GB";
        }
        req.session.langs = languages;
        req.session.lang = lang;
        req.session.currency = yield Lang.getCurrencyByCountry(req.session.country);
        if (req.session.currency && req.session.currency.value) {
            req.session.currency.value = parseFloat(req.session.currency.value);
        }

        // req.session.cart = {}
        // req.session.customer = {};
        req.session.destroy(function (err) {
            res.status(200).json({success: true});
            // res.redirect(307, `${config.server.url}${lang.toLowerCase()}-${country.toLowerCase()}/`)
        })
        // console.log(req.session)
        // res.status(200).json({success: true});

    } catch (err) {
        logger.error("langController: setCountry - ERROR: try-catch: " + err);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

const initCountry = bluebird.coroutine(function* (req, page, country, lang) {
    try {
        const parsedUrl = parse(req.body.url, true);
        const {pathname} = parsedUrl;
        var splited = pathname.split('/');
        var route = splited[2];
        var tasks = [];
        let checkoutRoutes = ["/checkout", "/cart"];
        let homeRoutes = ["/home"];
        let accRoutes = ["/accessories", "/accessories-page"]
        let productRoutes = ["/product-page"];
        let testersRoutes = ["/testers"];
        let testimonialsRoutes = ["/all-ambasadors", "ambasadors"];
        let testimonialRoutes = ["ambasadors"];

        if (checkoutRoutes.includes(page)) {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getDeliverymethodsByCountry(country, lang));
            tasks.push(Lang.getPaymentmethodsByCountry(country, lang));
            tasks.push(Lang.getStickyNote(country, lang));

            var results = yield bluebird.all(tasks);
            return {
                success: true,
                countries: results[0],
                currency: results[1],
                delivery_methods: results[2],
                payment_methods: results[3],
                sticky_note: results[4]
            };
        } else if (accRoutes.includes(page)) {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getAccessories(country, lang));

            var results = yield bluebird.all(tasks);

            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                accessories: results[3]
            };
        } else if (homeRoutes.includes(page)) {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getTestimonials(country, lang, null, true));
            tasks.push(Lang.getAccessories(country, lang));
            tasks.push(Lang.getIGfeeds(country, lang));
            tasks.push(Lang.getProductCategories(lang));
            tasks.push(Lang.getActiveBillboard(country, lang));
            tasks.push(Lang.getStarredBlogposts(country, lang, 1));
            tasks.push(Lang.getTherapiesByCountryONE(country, lang));

            var results = yield bluebird.all(tasks);
            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                testimonials: results[3],
                blogposts: results[8],
                accessories: results[4],
                ig_feeds: results[5],
                categories: results[6],
                billboard: results[7],
                therapies: results[9],
            };
        } else if (productRoutes.includes(page)) {

            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getTestimonials(country, lang, route));
            tasks.push(Lang.getAccessories(country, lang));
            tasks.push(Lang.getProductCategories(lang));
            tasks.push(Lang.getMediums(country, lang));
            tasks.push(Lang.getTestimonialsProduct(country, lang, route));
            var results = yield bluebird.all(tasks);

            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                testimonials: results[3],
                accessories: results[4],
                categories: results[5],
                mediums: results[6],
                testimonials_product: results[7],
            };
        } else if (testimonialsRoutes.includes(page)) {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getProductCategories(lang));
            tasks.push(Lang.getTestimonials(country, lang));
            tasks.push(Lang.getTherapiesByCountryONE(country, lang));

            var results = yield bluebird.all(tasks);
            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                categories: results[3],
                testimonials: results[4],
                therapies: results[5],
            };
        } else if (testersRoutes.includes(page)) {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getTestimonials(country, lang));
            tasks.push(Lang.getProductCategories(lang));
            tasks.push(Lang.getTherapiesByCountryONE(country, lang));

            var results = yield bluebird.all(tasks);
            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                testimonials: results[3],
                categories: results[4],
                therapies: results[5]
            };
        } else {
            tasks.push(Lang.getAllCountries());
            tasks.push(Lang.getCurrencyByCountry(country));
            tasks.push(Lang.getStickyNote(country, lang));
            tasks.push(Lang.getProductCategories(lang));
            tasks.push(Lang.getTherapiesByCountryONE(country, lang));
            tasks.push(Lang.getAccessories(country, lang));

            var results = yield bluebird.all(tasks);
            return {
                success: true,
                countries: results[0],
                currency: results[1],
                sticky_note: results[2],
                categories: results[3],
                therapies: results[4],
                accessories: results[5],
            };
        }


    } catch (err) {
        console.log(err)
        logger.error("langController: initCountry - ERROR: try-catch: " + err.message);
        return false;
    }
});

langController.prototype.getPharmaciesByCity = bluebird.coroutine(function* (req, res) {
    try {
        var country = req.query.country;
        var city = req.query.city;

        if (!country || !city) {
            res.status(403).json({success: false, message: "Query is missing country or city!"});
            return;
        }
        var tasks = [];
        tasks.push(Lang.getPharmacies(country, city));
        tasks.push(Lang.getPharmaciesCount(country, city));

        var results = yield bluebird.all(tasks);
        res.status(200).json({success: true, pharmacies: results[0], pharmaciesCount: results[1]});
        return;
    } catch (err) {
        logger.error("langController: getPharmaciesByCity - ERROR: try-catch: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

langController.prototype.getRoutes = bluebird.coroutine(function* (req, res) {
    try {
        Lang.getAllRoutes().then(result => {
            res.status(200).json({success: true, routes: result});
        })
    } catch (err) {
        logger.error("langController: getRoutes - ERROR: try-catch: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

langController.prototype.getLangConfig = bluebird.coroutine(function* (req, res) {
    try {
        Lang.getFullLangConfig().then(result => {
            res.status(200).json({success: true, langConfig: result});
        });
    } catch (err) {
        logger.error("langController: getLangConfig - ERROR: try-catch: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

langController.prototype.getAllLanguages = bluebird.coroutine(function* (req, res) {
    try {
        Lang.getLangNames().then(result => {
            res.status(200).json({success: true, languages: result});
        });
    } catch (err) {
        logger.error("langController: getAllLanguages - ERROR: try-catch: " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

langController.prototype.getOtos = bluebird.coroutine(function* (req, res) {
    try {
        var {orderId} = req.params;
        var otoTherapiesIds = yield Lang.getOtoTherapiesIdsByOrderId(orderId);
        var order = yield Lang.getOrderDetailsById(orderId);
        var therapiesIds = [];
        var otosIds = [];
        var otos = [];

        if (otoTherapiesIds && otoTherapiesIds.length > 0) {
            otosIds = otoTherapiesIds.map(ot => {
                return ot.oto_id
            });
            therapiesIds = otoTherapiesIds.map(ot => {
                return ot.therapy_id
            });
        }

        therapiesIds = therapiesIds.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        otosIds = otosIds.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        if (otosIds.length > 0) {
            var accessories = yield Lang.getOtoAccessoriesByOtoIds(otosIds);
            if (accessories && accessories.length > 0) {
                var options = yield Lang.getAccOptions(accessories);
            }

            for (var i = 0; i < otosIds.length; ++i) {
                let oto = {
                    id: otosIds[i],
                    time: otoTherapiesIds.filter(o => {
                        return o.oto_id == otosIds[i]
                    })[0].time,
                    discount: otoTherapiesIds.filter(o => {
                        return o.oto_id == otosIds[i]
                    })[0].discount,
                    therapiesIds: [],
                    therapies: [],
                    additional_text: otoTherapiesIds[i].additional_text,
                    accessoriesIds: accessories.filter(a => {
                        return a.oto_id == otosIds[i]
                    }).map(aa => {
                        return aa.id
                    }) || [],
                    accessories: []
                }

                oto.accessoriesIds = oto.accessoriesIds.filter((value, index, self) => {
                    return self.indexOf(value) === index;
                }) || [];

                for (var j = 0; j < otoTherapiesIds.length; ++j) {
                    if (otosIds[i] == otoTherapiesIds[j].oto_id) {
                        oto.therapiesIds.push(otoTherapiesIds[j].therapy_id);
                    }
                }
                otos.push(oto);
            }

            var therapies = yield Lang.getTherapiesByIds(therapiesIds);

            for (var i = 0; i < therapies.length; ++i) {
                for (var j = 0; j < otos.length; ++j) {
                    if (otos[j].therapiesIds.includes(therapies[i].id)) {
                        therapies[i].images = therapies.filter(t => {
                            return t.id == therapies[i].id
                        }).map(i => {
                            return {
                                img_id: i.img_id,
                                link: i.img_link,
                                name: i.img_name,
                                type: i.img_type,
                                profile_img: i.profile_img,
                                background_img: i.background_img,
                                pattern_img: i.pattern_img
                            }
                        });
                        therapies[i].images = therapies[i].images.filter((obj, pos, arr) => {
                            return arr.map(mapObj => mapObj["img_id"]).indexOf(obj["img_id"]) === pos
                        });
                        otos[j].therapies.push(therapies[i]);
                    }
                }
            }

            for (var i = 0; i < accessories.length; ++i) {
                for (var j = 0; j < otos.length; ++j) {
                    if (otos[j].accessoriesIds.includes(accessories[i].id)) {
                        accessories[i].images = accessories.filter(a => {
                            return a.id == accessories[i].id
                        }).map(i => {
                            return {img_id: i.img_id, link: i.link, name: i.img_name, type: i.type}
                        });
                        accessories[i].images = accessories[i].images.filter((obj, pos, arr) => {
                            return arr.map(mapObj => mapObj["img_id"]).indexOf(obj["img_id"]) === pos
                        });
                        otos[j].accessories.push(accessories[i]);
                    }
                    otos[j].accessories = otos[j].accessories.filter((obj, pos, arr) => {
                        return arr.map(mapObj => mapObj["id"]).indexOf(obj["id"]) === pos
                    });
                }
            }

        }
        var returnData = {};
        returnData.otos = otos;
        returnData.order = order[0];
        res.status(200).json({success: true, data: returnData});
    } catch (err) {
        logger.error("langController: initCountry - ERROR: try-catch: " + err.message);
        res.status(500).json({success: true, error: err});
        return false;
    }
});

langController.prototype.addOtoToOrder = bluebird.coroutine(function* (req, res) {
    try {
        var data = req.body;
        var order_id = data.order_id;
        var oto_id = data.oto_id;
        var item_id = data.item_id;
        var item_type = data.item_type;
        var product_id = data.product_id;
        var shipping_fee = null;
        var newtotal = null;
        if (item_type == 'therapy') {
            var item = yield Lang.getTherapyById(item_id, oto_id);
        } else if (item_type == 'accessory') {
            var item = yield Lang.getAccessoryById(item_id, oto_id);
            item.product_id = product_id;
        } else {
            res.status(403).json({success: false, message: "Missing item_type!"});
            return;
        }

        var order = yield Order.getOrderDetails(order_id);

        if (!order) {
            res.status(403).json({success: false, message: "Missing item_type!"});
            return;
        }

        if (item) {

            if (item_type == 'therapy') {
                var discount = item.total_price * (item.discount / 100);
                discount = services.round(discount, 2);
                item.total_price = item.total_price - discount;
            } else if (item_type == 'accessory') {
                var discount = item.reduced_price * (item.discount / 100);
                discount = services.round(discount, 2);
                item.reduced_price = item.reduced_price - discount;
            }
            var newsubtotal = order.subtotal += (item.total_price || item.reduced_price);

            if (newsubtotal > order.delivery_method_to_price) {
                shipping_fee = 0;
                if (order.shipping_fee > 0) {
                    newtotal = order.delivery_method_price
                }
            }

            var updateOrder = yield Lang.addItemToOrder(order_id, item, item_type, shipping_fee, newtotal);


            var discountObj = {};
            discountObj.name = "otoItemDiscount";
            discountObj.type = "Individual"
            discountObj.discount_type = "Percent";
            discountObj.discount_value = item.discount;
            discountObj.discount_price = item_type == 'therapy' ? item.total_price : item.reduced_price;
            discountObj.order_id = order_id;
            discountObj.discount = discount;
            var additionalDiscount = yield Lang.createIndividualDiscountForOto(discountObj, item_id, item_type);

            var languageModules = yield Lang.getLanguageModules(req.session.lang);

            let textData = languageModules.filter(y => {
                return y.name == 'mail_complete';
            });

            order = yield Order.getOrderDetails(order_id);

            mailingService.createNewOrder(order, textData, 1, item_id);

            res.status(200).json({order, success: true});
            return;
        } else {
            res.status(500).json({success: false});
            return;
        }

    } catch (err) {
        logger.error("langController: addOtoToOrder - ERROR: try-catch: " + err.message);
        res.status(500).json({success: false});
        return false;
    }
});

langController.prototype.postReview = function (req, res) {
    var data = req.body;

    var ajv = new Ajv();
    var validate = ajv.compile({
        "type": "object",
        "properties": {
            "review": {"type": "string"},
            "grade": {"type": ["string", "integer"]},
            "name": {"type": "string"},
            "product_id": {"type": "string"}
        },
        "required": ["grade", "name", "product_id"],
        "additionalProperties": false
    });
    var valid = validate(data);

    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    Lang.postReview(data).then(result => {
        logger.info('Review created');
        res.status(200).json({success: true});
    }).catch(err => {
        logger.error("LangController: postReview - ERROR: Lang.postReview: " + err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });
}


module.exports = new langController();
