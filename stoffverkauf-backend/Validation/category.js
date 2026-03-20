const Joi = require("joi");

const categoryValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional().allow(""),

  description: Joi.string().allow("").max(500),
   enabled: Joi.boolean().optional().default(true),
});

module.exports = { categoryValidationSchema };