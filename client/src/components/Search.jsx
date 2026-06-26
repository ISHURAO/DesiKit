import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft, FaMicrophone } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import toast from 'react-hot-toast';

const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage,setIsSearchPage] = useState(false)
    const [ isMobile ] = useMobile()
    const params = useLocation()
    const searchText = params.search.slice(3)
    const [isListening, setIsListening] = useState(false)

    useEffect(()=>{
        const isSearch = location.pathname === "/search"
        setIsSearchPage(isSearch)
    },[location])

    const redirectToSearchPage = ()=>{
        navigate("/search")
    }

    const handleOnChange = (e)=>{
        const value = e.target.value
        const url = `/search?q=${value}`
        navigate(url)
    }

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition not supported in this browser. Simulating: 'Pure Honey'");
            const url = `/search?q=Pure Honey`
            navigate(url)
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            toast("Listening for search query...", { icon: '🎙️' });
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            toast.error("Could not capture speech. Simulating: 'Fresh Milk'");
            const url = `/search?q=Fresh Milk`;
            navigate(url);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            toast.success(`Searching: "${transcript}"`);
            const url = `/search?q=${transcript}`;
            navigate(url);
        };

        recognition.start();
    }

  return (
    <div className={`w-full min-w-[300px] lg:min-w-[420px] h-12 rounded-2xl border ${isListening ? 'border-desikit-green bg-green-50 animate-pulse' : 'border-desikit-soft bg-milk-cream'} overflow-hidden flex items-center text-neutral-600 group focus-within:border-desikit-green transition-all`}>
        <div>
            {
                (isMobile && isSearchPage ) ? (
                    <Link to={"/"} className='flex justify-center items-center h-full p-2 m-1 text-desikit-dark bg-white rounded-full shadow-md'>
                        <FaArrowLeft size={18}/>
                    </Link>
                ) :(
                    <button className='flex justify-center items-center h-full p-3 text-desikit-dark'>
                        <IoSearch size={22}/>
                    </button>
                )
            }
        </div>
        <div className='w-full h-full flex-1'>
            {
                !isSearchPage ? (
                     <div onClick={redirectToSearchPage} className='w-full h-full flex items-center px-2 cursor-pointer'>
                        <TypeAnimation
                                sequence={[
                                    'Search "farm milk"',
                                    1000,
                                    'Search "fresh paneer"',
                                    1000,
                                    'Search "organic vegetables"',
                                    1000,
                                    'Search "farm eggs"',
                                    1000
                                ]}
                                wrapper="span"
                                speed={50}
                                repeat={Infinity}
                            />
                     </div>
                ) : (
                    <div className='w-full h-full'>
                        <input
                            type='text'
                            placeholder='Search fresh dairy, vegetables, and more.'
                            autoFocus
                            defaultValue={searchText}
                            className='bg-transparent w-full h-full outline-none text-desikit-dark px-2'
                            onChange={handleOnChange}
                        />
                    </div>
                )
            }
        </div>
        <button 
            type="button" 
            onClick={handleVoiceSearch} 
            className={`p-3 mr-1 rounded-full text-desikit-dark hover:bg-desikit-soft transition-all ${isListening ? 'text-desikit-green scale-110' : ''}`}
            title="Search by Voice"
        >
            <FaMicrophone size={18} />
        </button>
    </div>
  )
}

export default Search
