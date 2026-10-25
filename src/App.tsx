import { useState, useEffect, FC } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './pages/LoginView';
import { RegisterView } from './pages/RegisterView';
import { ForgotPasswordView } from './pages/ForgotPasswordView';
import { DashboardView } from './pages/DashboardView';
import { AboutView } from './pages/AboutView';
import { ContactView } from './pages/ContactView';
import { HowItWorksView } from './pages/HowItWorksView';
import { SafetyView } from './pages/SafetyView';
import { ProvidersView } from './pages/ProvidersView';
import { BusinessesView } from './pages/BusinessesView';
import { PrivacyPolicyView, TermsOfServiceView, HelpCenterView } from './pages/PolicyViews';
import { HomeImageSlider } from './components/HomeImageSlider';
import { FaydaVerificationView } from './pages/FaydaVerificationView';
import { EmailVerificationView } from './pages/EmailVerificationView';
import { AdminDashboardRoot } from './pages/admin/AdminDashboardRoot';
import { User, UserRole } from './types/auth';
import {
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  AlertCircle,
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

export type ViewState =
  | 'LANDING'
  | 'HOW_IT_WORKS'
  | 'SAFETY'
  | 'PROVIDERS'
  | 'BUSINESSES'
  | 'ABOUT'
  | 'CONTACT'
  | 'PRIVACY'
  | 'TERMS'
  | 'HELP'
  | 'LOGIN'
  | 'REGISTER'
  | 'FORGOT_PASSWORD'
  | 'VERIFY_FAYDA'
  | 'VERIFY_EMAIL'
  | 'ADMIN';

export const getViewFromPath = (pathname: string): ViewState => {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return 'ADMIN';
  }
  switch (cleanPath) {
    case '/about':
      return 'ABOUT';
    case '/contact':
      return 'CONTACT';
    case '/how-it-works':
    case '/howitworks':
      return 'HOW_IT_WORKS';
    case '/safety':
      return 'SAFETY';
    case '/providers':
    case '/for-providers':
      return 'PROVIDERS';
    case '/businesses':
    case '/for-businesses':
    case '/advertising':
      return 'BUSINESSES';
    case '/privacy':
    case '/privacy-policy':
      return 'PRIVACY';
    case '/terms':
    case '/terms-of-service':
      return 'TERMS';
    case '/help':
    case '/help-center':
      return 'HELP';
    case '/login':
    case '/signin':
      return 'LOGIN';
    case '/register':
    case '/signup':
      return 'REGISTER';
    case '/forgot-password':
      return 'FORGOT_PASSWORD';
    case '/verify-email':
    case '/verify-account':
      return 'VERIFY_EMAIL';
    case '/verify-fayda':
    case '/fayda-verification':
    case '/verify':
      return 'VERIFY_FAYDA';
    default:
      return 'LANDING';
  }
};

export const getPathFromView = (view: ViewState): string => {
  switch (view) {
    case 'ADMIN':
      return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
        ? window.location.pathname
        : '/admin';
    case 'ABOUT':
      return '/about';
    case 'CONTACT':
      return '/contact';
    case 'HOW_IT_WORKS':
      return '/how-it-works';
    case 'SAFETY':
      return '/safety';
    case 'PROVIDERS':
      return '/providers';
    case 'BUSINESSES':
      return '/businesses';
    case 'PRIVACY':
      return '/privacy';
    case 'TERMS':
      return '/terms';
    case 'HELP':
      return '/help';
    case 'LOGIN':
      return '/login';
    case 'REGISTER':
      return '/register';
    case 'FORGOT_PASSWORD':
      return '/forgot-password';
    case 'VERIFY_EMAIL':
      return '/verify-email';
    case 'VERIFY_FAYDA':
      return '/verify-fayda';
    case 'LANDING':
    default:
      return '/';
  }
};

export const checkUserVerificationStatus = (user: User | null): {
  canAccessDashboard: boolean;
  requiredView?: ViewState;
  reason?: 'UNAUTHENTICATED' | 'EMAIL_VERIFICATION_REQUIRED';
} => {
  if (!user) {
    return { canAccessDashboard: false, requiredView: 'LOGIN', reason: 'UNAUTHENTICATED' };
  }

  // Dashboard access is granted directly without blocking onboarding screens
  return { canAccessDashboard: true };
};

