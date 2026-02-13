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
  Check
} from 'lucide-react';
import { translations } from './translations';
import { gsap } from 'gsap';
import FoxBot from './FoxBot.jsx';

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
  const [sortBy, setSortBy] = useState('latest'); // latest, priceHigh, priceLow, old

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

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "⭐ Publishing...";
    btn.disabled = true;

    // Build WhatsApp Message
    const msg = `🏠 *THA EXCLUSIVE LISTING*
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

      const newProp = {
        id: properties.length + 1,
        title: data.title || `${data.category} in ${data.location}`,
        location: data.location,
        price: parseInt(data.price || data.budget),
        beds: parseInt(data.beds || 0),
        baths: parseInt(data.baths || 0),
        sqft: parseInt(data.area),
        type: data.category || "Plot",
        image: mediaItems[0].url, // Backwards compatibility
        media: mediaItems,
        description: data.description || `Professional ${type} listing.`,
        seller: userName || "Verified Professional",
        createdAt: new Date().toISOString()
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

  const Nav = () => (
    <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <img src="/logo-tha-horizontal.svg" alt="Tha Logo" style={{ height: '70px', width: 'auto' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a onClick={() => setView('buyer')} style={{ cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>{t.nav.marketplace}</a>
          <button onClick={() => user ? setView('seller') : setView('auth')} className="premium-button">
            <Plus size={18} /> {t.nav.postProperty}
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

  const LandingView = () => {
    return (
      <React.Fragment>
        {isSearchExpanded && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--accent-gold)', padding: '20px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                {/* Standalone language switcher removed as per request */}
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
          <select
            className="glass"
            style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--accent-gold)' }}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {properties
          .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()))
          .sort((a, b) => {
            if (sortBy === 'priceHigh') return b.price - a.price;
            if (sortBy === 'priceLow') return a.price - b.price;
            if (sortBy === 'old') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          })
          .map(prop => (
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Maximize size={16} /> {prop.sqft}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', fontWeight: 700 }}>₹{prop.price.toLocaleString()}</span>
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
              url: reader.result
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
                            <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <label>{t.seller.price}</label>
                    <input name="price" type="number" placeholder="50,00,000" required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label>{sellerType === 'agricultural' ? t.seller.areaAcres : t.seller.areaSqft}</label>
                    <input name="area" type="text" placeholder={sellerType === 'agricultural' ? 'e.g. 2 Acres' : '1200'} required />
                  </div>
                  <div className="input-group">
                    <label>{t.seller.floors}</label>
                    <input name="totalFloors" type="text" placeholder={sellerType === 'residential' ? "Total Floors (e.g. 4)" : "Additional Details"} />
                  </div>
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

  const PropertyDetailView = () => {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    // Normalize media for display (handle legacy properties)
    const mediaList = selectedProperty.media || [{ type: 'image', url: selectedProperty.image }];
    const currentMedia = mediaList[selectedMediaIndex] || mediaList[0];

    return (
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <button onClick={() => setView('buyer')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          <X size={18} /> {t.detail.back}
        </button>

        <div className="glass" style={{ padding: '30px', borderRadius: '30px', position: 'sticky', top: '120px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>{t.detail.price}</p>
          <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '2rem' }}>₹{selectedProperty.price.toLocaleString()}</h2>

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
    );
  };

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
            {t.footer.rights} <span style={{ opacity: 0.5 }}>v5.0 (Global Launch)</span>
          </p>
        </div>
      </footer>

      {/* FOX - THE CLEVER AI BOT */}
      <FoxBot
        properties={properties}
        setView={setView}
        setSelectedProperty={setSelectedProperty}
        userName={user?.name}
      />
    </div>
  );
}

export default App;
