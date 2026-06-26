import WalletModel from "../models/wallet.model.js";
import UserModel from "../models/user.model.js";

export const addMoneyToWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const { amount } = req.body;

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                message: "Provide a valid positive amount",
                error: true,
                success: false
            });
        }

        let wallet = await WalletModel.findOne({ userId });
        if (!wallet) {
            wallet = new WalletModel({ userId, balance: 0, transactions: [] });
        }

        wallet.balance += parsedAmount;
        wallet.transactions.push({
            amount: parsedAmount,
            type: 'credit',
            description: 'Loaded Cash into Wallet'
        });
        await wallet.save();

        // Sync with User model
        await UserModel.findByIdAndUpdate(userId, { wallet_balance: wallet.balance });

        return res.json({
            message: `Successfully added ₹${parsedAmount} to wallet`,
            error: false,
            success: true,
            balance: wallet.balance,
            transactions: wallet.transactions
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getWalletTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        let wallet = await WalletModel.findOne({ userId });

        if (!wallet) {
            wallet = new WalletModel({ userId, balance: 0, transactions: [] });
            await wallet.save();
        }

        return res.json({
            message: "Wallet details retrieved",
            error: false,
            success: true,
            balance: wallet.balance,
            transactions: wallet.transactions
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
