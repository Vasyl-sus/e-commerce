var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Blog = require('./blogModel.js');

var blogController = function() {};


blogController.prototype.getBlogposts = bluebird.coroutine(function*(req, res) {
    try {
        var queryParams = {}
        queryParams.country = req.query.country;
        queryParams.lang = req.query.lang;
        queryParams.categories = req.query.categories;
        queryParams.tags = req.query.tags;
        queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
        queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 5;

        var tasks = [];
        tasks.push(Blog.filterBlogposts(queryParams));
        tasks.push(Blog.countFilterBlogposts(queryParams));
        //tasks.push(Blog.getSliders(queryParams));
        //tasks.push(Blog.getFavourites(queryParams));

        var results = yield bluebird.all(tasks);

        res.status(200).json({
            success: true,
            blogposts: results[0],
            blogpostsCount: results[1],
            // sliders: results[2], favourites: results[3]
        });
    } catch (err) {
        logger.error("blogController: getBlogposts - ERROR: try-catch: " + err.message);
        res.status(500).json({ success: false, message: err.message });
        return;
    }
});

blogController.prototype.getBlogpostDetails = bluebird.coroutine(function*(blogpost_id) {
    try {
        var blogpost = yield Blog.getBlogpostDetails(blogpost_id);
        if (blogpost) {
            var queryParams = {
                blogpost_id,
                country: blogpost.country,
                lang: blogpost.language,
                tags: blogpost.tags
            }

            var related_posts = yield Blog.getBlogpostsByTags(queryParams);

            return { success: true, blogpost, related_posts };

        } else {
            return { success: false, message: "Invalid blogpost_id!" };
        }
    } catch (err) {
        logger.error("blogController: getBlogpostDetails - ERROR: try-catch: " + err.message);
        return { success: false, message: err.message };
    }
});

blogController.prototype.getBlogpostDetailsByUrl = bluebird.coroutine(function*(url, country, lang) {
    try {
        country = country && country.toUpperCase();
        lang = lang && lang.toUpperCase();

        var blogpost = yield Blog.getBlogpostDetailsByUrl(url, country, lang);
        if (blogpost) {
            var queryParams = {
                blogpost_id: blogpost.id,
                country: blogpost.country,
                lang: blogpost.language,
                tags: blogpost.tags
            }

            var related_posts = yield Blog.getBlogpostsByTags(queryParams);

            return { success: true, blogpost, related_posts };

        } else {
            return { success: false, message: "Invalid blogpost_name!" };
        }
    } catch (err) {
        logger.error("blogController: getBlogpostDetailsByUrl - ERROR: try-catch: " + err.message);
        return { success: false, message: err.message };
    }
});

blogController.prototype.getCategories = bluebird.coroutine(function*(req, res) {
    try {
        var queryParams = {}

        var tasks = [];
        tasks.push(Blog.filterBlogCategories(queryParams));
        tasks.push(Blog.countFilterBlogCategories(queryParams));

        var results = yield bluebird.all(tasks);
        res.status(200).json({ "success": true, categories: results[0], categoriesCount: results[1] });
    } catch (err) {
        logger.error("blogController: getCategories - ERROR: try-catch: " + err.message);
        res.status(500).json({ success: false, message: err.message });
        return;
    }
})

blogController.prototype.getBlogpostsByCountryAndLang = bluebird.coroutine(function*(country, lang, data) {
    try {
        var queryParams = {}
        queryParams.pageNumber = (data.pageNumber && parseInt(data.pageNumber));
        queryParams.pageLimit = 5;//(data.pageLimit && parseInt(data.pageLimit));
        queryParams.country = country;
        queryParams.lang = lang;
        queryParams.sort = data.sort;
        queryParams.sortOpt = data.sortOpt;

        var tasks = [];
        tasks.push(Blog.filterBlogposts(queryParams));
        tasks.push(Blog.countFilterBlogposts(queryParams));

        var results = yield bluebird.all(tasks);
        return { success: true, blogposts: results[0], blogpostsCount: results[1] };
    } catch (err) {
        logger.error("blogController: getBlogpostsByCountryAndLang - ERROR: try-catch: " + err.message);
        return { success: false, blogposts: [], blogpostsCount: 0 };
    }
});


module.exports = new blogController();
