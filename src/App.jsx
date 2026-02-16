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
  Camera,
  Mail,
  Hash,
  Languages,
  LogOut,
  ArrowLeft,
  Check,
  Play,
  Phone
} from 'lucide-react';
import { translations } from './translations';
import { gsap } from 'gsap';
import FoxBot from './FoxBot.jsx';
import Peer from 'peerjs';

// Mock Data
const INITIAL_PROPERTIES = [];

// Navigation Component
const Nav = ({
  t, view, setView, searchQuery, setSearchQuery,
  isSearchActive, setIsSearchActive, filterType, setFilterType,
  filterArea, setFilterArea, filterBudget, setFilterBudget,
  user, setUser, showProfileMenu, setShowProfileMenu,
  language, setLanguage, isChoosingLanguage, setIsChoosingLanguage,
  setIsEditingName, setTempName, showConfirm
}) => (
  <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '1rem 0' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setView('landing')}>
        <img src="/logo-tha-horizontal.svg" alt="Tha Logo" style={{ height: '70px', width: 'auto' }} />
      </div>

      <div className="nav-search-container">
        {/* Global Search Bar - Now truly global */}
        <div style={{ width: '100%', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder={t.buyer.searchPlaceholder || 'Search properties...'}
            value={searchQuery}
            onFocus={() => setIsSearchActive(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && view !== 'buyer') {
                setView('buyer');
                setIsSearchActive(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur();
                setIsSearchActive(false);
              }
            }}
            style={{
              width: '100%',
              padding: '10px 15px 10px 45px',
              borderRadius: '100px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              position: 'relative',
              zIndex: 2
            }}
          />
        </div>

        {/* Quick Filters - Visible when search is active or has query */}
        {(isSearchActive || searchQuery || (view === 'buyer' && searchQuery)) && (
          <div className="animate-fade" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <select
              className="glass"
              style={{ padding: '6px 12px', borderRadius: '20px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.75rem', background: 'rgba(212,175,55,0.05)' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{t.filters.allTypes}</option>
              <option value="residential">{t.filters.residential}</option>
              <option value="commercial">{t.filters.commercial}</option>
              <option value="industrial">{t.filters.industrial}</option>
              <option value="agricultural">{t.filters.agricultural}</option>
            </select>
            <select
              className="glass"
              style={{ padding: '6px 12px', borderRadius: '20px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.75rem', background: 'rgba(212,175,55,0.05)' }}
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            >
              <option value="all">{t.filters.anyArea}</option>
              <option value="small">{t.ranges.smallArea}</option>
              <option value="medium">{t.ranges.mediumArea}</option>
              <option value="large">{t.ranges.largeArea}</option>
              <option value="xlarge">{t.ranges.xlargeArea}</option>
            </select>
            <select
              className="glass"
              style={{ padding: '6px 12px', borderRadius: '20px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.75rem', background: 'rgba(212,175,55,0.05)' }}
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
            >
              <option value="all">{t.filters.anyBudget}</option>
              <option value="budget">{t.ranges.under50L}</option>
              <option value="mid">{t.ranges.midRange}</option>
              <option value="premium">{t.ranges.premiumRange}</option>
              <option value="luxury">{t.ranges.luxuryRange}</option>
            </select>
          </div>
        )}
      </div>

      <div className="nav-buttons-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => user ? setView('seller') : setView('auth')} className="premium-button">
          <Plus size={18} /> <span className={window.innerWidth < 600 ? 'mobile-hide-text' : ''}>{t.nav.postProperty}</span>
        </button>

        <div style={{ position: 'relative' }}>
          {user ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,215,0,0.05)', padding: '5px 15px', borderRadius: '30px', border: '1px solid var(--accent-gold)' }}
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                if (!showProfileMenu) setIsChoosingLanguage(false);
              }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>{user.name || t.auth.legend}</span>
              <User size={20} color="var(--accent-gold)" />
            </div>
          ) : (
            <button
              onClick={() => setView('auth')}
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={20} />
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {showProfileMenu && user && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '240px',
                padding: '15px',
                borderRadius: '20px',
                zIndex: 1001,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid var(--accent-gold)'
              }}
            >
              <div style={{ marginBottom: '15px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{language === 'en' ? 'Logged in as' : 'लॉग इन किया है'}</p>
                <p style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{user.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.phone}</p>
              </div>

              {isChoosingLanguage ? (
                <div style={{ marginTop: '5px' }}>
                  <button
                    onClick={() => setIsChoosingLanguage(false)}
                    style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '10px', background: 'transparent', color: 'var(--accent-gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
                    className="menu-item-hover"
                  >
                    <ArrowLeft size={16} /> {language === 'en' ? 'Back' : 'पीछे'}
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsChoosingLanguage(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 15px', borderRadius: '10px', background: language === 'en' ? 'rgba(212,175,55,0.1)' : 'transparent', color: '#fff', border: '1px solid ' + (language === 'en' ? 'var(--accent-gold)' : 'transparent'), cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}
                    className="menu-item-hover"
                  >
                    <span>English</span>
                    {language === 'en' && <Check size={14} color="var(--accent-gold)" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setIsChoosingLanguage(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 15px', borderRadius: '10px', background: language === 'hi' ? 'rgba(212,175,55,0.1)' : 'transparent', color: '#fff', border: '1px solid ' + (language === 'hi' ? 'var(--accent-gold)' : 'transparent'), cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    className="menu-item-hover"
                  >
                    <span>हिन्दी</span>
                    {language === 'hi' && <Check size={14} color="var(--accent-gold)" />}
                  </button>
                </div>
              ) : (
                <>
                  {/* Edit Name Option */}
                  <button
                    onClick={() => {
                      setTempName(user.name);
                      setIsEditingName(true);
                    }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '10px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    className="menu-item-hover"
                  >
                    <User size={16} /> {language === 'en' ? 'Edit Name' : 'नाम बदलें'}
                  </button>

                  {/* My Properties Option */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setView('my-properties');
                    }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '10px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}
                    className="menu-item-hover"
                  >
                    <HomeIcon size={16} /> {t.nav.myProperties}
                  </button>

                  {/* Language Selection Trigger */}
                  <button
                    onClick={() => setIsChoosingLanguage(true)}
                    style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '10px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', marginTop: '5px' }}
                    className="menu-item-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Languages size={16} /> {language === 'en' ? 'Language' : 'भाषा'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)', fontSize: '0.8rem', opacity: 0.8 }}>
                      {language === 'en' ? 'English' : 'हिन्दी'} <ChevronRight size={14} />
                    </div>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(212,175,55,0.2)', margin: '10px 0' }}></div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      showConfirm(t.alerts.logout, () => {
                        setUser(null);
                        localStorage.removeItem('tha_user');
                        setView('landing');
                      });
                    }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '10px', background: 'transparent', color: '#ff4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    className="menu-item-hover"
                  >
                    <LogOut size={16} /> {t.nav.logout || 'Logout'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);

// Custom Modal Component (First definition, already outside App)
const CustomModal = ({ modal, closeModal }) => {
  if (!modal.show) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="glass animate-fade" style={{ padding: '35px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--accent-gold)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ marginBottom: '20px' }}>
          {modal.type === 'confirm' ? (
            <div style={{ width: '60px', height: '60px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid var(--accent-gold)' }}>
              <X size={30} color="var(--accent-gold)" />
            </div>
          ) : (
            <div style={{ width: '60px', height: '60px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid var(--accent-gold)' }}>
              <Check size={30} color="var(--accent-gold)" />
            </div>
          )}
        </div>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#fff', lineHeight: 1.5 }}>{modal.msg}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          {modal.type === 'confirm' && (
            <button
              onClick={closeModal}
              style={{ flex: 1, padding: '12px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (modal.type === 'confirm' && modal.onConfirm) modal.onConfirm();
              closeModal();
            }}
            className="premium-button"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {modal.type === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingView = ({ t, setView, setIsSearchActive }) => (
  <React.Fragment>
    <div className="hero-section" style={{ height: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="hero-bg"></div>
      <div className="container hero-content">
        <div className="animate-fade">
          <span className="badge">{t.hero.badge}</span>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1.5rem', maxWidth: '900px', lineHeight: 1.1, color: '#fff' }}>
            {t.hero.title.includes('Masterpiece') ? (
              <>
                {t.hero.title.split('Masterpiece')[0]}
                <span className="text-gradient-gold">Masterpiece</span>
                {t.hero.title.split('Masterpiece')[1]}
              </>
            ) : t.hero.title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
            {t.hero.subtitle}
          </p>
          <button onClick={() => { setView('buyer'); setIsSearchActive(true); }} className="premium-button" style={{ padding: '18px 40px', fontSize: '1.2rem', marginTop: '1rem' }}>
            {t.hero.findHomes} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
          </button>
        </div>
      </div>
    </div>
  </React.Fragment >
);

// Buyer View Component
const BuyerView = ({
  t, properties, searchQuery, filterType, filterArea, filterBudget, sortBy, setSortBy, setView, setSelectedProperty, user, language
}) => {
  const filteredProperties = properties.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || p.category?.toLowerCase() === filterType.toLowerCase();

    // Area filter logic
    let matchesArea = true;
    if (filterArea !== 'all') {
      const area = p.sqft || p.area || 0;
      if (filterArea === 'small') matchesArea = area < 1000;
      else if (filterArea === 'medium') matchesArea = area >= 1000 && area <= 3000;
      else if (filterArea === 'large') matchesArea = area > 3000 && area <= 8000;
      else if (filterArea === 'xlarge') matchesArea = area > 8000;
    }

    // Budget filter logic
    let matchesBudget = true;
    if (filterBudget !== 'all') {
      const price = p.price || 0;
      if (filterBudget === 'budget') matchesBudget = price < 5000000;
      else if (filterBudget === 'mid') matchesBudget = price >= 5000000 && price <= 15000000;
      else if (filterBudget === 'premium') matchesBudget = price > 15000000 && price <= 50000000;
      else if (filterBudget === 'luxury') matchesBudget = price > 50000000;
    }

    return matchesSearch && matchesType && matchesArea && matchesBudget;
  }).sort((a, b) => {
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'old') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem' }}>{searchQuery ? (language === 'en' ? 'Search Results' : 'खोज परिणाम') : t.buyer.title}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchQuery ? (language === 'en' ? `Found ${filteredProperties.length} matches` : `${filteredProperties.length} परिणाम मिले`) : t.buyer.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setView('buyer')}
            className="secondary-button"
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <HomeIcon size={18} /> {t.nav.marketplace || 'Marketplace'}
          </button>
          <select
            className="glass"
            style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', background: 'transparent' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest to Oldest</option>
            <option value="old">Oldest to Latest</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="priceLow">Price: Low to High</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredProperties.length === 0 ? (
          <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '30px' }}>
            <Search size={48} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '20px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              {language === 'en' ? 'No properties found matching your search.' : 'आपकी खोज से मेल खाने वाली कोई संपत्ति नहीं मिली।'}
            </p>
          </div>
        ) : (
          filteredProperties.map((p, index) => (
            <div
              key={p.id}
              className="glass animate-fade property-card-container"
              style={{
                animationDelay: `${index * 0.1}s`,
                cursor: 'pointer',
                borderRadius: '25px',
                overflow: 'hidden',
                display: 'flex',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                if (user) {
                  setSelectedProperty(p);
                  setView('detail');
                } else {
                  setView('auth');
                }
              }}
            >
              <div className="property-card-image-box">
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '15px', right: '15px',
                  background: 'var(--accent-gold)', color: '#000',
                  padding: '5px 15px', borderRadius: '20px',
                  fontWeight: 'bold', fontSize: '0.8rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  {p.category}
                </div>
              </div>

              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.8rem' }}>
                    ₹{p.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', fontFamily: 'Playfair Display' }}>{p.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '25px' }}>
                  <MapPin size={18} color="var(--accent-gold)" /> {p.location}
                </div>

                <div style={{
                  display: 'flex', gap: '25px', color: 'var(--text-secondary)',
                  borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bed size={20} color="var(--accent-gold)" />
                    <span>{p.beds} Beds</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bath size={20} color="var(--accent-gold)" />
                    <span>{p.baths} Baths</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Maximize size={20} color="var(--accent-gold)" />
                    <span>{p.sqft || p.area} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div >
  );
};

const PostPropertyView = ({ t, setView, user, handlePostProfessional }) => {
  const [sellerType, setSellerType] = useState('residential');
  const [previewMedia, setPreviewMedia] = useState([]); // Array of { type, url }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newMedia = [];
      let processedCount = 0;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newMedia.push({
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: reader.result,
            file: file
          });
          processedCount++;
          if (processedCount === files.length) {
            setPreviewMedia(prev => [...prev, ...newMedia]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index) => {
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  const sellerCategories = {
    residential: [t.filters.residential, t.filters.commercial, t.filters.industrial, t.filters.agricultural],
    commercial: ['Office Space', 'Shop/Showroom', 'Commercial Plot', 'Warehouse/Godown', 'Co-working'],
    industrial: ['Industrial Plot', 'Factory/Building', 'Shed/Godown'],
    agricultural: ['Farm Land', 'Farmhouse']
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div className="animate-fade">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem' }}>{t.seller.title.split(' ')[0]} <span className="text-gradient-gold">{t.seller.title.split(' ')[1]}</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>{t.seller.subtitle}</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handlePostProfessional(e, 'seller', previewMedia);
          }} className="glass" style={{ padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Multi-Media Upload Section */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--accent-gold)' }}>Property Photos & Videos</label>

              {/* Gallery Preview */}
              {previewMedia.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '10px',
                  marginBottom: '10px'
                }}>
                  {previewMedia.map((media, index) => (
                    <div key={index} style={{ position: 'relative', flex: '0 0 100px', height: '100px', borderRadius: '10px', overflow: 'hidden' }}>
                      {media.type === 'video' ? (
                        <video
                          src={media.url}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                        />
                      ) : (
                        <img src={media.url} alt={`preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        style={{
                          position: 'absolute', top: '5px', right: '5px',
                          background: 'rgba(0,0,0,0.7)', color: 'white',
                          border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => document.getElementById('prop-media-input').click()}
                    style={{
                      flex: '0 0 100px', height: '100px', borderRadius: '10px',
                      border: '1px dashed var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)'
                    }}
                  >
                    <Plus size={24} />
                  </div>
                </div>
              )}

              {!previewMedia.length && (
                <div
                  onClick={() => document.getElementById('prop-media-input').click()}
                  style={{
                    height: '150px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px dashed var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Camera size={30} style={{ marginBottom: '10px', opacity: 0.7 }} />
                    <p>Upload Photos & Videos</p>
                  </div>
                </div>
              )}

              <input
                id="prop-media-input"
                type="file"
                name="propertyMedia"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="input-group">
                <label>{t.seller.purpose}</label>
                <select name="purpose" className="glass">
                  <option>{t.filters.forSale}</option>
                  <option>{t.filters.forRent}</option>
                  <option>{t.filters.lease}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t.seller.category}</label>
                <select name="category" className="glass">
                  {sellerCategories.residential.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="input-group">
                <label>{t.seller.location}</label>
                <input name="location" placeholder="e.g. DLF Phase 5" required />
              </div>
              <div className="input-group">
                <label>Ownership Type</label>
                <select name="ownership" className="glass">
                  <option>Freehold</option>
                  <option>Power of Attorney (POA)</option>
                  <option>Leasehold</option>
                  <option>Stamp Duty</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="input-group"><label>{t.seller.price}</label><input name="price" type="number" placeholder="50,00,000" required /></div>
              <div className="input-group"><label>{t.seller.areaSqft}</label><input name="area" type="text" placeholder="1200" required /></div>
            </div>

            <div className="input-group">
              <label>{t.seller.floors}</label>
              <input name="totalFloors" type="text" placeholder={sellerType === 'residential' ? "Total Floors (e.g. 4)" : "Additional Details"} />
            </div>

            {sellerType === 'residential' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group"><label>{t.seller.beds}</label><input name="beds" type="number" placeholder="3" /></div>
                <div className="input-group"><label>{t.seller.baths}</label><input name="baths" type="number" placeholder="2" /></div>
              </div>
            )}

            <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>{t.seller.postLead}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PropertyDetailView = ({ t, setView, selectedProperty, user, setIsChatOpen }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (!selectedProperty) return null;

  // Normalize media for display (handle legacy properties)
  const mediaList = selectedProperty.media || [{ type: 'image', url: selectedProperty.image }];
  const currentMedia = mediaList[selectedMediaIndex] || mediaList[0];

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <button onClick={() => setView('buyer')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <X size={18} /> {t.detail.back}
      </button>

      <div className="property-detail-grid">
        {/* Left Side: Media & Description */}
        <div>
          <div className="property-detail-media" style={{ borderRadius: '30px', overflow: 'hidden', background: '#000', marginBottom: '20px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            {currentMedia.type === 'video' ? (
              <video src={currentMedia.url} controls autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <img src={currentMedia.url} alt="property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {mediaList.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px' }}>
              {mediaList.map((m, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedMediaIndex(i)}
                  style={{
                    flex: '0 0 80px', height: '80px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                    border: selectedMediaIndex === i ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    opacity: selectedMediaIndex === i ? 1 : 0.6
                  }}
                >
                  {m.type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={20} color="#fff" /></div>
                  ) : (
                    <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="glass" style={{ padding: '30px', borderRadius: '30px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'Playfair Display' }}>{selectedProperty.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
              <MapPin size={18} color="var(--accent-gold)" /> {selectedProperty.location}
            </div>

            <div className="amenities-grid" style={{ marginBottom: '40px', padding: '20px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Beds</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Bed size={18} color="var(--accent-gold)" /> <span style={{ fontWeight: '600' }}>{selectedProperty.beds}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Baths</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Bath size={18} color="var(--accent-gold)" /> <span style={{ fontWeight: '600' }}>{selectedProperty.baths}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Area</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Maximize size={18} color="var(--accent-gold)" /> <span style={{ fontWeight: '600' }}>{selectedProperty.area || selectedProperty.sqft}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Floors</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <HomeIcon size={18} color="var(--accent-gold)" /> <span style={{ fontWeight: '600' }}>{selectedProperty.floors || 'N/A'}</span>
                </div>
              </div>
            </div>

            <h4 style={{ color: 'var(--accent-gold)', marginBottom: '15px' }}>Description</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {selectedProperty.description}
            </p>
          </div>
        </div>

        {/* Right Side: Price & Chat (Sticky) */}
        <div className="glass" style={{ padding: '30px', borderRadius: '30px', position: 'sticky', top: '120px', border: '1px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Listing Price</p>
          <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '2rem', fontFamily: 'Playfair Display' }}>₹{selectedProperty.price.toLocaleString()}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', padding: '15px', background: 'rgba(255,255,215,0.05)', borderRadius: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ width: '50px', height: '50px', background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--bg-primary)' }}>
              {selectedProperty.seller.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: Verified</p>
              <h4 style={{ fontSize: '1.1rem' }}>{selectedProperty.seller}</h4>
            </div>
          </div>

          <button
            onClick={() => {
              if (user) {
                setIsChatOpen(true);
              } else {
                setView('auth');
              }
            }}
            className="premium-button"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '15px', padding: '15px' }}
          >
            {!user && <span style={{ marginRight: '8px' }}>🔒</span>}
            <MessageSquare size={18} /> Chat on WhatsApp
          </button>

          <button
            onClick={() => {
              if (user) {
                window.location.href = `tel:${selectedProperty.mobile || selectedProperty.phone}`;
              } else {
                setView('auth');
              }
            }}
            className="secondary-button"
            style={{ width: '100%', justifyContent: 'center', padding: '15px' }}
          >
            {!user && <span style={{ marginRight: '8px' }}>🔒</span>}
            <Phone size={18} /> Call Seller
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatOverlay = ({ setIsChatOpen, selectedProperty, language, user, showAlert }) => {
  if (!selectedProperty) return null;
  return (
    <div className="glass" style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '430px',
      borderRadius: '30px',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
      background: 'rgba(10, 10, 10, 0.98)',
      border: '1px solid var(--accent-gold)',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <h3 style={{ margin: 0, fontFamily: 'Playfair Display', color: 'var(--accent-gold)' }}>Connect Privately</h3>
        <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 25px' }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--accent-gold), #b38b2d)',
            borderRadius: '25px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', fontWeight: 800,
            color: 'var(--bg-primary)',
            boxShadow: '0 10px 20px rgba(212,175,55,0.3)'
          }}>
            {selectedProperty.seller.charAt(0)}
          </div>
          <div style={{
            position: 'absolute', bottom: '-5px', right: '-5px',
            background: '#25D366', width: '28px', height: '28px',
            borderRadius: '50%', border: '4px solid #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Check size={14} color="white" strokeWidth={3} />
          </div>
        </div>

        <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>{selectedProperty.seller}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '35px' }}>
          {language === 'en' ? 'Verified Professional' : 'सत्यापित पेशेवर'}
        </p>

        <div style={{
          background: 'rgba(212,175,55,0.05)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '30px',
          border: '1px dashed rgba(212,175,55,0.3)',
          textAlign: 'left'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Privacy Shield Active 🛡️</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {language === 'en'
              ? "Your phone number is hidden. You will chat via the central Tha Bot number to protect your privacy."
              : "आपका फ़ोन नंबर छिपा हुआ है। आपकी गोपनीयता बनाए रखने के लिए आप केंद्रीय 'Tha Bot' नंबर द्वारा चैट करेंगे।"}
          </p>
        </div>

        <button
          onClick={() => {
            const botNumber = "919186090113";
            const msg = `Hi Tha, I'm interested in viewing Property #${selectedProperty.id}: ${selectedProperty.title} (${selectedProperty.location}). Can you help me connect?`;
            window.open(`https://wa.me/${botNumber}?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="premium-button"
          style={{ width: '100%', justifyContent: 'center', background: '#25D366', color: '#fff', border: 'none', padding: '18px', fontSize: '1.1rem' }}
        >
          <MessageSquare size={22} style={{ marginRight: '10px' }} />
          {language === 'en' ? 'Chat via Tha Bot' : 'Tha Bot द्वारा चैट करें'}
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Both parties chat via <b>+91 9186090113</b>
        </p>

        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <button
            onClick={async () => {
              if (!user) {
                showAlert("Please login to use secure calling.");
                return;
              }
              try {
                const res = await fetch('/initiate-call', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    buyerPhone: user.phone,
                    sellerPhone: selectedProperty.mobile || selectedProperty.phone,
                    propertyId: selectedProperty.id,
                    propertyTitle: selectedProperty.title
                  })
                });
                const data = await res.json();
                if (data.success) {
                  window.location.href = `/?view=call&id=${data.callId}&role=initiator`;
                } else {
                  showAlert(data.error || "Call rejected by server.");
                }
              } catch (e) {
                showAlert("Network Error: Could not connect to call server.");
              }
            }}
            className="premium-button"
            style={{
              width: '100%',
              justifyContent: 'center',
              background: 'rgba(212,175,55,0.1)',
              border: '2px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              padding: '18px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(212,175,55,0.2)'
            }}
          >
            <Phone size={22} style={{ marginRight: '10px' }} />
            {language === 'en' ? 'Secure Voice Call' : 'सुरक्षित वॉयस कॉल'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CallInterface = ({ showAlert }) => {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const peerRef = useRef(null);
  const remoteAudioRef = useRef(new Audio());
  const localStreamRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const callId = urlParams.get('id');
  const role = urlParams.get('role');

  useEffect(() => {
    if (!callId) return;

    const peer = new Peer(role === 'initiator' ? `${callId}-buyer` : `${callId}-seller`, {
      debug: 2
    });
    peerRef.current = peer;

    peer.on('open', async (id) => {
      console.log('✅ Peer ID:', id);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        if (role === 'initiator') {
          setCallStatus('ringing');
          // Initiator waits a bit for the seller to answer the WhatsApp message
          setTimeout(() => {
            const call = peer.call(`${callId}-seller`, stream);
            handleCall(call);
          }, 5000);
        }
      } catch (err) {
        showAlert("Microphone access denied. Please enable it to call.");
        setCallStatus('ended');
      }
    });

    peer.on('call', (call) => {
      setCallStatus('connected');
      call.answer(localStreamRef.current);
      handleCall(call);
    });

    const handleCall = (call) => {
      call.on('stream', (remoteStream) => {
        setCallStatus('connected');
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play();
      });
      call.on('close', () => setCallStatus('ended'));
      call.on('error', () => setCallStatus('ended'));
    };

    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [callId, role, showAlert]);

  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    setCallStatus('ended');
    setTimeout(() => window.location.href = '/', 1500);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
      <div className="glass" style={{ padding: '60px 40px', borderRadius: '40px', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <div className={`pulse-${callStatus}`} style={{
            width: '120px', height: '120px', background: 'rgba(212,175,55,0.1)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            border: '2px solid var(--accent-gold)'
          }}>
            <User size={60} color="var(--accent-gold)" />
          </div>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {callStatus === 'connecting' && 'Connecting...'}
          {callStatus === 'ringing' && 'Ringing...'}
          {callStatus === 'connected' && 'Secure Call Live'}
          {callStatus === 'ended' && 'Call Ended'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          {callStatus === 'connected' ? 'Enjoy your private conversation' : 'Establishing encryption bridge...'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <button
            onClick={toggleMute}
            style={{
              width: '60px', height: '60px', borderRadius: '50%', background: isMuted ? '#ff4b2b' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}
          >
            {isMuted ? <Hash size={24} /> : <Hash size={24} />}
          </button>

          <button
            onClick={endCall}
            style={{
              width: '70px', height: '70px', borderRadius: '50%', background: '#ff4b2b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}
          >
            <X size={32} />
          </button>
        </div>
      </div>

      <style>{`
        .pulse-ringing { animation: pulse 2s infinite; }
        .pulse-connected { border-color: #22c55e !important; box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
      `}</style>
    </div>
  );
};
const MyPropertiesView = ({ t, properties, user, setView, setSelectedProperty, setEditingProperty, handleDeleteProperty }) => {
  const myProps = properties.filter(p => p.mobile === user?.phone || p.seller === user?.name);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem' }}>{t.myProperties.title}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{t.myProperties.subtitle}</p>
      </div>

      {myProps.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '30px' }}>
          <HomeIcon size={48} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '20px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{t.myProperties.noProperties}</p>
          <button onClick={() => setView('seller')} className="premium-button" style={{ marginTop: '30px' }}>
            <Plus size={18} /> {t.nav.postProperty}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {myProps.map(prop => (
            <div
              key={prop.id}
              className="glass animate-fade"
              style={{
                borderRadius: '15px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'row',
                minHeight: window.innerWidth < 768 ? '120px' : '160px'
              }}
            >
              <div style={{ width: '35%', minWidth: '100px', maxWidth: '250px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <img src={prop.image || (prop.media && prop.media[0]?.url)} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <span className="badge" style={{ background: 'var(--bg-primary)', fontSize: '0.55rem', padding: '2px 6px' }}>{prop.category || 'Plot'}</span>
                </div>
              </div>
              <div style={{ padding: window.innerWidth < 768 ? '12px' : '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                <h3 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.15rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</h3>
                <div style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem', marginBottom: '10px' }}>
                  ₹{prop.price?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedProperty(prop);
                      setView('detail');
                    }}
                    className="secondary-button"
                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                  >
                    {t.buyer.details}
                  </button>
                  <button
                    onClick={() => setEditingProperty(prop)}
                    className="secondary-button"
                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                  >
                    {t.myProperties.edit}
                  </button>
                  <button
                    onClick={() => {
                      showConfirm(t.alerts.deleteProperty, () => handleDeleteProperty(prop.id));
                    }}
                    className="secondary-button"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#ff4444', borderColor: 'rgba(255,68,68,0.3)' }}
                  >
                    {t.myProperties.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditPropertyModal = ({ editingProperty, setEditingProperty, handleUpdateProperty, language, t }) => {
  if (!editingProperty) return null;
  const [price, setPrice] = useState(editingProperty.price);
  const [location, setLocation] = useState(editingProperty.location);
  const [title, setTitle] = useState(editingProperty.title || `${editingProperty.category} in ${editingProperty.location}`);
  const [description, setDescription] = useState(editingProperty.description);
  const [purpose, setPurpose] = useState(editingProperty.purpose || 'For Sale');
  const [category, setCategory] = useState(editingProperty.category || 'Residential');
  const [area, setArea] = useState(editingProperty.area || editingProperty.sqft || '');
  const [beds, setBeds] = useState(editingProperty.beds || '');
  const [baths, setBaths] = useState(editingProperty.baths || '');
  const [floors, setFloors] = useState(editingProperty.floors || '');
  const [ownership, setOwnership] = useState(editingProperty.ownership || 'Freehold');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--accent-gold)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '25px', textAlign: 'center' }}>{language === 'en' ? 'Edit Property' : 'संपत्ति संपादित करें'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="premium-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="premium-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="premium-input" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="premium-input" style={{ width: '100%', background: 'rgb(30, 30, 30)' }}>
                <option>For Sale</option>
                <option>For Rent</option>
                <option>Lease</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="premium-input" style={{ width: '100%', background: 'rgb(30, 30, 30)' }}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Agricultural</option>
                <option>Plot</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Area (Sqft/Gaj)</label>
              <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="premium-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Ownership</label>
              <select value={ownership} onChange={(e) => setOwnership(e.target.value)} className="premium-input" style={{ width: '100%', background: 'rgb(30,30,30)' }}>
                <option>Freehold</option>
                <option>Power of Attorney (POA)</option>
                <option>Leasehold</option>
                <option>Stamp Duty</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Floors/Details</label>
            <input type="text" value={floors} onChange={(e) => setFloors(e.target.value)} className="premium-input" style={{ width: '100%' }} />
          </div>

          {category === 'Residential' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Beds</label>
                <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} className="premium-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Baths</label>
                <input type="number" value={baths} onChange={(e) => setBaths(e.target.value)} className="premium-input" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="premium-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={() => setEditingProperty(null)} className="secondary-button" style={{ flex: 1 }}>{t.myProperties.cancel}</button>
            <button
              onClick={() => handleUpdateProperty(editingProperty.id, {
                title,
                price: parseInt(price),
                location,
                description,
                purpose,
                category,
                area: parseInt(area),
                sqft: parseInt(area),
                beds: parseInt(beds || 0),
                baths: parseInt(baths || 0),
                floors,
                ownership
              })}
              className="premium-button"
              style={{ flex: 1 }}
            >
              {t.myProperties.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('landing'); // landing, buyer, seller, detail, auth
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [sortBy, setSortBy] = useState('latest'); // latest, priceHigh, priceLow, old
  const [filterType, setFilterType] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');
  const [filterListing, setFilterListing] = useState('all');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const t = translations[language];

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showAlert = (msg) => setModal({ isOpen: true, type: 'alert', message: msg, onConfirm: null });
  const showConfirm = (msg, onConfirm) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Auth State - Bakenovation Restore (Robust)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tha_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('tha_user');
    }
    return null;
  });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [authStep, setAuthStep] = useState(1); // 1: phone, 2: otp, 3: details
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isChoosingLanguage, setIsChoosingLanguage] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Sync state with user object (Fixes 400 error on refresh)
  useEffect(() => {
    if (user) {
      if (!userName && user.name) setUserName(user.name);
      if (!phoneNumber && user.phone) setPhoneNumber(user.phone);
    }
  }, [user]);

  // Voice Call Signal Handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callView = urlParams.get('view');
    const callId = urlParams.get('id');
    const role = urlParams.get('role');

    if (callView === 'call' && callId) {
      setView('call');
      setSelectedProperty({ id: callId?.split('-')?.[1], title: 'Secure Voice Call' });
    }
  }, []);

  // GAS URLs & Bot Proxies
  const WHATSAPP_PROXY_URL = 'https://dalaalstreetss.alwaysdata.net/send-otp';
  const SIGNUP_LOG_URL = 'https://script.google.com/macros/s/AKfycbxUzjYHqFUUxULp0z2wlZB_AhO57If_1guXP0IYlg0WVwdNlu0sA3tjeb3UuIDkKmt_qA/exec';

  // Check if user is returning (localStorage)
  const checkReturningUser = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const registeredUsers = JSON.parse(localStorage.getItem('tha_registered_users') || '[]');
    const existingUser = registeredUsers.find(u => u.phone === cleanPhone);

    if (existingUser) {
      setIsReturningUser(true);
      setUserName(existingUser.name);
      setIsNewUser(false);
      return true;
    }
    return false;
  };

  // Load properties from backend
  useEffect(() => {
    fetch('https://dalaalstreetss.alwaysdata.net/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProperties(data);
        }
      })
      .catch(err => console.error('Failed to load properties:', err));
  }, []);

  // Animation Effects
  useEffect(() => {
    if (view === 'landing') {
      gsap.from('.hero-content > *', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1, // ...
        ease: 'power3.out'
      });
    }
  }, [view]);

  // Power-Sync Integration (Direct & Redundant)
  const powerSync = (url, data) => {
    const params = new URLSearchParams(data);
    const fullUrl = url + (url.includes('?') ? '&' : '?') + params.toString();
    console.log('🔗 PowerSync Trigger:', fullUrl);

    // Direct Fetch (Works because Alwaysdata has CORS enabled)
    fetch(fullUrl).catch(err => {
      console.warn('Direct fetch failed, trying silent fallback...', err);
      const img = new Image();
      img.src = fullUrl;
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(generatedOtp.toString());

    // Clean number: remove non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Phone validation
    if (!cleanPhone || cleanPhone.length !== 10) {
      showAlert("⚠️ Please enter a valid 10-digit mobile number.");
      return;
    }

    // UI Feedback
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "⚡ checking...";
    btn.disabled = true;

    // Check if returning user (Local + Remote)
    const isLocalReturn = checkReturningUser(phoneNumber);

    // Remote check via GAS
    try {
      const checkUrl = `${SIGNUP_LOG_URL}?action=checkUser&phone=${cleanPhone}`;
      const checkRes = await fetch(checkUrl);
      const checkData = await checkRes.json();

      if (checkData.status === 'found') {
        setIsReturningUser(true);
        setUserName(checkData.name);
        setEmail(checkData.email);
        setCity(checkData.city);
        setPincode(checkData.pincode);
        setIsNewUser(false);
        console.log('👤 Remote user found:', checkData.name);
      } else {
        // If not found remotely and not found locally, then it's a new user
        if (!isLocalReturn) {
          setIsReturningUser(false);
          setIsNewUser(true);
        }
      }
    } catch (err) {
      console.warn('⚠️ Remote user check failed, following local/default logic:', err);
    }

    btn.innerText = "⚡ Sending OTP...";

    console.log('🚀 Dispatching OTP to Alwaysdata:', cleanPhone);

    try {
      const params = new URLSearchParams({
        phone: cleanPhone,
        message: `*THA.*\nYour exclusive access code is: ${generatedOtp}\nWelcome to our website.`
      });

      const fullUrl = WHATSAPP_PROXY_URL + '?' + params.toString();

      // Bakenovation Timeout Logic (10s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ Alwaysdata accepted the request.');
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn('⚠️ Bot returned an error, but proceeding as it often works anyway:', errData);
      }

      // Always proceed to OTP verification as requested (user says it works even with errors)
      setAuthStep(2);
    } catch (err) {
      console.error('❌ Network Error:', err);
      const isTimeout = err.name === 'AbortError';
      showAlert(isTimeout
        ? "⏳ Server Timeout. Please check if the bot is online at https://dalaalstreetss.alwaysdata.net/status"
        : `❌ Connection Issue: ${err.message}`);
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  const handleVerifyOTP = (enteredCode) => {
    if (enteredCode === otp) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      // If returning user (Found locally or remotely), complete login immediately
      if (isReturningUser) {
        const userData = {
          phone: cleanPhone,
          name: userName,
          email: email || 'N/A',
          city: city || 'N/A',
          pincode: pincode || 'N/A'
        };
        setUser(userData);
        localStorage.setItem('tha_user', JSON.stringify(userData));

        // Sync to registered users locally to avoid remote check next time
        const registeredUsers = JSON.parse(localStorage.getItem('tha_registered_users') || '[]');
        if (!registeredUsers.find(u => u.phone === cleanPhone)) {
          registeredUsers.push({ phone: cleanPhone, name: userName });
          localStorage.setItem('tha_registered_users', JSON.stringify(registeredUsers));
        }

        fetch('https://dalaalstreetss.alwaysdata.net/client-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msg: 'Returning User Login', data: userData })
        }).catch(e => console.error(e));

        // Reset and go to landing
        setAuthStep(1);
        setView('landing');
        showAlert(`Welcome back, ${userName}!`);
      } else {
        // New user - move to details collection step
        setAuthStep(3);
      }
    } else {
      showAlert("Invalid code. Please try again.");
    }
  };

  // Handle new user signup completion (Step 3)
  const handleCompleteSignup = (e) => {
    e.preventDefault();

    // Validation
    if (!userName || userName.length < 3) {
      showAlert("⚠️ Please enter a valid name (min 3 chars).");
      return;
    }
    if (!email || !email.includes('@')) {
      showAlert("⚠️ Please enter a valid email address.");
      return;
    }
    if (!city || city.length < 2) {
      showAlert("⚠️ City is required.");
      return;
    }
    if (!pincode || pincode.length < 6) {
      showAlert("⚠️ Valid 6-digit Pincode is required.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userData = { phone: cleanPhone, name: userName, email, city, pincode };
    setUser(userData);
    localStorage.setItem('tha_user', JSON.stringify(userData));

    fetch('https://dalaalstreetss.alwaysdata.net/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: 'New User Signup', data: userData })
    }).catch(e => console.error(e));

    // Add to registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('tha_registered_users') || '[]');
    registeredUsers.push({ phone: cleanPhone, name: userName });
    localStorage.setItem('tha_registered_users', JSON.stringify(registeredUsers));

    // Log to spreadsheet
    powerSync(SIGNUP_LOG_URL, {
      phone: cleanPhone,
      name: userName,
      email: email,
      city: city,
      pincode: pincode,
      timestamp: new Date().toISOString()
    });

    // Reset and go to landing
    setAuthStep(1);
    setView('landing');
  };

  // Handle Professional Listing (Seller/Builder)
  const handlePostProfessional = async (e, type, customMedia = []) => {
    e.preventDefault();
    if (!user) {
      setView('auth');
      return;
    }

    // Hard Guard: Ensure user data is synced
    if (!user.name || !user.phone) {
      console.warn("⚠️ User profile data missing during POST. Attempting re-sync...");
      const saved = localStorage.getItem('tha_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.phone) {
          setUser(parsed);
          // Proceed with the updated user object
          user.name = parsed.name;
          user.phone = parsed.phone;
        } else {
          showAlert("⚠️ Profile sync issue. Please log in again to publish.");
          setView('auth');
          return;
        }
      } else {
        showAlert("⚠️ Authentication session lost. Please log in again.");
        setView('auth');
        return;
      }
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    const hasVideo = customMedia.some(m => m.type === 'video');
    btn.innerText = hasVideo ? "⭐ Uploading Video... (Please Wait)" : "⭐ Publishing...";
    btn.disabled = true;

    // Build WhatsApp Message
    const msg = `🏠 *THA EXCLUSIVE LISTING*
-------------------------------
*User:* ${user.name}
*Phone:* ${user.phone}
*Role:* ${type === 'seller' ? 'Seller/Owner' : 'Builder/Investor'}
${data.activePropertyType ? `*Type:* ${data.activePropertyType.toUpperCase()}` : ''}
*Purpose:* ${data.purpose || data.requirement}
*Category:* ${data.category || data.landType}
*Area:* ${data.area} ${type === 'seller' ? (data.activePropertyType === 'agricultural' ? 'Acres' : 'sqft') : 'Gaj'}
*Price/Budget:* ₹${data.price || data.budget}
*Location:* ${data.location}
${data.totalFloors ? `*Details:* ${data.totalFloors}` : ''}
${data.description ? `*Note:* ${data.description}` : ''}
-------------------------------
_Verified Professional Lead_ 🟢`;

    try {
      // WhatsApp summary removed as requested
      /*
      const params = new URLSearchParams({
        phone: user.phone,
        message: msg
      });
      // Use the new /send-msg for custom text
      await fetch(`https://dalaalstreetss.alwaysdata.net/send-msg?${params.toString()}`);
      */

      // Multi-Media Handling
      let mediaItems = [];

      // Prioritize customMedia (from state) over formData (from input)
      if (customMedia && customMedia.length > 0) {
        mediaItems = customMedia;
      } else {
        // Fallback or for initial single file upload if used elsewhere
        const mediaFiles = formData.getAll('propertyMedia');
        if (mediaFiles && mediaFiles.length > 0 && mediaFiles[0].name) {
          mediaItems = await Promise.all(mediaFiles.map(async (file) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve({
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: e.target.result
              });
              reader.readAsDataURL(file);
            });
          }));
        }
      }

      // Default placeholder if no media
      if (mediaItems.length === 0) {
        mediaItems = [{ type: 'image', url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1350&q=80" }];
      }

      // Prepare FormData for Multipart Upload
      const formDataToSend = new FormData();

      const payload = {
        title: data.title || `${data.category} in ${data.location}`,
        location: data.location,
        price: parseInt(data.price || data.budget),
        area: parseInt(data.area),
        category: data.category || "Plot",
        purpose: data.purpose || "Buy",
        beds: parseInt(data.beds || 0),
        baths: parseInt(data.baths || 0),
        floors: data.totalFloors || data.floors,
        ownership: data.ownership || "Freehold",
        description: data.description || `Professional listing.`,
        seller: user.name || "Verified Professional",
        mobile: user.phone,
        verified: true,
        sold: false
      };

      // Append DATA field FIRST (Critical for Multer)
      formDataToSend.append('data', JSON.stringify(payload));

      // Append Files
      if (customMedia && customMedia.length > 0) {
        customMedia.forEach(media => {
          if (media.file) {
            formDataToSend.append('media', media.file);
          }
        });
      }

      // XHR for Progress Tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://dalaalstreetss.alwaysdata.net/properties');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            btn.innerText = `⭐ Uploading... ${percent}%`;
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const savedProp = JSON.parse(xhr.responseText);
            setProperties(prev => [savedProp, ...prev]);
            showAlert(t.alerts.listingLive);
            setView('buyer');
            resolve(savedProp);
          } else {
            console.error("Upload failed:", xhr.status, xhr.statusText);
            let detail = "";
            try {
              const errJson = JSON.parse(xhr.responseText);
              detail = `\nMissing: ${JSON.stringify(errJson.missing || errJson.error)}`;
            } catch (e) {
              detail = `\nBody: ${xhr.responseText.substring(0, 100)}`;
            }
            reject(new Error(`Server Error (${xhr.status}): ${xhr.statusText || 'Failed'}${detail}`));
          }
        };

        xhr.onerror = () => {
          console.error("Network Error");
          reject(new Error("Network Error"));
        };

        xhr.send(formDataToSend);
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || "Unknown error";

      // Specific error handling for 400
      if (errorMsg.includes('Server Error (400)')) {
        showAlert(`❌ Listing Failed: Profile Data Missing.\n\nPlease try refreshing or logging out and back in.`);
      } else {
        showAlert(`${t.alerts.listingFailed}\nReason: ${errorMsg}`);
      }

      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  // Profile Actions
  const handleUpdateName = () => {
    if (!tempName.trim()) return;
    const updatedUser = { ...user, name: tempName.trim() };
    setUser(updatedUser);
    localStorage.setItem('tha_user', JSON.stringify(updatedUser));

    // Also update in registered list for returning logic
    const registeredUsers = JSON.parse(localStorage.getItem('tha_registered_users') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.phone === user.phone);
    if (userIndex !== -1) {
      registeredUsers[userIndex].name = tempName.trim();
      localStorage.setItem('tha_registered_users', JSON.stringify(registeredUsers));
    }

    setIsEditingName(false);
    setShowProfileMenu(false);
    showAlert(language === 'en' ? "Name updated successfully!" : "नाम सफलतापूर्वक अपडेट हो गया!");
  };

  const handleDeleteProperty = (id) => {
    showConfirm(t.alerts.deleteProperty, async () => {
      try {
        const res = await fetch(`https://dalaalstreetss.alwaysdata.net/properties/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setProperties(prev => prev.filter(p => p.id !== id));
          showAlert(language === 'en' ? "Property deleted successfully!" : "संपत्ति सफलतापूर्वक हटा दी गई!");
        } else {
          showAlert("Failed to delete property.");
        }
      } catch (err) {
        console.error(err);
        showAlert("Error deleting property.");
      }
    });
  };

  const handleUpdateProperty = async (id, data) => {
    try {
      const res = await fetch(`https://dalaalstreetss.alwaysdata.net/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setProperties(prev => prev.map(p => p.id === id ? updated : p));
        setEditingProperty(null);
        showAlert(language === 'en' ? "Property updated successfully!" : "संपत्ति सफलतापूर्वक अपडेट हो गई!");
      } else {
        showAlert("Failed to update property.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error updating property.");
    }
  };





  return (
    <div className="App">
      <CustomModal modal={modal} closeModal={closeModal} />
      <EditPropertyModal
        editingProperty={editingProperty}
        setEditingProperty={setEditingProperty}
        handleUpdateProperty={handleUpdateProperty}
        language={language}
        t={t}
      />
      <Nav
        t={t}
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
        filterType={filterType}
        setFilterType={setFilterType}
        filterArea={filterArea}
        setFilterArea={setFilterArea}
        filterBudget={filterBudget}
        setFilterBudget={setFilterBudget}
        user={user}
        setUser={setUser}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        language={language}
        setLanguage={setLanguage}
        isChoosingLanguage={isChoosingLanguage}
        setIsChoosingLanguage={setIsChoosingLanguage}
        setIsEditingName={setIsEditingName}
        setTempName={setTempName}
        showConfirm={showConfirm}
      />
      {/* Backdrop for Search Blur Dismissal */}
      {isSearchActive && (
        <div
          onClick={() => setIsSearchActive(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.1)'
          }}
        />
      )}

      {/* Main Content Blur Wrapper */}
      <div
        className="main-content-blur"
        style={{
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isSearchActive ? 'blur(10px) brightness(0.7)' : 'none',
          transform: isSearchActive ? 'scale(0.98)' : 'scale(1)',
          opacity: isSearchActive ? 0.8 : 1,
          pointerEvents: isSearchActive ? 'none' : 'auto'
        }}
      >
        {isChatOpen && (
          <ChatOverlay
            setIsChatOpen={setIsChatOpen}
            selectedProperty={selectedProperty}
            language={language}
            user={user}
            showAlert={showAlert}
          />
        )}

        {view === 'landing' && <LandingView t={t} setView={setView} setIsSearchActive={setIsSearchActive} />}
        {view === 'buyer' && (
          <BuyerView
            t={t}
            properties={properties}
            searchQuery={searchQuery}
            filterType={filterType}
            filterArea={filterArea}
            filterBudget={filterBudget}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setView={setView}
            setSelectedProperty={setSelectedProperty}
            user={user}
            language={language}
          />
        )}
        {view === 'builders' && (
          <BuyerView
            t={t}
            properties={properties}
            searchQuery={searchQuery}
            filterType={filterType}
            filterArea={filterArea}
            filterBudget={filterBudget}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setView={setView}
            setSelectedProperty={setSelectedProperty}
            user={user}
            language={language}
          />
        )}
        {view === 'seller' && <PostPropertyView t={t} setView={setView} user={user} handlePostProfessional={handlePostProfessional} />}
        {view === 'detail' && selectedProperty && (
          <PropertyDetailView
            t={t}
            setView={setView}
            selectedProperty={selectedProperty}
            user={user}
            setIsChatOpen={setIsChatOpen}
          />
        )}
        {view === 'call' && <CallInterface showAlert={showAlert} />}
        {view === 'my-properties' && (
          <MyPropertiesView
            t={t}
            properties={properties}
            user={user}
            setView={setView}
            setSelectedProperty={setSelectedProperty}
            setEditingProperty={setEditingProperty}
            handleDeleteProperty={handleDeleteProperty}
          />
        )}

        {view === 'auth' && (
          <div className="container" style={{ paddingTop: '150px', display: 'flex', justifyContent: 'center' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>

              {/* Logo Header */}
              <div style={{ marginBottom: '30px' }}>
                <img src="/logo-tha.svg" alt="Tha" style={{ width: '120px', margin: '0 auto', display: 'block' }} />
              </div>

              {/* Step 1: Phone Number Entry */}
              {authStep === 1 && (
                <>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.auth.login}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {t.auth.connect}
                  </p>

                  <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', marginLeft: '10px', display: 'block', marginBottom: '8px' }}>
                        Phone Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                          +91
                        </div>
                        <input
                          type="tel"
                          placeholder="99999 99999"
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhoneNumber(val);
                          }}
                          style={{ width: '100%', paddingLeft: '50px', fontSize: '1.1rem' }}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="premium-button" style={{ justifyContent: 'center', padding: '14px' }}>
                      Continue
                    </button>
                  </form>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {authStep === 2 && (
                <>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.auth.verify}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {t.auth.codeSent} <strong style={{ color: 'var(--accent-gold)' }}>+91 {phoneNumber}</strong>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder={t.auth.enterCode}
                      style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '8px', padding: '15px' }}
                      onChange={(e) => e.target.value.length === 6 && handleVerifyOTP(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setAuthStep(1);
                        setPhoneNumber('');
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {t.auth.editPhone}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New User Details */}
              {authStep === 3 && (
                <>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Almost There!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Complete your profile to get started
                  </p>

                  <form onSubmit={handleCompleteSignup} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginLeft: '10px', display: 'block', marginBottom: '6px' }}>
                        {t.auth.fullName}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          style={{ width: '100%', paddingLeft: '45px' }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginLeft: '10px', display: 'block', marginBottom: '6px' }}>
                        Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ width: '100%', paddingLeft: '45px' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginLeft: '10px', display: 'block', marginBottom: '6px' }}>
                          City
                        </label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="Delhi"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={{ width: '100%', paddingLeft: '45px' }}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginLeft: '10px', display: 'block', marginBottom: '6px' }}>
                          Pincode
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Hash size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="110085"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            style={{ width: '100%', paddingLeft: '45px' }}
                            maxLength="6"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                          required
                        />
                        <span>
                          I accept all{' '}
                          <a
                            href="/terms.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-gold)', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            Terms and Conditions
                          </a>
                          {' '}of the website
                        </span>
                      </label>
                    </div>

                    <button type="submit" className="premium-button" style={{ justifyContent: 'center', padding: '14px', marginTop: '10px' }}>
                      Complete Signup
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Name Modal */}
        {isEditingName && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '20px' }}>{language === 'en' ? 'Edit Your Name' : 'अपना नाम बदलें'}</h2>

              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="premium-input"
                placeholder={language === 'en' ? 'Enter new name' : 'नया नाम दर्ज करें'}
                style={{ marginBottom: '20px', textAlign: 'center', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '15px', color: '#fff' }}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsEditingName(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  onClick={handleUpdateName}
                  className="premium-button"
                  style={{ flex: 1 }}
                >
                  {language === 'en' ? 'Save Changes' : 'बदलाव सुरक्षित करें'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isChatOpen && <ChatOverlay />}

        <footer style={{ background: 'var(--bg-secondary)', padding: '60px 0', marginTop: '60px', borderTop: '1px solid var(--glass-border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '15px' }}>Tha</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px' }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)' }}>
              <a
                href="/terms.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {t.footer.terms}
              </a>
              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {t.footer.privacy}
              </a>
              <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                Contact - Coming Soon
              </span>
            </div>
            <p style={{ marginTop: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t.footer.rights} <span style={{ opacity: 0.5 }}>v5.0 (Global Launch) • v4.0.4 (Active Sync)</span>
            </p>
          </div>
        </footer>
      </div>
      {/* FOX - THE CLEVER AI BOT */}
      <FoxBot
        properties={properties}
        setView={setView}
        setSelectedProperty={setSelectedProperty}
        userName={user?.name}
        user={user}
      />
    </div >
  );
}

export default App;
