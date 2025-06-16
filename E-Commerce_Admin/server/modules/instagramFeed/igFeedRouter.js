var express = require('express');
var router = express.Router();
var igFeedController = require('./igFeedController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.get('/', igFeedController.filterIGfeeds);
//router.use(admingroupValidationMiddleware.validate);

router.post('/', igFeedController.addNewIGfeed);
router.put('/:id', igFeedController.updateIGfeed);
router.delete('/:id', igFeedController.deleteIGfeed);
router.delete('/images/:image_id', igFeedController.deleteIGfeedImage);

module.exports = router;