var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var uuid = require('uuid');
var bluebird = require('bluebird');
var Ajv = require('ajv');
var validationSchema = require('../validationSchemas');
var Billboard = require('./billboardModel');
var Upload = require('../../utils/awsUpload');


var billboardController = function() {};

billboardController.prototype.addNewBillboard = bluebird.coroutine(function *(req, res){
    try{
        var billboardData = req.body;
        var files = [];
        if(billboardData.active){
            billboardData.active = parseInt(billboardData.active);
        }

        if(billboardData.display_video){
            billboardData.display_video = parseInt(billboardData.display_video);
        }
        var ajv = new Ajv();
        var validate = ajv.compile(validationSchema.billboardSchema);
        var valid = validate(billboardData);
        if(!valid){
            logger.error("billboardController: addNewBillboard - ERROR: validationSchema.billboardSchema: "+validate.errors);
            res.status(400).json({success: false, message: validate.errors});
            return;
        }

        for(let i in req.files){
            let file = Upload.uploadToS3Async(req.files[i].data, req.files[i].mimetype, 'billboard');
            files.push(file);
        }

        Promise.all(files).then(bluebird.coroutine(function *(uploadedFile) {
            billboardData.id = uuid.v1();
            billboardData.image = {
                id: uuid.v1(),
                name: uploadedFile[0].name,
                type: uploadedFile[0].type,
                link: uploadedFile[0].link
            };

            if(billboardData.active == 1){
                var deactivateBillboards = yield Billboard.deactivateBillboards();
            }
            Billboard.createBillboard(billboardData).then((result) => {
                logger.info('Billboard created');
                logInitdataChange.write();
                res.status(200).json({success: true});
            }).catch((err) => {
                logger.error("billboardController: addNewBillboard - ERROR: Billboard.createBillboard: " + err.message);
                res.status(500).json({success: false, message: err.message});
            });
        })).catch(err => {
            logger.error("billboardController: addNewBillboard - ERROR: Promise.all(files): " + err.message);
            res.status(500).json({success: false, message: err.message});
        });
    }
    catch(err){
        logger.error("billboardController: addNewBillboard - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
    }
});

billboardController.prototype.editBillboard = bluebird.coroutine(function *(req, res){
    try{
        var {id} = req.params;
        var data = req.body;
        data.id = id;
        var files = [];

        for(let i in req.files){
            let file = Upload.uploadToS3Async(req.files[i].data, req.files[i].mimetype, 'billboard');
            files.push(file);
        }

        if(files.length > 0){
            Promise.all(files).then(bluebird.coroutine(function *(uploadedFile) {
                var img = {
                    id: uuid.v1(),
                    name: uploadedFile[0].name,
                    type: uploadedFile[0].type,
                    link: uploadedFile[0].link,
                    billboard_id: data.id
                }

                if(data.active == 1){
                    var deactivateBillboards = yield Billboard.deactivateBillboards(data.lang, data.country);
                }
                var edited = yield Billboard.updateBillboard(data, img);
                logInitdataChange.write();
                res.status(200).json({success:true});
            })).catch(err => {
                logger.error("billboardController: editBillboard - ERROR: Promise.all(files): " + err.message);
                res.status(500).json({success: false, message: err.message});
            });
        }
        else{
            if(data.active == 1){
                var deactivateBillboards = yield Billboard.deactivateBillboards(data.lang, data.country);
            }
            var edited = yield Billboard.updateBillboard(data);
            res.status(200).json({success:true});
        }

    }
    catch(err){
        logger.error("billboardController: editBillboard - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
    }
});

billboardController.prototype.deleteBillboard = bluebird.coroutine(function *(req, res){
    try{
        var {id} = req.params;
        var deleted = yield Billboard.deleteBillboard(id);
        logInitdataChange.write();
        res.status(200).json({success: true});
    }
    catch(err){
        logger.error("billboardController: deleteBillboard - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

billboardController.prototype.getActiveBillboard = bluebird.coroutine(function *(req, res){
    try{
        var activeBillboard = yield Billboard.getActiveBillboard();

        if(activeBillboard){
            console.log('aha')
            res.status(200).json({success: true, billboard: activeBillboard});
        }
        else{
            console.log('non')
        }
    }
    catch(err){
        logger.error("billboardController: getActiveBillboard - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

billboardController.prototype.getAllBillboards = bluebird.coroutine(function *(req, res){
    try{
        var billboards = yield Billboard.getAllBillboards();

        if(billboards){
            res.status(200).json({success: true, billboards: billboards});
        }
    }
    catch(err){
        logger.error("billboardController: getAllBillboards - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

billboardController.prototype.deleteBillboardImage = bluebird.coroutine(function *(req, res){
    try{
        var {id} = req.params;
        var deleted = yield Billboard.deleteImage(id);

        res.status(200).json({success: true});
    }
    catch(err){
        logger.error("billboardController: deleteBillboardImage - ERROR: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

module.exports = new billboardController();
