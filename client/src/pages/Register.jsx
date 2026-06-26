import React, { useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER"
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

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

        if(data.password !== data.confirmPassword){
            toast.error(
                "password and confirm password must be same"
            )
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : "",
                    role: "USER"
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }



    }
    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded-3xl p-7 shadow-sm border border-desikit-soft'>
                <p className='text-2xl font-bold text-desikit-dark'>Welcome to DesiKit</p>
                <p className='mt-2 text-sm text-desikit-dark/70'>Join the farm-to-family marketplace for fresh milk, vegetables, and dairy products.</p>

                <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='name'>Name :</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            className='bg-milk-cream p-3 border border-desikit-soft rounded-xl outline-none focus:border-desikit-green'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='email'>Email :</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-milk-cream p-3 border border-desikit-soft rounded-xl outline-none focus:border-desikit-green'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='password'>Password :</label>
                        <div className='bg-milk-cream p-3 border border-desikit-soft rounded-xl flex items-center focus-within:border-desikit-green'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full outline-none bg-transparent'
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
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='confirmPassword'>Confirm Password :</label>
                        <div className='bg-milk-cream p-3 border border-desikit-soft rounded-xl flex items-center focus-within:border-desikit-green'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full outline-none bg-transparent'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Confirm your password'
                            />
                            <div onClick={() => setShowConfirmPassword(preve => !preve)} className='cursor-pointer text-desikit-dark'>
                                {
                                    showConfirmPassword ? (
                                        <FaRegEye />
                                    ) : (
                                        <FaRegEyeSlash />
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className='grid gap-1'>
                        <label htmlFor='role'>Register As :</label>
                        <select
                            id='role'
                            className='bg-milk-cream p-3 border border-desikit-soft rounded-xl outline-none focus:border-desikit-green cursor-pointer'
                            name='role'
                            value={data.role}
                            onChange={handleChange}
                        >
                            <option value="USER">Customer (Order fresh produce)</option>
                            <option value="FARMER">Farmer (Sell fresh products)</option>
                            <option value="DELIVERY_PARTNER">Delivery Partner (Deliver orders)</option>
                        </select>
                    </div>

                    <button disabled={!valideValue} className={` ${valideValue ? "bg-desikit-green hover:bg-leaf-green" : "bg-gray-400" } text-white py-3 rounded-full font-semibold my-3 tracking-wide`}>Register</button>

                </form>

                <p className='text-sm text-desikit-dark/70'>
                    Already have account ? <Link to={"/login"} className='font-semibold text-desikit-green hover:text-leaf-green'>Login</Link>
                </p>
            </div>
        </section>
    )
}

export default Register
