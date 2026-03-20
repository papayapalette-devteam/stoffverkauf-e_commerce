const express = require("express");
const { saveCategory, getCategories, getCategoryById, deleteCategory, toggleEnable } = require("../Controllers/Category/category");
const router = express.Router();




// Create + Update (same API)
router.post("/save-category", saveCategory);


// Get all categories (pagination + filter)
router.get("/get-categories", getCategories);


// Get single category
router.get("/get-category-byid/:id", getCategoryById);

// Delete category
router.delete("/delete-category/:id", deleteCategory);

// toggle category
router.patch("/toggle-category/:id", toggleEnable);


module.exports = router;