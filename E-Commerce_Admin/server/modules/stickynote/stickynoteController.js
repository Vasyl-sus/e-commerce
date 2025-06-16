var logger = require('../../utils/logger');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Stickynote = require('./stickynoteModel.js');

var stickynoteController = function () {};

stickynoteController.prototype.addNewStickyNote = bluebird.coroutine(function *(req, res) {
  try {
    var stickynoteData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.stickynoteSchema1);
    var valid = validate(stickynoteData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var stickynote = yield Stickynote.getStickyNoteByCountryAndLang(stickynoteData.country, stickynoteData.language);
    if(stickynote){
        res.status(403).json({success: false, message: "("+stickynoteData.country+","+stickynoteData.language + ") sticky note already exists"});
        return; 
    }
    
    Stickynote.createStickyNote(stickynoteData).then((result) => {
      logger.info('Sticky note created');
      res.status(200).json({success: true, id: result });
    }).catch((err) => {
      logger.error("stickynoteController: addNewStickyNote - ERROR: Stickynote.createStickyNote: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("stickynoteController: addNewStickyNote - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

stickynoteController.prototype.updateStickyNote = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var stickynoteData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.stickynoteSchema2);
    var valid = validate(stickynoteData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    
    var stickynote = yield Stickynote.getStickyNoteByCountryAndLang(stickynoteData.country, stickynoteData.lang);
    if(stickynote && stickynote.id != id){
      res.status(403).json({success: false, message: "("+stickynoteData.country+","+stickynoteData.lang + ") sticky note already exists"});
      return;
    }

    Stickynote.updateStickyNote(id, stickynoteData).then(result => {
      if(result!=0){
        logger.info('Sticky note updated');
        res.status(200).json({success: true});
      } else {
        res.status(404).json({success: false, message: "Invalid stickynote_id"});
      }
    }).catch(err => {
      logger.error("stickynoteController: updateStickyNote - ERROR: Stickynote.updateStickyNote: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("stickynoteController: updateStickyNote - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

stickynoteController.prototype.filterStickyNotes = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
    queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

    var tasks = [];
    tasks.push(Stickynote.filterStickyNotes(queryParams));
    tasks.push(Stickynote.countFilterStickyNotes(queryParams));

    var results = yield bluebird.all(tasks);
    res.status(200).json({success: true, stickynotes: results[0], stickynotesCount: results[1]});
  } catch (err) {
    logger.error("stickynoteController: filterStickyNotes - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

stickynoteController.prototype.deleteStickyNote = (req, res) => {
  try {
    var { id } = req.params;

    Stickynote.deleteStickyNote(id).then(result => {
      if(result!=0) { 
        logger.info('Sticky note deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid stickynote_id"});
      }
    }).catch(err => {
      logger.error("stickynoteController: deleteStickyNote - ERROR: Stickynote.deleteStickyNote: "+err.message);
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("stickynoteController: deleteStickyNote - ERROR: try-catch: "+err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new stickynoteController();