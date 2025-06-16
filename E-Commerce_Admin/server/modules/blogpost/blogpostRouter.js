var express = require('express');
var router = express.Router();
var blogpostController = require('./blogpostController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
/*router.use(tokenValidationMiddleware.validate);
router.use(admingroupValidationMiddleware.validate);*/

router.get('/', blogpostController.filterBlogposts);
router.get('/import', blogpostController.importBlogposts);
router.post('/', blogpostController.addNewBlogpost);
router.put('/:id', blogpostController.updateBlogpost);
router.delete('/:id', blogpostController.deleteBlogpost);
router.delete('/image/:name', blogpostController.deleteBlogpostImageByName);

module.exports = router;