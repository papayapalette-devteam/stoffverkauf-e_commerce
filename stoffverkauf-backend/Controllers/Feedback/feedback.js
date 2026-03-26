const Feedback = require('../../Modals/Feedback/feedback');
const Product = require('../../Modals/AddProducts/add_products');

// Create Feedback
exports.createFeedback = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const user = req.user; // from authMiddleware

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please login to leave a review." });
    }

    const feedback = new Feedback({
      product: productId,
      user: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      rating,
      comment,
      status: 'pending' // Default status
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. It will be visible after admin approval.",
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Feedbacks for a specific product (Only Approved)
exports.getProductFeedbacks = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalFeedbacks = await Feedback.countDocuments({ product: productId, status: 'approved' });
    const feedbacks = await Feedback.find({ product: productId, status: 'approved' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      feedbacks,
      totalFeedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get All Feedbacks with Pagination & Filter
exports.getAllFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // optional filter
    const skip = (page - 1) * limit;

    const filter = status ? { status } : {};

    const totalFeedbacks = await Feedback.countDocuments(filter);
    const feedbacks = await Feedback.find(filter)
      .populate('product', 'name')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      feedbacks,
      totalFeedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update Status (Approve/Reject)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const feedback = await Feedback.findByIdAndUpdate(id, { status }, { new: true });

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    // If approved, optionally update product rating
    if (status === 'approved') {
        const productFeedbacks = await Feedback.find({ product: feedback.product, status: 'approved' });
        const avgRating = productFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / productFeedbacks.length;
        
        await Product.findByIdAndUpdate(feedback.product, {
            rating: avgRating.toFixed(1),
            reviews: productFeedbacks.length
        });
    }

    res.status(200).json({
      success: true,
      message: `Feedback ${status} successfully`,
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Delete Feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
