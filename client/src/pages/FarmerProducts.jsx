import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const FarmerProducts = () => {
    const user = useSelector(state => state.user);
    const categories = useSelector(state => state.product.allCategory);
    const subCategories = useSelector(state => state.product.allSubCategory);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form inputs
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [description, setDescription] = useState('');
    const [discount, setDiscount] = useState('');

    const fetchMyProducts = async () => {
        setLoading(true);
        try {
            const response = await Axios.post('/product/get', { farmerId: user._id });
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching farmer products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!name || !price || !unit || !stock || !category) {
            toast.error("Complete required fields (name, price, unit, stock, category)");
            return;
        }

        const finalImage = image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop";

        try {
            const response = await Axios.post('/product/create', {
                name,
                price: parseFloat(price),
                unit,
                stock: parseInt(stock),
                category,
                subCategory: subCategory || null,
                image: [finalImage],
                description: description || "Fresh farm quality.",
                discount: discount ? parseFloat(discount) : 0
            });

            if (response.data.success) {
                toast.success("Product listed successfully!");
                setShowAddForm(false);
                // Clear inputs
                setName(''); setPrice(''); setUnit(''); setStock(''); setImage(''); setCategory(''); setSubCategory(''); setDescription(''); setDiscount('');
                fetchMyProducts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create product");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const response = await Axios.delete('/product/delete-product', { data: { _id: id } });
            if (response.data.success) {
                toast.success("Listing deleted");
                fetchMyProducts();
            }
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleUpdateStock = async (id, currentStock) => {
        const newStock = window.prompt("Update stock value:", currentStock);
        if (newStock === null || isNaN(newStock) || parseInt(newStock) < 0) return;

        try {
            const response = await Axios.put('/product/update-product-details', {
                _id: id,
                stock: parseInt(newStock)
            });
            if (response.data.success) {
                toast.success("Stock updated");
                fetchMyProducts();
            }
        } catch (error) {
            toast.error("Failed to update stock");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark'>Inventory Manager</h1>
                    <p className='text-sm text-gray-500'>List your farm harvest and dairy products directly to buyers.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className='bg-desikit-green text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-leaf-green shadow-md shadow-desikit-green/10'
                >
                    {showAddForm ? 'Back to Inventory' : 'Add New Product'}
                </button>
            </div>

            {showAddForm ? (
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm max-w-2xl mx-auto w-full'>
                    <h2 className='text-xl font-bold mb-4 text-desikit-dark'>Add Product to Catalog</h2>
                    <form onSubmit={handleCreateProduct} className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Product Name*</label>
                            <input
                                type='text'
                                placeholder='e.g., Pure Cow Milk, Organic Spinach'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Price per unit (₹)*</label>
                            <input
                                type='number'
                                placeholder='e.g., 60'
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                                min='1'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Packaging Unit (e.g., 1 Litre, 500g)*</label>
                            <input
                                type='text'
                                placeholder='e.g., 1 L, 500 gm, 1 Pack'
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Initial Stock*</label>
                            <input
                                type='number'
                                placeholder='e.g., 50'
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                                min='0'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Discount (%)</label>
                            <input
                                type='number'
                                placeholder='e.g., 5'
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                min='0'
                                max='99'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Product Image URL</label>
                            <input
                                type='text'
                                placeholder='e.g., Paste unsplash or cloudinary URL'
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Select Category*</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            >
                                <option value=''>-- Select --</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Select Subcategory</label>
                            <select
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            >
                                <option value=''>-- Optional --</option>
                                {subCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Description</label>
                            <textarea
                                placeholder='HARVEST / MILKING TIMES details, farm location, organic notes...'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green h-24 bg-white'
                            />
                        </div>
                        <button
                            type='submit'
                            className='md:col-span-2 bg-desikit-green text-white py-3 rounded-xl font-semibold hover:bg-leaf-green'
                        >
                            Save Product Listing
                        </button>
                    </form>
                </div>
            ) : (
                <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm'>
                    <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>My Listed Products</div>
                    {loading ? (
                        <p className='text-center py-10 font-bold text-gray-500'>Loading inventory list...</p>
                    ) : products.length > 0 ? (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-500'>
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100'>
                                    <tr>
                                        <th className='px-6 py-4'>Item</th>
                                        <th className='px-6 py-4'>Price</th>
                                        <th className='px-6 py-4'>Unit</th>
                                        <th className='px-6 py-4'>Stock</th>
                                        <th className='px-6 py-4'>Discount</th>
                                        <th className='px-6 py-4 text-center'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {products.map(p => (
                                        <tr key={p._id} className='hover:bg-gray-50/40'>
                                            <td className='px-6 py-4 font-semibold text-gray-800 flex items-center gap-3'>
                                                <img src={p.image[0]} className='w-10 h-10 object-cover rounded-lg border' />
                                                <span>{p.name}</span>
                                            </td>
                                            <td className='px-6 py-4 font-bold text-gray-800'>₹{p.price}</td>
                                            <td className='px-6 py-4'>{p.unit}</td>
                                            <td className='px-6 py-4'>
                                                <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} units</span>
                                            </td>
                                            <td className='px-6 py-4'>{p.discount}%</td>
                                            <td className='px-6 py-4 text-center space-x-2'>
                                                <button
                                                    onClick={() => handleUpdateStock(p._id, p.stock)}
                                                    className='text-xs font-bold text-blue-600 hover:underline'
                                                >
                                                    Stock
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(p._id)}
                                                    className='text-xs font-bold text-red-500 hover:underline'
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className='text-sm text-gray-400 text-center py-10'>No products listed yet. Click "Add New Product" to start.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FarmerProducts;
