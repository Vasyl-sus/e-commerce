var Oto = require('./otoModel');
var bluebird = require('bluebird');
var Ajv = require('ajv');
var uuid = require('uuid');
var validationSchema = require('../validationSchemas.js');
var logger = require('../../utils/logger');

var otoController = function() {};

otoController.prototype.newOto = bluebird.coroutine(function *(req, res)  {
    try{
        var otoData = req.body;
        if(otoData.time){
            otoData.time=parseInt(otoData.time);
        }
        var ajv = new Ajv();
        var validate = ajv.compile(validationSchema.otoSchema);
        var valid = validate(otoData);
        if(!valid){
            logger.error("otoController: newOto - ERROR: validationSchema.otoSchema: "+validate.errors);
            res.status(400).json({success: false, message: validate.errors});
            return;
        }
        var otoId = uuid.v1();

        if(otoData.offer_on){
            var check = yield Oto.checkOtoOfferOn(otoData.offer_on);
        }

        if((check && check == 0) || !check){
            Oto.creteOto(otoId, otoData).then(result => {
                logger.info('Oto created');
                res.status(200).json({"success": true, id: otoId});
            }).catch(err => {
                logger.error("otoController: newOto - ERROR: Oto.creteOto: "+err.message);
                res.status(500).json({success: false, message: err.message});
                return;
            });
        }
        else if(check && check > 0){
            res.status(500).json({success:false, message: "Already exists"});
            return;
        }
    }
    catch(err){
        logger.error("otoController: newOto - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

otoController.prototype.filterOto = bluebird.coroutine(function *(req, res) {
    try{
        var queryParams = {};
        queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
        queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 50;

        var tasks = [];
        tasks.push(Oto.filterOto(queryParams));
        tasks.push(Oto.countFilterOto());
    
        var results = yield bluebird.all(tasks);
        res.status(200).json({"success": true, otos: results[0], otosCount: results[1]});
    }
    catch(err){
        logger.error("otoController: filterOto - ERROR: try-catch: "+err.message);
        res.status(500).json({success: false, message: err.message});
        return;
    }
});

otoController.prototype.editOto = (req, res) => {
    try{
        var { id } = req.params; 
        var otoData = req.body;

        var ajv = new Ajv();
        var validate = ajv.compile(validationSchema.otoSchema);
        var valid = validate(otoData);
        if(!valid){
            logger.error("otoController: editOto - ERROR: validationSchema.otoSchema: "+validate.errors);
            res.status(400).json({success: false, message: validate.errors});
            return;
        }
        otoData.id = id;
        if(otoData.time)
        otoData.time=parseInt(otoData.time);
        Oto.editOto(otoData).then(result => {
            logger.info('Oto edited');
            res.status(200).json({"success": true});
        }).catch(err => {
            logger.error("otoController: editOto - ERROR: Oto.editOto: "+err.message);
            res.status(500).json({success: false, message: err.message});
            return;
        });

    }
    catch(err){
        logger.error("otoController: editOto - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
};

otoController.prototype.deleteOto = (req, res) => {
    try{
        var { id } = req.params;

        Oto.deleteOto(id).then(result => {
          logger.info('Deleted oto');
          res.status(200).json({success: true});
        }).catch(err => {
          logger.error("otoController: deleteOto - ERROR: Oto.deleteOto: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        })
    }
    catch(err){
        logger.error("otoController: deleteOto - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;  
    }
};

module.exports = new otoController();