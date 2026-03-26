const express = require("express");
const { signup, login, updateUser, getAllCustomers } = require("../Controllers/RegisterUsers/register_user");

const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Create + Update (same API)
router.post("/register-user", signup);

router.post("/login", login);

router.put("/update-user",authMiddleware, updateUser);

router.get("/get-all-customers", authMiddleware, adminMiddleware, getAllCustomers);



module.exports = router;