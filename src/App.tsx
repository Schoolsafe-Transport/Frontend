import { useState, FC } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './pages/LoginView';
import { RegisterView } from './pages/RegisterView';
import { ForgotPasswordView } from './pages/ForgotPasswordView';
import { DashboardView } from './pages/DashboardView';
import { HomeImageSlider } from './components/HomeImageSlider';
import { UserRole } from './types/auth';
import {
  Shield,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  Search,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Car,
  Wrench,
  Fuel,
  Users,
} from 'lucide-react';

const MainContent: FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LANDING');
  const [selectedInitialRole, setSelectedInitialRole] = useState<UserRole>('PARENT');

  const openRegister = (role: UserRole = 'PARENT') => {
    setSelectedInitialRole(role);
    setCurrentView('REGISTER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLogin = () => {
    setCurrentView('LOGIN');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'LANDING') {
      setCurrentView('LANDING');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 3. Header & Navigation Bar */}
      <header className="navbar-clean">
        <div className="container navbar-inner">
          <div
            className="brand-link"
            onClick={() => {
              setCurrentView('LANDING');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="brand-logo-wrap">
              <img src="/logo-shield.png" alt="SchoolSafe Logo" className="brand-logo-img" />
            </div>
            <div className="brand-text-col">
              <span className="brand-text">SchoolSafe</span>
              <span className="brand-tagline">SMART TRANSIT</span>
            </div>
          </div>

          <nav className="nav-menu">
            <button className="nav-link" onClick={() => scrollToSection('top')}>
              Home
            </button>
            <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
            <button className="nav-link" onClick={() => scrollToSection('safety')}>
              Safety
            </button>
            <button className="nav-link" onClick={() => scrollToSection('providers')}>
              For Providers
            </button>
            <button className="nav-link" onClick={() => scrollToSection('businesses')}>
              For Businesses
            </button>
            <button className="nav-link" onClick={() => scrollToSection('about')}>
              About
            </button>
          </nav>

          <div className="nav-cta-group">
            {!user ? (
              <>
                <button className="btn btn-ghost" onClick={openLogin}>
                  Sign In
                </button>
                <button className="btn btn-primary" onClick={() => openRegister('PARENT')}>
                  Get Started
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setCurrentView('LANDING');
                }}
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {user ? (
          <DashboardView />
        ) : (
          <>
            {currentView === 'LOGIN' && (
              <div className="auth-page">
                <LoginView
                  onSwitchToRegister={() => openRegister('PARENT')}
                  onSwitchToForgotPassword={() => setCurrentView('FORGOT_PASSWORD')}
                  onSuccess={() => setCurrentView('LANDING')}
                />
              </div>
            )}

            {currentView === 'REGISTER' && (
              <div className="auth-page">
                <RegisterView
                  initialRole={selectedInitialRole}
                  onSwitchToLogin={openLogin}
                  onSuccess={() => setCurrentView('LANDING')}
                />
              </div>
            )}

            {currentView === 'FORGOT_PASSWORD' && (
              <div className="auth-page">
                <ForgotPasswordView onSwitchToLogin={openLogin} />
              </div>
            )}

            {currentView === 'LANDING' && (
              <div id="top">
                {/* 4. Hero Section */}
                <section className="hero-section">
                  <div className="container hero-grid">
                    <div className="hero-content">
                      <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Sparkles size={14} /> Safe & Verified Student Transit
                      </div>
                      <h1>Safe Transportation for Every School Journey</h1>
                      <p className="hero-subtitle">
                        SchoolSafe connects parents with verified transportation providers, helping
                        families find, manage, and safely track their children's school transportation.
                      </p>

                      <div className="hero-actions">
                        <button className="btn btn-primary btn-lg" onClick={() => openRegister('PARENT')}>
                          Find Transportation <ArrowRight size={18} />
                        </button>
                        <button
                          className="btn btn-secondary btn-lg"
                          onClick={() => openRegister('TRANSPORT_PROVIDER')}
                        >
                          Become a Transport Provider
                        </button>
                      </div>

                      {/* Small Trust Indicators */}
                      <div className="hero-trust-bar">
                        <div className="trust-item">
                          <ShieldCheck size={18} />
                          <span>Verified Providers</span>
                        </div>
                        <div className="trust-item">
                          <MapPin size={18} />
                          <span>Real-Time Trip Tracking</span>
                        </div>
                        <div className="trust-item">
                          <CheckCircle2 size={18} />
                          <span>Child Safety Monitoring</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Self-Changing Live Trip & Fleet Showcase Card */}
                    <HomeImageSlider />
                  </div>
                </section>

                {/* 8. How It Works Section */}
                <section id="how-it-works" className="section section-alt">
                  <div className="container">
                    <div className="section-header">
                      <span className="section-tag">HOW IT WORKS</span>
                      <h2>Simple, Safe Transportation in 3 Steps</h2>
                      <p>
                        SchoolSafe streamlines the entire school transit experience for families with
                        clarity, verified safety credentials, and day-to-day peace of mind.
                      </p>
                    </div>

                    <div className="grid-3">
                      <div className="card-feature">
                        <div className="step-number">STEP 01</div>
                        <div className="card-icon-box">
                          <Search size={24} />
                        </div>
                        <h3>Find</h3>
                        <p>
                          Parents search for transportation based on school, location, route, price,
                          and availability.
                        </p>
                      </div>

                      <div className="card-feature">
                        <div className="step-number">STEP 02</div>
                        <div className="card-icon-box">
                          <MessageSquare size={24} />
                        </div>
                        <h3>Connect</h3>
                        <p>
                          Parents request a seat and communicate with a verified Transport Provider / Driver.
                        </p>
                      </div>

                      <div className="card-feature">
                        <div className="step-number">STEP 03</div>
                        <div className="card-icon-box success">
                          <ShieldCheck size={24} />
                        </div>
                        <h3>Travel Safely</h3>
                        <p>
                          Parents can follow the child's transportation journey and receive boarding/drop-off updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 9. Safety Section */}
                <section id="safety" className="section">
                  <div className="container">
                    <div className="section-header">
                      <span className="section-tag" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                        SAFETY FIRST
                      </span>
                      <h2>Built Around Your Child's Safety</h2>
                      <p>
                        Every feature in SchoolSafe is designed from the ground up to keep children safe,
                        keep parents informed, and ensure transport standards are rigorously upheld.
                      </p>
                    </div>

                    <div className="grid-4">
                      <div className="card-feature">
                        <div className="card-icon-box success">
                          <ShieldCheck size={24} />
                        </div>
                        <h3>Verified Providers</h3>
                        <p>
                          Transportation providers submit required information and documents for verification.
                        </p>
                      </div>

                      <div className="card-feature">
                        <div className="card-icon-box">
                          <MapPin size={24} />
                        </div>
                        <h3>Live Trip Tracking</h3>
                        <p>
                          Parents can follow active transportation journeys with accurate route updates.
                        </p>
                      </div>

                      <div className="card-feature">
                        <div className="card-icon-box success">
                          <Clock size={24} />
                        </div>
                        <h3>Boarding & Drop-Off</h3>
                        <p>
                          Student boarding and drop-off events can be recorded and verified at every stop.
                        </p>
                      </div>

                      <div className="card-feature">
                        <div className="card-icon-box" style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                          <AlertTriangle size={24} />
                        </div>
                        <h3>Emergency Reporting</h3>
                        <p>
                          Safety incidents can be reported and escalated immediately to parents and responders.
                        </p>
                      </div>
                    </div>

                    {/* 12. Student Role Information Notice */}
                    <div className="student-notice-box" id="about">
                      <div style={{ color: 'var(--color-accent)', flexShrink: 0 }}>
                        <Users size={28} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>
                          Student Safety & Account Management
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.925rem' }}>
                          Students are safely managed through their Parent/Guardian account. Student
                          transportation information, routes, and boarding check-ins can be viewed directly
                          through the parent dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 10. Transport Provider Section */}
                <section id="providers" className="section section-alt">
                  <div className="container">
                    <div className="banner-card">
                      <div style={{ maxWidth: '720px' }}>
                        <span className="section-tag">FOR OPERATORS & DRIVERS</span>
                        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                          Run Your School Transportation Business With SchoolSafe
                        </h2>
                        <p>
                          Join a trusted network of school transportation operators. SchoolSafe equips
                          you with digital tools to streamline route planning, seat bookings, and parent communication.
                        </p>

                        <div className="feature-check-list">
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Register your vehicle
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Define routes
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Set prices
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Manage available seats
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Receive transportation requests
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Manage trips
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Track earnings
                          </div>
                          <div className="feature-check-item">
                            <CheckCircle2 size={18} /> Build your reputation
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-lg"
                          onClick={() => openRegister('TRANSPORT_PROVIDER')}
                        >
                          Become a Transport Provider <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 11. Business Advertising Section */}
                <section id="businesses" className="section">
                  <div className="container">
                    <div className="banner-card" style={{ backgroundColor: '#F8FAFC' }}>
                      <div style={{ maxWidth: '750px' }}>
                        <span className="section-tag" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                          ADVERTISING PLATFORM
                        </span>
                        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                          Reach Families That Matter to Your Business
                        </h2>
                        <p>
                          SchoolSafe provides an advertising platform where verified businesses can reach
                          parents, transport operators, and school communities with relevant products and services.
                        </p>

                        <div className="category-tags">
                          <span className="category-tag">
                            <Wrench size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Automotive services
                          </span>
                          <span className="category-tag">
                            <Car size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Tire shops
                          </span>
                          <span className="category-tag">
                            <Building2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Car dealerships
                          </span>
                          <span className="category-tag">
                            <Shield size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Insurance
                          </span>
                          <span className="category-tag">
                            <Fuel size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Spare parts
                          </span>
                          <span className="category-tag">
                            <Wrench size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Vehicle maintenance
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-navy btn-lg" onClick={() => openRegister('BUSINESS')}>
                            Advertise With SchoolSafe <ArrowRight size={18} />
                          </button>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Target local school routes and verified fleet operators directly.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>

      {/* 13. Professional Footer */}
      <footer className="footer-clean">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand-link" onClick={() => scrollToSection('top')}>
                <div className="brand-logo-wrap">
                  <img src="/logo-shield.png" alt="SchoolSafe Logo" className="brand-logo-img" />
                </div>
                <div className="brand-text-col">
                  <span className="brand-text">SchoolSafe</span>
                  <span className="brand-tagline">SMART TRANSIT</span>
                </div>
              </div>
              <p>
                Safe and reliable school transportation management. Connecting families with
                verified drivers for everyday peace of mind.
              </p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <ul className="footer-links">
                <li>
                  <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
                    Find Transportation
                  </a>
                </li>
                <li>
                  <a href="#providers" onClick={(e) => { e.preventDefault(); scrollToSection('providers'); }}>
                    For Providers
                  </a>
                </li>
                <li>
                  <a href="#safety" onClick={(e) => { e.preventDefault(); scrollToSection('safety'); }}>
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#businesses" onClick={(e) => { e.preventDefault(); scrollToSection('businesses'); }}>
                    Advertising
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul className="footer-links">
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 SchoolSafe Inc. All rights reserved.</span>
            <span>Safe transportation. Peace of mind for every journey.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
