var express = require('express');
var router = express.Router();
var statisticsController = require('./statisticsController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
// var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);
//router.use(admingroupValidationMiddleware.validate);

router.post('/addExpenses/', statisticsController.addExpense);
router.post('/addVisits/', statisticsController.addVisit);

router.post('/ordersIncomeStatistics', statisticsController.ordersIncomeStatistics);
router.post('/ordersCountStatistics', statisticsController.ordersCountStatistics);
router.post('/productsCountStatistics', statisticsController.productsCountStatistics);
router.post('/utmStatistics', statisticsController.utmStatistics);
router.post('/discountsUsageStatistics', statisticsController.discountsUsageStatistics);
router.get('/ordersVisitorsRateStatistics', statisticsController.ordersVisitorsRateStatistics);
router.get('/ordersUpsaleStatistics', statisticsController.ordersUpsaleStatistics);
router.get('/vccStatistics', statisticsController.vccStatistics);

router.get('/agentStatistics', statisticsController.agentStatistics);
router.get('/filterAgentOrders', statisticsController.filterAgentOrders);

router.get('/callCenterCountStatistics', statisticsController.callCenterCountStatistics);
router.get('/callCenterProductsStatistics', statisticsController.callCenterProductsStatistics);
router.get('/callCenterIncomeStatistics', statisticsController.callCenterIncomeStatistics);

module.exports = router;