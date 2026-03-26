const express = require('express');
const router = express.Router();
const feedbackController = require('../Controllers/Feedback/feedback');

const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Public: Get product feedbacks (only approved)
router.get('/product/:productId', feedbackController.getProductFeedbacks);

// User: Post a feedback
router.post('/', authMiddleware, feedbackController.createFeedback);

// Admin: Get all feedbacks with pagination/filter
router.get('/admin/all', authMiddleware, adminMiddleware, feedbackController.getAllFeedbacks);

// Admin: Approve/Reject feedback
router.patch('/admin/status/:id', authMiddleware, adminMiddleware, feedbackController.updateFeedbackStatus);

// Admin: Delete feedback
router.delete('/admin/:id', authMiddleware, adminMiddleware, feedbackController.deleteFeedback);

module.exports = router;
