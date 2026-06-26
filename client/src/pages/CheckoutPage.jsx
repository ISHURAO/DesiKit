import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector, useDispatch } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { setUserDetails } from '../store/userSlice'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Coupon & Wallet states
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [useWallet, setUseWallet] = useState(false)

  // Helper to parse weight/luggage from product unit string
  const parseWeightInKg = (unitStr) => {
    if (!unitStr) return 0.2; // default 200g
    const cleaned = unitStr.toLowerCase().replace(/\s+/g, '');
    
    // Find numeric part and unit part
    const match = cleaned.match(/^([\d.]+)(kg|g|l|ml|pc|pcs|piece|pieces|packet|pkt|gm)?/);
    if (!match) return 0.2;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === 'kg' || unit === 'l' || unit === 'litre') {
      return value;
    } else if (unit === 'g' || unit === 'gm' || unit === 'ml') {
      return value / 1000;
    } else {
      // Default / pc / pieces etc.
      return value * 0.1; // 100g per piece
    }
  };

  // Delivery & Subscription choices
  const [deliveryType, setDeliveryType] = useState('home_delivery') // 'home_delivery' or 'pickup'
  const [deliverySlot, setDeliverySlot] = useState('morning') // 'morning' or 'evening'
  const [isSubscription, setIsSubscription] = useState(false)
  const [subscriptionDays, setSubscriptionDays] = useState(30)
  const [milkDeliveryMode, setMilkDeliveryMode] = useState('now') // 'now' or 'prebook'
  const [prebookDate, setPrebookDate] = useState('')

  const hasMilk = cartItemsList.some(item => 
      item?.productId?.name?.toLowerCase().includes('milk') || 
      item?.productId?.category?.name?.toLowerCase().includes('milk') ||
      item?.productId?.subCategory?.name?.toLowerCase().includes('milk')
  );

  useEffect(() => {
    if (!hasMilk) {
      setIsSubscription(false);
    }
  }, [hasMilk]);

  // Delivery Fee, Distance & Free Eligibility States
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryDistance, setDeliveryDistance] = useState(0)
  const [isFreeEligible, setIsFreeEligible] = useState(false)
  const [freeReason, setFreeReason] = useState('')
  const [showFreeCelebration, setShowFreeCelebration] = useState(false)
  const [hasShownCelebrationThisSession, setHasShownCelebrationThisSession] = useState(false)

  useEffect(() => {
    const fetchCalculatedDelivery = async () => {
      if (!cartItemsList || cartItemsList.length === 0) return;
      try {
        const addressId = deliveryType === 'pickup' ? null : (addressList[selectAddress]?._id || null);
        const response = await Axios.post('/api/order/calculate-delivery', {
          addressId,
          list_items: cartItemsList,
          delivery_type: deliveryType,
          is_subscription: isSubscription
        });
        
        if (response.data.success) {
          const { distance, deliveryFee: calculatedFee, isFreeEligible: isFree, freeReason: reason } = response.data.data;
          setDeliveryFee(calculatedFee);
          setDeliveryDistance(distance);
          setIsFreeEligible(isFree);
          setFreeReason(reason);
          
          if (isFree && !hasShownCelebrationThisSession) {
            setShowFreeCelebration(true);
            setHasShownCelebrationThisSession(true);
            setTimeout(() => {
              setShowFreeCelebration(false);
            }, 6000);
          }
          if (!isFree) {
            setHasShownCelebrationThisSession(false);
          }
        }
      } catch (error) {
        console.error("Error fetching delivery calculation:", error);
      }
    };
    fetchCalculatedDelivery();
  }, [selectAddress, addressList, cartItemsList, deliveryType, isSubscription, hasShownCelebrationThisSession]);

  const initialPayable = totalPrice + deliveryFee;
  let basePayable = initialPayable - couponDiscount;
  if (basePayable < 0) basePayable = 0;
  
  const finalPayable = isSubscription ? basePayable * 30 : basePayable;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) {
        toast.error("Provide a coupon code");
        return;
    }
    try {
        const response = await Axios.post('/api/coupon/apply', {
            code: couponCode,
            order_amount: totalPrice
        });
        if (response.data.success) {
            setAppliedCoupon(response.data.coupon);
            setCouponDiscount(response.data.discount);
            toast.success(`Coupon applied! Saved ₹${response.data.discount}`);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setCouponDiscount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.success("Coupon removed");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processCheckout = async (method) => {
    if (deliveryType !== 'pickup' && addressList.length === 0) {
        toast.error("Add a shipping address first");
        return;
    }

    try {
        toast.loading("Processing order...");
        if (method === 'RAZORPAY') {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.dismiss();
                toast.error("Failed to load Razorpay SDK");
                return;
            }
        }

        const response = await Axios.post('/api/order/checkout', {
            list_items: cartItemsList,
            addressId: deliveryType === 'pickup' ? null : addressList[selectAddress]?._id,
            subTotalAmt: totalPrice,
            delivery_fee: deliveryFee,
            totalAmt: finalPayable,
            payment_method: method,
            coupon_code: appliedCoupon ? appliedCoupon.code : "",
            delivery_type: deliveryType,
            delivery_slot: (deliveryType === 'pickup' || !hasMilk || milkDeliveryMode === 'now') ? null : deliverySlot,
            is_subscription: isSubscription,
            subscription_days: isSubscription ? subscriptionDays : 0
        });

        toast.dismiss();
        if (response.data.success) {
            if (method === 'RAZORPAY' && response.data.razorpayOrder) {
                const options = {
                    key: response.data.razorpayKeyId,
                    amount: response.data.razorpayOrder.amount,
                    currency: "INR",
                    name: "DesiKit",
                    description: "Organic & Farm Fresh Produce",
                    order_id: response.data.razorpayOrder.id,
                    handler: async function (paymentRes) {
                        toast.success("Payment Verified! Order Placed.");
                        if (fetchCartItem) fetchCartItem();
                        if (fetchOrder) fetchOrder();
                        navigate('/success', { state: { text: "Order" } });
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.mobile || ""
                    },
                    theme: {
                        color: "#16a34a"
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
                return;
            }

            toast.success("Order Placed Successfully!");
            const uDetails = await Axios.get('/api/user/user-details');
            if (uDetails.data.success) {
                dispatch(setUserDetails(uDetails.data.data));
            }

            if (fetchCartItem) fetchCartItem();
            if (fetchOrder) fetchOrder();

            navigate('/success', {
                state: { text: "Order" }
            });
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <section className='bg-milk-cream min-h-[85vh] py-8'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-6 justify-between items-start'>
        
        {/* Fulfillment Options */}
        <div className='w-full lg:flex-1 space-y-6'>
          
          <div className='space-y-3'>
            <h3 className='text-xl font-bold text-desikit-dark'>Select Delivery Option</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div 
                onClick={() => setDeliveryType('home_delivery')}
                className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${deliveryType === 'home_delivery' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
              >
                🚚 Home Delivery
              </div>
              <div 
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${deliveryType === 'pickup' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
              >
                🏪 Farm Self-Pickup
                <p className='text-xs font-normal text-gray-500 mt-1'>(Visit local farm to check quality & freshness)</p>
              </div>
            </div>
          </div>

          {deliveryType === 'home_delivery' && hasMilk && (
            <div className='space-y-3'>
              <h3 className='text-xl font-bold text-desikit-dark'>Delivery Preference (Milk Orders)</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div 
                  onClick={() => setMilkDeliveryMode('now')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${milkDeliveryMode === 'now' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                >
                  ⚡ Deliver Now
                  <p className='text-xs font-normal text-gray-500 mt-1'>(Instant delivery without date restrictions)</p>
                </div>
                <div 
                  onClick={() => {
                    setMilkDeliveryMode('prebook');
                    if (!prebookDate) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setPrebookDate(tomorrow.toISOString().split('T')[0]);
                    }
                  }}
                  className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${milkDeliveryMode === 'prebook' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                >
                  📅 Pre-book / Schedule
                  <p className='text-xs font-normal text-gray-500 mt-1'>(Select tomorrow or any custom date)</p>
                </div>
              </div>
            </div>
          )}

          {deliveryType === 'home_delivery' && hasMilk && milkDeliveryMode === 'prebook' && (
            <div className='space-y-4 border p-5 bg-white rounded-3xl'>
              <div className='grid gap-1.5'>
                <label className='text-xs font-bold text-gray-500 uppercase'>Choose Delivery Date</label>
                <input 
                  type='date'
                  value={prebookDate}
                  onChange={(e) => setPrebookDate(e.target.value)}
                  className='border rounded-xl p-2.5 bg-milk-cream text-sm outline-none focus:border-desikit-green font-bold'
                  required
                />
              </div>

              <div className='space-y-2.5'>
                <label className='text-xs font-bold text-gray-500 uppercase'>Select Time Slot</label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div 
                    onClick={() => setDeliverySlot('morning')}
                    className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${deliverySlot === 'morning' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                  >
                    🌅 Morning Slot
                    <p className='text-xs font-normal text-gray-500 mt-1'>(6:00 AM - 9:00 AM)</p>
                  </div>
                  <div 
                    onClick={() => setDeliverySlot('evening')}
                    className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${deliverySlot === 'evening' ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                  >
                    🌇 Evening Slot
                    <p className='text-xs font-normal text-gray-500 mt-1'>(6:00 PM - 9:00 PM)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Options (Milk Only) */}
          {hasMilk && (
            <div className='space-y-3'>
              <h3 className='text-xl font-bold text-desikit-dark'>Purchase Mode</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div 
                  onClick={() => setIsSubscription(false)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${!isSubscription ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                >
                  🛍️ One-time Purchase
                </div>
                <div 
                  onClick={() => setIsSubscription(true)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all bg-white ${isSubscription ? 'border-desikit-green bg-green-50/10 font-bold' : 'border-gray-200'}`}
                >
                  📅 Monthly Subscription
                  <p className='text-xs font-normal text-gray-500 mt-1'>(30 Days Daily Supply)</p>
                </div>
              </div>
            </div>
          )}

          {deliveryType === 'home_delivery' && (
            <div className='space-y-3'>
              <h3 className='text-xl font-bold text-desikit-dark'>Choose Delivery Address</h3>
              <div className='bg-white p-5 rounded-3xl shadow-sm border border-desikit-soft grid gap-4'>
                {addressList && addressList.length > 0 ? (
                  addressList.map((address, index) => (
                    <label htmlFor={"address" + index} className={!address.status ? 'hidden' : 'cursor-pointer'} key={address._id || index}>
                      <div className={`border rounded-2xl p-4 flex gap-3 hover:bg-desikit-soft/50 transition-all ${Number(selectAddress) === index ? 'border-desikit-green bg-green-50/30' : 'border-gray-100'}`}>
                        <input 
                          id={"address" + index} 
                          type='radio' 
                          value={index} 
                          checked={Number(selectAddress) === index}
                          onChange={(e) => setSelectAddress(Number(e.target.value))} 
                          name='address' 
                          className='mt-1 accent-desikit-green'
                        />
                        <div>
                          <p className='font-bold text-desikit-dark'>{address.address_line}</p>
                          <p className='text-sm text-gray-600'>{address.city}, {address.state} - {address.pincode}</p>
                          <p className='text-sm text-gray-500 font-semibold mt-1'>Phone: {address.mobile}</p>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className='text-sm text-gray-400 py-2'>No saved addresses found.</p>
                )}
                <div onClick={() => setOpenAddress(true)} className='h-16 bg-milk-cream border-2 border-dashed border-desikit-soft rounded-2xl flex justify-center items-center cursor-pointer text-desikit-dark font-bold text-sm hover:bg-desikit-soft transition-all'>
                  + Add Shipping Address
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Summary Card */}
        <div className='w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-desikit-soft space-y-6 flex-shrink-0 relative overflow-hidden transition-all duration-300 hover:shadow-2xl'>
          <h3 className='text-xl font-bold text-desikit-dark flex items-center justify-between'>
            <span>Order Summary</span>
            <span className='text-xs font-semibold px-2.5 py-1 bg-desikit-soft text-desikit-green rounded-full'>
              {totalQty} Items
            </span>
          </h3>

          {/* Coupon Code Input */}
          <div className='border border-desikit-soft p-4 rounded-2xl space-y-3 bg-gray-50/50 shadow-inner'>
             <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Apply Promo Code</p>
             {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='e.g., FRESH20'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className='flex-1 border rounded-xl px-3 py-1.5 text-sm uppercase tracking-wider outline-none focus:border-desikit-green bg-white transition-all'
                  />
                  <button
                    type='submit'
                    className='bg-desikit-green text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-leaf-green transition-transform active:scale-95'
                  >
                    Apply
                  </button>
                </form>
             ) : (
                <div className='flex justify-between items-center text-xs font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-200'>
                    <span>✓ Applied: {appliedCoupon.code} (-₹{couponDiscount})</span>
                    <button type="button" onClick={handleRemoveCoupon} className='text-red-500 hover:underline'>Remove</button>
                </div>
             )}
          </div>

          {/* Bill details */}
          <div className='border border-desikit-soft p-4 rounded-2xl space-y-3 bg-white shadow-sm'>
            <h4 className='font-bold text-sm text-desikit-dark border-b pb-2'>Billing details</h4>
            <div className='flex justify-between text-sm text-gray-600'>
              <p>Items Total (Discounted)</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
            {couponDiscount > 0 && (
                <div className='flex justify-between text-sm text-green-600 font-medium'>
                  <p>Coupon Discount</p>
                  <p>-{DisplayPriceInRupees(couponDiscount)}</p>
                </div>
            )}
            <div className='flex justify-between text-sm text-gray-600 items-center'>
              <p className='flex items-center gap-1.5'>
                <span>Delivery Courier Fee</span>
                {deliveryDistance > 0 && deliveryType === 'home_delivery' && (
                  <span className='text-[10px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full'>
                    {deliveryDistance} km
                  </span>
                )}
              </p>
              <p className={deliveryFee === 0 ? 'text-emerald-600 font-extrabold animate-pulse' : ''}>
                {deliveryFee === 0 ? 'FREE' : DisplayPriceInRupees(deliveryFee)}
              </p>
            </div>
            
            {isFreeEligible && (
              <div className='bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-2.5 mt-2 animate-bounce shadow-sm'>
                <span className='text-xl'>🎉</span>
                <div>
                  <p className='font-extrabold text-xs text-emerald-950'>Woohoo! Free Delivery Applied</p>
                  <p className='text-[10px] text-emerald-700 font-medium'>Eligible via {freeReason}</p>
                </div>
              </div>
            )}

            {isSubscription && (
                <div className='flex justify-between text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold'>
                  <p>Subscription Mode</p>
                  <p>30 Days (x30 Total)</p>
                </div>
            )}
            <div className='font-extrabold flex justify-between text-desikit-dark border-t pt-3 text-base'>
              <p>Grand Total</p>
              <p className='text-desikit-green text-lg'>{DisplayPriceInRupees(finalPayable)}</p>
            </div>
          </div>

          {/* Payment CTA triggers */}
          <div className='flex flex-col gap-3'>
            {/* Wallet payment check */}
            {user.wallet_balance >= finalPayable ? (
                <button 
                  onClick={() => processCheckout('WALLET')}
                  className='py-3 bg-amber-600 text-white rounded-full font-bold text-sm hover:bg-amber-700 transition shadow-md shadow-amber-600/10 transform active:scale-[0.98]'
                >
                  Pay with Wallet Balance (₹{user.wallet_balance})
                </button>
            ) : (
                <div className='text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg text-center border border-amber-100'>
                  Wallet balance (₹{user.wallet_balance}) is insufficient to pay for this order.
                </div>
            )}

            <button 
              onClick={() => processCheckout('COD')}
              className='py-3 border-2 border-desikit-green text-desikit-green rounded-full font-bold text-sm hover:bg-desikit-soft transition transform active:scale-[0.98]'
            >
              Cash on Delivery (COD)
            </button>

            <button 
              onClick={() => processCheckout('STRIPE')}
              className='py-3 bg-desikit-green text-white rounded-full font-bold text-sm hover:bg-leaf-green transition shadow-md shadow-desikit-green/10 transform active:scale-[0.98]'
            >
              Stripe Checkout (Mock)
            </button>

            <button 
              onClick={() => processCheckout('RAZORPAY')}
              className='py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-600/10 transform active:scale-[0.98]'
            >
              Razorpay Gateway (Mock)
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}

      {/* Free Delivery Celebrations Popup Overlay */}
      {showFreeCelebration && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn'>
          <div className='bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl relative border border-white/20 transform transition-all duration-300 scale-100'>
            <div className='absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer text-xl font-bold bg-white/10 w-8 h-8 flex items-center justify-center rounded-full' onClick={() => setShowFreeCelebration(false)}>
              ✕
            </div>
            <div className='text-6xl mb-4 animate-bounce'>🎉</div>
            <h2 className='text-3xl font-extrabold mb-2 tracking-tight'>Woohoo!</h2>
            <p className='text-lg font-medium text-green-100 mb-6'>
              You qualified for <span className='underline decoration-wavy decoration-yellow-400 font-extrabold text-white'>FREE Delivery</span>!
            </p>
            <div className='bg-white/15 backdrop-blur-md rounded-2xl py-3 px-6 inline-block border border-white/10 text-xs font-bold uppercase tracking-wider'>
              {freeReason || 'Promo Awarded'}
            </div>
            <button
              onClick={() => setShowFreeCelebration(false)}
              className='mt-8 w-full bg-white text-emerald-800 font-extrabold py-3.5 px-6 rounded-full hover:bg-green-50 transition active:scale-95 shadow-lg text-xs uppercase tracking-wider'
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default CheckoutPage
