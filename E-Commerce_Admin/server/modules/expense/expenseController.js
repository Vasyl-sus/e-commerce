var logger = require('../../utils/logger');
var uuid = require('uuid');
var bluebird = require('bluebird');

var Ajv = require('ajv');
var validationSchema = require('../validationSchemas');
var statisticsValidation = require('../statistics/statisticsValidation')

var Statistics = require('../statistics/statisticsModel')
var Country = require('../country/countryModel');
var Expense = require('./expenseModel');

var expenseController = function () {};

expenseController.prototype.addNewExpense = bluebird.coroutine(function *(req, res) {
  try {
    var expenseData = req.body;

     //AJV validation
     var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
     var validate = ajv.compile(validationSchema.expenseSchema1);
     var valid = validate(expenseData);
     if (!valid) {
         res.status(400).json({success: false, message: validate.errors});
         return;
     }

    // if(expenseData.country)
    //   expenseData.country = expenseData.country.toUpperCase();
    // var country = yield Country.getCountryByName(expenseData.country);
    // if(!country){
    //   res.status(404).json({success: false, message: "Invalid country!"});
    //   return;
    // }

    var expense1 = yield Expense.checkNameCountryActive(expenseData);
    if(expense1){
      res.status(403).json({success: false, message: "(country, name, active) duplicate"});
      return;
    }

    expenseData.id = uuid.v1();

    var additionalFields = {};
    if(expenseData.additional_fields && expenseData.additional_fields.length>0){
      var arr = JSON.parse(expenseData.additional_fields);
      for(var i=0;i<arr.length;i++){
        additionalFields[arr[i].content]=null;
      }
    }

    expenseData.additional_fields = additionalFields;
    if(Object.keys(additionalFields).length == 0){
      expenseData.additional_fields = null;
    }

    Expense.createExpense(expenseData, req.admin).then((result) => {
      logger.info('Expense created');
      res.status(200).json({"success": true, id: expenseData.id });
    }).catch((err) => {
      logger.error("expenseController: addNewExpense - ERROR: Expense.createExpense: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: addNewExpense - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

expenseController.prototype.updateExpense = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params; 
    var expenseData = req.body;

    //AJV validation
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.expenseSchema2);
    var valid = validate(expenseData);
    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    var expense = yield Expense.getExpenseDetails(id);
    if(!expense){
        res.status(404).json({success: false, message: "Invalid expense_id!"});
        return;
    }

    if(expenseData.country){
        expenseData.country = expenseData.country.toUpperCase();
        var country = yield Country.getCountryByName(expenseData.country);
        if(!country){
            res.status(404).json({success: false, message: "Invalid country!"});
            return;
        }
    }

    if(expenseData.name){
      expenseData.country = expenseData.country || expense.country;
      expenseData.category = expenseData.category || expense.category;
      var expense1 = yield Expense.checkNameCountryActive(expenseData,id);
      if(expense1){
        res.status(403).json({success: false, message: "(country, name, active) duplicate"});
        return;
      }
    }

    var additionalFields = {};
    if(expenseData.additional_fields && expenseData.additional_fields.length>0){
      var arr = JSON.parse(expenseData.additional_fields);
      for(var i=0;i<arr.length;i++){
        additionalFields[arr[i].content]=null;
      }
    }

    expenseData.additional_fields = JSON.stringify(additionalFields);
    if(Object.keys(additionalFields).length == 0){
      expenseData.additional_fields = null;
    }
    
    Expense.updateExpense(id, expenseData, req.admin).then(result => {
      logger.info('Expense updated');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("expenseController: updateExpense - ERROR: Expense.updateExpense: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: updateExpense - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

expenseController.prototype.filterExpenses = bluebird.coroutine(function *(req, res) {
  try {
    var queryParams = {}
    queryParams.active = req.query.active;
    queryParams.category = req.query.category;

    var tasks = [];
    tasks.push(Expense.filterExpenses1(queryParams))
    tasks.push(Expense.countFilterExpenses(queryParams))

    var results = yield bluebird.all(tasks)
    res.status(200).json({success: true, expenses: results[0], expensesCount: results[1]});
  } catch (err) {
    logger.error("expenseController: filterExpenses - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})

expenseController.prototype.deleteExpense = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var expense = yield Expense.getExpenseDetails(id);
    if(!expense){
        res.status(404).json({success: false, message: "Invalid expense_id!"});
        return;
    }

    Expense.updateExpense(id, {active: 0}, req.admin).then(result => {
      logger.info('Expense updated');
      res.status(200).json({success: true});
    }).catch(err => {
      logger.error("expenseController: deleteExpense - ERROR: Expense.updateExpense: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });

  } catch (err) {
    logger.error("expenseController: deleteExpense - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
})


expenseController.prototype.getAdditionalFields = bluebird.coroutine(function *(req, res) {
  try {
    var { id } = req.params;

    var expense = yield Expense.getExpenseDetails(id);
    if(!expense){
      res.status(404).json({success: false , message:"Invalid expense_id"});
      return;
    }

    Expense.getAdditionalFields(id).then(result => { 
      res.status(200).json({success: true, additional_fields: result});  
    }).catch(err => {
      logger.error("expenseController: getAdditionalFields - ERROR: Expense.getAdditionalFields: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("expenseController: getAdditionalFields - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});


expenseController.prototype.insertExpenseData = bluebird.coroutine(function *(req, res) {
  try {
    var expenseDataExtended = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.expenseExtendedSchema1);
    var valid = validate(expenseDataExtended);
    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    var expense = yield Expense.getExpenseDetails(expenseDataExtended.expense_id);
    if(!expense){
      res.status(404).json({success: false, message: "Invalid expense_id!"});
      return;
    }

    var additionalFields={};
    try{
      additionalFields = JSON.parse(expense.additional_fields);
    } catch(ex) {
      additionalFields = {};
    }

    for(var k in expenseDataExtended.additional_fields){
      if (!(k in additionalFields)){
        res.status(403).json({success: false, message: "Invalid additional_field: " + k});
        return;
      }
    }

    Expense.insertExpenseData(expenseDataExtended).then(result => {
      res.status(200).json({success: true, id: result}); 
    }).catch(err => {
      logger.error("expenseController: insertExpenseData - ERROR: Expense.insertExpenseData: "+err.message)
      res.status(500).json({success: false, message: err.message});
    })
    return;
    

  } catch (err) {
    logger.error("expenseController: insertExpenseData - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

expenseController.prototype.editExpenseData = bluebird.coroutine(function *(req, res) {
  try {
    var expenseDataExtended = req.body;

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.expenseExtendedSchema1);
    var valid = validate(expenseDataExtended);
    // if (!valid) {
    //     res.status(400).json({success: false, message: validate.errors});
    //     return;
    // }
    var expense = yield Expense.getExpenseDetails(expenseDataExtended.expense_id);
    if(!expense){
      res.status(404).json({success: false, message: "Invalid expense_id!"});
      return;
    }

    var additionalFields={};
    try{
      additionalFields = JSON.parse(expense.additional_fields);
    } catch(ex) {
      additionalFields = {};
    }

    for(var k in expenseDataExtended.additional_fields){
      if (!(k in additionalFields)){
        res.status(403).json({success: false, message: "Invalid additional_field: " + k});
        return;
      }
    }

    Expense.updateExpenseData(expenseDataExtended).then(result => {
      res.status(200).json({success: true, id: expenseDataExtended.expense_id}); 
    }).catch(err => {
      logger.error("expenseController: insertExpenseData - ERROR: Expense.updateExpenseData: "+err.message)
      res.status(500).json({success: false, message: err.message});
    })
    return;
    

  } catch (err) {
    logger.error("expenseController: insertExpenseData - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
});

expenseController.prototype.insertExpenseData1 = bluebird.coroutine(function *(expense_name, date, value, id) {
  try {

    var expense = yield Expense.getExpenseDetailsByName(expense_name);
    if(!expense){
      return {success: false, message: "Invalid expense_name!"};
    }
    let expenseDataExtended = {
      expense_id: expense.id,
      date_added: date,
      expense_value: value,
      additional_data: {st_odpisa: id}
    }
    var expense_extension = yield Expense.checkDate(expenseDataExtended, expense.billing_period);
    var expense_data_id = expense_extension && expense_extension.id;

    var additionalFields={};
    try{
      additionalFields = JSON.parse(expense.additional_fields);
    } catch(ex) {
      additionalFields = {};
    }

    for(var k in expenseDataExtended.additional_fields){
      if (!(k in additionalFields)){
        return {success: false, message: "Invalid additional_field: " + k};
      }
    }

    if(!expense_extension) {
      Expense.insertExpenseData(expenseDataExtended).then(result => {
        return {success: true}
      }).catch(err => {
        logger.error("expenseController: insertExpenseData - ERROR: Expense.insertExpenseData: "+err.message)
        return {success: false, message: err.message}
      })
      return;
    } else if(expense_extension && expense_data_id) {
      Expense.updateExpenseData(expense_data_id, expenseDataExtended).then(result => {
        return {success: true}
      }).catch(err => {
        logger.error("expenseController: insertExpenseData - ERROR: Expense.updateExpenseData: "+err.message)
        return {success: false, message: err.message}
      })
      return;
    } else if(expense_data_id == false) {
      return {success: false, message: err.message};
    }

  } catch (err) {
    logger.error("expenseController: insertExpenseData - ERROR: try-catch: "+err.message)
    
    return {success: false, message: err.message};
  }
});

expenseController.prototype.deleteExpenseData = (req, res) => {
  try {
    var { id } = req.params;

    Expense.deleteExpenseData(id).then(result => {
      if(result!=0) { 
        logger.info('Expense data deleted');
        res.status(200).json({success: true}); 
      } else {
        res.status(404).json({success: false , message:"Invalid expense_data_id"});
      }
    }).catch(err => {
      logger.error("expenseController: deleteExpenseData - ERROR: Expense.deleteExpenseData: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    })

  } catch (err) {
    logger.error("expenseController: deleteExpenseData - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


expenseController.prototype.getExpensesReport = (req, res) => {
  try {
    var reportData = req.query;
    //type, countries, orderStatuses, inputDate, 

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.expenseReportSchema);
    var valid = validate(reportData);
    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    Statistics.getUtmFilters(reportData).then((result1)=>{
      if(reportData.type=="day"){
        Expense.getExpensesReportDay(reportData).then(result => {
          res.status(200).json({success: true, data: result, utm_filters: result1}); 
        }).catch(err => {
          console.log(err)
          logger.error("expenseController: getExpensesReport - ERROR: Expense.getExpensesReportDay: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      } else {
        Expense.getExpensesReportMonth(reportData).then(result => {
          res.status(200).json({success: true, data: result, utm_filters: result1}); 
        }).catch(err => {
          logger.error("expenseController: getExpensesReport - ERROR: Expense.getExpensesReportMonth: "+err.message)
          console.log(err)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      }
    }).catch(err => {
      console.log(err)
      logger.error("expenseController: getExpensesReport - ERROR: Statistics.getUtmFilters: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: getExpensesReport - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}


expenseController.prototype.getIncomeReport = (req, res) => {
  try {
    var reportData = req.query;
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.incomeReportSchema);
    var valid = validate(reportData);
    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    Statistics.getUtmFilters(reportData).then((result1)=>{
      if(reportData.type=="day"){
        Expense.getIncomeReportDay(reportData).then(result => {
          res.status(200).json({success: true, data: result, utm_filters: result1}); 
        }).catch(err => {
          console.log(err)
          logger.error("expenseController: getIncomeReport - ERROR: Expense.getIncomeReportDay: "+err.message)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      } else {
        Expense.getIncomeReportMonth(reportData).then(result => {
          res.status(200).json({success: true, data: result, utm_filters: result1}); 
        }).catch(err => {
          logger.error("expenseController: getIncomeReport - ERROR: Expense.getIncomeReportMonth: "+err.message)
          console.log(err)
          res.status(500).json({success: false, message: err.message});
          return;
        });
      }
    }).catch(err => {
      console.log(err)
      logger.error("expenseController: getIncomeReport - ERROR: Statistics.getUtmFilters: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: getIncomeReport - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

expenseController.prototype.getExpensesFilteredReport = (req, res) => {
  try {
    var reportData = req.body;
    //type, countries, orderStatuses, inputDate, 

    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(statisticsValidation.expense_statistics_utm_schema);
    var valid = validate(reportData);
    if (!valid) {
        res.status(400).json({success: false, message: validate.errors});
        return;
    }

    Statistics.utmFiltersReport(reportData).then((result)=>{
      res.status(200).json({success: true, data: result}); 
    }).catch(err => {
      logger.error("expenseController: getExpensesFilteredReport - ERROR: Statistics.utmFiltersReport: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: getExpensesFilteredReport - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

expenseController.prototype.getExpenseHistory = (req, res) => {
  try {
    var expense_id = req.params.id; 

    Expense.getExpenseHistory(expense_id).then((result)=>{
      res.status(200).json({success: true, expense_history: result}); 
    }).catch(err => {
      logger.error("expenseController: getExpenseHistory - ERROR: Expense.getExpenseHistory: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: getExpenseHistory - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

expenseController.prototype.getFullExpenseHistory = (req, res) => {
  try {
    var queryParams = {};
    queryParams.country = req.query.country;

    Expense.getFullExpenseHistory(queryParams).then((result)=>{
      res.status(200).json({success: true, expense_history: result}); 
    }).catch(err => {
      logger.error("expenseController: getFullExpenseHistory - ERROR: Expense.getFullExpenseHistory: "+err.message)
      res.status(500).json({success: false, message: err.message});
      return;
    });
    
  } catch (err) {
    logger.error("expenseController: getFullExpenseHistory - ERROR: try-catch: "+err.message)
    res.status(500).json({success: false, message: err.message});
    return;
  }
}

module.exports = new expenseController();