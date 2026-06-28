import React, { useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accesstoken',response.data.data.accessToken)
                localStorage.setItem('refreshToken',response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({
                    email : "",
                    password : "",
                })
                navigate("/")
            }

        } catch (error) {
            AxiosToastError(error)
        }



    }
    return (
        <section className='w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-farm-cream via-milk-cream to-desikit-soft px-4 py-12'>
            <div className='bg-white/95 backdrop-blur-md w-full max-w-md rounded-[2rem] p-8 shadow-xl border border-desikit-soft/50 animate-fadeIn space-y-6'>
                <div className='text-center space-y-2'>
                    <div className='text-4xl mb-2 animate-bounce'>🥬</div>
                    <p className='text-2xl font-extrabold text-desikit-dark tracking-tight'>Welcome back</p>
                    <p className='text-xs text-desikit-dark/70 font-medium'>Log in to manage orders, subscriptions, and farm-fresh deliveries.</p>
                </div>

                <form className='grid gap-5' onSubmit={handleSubmit}>
                    <div className='grid gap-1.5'>
                        <label htmlFor='email' className='text-xs font-extrabold text-desikit-dark uppercase tracking-wider'>Email Address</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-milk-cream p-3.5 border-2 border-desikit-soft rounded-2xl outline-none focus:border-desikit-green focus:bg-white transition-all text-sm font-semibold'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email address'
                        />
                    </div>
                    <div className='grid gap-1.5'>
                        <label htmlFor='password' className='text-xs font-extrabold text-desikit-dark uppercase tracking-wider'>Password</label>
                        <div className='bg-milk-cream p-3.5 border-2 border-desikit-soft rounded-2xl flex items-center focus-within:border-desikit-green focus-within:bg-white transition-all'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full bg-transparent outline-none text-sm font-semibold'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                            />
                            <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer text-desikit-dark/60 hover:text-desikit-dark'>
                                {
                                    showPassword ? (
                                        <FaRegEye size={18} />
                                    ) : (
                                        <FaRegEyeSlash size={18} />
                                    )
                                }
                            </div>
                        </div>
                        <Link to={"/forgot-password"} className='block ml-auto text-xs font-bold text-desikit-green hover:underline mt-1'>Forgot password?</Link>
                    </div>
    
                    <button 
                        disabled={!valideValue} 
                        className={`w-full py-4 rounded-2xl font-bold tracking-wider text-sm transition-all shadow-md transform active:scale-[0.98] ${
                            valideValue 
                            ? "bg-gradient-to-r from-desikit-green to-leaf-green hover:shadow-lg hover:shadow-desikit-green/20 text-white" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Sign In
                    </button>
                </form>

                <div className='text-center border-t border-desikit-soft pt-6'>
                    <p className='text-xs text-desikit-dark/70 font-bold'>
                        Don't have an account?{' '}
                        <Link to={"/register"} className='font-extrabold text-desikit-green hover:underline'>
                            Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login

