var express = require('express');
var router = express.Router();
var expenseController = require('./expenseController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

router.use(admingroupValidationMiddleware.validate);

router.get('/', expenseController.filterExpenses); 
router.post('/', expenseController.addNewExpense);
router.post('/add/', expenseController.insertExpenseData);
router.put('/edit/', expenseController.editExpenseData);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.get('/fields/:id', expenseController.getAdditionalFields);
router.delete('/remove/:id', expenseController.deleteExpenseData);
router.get('/report', expenseController.getExpensesReport);
router.get('/reportincome', expenseController.getIncomeReport);
router.post('/report1', expenseController.getExpensesFilteredReport);
router.get('/history', expenseController.getFullExpenseHistory);
router.get('/history/:id', expenseController.getExpenseHistory);

module.exports = router;