const express = require('express');
const { deleteProduct, getProducts, getSingleProduct, saveProduct, bulkUpload, getProductsByCategory, getProductsByBadge, getBadges, bulkAssignImagesBySKU, syncImagesFromCloudinary }=require("../Controllers/Products/product");
const upload = require('../middlewares/file');

const router = express.Router();

router.post("/add-product", saveProduct);
router.get("/get-product", getProducts);
router.delete("/delete-product/:id", deleteProduct);
router.get("/get-product-by-id/:id", getSingleProduct);
router.get("/get-product-by-category/:category", getProductsByCategory);
router.get("/get-product-by-badge/:badge", getProductsByBadge);
router.get("/get-badges", getBadges);
router.post("/bulk-upload", bulkUpload);
router.post("/bulk-assign-images", upload.any("files"), bulkAssignImagesBySKU);
router.get("/sync-cloudinary-images", syncImagesFromCloudinary);

module.exports= router;