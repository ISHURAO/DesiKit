import { Router } from "express";
import {
    getAdminStats,
    getUsersList,
    updateUserStatus,
    getPendingVerifications,
    verifyPartner
} from "../controllers/admin.controller.js";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";

const adminRouter = Router();

adminRouter.get("/stats", auth, admin, getAdminStats);
adminRouter.get("/users", auth, admin, getUsersList);
adminRouter.put("/user/status", auth, admin, updateUserStatus);
adminRouter.get("/pending-verifications", auth, admin, getPendingVerifications);
adminRouter.put("/verify-partner", auth, admin, verifyPartner);

export default adminRouter;
