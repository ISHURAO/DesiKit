import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const code = searchParams.get('code');

    useEffect(() => {
        const verify = async () => {
            if (!code) {
                setStatus('error');
                setMessage('Invalid email verification link.');
                return;
            }

            try {
                const response = await Axios.post('/api/user/verify-email', { code });
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully!');
                    toast.success('Email verified! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 4000);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed. Link may be expired.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Server error occurred during verification.');
            }
        };

        verify();
    }, [code, navigate]);

    return (
        <section className='w-full min-h-[70vh] flex items-center justify-center container mx-auto px-4 py-12'>
            <div className='bg-white shadow-xl border border-desikit-soft/50 w-full max-w-md mx-auto rounded-[2rem] p-8 md:p-10 text-center transition-all'>
                {status === 'verifying' && (
                    <div className='space-y-6'>
                        <FaSpinner className='animate-spin text-5xl text-desikit-green mx-auto' />
                        <h2 className='text-2xl font-extrabold text-desikit-dark'>Verifying Email Address</h2>
                        <p className='text-gray-500 text-sm'>Please wait while we confirm your credentials with our servers...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className='space-y-6'>
                        <FaCheckCircle className='text-5xl text-green-500 mx-auto' />
                        <h2 className='text-2xl font-extrabold text-desikit-dark'>Verification Successful</h2>
                        <p className='text-emerald-700 bg-emerald-50 py-2.5 px-4 rounded-xl text-sm font-semibold'>{message}</p>
                        <p className='text-gray-500 text-xs'>You will be automatically redirected to the Login page shortly.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className='w-full py-3 bg-gradient-to-r from-desikit-green to-leaf-green text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all'
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className='space-y-6'>
                        <FaTimesCircle className='text-5xl text-red-500 mx-auto' />
                        <h2 className='text-2xl font-extrabold text-desikit-dark'>Verification Failed</h2>
                        <p className='text-red-700 bg-red-50 py-2.5 px-4 rounded-xl text-sm font-semibold'>{message}</p>
                        <p className='text-gray-500 text-xs'>Try requesting a new verification link or contact support.</p>
                        <button 
                            onClick={() => navigate('/register')}
                            className='w-full py-3 bg-gray-800 text-white font-bold rounded-xl shadow-md hover:bg-gray-900 transition-all'
                        >
                            Back to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VerifyEmail;
