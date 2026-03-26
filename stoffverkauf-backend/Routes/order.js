const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/Order/order');
const paypalController = require('../Controllers/Order/paypalController');
const invoiceController = require('../Controllers/Order/invoice');
const packingSlipController = require('../Controllers/Order/packingSlip');
const returnController = require('../Controllers/Return/return');

const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// ==========================================
// ADMIN ROUTES (Must come BEFORE :id routes)
// ==========================================
router.get('/admin/returns', authMiddleware, adminMiddleware, returnController.getAllReturns);
router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.post('/admin/refund', authMiddleware, adminMiddleware, returnController.processRefund);
router.post('/admin/resend-confirmation', authMiddleware, adminMiddleware, orderController.resendConfirmationEmail);
router.patch('/admin/:id/view', authMiddleware, adminMiddleware, orderController.markAsViewed);
router.patch('/admin/:id', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// ==========================================
// PUBLIC / USER ROUTES
// ==========================================
router.post('/', orderController.createOrder); // Guest checkout supported
router.get('/my/:userId', authMiddleware, orderController.getMyOrders);
router.get('/:id/invoice', invoiceController.generateInvoice);
router.get('/:id/packingslip', packingSlipController.generatePackingSlip);

// PayPal Integration
router.post('/paypal/create', paypalController.createPaypalOrder);
router.post('/paypal/capture', paypalController.capturePaypalOrder);

module.exports = router;
