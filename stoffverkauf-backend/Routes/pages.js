const express = require('express');
const router = express.Router();
const PagesController = require('../Controllers/PagesController');

router.get('/', PagesController.getPages);
router.get('/:id', PagesController.getPageById);
router.put('/:id', PagesController.updatePage);
router.delete('/:id', PagesController.deletePage);

module.exports = router;
