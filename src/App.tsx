import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { checkServerHealth } from './services/api';
import { ServerHealthResponse } from './types';
import { LoginView } from './pages/LoginView';
import { RegisterView } from './pages/RegisterView';
import { ForgotPasswordView } from './pages/ForgotPasswordView';
import { DashboardView } from './pages/DashboardView';

interface RoleCard {
  title: string;
  role: string;
  icon: string;
  description: string;
}

const ROLES: RoleCard[] = [
  {
    title: 'Parent / Guardian',
    role: 'PARENT',
    icon: '👨‍👩‍👧',
    description: 'Search verified providers, request seats, negotiate monthly pricing, track child trip journey.',
  },
  {
    title: 'Student',
    role: 'STUDENT',
    icon: '🎒',
    description: 'Safe boarding/drop-off verification, designated school transportation recipient.',
  },
  {
    title: 'School Administration',
    role: 'SCHOOL_ADMIN',
    icon: '🏫',
    description: 'Manage branches, monitor active morning & afternoon trips, approve providers and routes.',
  },
  {
    title: 'Transport Provider',
    role: 'TRANSPORT_PROVIDER',
    icon: '🚐',
    description: 'Register vehicles, assign drivers, define service areas, manage bookings, review earnings.',
  },
  {
    title: 'Vehicle Driver',
    role: 'DRIVER',
    icon: '🪪',
    description: 'Mobile daily trip view, share live GPS tracking, record boarding & drop-off, log incidents.',
  },
  {
    title: 'Business & Advertiser',
    role: 'BUSINESS',
    icon: '📢',
    description: 'Targeted advertising marketplace for auto repair, tire shops, dealerships, and insurance.',
  },
  {
    title: 'Platform Administrator',
    role: 'ADMIN',
    icon: '🛡️',
    description: 'Document verification, user oversight, safety incident management, revenue and ad approvals.',
  },
  {
    title: 'Super Administrator',
    role: 'SUPER_ADMIN',
    icon: '⚡',
    description: 'Root access to platform configuration, role elevation, security policies, and audit oversight.',
  },
];

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LANDING');
  const [health, setHealth] = useState<ServerHealthResponse | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkServerHealth();
        setHealth(data);
        setServerOnline(true);
      } catch (_err) {
        setServerOnline(false);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="brand" onClick={() => setCurrentView('LANDING')}>
          <div className="brand-icon">SS</div>
          <span className="brand-title">SchoolSafe</span>
        </div>

        <div className="nav-actions">
          {healthLoading ? (
            <span className="status-pill" style={{ color: '#94a3b8', borderColor: 'rgba(148,163,184,0.3)' }}>
              Checking Server...
            </span>
          ) : serverOnline ? (
            <div className="status-pill">
              <span className="status-dot"></span>
              API Online ({health?.service})
            </div>
          ) : (
            <span className="status-pill" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
              Server Offline
            </span>
          )}

          {!user && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className={`btn ${currentView === 'LOGIN' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentView('LOGIN')}
              >
                Sign In
              </button>
              <button
                className={`btn ${currentView === 'REGISTER' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('REGISTER')}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main View Area */}
      <main className="container">
        {user ? (
          <DashboardView />
        ) : (
          <>
            {currentView === 'LOGIN' && (
              <div className="auth-wrapper">
                <LoginView
                  onSwitchToRegister={() => setCurrentView('REGISTER')}
                  onSwitchToForgotPassword={() => setCurrentView('FORGOT_PASSWORD')}
                  onSuccess={() => setCurrentView('LANDING')}
                />
              </div>
            )}

            {currentView === 'REGISTER' && (
              <div className="auth-wrapper">
                <RegisterView
                  onSwitchToLogin={() => setCurrentView('LOGIN')}
                  onSuccess={() => setCurrentView('LANDING')}
                />
              </div>
            )}

            {currentView === 'FORGOT_PASSWORD' && (
              <div className="auth-wrapper">
                <ForgotPasswordView onSwitchToLogin={() => setCurrentView('LOGIN')} />
              </div>
            )}

            {currentView === 'LANDING' && (
              <>
                {/* Hero Section */}
                <section className="hero">
                  <div className="badge-tag">Smart School Transit & Safety Ecosystem</div>
                  <h1>Verifiable School Transportation & Child Safety Platform</h1>
                  <p>
                    Connecting parents, schools, and verified transport providers in one secure,
                    transparent, and real-time transit system with role-based access control.
                  </p>
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => setCurrentView('REGISTER')}>
                      Get Started Now
                    </button>
                    <button className="btn btn-secondary" onClick={() => setCurrentView('LOGIN')}>
                      Sign In to Console
                    </button>
                  </div>
                </section>

                {/* Foundation & API Banner */}
                <section className="foundation-banner">
                  <div className="banner-content">
                    <h3>🔐 Production Authentication System Active</h3>
                    <p>
                      JWT tokens, refresh token rotation, password hashing (bcrypt), and Role-Based Access
                      Control (RBAC) are active and running on the backend API.
                    </p>
                  </div>
                  <div>
                    <span className="endpoint-tag">POST /api/auth/login</span>
                    <span className="endpoint-tag" style={{ marginLeft: '0.5rem' }}>
                      POST /api/auth/register
                    </span>
                  </div>
                </section>

                {/* 8 Roles Section */}
                <section>
                  <h2 className="section-title">Supported Platform Roles</h2>
                  <p className="section-desc">
                    Select a role to create an account and access tailored platform workflows.
                  </p>

                  <div className="grid">
                    {ROLES.map((role) => (
                      <div key={role.role} className="card">
                        <div className="card-header">
                          <div className="card-icon">{role.icon}</div>
                          <div>
                            <h3 className="card-title">{role.title}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                              {role.role}
                            </span>
                          </div>
                        </div>
                        <p className="card-body">{role.description}</p>
                        <button
                          className="btn btn-secondary"
                          style={{ width: '100%', fontSize: '0.8rem' }}
                          onClick={() => setCurrentView('REGISTER')}
                        >
                          Join as {role.title}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer>
        <p>SchoolSafe Platform • Smart School Transportation, Safety & Advertising Platform</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
