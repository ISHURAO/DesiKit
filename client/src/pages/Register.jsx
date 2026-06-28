import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye, FaUser, FaEnvelope, FaLock, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";
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
        role: "USER",
        farm_name: "",
        farm_address: ""
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

    const getIsValid = () => {
        if (!data.name || !data.email || !data.password || !data.confirmPassword || !data.role) return false;
        if (data.role === 'FARMER') {
            if (!data.farm_name || !data.farm_address) return false;
        }
        return true;
    };
    const valideValue = getIsValid();

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
                    role: "USER",
                    farm_name: "",
                    farm_address: ""
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    const detectFarmLocation = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const toastId = toast.loading("Detecting farm coordinates...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const result = await response.json();
                    if (result && result.display_name) {
                        setData(prev => ({
                            ...prev,
                            farm_address: result.display_name
                        }));
                        toast.success("Farm address auto-filled!", { id: toastId });
                    } else {
                        toast.error("Failed to parse address", { id: toastId });
                    }
                } catch (error) {
                    toast.error("Geocoding failed", { id: toastId });
                }
            },
            (error) => {
                toast.error("Failed to get coordinates", { id: toastId });
            }
        );
    };

    return (
        <section className='w-full min-h-[90vh] flex items-center justify-center container mx-auto px-4 py-12'>
            <div className='bg-white/95 backdrop-blur-md shadow-2xl border border-desikit-soft/50 w-full max-w-lg mx-auto rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 hover:shadow-desikit-green/10'>
                <div className='text-center mb-8'>
                    <h2 className='text-3xl font-extrabold text-desikit-dark tracking-tight bg-gradient-to-r from-desikit-green to-leaf-green bg-clip-text text-transparent'>
                        Create Account
                    </h2>
                    <p className='mt-2 text-sm text-gray-500'>
                        Join the farm-to-family marketplace for fresh, local produce.
                    </p>
                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className='space-y-1.5'>
                        <label htmlFor='name' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Name</label>
                        <div className='flex items-center bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-desikit-green focus-within:ring-2 focus-within:ring-desikit-green/10 transition-all shadow-sm'>
                            <FaUser className='text-gray-400 mr-2.5 text-sm' />
                            <input
                                type='text'
                                id='name'
                                autoFocus
                                className='w-full bg-transparent outline-none text-desikit-dark placeholder-gray-400 text-sm font-medium'
                                name='name'
                                value={data.name}
                                onChange={handleChange}
                                placeholder='Enter your full name'
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className='space-y-1.5'>
                        <label htmlFor='email' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Email Address</label>
                        <div className='flex items-center bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-desikit-green focus-within:ring-2 focus-within:ring-desikit-green/10 transition-all shadow-sm'>
                            <FaEnvelope className='text-gray-400 mr-2.5 text-sm' />
                            <input
                                type='email'
                                id='email'
                                className='w-full bg-transparent outline-none text-desikit-dark placeholder-gray-400 text-sm font-medium'
                                name='email'
                                value={data.email}
                                onChange={handleChange}
                                placeholder='name@example.com'
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className='space-y-1.5'>
                        <label htmlFor='password' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Password</label>
                        <div className='flex items-center bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-desikit-green focus-within:ring-2 focus-within:ring-desikit-green/10 transition-all shadow-sm'>
                            <FaLock className='text-gray-400 mr-2.5 text-sm' />
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full bg-transparent outline-none text-desikit-dark placeholder-gray-400 text-sm font-medium'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Choose password'
                            />
                            <button 
                                type='button'
                                onClick={() => setShowPassword(prev => !prev)} 
                                className='text-gray-400 hover:text-desikit-green transition-all'
                            >
                                {showPassword ? <FaRegEye className='text-sm' /> : <FaRegEyeSlash className='text-sm' />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className='space-y-1.5'>
                        <label htmlFor='confirmPassword' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Confirm Password</label>
                        <div className='flex items-center bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-desikit-green focus-within:ring-2 focus-within:ring-desikit-green/10 transition-all shadow-sm'>
                            <FaLock className='text-gray-400 mr-2.5 text-sm' />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full bg-transparent outline-none text-desikit-dark placeholder-gray-400 text-sm font-medium'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Confirm your password'
                            />
                            <button 
                                type='button'
                                onClick={() => setShowConfirmPassword(prev => !prev)} 
                                className='text-gray-400 hover:text-desikit-green transition-all'
                            >
                                {showConfirmPassword ? <FaRegEye className='text-sm' /> : <FaRegEyeSlash className='text-sm' />}
                            </button>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className='space-y-1.5'>
                        <label htmlFor='role' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Join As</label>
                        <select
                            id='role'
                            className='w-full bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 text-desikit-dark font-medium text-sm outline-none focus:border-desikit-green focus:ring-2 focus:ring-desikit-green/10 cursor-pointer shadow-sm'
                            name='role'
                            value={data.role}
                            onChange={handleChange}
                        >
                            <option value="USER">Customer (Order fresh produce)</option>
                            <option value="FARMER">Farmer (Sell fresh products)</option>
                            <option value="DELIVERY_PARTNER">Delivery Partner (Deliver orders)</option>
                        </select>
                    </div>

                    {/* Farmer Specific Fields with Smooth Transitions */}
                    {data.role === 'FARMER' && (
                        <div className='space-y-4 pt-2 border-t border-gray-100 animate-fadeIn duration-300'>
                            {/* Farm Name */}
                            <div className='space-y-1.5'>
                                <label htmlFor='farm_name' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Farm Name</label>
                                <div className='flex items-center bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-desikit-green focus-within:ring-2 focus-within:ring-desikit-green/10 transition-all shadow-sm'>
                                    <FaBuilding className='text-gray-400 mr-2.5 text-sm' />
                                    <input
                                        type='text'
                                        id='farm_name'
                                        className='w-full bg-transparent outline-none text-desikit-dark placeholder-gray-400 text-sm font-medium'
                                        name='farm_name'
                                        value={data.farm_name}
                                        onChange={handleChange}
                                        placeholder='Enter your farm name (e.g. Krishna Dairy)'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Farm Address */}
                            <div className='space-y-1.5'>
                                <div className='flex justify-between items-center'>
                                    <label htmlFor='farm_address' className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Farm Address</label>
                                    <button 
                                        type='button'
                                        onClick={detectFarmLocation}
                                        className='text-xs font-bold text-desikit-green hover:text-leaf-green flex items-center gap-1 bg-green-50/80 px-2.5 py-1 rounded-lg border border-desikit-green/20 hover:bg-green-100 transition-all shadow-sm'
                                    >
                                        <FaMapMarkerAlt className='text-[10px]' /> Detect Location
                                    </button>
                                </div>
                                <textarea
                                    id='farm_address'
                                    rows='2'
                                    className='w-full bg-farm-cream/60 border border-gray-200 rounded-xl px-3.5 py-3 text-desikit-dark placeholder-gray-400 text-sm font-medium outline-none focus:border-desikit-green focus:ring-2 focus:ring-desikit-green/10 resize-none shadow-sm'
                                    name='farm_address'
                                    value={data.farm_address}
                                    onChange={handleChange}
                                    placeholder='Address used for farm-to-family distance calculation'
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        disabled={!valideValue} 
                        className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md transform active:scale-95 mt-4 ${
                            valideValue 
                                ? "bg-gradient-to-r from-desikit-green to-leaf-green text-white hover:shadow-lg hover:shadow-desikit-green/30" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed" 
                        }`}
                    >
                        Sign Up & Join
                    </button>
                </form>

                {/* Footnotes */}
                <div className='mt-8 text-center border-t border-gray-100 pt-6 text-sm text-gray-500'>
                    Already have account?{' '}
                    <Link to={"/login"} className='font-bold text-desikit-green hover:underline hover:text-leaf-green transition-all'>
                        Login
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Register

