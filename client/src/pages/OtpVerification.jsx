import React, { useEffect, useRef, useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OtpVerification = () => {
    const [data, setData] = useState(["","","","","",""])
    const navigate = useNavigate()
    const inputRef = useRef([])
    const location = useLocation()

    console.log("location",location)

    useEffect(()=>{
        if(!location?.state?.email){
            navigate("/forgot-password")
        }
    },[])

    const valideValue = data.every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data : {
                    otp : data.join(""),
                    email : location?.state?.email
                }
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                navigate("/reset-password",{
                    state : {
                        data : response.data,
                        email : location?.state?.email
                    }
                })
            }

        } catch (error) {
            console.log('error',error)
            AxiosToastError(error)
        }



    }

    return (
        <section className='w-full min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-8'>
            <div className='bg-white/95 backdrop-blur-md shadow-xl border border-desikit-soft/50 w-full max-w-md mx-auto rounded-[2rem] p-8 md:p-10 transition-all duration-300 hover:shadow-2xl'>
                <div className='text-center mb-6'>
                    <h2 className='text-2xl md:text-3xl font-extrabold text-desikit-dark tracking-tight'>Verify Your Account</h2>
                    <p className='text-gray-500 mt-2 text-sm'>
                        We have sent a 6-digit OTP verification code to <span className='font-semibold text-desikit-green'>{location?.state?.email || 'your email'}</span>
                    </p>
                </div>

                <form className='space-y-6' onSubmit={handleSubmit}>
                    <div className='space-y-2'>
                        <label className='block text-xs font-bold uppercase tracking-wider text-desikit-dark/70'>Verification Code</label>
                        <div className='flex items-center gap-2 justify-between mt-2'>
                            {
                                data.map((element,index)=>{
                                    return(
                                        <input
                                            key={"otp"+index}
                                            type='text'
                                            id='otp'
                                            ref={(ref)=>{
                                                inputRef.current[index] = ref
                                                return ref 
                                            }}
                                            value={data[index]}
                                            onChange={(e)=>{
                                                const value =  e.target.value
                                                const newData = [...data]
                                                newData[index] = value
                                                setData(newData)

                                                if(value && index < 5){
                                                    inputRef.current[index+1].focus()
                                                }
                                            }}
                                            maxLength={1}
                                            className='w-12 h-14 bg-farm-cream/60 border border-gray-200 rounded-xl outline-none focus:border-desikit-green focus:ring-2 focus:ring-desikit-green/20 text-center font-bold text-xl text-desikit-dark transition-all shadow-sm'
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
             
                    <button 
                        disabled={!valideValue} 
                        className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md transform active:scale-95 ${
                            valideValue 
                                ? "bg-gradient-to-r from-desikit-green to-leaf-green text-white hover:shadow-lg hover:shadow-desikit-green/30" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed" 
                        }`}
                    >
                        Verify & Proceed
                    </button>
                </form>

                {/* Helpful Developer Hint */}
                <div className='mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed'>
                    <span className='font-bold block mb-1'>💡 Local Environment Tip:</span>
                    If you do not receive the email, please check the Node.js server console/terminal log output where the simulated OTP code is printed.
                </div>

                <div className='mt-8 text-center border-t border-gray-100 pt-6 text-sm text-gray-500'>
                    Back to{' '}
                    <Link to={"/login"} className='font-bold text-desikit-green hover:underline hover:text-leaf-green transition-all'>
                        Login
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default OtpVerification



