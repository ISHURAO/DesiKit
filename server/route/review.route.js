import { Router } from "express";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import auth from "../middleware/auth.js";

const reviewRouter = Router();

reviewRouter.post("/add", auth, addReview);
reviewRouter.get("/product/:productId", getProductReviews);

export default reviewRouter;
