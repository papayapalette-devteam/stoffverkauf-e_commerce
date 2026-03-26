const express = require("express");
const { saveCoupon, getCoupons, deleteCoupon, toggleEnable } = require("../Controllers/Marketing/coupon");
const router = express.Router();

// Create + Update
router.post("/save-coupon", saveCoupon);

// Get all
router.get("/get-coupons", getCoupons);

// Delete
router.delete("/delete-coupon/:id", deleteCoupon);

// Toggle
router.patch("/toggle-coupon/:id", toggleEnable);

module.exports = router;
