import { Router } from "express";
import {
    getDeliveryStats,
    submitDeliveryVerification,
    getAssignedOrders,
    updateDeliveryOrderStatus,
    updateDeliveryLocation,
    acceptDeliveryOrder
} from "../controllers/delivery.controller.js";
import auth from "../middleware/auth.js";

const deliveryRouter = Router();

deliveryRouter.get("/stats", auth, getDeliveryStats);
deliveryRouter.put("/verify", auth, submitDeliveryVerification);
deliveryRouter.get("/orders", auth, getAssignedOrders);
deliveryRouter.put("/order/accept", auth, acceptDeliveryOrder);
deliveryRouter.put("/order/status", auth, updateDeliveryOrderStatus);
deliveryRouter.put("/location", auth, updateDeliveryLocation);

export default deliveryRouter;
