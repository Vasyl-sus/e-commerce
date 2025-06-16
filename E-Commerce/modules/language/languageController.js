var logger = require('../../utils/logger');
var bluebird = require('bluebird');
const fs = require('file-system');
const path = require('path');
var Lang = require('../lang/langModel');
//var sitemapService = require('../../utils/sitemapService');

var Ajv = require('ajv');
var languageValidation = require('./languageValidation.js');

var languageController = function () {};

findByName = (array, name) => {
  if(array){
    for(var i=0;i<array.length;i++){
      if(array[i].name == name)
        return i;
    }
  }
  return -1;
}

findByNameAndSection = (array, name, section) => {
  if(array){
    for(var i=0;i<array.length;i++){
      if(array[i].name == name && array[i].section == section)
        return i;
    }
  }
  return -1;
}

findByPageAndLang = (array, page, lang) => {
  if(array){
    for(var i=0;i<array.length;i++){
      if(array[i].page == page && array[i].lang == lang)
        return i;
    }
  }
  return -1;
}

writeJSON = (path_to_file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path_to_file, JSON.stringify(data, null, 2), function (err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
};

readJSON = (path_to_file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path_to_file, 'utf8', function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

readJSON1 = (path_to_file, obj) => {
  if (!obj) {
    obj = [];
  }
  return new Promise((resolve, reject) => {
    fs.readFile(path_to_file, 'utf8', function (err, data) {
      if (err && err.code == "ENOENT") return resolve(obj);
      else if (err) return reject(err);
      else resolve(JSON.parse(data));
    });
  });
};

languageController.prototype.addNewLanguageModules = (req, res) => {
  try {
    var language = req.body.language && req.body.language.toUpperCase();
    var languageName = req.body.languageName;

    if(!language || !languageName){
      res.status(403).json({success: false, message: "Missing language or languageName"});
      return;
    }

    var lang = 'SL';

    var tasks0 = [];
    tasks0.push(readJSON(path.join(__dirname, '../../locales/'+lang+'/language.json')));
    tasks0.push(readJSON1(path.join(__dirname, '../../locales/'+language+'/language.json')));
    tasks0.push(readJSON1(path.join(__dirname, '../../locales/langNames.json'), {}));

    bluebird.all(tasks0).then(results0 => {
      var insertModules = results0[0];
      var langModules = results0[1];
      var langNames = results0[2];
      var writeLangNames = false;

      for(var i=0;i<insertModules.length;i++){
        //if(insertModules[i].name in languageValidation.T){
          //console.log(insertModules[i])
          /*
          var ajv = new Ajv({allErrors:true, extendRefs:true}); // options can be passed, e.g. {allErrors: true}
          var validate = ajv.addSchema(languageValidation.editSchemaArray[0])
                            .compile(languageValidation.editSchemaArray[languageValidation.T[insertModules[i].name]]);
          var valid = validate(insertModules[i]);
          if (!valid) {
            console.log(validate.errors)
            res.status(400).json({success: false, message: validate.errors});
            return;
          }
          */
          var idx=findByName(langModules, insertModules[i].name);
          if(idx==-1){
            langModules.push(insertModules[i]);
          }
        //} else {
        //  res.status(403).json({success: false, message: "Incorrect lang_module name: " + insertModules[i].name});
        //  return;
        //}
      }

      langModules.sort((a,b)=>{
        return a.id-b.id;
      });

      for (var i = 0; i < langModules.length; i++) {
        langModules[i].language = language
        if (langModules[i].name == 'main') {
          langModules[i].data.full_lang_name = languageName;
          langNames[language] = languageName;
          writeLangNames = true;
        }
      }

      var tasks = [];
      tasks.unshift(writeJSON(path.join(__dirname, '../../locales/'+language+'/language.json'), langModules));
      if(writeLangNames){
        tasks.push(writeJSON(path.join(__dirname, '../../locales/langNames.json'), langNames));
      }

      bluebird.all(tasks).then(results => {
        res.status(200).json({success: true, langModules: langModules});
        return;
      }).catch(err => {
        logger.error("languageController: addNewLanguageModules("+ language +") - ERROR: bluebird.all(tasks): " + err.message);
        res.status(500).json({success: false, message: "Error writing "+language+" language files!"});
        return;
      });

    }).catch(err => {
      logger.error("languageController: addNewLanguageModules("+ language +") - ERROR: bluebird.all(tasks0): " + err.message);
      res.status(500).json({success: false, message: "Error opening language files: "+ err.message});
      return;
    })
  } catch (err) {
    logger.error("languageController: addNewLanguageModules("+ language +") - ERROR: try-catch " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

languageController.prototype.updateProductNames = (req, res) => {
  try {
    let data = req.body;
    console.log("data", data)
    var tasks0 = [];
    for (let i = 0; i < data.length; i++) {
      tasks0.push(readJSON(path.join(__dirname, '../../locales/'+data[i].lang+'/language.json')));
    }

    bluebird.all(tasks0).then(results0 => {
      var langModules = results0;
      var tasks = [];
      for (let i = 0; i < langModules.length; i++) {
        let found = langModules[i].filter(r => {
          return r.name === data[i].oldData
        })
        found.map(f => {
          f.name = data[i].newData
        })
        console.log("found");
        tasks.push(writeJSON(path.join(__dirname, '../../locales/'+data[i].lang+'/language.json'), langModules[i]));

        bluebird.all(tasks).then(results => {
          return true;
        });
      }
    })
  } catch (err) {
    logger.error("languageController: updateProductNames - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }

}

languageController.prototype.editLanguageModules = (req, res) => {
  try {
    var language = req.body.language && req.body.language.toUpperCase();
    var insertModules = req.body.datas;

    if(!language || !insertModules || (insertModules && insertModules.length==0)){
      res.status(403).json({success: false, message: "Missing language or datas - empty or missing"});
      return;
    }

    var tasks0 = [];
    tasks0.push(readJSON(path.join(__dirname, '../../locales/'+language+'/language.json')));
    tasks0.push(readJSON(path.join(__dirname, '../../locales/langNames.json'), {}));

    bluebird.all(tasks0).then(results0 => {
      var langModules = results0[0];
      var langNames = results0[1];
      var writeLangNames = false;

      for(var i=0;i<insertModules.length;i++){
        //if(insertModules[i].name in languageValidation.T){
          /*
          var ajv = new Ajv({allErrors:true, extendRefs:true}); // options can be passed, e.g. {allErrors: true}
          var validate = ajv.addSchema(languageValidation.editSchemaArray[0])
                            .compile(languageValidation.editSchemaArray[languageValidation.T[insertModules[i].name]]);
          var valid = validate(insertModules[i]);
          if (!valid) {
            res.status(400).json({success: false, message: validate.errors});
            return;
          }
          */
          var idx=findByName(langModules, insertModules[i].name);
          if (insertModules[i].section) {
            idx = findByNameAndSection(langModules, insertModules[i].name, insertModules[i].section)
          }
          console.log("Lang modules " + langModules[idx]);
          if(idx!=-1){
            Object.keys(insertModules[i].data).forEach(key =>{
              langModules[idx].data[key]=insertModules[i].data[key];
            });
            // if(insertModules[i].name=="main"){
            //   langNames[language] = insertModule.data.full_lang_name;
            //   writeLangNames = true;
            // }
          } else {
            res.status(403).json({success: false, message: "lang_module hasn't been created yet"});
            return;
          }
        //} else {
        //  res.status(403).json({success: false, message: "Incorrect lang_module name!"});
        //  return;
        //}
      }

      var tasks=[];

      tasks.unshift(writeJSON(path.join(__dirname, '../../locales/'+language+'/language.json'), langModules));
      if(writeLangNames){
        tasks.push(writeJSON(path.join(__dirname, '../../locales/langNames.json'), langNames));
      }

      bluebird.all(tasks).then(results => {
        res.status(200).json({success: true, results: langModules});
        return;
      }).catch(err => {
        logger.error("languageController: editLanguageModules("+ language +") - ERROR: bluebird.all(tasks): " + err.message);
        res.status(500).json({success: false, message: "Error writing "+language+" language files!"});
        return;
      });

    }).catch(err => {
      logger.error("languageController: editLanguageModules("+ language +") - ERROR: bluebird.all(tasks0): " + err.message);
      res.status(500).json({success: false, message: "Error opening language files: "+ err.message});
      return;
    })

  } catch (err) {
    logger.error("languageController: editLanguageModules("+ language +") - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

languageController.prototype.getModulesByLanguage = (req, res) => {
  try {
    var lang = req.params.lang.toUpperCase() || 'SI';

    fs.readFile(path.join(__dirname, '../../locales/'+lang+'/language.json'), 'utf8', function (err, fileData, lang) {
      if (err) {
        if(err.code=="ENOENT"){
          res.status(404).json({success: false, message: "Language doesn't exist."});
          return;
        } else {
          logger.error("languageController: getModulesByLanguage("+ lang +") - ERROR: fs.readFile: " + err.message);
          res.status(500).json({success: false, message: "Error opening "+this.lang+"/language.json file!"});
          return;
        }
      } else {
        try {
          var results = JSON.parse(fileData);
          res.status(200).json({success: true, resultsCount: results.length, results: results});
          return;
        } catch(ex) {
          logger.error("languageController: getModulesByLanguage("+ lang +") - ERROR: JSON.parse: " + ex.message);
          res.status(500).json({success: false, message: "Corrupt "+this.lang+"/language.json file!"});
          return;
        }
      }
    }.bind({
      lang: lang
    }));
  }
  catch (err) {
    logger.error("languageController: getModulesByLanguage("+ lang +") - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

languageController.prototype.getModuleByLanguageAndName = (req, res) => {
  try {
    var lang = req.params.lang.toUpperCase() || 'SI';
    var name = req.params.name;
    if(name in languageValidation.T){
      fs.readFile(path.join(__dirname, '../../locales/'+lang+'/language.json'), 'utf8', function (err, fileData, lang, name) {
        if (err) {
          if(err.code=="ENOENT"){
            res.status(404).json({success: false, message: "Language doesn't exist."});
            return;
          } else {
            logger.error("languageController: getModulesByLanguageAndName("+ lang +") - ERROR: fs.readFile: " + err.message);
            res.status(500).json({success: false, message: "Error opening "+this.lang+"/language.json file!"});
            return;
          }
        } else {
          try {
            var langModules = JSON.parse(fileData);
          } catch(ex) {
            logger.error("languageController: getModulesByLanguageAndName("+ lang +") - ERROR: JSON.parse: " + ex.message);
            res.status(500).json({success: false, message: "Corrupt "+this.lang+"/language.json file!"});
            return;
          }
            var idx=findByName(langModules,this.name);
            if(idx!=-1){
              res.status(200).json({success: true, result: langModules[idx]});
              return;
            } else {
              res.status(500).json({success: false, message: "lang_module "+this.name+" is missing from "+this.lang+" language"});
              return;
            }
        }
      }.bind({
        lang: lang,
        name: name
      }));
    } else {
      res.status(403).json({success: false, message: "Incorrect lang_module name!"});
      return;
    }

  } catch (err) {
    logger.error("languageController: getModulesByLanguageAndName - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


languageController.prototype.editCountryLanguageRoutes = bluebird.coroutine(function*(req, res) {
  try {
    var routesData = req.body;

    var ajv = new Ajv({allErrors:true, extendRefs:true}); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(languageValidation.routes_Schema1);
    var valid = true//validate(routesData);
    if (!valid) {
      res.status(400).json({success: false, message: validate.errors});
      return;
    }
    var tasks0 = [];
    tasks0.push(Lang.getFullLangConfig());

    tasks0.push(readJSON(path.join(__dirname, '../../locales/routes.json')));
    //tasks0.push(sitemapService.getSitemapObject(path.join(__dirname,'../../static/sitemap.xml')));

    bluebird.all(tasks0).then(results0 => {
    var langConfig = results0[0];
    console.log(routesData, langConfig)
    if(!langConfig[routesData.country])
      langConfig[routesData.country]=[];
    var routes = results0[1];
    //var sitemap = results0[2];
    var input_langs = [];
    //var sitemap_langs = [];

    var promises = [];
    for(var i=0;i<routesData.langs.length;i++){
      promises.push(readJSON(path.join(__dirname, '../../locales/'+routesData.langs[i]+'/language.json')));
    }
    var filtered = [];
    bluebird.all(promises).then(results => {
      for(var i=0;i<results.length;i++){
        results[i] = results[i].find(p=>{return p.name=="routes_data"});
        console.log(results[i])
        console.log("----------------------------")
        if(results[i]){
          if(!langConfig[routesData.country].find(l=>{return l==routesData.langs[i]}))
            langConfig[routesData.country].push(routesData.langs[i]);

          var new_routes = [];
          var input_lang = routesData.langs[i].toLowerCase() +"-"+ routesData.country.toLowerCase();
          var lang = routesData.langs[i].toLowerCase();
          //if(lang=="si") lang="sl";
          //var sitemap_lang = lang+"-"+routesData.country.toUpperCase();

          input_langs.push(input_lang);
          //sitemap_langs.push(sitemap_lang);

          for(var k in results[i].data){
            var obj = {
              lang: input_lang,
              page: results[i].data[k].name,
              route: results[i].data[k].value
            };
            new_routes.push(obj);
          }

          filtered = routes.filter(r => {
            return r.lang != input_lang
          })
          filtered = [...filtered, ...new_routes]
        } else {
          res.status(403).json({success: false, message: routesData.langs[i] + " language is missing routes_data"});
          return;
        }
      }

      for(var i=0;i<langConfig[routesData.country].length;i++){
        if(!routesData.langs.find(l=>{return l==langConfig[routesData.country][i]})){
          langConfig[routesData.country].splice(i,1);
          i--;
        }
      }

      // var countryL = routesData.country.toLowerCase();

      // routes = routes.filter(r=>{
      //   var a = r.lang.split('-')[0];
      //   return a!=countryL || input_langs.find(il=>{
      //     return il==r.lang;
      //   })
      // })

      // routes.sort((a,b)=>{
      //   if(a.lang < b.lang) return -1;
      //   if(a.lang > b.lang) return 1;
      //   return 0;
      // });

      //sitemap = sitemapService.deleteFromSitemap1(sitemap, routesData.country, input_langs, sitemap_langs);

      //var writePromise = bluebird.promisify(fs.writeFile);


      var tasks = [];
      logger.info(JSON.stringify(filtered));
      console.log("-----------------------------------------")
      logger.info(JSON.stringify(langConfig));
      tasks.push(writeJSON(path.join(__dirname, '../../locales/routes.json'), filtered));
      tasks.push(writeJSON(path.join(__dirname, '../../locales/langConfig.json'), langConfig));
      //tasks.push(writePromise(path.join(__dirname, '../../static/sitemap.xml'), sitemapService.stringifySitemapObject(sitemap)));

      bluebird.all(tasks).then(results=>{
        res.status(200).json({success: true, routes });
        return;
      }).catch(err=>{
        logger.error("languageController: editCountryLanguageRoutes - ERROR: bluebird.all(tasks): " + err.message);
        res.status(500).json({success: false, message: err.message});
        return;
      })

    }).catch(err=>{
      logger.error("languageController: editCountryLanguageRoutes - ERROR: bluebird.all(promises): " + err.message);
      res.status(500).json({success: false, message: "Promises: "+err.message});
      return;
    })
  }).catch(err=>{
    logger.error("languageController: editCountryLanguageRoutes - ERROR: bluebird.all(tasks0): " + err.message);
    res.status(500).json({success: false, message: "tasks0: "+err.message});
    return;
  })

  } catch(err) {
    logger.error("languageController: editCountryLanguageRoutes - ERROR: try-catch: " + err.message);
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


module.exports = new languageController();
