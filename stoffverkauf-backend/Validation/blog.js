// validators/blogValidator.ts
const Joi = require( "joi");

exports.createBlogSchema = Joi.object({
  title: Joi.string().required(),
  status: Joi.string().valid("published", "draft").required(),
  date: Joi.date().required(),
  excerpt: Joi.string().required(),
  content: Joi.string().required(),
  image: Joi.any(), // optional file
});