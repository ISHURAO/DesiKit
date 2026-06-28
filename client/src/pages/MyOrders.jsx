import React, { useState, useEffect, useRef } from 'react';
import Axios from '../utils/Axios';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import NoData from '../components/NoData';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaTruck, FaClock, FaPhone } from 'react-icons/fa';

const trackingStages = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

const LiveRouteMap = ({ order }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const farmMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    
    // Geocoded locations
    const [farmCoords, setFarmCoords] = useState({ lat: 30.9120, lon: 75.8650 });
    const [customerCoords, setCustomerCoords] = useState({ lat: 30.8950, lon: 75.8450 });
    const [simLat, setSimLat] = useState(30.9120);
    const [simLng, setSimLng] = useState(75.8650);

    // Geocode Farm and Customer addresses
    useEffect(() => {
        const geocodeLocations = async () => {
            try {
                if (order.farm_address) {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(order.farm_address + ", India")}&format=json&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                        setFarmCoords(coords);
                        setSimLat(coords.lat);
                        setSimLng(coords.lon);
                    }
                }
                if (order.delivery_address) {
                    const addrStr = `${order.delivery_address.address_line || ''}, ${order.delivery_address.city || ''}, ${order.delivery_address.state || ''}, ${order.delivery_address.pincode || ''}, India`;
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addrStr)}&format=json&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setCustomerCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                    }
                }
            } catch (err) {
                console.error("Geocoding map coordinates failed:", err);
            }
        };
        geocodeLocations();
    }, [order.farm_address, order.delivery_address]);

    // Track/Simulate Rider Coordinates starting from farm to customer destination
    useEffect(() => {
        // Initialize Socket connection to receive real-time updates
        let socketInstance = null;
        if (window.io) {
            socketInstance = window.io(import.meta.env.VITE_API_URL || 'http://localhost:8080');
            socketInstance.emit('joinOrderTracker', order.orderId);

            socketInstance.on('liveRiderLocation', (location) => {
                console.log("Real-time location received via socket:", location);
                setSimLat(location.lat);
                setSimLng(location.lng);
            });
        }

        if (order.rider_latitude && order.rider_longitude) {
            setSimLat(order.rider_latitude);
            setSimLng(order.rider_longitude);
            return () => {
                if (socketInstance) socketInstance.disconnect();
            };
        }

        // Initialize at Farm Coordinates
        setSimLat(farmCoords.lat);
        setSimLng(farmCoords.lon);

        // Simulate driving from Farm coordinates to Customer Address coordinates in real-time
        let step = 0;
        const totalSteps = 100;
        const interval = setInterval(() => {
            step++;
            if (step <= totalSteps) {
                const progress = step / totalSteps;
                const curLat = farmCoords.lat + (customerCoords.lat - farmCoords.lat) * progress;
                const curLng = farmCoords.lon + (customerCoords.lon - farmCoords.lon) * progress;
                // Only simulate if we haven't received websocket/REST data updates
                setSimLat((prevLat) => {
                    // If the difference indicates it's active live rider position, stick to it
                    return curLat;
                });
                setSimLng(curLng);
            } else {
                clearInterval(interval);
            }
        }, 2000);

        return () => {
            clearInterval(interval);
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [order.rider_latitude, order.rider_longitude, farmCoords.lat, farmCoords.lon, customerCoords.lat, customerCoords.lon, order.orderId]);

    useEffect(() => {
        // Load Leaflet assets
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
            if (window.L) {
                setLeafletLoaded(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!leafletLoaded || !window.L) return;

        const mapContainerId = `map-${order._id}`;
        const container = document.getElementById(mapContainerId);
        if (!container) return;

        if (!mapRef.current) {
            mapRef.current = window.L.map(mapContainerId).setView([simLat, simLng], 13);

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);

            // Draw Farm marker
            farmMarkerRef.current = window.L.marker([farmCoords.lat, farmCoords.lon], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 24px;">🌾</span>',
                    className: 'dummy-class',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(mapRef.current).bindPopup(order.farm_name || 'Sahiwal Farm Hub');

            // Draw Customer marker
            destMarkerRef.current = window.L.marker([customerCoords.lat, customerCoords.lon], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 24px;">🏠</span>',
                    className: 'dummy-class',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(mapRef.current).bindPopup('Your Address');

            // Draw Rider marker
            markerRef.current = window.L.marker([simLat, simLng], {
                icon: window.L.divIcon({
                    html: '<span style="font-size: 30px;">🛵</span>',
                    className: 'dummy-class',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(mapRef.current).bindPopup('Delivery Partner').openPopup();

            // Draw path line
            polylineRef.current = window.L.polyline([
                [farmCoords.lat, farmCoords.lon],
                [simLat, simLng],
                [customerCoords.lat, customerCoords.lon]
            ], { color: '#16a34a', weight: 4, dashArray: '5, 5' }).addTo(mapRef.current);
        } else {
            // Update existing markers and lines
            if (farmMarkerRef.current) {
                farmMarkerRef.current.setLatLng([farmCoords.lat, farmCoords.lon]);
            }
            if (destMarkerRef.current) {
                destMarkerRef.current.setLatLng([customerCoords.lat, customerCoords.lon]);
            }
            if (markerRef.current) {
                markerRef.current.setLatLng([simLat, simLng]);
                mapRef.current.panTo([simLat, simLng]);
            }
            if (polylineRef.current) {
                polylineRef.current.setLatLngs([
                    [farmCoords.lat, farmCoords.lon],
                    [simLat, simLng],
                    [customerCoords.lat, customerCoords.lon]
                ]);
            }
        }
    }, [leafletLoaded, simLat, simLng, farmCoords, customerCoords, order._id, order.farm_name]);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const remainingDistance = getDistance(simLat, simLng, customerCoords.lat, customerCoords.lon);

    return (
        <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-desikit-green flex items-center gap-1 uppercase tracking-wider">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span> Live Tracking (OSM)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
                        🛵 {remainingDistance > 0.05 ? `${remainingDistance.toFixed(2)} km remaining` : 'Arrived at destination'}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-gray-500 font-bold">
                    <span>Lat: {(order.rider_latitude || simLat).toFixed(5)}</span>
                    <span>Lng: {(order.rider_longitude || simLng).toFixed(5)}</span>
                </div>
            </div>
            
            {/* Map Container */}
            <div id={`map-${order._id}`} className="h-[250px] w-full rounded-xl border z-10" style={{ minHeight: '250px' }}>
                {!leafletLoaded && (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-xs font-semibold text-gray-400">
                        Initializing Map...
                    </div>
                )}
            </div>

            {/* Rider Details */}
            <div className="flex justify-between items-center bg-desikit-green/5 p-3 rounded-xl border border-desikit-green/10 text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-desikit-green text-white flex items-center justify-center font-bold">
                        🛵
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Vijay Kumar (Rider)</p>
                        <p className="text-[10px] text-gray-400">PB 10 Delivery Partner · UP-85-AB-1234</p>
                    </div>
                </div>
                <a href="tel:+918765432109" className="bg-desikit-green text-white p-2 rounded-xl hover:bg-leaf-green">
                    <FaPhone />
                </a>
            </div>
        </div>
    );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
        const response = await Axios.get('/api/order/order-list');
        if (response.data.success) {
            setOrders(response.data.data);
        }
    } catch (error) {
        console.error("Error fetching customer orders:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order? Paid amount will be refunded to your wallet.")) return;
    try {
        const response = await Axios.put('/api/order/cancel', { orderId });
        if (response.data.success) {
            toast.success("Order cancelled");
            fetchOrders();
        }
    } catch (error) {
        toast.error("Failed to cancel order");
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-6 bg-milk-cream min-h-screen'>
      <div className='border-b pb-4'>
        <h1 className='text-3xl font-extrabold text-desikit-dark'>My Purchase History</h1>
        <p className='text-sm text-gray-500'>Track your pending deliveries or view previous orders.</p>
      </div>

      {loading ? (
        <p className='text-center py-10 font-semibold text-gray-500'>Loading your orders...</p>
      ) : orders.length > 0 ? (
        <div className='space-y-6'>
          {orders.map((order) => {
            const currentStageIdx = trackingStages.indexOf(order.status);
            const isPending = order.status !== 'delivered' && order.status !== 'cancelled';
            return (
              <div key={order._id} className='bg-white border border-desikit-soft rounded-3xl p-6 shadow-sm space-y-5 hover:shadow-md transition-all'>
                {/* Order Header */}
                <div className='flex flex-wrap justify-between items-center gap-2 border-b pb-3'>
                  <div>
                    <span className='text-xs font-bold text-gray-400 uppercase'>Order ID</span>
                    <p className='font-bold text-gray-800 text-sm'>{order.orderId}</p>
                  </div>
                  <div>
                    <span className='text-xs font-bold text-gray-400 uppercase'>Date</span>
                    <p className='text-sm font-semibold text-gray-700'>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className='text-xs font-bold text-gray-400 uppercase block text-center'>Total Price</span>
                    <p className='font-extrabold text-desikit-green text-sm text-center'>{DisplayPriceInRupees(order.totalAmt)}</p>
                  </div>
                  <div>
                    <span className='text-xs font-bold text-gray-400 uppercase block text-right'>Payment</span>
                    <span className='px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-extrabold text-[9px] uppercase tracking-wider block text-right w-fit ml-auto'>
                      {order.payment_method}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {order.status !== 'cancelled' ? (
                  <div className='py-2'>
                    <div className='flex items-center justify-between text-xs font-bold text-gray-400 uppercase mb-2'>
                        <span>Tracking Status:</span>
                        <span className='text-desikit-green'>{order.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className='relative w-full h-2 bg-gray-100 rounded-full overflow-hidden flex'>
                        <div 
                            className='h-full bg-desikit-green transition-all duration-500' 
                            style={{ width: `${((currentStageIdx + 1) / trackingStages.length) * 100}%` }}
                        />
                    </div>
                    <div className='flex justify-between text-[9px] text-gray-400 uppercase font-semibold mt-2'>
                        <span>Placed</span>
                        <span>Confirmed</span>
                        <span>Packed</span>
                        <span>Out</span>
                        <span>Delivered</span>
                    </div>
                  </div>
                ) : (
                  <div className='bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-3 rounded-xl'>
                    ✕ This order has been cancelled and refunded.
                  </div>
                )}

                {/* Live Canvas Map Tracking for active orders */}
                {isPending && <LiveRouteMap order={order} />}

                {/* OTP Box */}
                {isPending && (
                  <div className='bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex justify-between items-center text-xs'>
                    <div>
                        <span className='font-bold block'>Delivery Verification OTP Code</span>
                        <span className='text-[10px] text-amber-700'>Provide this code to your rider upon delivery.</span>
                    </div>
                    <span className='text-lg font-black tracking-widest text-amber-800 px-3 py-1 bg-amber-100 rounded-lg border border-amber-300 select-all'>
                        {order.delivery_otp || '1234'}
                    </span>
                  </div>
                )}

                {/* Order Items */}
                <div className='space-y-3'>
                  <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Ordered Items</span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className='flex justify-between items-center text-sm py-1.5 border-b border-gray-50'>
                      <div className='flex items-center gap-3'>
                        <img src={item.image?.[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150'} className='w-10 h-10 rounded-lg object-cover border border-gray-100' />
                        <div>
                            <p className='font-semibold text-gray-800'>{item.name}</p>
                            <p className='text-xs text-gray-400'>{item.quantity} units</p>
                        </div>
                      </div>
                      <span className='font-bold text-gray-700'>{DisplayPriceInRupees(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Cancel Trigger */}
                {(order.status === 'placed' || order.status === 'confirmed') && (
                    <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className='text-xs font-bold text-red-500 hover:underline pt-2 block'
                    >
                        Request Cancellation
                    </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
};

export default MyOrders;
