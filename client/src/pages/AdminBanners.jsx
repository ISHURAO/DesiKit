import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const AdminBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [link, setLink] = useState('');

    const fetchBanners = async () => {
        try {
            const response = await Axios.get('/banner/list');
            if (response.data.success) {
                setBanners(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleCreateBanner = async (e) => {
        e.preventDefault();
        if (!image) {
            toast.error("Provide a banner image URL");
            return;
        }

        try {
            const response = await Axios.post('/banner/add', {
                title,
                image,
                product_link: link
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setTitle('');
                setImage('');
                setLink('');
                fetchBanners();
            }
        } catch (error) {
            toast.error("Failed to add banner");
        }
    };

    const handleDeleteBanner = async (id) => {
        try {
            const response = await Axios.delete(`/banner/delete/${id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchBanners();
            }
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
            <div>
                <h1 className='text-3xl font-extrabold text-desikit-dark'>Banner Manager</h1>
                <p className='text-sm text-gray-500'>Upload seasonal promotional sliders displayed on the homepage.</p>
            </div>

            <div className='grid gap-6 md:grid-cols-[300px,1fr]'>
                {/* Form */}
                <div className='bg-white p-5 rounded-3xl border border-desikit-soft shadow-sm h-fit'>
                    <h2 className='text-lg font-bold text-desikit-dark mb-4'>Create Slide</h2>
                    <form onSubmit={handleCreateBanner} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Slide Title</label>
                            <input
                                type='text'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='e.g., Mango Harvest, Dairy Specials'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Slide Image URL*</label>
                            <input
                                type='text'
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder='Upload image and paste URL here'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 mb-1'>Product Redirect Link</label>
                            <input
                                type='text'
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder='e.g., /product/details-id'
                                className='w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                            />
                        </div>
                        <button
                            type='submit'
                            className='w-full bg-desikit-green text-white py-2.5 rounded-xl font-bold text-sm hover:bg-leaf-green'
                        >
                            Publish Slider Slide
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className='bg-white rounded-3xl border border-desikit-soft overflow-hidden shadow-sm h-fit'>
                    <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm'>Home Carousel Slides</div>
                    {loading ? (
                        <p className='text-center py-6 text-gray-400'>Loading...</p>
                    ) : banners.length > 0 ? (
                        <div className='p-4 grid gap-4 sm:grid-cols-2 max-h-[500px] overflow-y-auto'>
                            {banners.map(b => (
                                <div key={b._id} className='border rounded-2xl overflow-hidden relative group bg-gray-50'>
                                    <img src={b.image} className='w-full h-32 object-cover' />
                                    <div className='p-3 flex justify-between items-center bg-white'>
                                        <div>
                                            <p className='font-bold text-xs truncate max-w-44 text-gray-800'>{b.title || 'Untitled Banner'}</p>
                                            <p className='text-[10px] text-gray-400 truncate max-w-44'>{b.product_link || 'No link redirect'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBanner(b._id)}
                                            className='text-xs font-bold text-red-500 hover:underline'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-sm text-gray-400 text-center py-10'>No carousel slides uploaded.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBanners;
