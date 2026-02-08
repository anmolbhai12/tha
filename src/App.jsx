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
import { gsap } from 'gsap';

// Mock Data
const INITIAL_PROPERTIES = [];

function App() {
  const [view, setView] = useState('landing'); // landing, buyer, seller, detail, auth
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth State
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // GAS URLs
  const WHATSAPP_PROXY_URL = 'https://script.google.com/macros/s/AKfycbyRP0RblHnJUQO6tcrp4upuecM7aakmxd8szOM8UBBhrdB4t0F5-P4YG6mmacPMXAZyXg/exec';
  const SIGNUP_LOG_URL = 'https://script.google.com/macros/s/AKfycbyRP0RblHnJUQO6tcrp4upuecM7aakmxd8szOM8UBBhrdB4t0F5-P4YG6mmacPMXAZyXg/exec';

  // Animation Effects
  useEffect(() => {
    if (view === 'landing') {
      gsap.from('.hero-content > *', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
      });
    }
  }, [view]);

  // Power-Sync Integration (CORS-Proof)
  const powerSync = (url, data) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'powerSyncFrame';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.target = 'powerSyncFrame';
    form.action = url;
    form.method = 'POST';

    for (const key in data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 2000);
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(generatedOtp.toString()); // In production, this would be on the server

    // Send via WhatsApp Proxy
    powerSync(WHATSAPP_PROXY_URL, {
      phone: phoneNumber,
      message: `Your DalaalStreet verification code is: ${generatedOtp}. Welcome to the legend.`
    });

    setIsOtpSent(true);
  };

  const handleVerifyOTP = (enteredCode) => {
    if (enteredCode === otp) {
      setUser({ phone: phoneNumber });

      // Log ONLY new users to spreadsheet
      if (isNewUser) {
        powerSync(SIGNUP_LOG_URL, {
          phone: phoneNumber,
          name: userName || "Legendary User",
          timestamp: new Date().toISOString()
        });
      }

      setView('landing');
    } else {
      alert("Invalid code. Please try again.");
    }
  };

  // Handle New Property
  const handlePostProperty = (e) => {
    if (!user) {
      setView('auth');
      return;
    }
    const formData = new FormData(e.target);
    const newProp = {
      id: properties.length + 1,
      title: formData.get('title'),
      location: formData.get('location'),
      price: parseInt(formData.get('price')),
      beds: parseInt(formData.get('beds')),
      baths: parseInt(formData.get('baths')),
      sqft: parseInt(formData.get('sqft')),
      type: formData.get('type'),
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1350&q=80",
      description: formData.get('description'),
      seller: "You (Legend)"
    };
    setProperties([newProp, ...properties]);
    setView('buyer');
  };

  const Nav = () => (
    <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon size={24} color="var(--bg-primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>DalaalStreet</h2>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button onClick={() => setView('buyer')} style={{ color: view === 'buyer' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>Explore</button>
          <button onClick={() => user ? setView('seller') : setView('auth')} className="premium-button">
            <Plus size={18} /> Sell Property
          </button>
          <button
            onClick={() => !user && setView('auth')}
            style={{ color: user ? 'var(--accent-gold)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={20} />
            {user && <span style={{ fontSize: '0.8rem' }}>Connected</span>}
          </button>
        </div>
      </div>
    </nav>
  );

  const LandingView = () => (
    <div className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("https://images.unsplash.com/photo-1600585154340-be6199f7a096?auto=format&fit=crop&w=1920&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container hero-content">
        <span className="badge">Welcome to DalaalStreet</span>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1.5rem', maxWidth: '900px', lineHeight: 1.1, color: '#fff' }}>
          Discover Your <span className="text-gradient-gold">Masterpiece</span> Home
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
          Connecting sophisticated buyers with extraordinary properties. DalaalStreet delivers a seamless, premium marketplace experience for the modern legend.
        </p>
        <div className="glass" style={{ padding: '10px', borderRadius: '100px', display: 'flex', maxWidth: '600px', gap: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px', flex: 1 }}>
            <Search size={22} color="var(--accent-gold)" />
            <input
              placeholder="Search by location..."
              style={{ background: 'transparent', border: 'none', padding: '12px 0', width: '100%', color: '#fff' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setView('buyer')} className="premium-button">Find Homes</button>
        </div>
      </div>
    </div>
  );

  const BuyerView = () => (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem' }}>Curated Selections</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Explore {properties.length} active listings in your area</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="glass" style={{ padding: '10px 20px', borderRadius: '30px', color: 'white', border: '1px solid var(--border-color)' }}>
            <option>All Types</option>
            <option>Villa</option>
            <option>Penthouse</option>
            <option>Apartment</option>
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
                <button className="secondary-button" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostPropertyView = () => (
    <div className="container" style={{ paddingTop: '120px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '3rem' }}>List Your Property</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Let our exclusive buyers discover your masterpiece.</p>
      </div>
      <form onSubmit={handlePostProperty} className="glass" style={{ padding: '40px', borderRadius: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Property Title</label>
            <input name="title" placeholder="e.g. Majestic Heights Villa" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Location</label>
            <input name="location" placeholder="e.g. Beverly Hills, CA" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Price ($)</label>
            <input name="price" type="number" placeholder="500000" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Property Type</label>
            <select name="type" className="glass" style={{ padding: '12px', borderRadius: '8px', color: 'white' }}>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Penthouse</option>
              <option>House</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Area (sqft)</label>
            <input name="sqft" type="number" placeholder="2000" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Bedrooms</label>
            <input name="beds" type="number" placeholder="3" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Bathrooms</label>
            <input name="baths" type="number" placeholder="2" required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Description</label>
          <textarea name="description" rows="4" placeholder="Tell us about the property's unique charm..." required></textarea>
        </div>

        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '15px', padding: '40px', textAlign: 'center', cursor: 'pointer' }}>
          <Camera size={32} color="var(--accent-gold)" style={{ marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Click to upload property images</p>
        </div>

        <button type="submit" className="premium-button" style={{ justifyContent: 'center', marginTop: '10px' }}>
          Submit Listing for Review
        </button>
      </form>
    </div>
  );

  const PropertyDetailView = () => (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <button onClick={() => setView('buyer')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <X size={18} /> Back to Listings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px' }}>
        <div>
          <img src={selectedProperty.image} alt={selectedProperty.title} style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '30px', marginBottom: '2rem', boxShadow: 'var(--shadow-premium)' }} />
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <span className="badge">{selectedProperty.type}</span>
              <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>Active</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>{selectedProperty.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={24} color="var(--accent-gold)" /> {selectedProperty.location}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', padding: '30px', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bedrooms</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.beds}</h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bathrooms</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.baths}</h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Square Feet</p>
              <h4 style={{ fontSize: '1.5rem' }}>{selectedProperty.sqft}</h4>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedProperty.description}</p>
          </div>
        </div>

        <div>
          <div className="glass" style={{ padding: '30px', borderRadius: '30px', position: 'sticky', top: '120px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Listing Price</p>
            <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '2rem' }}>${selectedProperty.price.toLocaleString()}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--bg-primary)' }}>
                {selectedProperty.seller.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Listed by</p>
                <h4 style={{ fontSize: '1.1rem' }}>{selectedProperty.seller}</h4>
              </div>
            </div>

            <button onClick={() => setIsChatOpen(true)} className="premium-button" style={{ width: '100%', justifyContent: 'center', marginBottom: '15px' }}>
              <MessageSquare size={18} /> Contact Seller
            </button>
            <button className="secondary-button" style={{ width: '100%', justifyContent: 'center' }}>
              Save to Favorites
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '20px' }}>
              Verified by DalaalStreet. Terms and conditions apply.
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
          <p style={{ fontWeight: 600, color: 'var(--bg-primary)' }}>Chat with {selectedProperty.seller}</p>
        </div>
        <button onClick={() => setIsChatOpen(false)}><X size={20} color="var(--bg-primary)" /></button>
      </div>
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '15px 15px 15px 0', maxWidth: '80%' }}>
          <p style={{ fontSize: '0.9rem' }}>Hello! I'm interested in {selectedProperty.title}. Is it still available?</p>
        </div>
        <div style={{ alignSelf: 'flex-end', background: 'var(--accent-gold)', color: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '15px 15px 0 15px', maxWidth: '80%' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hello! Yes, it is still on the market. Would you like to schedule a virtual tour or a visit?</p>
        </div>
      </div>
      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
        <input placeholder="Type your message..." style={{ flex: 1, borderRadius: '20px', padding: '10px 15px' }} />
        <button style={{ background: 'var(--accent-gold)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={18} color="var(--bg-primary)" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <Nav />

      {view === 'landing' && <LandingView />}
      {view === 'buyer' && <BuyerView />}
      {view === 'seller' && <PostPropertyView />}
      {view === 'detail' && selectedProperty && <PropertyDetailView />}

      {view === 'auth' && (
        <div className="container" style={{ paddingTop: '150px', display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{isOtpSent ? 'Verify OTP' : 'Login / Sign Up'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {isOtpSent ? `We sent a code to ${phoneNumber}` : 'Connect your WhatsApp to start trading masterpiece homes.'}
            </p>

            {!isOtpSent ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{ width: '100%', marginTop: '5px' }}
                    required
                  />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginLeft: '10px' }}>WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', marginTop: '5px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isNewUser}
                    onChange={(e) => setIsNewUser(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>I am a new user (Create Account)</span>
                </div>
                <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>
                  Send OTP via WhatsApp
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
                  onChange={(e) => e.target.value.length === 6 && handleVerifyOTP(e.target.value)}
                />
                <button
                  onClick={() => setIsOtpSent(false)}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  Edit Phone Number
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
            The world's most unique premium real estate marketplace. Built for legends.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)' }}>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 DalaalStreet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
