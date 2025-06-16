var logger = require('../../utils/logger');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Upload = require('../../utils/awsUpload');

var path = require('path');
var Prediction = require('../prediction/predictionModel');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Blogpost = require('./blogpostModel.js');

var blogpostController = function () {};

blogpostController.prototype.addNewBlogpost = bluebird.coroutine(function *(req, res) {
  try {
    var blogpostData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var promises=[];

    if(blogpostData.starred)
      blogpostData.starred=parseInt(blogpostData.starred);
    if(blogpostData.slider)
      blogpostData.slider=parseInt(blogpostData.slider);

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.blogpostSchema1);
    var valid = validate(blogpostData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    blogpostData.id = uuid.v1();

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'blogpost');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      if(f=="big_image") big_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      var all_uploaded_files = [];
      for(var i=0;i<uploaded_files.length;i++){
        for(var j=0;j<uploaded_files[i].length;j++){
          uploaded_files[i][j].img_size = j+1;
          if(i==profile_img_idx){
            uploaded_files[i][j].profile_img = 1; 
          } else if(i==big_img_idx) {
            uploaded_files[i][j].profile_img = 2;
          } else {
            uploaded_files[i][j].profile_img = 0;
          }
          all_uploaded_files.push(uploaded_files[i][j]);
        }
      }
      blogpostData.files = all_uploaded_files;
      
      Blogpost.createBlogpost(blogpostData).then(result => {
        logger.info('Blogpost created');
        res.status(200).json({success: true, id: blogpostData.id });
      }).catch(err => {
        logger.error("blogpostController: addNewBlogpost: Blogpost.createBlogpost - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      }); 
      
    }));
  } catch (err) {
    logger.error("blogpostController: addNewBlogpost: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

blogpostController.prototype.updateBlogpost = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var blogpostData = req.body;
    var profile_img_idx = -1;
    var big_img_idx = -1;
    var promises=[];

    var blogpost = yield Blogpost.getBlogpostDetails(id);
    if(!blogpost){
      res.status(404).json({success: false , message:"Invalid blogpost_id"});
      return;
    }
    
    if(blogpostData.starred)
      blogpostData.starred=parseInt(blogpostData.starred);
    if(blogpostData.slider)
      blogpostData.slider=parseInt(blogpostData.slider);

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.blogpostSchema2);
    var valid = validate(blogpostData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }

    var k=0;
    for(var f in req.files){
      var promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'blogpost');
      promises.push(promise);
      if(f=="profile_image") profile_img_idx=k;
      if(f=="big_image") big_img_idx=k;
      k++;        
    }

    Promise.all(promises).then(bluebird.coroutine(function *(uploaded_files) {

      var all_uploaded_files = [];
      for(var i=0;i<uploaded_files.length;i++){
        for(var j=0;j<uploaded_files[i].length;j++){
          uploaded_files[i][j].img_size = j+1;
          if(i==profile_img_idx){
            uploaded_files[i][j].profile_img = 1; 
          } else if(i==big_img_idx) {
            uploaded_files[i][j].profile_img = 2;
          } else {
            uploaded_files[i][j].profile_img = 0;
          }
          all_uploaded_files.push(uploaded_files[i][j]);
        }
      }
      blogpostData.files = all_uploaded_files;
      
      Blogpost.updateBlogpost(id, blogpostData).then(result => {
        logger.info('Blogpost updated');
        res.status(200).json({success: true});
      }).catch(err => {
        console.log(err)
        logger.error("blogpostController: updateBlogpost: Blogpost.updateBlogpost - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });

    }));
  } catch (err) {
    logger.error("blogpostController: updateBlogpost: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

blogpostController.prototype.filterBlogposts = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.countries = req.query.countries;
    queryParams.lang = req.query.lang;
    queryParams.sort = req.query.sort;
    queryParams.sortOpt = req.query.sortOpt && req.query.sortOpt.toUpperCase() || "ASC";
    queryParams.search = req.query.search;
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit))

    var tasks = [];
    tasks.push(Blogpost.filterBlogposts(queryParams));
    tasks.push(Blogpost.countFilterBlogposts(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, blogposts: results[0], blogpostsCount: results[1]});
  } catch (err) {
    logger.error("blogpostController: filterBlogposts: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

blogpostController.prototype.deleteBlogpost = bluebird.coroutine(function *(req, res) {
  try {
    var id = req.params.id;

    var blogpost = yield Blogpost.getBlogpostDetails(id);
    if(!blogpost){
      res.status(404).json({success: false , message:"Invalid blogpost_id"});
      return;
    }

    Blogpost.deleteBlogpost(id).then(result => {
      logger.info('Blogpost deleted');
      res.status(200).json({success: true}); 
      return;
    }).catch(err => {
      logger.error("blogpostController: deleteBlogpost: Blogpost.deleteBlogpost - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("blogpostController: deleteBlogpost: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

blogpostController.prototype.deleteBlogpostImage = (req, res) => {
  try {
    var { id } = req.params;
    
    Blogpost.deleteBlogpostImage(id).then(result => {
      logger.info('Deleted blogpost image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("blogpostController: deleteBlogpostImage: Blogpost.deleteBlogpostImage - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("blogpostController: deleteBlogpostImage: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

blogpostController.prototype.deleteBlogpostImageByName = (req, res) => {
  try {
    var { name } = req.params;
    
    Blogpost.deleteBlogpostImageByName(name).then(result => {
      logger.info('Deleted blogpost image');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("blogpostController: deleteBlogpostImageByName: Blogpost.deleteBlogpostImageByName - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("blogpostController: deleteBlogpostImageByName: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

function extractISODates(data) {
  var rx = /ISODate\((.*?)\)/g;
  var arr = [];
  var m;
  do {
    m = rx.exec(data);
    if (m) {
        arr.push(m[1]);
    }
  } while (m);
  return arr; 
}

blogpostController.prototype.importBlogposts = (req, res) => {
  try {
    Prediction.readFile(path.join(__dirname, "import.txt")).then(data => {
      data = data.replace(/ObjectId\((.*?)\)|NumberInt\((.*?)\)/g, '1');
      var dates = extractISODates(data);
      var count = 0;
      data = data.replace(/ISODate\((.*?)\)/g, () => {
        count++;
        return dates[count-1];
      });
      data = data.replace(/}\r\n{/g, "},\r\n{");
      data = "[" + data + "]";

      var blogposts = JSON.parse(data);
      blogposts.map(b => {
        delete b._id;
        b.id = uuid.v1();
        delete b.__v;
        if(b.post_image){
          var i_id = uuid.v1();
          if(b.post_image.name){
            var arr1 = b.post_image.name.split('.');
            var i_type = arr1 && arr1[arr1.length-1];
            var idx = b.post_image.name.length-i_type.length-1;
            var i_name = idx>=0 && b.post_image.name.substring(0, idx);
          }
          if(b.post_image.preview){
            b.post_image.preview = b.post_image.preview.replace(/blogPosts/g, 'blogpost');
            var i_link = "https://cdn.E-commerce.com"+b.post_image.preview
          }
          var new_img_obj = {
            id: i_id,
            profile_img: 1,
            name: i_name,
            type: i_type,
            link: i_link
          }
          b.files = [new_img_obj];
          delete b.post_image;
        }
        if(b.category){
          b.categories = [b.category];
          delete b.category;
        }
        if(b.date_added){
          b.date_added = new Date(b.date_added);
          delete b.category;
        }
        if(!b.starred){
          b.starred = 0;
        }
        if(!b.slider){
          b.slider = 0;
        }
        b.url = b.seo_link;
        b.lang = b.lang && b.lang.toUpperCase();
        b.country = b.lang;
      })

      Blogpost.insertBlogposts(blogposts).then(success => {
        res.status(200).json({success, blogposts});
      }).catch(err => {
        logger.error("blogpostController: importBlogposts: Blogpost.insertBlogposts - ERROR: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      })
      
    }).catch(err=>{
      logger.error("blogpostController: importBlogposts: Prediction.readFile - ERROR: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })
  } catch (err) {
    logger.error("blogpostController: importBlogposts: try-catch - ERROR: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new blogpostController();