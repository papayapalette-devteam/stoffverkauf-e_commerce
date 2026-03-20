const express = require("express");

const router = express.Router();
const upload=require('../middlewares/file');
const { uploadToCloudinary } = require("../Controllers/upload-files/upload");




router.post("/upload-files",upload.any("files"), uploadToCloudinary);





module.exports = router;
