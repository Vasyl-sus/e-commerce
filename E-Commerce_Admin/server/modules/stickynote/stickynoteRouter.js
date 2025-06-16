var express = require('express');
var router = express.Router();
var stickynoteController = require('./stickynoteController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
//router.use(admingroupValidationMiddleware.validate);

router.get('/', stickynoteController.filterStickyNotes);
router.post('/', stickynoteController.addNewStickyNote);
router.put('/:id', stickynoteController.updateStickyNote);
router.delete('/:id', stickynoteController.deleteStickyNote);

module.exports = router;