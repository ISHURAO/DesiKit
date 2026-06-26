import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";

const UserMenu = ({close}) => {
   const user = useSelector((state)=> state.user)
   const dispatch = useDispatch()
   const navigate = useNavigate()

   const handleLogout = async()=>{
        try {
          const response = await Axios({
             ...SummaryApi.logout
          })
          if(response.data.success){
            if(close){
              close()
            }
            dispatch(logout())
            localStorage.clear()
            toast.success(response.data.message)
            navigate("/")
          }
        } catch (error) {
          console.log(error)
          AxiosToastError(error)
        }
   }

   const handleClose = ()=>{
      if(close){
        close()
      }
   }

  return (
    <div className='space-y-3 p-1'>
        <div>
            <div className='font-bold text-lg text-desikit-dark'>DesiKit Account</div>
            <div className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
              <span className='max-w-44 truncate font-semibold text-gray-700'>{user.name || user.email}</span>
              <span className='px-1.5 py-0.5 rounded bg-desikit-soft text-leaf-green text-[10px] font-bold uppercase'>
                {user.role}
              </span>
              <Link onClick={handleClose} to={"/dashboard/profile"} className='hover:text-desikit-green ml-auto text-gray-400 hover:text-gray-600'>
                <HiOutlineExternalLink size={14}/>
              </Link>
            </div>
        </div>

        <Divider/>

        <div className='text-sm flex flex-col gap-1'>
            {/* Customer Links */}
            {(user.role === 'USER' || user.role === 'ADMIN') && (
              <>
                <div className='text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mt-2 mb-1'>Customer</div>
                <Link onClick={handleClose} to={"/dashboard/profile"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>My Profile</Link>
                <Link onClick={handleClose} to={"/dashboard/myorders"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>My Orders</Link>
                <Link onClick={handleClose} to={"/dashboard/address"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Saved Addresses</Link>
                <Link onClick={handleClose} to={"/dashboard/wallet"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all flex justify-between items-center'>
                  <span>Wallet & Referrals</span>
                  <span className='text-xs font-bold bg-desikit-accent/30 text-amber-600 px-1.5 py-0.5 rounded-full'>₹{user.wallet_balance}</span>
                </Link>
                <Link onClick={handleClose} to={"/dashboard/support"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Support Chat</Link>
              </>
            )}

            {/* Farmer Dashboard Links */}
            {(user.role === 'FARMER' || user.role === 'ADMIN') && (
              <>
                <div className='text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-1'>Farmer Dashboard</div>
                {user.role === 'FARMER' && (
                  <Link onClick={handleClose} to={"/dashboard/profile"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>My Profile</Link>
                )}
                <Link onClick={handleClose} to={"/dashboard/farmer-stats"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Farm Stats</Link>
                <Link onClick={handleClose} to={"/dashboard/farmer-products"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Products</Link>
                <Link onClick={handleClose} to={"/dashboard/farmer-orders"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Farmer Orders</Link>
              </>
            )}

            {/* Delivery Partner Dashboard Links */}
            {(user.role === 'DELIVERY_PARTNER' || user.role === 'ADMIN') && (
              <>
                <div className='text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-1'>Delivery Dashboard</div>
                {user.role === 'DELIVERY_PARTNER' && (
                  <Link onClick={handleClose} to={"/dashboard/profile"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>My Profile</Link>
                )}
                <Link onClick={handleClose} to={"/dashboard/delivery-stats"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Delivery Stats</Link>
                <Link onClick={handleClose} to={"/dashboard/delivery-orders"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Assigned Jobs</Link>
              </>
            )}

            {/* Admin Dashboard Links */}
            {user.role === 'ADMIN' && (
              <>
                <div className='text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-1'>Admin Console</div>
                <Link onClick={handleClose} to={"/dashboard/admin-stats"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>System Stats</Link>
                <Link onClick={handleClose} to={"/dashboard/admin-users"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Users</Link>
                <Link onClick={handleClose} to={"/dashboard/admin-verifications"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Approve Partners</Link>
                <Link onClick={handleClose} to={"/dashboard/category"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Categories</Link>
                <Link onClick={handleClose} to={"/dashboard/subcategory"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Subcategories</Link>
                <Link onClick={handleClose} to={"/dashboard/admin-coupons"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Coupons</Link>
                <Link onClick={handleClose} to={"/dashboard/admin-banners"} className='px-3 py-1.5 rounded-lg hover:bg-desikit-soft hover:text-leaf-green font-medium transition-all'>Manage Banners</Link>
              </>
            )}

            <Divider/>
            <button onClick={handleLogout} className='text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-semibold mt-2 transition-all'>Log Out</button>
        </div>
    </div>
  )
}

export default UserMenu
