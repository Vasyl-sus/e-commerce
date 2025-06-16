const express = require('express');
const router = express.Router();
const authController = require('./login');

/**
 * Routes
 */
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
/*
router.post('/forgot_password', authController.forgotPassword);
router.post('/reset_password', authController.resetPassword);
*/
module.exports = router;