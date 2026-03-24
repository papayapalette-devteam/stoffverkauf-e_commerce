const Wishlist =require("../../Modals/Wishlist/wishlist.js");


// Get all wishlist items for logged-in user
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate("product");
    return res.status(200).json({ success: true, wishlist: wishlist.map(item => item.product) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: "product_id_required" });

    // Check if already in wishlist
    const exists = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (exists) return res.status(400).json({ success: false, error: "already_in_wishlist" });

    const wishlistItem = new Wishlist({ user: req.user._id, product: productId });
    await wishlistItem.save();

    return res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: "product_id_required" });

    await Wishlist.findOneAndDelete({ user: req.user._id, product: productId });

    return res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
};