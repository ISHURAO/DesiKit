import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast';

const SupportDashboard = () => {
    const user = useSelector(state => state.user);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [initialMessage, setInitialMessage] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const fetchTickets = async () => {
        try {
            const response = await Axios.get('/support/tickets/my');
            if (response.data.success) {
                setTickets(response.data.data);
                // Keep selected ticket updated if open
                if (selectedTicket) {
                    const updated = response.data.data.find(t => t._id === selectedTicket._id);
                    if (updated) setSelectedTicket(updated);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 5000); // Poll for replies
        return () => clearInterval(interval);
    }, [selectedTicket]);

    useEffect(() => {
        // Scroll to bottom when chat updates
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newSubject || !initialMessage) {
            toast.error("Subject and message are required");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.post('/support/ticket/create', {
                subject: newSubject,
                message: initialMessage
            });
            if (response.data.success) {
                toast.success("Support ticket created!");
                setNewSubject('');
                setInitialMessage('');
                setShowCreateForm(false);
                fetchTickets();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await Axios.post('/support/ticket/message', {
                ticketId: selectedTicket._id,
                text: newMessage
            });
            if (response.data.success) {
                setNewMessage('');
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    return (
        <div className='p-6 max-w-5xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col'>
            <div className='flex justify-between items-center flex-shrink-0'>
                <div>
                    <h1 className='text-3xl font-extrabold text-desikit-dark'>Customer Support Chat</h1>
                    <p className='text-sm text-gray-500'>Direct messages with our farm care specialists.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className='bg-desikit-green text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-leaf-green transition-all shadow-md shadow-desikit-green/10'
                >
                    {showCreateForm ? 'Back to Chats' : 'New Ticket'}
                </button>
            </div>

            {showCreateForm ? (
                <div className='bg-white p-6 rounded-3xl border border-desikit-soft shadow-sm max-w-lg mx-auto w-full flex-shrink-0'>
                    <h2 className='text-xl font-bold mb-4 text-desikit-dark'>Open New Support Ticket</h2>
                    <form onSubmit={handleCreateTicket} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-bold text-gray-600 mb-1'>Topic / Subject</label>
                            <input
                                type='text'
                                placeholder='e.g., Damaged Paneer delivery, Missing milk'
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green bg-white'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-gray-600 mb-1'>Detailed Message</label>
                            <textarea
                                placeholder='Describe your issue...'
                                value={initialMessage}
                                onChange={(e) => setInitialMessage(e.target.value)}
                                className='w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-desikit-green h-32 bg-white'
                                required
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-desikit-green text-white py-3 rounded-xl font-semibold hover:bg-leaf-green disabled:bg-gray-400'
                        >
                            {loading ? 'Submitting...' : 'Submit Support Request'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className='flex-1 grid grid-cols-1 md:grid-cols-[280px,1fr] border border-desikit-soft bg-white rounded-3xl overflow-hidden shadow-sm min-h-0'>
                    {/* Sidebar: Tickets list */}
                    <div className='border-r border-desikit-soft overflow-y-auto flex flex-col'>
                        <div className='p-4 border-b font-bold text-gray-700 bg-gray-50 text-sm flex-shrink-0'>Active Tickets</div>
                        <div className='flex-1 divide-y divide-gray-100'>
                            {tickets.length > 0 ? (
                                tickets.map(ticket => (
                                    <button
                                        key={ticket._id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`w-full text-left p-4 hover:bg-desikit-soft/40 transition-all flex flex-col gap-1 ${selectedTicket?._id === ticket._id ? 'bg-desikit-soft/70 border-l-4 border-desikit-green' : ''}`}
                                    >
                                        <div className='flex justify-between items-center w-full'>
                                            <span className='font-semibold text-sm truncate text-gray-800 pr-1'>{ticket.subject}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <span className='text-xs text-gray-400 truncate'>
                                            {ticket.messages[ticket.messages.length - 1]?.text || "No messages"}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className='text-xs text-gray-400 p-4 text-center'>No support tickets yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className='flex flex-col min-h-0 bg-milk-cream/30'>
                        {selectedTicket ? (
                            <>
                                {/* Header */}
                                <div className='p-4 border-b border-desikit-soft bg-white flex justify-between items-center flex-shrink-0'>
                                    <div>
                                        <h3 className='font-bold text-desikit-dark'>{selectedTicket.subject}</h3>
                                        <p className='text-xs text-gray-400'>Ticket ID: {selectedTicket._id}</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className='flex-1 p-4 overflow-y-auto space-y-4'>
                                    {selectedTicket.messages.map((msg, index) => {
                                        const isMe = msg.sender_id === user._id;
                                        return (
                                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl p-3.5 text-sm shadow-sm ${isMe ? 'bg-desikit-green text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                                    <p>{msg.text}</p>
                                                    <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Form */}
                                {selectedTicket.status !== 'resolved' ? (
                                    <form onSubmit={handleSendMessage} className='p-3 border-t bg-white flex gap-2 flex-shrink-0'>
                                        <input
                                            type='text'
                                            placeholder='Type your message...'
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className='flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-desikit-green bg-white'
                                        />
                                        <button
                                            type='submit'
                                            className='bg-desikit-green text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-leaf-green'
                                        >
                                            Send
                                        </button>
                                    </form>
                                ) : (
                                    <div className='p-3 text-center bg-gray-50 border-t font-semibold text-gray-500 text-xs flex-shrink-0'>
                                        ✓ This ticket has been marked resolved. Send a new ticket or admin will reopen on message.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='flex-1 flex flex-col justify-center items-center text-gray-400 p-8'>
                                <p className='text-lg font-semibold'>Select a ticket or open a new one</p>
                                <p className='text-xs mt-1'>We usually reply in under 10 minutes.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportDashboard;
