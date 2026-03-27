// controllers/authController.js
const User = require("../../Modals/RegisterUser/register_user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userValidationSchema } = require('../../Validation/users');

const signup = async (req, res) => {
  try {

        // Remove fields not allowed in Joi schema
        const { _id, createdAt, updatedAt, __v, ...payload } = req.body;
    
        const { error, value } = userValidationSchema.validate(payload, {
          abortEarly: false,
        });
    
        if (error) {
          return res.status(400).json({
            success: false,
            errors: error.details.map((err) => err.message),
          });
        }
    

    const { firstName, lastName, email, password, agreed } = value;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, error: "email_exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      agreed,
    });

    await newUser.save();

    return res.json({
      success: true,
      message: "Account created successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: "invalid_credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "invalid_credentials" });
    }

    // Create JWT token
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Remove password before sending response
    const { password: pwd, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      token, // <-- Send token to frontend
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT middleware




    // Validate input (reuse your Joi schema)
    // const { error, value } = userValidationSchema.validate(req.body, {
    //   abortEarly: false,
    //   presence: "optional", // ✅ allow partial updates
    // });

    // if (error) {
    //   return res.status(400).json({
    //     success: false,
    //     errors: error.details.map((err) => err.message),
    //   });
    // }

    // If email is being updated → check duplicate
    // if (req.body.email) {
    //   const existingUser = await User.findOne({ email: req.body.email });
    //   if (existingUser && existingUser._id.toString() !== userId) {
    //     return res.status(400).json({
    //       success: false,
    //       error: "email_exists",
    //     });
    //   }
    // }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password")

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'customer' };
    const totalCustomers = await User.countDocuments(query);
    const customers = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      customers,
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      page
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
};

module.exports = { signup, login, updateUser, getAllCustomers };