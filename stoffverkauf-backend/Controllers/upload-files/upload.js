// const cloudinary = require("cloudinary").v2;
// const fs = require("fs/promises");
// const path = require("path");


// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// const uploadToCloudinary = async (req, res) => {
//   try {
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No files uploaded",
//       });
//     }

//     const fileArray = Array.isArray(files) ? files : [files];

//     const uploadPromises = fileArray.map((file) => {
//       // original filename without extension
//       const originalName = path.parse(file.originalname).name;

//       return cloudinary.uploader.upload(file.path, {
//         folder: "uploads",
//         resource_type: "auto",

//         // 👇 IMPORTANT OPTIONS
//         public_id: originalName,      // same name as local
//         use_filename: true,
//         unique_filename: false,       // stop random string
//         overwrite: false,             // prevent overwrite
//       });
//     });

//     const results = await Promise.all(uploadPromises);

//     // delete temp files
//     await Promise.all(fileArray.map((file) => fs.unlink(file.path)));

//     const urls = results.map((r) => r.secure_url);

//     res.status(200).json({
//       success: true,
//       urls,
//     });
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Upload failed",
//       error: error.message,
//     });
//   }
// };

// module.exports = { uploadToCloudinary };



const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map((file) => {
      const originalName = path.parse(file.originalname).name.replace(/\s/g, "_");
      
      // Detect type based on file mimetype
      let resourceType = "auto"; // default for all
      if (file.mimetype.startsWith("video/")) resourceType = "video";
      else if (file.mimetype.startsWith("image/")) resourceType = "image";
      else if (file.mimetype.startsWith("audio/")) resourceType = "video"; // audio works as video type on Cloudinary
      else resourceType = "raw"; // for PDFs, docs, etc.

      const options = {
        folder: "uploads",
        resource_type: resourceType,
        public_id: originalName,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      // Only force mp4 + h264 if it’s a video
      if (resourceType === "video") {
        options.format = "mp4";
        options.video_codec = "h264";
        options.chunk_size = 6000000;
      }

      return cloudinary.uploader.upload(file.path, options);
    });

    const results = await Promise.all(uploadPromises);

    // Remove temp files
    await Promise.all(fileArray.map((file) => fs.unlink(file.path)));

    const urls = results.map((r) => r.secure_url);
    res.status(200).json({ success: true, urls });

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadToCloudinary };
