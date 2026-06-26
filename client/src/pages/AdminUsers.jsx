import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await Axios.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const response = await Axios.put('/admin/user/status', { userId, status: newStatus });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Failed to change user status");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div>
                <h1 className='text-3xl font-extrabold text-desikit-dark'>User Management Control</h1>
                <p className='text-sm text-gray-500'>Audit accounts. Block malicious users or review customer accounts.</p>
            </div>

            <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm'>
                <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>Registered Accounts</div>
                {loading ? (
                    <p className='text-center py-10 font-bold text-gray-500'>Loading accounts list...</p>
                ) : users.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left text-gray-500'>
                            <thead className='text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100'>
                                <tr>
                                    <th className='px-6 py-4'>Name</th>
                                    <th className='px-6 py-4'>Email</th>
                                    <th className='px-6 py-4'>Role</th>
                                    <th className='px-6 py-4'>Wallet Balance</th>
                                    <th className='px-6 py-4'>Status</th>
                                    <th className='px-6 py-4 text-center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {users.map(u => (
                                    <tr key={u._id} className='hover:bg-gray-50/40'>
                                        <td className='px-6 py-4 font-semibold text-gray-800 flex items-center gap-3'>
                                            {u.avatar ? (
                                                <img src={u.avatar} className='w-8 h-8 rounded-full border object-cover' />
                                            ) : (
                                                <div className='w-8 h-8 rounded-full bg-desikit-soft text-leaf-green flex items-center justify-center font-bold text-xs capitalize'>
                                                    {u.name ? u.name[0] : 'U'}
                                                </div>
                                            )}
                                            <span>{u.name || 'N/A'}</span>
                                        </td>
                                        <td className='px-6 py-4'>{u.email}</td>
                                        <td className='px-6 py-4'>
                                            <span className='px-2 py-0.5 rounded text-[10px] font-bold bg-desikit-soft text-leaf-green uppercase border border-desikit-green/20'>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 font-bold text-gray-700'>₹{u.wallet_balance || 0}</td>
                                        <td className='px-6 py-4'>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-center'>
                                            <button
                                                onClick={() => handleChangeStatus(u._id, u.status)}
                                                className={`text-xs font-bold hover:underline ${u.status === 'Active' ? 'text-red-500' : 'text-green-600'}`}
                                            >
                                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className='text-sm text-gray-400 text-center py-10'>No user accounts registered.</p>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
