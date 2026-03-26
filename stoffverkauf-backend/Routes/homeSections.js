const express = require('express');
const router = express.Router();
const HomeSectionsController = require('../Controllers/HomeSectionsController');

router.get('/', HomeSectionsController.getHomeSections);
router.put('/:id', HomeSectionsController.updateHomeSection);
router.post('/upsert', HomeSectionsController.upsertHomeSections);

module.exports = router;
