import { Router } from "express";
import { addToWishlist, removeFromWishlist, getWishlist } from "../controllers/wishlist.controller.js";
import auth from "../middleware/auth.js";

const wishlistRouter = Router();

wishlistRouter.post("/add", auth, addToWishlist);
wishlistRouter.post("/remove", auth, removeFromWishlist);
wishlistRouter.get("/get", auth, getWishlist);

export default wishlistRouter;
