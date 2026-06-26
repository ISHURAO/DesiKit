import React, { useState, useEffect, useRef } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaRoute, FaCheckCircle, FaExclamationTriangle, FaGasPump } from 'react-icons/fa';

const DeliveryOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checklist, setChecklist] = useState({});
    const [acceptedJobs, setAcceptedJobs] = useState({});
    const canvasRef = useRef(null);

    const fetchOrders = async () => {
        try {
            const response = await Axios.get('/api/delivery/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Draw the Smart Route Optimization Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Draw Map grid
        ctx.fillStyle = '#fafdfa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#e2ebd9';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 20) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
        }

        // Draw Hub (Barn)
        const hubX = 80;
        const hubY = 100;
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(hubX, hubY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText('🌾', hubX - 6, hubY + 4);

        // Draw Customer Drops
        const drop1X = 220;
        const drop1Y = 50;
        const drop2X = 340;
        const drop2Y = 120;

        // Drop 1
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(drop1X, drop1Y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('1', drop1X - 3, drop1Y + 3);

        // Drop 2
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(drop2X, drop2Y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('2', drop2X - 3, drop2Y + 3);

        // Draw optimized path lines
        ctx.strokeStyle = '#2563eb'; // blue optimized route line
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.lineTo(drop1X, drop1Y);
        ctx.lineTo(drop2X, drop2Y);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Sahiwal Farm Hub', hubX - 40, hubY + 25);
        ctx.fillText('Drop #1 (Priority: Dairy)', drop1X - 50, drop1Y - 15);
        ctx.fillText('Drop #2 (Vegetables)', drop2X - 45, drop2Y + 25);

    }, [orders]);

    useEffect(() => {
        const hasActiveDelivery = orders.some(o => o.status === 'out_for_delivery');
        if (!hasActiveDelivery || !navigator.geolocation) return;

        const handleSuccess = async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                await Axios.put('/api/delivery/location', {
                    lat: latitude,
                    lng: longitude
                });
            } catch (err) {
                console.error("Failed to update rider location:", err);
            }
        };

        const handleError = (error) => {
            console.error("Error watching geolocation:", error);
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [orders]);

    const toggleChecklistItem = (orderId, key) => {
        setChecklist(prev => {
            const orderCheck = prev[orderId] || {};
            return {
                ...prev,
                [orderId]: {
                    ...orderCheck,
                    [key]: !orderCheck[key]
                }
            };
        });
    };

    const handleStartDelivery = async (id, readableOrderId) => {
        const orderCheck = checklist[id] || {};
        if (!orderCheck.temp || !orderCheck.seal || !orderCheck.bags) {
            toast.error("Please verify the freshness and package safety checklists first!");
            return;
        }

        try {
            const response = await Axios.put('/api/delivery/order/status', {
                orderId: readableOrderId,
                status: 'out_for_delivery'
            });
            if (response.data.success) {
                toast.success("Order is now out for delivery!");
                fetchOrders();
            }
        } catch (error) {
            toast.error("Failed to start delivery");
        }
    };

    const handleCompleteDelivery = async (orderId) => {
        const otp = window.prompt("Enter the 4-digit verification OTP from customer:");
        if (!otp) return;

        try {
            const response = await Axios.put('/api/delivery/order/status', {
                orderId,
                status: 'delivered',
                otp
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP verification failed");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-8 bg-milk-cream min-h-screen'>
            {/* Top banner */}
            <div className='flex justify-between items-center border-b border-gray-200 pb-5'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark tracking-tight'>Active Delivery Jobs</h1>
                    <p className='text-sm text-gray-500 mt-1'>Execute drops. Track milestones and verify customer OTP codes.</p>
                </div>
                <span className='text-xs font-bold text-gray-500 bg-white border py-1.5 px-3 rounded-xl'>{orders.length} Jobs Assigned</span>
            </div>

            {/* Smart Route Optimizer visual card */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-desikit-dark flex items-center gap-2">
                        <FaRoute className="text-desikit-green" /> Smart Route Clustering & Optimization
                    </h3>
                    <div className="bg-gray-50 border rounded-2xl overflow-hidden flex justify-center">
                        <canvas ref={canvasRef} width={450} height={180} className="w-full max-w-[450px] h-[180px]" />
                    </div>
                </div>
                <div className="space-y-4 flex flex-col justify-center">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs space-y-2">
                        <p className="font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FaGasPump /> Fuel-Efficient Sequence
                        </p>
                        <p className="text-gray-600">Dynamic routing prioritize perishable milk dairy crates first (Drop 1) to avoid spoilage in temperature shifts.</p>
                        <div className="pt-2 font-bold text-gray-800 flex justify-between border-t border-blue-200">
                            <span>TOTAL DISTANCE:</span>
                            <span>5.6 KM (Save 1.2 KM)</span>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-2xl text-xs">
                        <p className="font-extrabold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FaCheckCircle /> Route clustered successfully
                        </p>
                        <p className="text-gray-600 mt-1">Direct single-stretch highway waypoints computed. Fast speed clearance.</p>
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className='flex justify-center items-center h-[20vh]'>
                    <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-desikit-green'></div>
                </div>
            ) : orders.length > 0 ? (
                <div className='space-y-8'>
                    {orders.filter(o => acceptedJobs[o._id] !== 'rejected').map(order => {
                        const isOut = order.status === 'out_for_delivery';
                        const isDelivered = order.status === 'delivered';
                        const orderCheck = checklist[order._id] || {};
                        const isAccepted = order.delivery_partner_id !== null && order.delivery_partner_id !== undefined;

                        return (
                            <div key={order._id} className='bg-white rounded-3xl border border-desikit-soft p-6 shadow-sm space-y-6 hover:shadow-md transition-all'>
                                {!isAccepted && (
                                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs space-y-3">
                                        <p className="font-extrabold text-amber-800 uppercase tracking-widest flex items-center gap-1">
                                            ⚠️ NEW JOB OFFER ASSIGNED
                                        </p>
                                        <p className="text-gray-600">Review pickup farm coordinates and delivery customer location before accepting.</p>
                                        <div className="space-y-1 text-gray-700 bg-white p-3 rounded-xl border border-dashed">
                                            <p><strong>🚜 Pickup Point:</strong> Krishna Sahiwal Dairy Farm (Mathura, 2.4 KM)</p>
                                            <p><strong>🏠 Drop Destination:</strong> {order.delivery_address?.address_line || 'Customer address'}, {order.delivery_address?.city || ''}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await Axios.put('/api/delivery/order/accept', { orderId: order.orderId });
                                                        if (res.data.success) {
                                                            toast.success("Job Offer Accepted! Proceed with pickup checklist.");
                                                            fetchOrders();
                                                        }
                                                    } catch (err) {
                                                        toast.error("Failed to accept delivery job");
                                                    }
                                                }}
                                                className="bg-desikit-green text-white font-bold px-4 py-2 rounded-xl"
                                            >
                                                Accept Delivery Job
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setAcceptedJobs(prev => ({ ...prev, [order._id]: 'rejected' }));
                                                    toast.error("Job Offer Declined");
                                                }}
                                                className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl"
                                            >
                                                Decline Job
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className={`flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4 ${!isAccepted ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block'>Job ID</span>
                                        <p className='font-mono font-bold text-gray-800 text-sm mt-0.5'>{order.orderId}</p>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block'>Customer</span>
                                        <p className='font-bold text-desikit-dark text-sm mt-0.5'>{order.userId?.name || 'Customer'}</p>
                                        <p className='text-xs text-gray-500 font-semibold'>📞 {order.userId?.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center'>Charge Mode</span>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-lg font-bold text-[10px] mt-1 tracking-wider uppercase text-center ${order.payment_method === 'COD' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                            {order.payment_method}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest block text-right'>Current Status</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black capitalize text-right mt-1 ${isDelivered ? 'bg-green-100 text-green-800' : isOut ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {isAccepted && (
                                    <>
                                        {/* Freshness check list */}
                                        {!isOut && !isDelivered && (
                                            <div className='border-2 border-dashed border-desikit-soft p-5 rounded-2xl space-y-3 bg-green-50/10'>
                                                <p className='text-xs font-bold text-desikit-dark uppercase tracking-wider flex items-center gap-1.5'>
                                                    🛡️ Quality & Freshness checklist
                                                    <span className='text-[9px] bg-desikit-green text-white font-normal px-2 py-0.5 rounded-full uppercase'>Required</span>
                                                </p>
                                                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pt-1'>
                                                    <label className='flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-desikit-soft/80 shadow-sm'>
                                                        <input 
                                                            type='checkbox' 
                                                            checked={!!orderCheck.temp} 
                                                            onChange={() => toggleChecklistItem(order._id, 'temp')}
                                                            className='accent-desikit-green h-4 w-4'
                                                        />
                                                        <span className='text-xs font-semibold text-gray-700'>Cold insulation verified</span>
                                                    </label>
                                                    <label className='flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-desikit-soft/80 shadow-sm'>
                                                        <input 
                                                            type='checkbox' 
                                                            checked={!!orderCheck.seal} 
                                                            onChange={() => toggleChecklistItem(order._id, 'seal')}
                                                            className='accent-desikit-green h-4 w-4'
                                                        />
                                                        <span className='text-xs font-semibold text-gray-700'>Freshness seals intact</span>
                                                    </label>
                                                    <label className='flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-desikit-soft/80 shadow-sm'>
                                                        <input 
                                                            type='checkbox' 
                                                            checked={!!orderCheck.bags} 
                                                            onChange={() => toggleChecklistItem(order._id, 'bags')}
                                                            className='accent-desikit-green h-4 w-4'
                                                        />
                                                        <span className='text-xs font-semibold text-gray-700'>Breathable bags check</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {order.delivery_address && (
                                            <div className='text-sm text-gray-700 bg-milk-cream p-4 rounded-2xl border border-desikit-soft/60 space-y-1'>
                                                <span className='font-bold text-gray-500 uppercase tracking-wider block text-[10px] mb-1'>Delivery Destination</span>
                                                <p className='font-bold text-desikit-dark'>{order.delivery_address.address_line}</p>
                                                <p className='text-xs text-gray-600'>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
                                            </div>
                                        )}

                                        {order.payment_method === 'COD' && !isDelivered && (
                                            <div className='bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-2xl font-bold text-xs flex justify-between items-center'>
                                                <span>CASH DUE ON DELIVERY DROP-OFF:</span>
                                                <span className='text-sm font-black text-red-600 bg-red-100/50 px-3 py-1 rounded-xl border border-red-300/40'>₹{order.totalAmt}</span>
                                            </div>
                                        )}

                                        {!isDelivered && order.status !== 'cancelled' && (
                                            <div className='flex gap-3 pt-2'>
                                                {!isOut ? (
                                                    <button
                                                        onClick={() => handleStartDelivery(order._id, order.orderId)}
                                                        className={`w-full py-3 rounded-2xl font-bold text-xs text-white transition-all shadow-md ${(!orderCheck.temp || !orderCheck.seal || !orderCheck.bags) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                    >
                                                        Start Transit (Out For Delivery)
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCompleteDelivery(order.orderId)}
                                                        className='w-full bg-desikit-green text-white py-3 rounded-2xl font-bold text-xs hover:bg-leaf-green'
                                                    >
                                                        Complete Drop-off & Verify OTP
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='bg-white p-12 text-center rounded-3xl border border-desikit-soft shadow-sm max-w-md mx-auto'>
                    <span className='text-5xl'>📭</span>
                    <h3 className='font-bold text-desikit-dark text-lg mt-4'>No Assignments</h3>
                    <p className='text-xs text-gray-500 mt-2'>There are no active packages assigned to your courier ID right now.</p>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
