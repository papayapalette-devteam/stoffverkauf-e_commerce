
const express = require ('express')
const { authMiddleware } = require("../middlewares/auth");


const { addToWishlist, getWishlist, removeFromWishlist } =require( "../Controllers/Wishlist/wishlist.js");


const router = express.Router();

router.use(authMiddleware); // Protect all wishlist routes

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);

module.exports= router;