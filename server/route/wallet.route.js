import { Router } from "express";
import { addMoneyToWallet, getWalletTransactions } from "../controllers/wallet.controller.js";
import auth from "../middleware/auth.js";

const walletRouter = Router();

walletRouter.post("/add-money", auth, addMoneyToWallet);
walletRouter.get("/transactions", auth, getWalletTransactions);

export default walletRouter;
