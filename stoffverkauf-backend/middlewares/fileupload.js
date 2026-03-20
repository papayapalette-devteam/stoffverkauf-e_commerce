// const multer = require('multer');
// //const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now();
//     const fileExtension = file.originalname.split('.').pop(); // includes the dot (e.g. ".jpg")
//     cb(null, file.fieldname + '-' +uniqueSuffix+'.'+fileExtension);
//   }
// });

// const upload = multer({ storage: storage,limits:{fileSize:1024*1024*5} });

// module.exports = upload;
const multer= require('multer');

const storage=multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
})
const upload= multer({storage:storage});

module.exports=upload;