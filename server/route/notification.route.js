import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";
import auth from "../middleware/auth.js";

const notificationRouter = Router();

notificationRouter.get("/list", auth, getNotifications);
notificationRouter.put("/read", auth, markAsRead);

export default notificationRouter;
