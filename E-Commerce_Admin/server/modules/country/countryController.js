var logger = require('../../utils/logger');
var logInitdataChange = require('../../utils/logInitdataChange');
var config = require('../../config/environment/index');
var uuid = require('uuid');
var bluebird = require('bluebird');
var axios = require('axios');


var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var Currency = require('../currency/currencyModel.js');
var Country = require('./countryModel.js');

var countryController = function () {};

countryController.prototype.addCountry = bluebird.coroutine(function *(req, res) {
  try {
    var countryData=req.body;
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.countrySchema1);
    var valid = validate(countryData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var tasks=[];
    tasks.push(Currency.getCurrencyByName(countryData.currency));
    tasks.push(Country.getCountryByName(countryData.name));
    var results = yield bluebird.all(tasks);
    var currency = results[0];
    if(currency){
        var country = results[1];
        if(!country){
            countryData.id = uuid.v1();
            countryData.currency_id = currency.id;
            if(countryData.send_reminders!=0 && countryData.send_reminders!=1){
                countryData.send_reminders = 1;
            }
            
            Country.createCountry(countryData).then((result) => {
                logger.info('Country created');
                logInitdataChange.write();
                res.status(200).json({success: true, id: result });
            }).catch((err) => {
                logger.error("countryController: addCountry - ERROR: Country.createCountry: "+err.message)
                res.status(500).json({success: false, message: err.message});
                return;
            });
        } else {
            res.status(403).json({success: false, message: "country_exists"});
            return;
        }
    } else {
        res.status(404).json({success: false, message: "Invalid currency name!"});
        return;
    }

  } catch (err) {
    logger.error("countryController: addCountry - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

countryController.prototype.filterCountries = bluebird.coroutine(function *(req, res) {
    try {
        var queryParams = {}
        queryParams.pageNumber = (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1;
        queryParams.pageLimit = (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20;

        var queryLangs = (req.query.showLangs && parseInt(req.query.showLangs)) || 0;
    
        var url1 = config.catalogue_server.url;

        const options = { 
            url: url1 + "lang/config/all",
            headers: { 'authorization': req.session.id } 
        };

        var tasks = [];
        tasks.push(Country.filterCountries(queryParams));
        tasks.push(Country.countFilterCountries(queryParams));
        if(queryLangs){
            tasks.push(axios.get(options.url, { headers: options.headers }));
        }
    
        var results = yield bluebird.all(tasks);
        var countries = results[0];

        if(queryLangs){
            for(var i=0;i<countries.length;i++){
                countries[i].langs = [];
                if(results[2].statusCode==200 && results[2].body){
                    var body = JSON.parse(results[2].body);
                    if(body.langConfig){
                        countries[i].langs = body.langConfig[countries[i].name] || [];
                    }
                }
            }
        }

        res.status(200).json({success: true, countries, countriesCount: results[1]});
      } catch (err) {
        logger.error("countryController: filterCountries - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
      }
});

countryController.prototype.updateCountry = bluebird.coroutine(function * (req, res) {
    try {
        var { id } = req.params; 
        var countryData = req.body;
    
        //AJV validation
        var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        var validate = ajv.compile(validationSchema.countrySchema2);
        var valid = validate(countryData);
        if (!valid) {
            res.status(400).json({success: false, message: validate.errors});
            return;
        }
        
        var country1 = yield Country.getCountryDetails(id);
        if(!country1){
            res.status(404).json({success: false, message: "Invalid country_id"});
            return;
        }

        var country = yield Country.getCountryByName(countryData.name);
        //console.log(currency);
        if(country && country.id!=id){
            res.status(403).json({success: false, message: "country_exists"});
            return;
        }
        if(countryData.currency){
            var currency = yield Currency.getCurrencyByName(countryData.currency);
            if(!currency){
                res.status(403).json({success: false, message: "Invalid currency name!"});
                return;
            }
            countryData.currency_id = currency.id;
            delete countryData.currency;
        }

        Country.updateCountry(id, countryData).then(result => {
            logger.info('Country updated');
            logInitdataChange.write();
            res.status(200).json({success: true});
        }).catch(err => {
            logger.error("countryController: updateCountry - ERROR: Country.updateCountry: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
        });
    
    } catch (err) {
        logger.error("countryController: updateCountry - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
  });
  

countryController.prototype.deleteCountry = (req, res) => {
    try {
        var { id } = req.params;

        Country.deleteCountry(id).then(result => {
            if(result!=0) { 
                logger.info('Country deleted');
                logInitdataChange.write();
                res.status(200).json({success: true}); 
            } else {
                res.status(404).json({success: false , message:"Invalid country_id"});
            }
        }).catch(err => {
            logger.error("countryController: deleteCountry - ERROR: Country.deleteCountry: "+err.message)
            res.status(500).json({success: false, message: err.message});
            return;
        });
    } catch (err) {
        logger.error("countryController: deleteCountry - ERROR: try-catch: "+err.message)
        res.status(500).json({success: false, message: err.message});
        return;
    }
}

module.exports = new countryController();