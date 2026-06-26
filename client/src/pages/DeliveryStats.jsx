import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const DeliveryStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehicleDetails, setVehicleDetails] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [simLat, setSimLat] = useState('28.6139');
    const [simLng, setSimLng] = useState('77.2090');

    const fetchStats = async () => {
        try {
            const response = await Axios.get('/api/delivery/stats');
            if (response.data.success) {
                setStats(response.data.data);
                setVehicleDetails(response.data.data.vehicle_details || '');
                setVehicleNumber(response.data.data.vehicle_number || '');
                if (response.data.data.live_location) {
                    setSimLat(response.data.data.live_location.lat.toString());
                    setSimLng(response.data.data.live_location.lng.toString());
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await Axios.put('/api/delivery/verify', {
                vehicle_details: vehicleDetails,
                vehicle_number: vehicleNumber
            });
            if (response.data.success) {
                toast.success("Courier verification request submitted!");
                fetchStats();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleUpdateLocation = async (e) => {
        if(e) e.preventDefault();
        try {
            const response = await Axios.put('/api/delivery/location', {
                lat: parseFloat(simLat),
                lng: parseFloat(simLng)
            });
            if (response.data.success) {
                toast.success("Live coordinates updated successfully!");
                fetchStats();
            }
        } catch (error) {
            toast.error("Failed to update coordinates");
        }
    };

    const applyGPSPreset = (lat, lng, name) => {
        setSimLat(lat);
        setSimLng(lng);
        toast.success(`Preset loaded: ${name}`);
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[50vh]'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-desikit-green'></div>
            </div>
        );
    }

    return (
        <div className='p-6 max-w-6xl mx-auto space-y-8'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark tracking-tight'>Rider Command Panel</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage transit logs, simulate GPS positioning, and view delivery earnings.</p>
                </div>
                {stats?.verified === 'approved' && (
                    <div className='flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-2xl text-sm font-bold w-fit'>
                        <span className='h-2 w-2 rounded-full bg-green-500 animate-ping'></span>
                        Rider Active & Online
                    </div>
                )}
            </div>

            {stats && stats.verified !== 'approved' && (
                <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-all ${stats.verified === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div>
                        <p className='text-sm font-bold uppercase tracking-wider'>Courier Verification Status</p>
                        <p className='text-xl font-black mt-1 capitalize'>{stats.verified}</p>
                        {stats.verified === 'pending' && <p className='text-sm mt-1 opacity-90'>Our admins are currently checking your driver license copy. You will be cleared to drive shortly.</p>}
                        {stats.verified === 'rejected' && <p className='text-sm mt-1 opacity-90'>Licensing check rejected. Please adjust driver credentials below.</p>}
                    </div>
                </div>
            )}

            {/* Rider Stats Blocks */}
            {stats && stats.verified === 'approved' && (
                <div className='grid gap-6 grid-cols-1 md:grid-cols-4'>
                    <div className='bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-3xl border border-green-200/60 shadow-sm relative overflow-hidden'>
                        <p className='text-xs text-green-700 font-bold uppercase tracking-wider'>Net Earnings</p>
                        <p className='text-3xl font-black text-desikit-green mt-2'>₹{stats.earnings}</p>
                        <div className='text-xs text-green-600 mt-2 font-semibold'>₹45.00 avg per delivery</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Completed Jobs</p>
                        <p className='text-3xl font-black text-gray-800 mt-2'>{stats.totalDeliveries}</p>
                        <div className='text-xs text-gray-500 mt-2'>Successful drop-offs</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Active Deliveries</p>
                        <p className='text-3xl font-black text-amber-500 mt-2'>{stats.activeDeliveries}</p>
                        <div className='text-xs text-gray-500 mt-2'>Packages in transit</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Customer Rating</p>
                        <p className='text-3xl font-black text-gray-800 mt-2'>4.9 ★</p>
                        <div className='text-xs text-gray-500 mt-2'>Based on last 50 ratings</div>
                    </div>
                </div>
            )}

            {/* GPS Simulation Panel */}
            {stats && stats.verified === 'approved' && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Simulator Map View */}
                    <div className='lg:col-span-2 bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm space-y-4'>
                        <div>
                            <h3 className='font-bold text-desikit-dark text-lg'>Live GPS Simulator Map</h3>
                            <p className='text-xs text-gray-500 mt-0.5'>Update your coordinates so consumers see your live movement on their order screens.</p>
                        </div>
                        {/* Simulation Graphic */}
                        <div className='bg-slate-100 rounded-2xl h-56 flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden bg-cover bg-center' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800')" }}>
                            <div className='absolute inset-0 bg-black/40'></div>
                            <div className='relative z-10 flex flex-col items-center text-white text-center p-4'>
                                <span className='text-4xl animate-bounce'>🛵</span>
                                <p className='font-black mt-2 text-base'>Active Routing Simulation</p>
                                <p className='text-xs opacity-80 font-mono mt-1'>Position: {simLat}° N , {simLng}° E</p>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Quick-Movement Presets (Click to Load):</p>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                                <button type="button" onClick={() => applyGPSPreset("27.4924", "77.6737", "Mathura Organic Dairy")} className='text-[11px] bg-milk-cream border border-desikit-soft py-2 px-3 rounded-xl font-bold hover:border-desikit-green transition text-left'>🐄 Krishna Dairy Farm</button>
                                <button type="button" onClick={() => applyGPSPreset("28.6139", "77.2090", "Connaught Place Hub")} className='text-[11px] bg-milk-cream border border-desikit-soft py-2 px-3 rounded-xl font-bold hover:border-desikit-green transition text-left'>🏢 New Delhi Hub</button>
                                <button type="button" onClick={() => applyGPSPreset("27.5002", "77.6811", "National Highway Crossing")} className='text-[11px] bg-milk-cream border border-desikit-soft py-2 px-3 rounded-xl font-bold hover:border-desikit-green transition text-left'>🛣️ Mathura Highway</button>
                                <button type="button" onClick={() => applyGPSPreset("27.4950", "77.6780", "Phagwara Customer Address")} className='text-[11px] bg-milk-cream border border-desikit-soft py-2 px-3 rounded-xl font-bold hover:border-desikit-green transition text-left'>🏠 Customer Drop-off</button>
                            </div>
                        </div>
                    </div>

                    {/* Rider Badges & Transit Logs */}
                    <div className='bg-gradient-to-br from-desikit-dark to-[#182E1C] text-white p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between'>
                        <div className='space-y-4'>
                            <div className='border-b border-white/10 pb-3 flex items-center justify-between'>
                                <span className='font-bold text-sm uppercase tracking-wider text-green-300'>Rider Milestones</span>
                                <span className='text-[10px] bg-white/15 px-2 py-0.5 rounded-full'>Bronze Rank</span>
                            </div>
                            <div className='space-y-3'>
                                <div className='flex gap-3 items-center bg-white/5 p-3 rounded-2xl'>
                                    <span className='text-2xl'>⚡</span>
                                    <div>
                                        <p className='font-bold text-xs text-green-300'>Speedy Delivery Badge</p>
                                        <p className='text-[10px] opacity-75'>Achieved 95% same-day drop-offs</p>
                                    </div>
                                </div>
                                <div className='flex gap-3 items-center bg-white/5 p-3 rounded-2xl'>
                                    <span className='text-2xl'>🛡️</span>
                                    <div>
                                        <p className='font-bold text-xs text-amber-300'>Freshness Guard</p>
                                        <p className='text-[10px] opacity-75'>Verified dairy cold chain handling</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border-t border-white/10 pt-4 space-y-2 text-xs'>
                            <p className='font-bold text-gray-300 uppercase tracking-wider'>Daily Trip Log Summary</p>
                            <div className='flex justify-between opacity-80'>
                                <span>Transit Distance:</span>
                                <span className='font-bold'>42 km</span>
                            </div>
                            <div className='flex justify-between opacity-80'>
                                <span>Petrol Allowance:</span>
                                <span className='font-bold text-green-300'>₹210.00 credited</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lower Form Sections */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Lat Lng Update Manual Form */}
                {stats && stats.verified === 'approved' && (
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <h2 className='text-xl font-bold text-desikit-dark mb-2'>Manual Coordinates Injection</h2>
                        <p className='text-xs text-gray-500 mb-4'>Enter custom coordinate values manually if you are off-grid.</p>
                        <form onSubmit={handleUpdateLocation} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Latitude</label>
                                    <input
                                        type='number'
                                        step='0.0001'
                                        value={simLat}
                                        onChange={(e) => setSimLat(e.target.value)}
                                        className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Longitude</label>
                                    <input
                                        type='number'
                                        step='0.0001'
                                        value={simLng}
                                        onChange={(e) => setSimLng(e.target.value)}
                                        className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type='submit'
                                className='w-full bg-desikit-green text-white py-2.5 rounded-xl font-semibold hover:bg-leaf-green'
                            >
                                Set Custom Position Coordinates
                            </button>
                        </form>
                    </div>
                )}

                {/* Profile vehicle data update */}
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                    <h2 className='text-xl font-bold text-desikit-dark mb-4'>Rider Verification Profile</h2>
                    <form onSubmit={handleVerifySubmit} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Vehicle Type (e.g. Motorcycle, Bicycle)</label>
                            <input
                                type='text'
                                value={vehicleDetails}
                                onChange={(e) => setVehicleDetails(e.target.value)}
                                placeholder='e.g., Hero Splendor, Gear Bicycle'
                                className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                                disabled={stats?.verified === 'approved'}
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Vehicle Registration Plate</label>
                            <input
                                type='text'
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                placeholder='e.g., DL-3C-AB-1234'
                                className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                                disabled={stats?.verified === 'approved'}
                            />
                        </div>
                        {stats?.verified !== 'approved' && (
                            <button
                                type='submit'
                                className='w-full bg-desikit-green text-white py-2.5 rounded-xl font-semibold hover:bg-leaf-green'
                            >
                                Submit Credentials Verification
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliveryStats;
