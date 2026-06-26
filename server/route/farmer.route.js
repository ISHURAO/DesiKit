import { Router } from "express";
import {
    getFarmerStats,
    submitFarmerVerification,
    getFarmerOrders,
    updateFarmerOrderStatus,
    getAvailableDeliveryPartners,
    assignDeliveryPartner
} from "../controllers/farmer.controller.js";
import auth from "../middleware/auth.js";

const farmerRouter = Router();

farmerRouter.get("/stats", auth, getFarmerStats);
farmerRouter.put("/verify", auth, submitFarmerVerification);
farmerRouter.get("/orders", auth, getFarmerOrders);
farmerRouter.put("/order/status", auth, updateFarmerOrderStatus);
farmerRouter.get("/delivery-partners", auth, getAvailableDeliveryPartners);
farmerRouter.put("/assign-delivery", auth, assignDeliveryPartner);

export default farmerRouter;
