import { Router } from "express";
import { addBanner, getBanners, deleteBanner } from "../controllers/banner.controller.js";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";

const bannerRouter = Router();

bannerRouter.post("/add", auth, admin, addBanner);
bannerRouter.get("/list", getBanners);
bannerRouter.delete("/delete/:bannerId", auth, admin, deleteBanner);

export default bannerRouter;
