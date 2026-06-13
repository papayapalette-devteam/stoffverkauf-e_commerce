const Joi = require("joi");

exports.couponValidationSchema = Joi.object({
  code: Joi.string().uppercase().required().trim(),
  type: Joi.string().valid("percent", "fixed").required(),
  value: Joi.number().min(0).required(),
  minOrder: Joi.number().min(0).allow(null, "").optional().default(0),
  maxUses: Joi.number().min(0).allow(null, "").optional().default(100),
  expires: Joi.string().allow(""),
  active: Joi.boolean().default(true),
  applicableProducts: Joi.array().items(Joi.string()).optional(),
  applicableCategories: Joi.array().items(Joi.string()).optional(),
});
