import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import WalletModel from '../models/wallet.model.js'
import FarmerModel from '../models/farmer.model.js'
import DeliveryPartnerModel from '../models/deliveryPartner.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'

// Helpers
const generateReferralCode = () => {
    return 'DESI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function registerUserController(request, response) {
    try {
        const { name, email, password, role, referred_by } = request.body

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Provide email, name, password",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (user) {
            return response.json({
                message: "Already registered email",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        // Generate a referral code
        const refCode = generateReferralCode();

        let referrerId = null;
        if (referred_by) {
            const referrer = await UserModel.findOne({ referral_code: referred_by.toUpperCase() });
            if (referrer) {
                referrerId = referrer._id;
            }
        }

        const payload = {
            name,
            email,
            password: hashPassword,
            role: role || 'USER',
            referral_code: refCode,
            referred_by: referrerId
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        // Create Wallet
        const newWallet = new WalletModel({
            userId: save._id,
            balance: referrerId ? 50 : 0, // ₹50 bonus for using referral code
            transactions: referrerId ? [{
                amount: 50,
                type: 'credit',
                description: 'Referral Sign-Up Bonus'
            }] : []
        });
        await newWallet.save();

        // Credit referrer wallet if applicable
        if (referrerId) {
            await UserModel.findByIdAndUpdate(referrerId, { $inc: { wallet_balance: 50 } });
            await WalletModel.findOneAndUpdate(
                { userId: referrerId },
                {
                    $inc: { balance: 50 },
                    $push: {
                        transactions: {
                            amount: 50,
                            type: 'credit',
                            description: `Referral bonus for inviting ${name}`
                        }
                    }
                }
            );
        }

        // Create Sub-profile if Farmer or Delivery Partner
        if (role === 'FARMER') {
            const newFarmer = new FarmerModel({
                user_id: save._id,
                farm_name: request.body.farm_name || `${name}'s Farm`,
                farm_address: request.body.farm_address || 'Provide Farm Address'
            });
            await newFarmer.save();
        } else if (role === 'DELIVERY_PARTNER') {
            const newDelivery = new DeliveryPartnerModel({
                user_id: save._id,
                vehicle_details: request.body.vehicle_details || 'Bicycle',
                vehicle_number: request.body.vehicle_number || 'N/A'
            });
            await newDelivery.save();
        }

        // Email Verification Link
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`
        await sendEmail({
            sendTo: email,
            subject: "Verify email from DesiKit",
            html: verifyEmailTemplate({
                name,
                url: VerifyEmailUrl
            })
        });

        return response.json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: save
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ _id: code })

        if (!user) {
            return response.status(400).json({
                message: "Invalid code",
                error: true,
                success: false
            })
        }

        await UserModel.updateOne({ _id: code }, {
            verify_email: true
        })

        return response.json({
            message: "Verify email done",
            success: true,
            error: false
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Login
export async function loginController(request, response) {
    try {
        const { email, password } = request.body

        if (!email || !password) {
            return response.status(400).json({
                message: "provide email, password",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "User not registered",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Your account is suspended. Contact Admin.",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }

        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await genertedRefreshToken(user._id)

        await UserModel.findByIdAndUpdate(user._id, {
            last_login_date: new Date()
        })

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie('accessToken', accessToken, cookieOption)
        response.cookie('refreshToken', refreshToken, cookieOption)

        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Logout
export async function logoutController(request, response) {
    try {
        const userid = request.userId

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookieOption)
        response.clearCookie("refreshToken", cookieOption)

        await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Google Login
export async function googleLoginController(request, response) {
    try {
        const { email, name, avatar } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
            // Register new Google user
            const dummyPassword = Math.random().toString(36).slice(-10);
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(dummyPassword, salt);
            const refCode = generateReferralCode();

            user = new UserModel({
                name: name || email.split('@')[0],
                email,
                password: hashPassword,
                avatar: avatar || "",
                verify_email: true,
                role: 'USER',
                referral_code: refCode
            });
            await user.save();

            const newWallet = new WalletModel({ userId: user._id, balance: 0 });
            await newWallet.save();
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Account suspended.",
                error: true,
                success: false
            });
        }

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accessToken, cookieOption);
        response.cookie('refreshToken', refreshToken, cookieOption);

        return response.json({
            message: "Google Login successful",
            error: false,
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// OTP Send
export async function sendOtpController(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Provide email",
                error: true,
                success: false
            });
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
            // Register user automatically as customer
            const dummyPassword = Math.random().toString(36).slice(-10);
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(dummyPassword, salt);
            const refCode = generateReferralCode();

            user = new UserModel({
                name: email.split('@')[0],
                email,
                password: hashPassword,
                role: 'USER',
                referral_code: refCode
            });
            await user.save();

            const newWallet = new WalletModel({ userId: user._id, balance: 0 });
            await newWallet.save();
        }

        const otp = generatedOtp().toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: expiry
        });

        // Print to console for development verification
        console.log(`[OTP LOGIN SIMULATOR] OTP for user ${email} is: ${otp}`);

        await sendEmail({
            sendTo: email,
            subject: "Your DesiKit Login OTP",
            html: `<h3>Your DesiKit Login OTP is: ${otp}</h3><p>It is valid for 5 minutes.</p>`
        });

        return response.json({
            message: "OTP sent successfully (Simulated in terminal console)",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// OTP Verify
export async function verifyOtpController(request, response) {
    try {
        const { email, otp } = request.body;

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide email and OTP",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        if (user.forgot_password_otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        const currentTime = new Date();
        if (new Date(user.forgot_password_expiry) < currentTime) {
            return response.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            });
        }

        // Clear OTP fields
        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: null,
            forgot_password_expiry: null,
            last_login_date: new Date()
        });

        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accessToken, cookieOption);
        response.cookie('refreshToken', refreshToken, cookieOption);

        return response.json({
            message: "OTP Login successful",
            error: false,
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Upload Avatar
export async function uploadAvatar(request, response) {
    try {
        const userId = request.userId // auth middleware
        const image = request.file

        const upload = await uploadImageClodinary(image)

        const updateUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.secure_url
        }, { new: true })

        return response.json({
            message: "Avatar uploaded successfully",
            success: true,
            error: false,
            data: {
                avatar: updateUser.avatar
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Update User details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId
        const { name, email, mobile, password } = request.body

        let hashPassword = ""
        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }

        const updateData = {
            ...(name && { name }),
            ...(email && { email }),
            ...(mobile && { mobile }),
            ...(password && { password: hashPassword })
        }

        const updateUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })

        return response.json({
            message: "User details updated successfully",
            error: false,
            success: true,
            data: updateUser
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Forgot Password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not found",
                error: true,
                success: false
            })
        }

        const otp = generatedOtp()
        const expiry = new Date(Date.now() + 5 * 60 * 1000)

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: expiry
        })

        console.log(`[FORGOT PASSWORD SIMULATOR] OTP for resetting password is: ${otp}`);

        await sendEmail({
            sendTo: email,
            subject: "Reset Password OTP from DesiKit",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        })

        return response.json({
            message: "OTP sent to your email. Check your inbox.",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Verify Forgot Password OTP
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide email, OTP",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not found",
                error: true,
                success: false
            })
        }

        if (user.forgot_password_otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            })
        }

        const currentTime = new Date()
        if (new Date(user.forgot_password_expiry) < currentTime) {
            return response.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "OTP verified successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Reset password
export async function resetpassword(request, response) {
    try {
        const { email, newPassword } = request.body

        if (!email || !newPassword) {
            return response.status(400).json({
                message: "Provide email, new password",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)

        await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword,
            forgot_password_otp: null,
            forgot_password_expiry: null
        })

        return response.json({
            message: "Password reset successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Refresh Token
export async function refreshToken(request, response) {
    try {
        const token = request.cookies.refreshToken || request.body.refreshToken

        if (!token) {
            return response.status(401).json({
                message: "Provide refresh token",
                error: true,
                success: false
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!decode) {
            return response.status(401).json({
                message: "Invalid refresh token",
                error: true,
                success: false
            })
        }

        const userId = decode.id
        const user = await UserModel.findById(userId)

        if (!user || user.refresh_token !== token) {
            return response.status(401).json({
                message: "Invalid refresh token",
                error: true,
                success: false
            })
        }

        const accessToken = await generatedAccessToken(userId)

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie("accessToken", accessToken, cookieOption)

        return response.json({
            message: "Token refreshed successfully",
            error: false,
            success: true,
            data: {
                accessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// User details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select("-password -refresh_token")
            .populate('address_details');

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Fetch Wallet
        const wallet = await WalletModel.findOne({ userId });

        // Fetch Farmer Profile details if user is a Farmer
        let farmerProfile = null;
        if (user.role === 'FARMER') {
            farmerProfile = await FarmerModel.findOne({ user_id: userId });
        }

        // Fetch Delivery Profile details if user is a Delivery Partner
        let deliveryProfile = null;
        if (user.role === 'DELIVERY_PARTNER') {
            deliveryProfile = await DeliveryPartnerModel.findOne({ user_id: userId });
        }

        return response.json({
            message: "User details retrieved successfully",
            error: false,
            success: true,
            data: {
                ...user.toObject(),
                wallet_balance: wallet ? wallet.balance : 0,
                wallet_transactions: wallet ? wallet.transactions : [],
                farmerProfile,
                deliveryProfile
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}