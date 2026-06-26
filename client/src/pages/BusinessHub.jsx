import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';
import { FaBuilding, FaFileInvoice, FaTruck, FaHandshake, FaDownload, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { useGlobalContext } from '../provider/GlobalProvider';
import { useSelector } from 'react-redux';

const BusinessHub = () => {
    const { updateCartItem } = useGlobalContext();
    const cartItems = useSelector(state => state.cartItem.cart);
    const [activeTab, setActiveTab] = useState('catalog');
    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    
    // New contract proposal form
    const [selectedFarmer, setSelectedFarmer] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [gstin, setGstin] = useState('');
    const [contractItems, setContractItems] = useState([{ productId: '', negotiatedPrice: 0, monthlyVolume: 100 }]);
    const [deliverySchedule, setDeliverySchedule] = useState('Daily');

    const handleOrderBulk = async (productId) => {
        try {
            const existingCartItem = cartItems.find(item => item.productId?._id === productId);
            if (existingCartItem) {
                toast.loading("Updating bulk quantity...");
                const updateRes = await updateCartItem(existingCartItem._id, 50);
                toast.dismiss();
                if (updateRes && updateRes.success) {
                    toast.success("Updated cart to 50 items (Wholesale Discount applied)!");
                } else {
                    toast.error("Failed to update quantity");
                }
                return;
            }

            toast.loading("Adding bulk items to cart...");
            const response = await Axios.post('/api/cart/create', { productId });
            if (response.data.success) {
                const cartItemId = response.data.data._id;
                const updateRes = await updateCartItem(cartItemId, 50);
                toast.dismiss();
                if (updateRes && updateRes.success) {
                    toast.success("50 bulk items added to cart at wholesale rate!");
                }
            }
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Failed to order bulk");
        }
    };

    const fetchWholesaleData = async () => {
        try {
            // Get products
            const prodRes = await Axios.post('/api/product/get', { limit: 20 });
            if (prodRes.data?.success) {
                setProducts(prodRes.data.data);
            }
            
            // Get B2B contracts
            const contractRes = await Axios.get('/api/desikit/b2b/contracts');
            if (contractRes.data?.success) {
                setContracts(contractRes.data.data);
            }

            // Mock farmers list for proposal dropdown
            const farmersRes = await Axios.get('/api/farmer/list-farmers');
            if (farmersRes.data?.success) {
                setFarmers(farmersRes.data.data);
            } else {
                // Mock fallback
                setFarmers([
                    { _id: '64f7b2a5b6f12a3d4e5f6a72', name: 'Ramesh Singh (Jat Agro Farms)' },
                    { _id: '64f7b2a5b6f12a3d4e5f6a73', name: 'Baldev Singh (Punjab Dairy Coop)' }
                ]);
            }

            // Fetch order invoices
            const invoiceRes = await Axios.get('/api/order/order-list');
            if (invoiceRes.data?.success) {
                setInvoices(invoiceRes.data.data);
            }
        } catch (error) {
            console.error("Error loading B2B data:", error);
        }
    };

    useEffect(() => {
        fetchWholesaleData();
    }, []);

    const handleAddContractItem = () => {
        setContractItems([...contractItems, { productId: '', negotiatedPrice: 0, monthlyVolume: 100 }]);
    };

    const handleRemoveContractItem = (index) => {
        setContractItems(contractItems.filter((_, i) => i !== index));
    };

    const handleContractItemChange = (index, field, value) => {
        const updated = [...contractItems];
        updated[index][field] = value;
        setContractItems(updated);
    };

    const submitContractProposal = async (e) => {
        e.preventDefault();
        if (!selectedFarmer || !companyName || !gstin) {
            toast.error("Please fill in all company credentials");
            return;
        }

        try {
            const response = await Axios.post('/api/desikit/b2b/contract', {
                farmerId: selectedFarmer,
                companyName,
                gstin,
                items: contractItems,
                deliverySchedule,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * 6) // 6 Months Contract
            });

            if (response.data?.success) {
                toast.success("B2B Contract proposal sent to Farmer!");
                fetchWholesaleData();
                // Reset form
                setContractItems([{ productId: '', negotiatedPrice: 0, monthlyVolume: 100 }]);
            }
        } catch (error) {
            toast.error("Failed to propose contract");
        }
    };

    const printInvoice = (invoice) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>GST Invoice - DesiKit</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: #333; }
                    .header { border-bottom: 2px solid #2e7d32; padding-bottom: 10px; margin-bottom: 20px; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .table th { bg-color: #f2f2f2; }
                    .totals { text-align: right; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>DESIKIT WHOLESALE B2B INVOICE</h2>
                    <p><strong>Invoice ID:</strong> ${invoice._id}</p>
                    <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                    <p><strong>GSTIN:</strong> ${gstin || '06AAAAA1111A1Z1'} (Registered B2B Business)</p>
                </div>
                <h3>Order items</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Negotiated Rate</th>
                            <th>Total (Excl. GST)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.product_details.map(item => `
                            <tr>
                                <td>${item.name || 'Organic Farm Produce'}</td>
                                <td>${item.quantity || 1}</td>
                                <td>₹${item.price}</td>
                                <td>₹${item.price * (item.quantity || 1)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <p><strong>Subtotal:</strong> ₹${invoice.amt}</p>
                    <p><strong>CGST (2.5%):</strong> ₹${(invoice.amt * 0.025).toFixed(2)}</p>
                    <p><strong>SGST (2.5%):</strong> ₹${(invoice.amt * 0.025).toFixed(2)}</p>
                    <p><strong>Total Payable Amount:</strong> ₹${(invoice.amt * 1.05).toFixed(2)}</p>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="container mx-auto p-6 bg-milk-cream min-h-screen">
            {/* Top banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white border border-desikit-green/20 rounded-3xl p-6 shadow-md mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-desikit-dark flex items-center gap-2">
                        <FaBuilding className="text-desikit-green" /> DesiKit Business Hub
                    </h1>
                    <p className="text-gray-500 mt-1">Wholesale bulk contracts, tier pricing, and direct-to-kitchen supply chains.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                            activeTab === 'catalog'
                                ? 'bg-desikit-green text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-desikit-soft border'
                        }`}
                    >
                        Wholesale Catalog
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                            activeTab === 'contracts'
                                ? 'bg-desikit-green text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-desikit-soft border'
                        }`}
                    >
                        Contracts & B2B
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                            activeTab === 'invoices'
                                ? 'bg-desikit-green text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-desikit-soft border'
                        }`}
                    >
                        GST Invoices
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: CATALOG */}
            {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((prod) => (
                        <div key={prod._id} className="bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
                            <img src={prod.image?.[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150'} alt={prod.name} className="h-40 w-full object-cover rounded-2xl mb-4" />
                            <h3 className="font-bold text-lg text-gray-800">{prod.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Direct Farmer Stock: {prod.stock} {prod.unit || 'units'} available</p>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed">
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-bold">RETAIL PRICE</span>
                                    <span className="text-sm font-semibold text-gray-500 line-through">₹{prod.price}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-desikit-green block font-bold">WHOLESALE RATE (50+ qty)</span>
                                    <span className="text-lg font-extrabold text-desikit-green">₹{Math.floor(prod.price * 0.85)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOrderBulk(prod._id)}
                                className="w-full mt-4 bg-desikit-green hover:bg-leaf-green text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-desikit-green/10"
                            >
                                <FaShoppingCart size={12} />
                                Order 50 Qty (Bulk Wholesale)
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: CONTRACT PROPOSAL & VIEW */}
            {activeTab === 'contracts' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Contracts */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-desikit-dark flex items-center gap-2">
                            <FaHandshake className="text-desikit-green" /> Your Active Contracts
                        </h2>
                        {contracts.length === 0 ? (
                            <div className="bg-white border rounded-3xl p-8 text-center text-gray-400">
                                No active negotiated volume contracts found. Propose one using the side panel!
                            </div>
                        ) : (
                            contracts.map((contract) => (
                                <div key={contract._id} className="bg-white border rounded-3xl p-5 shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-desikit-green bg-desikit-green/10 px-2 py-0.5 rounded-full uppercase">
                                                {contract.status}
                                            </span>
                                            <h4 className="font-extrabold text-gray-800 mt-1">{contract.companyName}</h4>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-400">Delivery cycle:</span>
                                            <p className="font-bold text-sm text-gray-700">{contract.deliverySchedule}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t pt-3 border-dashed">
                                        {contract.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm text-gray-600">
                                                <span>{item.productId?.name || 'Organic Produce'}</span>
                                                <span className="font-bold">
                                                    ₹{item.negotiatedPrice} x {item.monthlyVolume} qty/mo
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Proposal Form */}
                    <div className="bg-white border rounded-3xl p-6 shadow-sm h-fit">
                        <h3 className="text-lg font-bold text-desikit-dark mb-4 flex items-center gap-2">
                            <FaPlus className="text-desikit-green" /> Negotiate Custom Contract
                        </h3>
                        <form onSubmit={submitContractProposal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">CHOOSE PARTNER FARMER</label>
                                <select
                                    value={selectedFarmer}
                                    onChange={(e) => setSelectedFarmer(e.target.value)}
                                    className="w-full border rounded-xl p-2.5 bg-gray-50 text-sm outline-none focus:ring-1 focus:ring-desikit-green"
                                >
                                    <option value="">Select a Farm</option>
                                    {farmers.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">BUSINESS/RESTAURANT NAME</label>
                                <input
                                    type="text"
                                    placeholder="Hotel Taj Kitchen"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full border rounded-xl p-2.5 bg-gray-50 text-sm outline-none focus:ring-1 focus:ring-desikit-green"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">BUSINESS GSTIN NUMBER</label>
                                <input
                                    type="text"
                                    placeholder="09AAAAA1111A1Z1"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    className="w-full border rounded-xl p-2.5 bg-gray-50 text-sm outline-none"
                                />
                            </div>

                            {contractItems.map((item, idx) => (
                                <div key={idx} className="border-t border-dashed pt-3 mt-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-extrabold text-gray-600">Product #{idx + 1}</span>
                                        {contractItems.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveContractItem(idx)} className="text-[10px] text-red-500 hover:underline">Remove</button>
                                        )}
                                    </div>
                                    <select
                                        value={item.productId}
                                        onChange={(e) => handleContractItemChange(idx, 'productId', e.target.value)}
                                        className="w-full border rounded-xl p-2 bg-gray-50 text-xs"
                                    >
                                        <option value="">Select Item</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Price/unit"
                                            value={item.negotiatedPrice || ''}
                                            onChange={(e) => handleContractItemChange(idx, 'negotiatedPrice', Number(e.target.value))}
                                            className="w-1/2 border rounded-xl p-2 bg-gray-50 text-xs"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Mo Volume"
                                            value={item.monthlyVolume || ''}
                                            onChange={(e) => handleContractItemChange(idx, 'monthlyVolume', Number(e.target.value))}
                                            className="w-1/2 border rounded-xl p-2 bg-gray-50 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddContractItem}
                                className="w-full text-center text-xs font-bold text-desikit-green border border-dashed border-desikit-green py-2 rounded-xl mt-2 hover:bg-desikit-green/5"
                            >
                                + Add another product
                            </button>

                            <button
                                type="submit"
                                className="w-full bg-desikit-green hover:bg-leaf-green text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                            >
                                Submit B2B Proposal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: INVOICES */}
            {activeTab === 'invoices' && (
                <div className="bg-white border rounded-3xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-desikit-dark mb-6 flex items-center gap-2">
                        <FaFileInvoice className="text-desikit-green" /> Download GST Invoice
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-gray-500 text-xs font-bold">
                                    <th className="py-3 px-4">ORDER ID</th>
                                    <th className="py-3 px-4">DATE</th>
                                    <th className="py-3 px-4">NET AMOUNT</th>
                                    <th className="py-3 px-4">DELIVERY STATE</th>
                                    <th className="py-3 px-4 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="border-b text-sm text-gray-700 hover:bg-desikit-soft/20">
                                        <td className="py-3 px-4 font-mono text-xs">{inv._id}</td>
                                        <td className="py-3 px-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-bold text-desikit-green">₹{inv.amt}</td>
                                        <td className="py-3 px-4 capitalize">{inv.delivery_status || 'Delivered'}</td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => printInvoice(inv)}
                                                className="bg-desikit-green/10 text-desikit-green font-bold text-xs px-3 py-1.5 rounded-full hover:bg-desikit-green hover:text-white transition-all flex items-center gap-1 mx-auto"
                                            >
                                                <FaDownload size={10} /> GST Invoice PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessHub;
