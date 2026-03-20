const express = require('express');
const { deleteProduct, getProducts, getSingleProduct, saveProduct, bulkUpload, getProductsByCategory, getProductsByBadge }=require("../Controllers/Products/product");


const router = express.Router();

router.post("/add-product", saveProduct);

router.get("/get-product", getProducts);

router.delete("/delete-product/:id", deleteProduct);

router.get("/get-product-by-id/:id", getSingleProduct);

router.get("/get-product-by-category/:category", getProductsByCategory);

router.get("/get-product-by-badge/:badge", getProductsByBadge);

router.post("/bulk-upload", bulkUpload);

module.exports= router;