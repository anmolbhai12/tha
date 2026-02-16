import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Home, Navigation, Search, User, Crown, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

const FoxAvatar = ({ size = 40 }) => {
    const [imgSrc, setImgSrc] = useState("/fox.png");
    const [useFallback, setUseFallback] = useState(false);

    return (
        <div style={{
            width: size, height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #ff8c00', // Fox Orange
            background: 'var(--bg-dark, #111)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 15px rgba(255, 140, 0, 0.4)'
        }}>
            {!useFallback ? (
                <img
                    src={imgSrc}
                    alt="FoxBot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setUseFallback(true)}
                />
            ) : (
                /* 🦊 Friendly Cartoon Fox Avatar SVG */
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Ears */}
                    <path d="M25 35L35 15L45 35H25Z" fill="#ff8c00" />
                    <path d="M55 35L65 15L75 35H55Z" fill="#ff8c00" />
                    <path d="M30 35L35 22L40 35H30Z" fill="#111" />
                    <path d="M60 35L65 22L70 35H60Z" fill="#111" />

                    {/* Face Base */}
                    <circle cx="50" cy="55" r="35" fill="#ff8c00" />

                    {/* White Cheeks */}
                    <circle cx="35" cy="65" r="15" fill="#fff" />
                    <circle cx="65" cy="65" r="15" fill="#fff" />

                    {/* Eyes */}
                    <circle cx="40" cy="55" r="4" fill="#111" />
                    <circle cx="60" cy="55" r="4" fill="#111" />

                    {/* Nose */}
                    <circle cx="50" cy="68" r="5" fill="#111" />

                    {/* Little Sparkle */}
                    <circle cx="42" cy="53" r="1.5" fill="#fff" />
                    <circle cx="62" cy="53" r="1.5" fill="#fff" />
                </svg>
            )}
        </div>
    );
};

