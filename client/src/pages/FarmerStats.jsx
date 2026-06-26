import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaDollarSign, FaChartLine, FaSeedling, FaTractor, FaGlassMartini, FaPlus, FaCloudRain, FaListAlt } from 'react-icons/fa';

const FarmerStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [farmName, setFarmName] = useState('');
    const [farmAddress, setFarmAddress] = useState('');
    const [licenseDoc, setLicenseDoc] = useState('');

    // AI Pricing recommendation state
    const [aiCategory, setAiCategory] = useState('Milk');
    const [aiMarketPrice, setAiMarketPrice] = useState(25);
    const [aiDemand, setAiDemand] = useState('High');
    const [aiRecommendation, setAiRecommendation] = useState(null);

    // Crop yield prediction state
    const [cropType, setCropType] = useState('Wheat');
    const [landArea, setLandArea] = useState(5);
    const [soilType, setSoilType] = useState('Loamy');
    const [season, setSeason] = useState('Rabi');
    const [yieldResult, setYieldResult] = useState(null);

    // Milk logs
    const [milkLogs, setMilkLogs] = useState([]);
    const [milkQty, setMilkQty] = useState('');
    const [milkFat, setMilkFat] = useState('');
    const [milkSnf, setMilkSnf] = useState('8.5');
    const [milkRate, setMilkRate] = useState('42');

    // Community Bazaar listings
    const [communityItems, setCommunityItems] = useState([]);
    const [bzTitle, setBzTitle] = useState('');
    const [bzCat, setBzCat] = useState('Seeds');
    const [bzPrice, setBzPrice] = useState('');
    const [bzPhone, setBzPhone] = useState('');
    const [bzDesc, setBzDesc] = useState('');

    // Rentals list
    const [rentalItems, setRentalItems] = useState([]);
    const [rtName, setRtName] = useState('John Deere Tractor');
    const [rtPrice, setRtPrice] = useState('500');
    const [rtDeposit, setRtDeposit] = useState('2000');
    const [rtDesc, setRtDesc] = useState('');

    const fetchStats = async () => {
        try {
            const response = await Axios.get('/api/farmer/stats');
            if (response.data.success) {
                setStats(response.data.data);
                setFarmName(response.data.data.farm_name || '');
                setFarmAddress(response.data.data.farm_address || '');
                setLicenseDoc(response.data.data.license_doc || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadFarmerToolsData = async () => {
        try {
            // Load milk logs
            const milkRes = await Axios.get('/api/desikit/milk-collection/logs');
            if (milkRes.data?.success) {
                setMilkLogs(milkRes.data.data);
            }

            // Load community listings
            const commRes = await Axios.get('/api/desikit/community/list');
            if (commRes.data?.success) {
                setCommunityItems(commRes.data.data);
            }

            // Load rentals
            const rentRes = await Axios.get('/api/desikit/rental/list');
            if (rentRes.data?.success) {
                setRentalItems(rentRes.data.data);
            }
        } catch (error) {
            console.error("Error loading farmer sub-sections:", error);
        }
    };

    useEffect(() => {
        fetchStats();
        loadFarmerToolsData();
        const interval = setInterval(() => {
            fetchStats();
            loadFarmerToolsData();
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await Axios.put('/api/farmer/verify', {
                farm_name: farmName,
                farm_address: farmAddress,
                license_doc: licenseDoc || "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=400"
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchStats();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification request failed");
        }
    };

    // AI Pricing recommendation calculation
    const calculateRecommendedPrice = () => {
        let recommendation = aiMarketPrice;
        if (aiDemand === 'High') {
            recommendation = Math.floor(aiMarketPrice * 1.05); // suggest slightly higher
        } else if (aiDemand === 'Low') {
            recommendation = Math.floor(aiMarketPrice * 0.92); // lower to clear stock
        } else {
            recommendation = Math.floor(aiMarketPrice * 0.98); // competitive
        }
        setAiRecommendation(recommendation);
    };

    // Crop yield prediction logic
    const calculateCropPrediction = () => {
        let baseYieldPerAcre = 1500; // in kg
        if (soilType === 'Loamy') baseYieldPerAcre *= 1.2;
        if (soilType === 'Clayey') baseYieldPerAcre *= 0.95;
        if (cropType === 'Paddy') baseYieldPerAcre *= 1.3;
        if (cropType === 'Mustard') baseYieldPerAcre *= 0.7;

        const totalYield = Math.floor(baseYieldPerAcre * landArea);
        let ratePerKg = 25;
        if (cropType === 'Mustard') ratePerKg = 55;
        if (cropType === 'Paddy') ratePerKg = 30;

        const estimatedRevenue = totalYield * ratePerKg;
        setYieldResult({
            expectedYield: totalYield,
            revenue: estimatedRevenue,
            marketDemand: cropType === 'Paddy' ? 'High (Rainy Season)' : 'Steady'
        });
    };

    // Log milk collection record
    const submitMilkLog = async (e) => {
        e.preventDefault();
        if (!milkQty || !milkFat) {
            toast.error("Enter milk quantity and fat %");
            return;
        }

        try {
            const res = await Axios.post('/api/desikit/milk-collection/log', {
                farmerId: stats?.farmer_id || stats?._id,
                date: new Date().toISOString().split('T')[0],
                quantity: Number(milkQty),
                fatPercentage: Number(milkFat),
                snfPercentage: Number(milkSnf),
                ratePerLitre: Number(milkRate)
            });

            if (res.data?.success) {
                toast.success("Milk collection logged!");
                setMilkQty('');
                setMilkFat('');
                loadFarmerToolsData();
            }
        } catch (error) {
            toast.error("Failed to log milk data");
        }
    };

    // Add Community Listing
    const submitBazaarItem = async (e) => {
        e.preventDefault();
        if (!bzTitle || !bzPrice || !bzPhone) {
            toast.error("Please enter Title, Price and Phone");
            return;
        }

        try {
            const res = await Axios.post('/api/desikit/community/create', {
                title: bzTitle,
                category: bzCat,
                price: Number(bzPrice),
                contactPhone: bzPhone,
                description: bzDesc,
                condition: 'New'
            });

            if (res.data?.success) {
                toast.success("Listing posted in bazaar!");
                setBzTitle('');
                setBzPrice('');
                setBzPhone('');
                setBzDesc('');
                loadFarmerToolsData();
            }
        } catch (error) {
            toast.error("Failed to list bazaar item");
        }
    };

    // Add Equipment Rental item
    const submitRentalItem = async (e) => {
        e.preventDefault();
        try {
            const res = await Axios.post('/api/desikit/rental/add', {
                equipmentName: rtName,
                description: rtDesc,
                hourlyPrice: Number(rtPrice),
                securityDeposit: Number(rtDeposit)
            });

            if (res.data?.success) {
                toast.success("Equipment listed for rent!");
                setRtDesc('');
                loadFarmerToolsData();
            }
        } catch (error) {
            toast.error("Failed to list rental equipment");
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[50vh]'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-desikit-green'></div>
            </div>
        );
    }

    return (
        <div className='p-6 max-w-6xl mx-auto space-y-8 bg-milk-cream min-h-screen'>
            {/* Top Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark tracking-tight'>Farmer Command Center</h1>
                    <p className='text-sm text-gray-500 mt-1'>Direct agricultural optimization, yield calculators, and direct-to-home tools.</p>
                </div>
                {stats?.verified === 'approved' && (
                    <div className='flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-2xl text-sm font-bold w-fit'>
                        <span className='h-2 w-2 rounded-full bg-green-500 animate-ping'></span>
                        Verified Farm Merchant
                    </div>
                )}
            </div>

            {/* Stats Dashboard Grid */}
            {stats && stats.verified === 'approved' && (
                <div className='grid gap-6 grid-cols-1 md:grid-cols-4'>
                    <div className='bg-gradient-to-br from-green-50 to-green-150 p-6 rounded-3xl border border-green-200 shadow-sm'>
                        <p className='text-xs text-green-700 font-bold uppercase tracking-wider'>Gross Revenue</p>
                        <p className='text-3xl font-black text-desikit-green mt-2'>₹{parseFloat(stats.earnings?.toFixed(2) || 0)}</p>
                        <div className='text-xs text-green-600 mt-2 font-semibold'>+12.4% from last week</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Active Inventory</p>
                        <p className='text-3xl font-black text-gray-800 mt-2'>{stats.totalProducts || 0}</p>
                        <div className='text-xs text-gray-500 mt-2'>Items listed in directory</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Sales Volume</p>
                        <p className='text-3xl font-black text-gray-800 mt-2'>{stats.totalSalesCount || 0} units</p>
                        <div className='text-xs text-gray-500 mt-2'>Delivered packages</div>
                    </div>
                    <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm'>
                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider'>Pending Orders</p>
                        <p className='text-3xl font-black text-amber-500 mt-2'>{stats.activeOrdersCount || 0}</p>
                        <div className='text-xs text-gray-500 mt-2'>Awaiting packaging</div>
                    </div>
                </div>
            )}

            {/* AI PRICING & CROP PREDICTOR TOOLS */}
            {stats && stats.verified === 'approved' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Price Suggester */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-desikit-dark mb-4 flex items-center gap-2">
                            <FaDollarSign className="text-desikit-green" /> AI Selling Price suggester
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">CROP/PRODUCT CATEGORY</label>
                                <select value={aiCategory} onChange={(e) => setAiCategory(e.target.value)} className="w-full border rounded-xl p-2.5 bg-gray-50 text-sm">
                                    <option value="Milk">Cow Milk</option>
                                    <option value="Paneer">Paneer</option>
                                    <option value="Ghee">Desi Ghee</option>
                                    <option value="Sabji">Organic Vegetables</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">MOCK MARKET PRICE (₹/kg or L)</label>
                                    <input type="number" value={aiMarketPrice} onChange={(e) => setAiMarketPrice(Number(e.target.value))} className="w-full border rounded-xl p-2 bg-gray-50 text-sm" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">LOCAL DEMAND LEVEL</label>
                                    <select value={aiDemand} onChange={(e) => setAiDemand(e.target.value)} className="w-full border rounded-xl p-2 bg-gray-50 text-sm">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={calculateRecommendedPrice} className="w-full bg-desikit-green text-white font-bold py-2 rounded-xl text-sm hover:bg-leaf-green">
                                Run Recommendation Engine
                            </button>
                            {aiRecommendation && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mt-4">
                                    <p className="text-xs text-gray-500">RECOMMENDED SELLING PRICE</p>
                                    <p className="text-2xl font-black text-desikit-green mt-1">₹{aiRecommendation} per kg/L</p>
                                    <p className="text-xs text-gray-400 mt-1">Eliminating middlemen allows directly competitive local pricing matching city centers.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Crop Yield Predictor */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-desikit-dark mb-4 flex items-center gap-2">
                            <FaChartLine className="text-desikit-green" /> Crop Yield & Revenue Predictor
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">CROP TYPE</label>
                                    <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full border rounded-xl p-2 bg-gray-50 text-xs">
                                        <option value="Wheat">Kanak (Wheat)</option>
                                        <option value="Paddy">Paddy (Rice)</option>
                                        <option value="Mustard">Mustard (Sarson)</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">LAND AREA (ACRES)</label>
                                    <input type="number" value={landArea} onChange={(e) => setLandArea(Number(e.target.value))} className="w-full border rounded-xl p-2 bg-gray-50 text-xs" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">SOIL TYPE</label>
                                    <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full border rounded-xl p-2 bg-gray-50 text-xs">
                                        <option value="Loamy">Loamy (Doumat)</option>
                                        <option value="Clayey">Clayey (Chikni)</option>
                                        <option value="Sandy">Sandy (Retili)</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">SEASON</label>
                                    <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full border rounded-xl p-2 bg-gray-50 text-xs">
                                        <option value="Rabi">Rabi (Winter)</option>
                                        <option value="Kharif">Kharif (Summer)</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={calculateCropPrediction} className="w-full bg-desikit-green text-white font-bold py-2 rounded-xl text-sm hover:bg-leaf-green">
                                Forecast Crop yield
                            </button>
                            {yieldResult && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 border border-yellow-250 rounded-2xl">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold block">EXPECTED YIELD</span>
                                        <span className="text-lg font-black text-gray-800">{yieldResult.expectedYield} KGs</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold block">ESTIMATED REVENUE</span>
                                        <span className="text-lg font-black text-desikit-green">₹{yieldResult.revenue}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MILK COLLECTION LOG & EQUIPMENT RENTALS */}
            {stats && stats.verified === 'approved' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Milk Collection */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-desikit-dark mb-4 flex items-center gap-2">
                            <FaGlassMartini className="text-desikit-green" /> Milk Collection Logs
                        </h2>
                        <form onSubmit={submitMilkLog} className="flex gap-2 items-end mb-4">
                            <div className="w-1/4">
                                <label className="block text-[10px] text-gray-400 font-bold mb-1">LITRES</label>
                                <input type="number" value={milkQty} onChange={(e) => setMilkQty(e.target.value)} className="w-full border rounded-xl p-2 text-xs" placeholder="e.g. 50" />
                            </div>
                            <div className="w-1/4">
                                <label className="block text-[10px] text-gray-400 font-bold mb-1">FAT %</label>
                                <input type="number" value={milkFat} onChange={(e) => setMilkFat(e.target.value)} className="w-full border rounded-xl p-2 text-xs" placeholder="e.g. 4.8" />
                            </div>
                            <div className="w-1/4">
                                <label className="block text-[10px] text-gray-400 font-bold mb-1">RATE/L (₹)</label>
                                <input type="number" value={milkRate} onChange={(e) => setMilkRate(e.target.value)} className="w-full border rounded-xl p-2 text-xs" />
                            </div>
                            <button type="submit" className="bg-desikit-green text-white p-2 rounded-xl text-xs font-bold hover:bg-leaf-green">
                                Log Entry
                            </button>
                        </form>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {milkLogs.map((log) => (
                                <div key={log._id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-xl border">
                                    <div>
                                        <p className="font-bold text-gray-800">{log.quantity} Liters (Fat: {log.fatPercentage}%)</p>
                                        <p className="text-[10px] text-gray-400">{log.date}</p>
                                    </div>
                                    <span className="font-bold text-desikit-green">₹{log.totalAmount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rentals catalog */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-desikit-dark mb-4 flex items-center gap-2">
                            <FaTractor className="text-desikit-green" /> Farm Equipment Rental
                        </h2>
                        <form onSubmit={submitRentalItem} className="space-y-2 mb-4">
                            <div className="flex gap-2">
                                <select value={rtName} onChange={(e) => setRtName(e.target.value)} className="w-1/2 border rounded-xl p-2 text-xs bg-gray-50">
                                    <option value="John Deere Tractor">Tractor</option>
                                    <option value="Rotavator Shaktiman">Rotavator</option>
                                    <option value="Combine Harvester">Harvester</option>
                                    <option value="Seed Drill Seeder">Seeder</option>
                                </select>
                                <input type="number" value={rtPrice} onChange={(e) => setRtPrice(e.target.value)} className="w-1/4 border rounded-xl p-2 text-xs" placeholder="Rate/hr" />
                                <input type="number" value={rtDeposit} onChange={(e) => setRtDeposit(e.target.value)} className="w-1/4 border rounded-xl p-2 text-xs" placeholder="Deposit" />
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={rtDesc} onChange={(e) => setRtDesc(e.target.value)} className="flex-1 border rounded-xl p-2 text-xs" placeholder="Condition or notes" />
                                <button type="submit" className="bg-desikit-green text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-leaf-green">
                                    List Equipment
                                </button>
                            </div>
                        </form>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {rentalItems.map((item) => (
                                <div key={item._id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-xl border">
                                    <div>
                                        <p className="font-bold text-gray-800">{item.equipmentName}</p>
                                        <p className="text-[10px] text-gray-400">Rate: ₹{item.hourlyPrice}/hr · Deposit: ₹{item.securityDeposit}</p>
                                    </div>
                                    <span className="font-bold text-desikit-green bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COMMUNITY BAZAAR LISTINGS */}
            {stats && stats.verified === 'approved' && (
                <div className="bg-white border rounded-3xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-desikit-dark mb-4 flex items-center gap-2">
                        <FaSeedling className="text-desikit-green" /> Community Bazaar (OLX Agri Marketplace)
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form */}
                        <form onSubmit={submitBazaarItem} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-0.5">ITEM TITLE</label>
                                <input type="text" value={bzTitle} onChange={(e) => setBzTitle(e.target.value)} className="w-full border rounded-xl p-2 text-xs" placeholder="e.g. Organic Mustard Seeds" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-0.5">CATEGORY</label>
                                    <select value={bzCat} onChange={(e) => setBzCat(e.target.value)} className="w-full border rounded-xl p-2 text-xs">
                                        <option value="Seeds">Seeds</option>
                                        <option value="Fertilizers">Fertilizers</option>
                                        <option value="Equipment">Tools</option>
                                        <option value="Animal Feed">Animal Feed</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-0.5">PRICE (₹)</label>
                                    <input type="number" value={bzPrice} onChange={(e) => setBzPrice(e.target.value)} className="w-full border rounded-xl p-2 text-xs" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-0.5">CONTACT PHONE</label>
                                <input type="text" value={bzPhone} onChange={(e) => setBzPhone(e.target.value)} className="w-full border rounded-xl p-2 text-xs" placeholder="Mobile number" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-0.5">DESCRIPTION</label>
                                <textarea value={bzDesc} onChange={(e) => setBzDesc(e.target.value)} className="w-full border rounded-xl p-2 text-xs h-16 resize-none" placeholder="Details..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-desikit-green text-white font-bold py-2 rounded-xl text-xs hover:bg-leaf-green">
                                Post Listing
                            </button>
                        </form>

                        {/* List view */}
                        <div className="lg:col-span-2 space-y-3 max-h-80 overflow-y-auto">
                            {communityItems.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-3 border rounded-2xl bg-gray-50">
                                    <div>
                                        <span className="text-[10px] font-bold text-desikit-green bg-green-50 px-2 py-0.5 rounded-full uppercase">{item.category}</span>
                                        <h4 className="font-bold text-gray-800 mt-1">{item.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1">Seller Call: {item.contactPhone}</p>
                                    </div>
                                    <span className="font-extrabold text-desikit-green text-lg">₹{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Farm Verification Resubmit */}
            <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm max-w-lg'>
                <h2 className='text-xl font-bold text-desikit-dark mb-4'>Update Farm Information</h2>
                <form onSubmit={handleVerify} className='space-y-4'>
                    <div>
                        <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Farm Name</label>
                        <input
                            type='text'
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                            required
                            disabled={stats?.verified === 'approved'}
                        />
                    </div>
                    <div>
                        <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Farm Address</label>
                        <input
                            type='text'
                            value={farmAddress}
                            onChange={(e) => setFarmAddress(e.target.value)}
                            className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none'
                            required
                            disabled={stats?.verified === 'approved'}
                        />
                    </div>
                    <div>
                        <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>License URL / Link</label>
                        <input
                            type='text'
                            value={licenseDoc}
                            onChange={(e) => setLicenseDoc(e.target.value)}
                            className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none'
                            disabled={stats?.verified === 'approved'}
                        />
                    </div>
                    {stats?.verified !== 'approved' && (
                        <button type='submit' className='w-full bg-desikit-green text-white py-2.5 rounded-xl font-semibold hover:bg-leaf-green'>
                            Submit Profile for Verification
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default FarmerStats;
