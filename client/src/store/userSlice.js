import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    _id : "",
    name : "",
    email : "",
    avatar : "",
    mobile : "",
    verify_email : "",
    last_login_date : "",
    status : "",
    address_details : [],
    shopping_cart : [],
    orderHistory : [],
    role : "",
    wallet_balance : 0,
    wallet_transactions : [],
    farmerProfile: null,
    deliveryProfile: null,
    referral_code: "",
    referred_by: null
}

const userSlice  = createSlice({
    name : 'user',
    initialState : initialValue,
    reducers : {
        setUserDetails : (state,action) =>{
            state._id = action.payload?._id
            state.name  = action.payload?.name
            state.email = action.payload?.email
            state.avatar = action.payload?.avatar
            state.mobile = action.payload?.mobile
            state.verify_email = action.payload?.verify_email
            state.last_login_date = action.payload?.last_login_date
            state.status = action.payload?.status
            state.address_details = action.payload?.address_details || []
            state.shopping_cart = action.payload?.shopping_cart || []
            state.orderHistory = action.payload?.orderHistory || []
            state.role = action.payload?.role
            state.wallet_balance = action.payload?.wallet_balance || 0
            state.wallet_transactions = action.payload?.wallet_transactions || []
            state.farmerProfile = action.payload?.farmerProfile || null
            state.deliveryProfile = action.payload?.deliveryProfile || null
            state.referral_code = action.payload?.referral_code || ""
            state.referred_by = action.payload?.referred_by || null
        },
        updatedAvatar : (state,action)=>{
            state.avatar = action.payload
        },
        updateWalletBalance : (state, action)=>{
            state.wallet_balance = action.payload
        },
        logout : (state,action)=>{
            state._id = ""
            state.name  = ""
            state.email = ""
            state.avatar = ""
            state.mobile = ""
            state.verify_email = ""
            state.last_login_date = ""
            state.status = ""
            state.address_details = []
            state.shopping_cart = []
            state.orderHistory = []
            state.role = ""
            state.wallet_balance = 0
            state.wallet_transactions = []
            state.farmerProfile = null
            state.deliveryProfile = null
            state.referral_code = ""
            state.referred_by = null
        },
    }
})

export const { setUserDetails, logout ,updatedAvatar, updateWalletBalance} = userSlice.actions

export default userSlice.reducer