const FoxBot = ({ properties, setView, setSelectedProperty, userName, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: `Hi! I am Foxy. 🦊 I'm a clever assistant here to help you track down the best property masterpieces. What's on your mind?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const botRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        gsap.from(botRef.current, {
            scale: 0,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.7)'
        });
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        if (!user) {
            const authMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: "I only share my clever property tracks with members. 🦊 Please login to hunt for your next masterpiece!"
            };
            setMessages(prev => [...prev, authMsg]);
            setIsTyping(false);
            setInput('');
            setTimeout(() => setView('auth'), 2500);
            return;
        }

        setTimeout(() => {
            processResponse(input);
        }, 1200);
    };

    const processResponse = (query) => {
        const q = query.toLowerCase();
        let responseText = "";
        let relevantProperties = [];

        // Expanded keyword detection
        const searchKeywords = ['property', 'home', 'house', 'price', 'flat', 'apartment', 'villa', 'plot', 'bhk', 'rent', 'buy', 'sell'];
        const isSearchQuery = searchKeywords.some(keyword => q.includes(keyword)) || q.includes('in ');

        if (isSearchQuery) {
            relevantProperties = properties.filter(p => {
                const titleMatch = q.split(' ').some(word => word.length > 2 && p.title.toLowerCase().includes(word));
                const locationMatch = q.split(' ').some(word => word.length > 2 && p.location.toLowerCase().includes(word));
                const typeMatch = q.split(' ').some(word => word.length > 2 && p.type.toLowerCase().includes(word));
                return titleMatch || locationMatch || typeMatch;
            }).slice(0, 3);

            if (relevantProperties.length > 0) {
                responseText = `I've tracked down the best matches for your search! Fox AI is clever like that. Check these out:`;
            } else if (properties.length === 0) {
                responseText = `I've scanned the entire marketplace, but it looks empty! No one has listed a masterpiece yet. You should be the first! 🦊💎`;
            } else {
                responseText = `I've looked everywhere, but I couldn't find a match for "${query}" yet. Try searching for something else!`;
            }
        } else if (q.includes('hello') || q.includes('hi') || q.includes('who are you')) {
            responseText = `I am Foxy! 🦊 Your clever real estate tracker. I help you find properties that fit your legend. Just tell me what location or type you're looking for!`;
        } else {
            responseText = `I am currently searching our database for "${query}". Here are the top results from our elite collection:`;
            relevantProperties = properties.slice(0, 2);
        }

        const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: responseText,
            props: relevantProperties
        };

        setIsTyping(false);
        setMessages(prev => [...prev, botMsg]);
    };

    const handlePropClick = (prop) => {
        setSelectedProperty(prop);
        setView('detail');
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: window.innerWidth < 768 ? '20px' : '30px', right: window.innerWidth < 768 ? '20px' : '30px', zIndex: 9999, fontFamily: 'var(--font-main)' }} ref={botRef}>
            {!isOpen && (
                <div style={{ position: 'relative' }}>
                    <div className="fox-hint" style={{
                        position: 'absolute', bottom: '85px', right: '0',
                        background: '#ff8c00', color: '#fff',
                        padding: '8px 16px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        animation: 'bounce 2s infinite', pointerEvents: 'none',
                        border: '2px solid #fff'
                    }}>
                        ASK FOXY ANYTHING
                        <div style={{
                            position: 'absolute', bottom: '-8px', right: '25px',
                            width: '0', height: '0', borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent', borderTop: '8px solid #fff'
                        }}></div>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="fox-bubble"
                        style={{
                            width: '85px', height: '85px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            boxShadow: '0 0 40px rgba(255, 140, 0, 0.4), inset 0 0 20px rgba(255, 140, 0, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '3px solid #ff8c00', cursor: 'pointer',
                            animation: 'shake 10s ease-in-out infinite',
                            padding: '0', overflow: 'hidden'
                        }}
                    >
                        <FoxAvatar size={85} />
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="glass" style={{
                    width: window.innerWidth < 500 ? '90vw' : '380px',
                    height: window.innerWidth < 500 ? '70vh' : '550px',
                    borderRadius: '24px',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid #ff8c00', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(25px)', animation: 'slideUp 0.4s ease-out'
                }}>
                    <div style={{
                        padding: '20px', borderBottom: '1px solid rgba(255,140,0,0.2)',
                        background: 'rgba(255, 140, 0, 0.1)', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FoxAvatar size={45} />
                            <div>
                                <h4 style={{ color: '#ff8c00', fontSize: '1.1rem', margin: 0 }}>Foxy</h4>
                                <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }}></div>
                                    {user ? 'Foxy is online' : '🔒 Login to chat with Foxy'}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
                    </div>

                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }} ref={scrollRef}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%'
                            }}>
                                <div style={{
                                    padding: '12px 18px', borderRadius: msg.type === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                    background: msg.type === 'user' ? '#ff8c00' : 'rgba(255,255,255,0.05)',
                                    color: msg.type === 'user' ? '#fff' : 'var(--text-primary)',
                                    fontSize: '0.95rem', border: msg.type === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                                {msg.props && msg.props.length > 0 && (
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {msg.props.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handlePropClick(p)}
                                                style={{
                                                    padding: '10px', borderRadius: '12px', background: 'rgba(255, 140, 0, 0.05)',
                                                    border: '1px solid #ff8c00', cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', gap: '10px'
                                                }}
                                            >
                                                <img src={p.image} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: 600, color: '#fff' }}>{p.title}</p>
                                                    <p style={{ fontSize: '0.7rem', margin: 0, color: '#ff8c00' }}>₹{p.price.toLocaleString()}</p>
                                                </div>
                                                <Navigation size={14} color="#ff8c00" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', padding: '12px 18px', borderRadius: '20px 20px 20px 0', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '4px' }}>
                                <div className="typing-dot" style={{ background: '#ff8c00' }}></div>
                                <div className="typing-dot" style={{ background: '#ff8c00' }}></div>
                                <div className="typing-dot" style={{ background: '#ff8c00' }}></div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,140,0,0.1)' }}>
                        <div style={{
                            display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)',
                            borderRadius: '100px', padding: '5px 5px 5px 20px', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <input
                                placeholder="Track down properties with Foxy..."
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: 0, fontSize: '0.9rem', color: '#fff' }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: '#ff8c00', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Send size={18} color="#fff" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
                @keyframes shake { 0%, 100% { transform: rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: rotate(-2deg); } 20%, 40%, 60%, 80% { transform: rotate(2deg); } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .typing-dot { width: 6px; height: 6px; border-radius: 50%; margin: 0 2px; animation: blink 1.4s infinite both; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default FoxBot;
