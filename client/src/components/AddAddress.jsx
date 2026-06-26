import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset, setValue } = useForm()
    const { fetchAddress } = useGlobalContext()
    const [detecting, setDetecting] = React.useState(false)

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await response.json();
                
                if (data && data.address) {
                    const addr = data.address;
                    const addressLine = [
                        addr.road || '',
                        addr.suburb || '',
                        addr.neighbourhood || ''
                    ].filter(Boolean).join(', ') || data.display_name || '';

                    setValue("addressline", addressLine);
                    setValue("city", addr.city || addr.town || addr.village || addr.county || '');
                    setValue("state", addr.state || '');
                    setValue("pincode", addr.postcode || '');
                    setValue("country", addr.country || '');
                    toast.success("Precise location auto-detected successfully!");
                } else {
                    toast.error("Could not parse location address details.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to reverse-geocode coordinates.");
            } finally {
                setDetecting(false);
            }
        }, (error) => {
            console.error(error);
            toast.error("Permission denied or location lookup failed.");
            setDetecting(false);
        }, { enableHighAccuracy: true });
    };

    const onSubmit = async(data)=>{
        console.log("data",data)
    
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data : {
                    address_line :data.addressline,
                    city : data.city,
                    state : data.state,
                    country : data.country,
                    pincode : data.pincode,
                    mobile : data.mobile
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto'>
        <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
            <div className='flex justify-between items-center gap-4 border-b pb-2'>
                <h2 className='font-semibold text-desikit-dark'>Add Address</h2>
                <button onClick={close} className='hover:text-red-500'>
                    <IoClose  size={25}/>
                </button>
            </div>
            <button 
                type='button' 
                onClick={handleAutoDetectLocation}
                disabled={detecting}
                className='w-full mt-3 py-2.5 px-4 bg-desikit-green/10 text-desikit-green border border-desikit-green/20 hover:bg-desikit-green/20 rounded font-bold text-xs flex justify-center items-center gap-2 transition-all disabled:opacity-50'
            >
                {detecting ? (
                    <>
                        <span className='animate-spin rounded-full h-3.5 w-3.5 border-2 border-t-transparent border-desikit-green inline-block' />
                        Detecting Precise Location...
                    </>
                ) : (
                    <>
                        🎯 Auto-Detect My Live Location
                    </>
                )}
            </button>
            <form className='mt-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-1'>
                    <label htmlFor='addressline'>Address Line :</label>
                    <input
                        type='text'
                        id='addressline' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("addressline",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='city'>City :</label>
                    <input
                        type='text'
                        id='city' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("city",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='state'>State :</label>
                    <input
                        type='text'
                        id='state' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("state",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='pincode'>Pincode :</label>
                    <input
                        type='text'
                        id='pincode' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("pincode",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='country'>Country :</label>
                    <input
                        type='text'
                        id='country' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("country",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='mobile'>Mobile No. :</label>
                    <input
                        type='text'
                        id='mobile' 
                        className='border bg-farm-cream p-2 rounded'
                        {...register("mobile",{required : true})}
                    />
                </div>

                <button type='submit' className='bg-desikit-green w-full  py-2 font-semibold mt-4 hover:bg-desikit-soft'>Submit</button>
            </form>
        </div>
    </section>
  )
}

export default AddAddress
