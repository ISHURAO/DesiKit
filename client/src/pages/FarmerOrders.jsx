import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const FarmerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSlip, setShowSlip] = useState(null); // stores order details for modal packing slip

    const fetchOrders = async () => {
        try {
            const response = await Axios.get('/api/farmer/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPartners = async () => {
        try {
            const response = await Axios.get('/api/farmer/delivery-partners');
            if (response.data.success) {
                setPartners(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchOrders(), fetchPartners()]);
            setLoading(false);
        };
        init();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await Axios.put('/api/farmer/order/status', { orderId, status: newStatus });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchOrders();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAssignPartner = async (orderId, partnerId) => {
        if (!partnerId) return;
        try {
            const response = await Axios.put('/api/farmer/assign-delivery', { orderId, deliveryPartnerId: partnerId });
            if (response.data.success) {
                toast.success("Delivery partner assigned!");
                fetchOrders();
            }
        } catch (error) {
            toast.error("Failed to assign partner");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div className='flex justify-between items-center border-b pb-5'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark tracking-tight'>Farmer Fulfillment Center</h1>
                    <p className='text-sm text-gray-500 mt-1'>Pack farm items, track delivery slots, and dispatch verified couriers.</p>
                </div>
                <span className='text-xs font-bold text-gray-500 bg-gray-100 py-1.5 px-3 rounded-xl'>{orders.length} Orders Incoming</span>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-[40vh]'>
                    <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-desikit-green'></div>
                </div>
            ) : orders.length > 0 ? (
                <div className='space-y-6'>
                    {orders.map(order => {
                        const isPickup = order.delivery_type === 'pickup';
                        const isSubscription = order.is_subscription;

                        return (
                            <div key={order._id} className='bg-white rounded-3xl border border-desikit-soft p-6 shadow-sm space-y-5 hover:shadow-md transition-all relative overflow-hidden'>
                                {/* Order Header */}
                                <div className='flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block'>Order Ref</span>
                                            {isSubscription && (
                                                <span className='text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider'>Subscription</span>
                                            )}
                                        </div>
                                        <p className='font-mono font-bold text-gray-800 text-sm mt-0.5'>{order.orderId}</p>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block'>Buyer</span>
                                        <p className='font-bold text-desikit-dark text-sm mt-0.5'>{order.userId?.name || 'Customer'}</p>
                                        <p className='text-xs text-gray-500 font-semibold'>📞 {order.userId?.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center'>Total Value</span>
                                        <p className='font-black text-desikit-green text-base mt-0.5 text-center'>₹{order.totalAmt}</p>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block text-right'>Process Status</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black capitalize text-right mt-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Delivery Mode vs Self-Pickup Warnings */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {isPickup ? (
                                        <div className='p-4 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-900 space-y-1'>
                                            <span className='font-bold text-[10px] uppercase tracking-wider block text-amber-800'>🏪 Farm Self-Pickup</span>
                                            <p className='text-xs font-bold'>Customer will drive to your farm location to collect.</p>
                                            <p className='text-[11px] opacity-80'>Verify produce freshness and quality with the buyer together before delivery.</p>
                                        </div>
                                    ) : (
                                        <div className='p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-blue-900 space-y-1'>
                                            <span className='font-bold text-[10px] uppercase tracking-wider block text-blue-800'>🚚 Home Dispatch Route</span>
                                            <p className='text-xs font-semibold'>Delivery Slot: <span className='font-bold capitalize'>{order.delivery_slot || 'Standard'} (Morning/Evening)</span></p>
                                            {order.delivery_address && (
                                                <p className='text-[11px] opacity-80 truncate'>Dest: {order.delivery_address.address_line}, {order.delivery_address.city}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className='flex gap-2 items-center justify-end'>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowSlip(order)} 
                                            className='border border-gray-200 hover:border-desikit-green hover:text-desikit-green text-xs font-semibold px-4 py-2.5 rounded-xl transition'
                                        >
                                            📋 View Packing Slip
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items list */}
                                <div className='space-y-2.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block'>Harvest Items to Package</span>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className='flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-b-0'>
                                            <div className='flex items-center gap-3'>
                                                <img src={item.image[0]} className='w-9 h-9 rounded-xl object-cover border' />
                                                <div>
                                                    <span className='font-semibold text-gray-800 block'>{item.name}</span>
                                                    <span className='text-[10px] text-gray-400 font-semibold'>₹{item.price} per unit</span>
                                                </div>
                                            </div>
                                            <span className='font-extrabold text-desikit-dark bg-white py-1 px-3 rounded-lg border border-gray-200'>Qty: {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dispatch and status updates console */}
                                <div className='flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-gray-100/60'>
                                    <div className='space-x-2'>
                                        {order.status === 'placed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.orderId, 'confirmed')}
                                                className='bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10'
                                            >
                                                Confirm Harvest Booking
                                            </button>
                                        )}
                                        {(order.status === 'placed' || order.status === 'confirmed') && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.orderId, 'packed')}
                                                className='bg-desikit-green hover:bg-leaf-green text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-desikit-green/10'
                                            >
                                                Mark Items as Packed
                                            </button>
                                        )}
                                    </div>

                                    {/* Courier Assignment panel */}
                                    {!isPickup && order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <div className='flex items-center gap-3 bg-milk-cream p-2 rounded-2xl border border-desikit-soft'>
                                            <label className='text-[10px] font-bold text-gray-500 uppercase px-1'>Assign Dispatch:</label>
                                            {order.delivery_partner_id ? (
                                                <span className='text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-xl border border-green-200'>
                                                    🏍️ {order.delivery_partner_id.name || 'Partner'}
                                                </span>
                                            ) : (
                                                <select
                                                    onChange={(e) => handleAssignPartner(order.orderId, e.target.value)}
                                                    className='border text-xs rounded-xl px-3 py-1 outline-none focus:border-desikit-green bg-white cursor-pointer font-bold text-gray-700'
                                                    defaultValue=''
                                                >
                                                    <option value='' disabled>-- Select Courier --</option>
                                                    {partners.map(p => <option key={p._id} value={p._id}>{p.name} ({p.vehicle_number || 'Bike'})</option>)}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='bg-white p-12 text-center rounded-3xl border border-desikit-soft shadow-sm max-w-md mx-auto'>
                    <span className='text-5xl'>🌾</span>
                    <h3 className='font-bold text-desikit-dark text-lg mt-4'>No Orders Yet</h3>
                    <p className='text-xs text-gray-500 mt-2'>No customer orders contain your farm products currently. Ensure your products are listed as active in inventory.</p>
                </div>
            )}

            {/* Simulated Invoice Slip Modal */}
            {showSlip && (
                <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative border border-desikit-soft'>
                        <button 
                            type="button" 
                            onClick={() => setShowSlip(null)} 
                            className='absolute right-5 top-5 text-gray-400 hover:text-desikit-dark text-xl font-bold'
                        >
                            ✕
                        </button>
                        
                        <div className='text-center space-y-1.5 border-b pb-4'>
                            <span className='text-2xl'>🚜</span>
                            <h2 className='font-black text-desikit-dark text-xl tracking-tight'>DesiKit Farm Packing Slip</h2>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>Harvest Checklist & Label</p>
                        </div>

                        <div className='space-y-3 text-xs text-gray-600'>
                            <div className='flex justify-between font-mono'>
                                <span>Slip Ref ID:</span>
                                <span className='font-bold text-desikit-dark'>{showSlip.orderId}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Date Issued:</span>
                                <span className='font-semibold'>{new Date(showSlip.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Fulfillment Mode:</span>
                                <span className='font-bold text-desikit-green uppercase'>{showSlip.delivery_type === 'pickup' ? 'Self-Pickup' : 'Home Delivery'}</span>
                            </div>
                        </div>

                        <div className='border-t border-b border-dashed border-gray-200 py-4 space-y-3'>
                            <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>Checklist Items</p>
                            {showSlip.items.map((item, idx) => (
                                <div key={idx} className='flex items-center gap-3 text-sm'>
                                    <input type="checkbox" className='accent-desikit-green h-4 w-4 rounded cursor-pointer' />
                                    <span className='flex-1 font-semibold text-gray-800'>{item.name}</span>
                                    <span className='font-black bg-gray-50 border px-3 py-0.5 rounded-lg'>x {item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className='text-center'>
                            <button 
                                type="button" 
                                onClick={() => {
                                    window.print();
                                    setShowSlip(null);
                                }} 
                                className='bg-desikit-green hover:bg-leaf-green text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition'
                            >
                                🖨️ Print Packing Label
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerOrders;
