var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var BlogCategory = require('./blogcategoryModel.js');

var blogcategoryController = function () {};

blogcategoryController.prototype.addNewBlogCategory = bluebird.coroutine(function *(req, res) {
  try {
    var blogcategoryData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.categorySchema);
    var valid = validate(blogcategoryData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var blogcategory = yield BlogCategory.getBlogCategoryByName(blogcategoryData.name);
     
    if (!blogcategory) {
      BlogCategory.createBlogCategory(blogcategoryData).then((result) => {
          logger.info('Blog category created');
          res.status(200).json({"success": true, id: result });
      }).catch((err) => {
        logger.error("blogcategoryController: addNewBlogCategory: BlogCategory.createBlogCategory - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
      res.status(403).json({success: false, message: "category_exists"});
      return;
    }
    
  } catch (err) {
    logger.error("blogcategoryController: addNewBlogCategory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

blogcategoryController.prototype.updateBlogCategory = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var blogcategoryData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.categorySchema);
    var valid = validate(blogcategoryData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    else{
      var utm = yield BlogCategory.getBlogCategoryByName(blogcategoryData.name);
      if(utm && utm.id!=id){
        res.status(403).json({success: false, message: "blog_category_exists"});
        return;
      }
      BlogCategory.updateBlogCategory(id, blogcategoryData).then(result => {
        if(result!=0){
          logger.info('Blog category updated');
          res.status(200).json({"success": true});
        } else {
          res.status(404).json({success: false, message: "Invalid blogcategory_id"});
        }
      }).catch(err => {
        logger.error("blogcategoryController: updateBlogCategory: BlogCategory.updateBlogCategory - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    }
  } catch (err) {
    logger.error("blogcategoryController: updateBlogCategory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

blogcategoryController.prototype.filterBlogCategories = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber));
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit));

    var tasks = [];
    tasks.push(BlogCategory.filterBlogCategories(queryParams));
    tasks.push(BlogCategory.countFilterBlogCategories(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, blogCategories: results[0], blogCategoriesCount: results[1]});
  } catch (err) {
    logger.error("blogcategoryController: filterBlogCategories: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

blogcategoryController.prototype.deleteBlogCategory = (req, res) => {
  try {
    var { id } = req.params;

    BlogCategory.deleteBlogCategory(id).then(result => {
      if(result!=0) { 
        logger.info('Blog category deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid blogcategory_id"});
      }
    }).catch(err => {
      logger.error("blogcategoryController: deleteBlogCategory: BlogCategory.deleteBlogCategory - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("blogcategoryController: deleteBlogCategory: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new blogcategoryController();