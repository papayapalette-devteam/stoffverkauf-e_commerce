const  Joi = require("joi");

const variantSchema = Joi.object({
  color: Joi.string().allow("").trim(),

  pattern: Joi.string().allow("").trim(),

  size: Joi.string().allow("").trim(),

  stock: Joi.number().min(0).required(),
});

exports.productValidationSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),

  price: Joi.number().min(0).required(),

  salePrice: Joi.number().min(0).allow(null, ""),

  category: Joi.string().required(),

  badge: Joi.string()
    .valid("Bestseller", "Premium", "Neu", "Angebot", "")
    .allow(""),

  width: Joi.string().allow(""),

  composition: Joi.string().allow(""),

  description: Joi.string().allow(""),

  stockQty: Joi.number().min(0),

  inStock: Joi.boolean(),

  images: Joi.array().items(Joi.string().allow()),

  variants: Joi.array().items(variantSchema),

  seoTitle: Joi.string().max(60).allow(""),

  seoDescription: Joi.string().max(160).allow(""),

  seoKeywords: Joi.string().allow(""),

  rating: Joi.number().allow(""),

  reviews: Joi.number().allow(""),
});