import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const AdminVerifications = () => {
    const [farmers, setFarmers] = useState([]);
    const [delivery, setDelivery] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const response = await Axios.get('/admin/pending-verifications');
            if (response.data.success) {
                setFarmers(response.data.data.farmers || []);
                setDelivery(response.data.data.delivery || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async (type, id, action) => {
        try {
            const response = await Axios.put('/admin/verify-partner', { type, id, action });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPending();
            }
        } catch (error) {
            toast.error("Verification decision update failed");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-8'>
            <div>
                <h1 className='text-3xl font-extrabold text-desikit-dark'>Partner Approval Center</h1>
                <p className='text-sm text-gray-500'>Verify farm licenses and delivery vehicles. Grant credentials.</p>
            </div>

            {loading ? (
                <p className='text-center py-10 font-bold text-gray-500'>Loading requests...</p>
            ) : (
                <div className='space-y-8'>
                    {/* Farmers List */}
                    <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm'>
                        <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>Pending Farmer Licenses ({farmers.length})</div>
                        {farmers.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm text-left text-gray-500'>
                                    <thead className='text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100'>
                                        <tr>
                                            <th className='px-6 py-4'>Farmer</th>
                                            <th className='px-6 py-4'>Farm Name</th>
                                            <th className='px-6 py-4'>Address</th>
                                            <th className='px-6 py-4'>Document</th>
                                            <th className='px-6 py-4 text-center'>Decisions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {farmers.map(f => (
                                            <tr key={f._id} className='hover:bg-gray-50/40'>
                                                <td className='px-6 py-4 font-semibold text-gray-800'>
                                                    {f.user_id?.name || 'N/A'} <br />
                                                    <span className='text-xs text-gray-400 font-normal'>{f.user_id?.email}</span>
                                                </td>
                                                <td className='px-6 py-4 font-semibold'>{f.farm_name}</td>
                                                <td className='px-6 py-4 text-xs max-w-xs truncate'>{f.farm_address}</td>
                                                <td className='px-6 py-4'>
                                                    <a href={f.license_doc} target='_blank' rel="noopener noreferrer" className='text-xs font-bold text-blue-600 hover:underline'>
                                                        View Document Image
                                                    </a>
                                                </td>
                                                <td className='px-6 py-4 text-center space-x-2'>
                                                    <button
                                                        onClick={() => handleVerify('farmer', f._id, 'approved')}
                                                        className='bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-green-700'
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify('farmer', f._id, 'rejected')}
                                                        className='bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-red-600'
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className='text-sm text-gray-400 text-center py-6'>No pending farmer approvals.</p>
                        )}
                    </div>

                    {/* Delivery List */}
                    <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm'>
                        <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>Pending Courier Registrations ({delivery.length})</div>
                        {delivery.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm text-left text-gray-500'>
                                    <thead className='text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100'>
                                        <tr>
                                            <th className='px-6 py-4'>Courier</th>
                                            <th className='px-6 py-4'>Vehicle Type</th>
                                            <th className='px-6 py-4'>Vehicle Number</th>
                                            <th className='px-6 py-4 text-center'>Decisions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {delivery.map(d => (
                                            <tr key={d._id} className='hover:bg-gray-50/40'>
                                                <td className='px-6 py-4 font-semibold text-gray-800'>
                                                    {d.user_id?.name || 'N/A'} <br />
                                                    <span className='text-xs text-gray-400 font-normal'>{d.user_id?.email}</span>
                                                </td>
                                                <td className='px-6 py-4 font-semibold'>{d.vehicle_details}</td>
                                                <td className='px-6 py-4 font-bold text-gray-700'>{d.vehicle_number || 'N/A'}</td>
                                                <td className='px-6 py-4 text-center space-x-2'>
                                                    <button
                                                        onClick={() => handleVerify('delivery', d._id, 'approved')}
                                                        className='bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-green-700'
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify('delivery', d._id, 'rejected')}
                                                        className='bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-red-600'
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className='text-sm text-gray-400 text-center py-6'>No pending courier approvals.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
