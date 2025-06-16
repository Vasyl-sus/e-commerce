var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Color = require('./colorModel.js');

var colorController = function () {};

colorController.prototype.addColor = bluebird.coroutine(function *(req, res) {
  try {
    var colorData=req.body;
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.colorSchema);
    var valid = validate(colorData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var color = yield Color.getColorByDescription(colorData.description);
    //console.log(blogpost);
    if(!color){
      Color.createColor(colorData).then((result) => {
          logger.info('Color created');
          res.status(200).json({success: true, id: result });
      }).catch((err) => {
        logger.error("colorController: addColor - ERROR: Color.createColor: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      });
    } else {
        res.status(403).json({success: false, message: "color_exists"});
        return;
    }
  } catch (err) {
    logger.error("colorController: addColor - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

colorController.prototype.getColors = bluebird.coroutine(function *(req, res) {
    try {
        var queryParams = {}
        queryParams.from = req.query.from;
    
        var tasks = [];
        tasks.push(Color.getColors(queryParams));
        tasks.push(Color.countGetColors(queryParams));
    
        var results = yield bluebird.all(tasks);
        res.status(200).json({success: true, colors: results[0], colorsCount: results[1]});
      } catch (err) {
        logger.error("colorController: getColors - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      }
});

colorController.prototype.deleteColor = (req, res) => {
    var { id } = req.params;

    Color.deleteColor(id).then(result => {
        if(result!=0) { 
            logger.info('Color deleted');
            res.status(200).json({success: true}); 
        } else {
            res.status(404).json({success: false , message:"Invalid color_id"});
        }
    }).catch(err => {
        logger.error("colorController: deleteColor - ERROR: Color.deleteColor: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    });
}

module.exports = new colorController();