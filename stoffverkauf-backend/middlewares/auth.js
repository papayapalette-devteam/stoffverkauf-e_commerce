const jwt = require("jsonwebtoken");
const User = require("../Modals/RegisterUser/register_user");

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ success: false, error: "unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: "unauthorized" });
  }
};