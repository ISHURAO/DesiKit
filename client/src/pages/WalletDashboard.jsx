import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from '../utils/Axios';
import { setUserDetails } from '../store/userSlice';
import toast from 'react-hot-toast';

const WalletDashboard = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [amount, setAmount] = useState('');
    const [refCodeInput, setRefCodeInput] = useState('');
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [loadingRef, setLoadingRef] = useState(false);

    const fetchWallet = async () => {
        try {
            const response = await Axios.get('/wallet/transactions');
            if (response.data.success) {
                dispatch(setUserDetails({
                    ...user,
                    wallet_balance: response.data.balance,
                    wallet_transactions: response.data.transactions
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("Enter a valid positive amount");
            return;
        }

        setLoadingWallet(true);
        try {
            const response = await Axios.post('/wallet/add-money', { amount: parseFloat(amount) });
            if (response.data.success) {
                toast.success(response.data.message);
                setAmount('');
                fetchWallet();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load wallet");
        } finally {
            setLoadingWallet(false);
        }
    };

    const handleApplyReferral = async (e) => {
        e.preventDefault();
        if (!refCodeInput) {
            toast.error("Provide a referral code");
            return;
        }

        setLoadingRef(true);
        try {
            // Put route or update user route
            const response = await Axios.put('/user/update-user', { referred_by: refCodeInput });
            if (response.data.success) {
                toast.success("Referral applied successfully! ₹50 credited.");
                setRefCodeInput('');
                fetchWallet();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired referral code");
        } finally {
            setLoadingRef(false);
        }
    };

    return (
        <div className='p-6 max-w-4xl mx-auto space-y-8'>
            <h1 className='text-3xl font-extrabold text-desikit-dark'>My Wallet & Referrals</h1>

            <div className='grid gap-6 md:grid-cols-2'>
                {/* Wallet Balance Card */}
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm flex flex-col justify-between h-48 bg-gradient-to-br from-green-50 to-white'>
                    <div>
                        <p className='text-sm text-gray-500 font-medium uppercase tracking-wider'>Available Balance</p>
                        <p className='text-5xl font-black text-desikit-green mt-2'>₹{user.wallet_balance || 0}</p>
                    </div>
                    <form onSubmit={handleAddMoney} className='flex gap-2 mt-4'>
                        <input
                            type='number'
                            placeholder='Amount (₹)'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className='flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            min='1'
                        />
                        <button
                            type='submit'
                            disabled={loadingWallet}
                            className='bg-desikit-green text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-leaf-green disabled:bg-gray-400'
                        >
                            {loadingWallet ? 'Loading...' : 'Add Cash'}
                        </button>
                    </form>
                </div>

                {/* Referral Program Card */}
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm flex flex-col justify-between h-48 bg-gradient-to-br from-amber-50 to-white'>
                    <div>
                        <p className='text-sm text-gray-500 font-medium uppercase tracking-wider'>Share & Earn</p>
                        <div className='flex items-center gap-2 mt-2'>
                            <span className='text-xs font-bold text-gray-400'>Your Referral Code:</span>
                            <span className='px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold tracking-wider select-all border border-amber-200'>
                                {user.referral_code || "DESI-123XYZ"}
                            </span>
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>Get ₹50 for every friend who registers and shops using your code.</p>
                    </div>

                    {!user.referred_by ? (
                        <form onSubmit={handleApplyReferral} className='flex gap-2 mt-2'>
                            <input
                                type='text'
                                placeholder='Friend Referral Code'
                                value={refCodeInput}
                                onChange={(e) => setRefCodeInput(e.target.value)}
                                className='flex-1 border rounded-xl px-3 py-2 text-sm uppercase tracking-wider outline-none focus:border-amber-600 bg-white'
                            />
                            <button
                                type='submit'
                                disabled={loadingRef}
                                className='bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:bg-gray-400'
                            >
                                Apply
                            </button>
                        </form>
                    ) : (
                        <div className='text-xs font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-200'>
                            ✓ Referred by another farmer/consumer
                        </div>
                    )}
                </div>
            </div>

            {/* Ledger Transactions */}
            <div className='bg-white rounded-3xl border border-desikit-soft p-6 shadow-sm'>
                <h2 className='text-xl font-bold text-desikit-dark mb-4'>Transaction History</h2>
                {user.wallet_transactions && user.wallet_transactions.length > 0 ? (
                    <div className='divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2'>
                        {user.wallet_transactions.slice().reverse().map((t, index) => (
                            <div key={index} className='flex justify-between py-3.5 items-center'>
                                <div>
                                    <p className='font-semibold text-sm text-gray-800'>{t.description || 'Wallet Transaction'}</p>
                                    <p className='text-xs text-gray-400'>{new Date(t.date).toLocaleString()}</p>
                                </div>
                                <span className={`text-base font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                    {t.type === 'credit' ? '+' : '-'} ₹{t.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-sm text-gray-400 text-center py-6'>No transactions recorded yet.</p>
                )}
            </div>
        </div>
    );
};

export default WalletDashboard;
