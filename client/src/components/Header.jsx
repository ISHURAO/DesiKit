import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.svg'
import Search from './Search'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp  } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
import toast from 'react-hot-toast';

const Header = () => {
    const [ isMobile ] = useMobile()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const navigate = useNavigate()
    const user = useSelector((state)=> state?.user)
    const [openUserMenu,setOpenUserMenu] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const { totalPrice, totalQty} = useGlobalContext()
    const [openCartSection,setOpenCartSection] = useState(false)
    const [selectedLoc, setSelectedLoc] = useState(localStorage.getItem('desi_location') || 'Mathura')

    useEffect(() => {
        if (!localStorage.getItem('desi_location') && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();
                        if (data && data.address) {
                            const detected = data.address.suburb || data.address.town || data.address.city || data.address.village || data.address.county || 'Phagwara';
                            localStorage.setItem('desi_location', detected);
                            setSelectedLoc(detected);
                            toast.success(`Detected location: ${detected}`, { icon: '📍' });
                            window.location.reload();
                            return;
                        }
                    } catch (err) {
                        console.error("Reverse geocoding failed, using fallback:", err);
                    }
                    
                    // Fallback using latitude buckets
                    let detected = 'Mathura';
                    if (lat > 30) {
                        detected = 'Ludhiana';
                    } else if (lat > 29) {
                        detected = 'Karnal';
                    } else if (lat > 28) {
                        detected = 'Delhi NCR';
                    }
                    localStorage.setItem('desi_location', detected);
                    setSelectedLoc(detected);
                    toast.success(`Detected location: ${detected}`, { icon: '📍' });
                    window.location.reload();
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, []);

    const handleLocChange = (e) => {
        const val = e.target.value;
        setSelectedLoc(val);
        localStorage.setItem('desi_location', val);
        toast.success(`Location updated to ${val}`);
        window.location.reload();
    }
 
    const redirectToLoginPage = ()=>{
        navigate("/login")
    }

    const handleCloseUserMenu = ()=>{
        setOpenUserMenu(false)
    }

    const handleMobileUser = ()=>{
        if(!user._id){
            navigate("/login")
            return
        }

        navigate("/user")
    }

  return (
    <header className='h-24 lg:h-20 sticky top-0 z-40 flex flex-col justify-center gap-2 bg-milk-cream border-b border-desikit-soft'>
        {
            !(isSearchPage && isMobile) && (
                <div className='container mx-auto flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between'>
                    <div className='flex items-center gap-3'>
                        <Link to={"/"} className='flex items-center gap-3'>
                            <img 
                                src={logo}
                                width={140}
                                height={56}
                                alt='DesiKit logo'
                                className='h-14 w-auto'
                            />
                        </Link>
                        <div className='hidden lg:flex items-center gap-2 bg-desikit-green/5 border border-desikit-green/10 px-3.5 py-1.5 rounded-full select-none'>
                            <span className="text-xs font-bold text-desikit-green">📍</span>
                            <span className="text-xs font-extrabold text-desikit-green tracking-wide">{selectedLoc}</span>
                        </div>
                    </div>

                    {/* Role-based Nav Links */}
                    <div className='hidden lg:flex items-center gap-8 text-sm text-desikit-dark'>
                        {(user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER') && (
                            <Link to='/' className='font-semibold hover:text-leaf-green'>Home</Link>
                        )}
                        {(user?.role === 'FARMER' || user?.role === 'DELIVERY_PARTNER' || user?.role === 'ADMIN') && (
                            <button onClick={()=>navigate('/dashboard')} className='font-semibold hover:text-leaf-green'>Dashboard</button>
                        )}
                        {(user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER') && (
                            <>
                                <button onClick={()=>navigate('/dashboard/business-hub')} className='font-semibold hover:text-leaf-green'>Business Hub</button>
                                <Link to='/checkout' className='font-semibold hover:text-leaf-green'>Orders</Link>
                            </>
                        )}
                    </div>

                    {(user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER') && (
                        <div className='hidden lg:block flex-1 max-w-md'>
                            <Search/>
                        </div>
                    )}

                    <div className='flex items-center gap-3 justify-end'>
                        <button className='text-desikit-dark lg:hidden' onClick={handleMobileUser}>
                            <FaRegCircleUser size={26}/>
                        </button>
                        <div className='hidden lg:flex items-center gap-4'>
                            {
                                user?._id ? (
                                    <div className='relative'>
                                        <div onClick={()=>setOpenUserMenu(preve => !preve)} className='flex select-none items-center gap-1 cursor-pointer text-desikit-dark'>
                                            <p>Account</p>
                                            {
                                                openUserMenu ? (
                                                      <GoTriangleUp size={20}/> 
                                                ) : (
                                                    <GoTriangleDown size={20}/>
                                                )
                                            }
                                        </div>
                                        {
                                            openUserMenu && (
                                                <div className='absolute right-0 top-12'>
                                                    <div className='bg-white rounded-2xl p-4 min-w-52 shadow-lg'>
                                                        <UserMenu close={handleCloseUserMenu}/>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                ) : (
                                    <button onClick={redirectToLoginPage} className='text-sm font-semibold text-desikit-dark px-4 py-2 rounded-full hover:bg-desikit-soft'>Login</button>
                                )
                            }
                            {(user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER') && (
                                <button onClick={()=>setOpenCartSection(true)} className='flex items-center gap-3 bg-desikit-green hover:bg-leaf-green px-4 py-2 rounded-full text-white'>
                                    <div className='animate-bounce'>
                                        <BsCart4 size={22}/>
                                    </div>
                                    <div className='font-semibold text-sm'>
                                        {
                                            cartItem[0] ? (
                                                <div>
                                                    <p>{totalQty} Items</p>
                                                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                                                </div>
                                            ) : (
                                                <p>My Cart</p>
                                            )
                                        }
                                    </div>    
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
        }
        
        {(user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER') && (
            <div className='container mx-auto px-4 lg:hidden'>
                <Search/>
            </div>
        )}

        {
            openCartSection && (
                <DisplayCartItem close={()=>setOpenCartSection(false)}/>
            )
        }
    </header>
  )
}

export default Header