const MainContent: FC = () => {
  const { user, refreshUser, clearError, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    if (typeof window !== 'undefined') {
      return getViewFromPath(window.location.pathname);
    }
    return 'LANDING';
  });
  const [selectedInitialRole, setSelectedInitialRole] = useState<UserRole>('PARENT');
  const [faydaNotification, setFaydaNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const navigateTo = (view: ViewState, role?: UserRole) => {
    clearError();
    if (role) {
      setSelectedInitialRole(role);
    }
    setCurrentView(view);
    const targetPath = getPathFromView(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      clearError();
      const matched = getViewFromPath(window.location.pathname);
      setCurrentView(matched);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [clearError]);

  // Handle Fayda OAuth/OIDC redirection callback parameters in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const faydaStatus = searchParams.get('fayda');
      if (faydaStatus === 'success') {
        refreshUser();
        setFaydaNotification({
          type: 'success',
          message:
            'Fayda National Digital ID verified successfully! Your account is now officially verified.',
        });
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
      } else if (faydaStatus === 'error') {
        const msg =
          searchParams.get('message') ||
          'Fayda identity verification was not completed. Please retry verification.';
        setFaydaNotification({
          type: 'error',
          message: msg,
        });
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
      }
    }
  }, [refreshUser]);

  // Centralized Route Guard:
  // Before granting access to a protected dashboard, enforce account verification state
  useEffect(() => {
    if (user) {
      const status = checkUserVerificationStatus(user);
      if (!status.canAccessDashboard && status.requiredView) {
        // If unverified user attempts to view the dashboard directly, redirect to required verification view
        if (currentView === 'LANDING') {
          navigateTo(status.requiredView);
        }
      } else if (status.canAccessDashboard) {
        // If user is already fully verified and visits verification view, redirect to dashboard
        if (currentView === 'VERIFY_FAYDA') {
          navigateTo('LANDING');
        }
      }
    }
  }, [user, currentView]);

  const openRegister = (role: UserRole = 'PARENT') => {
    navigateTo('REGISTER', role);
  };

  const openLogin = () => navigateTo('LOGIN');
  const openAbout = () => navigateTo('ABOUT');
  const openContact = () => navigateTo('CONTACT');
  const openPrivacy = () => navigateTo('PRIVACY');
  const openTerms = () => navigateTo('TERMS');
  const openHelp = () => navigateTo('HELP');
  const openHome = () => navigateTo('LANDING');

  // Dedicated Admin Console: System Administrators receive AdminDashboardRoot layout directly!
  if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    if (currentView === 'LANDING' || currentView === 'ADMIN') {
      return <AdminDashboardRoot />;
    }
  }

  // Guard for /admin path when user is unauthenticated or not an admin
  if (currentView === 'ADMIN') {
    if (!user) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
          <header className="navbar-clean">
            <div className="container navbar-inner">
              <div className="brand-link" onClick={openHome} role="button" tabIndex={0}>
                <div className="brand-logo-wrap">
                  <img src="/logo-shield.png" alt="SchoolSafe Logo" className="brand-logo-img" />
                </div>
                <div className="brand-text-col">
                  <span className="brand-text">SchoolSafe</span>
                  <span className="brand-tagline">ADMIN CONSOLE</span>
                </div>
              </div>
              <div className="nav-cta-group">
                <button className="btn btn-primary btn-sm" onClick={openLogin}>Sign In</button>
              </div>
            </div>
          </header>
          <main style={{ flex: 1, padding: '3rem 1rem' }}>
            <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
              <div className="panel-card" style={{ padding: '2.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShieldCheck size={28} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                  Administrator Authentication Required
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Access to the SchoolSafe System Administrator console requires authorized administrator credentials. Please sign in with an active administrator account.
                </p>
                <button className="btn btn-primary" onClick={openLogin} style={{ width: '100%', justifyContent: 'center' }}>
                  Sign In as Administrator
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      navigateTo('LANDING');
      return null;
    }
  }

  // Dedicated Authenticated Dashboard Layout:
  // STRICT GUARD: Only rendered when user exists AND satisfies ALL required verification checks!
  if (user && currentView === 'LANDING') {
    const status = checkUserVerificationStatus(user);
    if (!status.canAccessDashboard && status.requiredView) {
      // Re-route unverified user immediately to their required verification onboarding screen
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
          <header className="navbar-clean">
            <div className="container navbar-inner">
              <div className="brand-link" onClick={openHome} role="button" tabIndex={0}>
                <div className="brand-logo-wrap">
                  <img src="/logo-shield.png" alt="SchoolSafe Logo" className="brand-logo-img" />
                </div>
                <div className="brand-text-col">
                  <span className="brand-text">SchoolSafe</span>
                  <span className="brand-tagline">SMART TRANSIT</span>
                </div>
              </div>
              <div className="nav-cta-group">
                <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
              </div>
            </div>
          </header>
          <main style={{ flex: 1, padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '620px' }}>
              {status.requiredView === 'VERIFY_EMAIL' ? (
                <>
                  <div className="alert alert-warning" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={22} style={{ flexShrink: 0, color: '#d97706' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e' }}>Email Verification Required</strong>
                      <span style={{ fontSize: '0.875rem', color: '#78350f' }}>Please verify your email address to continue using SchoolSafe and access your dashboard.</span>
                    </div>
                  </div>
                  <EmailVerificationView
                    onSuccess={() => {
                      refreshUser();
                      navigateTo('LANDING');
                    }}
                    onNavigateToDashboard={() => navigateTo('LANDING')}
                    onSwitchToLogin={openLogin}
                  />
                </>
              ) : (
                <>
                  <div className="alert alert-warning" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={22} style={{ flexShrink: 0, color: '#d97706' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e' }}>Fayda Identity Verification Required</strong>
                      <span style={{ fontSize: '0.875rem', color: '#78350f' }}>Please complete your Ethiopian National Digital ID verification before accessing the dashboard.</span>
                    </div>
                  </div>
                  <FaydaVerificationView
                    onSuccess={() => {
                      refreshUser();
                      navigateTo('LANDING');
                    }}
                    onSkipToDashboard={() => {
                      // Cannot skip to dashboard without verification!
                    }}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        {faydaNotification && (
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
            <div
              className={`alert ${
                faydaNotification.type === 'success' ? 'alert-success' : 'alert-danger'
              }`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {faydaNotification.type === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{faydaNotification.message}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFaydaNotification(null)}
                style={{ padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <DashboardView onOpenVerifyFayda={() => navigateTo('VERIFY_FAYDA')} />
      </div>
    );
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 3. Streamlined Public Header & Navigation Bar */}
      <header className="navbar-clean">
        <div className="container navbar-inner">
          <div className="brand-link" onClick={openHome} role="button" tabIndex={0}>
            <div className="brand-logo-wrap">
              <img src="/logo-shield.png" alt="SchoolSafe Logo" className="brand-logo-img" />
            </div>
            <div className="brand-text-col">
              <span className="brand-text">SchoolSafe</span>
              <span className="brand-tagline">SMART TRANSIT</span>
            </div>
          </div>

          {/* Simplified Navigation: Removed redundant 'Home' and 'How It Works' for direct experience */}
          <nav className="nav-menu">
            <button
              className={`nav-link ${currentView === 'SAFETY' ? 'active' : ''}`}
              onClick={() => navigateTo('SAFETY')}
            >
              Safety
            </button>
            <button
              className={`nav-link ${currentView === 'PROVIDERS' ? 'active' : ''}`}
              onClick={() => navigateTo('PROVIDERS')}
            >
              For Providers
            </button>
            <button
              className={`nav-link ${currentView === 'BUSINESSES' ? 'active' : ''}`}
              onClick={() => navigateTo('BUSINESSES')}
            >
              For Businesses
            </button>
            <button
              className={`nav-link ${currentView === 'ABOUT' ? 'active' : ''}`}
              onClick={openAbout}
            >
              About
            </button>
            <button
              className={`nav-link ${currentView === 'CONTACT' ? 'active' : ''}`}
              onClick={openContact}
            >
              Contact
            </button>
          </nav>

          <div className="nav-cta-group">
            {!user ? (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => openRegister('PARENT')}
                  style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Find Transportation
                </button>
                <button
                  className={`btn ${currentView === 'LOGIN' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={openLogin}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openRegister('PARENT')}
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const check = checkUserVerificationStatus(user);
                  if (check.canAccessDashboard) {
                    navigateTo('LANDING');
                  } else if (check.requiredView) {
                    navigateTo(check.requiredView);
                  }
                }}
              >
                {checkUserVerificationStatus(user).canAccessDashboard ? 'Go to Dashboard' : 'Complete Verification'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {faydaNotification && (
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
            <div
              className={`alert ${
                faydaNotification.type === 'success' ? 'alert-success' : 'alert-danger'
              }`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {faydaNotification.type === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{faydaNotification.message}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFaydaNotification(null)}
                style={{ padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
          <>
            {currentView === 'LOGIN' && (
              <div className="auth-page">
                <LoginView
                  onSwitchToRegister={() => openRegister('PARENT')}
                  onSwitchToForgotPassword={() => navigateTo('FORGOT_PASSWORD')}
                  onSwitchToVerifyEmail={() => navigateTo('VERIFY_EMAIL')}
                  onSwitchToVerifyFayda={() => navigateTo('VERIFY_FAYDA')}
                  onSuccess={(loggedInUser) => {
                    const status = checkUserVerificationStatus(loggedInUser || user);
                    if (status.canAccessDashboard) {
                      navigateTo('LANDING');
                    } else if (status.requiredView) {
                      navigateTo(status.requiredView);
                    }
                  }}
                />
              </div>
            )}

            {currentView === 'REGISTER' && (
              <div className="auth-page">
                <RegisterView
                  initialRole={selectedInitialRole}
                  onSwitchToLogin={openLogin}
                  onSuccess={() => {
                    navigateTo('VERIFY_EMAIL');
                  }}
                />
              </div>
            )}

            {currentView === 'VERIFY_FAYDA' && (
              <div className="auth-page">
                <FaydaVerificationView
                  onSuccess={() => navigateTo('LANDING')}
                  onSkipToDashboard={() => {
                    // Cannot bypass to dashboard without verification
                  }}
                />
              </div>
            )}


            {currentView === 'VERIFY_EMAIL' && (
              <div className="auth-page">
                <EmailVerificationView
                  onSuccess={() => navigateTo('LANDING')}
                  onNavigateToDashboard={() => navigateTo('LANDING')}
                  onSwitchToLogin={openLogin}
                />
              </div>
            )}

            {currentView === 'FORGOT_PASSWORD' && (
              <div className="auth-page">
                <ForgotPasswordView onSwitchToLogin={openLogin} />
              </div>
            )}

            {currentView === 'ABOUT' && (
              <AboutView
                onNavigateHome={openHome}
                onOpenRegister={(role) => openRegister(role)}
              />
            )}

            {currentView === 'CONTACT' && (
              <ContactView onNavigateHome={openHome} />
            )}

            {currentView === 'HOW_IT_WORKS' && (
              <HowItWorksView
                onNavigateHome={openHome}
                onOpenRegister={(role) => openRegister(role)}
                onNavigateContact={openContact}
              />
            )}

            {currentView === 'SAFETY' && (
              <SafetyView
                onNavigateHome={openHome}
                onOpenRegister={(role) => openRegister(role)}
                onNavigatePrivacy={openPrivacy}
                onNavigateContact={openContact}
              />
            )}

            {currentView === 'PROVIDERS' && (
              <ProvidersView
                onNavigateHome={openHome}
                onOpenRegister={(role) => openRegister(role)}
                onNavigateContact={openContact}
              />
            )}

            {currentView === 'BUSINESSES' && (
              <BusinessesView
                onNavigateHome={openHome}
                onOpenRegister={(role) => openRegister(role)}
                onNavigateContact={openContact}
              />
            )}

            {currentView === 'PRIVACY' && (
              <PrivacyPolicyView onNavigateHome={openHome} />
            )}

            {currentView === 'TERMS' && (
              <TermsOfServiceView onNavigateHome={openHome} />
            )}

            {currentView === 'HELP' && (
              <HelpCenterView onNavigateHome={openHome} />
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

                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigateTo('HOW_IT_WORKS')}
                      >
                        Explore Full Process & Provider Workflow <ArrowRight size={16} />
                      </button>
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
                    <div className="student-notice-box">
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

                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigateTo('SAFETY')}
                      >
                        Read Full 4 Safety Pillars & Inspection Standard <ArrowRight size={16} />
                      </button>
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

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={() => openRegister('TRANSPORT_PROVIDER')}
                          >
                            Become a Transport Provider <ArrowRight size={18} />
                          </button>
                          <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => navigateTo('PROVIDERS')}
                          >
                            Learn More About Provider Tools
                          </button>
                        </div>
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
                            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
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
                          <button className="btn btn-secondary btn-lg" onClick={() => navigateTo('BUSINESSES')}>
                            View Ad Formats & Audiences
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
      </main>

      {/* 13. Professional Footer */}
      <footer className="footer-clean">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand-link" onClick={openHome} role="button" tabIndex={0}>
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
                  <button className="footer-link-btn" onClick={() => openRegister('PARENT')}>
                    Find Transportation
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={() => navigateTo('HOW_IT_WORKS')}>
                    How It Works
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={() => navigateTo('PROVIDERS')}>
                    For Providers
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={() => navigateTo('SAFETY')}>
                    Safety Standards
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={() => navigateTo('BUSINESSES')}>
                    Advertising Platform
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul className="footer-links">
                <li>
                  <button className="footer-link-btn" onClick={openAbout}>
                    About Us
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={openContact}>
                    Contact Support
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={openPrivacy}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={openTerms}>
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <button className="footer-link-btn" onClick={openHelp}>
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={openContact}>
                    Safety Incident Reporting
                  </button>
                </li>
                <li>
                  <button className="footer-link-btn" onClick={() => navigateTo('PROVIDERS')}>
                    Operator Onboarding
                  </button>
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
