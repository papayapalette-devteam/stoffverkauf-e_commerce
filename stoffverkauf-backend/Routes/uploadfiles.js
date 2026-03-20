const express = require("express");
const { uploadToCloudinary } = require("../controllers/upload-files/upload");
const router = express.Router();
const upload=require('../middlewares/file')




router.post("/upload-files",upload.any("files"),  uploadToCloudinary);





module.exports = router;
