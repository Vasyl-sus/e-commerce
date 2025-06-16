var express = require('express');
var router = express.Router();
var orderController = require('./orderController.js');
var tokenValidationMiddleware = require('../../middleware/tokenValidationMiddleware.js');
var admingroupValidationMiddleware = require('../../middleware/admingroupValidationMiddleware.js');
router.use(tokenValidationMiddleware.validate);

//router.use(admingroupValidationMiddleware.validate);

router.get('/', orderController.filterOrders);
router.get('/details/:id', orderController.getOrderDetails);
router.post('/', orderController.addNewOrder);
router.put('/:id', orderController.updateOrder);
router.put('/:id/history', orderController.updateOrderHistory);
router.put('/reklamacija/:id', orderController.updateOrderReklamacija);
router.delete('/:id', orderController.deleteOrder);

router.put('/comments/:id', orderController.addComment);
router.delete('/comments/:comment_id', orderController.deleteComment);
//router.put('/emails/:id', orderController.addEmail);
//router.delete('/emails/:email_id', orderController.deleteEmail);
//router.put('/therapies/:id', orderController.addTherapy);
//router.delete('/therapies/:therapy_id', orderController.deleteTherapy);

router.post('/status/', orderController.changeStatus);
router.post('/setAgent/', orderController.setOrdersAgent);
router.post('/setColor/', orderController.setOrdersColor);

router.post('/invoice/', orderController.createInvoice);
router.post('/invoiceknjizara/', orderController.createInvoiceKnjizara);
router.post('/proforma/', orderController.createProforma);
router.post('/thankyou/', orderController.createThankYou);
router.post('/excel/', orderController.createExcel);
router.post('/excelgls/', orderController.createExcelGLS);
router.post('/excelzasilkovna/', orderController.createExcelZasilkovna);
router.post('/excelexpedico/', orderController.createExcelExpedico);
router.post('/excelcustomlist/', orderController.createExcelCustomList);
router.post('/excelstornolist/', orderController.createExcelStornoList);
router.post('/exceltaxlist/', orderController.createExcelTaxList);
router.post('/excelposta/', orderController.createExcelPosta);
router.post('/excelpostacroatia/', orderController.createExcelPostaCroatia);
router.post('/storno/:id', orderController.duplicateNegativeOrder);

module.exports = router;
