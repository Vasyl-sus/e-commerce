var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var bluebird = require('bluebird');
var uuid = require('uuid');
var Upload = require('../../utils/awsUpload');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Category = require('./categoryModel.js');

var categoryController = function () {};

categoryController.prototype.addNewCategory = bluebird.coroutine(function *(req, res) {
  try {
    var categoryData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var pattern_img_idx = -1;
    var add_img_idx = -1;
    var promises=[];

    var category = yield Category.getCategoryByName(categoryData.name);  
    if (category) {
      res.status(403).json({success: false, message: "category_exists"});
      return;
    }

    categoryData.id = uuid.v1();

    if(categoryData.sort_order || categoryData.sort_order=='0')
      categoryData.sort_order=parseInt(categoryData.sort_order);

    if(categoryData.translations && typeof categoryData.translations=='string'){
      categoryData.translations = JSON.parse(categoryData.translations);
    }

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.categorySchema1);
    var valid = validate(categoryData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'category');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      if(f=="background_image") big_img_idx=k;
      if(f=="pattern_image") pattern_img_idx=k;
      if(f=="additional_image") add_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else if(i==big_img_idx){
          uploaded_files[i].profile_img = 2;
        } else if(i==pattern_img_idx){
          uploaded_files[i].profile_img = 3;
        } else if(i==add_img_idx){
          uploaded_files[i].profile_img = 4;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      categoryData.files = uploaded_files;
    
      try {
        const result = yield Category.createCategory(categoryData);
        logger.info('Category created');
        logInitdataChange.write();
        res.status(200).json({success: true, id: result });
      } catch (err) {
        logger.error("categoryController: addNewCategory - ERROR: Category.createCategory: "+err.message);
        res.status(500).json({success: false, message: err.message});
      }
    }));
    
  } catch (err) {
    logger.error("categoryController: addNewCategory - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

categoryController.prototype.updateCategory = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var categoryData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var pattern_img_idx = -1;
    var add_img_idx = -1;
    var promises=[];

    var category1 = yield Category.getCategoryDetails(id);
    if(!category1){
      res.status(404).json({success: false , message:"Invalid category_id"});
      return;
    }

    if(categoryData.name){
      var category = yield Category.getCategoryByName(categoryData.name);
      if(category && category.id!=id){
        res.status(403).json({success: false, message: "category_exists"});
        return;
      }
    }

    if(categoryData.sort_order || categoryData.sort_order=='0')
      categoryData.sort_order=parseInt(categoryData.sort_order);

    if(categoryData.translations && typeof categoryData.translations=='string'){
      categoryData.translations = JSON.parse(categoryData.translations);
    } 

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.categorySchema2);
    var valid = validate(categoryData);
    if (!valid) {
      res.status(400).json({success: false, message: "VALIDACIJA: " + validate.errors});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'category');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      if(f=="background_image") big_img_idx=k;
      if(f=="pattern_image") pattern_img_idx=k;
      if(f=="additional_image") add_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {
      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else if(i==big_img_idx){
          uploaded_files[i].profile_img = 2;
        } else if(i==pattern_img_idx){
          uploaded_files[i].profile_img = 3;
        } else if(i==add_img_idx){
          uploaded_files[i].profile_img = 4;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      categoryData.files = uploaded_files;
    
      try {
        const result = yield Category.updateCategory(id, categoryData);
        logger.info('Category updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
        Category.updateLangauge(category1.translations, categoryData.translations);
      } catch (err) {
        logger.error("categoryController: updateCategory - ERROR: Category.updateCategory: "+err.message);
        res.status(500).json({success: false, message: err.message});
      }
    }));



  } catch (err) {
    logger.error("categoryController: updateCategory - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

categoryController.prototype.filterCategories = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber));
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit));

    var tasks = [];
    tasks.push(Category.filterCategories(queryParams));
    tasks.push(Category.countFilterCategories(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({"success": true, categories: results[0], categoriesCount: results[1]});
  } catch (err) {
    logger.error("categoryController: filterCategories - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

categoryController.prototype.deleteCategory = (req, res) => {
  try {
    var { id } = req.params;

    Category.deleteCategory(id).then(result => {
      if(result!=0) { 
        logger.info('Category deleted');
        logInitdataChange.write();
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid category_id"});
      }
    }).catch(err => {
      logger.error("categoryController: deleteCategory - ERROR: Category.deleteCategory: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("categoryController: deleteCategory - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new categoryController();