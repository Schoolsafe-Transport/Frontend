import { FC } from 'react';
import {
  Bus,
  ShieldCheck,
  MapPin,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CreditCard,
  Smartphone,
  Phone,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface ProvidersViewProps {
  onNavigateHome: () => void;
  onOpenRegister: (role: UserRole) => void;
  onNavigateContact: () => void;
}

export const ProvidersView: FC<ProvidersViewProps> = ({
  onNavigateHome,
  onOpenRegister,
  onNavigateContact,
}) => {
  return (
    <div className="providers-page">
      {/* Hero Header */}
      <section className="about-hero-section">
        <div className="container">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onNavigateHome}
            style={{ marginBottom: '1.5rem', display: 'inline-flex', gap: '0.4rem', color: 'var(--color-primary)' }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div
              className="section-tag"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
            >
              <Sparkles size={14} /> For Independent Operators & Fleet Owners
            </div>
            <h1 style={{ fontSize: '2.75rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              Run and Scale Your School Transportation Service
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              SchoolSafe gives you the digital tools to fill every available seat, manage passenger manifests,
              communicate directly with parents, and get paid reliably on time.
            </p>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onOpenRegister('TRANSPORT_PROVIDER')}
              >
                Become a Transport Provider <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={onNavigateContact}
              >
                Speak With Operator Relations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Spotlight & Value Props */}
      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-media">
              <img
                src="/actors/DriverB.jpg"
                alt="Professional SchoolSafe transport operator"
                className="about-story-img"
              />
              <div className="about-story-badge">
                <ShieldCheck size={28} style={{ color: 'var(--color-success)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    Verified Operator Badge
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Build instant trust with local families
                  </div>
                </div>
              </div>
            </div>

            <div className="about-story-content">
              <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                WHY PARTNER WITH US
              </span>
              <h2 style={{ color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '1.25rem', fontSize: '2.2rem' }}>
                Transform Disorganized Routes Into a Thriving Business
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Traditional school transport often suffers from empty seats, late-paying clients, and disorganized phone calls every morning.
                SchoolSafe replaces paper rosters and chaotic WhatsApp chats with a professional operations dashboard.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                You maintain complete control over your schedules, routes, stops, and pricing. We bring you verified parent requests,
                handle seat bookings, and provide real-time trip execution tools.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Maximize Vehicle Capacity</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <CreditCard size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Guaranteed Payments</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Smartphone size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Driver Mobile Workflow</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Users size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Direct Parent Coordination</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Checklist Grid */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">POWERFUL FEATURES</span>
            <h2>Everything You Need to Run Your Service</h2>
            <p>From single vans to multi-bus fleets, SchoolSafe is tailored to your day-to-day operations.</p>
          </div>

          <div className="grid-4">
            <div className="card-feature">
              <div className="card-icon-box">
                <Bus size={24} />
              </div>
              <h3>Vehicle Management</h3>
              <p>Register multiple vehicles, assign drivers, set seating capacity, and upload inspection reports.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box success">
                <MapPin size={24} />
              </div>
              <h3>Route Builder</h3>
              <p>Define pickup stops, destination schools, and morning/afternoon schedules with full flexibility.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box">
                <Users size={24} />
              </div>
              <h3>Roster & Bookings</h3>
              <p>Receive seat requests from parents, review student details, and approve riders with a single tap.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box success">
                <CreditCard size={24} />
              </div>
              <h3>Automated Billing</h3>
              <p>Eliminate chasing parents for fees. Set monthly or term fares with transparent payout tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              FAST ONBOARDING
            </span>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2.25rem', marginTop: '0.5rem' }}>
              How to Get Started in 3 Easy Steps
            </h2>
          </div>

          <div className="grid-3">
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 auto 1.25rem',
                }}
              >
                1
              </div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                Register Your Account
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Create your provider account in 2 minutes. Enter your business name, contact information, and operating cities.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 auto 1.25rem',
                }}
              >
                2
              </div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                Upload Verification Documents
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Submit driver license, vehicle registration, and mechanical inspection documents for fast compliance review.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 auto 1.25rem',
                }}
              >
                3
              </div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                Publish Routes & Accept Riders
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Once verified, list your active school routes. Parents in your zone can immediately find you and reserve seats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Support Help Callout */}
      <section className="section section-alt">
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.5rem',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                Need Help Setting Up Your Fleet?
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                Our operator onboarding team will help you configure your routes, verify documentation, and onboard your drivers.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={onNavigateContact}>
                <Phone size={16} style={{ marginRight: '6px' }} /> Contact Operator Desk
              </button>
              <button className="btn btn-primary" onClick={() => onOpenRegister('TRANSPORT_PROVIDER')}>
                Register Now <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
