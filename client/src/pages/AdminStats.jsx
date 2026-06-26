import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await Axios.get('/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <p className='text-center py-10 font-bold text-gray-500'>Loading system reports...</p>;
    }

    return (
        <div className='p-6 max-w-4xl mx-auto space-y-8'>
            <div>
                <h1 className='text-3xl font-extrabold text-desikit-dark'>DesiKit System Dashboard</h1>
                <p className='text-sm text-gray-500'>Real-time monitor of users, gross merchandise value (GMV), and commission fees.</p>
            </div>

            {stats ? (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm bg-gradient-to-br from-green-50 to-white'>
                        <p className='text-xs text-gray-400 font-bold uppercase'>Gross System GMV</p>
                        <p className='text-4xl font-black text-desikit-green mt-1'>₹{stats.totalRevenue}</p>
                        <p className='text-xs text-gray-400 mt-2'>All completed order amounts combined</p>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm bg-gradient-to-br from-amber-50 to-white'>
                        <p className='text-xs text-gray-400 font-bold uppercase'>Platform Commission (10%)</p>
                        <p className='text-4xl font-black text-amber-600 mt-1'>₹{parseFloat(stats.platformEarnings.toFixed(2))}</p>
                        <p className='text-xs text-gray-400 mt-2'>Gross platform profit margins</p>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase'>Pending Verifications</p>
                        <p className='text-4xl font-black text-red-500 mt-1'>{stats.pendingVerifications}</p>
                        <p className='text-xs text-gray-400 mt-2'>Farmers & delivery partners awaiting approval</p>
                    </div>
                </div>
            ) : null}

            {stats ? (
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                    <h2 className='text-xl font-bold text-desikit-dark mb-4'>System Assets Overview</h2>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                        <div className='p-4 border rounded-2xl'>
                            <p className='text-sm text-gray-400 font-bold'>Total Users</p>
                            <p className='text-2xl font-black text-gray-800 mt-1'>{stats.totalUsers}</p>
                        </div>
                        <div className='p-4 border rounded-2xl'>
                            <p className='text-sm text-gray-400 font-bold'>Farmers</p>
                            <p className='text-2xl font-black text-gray-800 mt-1'>{stats.totalFarmers}</p>
                        </div>
                        <div className='p-4 border rounded-2xl'>
                            <p className='text-sm text-gray-400 font-bold'>Couriers</p>
                            <p className='text-2xl font-black text-gray-800 mt-1'>{stats.totalDeliveries}</p>
                        </div>
                        <div className='p-4 border rounded-2xl'>
                            <p className='text-sm text-gray-400 font-bold'>Catalog Items</p>
                            <p className='text-2xl font-black text-gray-800 mt-1'>{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AdminStats;
