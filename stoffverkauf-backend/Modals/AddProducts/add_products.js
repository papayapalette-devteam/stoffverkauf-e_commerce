const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    color: String,
    pattern: String,
    size: String,
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },

    price: {
      type: Number,
      // required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
    },

    category: {
      type: String,
      required: true,
    },

    badge: {
      type: String,
      default: "",
    },

    width: String,

    composition: String,

    description: String,

    stockQty: {
      type: Number,
      default: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    images: [String],

    variants: [VariantSchema],

    // SEO fields directly
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,

    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports= mongoose.model("Product", ProductSchema);