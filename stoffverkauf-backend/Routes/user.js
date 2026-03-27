const express = require("express");
const { signup, login, updateUser, getAllCustomers, getAllAdmins, createAdmin, deleteAdmin } = require("../Controllers/RegisterUsers/register_user");

const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Create + Update (same API)
router.post("/register-user", signup);

router.post("/login", login);

router.put("/update-user",authMiddleware, updateUser);

router.get("/get-all-customers", authMiddleware, adminMiddleware, getAllCustomers);

// Admin Management
router.get("/admins", authMiddleware, adminMiddleware, getAllAdmins);
router.post("/admins", authMiddleware, adminMiddleware, createAdmin);
router.delete("/admins/:id", authMiddleware, adminMiddleware, deleteAdmin);

module.exports = router;