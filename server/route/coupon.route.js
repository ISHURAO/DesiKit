import { Router } from "express";
import { createCoupon, getCoupons, applyCoupon } from "../controllers/coupon.controller.js";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";

const couponRouter = Router();

couponRouter.post("/create", auth, admin, createCoupon);
couponRouter.get("/list", getCoupons);
couponRouter.post("/apply", auth, applyCoupon);

export default couponRouter;
