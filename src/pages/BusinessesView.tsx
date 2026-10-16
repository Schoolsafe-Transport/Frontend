import { FC } from 'react';
import {
  Building2,
  Wrench,
  Car,
  Fuel,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Users,
  Target,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface BusinessesViewProps {
  onNavigateHome: () => void;
  onOpenRegister: (role: UserRole) => void;
  onNavigateContact: () => void;
}

export const BusinessesView: FC<BusinessesViewProps> = ({
  onNavigateHome,
  onOpenRegister,
  onNavigateContact,
}) => {
  return (
    <div className="businesses-page">
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '1rem',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
              }}
            >
              <Sparkles size={14} /> Targeted Local Advertising
            </div>
            <h1 style={{ fontSize: '2.75rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              Connect Directly With School Communities & Transport Fleets
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Place your products and services in front of verified parents and commercial transportation operators
              who make daily purchasing decisions for their families and vehicles.
            </p>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-navy btn-lg"
                onClick={() => onOpenRegister('BUSINESS')}
              >
                Advertise With SchoolSafe <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={onNavigateContact}
              >
                Contact Partnerships Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences Grid */}
      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              HIGH-INTENT DEMOGRAPHICS
            </span>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2.25rem', marginTop: '0.5rem' }}>
              Two Captive, High-Value Audiences
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Engage both daily commuting families and commercial fleet operators on a trusted, safety-focused platform.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '2.5rem' }}>
            {/* Audience 1: Transport Providers */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Car size={26} />
              </div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                Transport Operators & Fleet Owners
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Reach licensed commercial drivers who constantly require vehicle maintenance, automotive supplies, and commercial services.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="category-tag">
                  <Wrench size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Tire & Brake Centers
                </span>
                <span className="category-tag">
                  <Fuel size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Fuel & Lubricants
                </span>
                <span className="category-tag">
                  <Building2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Vehicle Dealerships
                </span>
                <span className="category-tag">
                  <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Commercial Insurance
                </span>
              </div>
            </div>

            {/* Audience 2: Parents & School Families */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Users size={26} />
              </div>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                School Families & Parents
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Engage working parents checking the app multiple times a day to track their children’s morning and afternoon trips.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="category-tag">School Uniforms & Shoes</span>
                <span className="category-tag">Stationery & Bookstores</span>
                <span className="category-tag">Pediatric Clinics & Dental</span>
                <span className="category-tag">After-School Tutoring & Sports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advertising Benefits */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WHY ADVERTISE ON SCHOOLSAFE</span>
            <h2>Premium Visibility in a Trusted Environment</h2>
            <p>We ensure advertising is ethical, family-appropriate, and relevant to our users.</p>
          </div>

          <div className="grid-3">
            <div className="card-feature">
              <div className="card-icon-box">
                <Target size={24} />
              </div>
              <h3>Route-Level Relevance</h3>
              <p>Promote your local auto repair or store directly to families and drivers travelling along specific school corridors.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box success">
                <BarChart3 size={24} />
              </div>
              <h3>Transparent Analytics</h3>
              <p>Track ad impressions, click-through rates, and customer inquiries directly in your business dashboard.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box">
                <TrendingUp size={24} />
              </div>
              <h3>High Repeat Engagement</h3>
              <p>Parents and operators open SchoolSafe twice every school day, delivering high-frequency brand exposure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Banner */}
      <section className="section">
        <div className="container">
          <div
            className="banner-card"
            style={{
              backgroundColor: 'white',
              border: '2px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
              padding: '3rem',
            }}
          >
            <div>
              <span className="section-tag" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                PARTNER WITH US
              </span>
              <h2 style={{ color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Ready to Grow Your Business With SchoolSafe?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '1rem', maxWidth: '600px' }}>
                Create your verified business account today or connect with our advertising team to discuss custom campaigns.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-navy btn-lg" onClick={() => onOpenRegister('BUSINESS')}>
                Register as Business <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onNavigateContact}>
                Contact Advertising Desk
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
