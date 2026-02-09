import React, { useState, useEffect } from 'react';
import {
    Search,
    MapPin,
    Home as HomeIcon,
    PlusCircle,
    User,
    MessageSquare,
    Bed,
    Bath,
    Maximize,
    ChevronRight,
    ArrowRight,
    Plus,
    X,
    Send,
    Camera
} from 'lucide-react';

// Test file to build sticky search component separately
const StickySearch = ({ isExpanded, onClose, searchQuery, setSearchQuery }) => {
    if (!isExpanded) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--accent-gold)',
                padding: '20px 0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
        >
            <div className="container">
                {/* Search Bar */}
                <div className="glass" style={{ padding: '10px', borderRadius: '100px', display: 'flex', maxWidth: '800px', margin: '0 auto', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px', flex: 1 }}>
                        <Search size={22} color="var(--accent-gold)" />
                        <input
                            autoFocus
                            placeholder="Search by location..."
                            style={{ background: 'transparent', border: 'none', padding: '12px 0', width: '100%', color: '#fff' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-gold)',
                                cursor: 'pointer',
                                padding: '5px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <button className="premium-button">Find Homes</button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                        <option value="all">🏢 All Types</option>
                        <option value="residential">🏠 Residential</option>
                        <option value="commercial">🏪 Commercial</option>
                        <option value="industrial">🏭 Industrial</option>
                        <option value="agricultural">🌾 Agricultural</option>
                    </select>

                    <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                        <option value="all">📐 Any Area</option>
                        <option value="small">500-1000 sq ft</option>
                        <option value="medium">1000-2000 sq ft</option>
                        <option value="large">2000-5000 sq ft</option>
                        <option value="xlarge">5000+ sq ft</option>
                    </select>

                    <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                        <option value="all">💰 Any Budget</option>
                        <option value="budget">Under ₹50L</option>
                        <option value="mid">₹50L - ₹1Cr</option>
                        <option value="premium">₹1Cr - ₹5Cr</option>
                        <option value="luxury">₹5Cr+</option>
                    </select>

                    <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                        <option value="all">🔑 Rent or Sale</option>
                        <option value="sale">💵 For Sale</option>
                        <option value="rent">🏘️ For Rent</option>
                        <option value="lease">📋 Lease</option>
                        <option value="security">🛡️ Security</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default StickySearch;
