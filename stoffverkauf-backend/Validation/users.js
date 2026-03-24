// validations/authValidation.js
const  Joi = require("joi");

exports.userValidationSchema = Joi.object({
  firstName: Joi.string().trim().min(2).required(),

  lastName: Joi.string().trim().min(2).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  agreed: Joi.boolean().valid(true).required(),

  phone: Joi.number().valid(true).optional().allow(""),

  address: Joi.string().valid(true).optional().allow("")
});