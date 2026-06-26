import { Router } from "express";
import { createTicket, addMessageToTicket, getMyTickets, getAllTickets, resolveTicket } from "../controllers/support.controller.js";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";

const supportRouter = Router();

supportRouter.post("/ticket/create", auth, createTicket);
supportRouter.post("/ticket/message", auth, addMessageToTicket);
supportRouter.get("/tickets/my", auth, getMyTickets);
supportRouter.get("/tickets/all", auth, admin, getAllTickets);
supportRouter.put("/ticket/resolve", auth, admin, resolveTicket);

export default supportRouter;
