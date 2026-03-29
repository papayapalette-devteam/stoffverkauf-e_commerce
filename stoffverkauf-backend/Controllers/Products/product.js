
const Product =require('../../Modals/AddProducts/add_products.js');
const { productValidationSchema } = require('../../Validation/product.js');

exports.saveProduct = async (req, res) => {
  try {

    
    // Remove fields not allowed in Joi schema
    const { _id, createdAt, updatedAt, __v, ...payload } = req.body;

    const { error, value } = productValidationSchema.validate(payload, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }

    let product;

    // UPDATE
    if (_id) {
      product = await Product.findByIdAndUpdate(
        _id,
        value,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    }

    // CREATE
    product = new Product(value);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Search filter
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    res.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;     // default to page 1
    const limit = parseInt(req.query.limit) || 10;  // default 10 products per page
    const skip = (page - 1) * limit;

    // Count total products in this category
    const totalProducts = await Product.countDocuments({ category: category });

    // Fetch products for the current page
    const products = await Product.find({ category: category })
      .skip(skip)
      .limit(limit);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByBadge = async (req, res) => {
  try {
    const badge = req.params.badge;
    const page = parseInt(req.query.page) || 1;     // default to page 1
    const limit = parseInt(req.query.limit) || 10;  // default 10 products per page
    const skip = (page - 1) * limit;

    // Count total products in this category
    const totalProducts = await Product.countDocuments({ badge: badge });

    // Fetch products for the current page
    const products = await Product.find({ badge: badge })
      .skip(skip)
      .limit(limit);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      page,
      totalPages,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.bulkUpload = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid products data" });
    }

    // Optional: map and validate products before insert
    const formattedProducts = products.map((p) => ({
      name: p.name || "",
      price: p.price || 0,
      salePrice: p.salePrice || 0,
      category: p.category || "",
      badge: p.badge || "",
      width: p.width || "",
      composition: p.composition || "",
      description: p.description || "",
      stockQty: p.stockQty || 0,
      // inStock: p.inStock === true || p.inStock === 1,
      // images: p.images || [],
      // seoTitle: p.seoTitle || "",
      // seoDescription: p.seoDescription || "",
      // seoKeywords: p.seoKeywords || "",
      // variants: p.variants || [],
      // rating: p.rating || 0,
      // reviews: p.reviews || 0,
    }));

    const insertedProducts = await Product.insertMany(formattedProducts);

    res.json({
      message: "Products imported successfully",
      count: insertedProducts.length,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBadges = async (req, res) => {
  try {
    const badges = await Product.distinct("badge", { badge: { $ne: "" } });
    res.status(200).json({
      success: true,
      badges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

