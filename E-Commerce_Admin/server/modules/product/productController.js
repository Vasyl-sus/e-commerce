var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');

var moment = require('moment');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Product = require('./productModel.js');

var expenseController = require('../expense/expenseController');
var Expense = require('../expense/expenseModel');

var productController = function () {};

productController.prototype.addNewProduct = bluebird.coroutine(function *(req, res) {
  try {
    var productData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var k=0;
    for (var f in req.files) {
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'product');
      promises.push(promise);
      if (f == "post_image") profile_img_idx = k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(productData.amount){
        productData.amount=parseInt(productData.amount);
      }

      if(productData.active){
        productData.active=parseInt(productData.active);
      }

      if(productData.sort_order){
        productData.sort_order=parseInt(productData.sort_order);
      }

      if(productData.translations && typeof productData.translations=='string'){
        productData.translations = JSON.parse(productData.translations);
      }

      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      console.log(productData)
      var validate = ajv.compile(validationSchema.productSchema1);
      var valid = validate(productData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }
      productData.id = uuid.v1();

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      productData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      var exsisting_product = yield Product.getProductByName(productData.name);

      if(!exsisting_product){
        var adminData = req.admin;
        Product.createProduct(productData, adminData).then((result) => {
          logger.info('Product created');
          logInitdataChange.write();
          res.status(200).json({success: true, id: productData.id });
        }).catch((err) => {
          logger.error("productController: addNewProduct - ERROR: Product.createProduct: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      } else {
        res.status(403).json({success: false, message: "product_exists"});
        return;
      }
    }));

  } catch (err) {
    logger.error("productController: addNewProduct - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.updateProduct = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var productData = req.body;
    var profile_img_idx = -1;
    var promises=[];

    var product = yield Product.getProductDetails(id);
    if(!product){
      res.status(404).json({success: false, message: "Invalid product_id"});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'product');
      promises.push(promise);
      if(f=="post_image") profile_img_idx=k;
      k++;
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      if(productData.amount){
        productData.amount=parseInt(productData.amount);
      }

      if(productData.sort_order){
        productData.sort_order=parseInt(productData.sort_order);
      }

      if(productData.active){
        productData.active=parseInt(productData.active);
      }

      if(productData.translations && typeof productData.translations=='string'){
        productData.translations = JSON.parse(productData.translations);
      }
      
      //AJV validation
      var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      var validate = ajv.compile(validationSchema.productSchema2);
      var valid = validate(productData);
      if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
      }

      var product1 = yield Product.getProductByName(productData.name);
      if(product1 && product1.id!=id){
        res.status(403).json({success: false, message: "product_exists"});
        return;
      }

      for(var i=0;i<uploaded_files.length;i++){
        if(i==profile_img_idx){
          uploaded_files[i].profile_img = 1;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }
      productData.files = uploaded_files.filter(uf=>{return uf.profile_img==1});

      if(productData.translations && typeof productData.translations=='string'){
        productData.translations = JSON.parse(productData.translations);
      }
      
      Product.updateProduct(id, productData).then(result => {
        logger.info('Product updated');
        logInitdataChange.write();
        res.status(200).json({success: true});
      }).catch(err => {
        logger.error("productController: updateProduct - ERROR: Product.updateProduct: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));
  } catch (err) {
    logger.error("productController: updateProduct - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.filterProducts = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;
    queryParams.showAll = req.query.showAll;

    var tasks = [];
    tasks.push(Product.filterProducts(queryParams));
    tasks.push(Product.countFilterProducts(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, products: results[0], productsCount: results[1]});
  } catch (err) {
    logger.error("productController: filterProducts - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

productController.prototype.deleteProduct = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    console.log("id: "+id);
    var product = yield Product.getProductDetails(id);
    if(!product){
      res.status(404).json({success: false , message:"Invalid product_id"});
      return;
    }

    Product.deleteProduct(id).then(result => {
      logger.info('Product deleted');
      logInitdataChange.write();
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("productController: deleteProduct - ERROR: Product.deleteProduct: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: deleteProduct - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.updateProductStock = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var data = req.body;
    //console.log(data);
    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.stockchangeSchema);
    var valid = validate(data);
    if (!valid) {
      console.log(validate.errors)
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var product = yield Product.getProductDetails(id);
    if (!product) {
      res.status(404).json({success: false, message: "Invalid product_id"});
      return;
    }

    Product.updateProductStock(id, data, product.amount).then(result => {
      logger.info('Product stock updated');
      res.status(200).json({success: true});
      Expense.getExpenseDetailsByName(`Izdelek-${product.name}`).then(product_expense => {
        if (product_expense) {
          let num = 0;
          if (data.value < 0) {
            num = data.value * -1;
          }
          expenseController.insertExpenseData1('Odpisi', moment(new Date).format('YYYY-MM-DD'), product_expense.value * num, result);
        }
      })
    }).catch(err => {
      logger.error("productController: updateProductStock - ERROR: Product.updateProductStock: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("productController: updateProductStock - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


productController.prototype.deleteProductImage = (req, res) => {
  try {
    var { id } = req.params;

    Product.deleteProductImage(id).then(result => {
      logger.info('Deleted product image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("productController: deleteProductImage - ERROR: Product.deleteProductImage: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: deleteProductImage - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

productController.prototype.getStockchanges = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var product = yield Product.getProductDetails(id);
    if(!product){
      res.status(404).json({success: false , message:"Invalid product_id"});
      return;
    }

    Product.getStockchanges(id).then(result => {
      res.status(200).json({success: true, stockchanges: result});
    }).catch(err => {
      logger.error("productController: getStockchanges - ERROR: Product.getStockchanges: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: getStockchanges - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.getAllStockchanges = bluebird.coroutine(function *(req, res) {
  try {

    var queryParams = {};
    queryParams.pageNumberStock = (req.query.pageNumberStock && parseInt(req.query.pageNumberStock)) || 1;
    queryParams.pageLimitStock = (req.query.pageLimitStock && parseInt(req.query.pageLimitStock)) || 20;

    var tasks = [];
    tasks.push(Product.getAllStockchanges(queryParams))
    tasks.push(Product.countAllStockchanges(queryParams))

    var result = yield bluebird.all(tasks);

    res.status(200).json({success: true, stockchanges: result[0], stockchangescount: result[1]});

  } catch (err) {
    logger.error("productController: getStockchanges - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.filterProductReviews = bluebird.coroutine(function *(req, res) {
  try {
    let queryParams = {};

    queryParams.product_id = req.query.product_id;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    let tasks = [];
    tasks.push(Product.filterProductReviews(queryParams));
    tasks.push(Product.countProductReviews(queryParams));

    let results = yield bluebird.all(tasks);

    res.status(200).json({success: true, data: {reviews: results[0], reviewCount: results[1]}});
  } catch (err) {
    logger.error("productController: filterProductReviews - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.deleteProductReviews = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    Product.deleteProductReviews(id).then(result => {
      res.status(200).json({"success": true});
    }).catch(err => {
      logger.error("productController: deleteReview - ERROR: Product.deleteReview: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: deleteReview - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

productController.prototype.editProductReviews = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;
    var data = req.body;

    //AJV validation
    var ajv = new Ajv();
    var validate = ajv.compile(validationSchema.reviewSchema);
    var valid = validate(data);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    Product.editProductReviews(id, data).then(result => {
      res.status(200).json({"success": true});
    }).catch(err => {
      logger.error("productController: updateReview - ERROR: Product.updateReview: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("productController: updateReview - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

module.exports = new productController();
