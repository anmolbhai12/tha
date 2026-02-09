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
  Languages
} from 'lucide-react';
import { translations } from './translations';
import { gsap } from 'gsap';

// Mock Data
const INITIAL_PROPERTIES = [];

function App() {
  const [view, setView] = useState('landing'); // landing, buyer, seller, detail, auth
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showAlert = (msg) => setModal({ isOpen: true, type: 'alert', message: msg, onConfirm: null });
  const showConfirm = (msg, onConfirm) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Custom Modal Component
  const CustomModal = () => {
    if (!modal.isOpen) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}>
        <div className="glass" style={{
          padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '90%',
          textAlign: 'center', border: '1px solid var(--accent-gold)', boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display' }}>
            {modal.type === 'confirm' ? 'Confirmation' : 'Notification'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {modal.message}
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            {modal.type === 'confirm' && (
              <button
                onClick={closeModal}
                style={{
                  padding: '12px 30px', borderRadius: '50px', background: 'transparent',
                  border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                if (modal.onConfirm) modal.onConfirm();
                closeModal();
              }}
              className="premium-button"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Auth State - Bakenovation Restore (Robust)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dalaal_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('dalaal_user');
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

  // GAS URLs & Bot Proxies
  const WHATSAPP_PROXY_URL = 'https://dalaalstreetss.alwaysdata.net/send-otp';
  const SIGNUP_LOG_URL = 'https://script.google.com/macros/s/AKfycbxUzjYHqFUUxULp0z2wlZB_AhO57If_1guXP0IYlg0WVwdNlu0sA3tjeb3UuIDkKmt_qA/exec';

  // Check if user is returning (localStorage)
  const checkReturningUser = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const registeredUsers = JSON.parse(localStorage.getItem('dalaal_registered_users') || '[]');
    const existingUser = registeredUsers.find(u => u.phone === cleanPhone);

    if (existingUser) {
      setIsReturningUser(true);
      setUserName(existingUser.name);
      setIsNewUser(false);
      return true;
    }
    return false;
  };

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

    // Check if returning user
    const isReturning = checkReturningUser(phoneNumber);

    // Validation
    if (!isReturning) {
      // New users need full validation
      if (!userName || userName.length < 3) {
        showAlert("⚠️ Please enter a valid name (min 3 chars).");
        return;
      }
      if (!city || city.length < 2) {
        showAlert("⚠️ City is required for new registration.");
        return;
      }
      if (!pincode || pincode.length < 6) {
        showAlert("⚠️ Valid 6-digit Pincode is required.");
        return;
      }
    }

    // Phone validation for all users
    if (!cleanPhone || cleanPhone.length !== 10) {
      showAlert("⚠️ Please enter a valid 10-digit mobile number.");
      return;
    }

    // UI Feedback
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "⚡ Sending OTP...";
    btn.disabled = true;

    console.log('🚀 Dispatching OTP to Alwaysdata:', cleanPhone);

    try {
      const params = new URLSearchParams({
        phone: cleanPhone,
        message: `Your code is: ${generatedOtp}. Support: DalaalStreet`
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
        setIsOtpSent(true);
      } else {
        const errData = await response.json();
        showAlert(`❌ Error from Bot: ${errData.error || 'Unknown error'}`);
        btn.innerText = originalText;
        btn.disabled = false;
      }
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
      const userData = { phone: cleanPhone, name: userName, email, city, pincode };
      setUser(userData);
      localStorage.setItem('dalaal_user', JSON.stringify(userData));

      fetch('https://dalaalstreetss.alwaysdata.net/client-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: 'Saved User', data: userData })
      }).catch(e => console.error(e));

      // Save to registered users list & log to spreadsheet ONLY if new user
      if (!isReturningUser) {
        // Add to localStorage registry
        const registeredUsers = JSON.parse(localStorage.getItem('dalaal_registered_users') || '[]');
        registeredUsers.push({ phone: cleanPhone, name: userName });
        localStorage.setItem('dalaal_registered_users', JSON.stringify(registeredUsers));

        // Log to spreadsheet
        powerSync(SIGNUP_LOG_URL, {
          phone: cleanPhone,
          name: userName,
          email: email || 'N/A',
          city: city,
          pincode: pincode,
          timestamp: new Date().toISOString()
        });
      }

      setView('landing');
    } else {
      showAlert("Invalid code. Please try again.");
    }
  };

  // Handle Professional Listing (Seller/Builder)
  const handlePostProfessional = async (e, type) => {
    e.preventDefault();
    if (!user) {
      setView('auth');
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "⭐ Publishing...";
    btn.disabled = true;

    // Build WhatsApp Message
    const msg = `🏠 *DALAALSTREET PROFESSIONAL LISTING*
-------------------------------
*User:* ${userName}
*Phone:* ${phoneNumber}
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
      const params = new URLSearchParams({
        phone: phoneNumber,
        message: msg
      });
      // Use the new /send-msg for custom text
      await fetch(`https://dalaalstreetss.alwaysdata.net/send-msg?${params.toString()}`);

      const newProp = {
        id: properties.length + 1,
        title: data.title || `${data.category} in ${data.location}`,
        location: data.location,
        price: parseInt(data.price || data.budget),
        beds: parseInt(data.beds || 0),
        baths: parseInt(data.baths || 0),
        sqft: parseInt(data.area),
        type: data.category || "Plot",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1350&q=80",
        description: data.description || `Professional ${type} listing.`,
        seller: userName || "Verified Professional"
      };

      setProperties([newProp, ...properties]);
      showAlert(t.alerts.listingLive);
      setView('buyer');
    } catch (err) {
      console.error(err);
      showAlert(t.alerts.listingFailed);
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  const Nav = () => (
    <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon size={24} color="var(--bg-primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>DalaalStreet v4.2</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Language Switcher - ULTRA ROBUST */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '30px', border: '1px solid var(--accent-gold)', boxShadow: '0 0 15px rgba(197, 160, 89, 0.3)' }}>
            <span style={{ fontSize: '1rem', padding: '0 5px' }}>🌐</span>
            <button
              onClick={() => setLanguage('en')}
              style={{ padding: '4px 12px', borderRadius: '20px', background: language === 'en' ? 'var(--accent-gold)' : 'transparent', color: language === 'en' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              style={{ padding: '4px 12px', borderRadius: '20px', background: language === 'hi' ? 'var(--accent-gold)' : 'transparent', color: language === 'hi' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
            >
              HI
            </button>
          </div>

          <a onClick={() => setView('buyer')} style={{ cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>{t.nav.marketplace}</a>
          <button onClick={() => user ? setView('seller') : setView('auth')} className="premium-button">
            <Plus size={18} /> {t.nav.postProperty}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>{user.name || t.auth.legend}</span>
              <button
                onClick={() => {
                  showConfirm(t.alerts.logout, () => {
                    setUser(null);
                    localStorage.removeItem('dalaal_user');
                    setView('landing');
                  });
                }}
                style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <User size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('auth')}
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const LandingView = () => {
    return (
      <React.Fragment>
        {isSearchExpanded && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--accent-gold)', padding: '20px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid var(--accent-gold)', background: 'rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
                    <Languages size={14} color="var(--accent-gold)" />
                  </div>
                  <button
                    onClick={() => setLanguage('en')}
                    style={{ padding: '4px 8px', borderRadius: '15px', background: language === 'en' ? 'var(--accent-gold)' : 'transparent', color: language === 'en' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold' }}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    style={{ padding: '4px 8px', borderRadius: '15px', background: language === 'hi' ? 'var(--accent-gold)' : 'transparent', color: language === 'hi' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold' }}
                  >
                    HI
                  </button>
                </div>
              </div>
              <div className="glass" style={{ padding: '10px', borderRadius: '100px', display: 'flex', maxWidth: '800px', margin: '0 auto', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px', flex: 1 }}>
                  <Search size={22} color="var(--accent-gold)" />
                  <input autoFocus placeholder={t.hero.searchPlaceholder} style={{ background: 'transparent', border: 'none', padding: '12px 0', width: '100%', color: '#fff' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button onClick={() => setIsSearchExpanded(false)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '5px' }}>
                    <X size={20} />
                  </button>
                </div>
                <button onClick={() => setView('buyer')} className="premium-button">{t.hero.findHomes}</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                  <option value="all">{t.filters.allTypes}</option>
                  <option value="residential">{t.filters.residential}</option>
                  <option value="commercial">{t.filters.commercial}</option>
                  <option value="industrial">{t.filters.industrial}</option>
                  <option value="agricultural">{t.filters.agricultural}</option>
                </select>
                <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                  <option value="all">{t.filters.anyArea}</option>
                  <option value="small">{t.ranges.smallArea}</option>
                  <option value="medium">{t.ranges.mediumArea}</option>
                  <option value="large">{t.ranges.largeArea}</option>
                  <option value="xlarge">{t.ranges.xlargeArea}</option>
                </select>
                <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                  <option value="all">{t.filters.anyBudget}</option>
                  <option value="budget">{t.ranges.under50L}</option>
                  <option value="mid">{t.ranges.midRange}</option>
                  <option value="premium">{t.ranges.premiumRange}</option>
                  <option value="luxury">{t.ranges.luxuryRange}</option>
                </select>
                <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)', fontSize: '0.9rem' }}>
                  <option value="all">{t.filters.rentOrSale}</option>
                  <option value="sale">{t.filters.forSale}</option>
                  <option value="rent">{t.filters.forRent}</option>
                  <option value="lease">{t.filters.lease}</option>
                </select>
              </div>
            </div>
          </div>
        )
        }
        <div className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("https://images.unsplash.com/photo-1600585154340-be6199f7a096?auto=format&fit=crop&w=1920&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="container hero-content">
            {/* User requested THIS should not come when search bar is up */}
            {!isSearchExpanded && (
              <div className="animate-fade">
                <span className="badge">{t.hero.badge}</span>
                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1.5rem', maxWidth: '900px', lineHeight: 1.1, color: '#fff' }}>
                  {t.hero.title.split('Masterpiece')[0]}<span className="text-gradient-gold">Masterpiece</span>{t.hero.title.split('Masterpiece')[1]}
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
                  {t.hero.subtitle}
                </p>
                <div onClick={() => setIsSearchExpanded(true)} className="glass" style={{
                  padding: '10px',
                  borderRadius: '100px',
                  display: 'flex',
                  maxWidth: '700px',
                  cursor: 'text',
                  marginTop: '1.5rem',
                  border: '1px solid var(--accent-gold)',
                  boxShadow: '0 0 20px rgba(197, 160, 89, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px', flex: 1 }}>
                    <Search size={22} color="var(--accent-gold)" />
                    <span style={{ color: 'var(--text-secondary)' }}>{t.hero.searchPlaceholder}</span>
                  </div>
                  <button className="premium-button">{t.hero.findHomes}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </React.Fragment >
    );
  };

  const BuyerView = () => (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem' }}>{t.buyer.title}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t.buyer.subtitle} ({properties.length})</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--border-color)' }}>
            <option>{t.filters.allTypes}</option>
            <option>{t.filters.residential}</option>
            <option>{t.filters.commercial}</option>
            <option>{t.filters.industrial}</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {properties.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())).map(prop => (
          <div
            key={prop.id}
            className="glass animate-fade"
            style={{ borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease' }}
            onClick={() => {
              if (user) {
                setSelectedProperty(prop);
                setView('detail');
              } else {
                setView('auth');
              }
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
              <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                <span className="badge" style={{ background: 'var(--bg-primary)' }}>{prop.type}</span>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <MapPin size={14} /> {prop.location}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{prop.title}</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Bed size={16} /> {prop.beds}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Bath size={16} /> {prop.baths}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Maximize size={16} /> {prop.sqft} sqft</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', fontWeight: 700 }}>${prop.price.toLocaleString()}</span>
                <button className="secondary-button" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>{t.buyer.details}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostPropertyView = () => {
    const [activeTab, setActiveTab] = useState('seller');
    const [sellerType, setSellerType] = useState('residential');

    const sellerCategories = {
      residential: [t.filters.residential, t.filters.commercial, t.filters.industrial, t.filters.agricultural], // simplification for demo or use original? I'll keep original but use translations for headers
      commercial: ['Office Space', 'Shop/Showroom', 'Commercial Plot', 'Warehouse/Godown', 'Co-working'],
      industrial: ['Industrial Plot', 'Factory/Building', 'Shed/Godown'],
      agricultural: ['Farm Land', 'Farmhouse']
    };

    return (
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Main Role Switcher */}
          <div className="glass" style={{ display: 'flex', padding: '5px', borderRadius: '50px', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>
            <button
              onClick={() => setActiveTab('seller')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '40px',
                background: activeTab === 'seller' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'seller' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'seller' ? '700' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {t.seller.title.split(' ')[1]}
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '40px',
                background: activeTab === 'builder' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'builder' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'builder' ? '700' : '500',
                transition: 'all 0.3s ease'
              }}
            >
              {t.seller.builderTitle.split(' ')[1]}
            </button>
          </div>

          {/* Seller Section */}
          {activeTab === 'seller' && (
            <div className="animate-fade">
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem' }}>{t.seller.title.split(' ')[0]} <span className="text-gradient-gold">{t.seller.title.split(' ')[1]}</span></h2>
                <p style={{ color: 'var(--text-secondary)' }}>{t.seller.subtitle}</p>
              </div>

              <form onSubmit={(e) => {
                // Intercept to add sellerType to the message
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                // Add sellerType to the data object for the handlePostProfessional function if needed, 
                // or just pass it as an arg. For now, we'll modify the handlePostProfessional to handle it or inject it into the form data.
                // Actually, handlePostProfessional reads from formData entries. 
                // We can append it or just let the user function handle it.
                // Let's modify handlePostProfessional to simplify. 
                // But since we can't easily modify the outer function from here without rewriting the whole component,
                // we'll inject a hidden input!
                handlePostProfessional(e, 'seller');
              }} className="glass" style={{ padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Property Type Toggles */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
                  {['residential', 'commercial', 'industrial', 'agricultural'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSellerType(type)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid var(--accent-gold)',
                        background: sellerType === type ? 'var(--accent-gold)' : 'transparent',
                        color: sellerType === type ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Hidden input to pass sellerType to the handler */}
                <input type="hidden" name="activePropertyType" value={sellerType} />

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
                    <label>{t.seller.category} ({sellerType})</label>
                    <select name="category" className="glass">
                      {sellerCategories[sellerType].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
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
                    <label>{t.seller.sellingPurpose}</label>
                    <select name="sellingPurpose" className="glass">
                      {Object.entries(t.seller.purposeOptions).map(([key, val]) => (
                        <option key={key} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>{t.seller.location}</label>
                  <input name="location" placeholder="e.g. DLF Phase 5" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label>{t.seller.price}</label>
                    <input name="price" type="number" placeholder="50,00,000" required />
                  </div>
                  <div className="input-group">
                    <label>{sellerType === 'agricultural' ? t.seller.areaAcres : t.seller.areaSqft}</label>
                    <input name="area" type="text" placeholder={sellerType === 'agricultural' ? 'e.g. 2 Acres' : '1200'} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {sellerType === 'residential' && (
                    <>
                      <div className="input-group"><label>{t.seller.beds}</label><input name="beds" type="number" placeholder="3" /></div>
                      <div className="input-group"><label>{t.seller.baths}</label><input name="baths" type="number" placeholder="2" /></div>
                    </>
                  )}
                  <div className="input-group" style={{ gridColumn: sellerType === 'residential' ? 'auto' : '1 / -1' }}>
                    <label>{t.seller.floors}</label>
                    <input name="totalFloors" type="text" placeholder={sellerType === 'residential' ? "Total Floors (e.g. 4)" : "Additional Details"} />
                  </div>
                </div>

                <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>{t.seller.postLead}</button>
              </form>
            </div>
          )}

          {/* Builder Section */}
          {activeTab === 'builder' && (
            <div className="animate-fade">
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem' }}>{t.seller.builderTitle.split(' ')[0]} <span className="text-gradient-gold">{t.seller.builderTitle.split(' ')[1]}</span></h2>
                <p style={{ color: 'var(--text-secondary)' }}>{t.seller.builderSubtitle}</p>
              </div>
              <form onSubmit={(e) => handlePostProfessional(e, 'builder')} className="glass" style={{ padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--accent-gold)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label>{t.seller.requirement}</label>
                    <select name="requirement" className="glass">
                      <option>{t.filters.forSale.split(' ')[1]}</option>
                      <option>{t.filters.lease}</option>
                      <option>Joint Venture</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{t.seller.landType}</label>
                    <select name="landType" className="glass">
                      <option>{t.filters.residential}</option>
                      <option>{t.filters.commercial}</option>
                      <option>{t.filters.industrial}</option>
                      <option>{t.filters.agricultural}</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>{t.seller.targetPlace}</label>
                  <input name="location" placeholder="e.g. Rohini Sector 13" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label>{t.seller.areaGaj.replace('**', '').replace('**', '')}</label>
                    <input name="area" type="number" placeholder="200" required />
                  </div>
                  <div className="input-group">
                    <label>{t.seller.budget}</label>
                    <input name="budget" type="number" placeholder="1,00,00,000" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>{t.seller.additionalSpecs}</label>
                  <textarea name="description" placeholder={t.seller.specsPlaceholder} rows="3"></textarea>
                </div>

                <button type="submit" className="premium-button" style={{ justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }}>{t.seller.postBuilder}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PropertyDetailView = () => (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <button onClick={() => setView('buyer')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <X size={18} /> {t.detail.back}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px' }}>
        <div>
          <img src={selectedProperty.image} alt={selectedProperty.title} style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '30px', marginBottom: '2rem', boxShadow: 'var(--shadow-premium)' }} />
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <span className="badge">{selectedProperty.type}</span>
              <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>{t.detail.active}</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>{selectedProperty.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={24} color="var(--accent-gold)" /> {selectedProperty.location}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', padding: '30px', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.detail.bedrooms}</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.beds}</h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.detail.bathrooms}</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.baths}</h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.detail.sqft}</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.sqft}</h4>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t.detail.description}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedProperty.description}</p>
          </div>
        </div>

        <div>
          <div className="glass" style={{ padding: '30px', borderRadius: '30px', position: 'sticky', top: '120px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>{t.detail.price}</p>
            <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '2rem' }}>${selectedProperty.price.toLocaleString()}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--bg-primary)' }}>
                {selectedProperty.seller.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.detail.listedBy}</p>
                <h4 style={{ fontSize: '1.1rem' }}>{selectedProperty.seller}</h4>
              </div>
            </div>

            <button onClick={() => setIsChatOpen(true)} className="premium-button" style={{ width: '100%', justifyContent: 'center', marginBottom: '15px' }}>
              <MessageSquare size={18} /> {t.detail.contact}
            </button>
            <button className="secondary-button" style={{ width: '100%', justifyContent: 'center' }}>
              {t.detail.save}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '20px' }}>
              {t.detail.verified}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatOverlay = () => (
    <div className="glass" style={{ position: 'fixed', bottom: '30px', right: '30px', width: '380px', height: '500px', borderRadius: '25px', zIndex: 1001, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
      <div style={{ background: 'var(--accent-gold)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '35px', height: '35px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            {selectedProperty.seller.charAt(0)}
          </div>
          <p style={{ fontWeight: 600, color: 'var(--bg-primary)' }}>{t.chat.title} {selectedProperty.seller}</p>
        </div>
        <button onClick={() => setIsChatOpen(false)}><X size={20} color="var(--bg-primary)" /></button>
      </div>
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '15px 15px 15px 0', maxWidth: '80%' }}>
          <p style={{ fontSize: '0.9rem' }}>{t.chat.initialMsg}{selectedProperty.title}{t.chat.initialAltMsg}</p>
        </div>
        <div style={{ alignSelf: 'flex-end', background: 'var(--accent-gold)', color: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '15px 15px 0 15px', maxWidth: '80%' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hello! Yes, it is still on the market. Would you like to schedule a virtual tour or a visit?</p>
        </div>
      </div>
      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
        <input placeholder={t.chat.placeholder} style={{ flex: 1, borderRadius: '20px', padding: '10px 15px' }} />
        <button style={{ background: 'var(--accent-gold)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={18} color="var(--bg-primary)" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <CustomModal />
      <Nav />

      {view === 'landing' && <LandingView />}
      {view === 'buyer' && <BuyerView />}
      {view === 'builders' && <BuyerView />} {/* Reusing buyer view for matching feed */}
      {view === 'seller' && <PostPropertyView />}
      {view === 'detail' && selectedProperty && <PropertyDetailView />}

      {view === 'auth' && (
        <div className="container" style={{ paddingTop: '150px', display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{isOtpSent ? t.auth.verify : t.auth.login}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {isOtpSent ? `${t.auth.codeSent} ${phoneNumber}` : t.auth.connect}
            </p>

            {!isOtpSent ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--accent-gold)' }}>+91</div>
                    <input
                      type="tel"
                      placeholder="99999 99999"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhoneNumber(val);
                        if (val.replace(/\D/g, '').length === 10) {
                          checkReturningUser(val);
                        } else {
                          setIsReturningUser(false);
                        }
                      }}
                      style={{ width: '100%', marginTop: '5px', paddingLeft: '45px' }}
                      required
                    />
                  </div>
                </div>

                {phoneNumber.replace(/\D/g, '').length >= 10 && (
                  isReturningUser ? (
                    <div className="animate-fade" style={{
                      padding: '20px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '20px',
                      border: '1px solid var(--accent-gold)',
                      textAlign: 'center',
                      marginBottom: '15px'
                    }}>
                      <p style={{ color: 'var(--accent-gold)', fontWeight: 'bold', margin: 0 }}>
                        Welcome Back, <span style={{ fontSize: '1.2rem' }}>{userName}</span>!
                      </p>
                      <img
                        src="https://img.icons8.com/isometric/50/checked-user-male.png"
                        alt="returning"
                        style={{ width: '40px', margin: '10px 0', opacity: 0.8 }}
                      />
                      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>We've found your account. Get your OTP to find your dream property.</p>
                    </div>
                  ) : (
                    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>{t.auth.fullName}</label>
                        <div style={{ position: 'relative' }}>
                          <User size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', paddingLeft: '45px' }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', paddingLeft: '45px' }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>City</label>
                          <div style={{ position: 'relative' }}>
                            <MapPin size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="text"
                              placeholder="Delhi"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              style={{ width: '100%', marginTop: '5px', paddingLeft: '45px' }}
                              required
                            />
                          </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>Pincode</label>
                          <div style={{ position: 'relative' }}>
                            <Hash size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="number"
                              placeholder="110085"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              style={{ width: '100%', marginTop: '5px', paddingLeft: '45px' }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}


                <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>
                  {t.auth.sendOtp}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  maxLength="6"
                  placeholder={t.auth.enterCode}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
                  onChange={(e) => e.target.value.length === 6 && handleVerifyOTP(e.target.value)}
                />
                <button
                  onClick={() => setIsOtpSent(false)}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  {t.auth.editPhone}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isChatOpen && <ChatOverlay />}

      <footer style={{ background: 'var(--bg-secondary)', padding: '60px 0', marginTop: '60px', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '15px' }}>DalaalStreet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px' }}>
            {t.footer.tagline}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)' }}>
            <a href="#">{t.footer.terms}</a>
            <a href="#">{t.footer.privacy}</a>
            <a href="#">{t.footer.contact}</a>
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t.footer.rights} <span style={{ opacity: 0.5 }}>v5.0 (Global Launch)</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
