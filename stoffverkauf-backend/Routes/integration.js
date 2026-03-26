const express = require('express');
const router = express.Router();
const integrationController = require('../Controllers/Integration/integration');

const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Get Single (Public for frontend payment config)
router.get('/:key', integrationController.getIntegration);

// All other Integration routes should be Admin only 
router.use(authMiddleware, adminMiddleware);

// Save/Update
router.post('/save', integrationController.saveIntegration);

// Get All
router.get('/', integrationController.getAllIntegrations);

// Delete
router.delete('/:key', integrationController.deleteIntegration);

module.exports = router;
