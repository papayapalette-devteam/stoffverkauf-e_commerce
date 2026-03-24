const express = require("express");
const { signup, login, updateUser } = require("../Controllers/RegisterUsers/register_user");

const router = express.Router();

const { authMiddleware } = require("../middlewares/auth");




// Create + Update (same API)
router.post("/register-user", signup);

router.post("/login", login);

router.put("/update-user",authMiddleware, updateUser);



module.exports = router;