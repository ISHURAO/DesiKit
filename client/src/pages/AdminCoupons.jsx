import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('percentage');
    const [minOrder, setMinOrder] = useState('');
    const [expiry, setExpiry] = useState('');

    const fetchCoupons = async () => {
        try {
            const response = await Axios.get('/coupon/list');
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!code || !value || !expiry) {
            toast.error("Complete required fields (code, discount value, expiry)");
            return;
        }

        try {
            const response = await Axios.post('/coupon/create', {
                code,
                discount_value: parseFloat(value),
                discount_type: type,
                min_order_value: minOrder ? parseFloat(minOrder) : 0,
                expiry_date: expiry
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setCode('');
                setValue('');
                setMinOrder('');
                setExpiry('');
                fetchCoupons();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create coupon");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div>
                <h1 className='text-3xl font-extrabold text-desikit-dark'>Coupon Manager</h1>
                <p className='text-sm text-gray-500'>Create promotional discounts and track active campaigns.</p>
            </div>

            <div className='grid gap-6 md:grid-cols-[300px,1fr]'>
                {/* Form */}
                <div className='bg-white p-5 rounded-3xl border border-desikit-soft shadow-sm h-fit'>
                    <h2 className='text-lg font-bold text-desikit-dark mb-4'>Create Coupon</h2>
                    <form onSubmit={handleCreateCoupon} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Coupon Code*</label>
                            <input
                                type='text'
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder='e.g., FRESH20'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none uppercase focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Discount Type*</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            >
                                <option value='percentage'>Percentage (%)</option>
                                <option value='fixed'>Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Discount Value*</label>
                            <input
                                type='number'
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder='e.g., 20'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                                min='1'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Min Order Value (₹)</label>
                            <input
                                type='number'
                                value={minOrder}
                                onChange={(e) => setMinOrder(e.target.value)}
                                placeholder='e.g., 299'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Expiry Date*</label>
                            <input
                                type='date'
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <button
                            type='submit'
                            className='w-full bg-desikit-green text-white py-2.5 rounded-xl font-bold text-sm hover:bg-leaf-green'
                        >
                            Publish Coupon
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm h-fit'>
                    <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>Active Campaigns</div>
                    {loading ? (
                        <p className='text-center py-6 text-gray-400'>Loading...</p>
                    ) : coupons.length > 0 ? (
                        <div className='divide-y divide-gray-100 max-h-[500px] overflow-y-auto'>
                            {coupons.map(c => (
                                <div key={c._id} className='flex justify-between items-center p-4 hover:bg-gray-50/20'>
                                    <div>
                                        <p className='font-bold text-sm text-gray-800 tracking-wider'>{c.code}</p>
                                        <p className='text-xs text-gray-400'>Expiry: {new Date(c.expiry_date).toLocaleDateString()} | Min Cart: ₹{c.min_order_value}</p>
                                    </div>
                                    <span className='text-sm font-extrabold bg-desikit-soft text-leaf-green px-2.5 py-1 rounded-full'>
                                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} Off
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-sm text-gray-400 text-center py-10'>No active coupons published.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCoupons;
