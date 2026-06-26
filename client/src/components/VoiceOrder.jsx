import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { FaMicrophone, FaMicrophoneSlash, FaLanguage, FaVolumeUp } from 'react-icons/fa';

const VoiceOrder = () => {
    const { fetchCartItem } = useGlobalContext();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lang, setLang] = useState('en-US'); // Default to English
    const [statusText, setStatusText] = useState('Click mic to order via voice');

    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
    }

    const parseAndAddToCart = async (speechText) => {
        setStatusText("Parsing your voice request...");
        const text = speechText.toLowerCase();

        // Basic multilingual translation/mapping
        let searchKeyword = "";
        let quantity = 1;

        // Keywords detection
        if (text.includes("milk") || text.includes("doodh") || text.includes("dudh")) {
            searchKeyword = "Milk";
        } else if (text.includes("paneer") || text.includes("cheese")) {
            searchKeyword = "Paneer";
        } else if (text.includes("curd") || text.includes("dahi") || text.includes("yogurt")) {
            searchKeyword = "Curd";
        } else if (text.includes("ghee")) {
            searchKeyword = "Ghee";
        } else if (text.includes("butter") || text.includes("makkhan")) {
            searchKeyword = "Butter";
        } else if (text.includes("vegetable") || text.includes("sabzi") || text.includes("sabji")) {
            searchKeyword = "Vegetables";
        } else if (text.includes("fruit") || text.includes("fal")) {
            searchKeyword = "Fruits";
        } else {
            // General fallback
            searchKeyword = text.split(" ").slice(-1)[0] || "Milk";
        }

        // Quantity parsing
        const numMatch = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|1|2|3|4|5|6|7|8|9|10)\b/);
        const hindiNumMatch = text.match(/\b(ek|do|teen|chaar|paanch|chhah|saat|aath|nau|das)\b/);

        if (numMatch) {
            const numWord = numMatch[1];
            const numMap = { one: 1, two: 2, three: 3, four: 4, five: 5, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
            quantity = numMap[numWord] || 1;
        } else if (hindiNumMatch) {
            const numWord = hindiNumMatch[1];
            const hindiMap = { ek: 1, do: 2, teen: 3, chaar: 4, paanch: 5 };
            quantity = hindiMap[numWord] || 1;
        }

        try {
            // Search for product matching the keyword
            const searchRes = await Axios({
                ...SummaryApi.searchProduct,
                data: { search: searchKeyword }
            });

            if (searchRes.data?.success && searchRes.data?.data?.length > 0) {
                const matchedProduct = searchRes.data.data[0];
                
                // Add to cart
                for (let i = 0; i < quantity; i++) {
                    await Axios({
                        ...SummaryApi.addTocart,
                        data: { productId: matchedProduct._id }
                    });
                }
                
                toast.success(`Added ${quantity} x ${matchedProduct.name} to Cart!`);
                setStatusText(`Success: Added ${quantity} x ${matchedProduct.name}`);
                if (fetchCartItem) fetchCartItem();
            } else {
                toast.error(`Could not find products for "${searchKeyword}"`);
                setStatusText(`Not found: "${searchKeyword}"`);
            }
        } catch (error) {
            console.error("Voice order error:", error);
            toast.error("Failed to parse and add item");
            setStatusText("Error processing request");
        }
    };

    const toggleListening = () => {
        if (!recognition) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            setTranscript('');
            setStatusText("Listening... Speak now");
            recognition.lang = lang;
            recognition.start();
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event) => {
            const currentResult = event.results[0][0].transcript;
            setTranscript(currentResult);
            setIsListening(false);
            parseAndAddToCart(currentResult);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            setStatusText(`Error: ${event.error}. Try again.`);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }, [lang]);

    return (
        <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-desikit-green/20 rounded-full shadow-md max-w-sm">
            <button
                onClick={toggleListening}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                    isListening
                        ? 'bg-red-500 animate-pulse text-white shadow-red-300'
                        : 'bg-desikit-green hover:bg-leaf-green text-white'
                }`}
                title="Speak to order"
            >
                {isListening ? <FaMicrophoneSlash className="text-lg" /> : <FaMicrophone className="text-lg" />}
            </button>
            <div className="flex flex-col flex-1 text-left min-w-[150px]">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                    <FaVolumeUp className="text-desikit-green" /> Smart Voice Order
                </span>
                <span className="text-xs font-medium text-gray-700 truncate w-36">
                    {transcript || statusText}
                </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                <FaLanguage className="text-gray-500 mr-1 text-sm" />
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-gray-600 outline-none cursor-pointer"
                >
                    <option value="en-US">English</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="hi-IN">Haryanvi</option>
                </select>
            </div>
        </div>
    );
};

export default VoiceOrder;
