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
        <section className='w-full container mx-auto px-4 py-8'>
            <div className='bg-white my-4 w-full max-w-xl mx-auto rounded-3xl p-8 shadow-sm border border-desikit-soft'>
                <div className='mb-6'>
                    <p className='text-3xl font-bold text-desikit-dark'>Welcome back to DesiKit</p>
                    <p className='mt-2 text-desikit-dark/70'>Log in to manage orders, subscriptions, and farm-fresh deliveries.</p>
                </div>

                <form className='grid gap-4' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='email' className='text-sm font-medium text-desikit-dark'>Email</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-milk-cream p-3 border border-desikit-soft rounded-2xl outline-none focus:border-desikit-green'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='password' className='text-sm font-medium text-desikit-dark'>Password</label>
                        <div className='bg-milk-cream p-3 border border-desikit-soft rounded-2xl flex items-center focus-within:border-desikit-green'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full bg-transparent outline-none'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                            />
                            <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer text-desikit-dark'>
                                {
                                    showPassword ? (
                                        <FaRegEye />
                                    ) : (
                                        <FaRegEyeSlash />
                                    )
                                }
                            </div>
                        </div>
                        <Link to={"/forgot-password"} className='block ml-auto text-sm text-desikit-green hover:text-leaf-green'>Forgot password?</Link>
                    </div>
    
                    <button disabled={!valideValue} className={` ${valideValue ? "bg-desikit-green hover:bg-leaf-green" : "bg-gray-400" } text-white py-3 rounded-full font-semibold tracking-wide`}>Login</button>

                </form>

                <p className='mt-4 text-sm text-desikit-dark/70'>Don't have an account? <Link to={"/register"} className='font-semibold text-desikit-green hover:text-leaf-green'>Register</Link></p>
            </div>
        </section>
    )
}

export default Login

