import React from 'react'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const user = useSelector(state => state.user)
  const navigate = useNavigate()

  // Read active category/tab directly from URL query parameters (e.g. ?filter=fresh dairy)
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('filter') || 'all'

  const [rentals, setRentals] = React.useState([])
  const [loadingRentals, setLoadingRentals] = React.useState(false)
  const [bookingItem, setBookingItem] = React.useState(null)
  
  // Rental Booking fields
  const [bookingDate, setBookingDate] = React.useState('')
  const [startHour, setStartHour] = React.useState(9)
  const [endHour, setEndHour] = React.useState(17)
  const [fulfillmentMode, setFulfillmentMode] = React.useState('pickup') // 'pickup' or 'delivery'

  React.useEffect(() => {
    if (user?.role === 'FARMER') {
      navigate('/dashboard/farmer-stats')
    } else if (user?.role === 'DELIVERY_PARTNER') {
      navigate('/dashboard/delivery-orders')
    }
  }, [user, navigate])

  const fetchRentals = async () => {
    try {
      setLoadingRentals(true)
      const res = await Axios.get('/api/desikit/rental/list')
      if (res.data.success) {
        setRentals(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRentals(false)
    }
  }

  React.useEffect(() => {
    if (activeTab === 'rentals') {
      fetchRentals()
    }
  }, [activeTab])

  const handleBookRental = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error("Please login to book equipment");
      return;
    }
    if (!bookingDate) {
      toast.error("Select a booking date");
      return;
    }
    if (Number(startHour) >= Number(endHour)) {
      toast.error("End hour must be after start hour");
      return;
    }
    try {
      toast.loading("Booking equipment...");
      const res = await Axios.post('/api/desikit/rental/book', {
        rentalId: bookingItem._id,
        bookingDate,
        startHour: Number(startHour),
        endHour: Number(endHour),
        fulfillment_mode: fulfillmentMode
      });
      toast.dismiss();
      if (res.data.success) {
        toast.success("Equipment booked successfully!");
        setBookingItem(null);
        fetchRentals();
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to book equipment");
    }
  }

  // Filter categories shown based on activeTab
  const filteredCategories = categoryData.filter(cat => {
    if (activeTab === 'all') return true;
    const tabClean = activeTab.toLowerCase().trim();
    const catClean = cat.name.toLowerCase().trim();
    return catClean.includes(tabClean) || tabClean.includes(catClean);
  });

  // Calculate rental costs
  const totalHours = Math.max(0, Number(endHour) - Number(startHour));
  const rentalCost = bookingItem ? (totalHours * bookingItem.hourlyPrice) : 0;
  const deliveryCharge = fulfillmentMode === 'delivery' ? 200 : 0;
  const grandTotal = bookingItem ? (rentalCost + deliveryCharge + bookingItem.securityDeposit) : 0;

  return (
    <section className='bg-milk-cream min-h-[85vh]'>
      <div className='container mx-auto px-4 py-8 space-y-8'>
          
          {/* Render Products / Categories */}
          {activeTab !== 'rentals' ? (
            <div key={activeTab} className="space-y-8 animate-fadeIn">
              {
                filteredCategories?.map((c) => {
                  return (
                    <CategoryWiseProductDisplay 
                      key={c?._id + "CategorywiseProduct"} 
                      id={c?._id} 
                      name={c?.name}
                    />
                  )
                })
              }
              {filteredCategories.length === 0 && (
                <div className='text-center py-12 text-gray-400 bg-white border rounded-3xl p-6'>
                  <span className='text-4xl block mb-2'>🥬</span>
                  <p className='font-medium'>No products match this selection right now.</p>
                </div>
              )}
            </div>
          ) : (
            /* Tractor & Tools Rentals tab content */
            <div key="rentals" className='space-y-6 animate-fadeIn'>
              <div className='bg-white border rounded-3xl p-6 shadow-sm'>
                <h2 className='text-xl font-extrabold text-desikit-dark mb-2'>Available Machinery & Farming Tools</h2>
                <p className='text-sm text-gray-500 mb-6'>Rent directly from local farmers at affordable hourly prices. Secure bookings online.</p>

                {loadingRentals ? (
                  <div className='flex justify-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-desikit-green'></div>
                  </div>
                ) : rentals.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {rentals.map((item) => (
                      <div key={item._id} className='bg-white border rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col'>
                        <div className='h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b'>
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1594913785162-e67853827ec3?q=80&w=600'} 
                            alt={item.equipmentName} 
                            className='object-cover w-full h-full' 
                          />
                        </div>
                        <div className='p-5 flex-1 flex flex-col justify-between space-y-4'>
                          <div>
                            <h3 className='font-extrabold text-desikit-dark text-base'>{item.equipmentName}</h3>
                            <p className='text-xs text-gray-500 mt-1 line-clamp-2'>{item.description}</p>
                            <p className='text-[10px] text-gray-400 font-semibold mt-2'>🚜 Owner: {item.farmerId?.name || 'Local Farmer'}</p>
                          </div>
                          
                          <div className='border-t pt-3 flex justify-between items-center'>
                            <div>
                              <p className='text-lg font-black text-desikit-green'>₹{item.hourlyPrice}<span className='text-[10px] text-gray-400 font-semibold'>/hr</span></p>
                              <p className='text-[9px] font-bold text-gray-400'>Deposit: ₹{item.securityDeposit}</p>
                            </div>
                            <button
                              onClick={() => {
                                setBookingItem(item);
                                setFulfillmentMode('pickup');
                              }}
                              className='bg-desikit-green text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-leaf-green'
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12 text-gray-400'>
                    <span className='text-4xl block mb-2'>🔧</span>
                    <p className='font-medium'>No rental equipment currently listed in your area.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Modal */}
          {bookingItem && (
            <div className='fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 overflow-y-auto'>
              <div className='bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 my-8'>
                <h3 className='text-lg font-extrabold text-desikit-dark'>Confirm Booking: {bookingItem.equipmentName}</h3>
                <p className='text-xs text-gray-500'>Rent from {bookingItem.farmerId?.name || 'Local Farmer'} at ₹{bookingItem.hourlyPrice}/hr.</p>
                
                {/* Physical Handover verification Alert */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs space-y-1">
                  <p className="font-extrabold uppercase tracking-wider flex items-center gap-1">⚠️ Physical Handover Verification Required</p>
                  <p className="text-gray-700 leading-relaxed">Identity verification (ID proof, operator license) and documentation signing must be completed physically at the time of pickup or delivery handover.</p>
                </div>

                <form onSubmit={handleBookRental} className='space-y-4 pt-2'>
                  <div className='grid gap-1.5'>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Booking Date</label>
                    <input 
                      type='date' 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)}
                      className='border rounded-xl p-2.5 bg-milk-cream text-sm outline-none focus:border-desikit-green font-bold'
                      required
                    />
                  </div>
                  
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Start Hour (24h)</label>
                      <input 
                        type='number' 
                        min='0' 
                        max='23' 
                        value={startHour} 
                        onChange={(e) => setStartHour(e.target.value)}
                        className='border rounded-xl p-2.5 bg-milk-cream text-sm outline-none focus:border-desikit-green font-bold'
                        required
                      />
                    </div>
                    <div className='grid gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase'>End Hour (24h)</label>
                      <input 
                        type='number' 
                        min='0' 
                        max='23' 
                        value={endHour} 
                        onChange={(e) => setEndHour(e.target.value)}
                        className='border rounded-xl p-2.5 bg-milk-cream text-sm outline-none focus:border-desikit-green font-bold'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid gap-1.5'>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Fulfillment Option</label>
                    <div className='grid grid-cols-2 gap-3'>
                      <div 
                        onClick={() => setFulfillmentMode('pickup')}
                        className={`p-3 border-2 rounded-xl cursor-pointer text-center text-xs transition-all bg-white ${fulfillmentMode === 'pickup' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                      >
                        🏪 Farm Pickup (Free)
                      </div>
                      <div 
                        onClick={() => setFulfillmentMode('delivery')}
                        className={`p-3 border-2 rounded-xl cursor-pointer text-center text-xs transition-all bg-white ${fulfillmentMode === 'delivery' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                      >
                        🚚 Home Delivery (+₹200)
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className='bg-gray-50 border p-3.5 rounded-2xl text-xs space-y-1.5 font-bold text-gray-600'>
                    <div className='flex justify-between'>
                      <span>Rental Duration:</span>
                      <span className='text-desikit-dark'>{totalHours} hrs</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Base Rental Cost:</span>
                      <span className='text-desikit-dark'>{DisplayPriceInRupees(rentalCost)}</span>
                    </div>
                    {fulfillmentMode === 'delivery' && (
                      <div className='flex justify-between text-blue-600'>
                        <span>Machinery Delivery:</span>
                        <span>+₹200.00</span>
                      </div>
                    )}
                    <div className='flex justify-between text-amber-600 border-b pb-1.5'>
                      <span>Refundable Security Deposit:</span>
                      <span>{DisplayPriceInRupees(bookingItem.securityDeposit)}</span>
                    </div>
                    <div className='flex justify-between text-desikit-dark text-sm font-extrabold pt-1'>
                      <span>Estimated Payable:</span>
                      <span className='text-desikit-green'>{DisplayPriceInRupees(grandTotal)}</span>
                    </div>
                  </div>

                  <div className='flex gap-3 pt-2'>
                    <button 
                      type='button' 
                      onClick={() => setBookingItem(null)}
                      className='flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 text-xs'
                    >
                      Cancel
                    </button>
                    <button 
                      type='submit'
                      className='flex-1 bg-desikit-green text-white font-bold py-2.5 rounded-xl hover:bg-leaf-green text-xs'
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </div>
    </section>
  )
}

export default Home
