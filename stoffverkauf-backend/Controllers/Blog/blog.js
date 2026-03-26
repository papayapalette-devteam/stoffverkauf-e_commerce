// controllers/blogController.js
const BlogPost = require("../../Modals/Blog/blog");
const { createBlogSchema } = require("../../Validation/blog");


// Create Post
exports.createBlog = async (req, res) => {
  try {
    const { error, value } = createBlogSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });


    const post = new BlogPost(value);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Posts
exports.getBlogs = async (req, res) => {
  try {
    // ✅ Get query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // ✅ Fetch paginated data
    const posts = await BlogPost.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Get total count
    const total = await BlogPost.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Update Post
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const { _id, createdAt, updatedAt, __v, ...payload } = req.body;

    const { error, value } = createBlogSchema.validate(payload);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updateData = { ...value };


    const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete image file if exists
    if (post.imageUrl) {
      const filePath = path.join(__dirname, "../public", post.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};