import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory,setAllSubCategory,setLoadingCategory } from './store/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { handleAddItemCart } from './store/cartProduct'
import GlobalProvider from './provider/GlobalProvider';
import { FaCartShopping } from "react-icons/fa6";
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const allCategory = useSelector(state => state.product.allCategory)
  const user = useSelector(state => state.user)
  

  const fetchUser = async()=>{
      const userData = await fetchUserDetails()
      dispatch(setUserDetails(userData.data))
  }

  const fetchCategory = async()=>{
    try {
        dispatch(setLoadingCategory(true))
        const response = await Axios({
            ...SummaryApi.getCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        }
    } catch (error) {
        
    }finally{
      dispatch(setLoadingCategory(false))
    }
  }

  const fetchSubCategory = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        }
    } catch (error) {
        
    }finally{
    }
  }

  

  useEffect(()=>{
    fetchUser()
    fetchCategory()
    fetchSubCategory()
    // fetchCartItem()
  },[])

  return (
    <GlobalProvider> 
      <Header/>
      
      {/* Category filter sub-header */}
      {allCategory && allCategory.length > 0 && 
       !location.pathname.includes('/dashboard') && 
       !location.pathname.includes('/farmer') && 
       !location.pathname.includes('/delivery') && 
       !location.pathname.includes('/admin') && 
       user?.role !== 'FARMER' && user?.role !== 'DELIVERY_PARTNER' && (
          <div className="bg-white border-b border-desikit-soft py-2.5 px-4 shadow-sm overflow-x-auto scrollbar-none sticky top-20 z-30">
              <div className="container mx-auto flex items-center gap-3 text-xs font-extrabold whitespace-nowrap scrollbar-none">
                  <span className="text-gray-400 uppercase tracking-widest text-[9px] font-black mr-2">Category Filter:</span>
                  <button 
                      onClick={() => navigate('/')} 
                      className="bg-desikit-green text-white px-3 py-1.5 rounded-full hover:bg-leaf-green shadow-sm transition"
                  >
                      All Produce
                  </button>
                  {allCategory.map((cat) => (
                      <button
                          key={cat._id}
                          onClick={() => navigate(`/?filter=${cat.name.toLowerCase()}`)}
                          className="text-gray-600 hover:text-desikit-green hover:border-desikit-green bg-milk-cream border border-desikit-soft px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm font-bold"
                      >
                          <img 
                              src={(Array.isArray(cat.image) ? cat.image[0] : cat.image) || 'https://images.unsplash.com/photo-1550583724-b2692b85b150'} 
                              className="w-5 h-5 rounded-full object-cover border" 
                              alt="" 
                          />
                          {cat.name}
                      </button>
                  ))}
                  <button 
                      onClick={() => navigate('/?filter=rentals')} 
                      className="text-gray-600 hover:text-desikit-green hover:border-desikit-green bg-milk-cream border border-desikit-soft px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm font-bold"
                  >
                      🚜 Tractor & Tools Rental
                  </button>
              </div>
          </div>
      )}

      <main className='min-h-[78vh]'>
          <Outlet/>
      </main>
      <Footer/>
      <Toaster/>
      {
        location.pathname !== '/checkout' && (
          <CartMobileLink/>
        )
      }
    </GlobalProvider>
  )
}

export default App
