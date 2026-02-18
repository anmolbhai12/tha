import React, { useEffect, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';

const StickySearch = ({
    isExpanded,
    onClose,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterArea,
    setFilterArea,
    filterBudget,
    setFilterBudget,
    t
}) => {
    const inputRef = useRef(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    if (!isExpanded) return null;

    return (
        <div
            className="animate-fade"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 4000,
                background: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(30px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
            }}
        >
            {/* Header / Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Title */}
            <h2 style={{
                color: 'var(--accent-gold)',
                fontFamily: 'Playfair Display',
                fontSize: '2rem',
                marginBottom: '5px'
            }}>
                {t?.buyer?.searchPlaceholder || "Find Your Home"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                Search by location, project, or type...
            </p>

            {/* Search Input */}
            <div className="glass" style={{
                padding: '15px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '30px',
                border: '1px solid var(--accent-gold)'
            }}>
                <Search size={24} color="var(--accent-gold)" />
                <input
                    ref={inputRef}
                    autoFocus
                    placeholder={t?.buyer?.searchPlaceholder || "Search properties..."}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.2rem',
                        width: '100%',
                        color: '#fff',
                        outline: 'none'
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', overflowY: 'auto' }}>
                {/* Type Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Property Type</label>
                    <select
                        className="glass"
                        style={{
                            padding: '12px',
                            borderRadius: '15px',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">{t?.filters?.allTypes || "All Types"}</option>
                        <option value="residential">{t?.filters?.residential || "Residential"}</option>
                        <option value="commercial">{t?.filters?.commercial || "Commercial"}</option>
                        <option value="industrial">{t?.filters?.industrial || "Industrial"}</option>
                        <option value="agricultural">{t?.filters?.agricultural || "Agricultural"}</option>
                    </select>
                </div>

                {/* Budget Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Budget Range</label>
                    <select
                        className="glass"
                        style={{
                            padding: '12px',
                            borderRadius: '15px',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                        value={filterBudget}
                        onChange={(e) => setFilterBudget(e.target.value)}
                    >
                        <option value="all" style={{ background: '#000' }}>{t?.filters?.anyBudget || "Any Budget"}</option>
                        <option value="budget" style={{ background: '#000' }}>{t?.ranges?.under50L || "Under ₹50L"}</option>
                        <option value="mid" style={{ background: '#000' }}>{t?.ranges?.midRange || "₹50L - ₹1Cr"}</option>
                        <option value="premium" style={{ background: '#000' }}>{t?.ranges?.premiumRange || "₹1Cr - ₹5Cr"}</option>
                        <option value="luxury" style={{ background: '#000' }}>{t?.ranges?.luxuryRange || "₹5Cr+"}</option>
                    </select>
                </div>

                {/* Area Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Area Size</label>
                    <select
                        className="glass"
                        style={{
                            padding: '12px',
                            borderRadius: '15px',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                    >
                        <option value="all">{t?.filters?.anyArea || "Any Area"}</option>
                        <option value="small">{t?.ranges?.smallArea || "500-1000 sq ft"}</option>
                        <option value="medium">{t?.ranges?.mediumArea || "1000-2000 sq ft"}</option>
                        <option value="large">{t?.ranges?.largeArea || "2000-5000 sq ft"}</option>
                        <option value="xlarge">{t?.ranges?.xlargeArea || "5000+ sq ft"}</option>
                    </select>
                </div>
            </div>

            {/* Action Button */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button
                    onClick={onClose}
                    className="premium-button"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        padding: '18px'
                    }}
                >
                    View Properties
                </button>
            </div>
        </div>
    );
};

export default StickySearch;
