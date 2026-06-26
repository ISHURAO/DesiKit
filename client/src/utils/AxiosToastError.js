import toast from "react-hot-toast"

const AxiosToastError = (error)=>{
    if (error?.response?.data?.message) {
        toast.error(
            error.response.data.message
        )
    } else {
        toast.error("Service unavailable. Please check your connection or server status.")
    }
}

export default AxiosToastError