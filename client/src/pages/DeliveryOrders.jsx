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

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const farmMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    
    const [riderCoords, setRiderCoords] = useState({ lat: 31.2519, lon: 75.7037 });
    const [farmCoords, setFarmCoords] = useState({ lat: 31.2560, lon: 75.7050 });
    const [destCoords, setDestCoords] = useState({ lat: 31.2480, lon: 75.7010 });

    // Load Leaflet Script
    useEffect(() => {
        const linkId = 'leaflet-css';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const scriptId = 'leaflet-js';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setLeafletLoaded(true);
            document.body.appendChild(script);
        } else {
            if (window.L) setLeafletLoaded(true);
        }
    }, []);

    // Geocode active order coordinates
    useEffect(() => {
        const activeOrder = orders.find(o => o.status === 'out_for_delivery');
        if (!activeOrder) return;

        const geocode = async () => {
            try {
                if (activeOrder.farm_address) {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(activeOrder.farm_address + ", India")}&format=json&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setFarmCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                    }
                }
                if (activeOrder.delivery_address) {
                    const addrStr = `${activeOrder.delivery_address.address_line || ''}, ${activeOrder.delivery_address.city || ''}, India`;
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addrStr)}&format=json&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setDestCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                    }
                }
            } catch (err) {
                console.error("Rider side geocoding failed:", err);
            }
        };
        geocode();
    }, [orders]);

    // Initialize Map and Markers
    useEffect(() => {
        if (!leafletLoaded || !window.L) return;

        const mapContainerId = 'rider-route-map';
        const container = document.getElementById(mapContainerId);
        if (!container) return;

        if (!mapRef.current) {
            mapRef.current = window.L.map(mapContainerId).setView([riderCoords.lat, riderCoords.lon], 14);

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);

            farmMarkerRef.current = window.L.marker([farmCoords.lat, farmCoords.lon], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 24px;">🌾</span>',
                    className: 'dummy-class',
                    iconSize: [24, 24]
                })
            }).addTo(mapRef.current).bindPopup('Farm Pickup');

            destMarkerRef.current = window.L.marker([destCoords.lat, destCoords.lon], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 24px;">🏠</span>',
                    className: 'dummy-class',
                    iconSize: [24, 24]
                })
            }).addTo(mapRef.current).bindPopup('Customer Destination');

            markerRef.current = window.L.marker([riderCoords.lat, riderCoords.lon], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 28px;">🛵</span>',
                    className: 'dummy-class',
                    iconSize: [28, 28]
                })
            }).addTo(mapRef.current).bindPopup('Your Live Location').openPopup();

            polylineRef.current = window.L.polyline([
                [farmCoords.lat, farmCoords.lon],
                [riderCoords.lat, riderCoords.lon],
                [destCoords.lat, destCoords.lon]
            ], { color: '#2563eb', weight: 4, dashArray: '5, 5' }).addTo(mapRef.current);
        } else {
            if (farmMarkerRef.current) farmMarkerRef.current.setLatLng([farmCoords.lat, farmCoords.lon]);
            if (destMarkerRef.current) destMarkerRef.current.setLatLng([destCoords.lat, destCoords.lon]);
            if (markerRef.current) {
                markerRef.current.setLatLng([riderCoords.lat, riderCoords.lon]);
                mapRef.current.panTo([riderCoords.lat, riderCoords.lon]);
            }
            if (polylineRef.current) {
                polylineRef.current.setLatLngs([
                    [farmCoords.lat, farmCoords.lon],
                    [riderCoords.lat, riderCoords.lon],
                    [destCoords.lat, destCoords.lon]
                ]);
            }
        }
    }, [leafletLoaded, riderCoords, farmCoords, destCoords]);


    useEffect(() => {
        const activeOrder = orders.find(o => o.status === 'out_for_delivery');
        if (!activeOrder || !navigator.geolocation) return;

        // Initialize Socket connection
        let socketInstance = null;
        if (window.io) {
            socketInstance = window.io(import.meta.env.VITE_API_URL || 'http://localhost:8080');
            socketInstance.emit('joinOrderTracker', activeOrder.orderId);
        }

        const handleSuccess = async (position) => {
            const { latitude, longitude } = position.coords;
            setRiderCoords({ lat: latitude, lon: longitude });
            try {
                // Keep backend REST updated (for persistence/refreshes)
                await Axios.put('/api/delivery/location', {
                    lat: latitude,
                    lng: longitude
                });

                // Emit real-time update via socket for instant client movement
                if (socketInstance) {
                    socketInstance.emit('riderLocationUpdate', {
                        orderId: activeOrder.orderId,
                        lat: latitude,
                        lng: longitude
                    });
                }
            } catch (err) {
                console.error("Failed to update rider location:", err);
            }
        };

        const handleError = (error) => {
            console.error("Error watching geolocation:", error);
            toast.error("GPS Access Denied. Please enable location permissions for real-time tracking.");
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 5000
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (socketInstance) {
                socketInstance.disconnect();
            }
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
                    <div id="rider-route-map" className="h-[250px] w-full rounded-xl border z-10" style={{ minHeight: '250px' }}>
                        {!leafletLoaded && (
                            <div className="h-full flex items-center justify-center bg-gray-50 text-xs font-semibold text-gray-400">
                                Initializing Live GPS Route Map...
                            </div>
                        )}
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
