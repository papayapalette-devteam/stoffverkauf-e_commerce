const express=require('express')

const { createBlog, getBlogs, deleteBlog, updateBlog } = require("../Controllers/Blog/blog");


const router = express.Router();






// Create + Update (same API)
router.post("/add-blog", createBlog);

router.get("/get-blogs", getBlogs);

router.put("/update-blog/:id", updateBlog);

router.delete("/delete-blog/:id", deleteBlog);



module.exports = router;