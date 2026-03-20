const multer = require("multer");

const storage = multer.memoryStorage(); // store in memory
const uploadExcel = multer({ storage });

module.exports = uploadExcel;
