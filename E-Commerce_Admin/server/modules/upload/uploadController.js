var logger = require('../../utils/logger');

var XLSX = require('xlsx');
var Product = require('../product/productModel')

var Upload = require('../../utils/awsUpload');

var uploadController = function () {};

uploadController.prototype.uploadFile = (req, res) => {
  try {
    var promises = []; 
    for (var f in req.files) {
      var promise = Upload.uploadToS3AsyncFile(req.files[f].data, req.files[f].mimetype, 'upload', req.files[f].name);
      promises.push(promise);        
    }

    Promise.all(promises).then((uploaded_files) => {
      res.status(200).json({success: true, uploaded_files});
      return;
    }).catch(err => {
      logger.error("uploadController: uploadFile - ERROR: Promise.all(promises): " + err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    }); 
    
  } catch (err) {
    logger.error("uploadController: uploadFile - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
};

uploadController.prototype.uploadReviews = (req, res) => {
  let file = req.files;
  if (!file) {
    res.status(500).json({success: false, message: "no file"});
    return;
  }


  var workbook = XLSX.read(file.file.data, {type: 'array'});
  var data = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, {raw: false});
  
  Product.addProductReviews(data).then((result) => {
    res.status(200).json({success: true, result});
    return;
  }).catch(error => {
    console.log(error)
  })

}

module.exports = new uploadController();