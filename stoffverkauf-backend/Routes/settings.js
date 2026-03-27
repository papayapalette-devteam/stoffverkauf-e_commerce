const express = require("express");
const router = express.Router();
const controller = require("../Controllers/SettingsController");

router.get("/", controller.getSettings);
router.put("/", controller.updateSettings);

module.exports = router;
