const express = require("express");
const { Subscribers } = require("../Controllers/Subscribers/subscribers");


const router = express.Router();



// Create + Update (same API)
router.post("/add-subscribers", Subscribers);





module.exports = router;