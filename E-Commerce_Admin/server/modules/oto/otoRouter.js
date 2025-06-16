var express = require('express');
var router = express.Router();
var otoController = require('./otoController');

router.post('/', otoController.newOto);
router.get('/', otoController.filterOto); 
router.put('/:id', otoController.editOto);
router.delete('/:id', otoController.deleteOto);

module.exports = router;
