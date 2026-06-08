
const Product =require('../../Modals/AddProducts/add_products.js');
const { productValidationSchema } = require('../../Validation/product.js');
const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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
    const categories = req.query.categories ? req.query.categories.split(",") : [];
    const badges = req.query.badges ? req.query.badges.split(",") : [];
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const inStock = req.query.inStock === "true";
    const sortBy = req.query.sortBy || "relevance";

    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    if (categories.length > 0) {
      filter.category = { $in: categories };
    }

    if (badges.length > 0) {
      filter.badge = { $in: badges };
    }

    if (inStock) {
      filter.inStock = { $ne: false };
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.$expr = {
        $and: []
      };
      // If salePrice exists and > 0, use it, else use price
      const effectivePrice = {
        $cond: {
          if: { $and: [{ $gt: ["$salePrice", 0] }, { $ne: ["$salePrice", null] }] },
          then: "$salePrice",
          else: "$price"
        }
      };

      if (!isNaN(minPrice)) {
        filter.$expr.$and.push({ $gte: [effectivePrice, minPrice] });
      }
      if (!isNaN(maxPrice)) {
        filter.$expr.$and.push({ $lte: [effectivePrice, maxPrice] });
      }
      if (filter.$expr.$and.length === 0) {
        delete filter.$expr;
      }
    }

    console.log("Applying filter in getProducts:", JSON.stringify(filter, null, 2));
    console.log("Query params:", req.query);

    let sortObj = { images: -1, createdAt: -1 };
    switch (sortBy) {
      case "price-asc":
        sortObj = { salePrice: 1, price: 1 };
        break;
      case "price-desc":
        sortObj = { salePrice: -1, price: -1 };
        break;
      case "rating":
        sortObj = { rating: -1 };
        break;
      case "reviews":
        sortObj = { reviews: -1 };
        break;
      case "relevance":
      default:
        sortObj = { images: -1, createdAt: -1 };
        break;
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortObj)
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
      .sort({
    images: -1,       
    createdAt: -1,   
  })

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
      .sort({
    images: -1,       
    createdAt: -1,   
  })

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

    console.log(products);
    

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid products data" });
    }

    // Optional: map and validate products before insert
    const formattedProducts = products.map((p) => ({
      name: p.name,
      sku: p.sku || "",
      price: p.price,
      salePrice: p.salePrice || 0,
      category: p.category,
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

exports.bulkAssignImagesBySKU = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const fileArray = Array.isArray(files) ? files : [files];
    const results = [];

    for (const file of fileArray) {
      try {
        const originalName = path.parse(file.originalname).name.trim();
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          public_id: originalName,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        });

        // Try to find product by exact SKU or numeric part
        let sku = originalName;
        let product = await Product.findOne({ sku: { $regex: new RegExp(`^${sku}$`, "i") } });

        if (!product) {
          const numericPart = sku.match(/\d+/)?.[0];
          if (numericPart) {
            sku = numericPart;
            product = await Product.findOne({ sku: sku });
          }
        }
        
        if (product) {
          if (!product.images.includes(uploadResult.secure_url)) {
            product.images.push(uploadResult.secure_url);
            await product.save();
          }
          results.push({ sku, status: "assigned", url: uploadResult.secure_url });
        } else {
          results.push({ sku, status: "product_not_found", url: uploadResult.secure_url, message: `No product found with SKU: ${sku}` });
        }

      } catch (err) {
        console.error(`Error processing file ${file.originalname}:`, err);
        results.push({ filename: file.originalname, status: "error", message: err.message });
      } finally {
        // Remove temp file
        try {
          await fs.unlink(file.path);
        } catch (unlinkErr) {
          console.error("Error deleting temp file:", unlinkErr);
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Bulk image processing complete",
      results 
    });
  } catch (error) {
    console.error("Bulk assign main error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncImagesFromCloudinary = async (req, res) => {
  try {
    const results = [];
    let next_cursor = null;

    // Use a simpler search or resource listing
    // Note: Admin API (cloudinary.api.resources) has stricter rate limits than Search API
    const response = await cloudinary.search
      .expression('resource_type:image')
      .max_results(500)
      .execute();

    for (const resource of response.resources) {
      // public_id like "products/P1130366_emxw9q"
      const publicId = resource.public_id.split('/').pop().trim();
      const url = resource.secure_url;

      if (!publicId) continue;

      // Try exact match then numeric match
      let sku = publicId;
      let product = await Product.findOne({ sku: { $regex: new RegExp(`^${sku}$`, "i") } });

      if (!product) {
        const numericPart = sku.match(/\d+/)?.[0];
        if (numericPart) {
          sku = numericPart;
          product = await Product.findOne({ sku: sku });
        }
      }
      
      if (product) {
        if (!product.images.includes(url)) {
          product.images.push(url);
          await product.save();
          results.push({ sku, status: "assigned", url });
        } else {
          results.push({ sku, status: "already_exists", url });
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Sync complete. ${results.filter(r => r.status === "assigned").length} new images assigned.`,
      count: results.length,
      results 
    });
  } catch (error) {
    console.error("Cloudinary sync error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

