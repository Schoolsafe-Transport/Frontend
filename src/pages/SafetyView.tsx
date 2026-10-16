import { FC } from 'react';
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  PhoneCall,
  FileCheck,
  Car,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface SafetyViewProps {
  onNavigateHome: () => void;
  onOpenRegister: (role: UserRole) => void;
  onNavigatePrivacy: () => void;
  onNavigateContact: () => void;
}

export const SafetyView: FC<SafetyViewProps> = ({
  onNavigateHome,
  onOpenRegister,
  onNavigatePrivacy,
  onNavigateContact,
}) => {
  return (
    <div className="safety-page">
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
            >
              <Sparkles size={14} /> Uncompromised Protection
            </div>
            <h1 style={{ fontSize: '2.75rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              Built Around Your Child’s Safety
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              At SchoolSafe, safety is not an afterthought or an add-on feature. Every protocol,
              verification step, and tracking update was designed from the ground up to protect students.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Safety Visual & Mission */}
      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-media">
              <img
                src="/actors/schoolB.jpg"
                alt="Safe school bus transit"
                className="about-story-img"
              />
              <div className="about-story-badge">
                <ShieldCheck size={28} style={{ color: 'var(--color-success)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    Triple-Layer Verification
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Driver, Vehicle & Route Audited
                  </div>
                </div>
              </div>
            </div>

            <div className="about-story-content">
              <span className="section-tag" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                OUR COMMITMENT
              </span>
              <h2 style={{ color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '1.25rem', fontSize: '2.2rem' }}>
                Zero Compromise When It Comes to Children’s Commutes
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Every school morning represents thousands of handovers between families, drivers, and schools.
                Our mission is to ensure that every single handover is recorded, accountable, and transparent.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                We combine rigorous offline compliance reviews (mechanical inspections, government licensing, identity checks)
                with modern digital safeguards (live GPS telemetry, encrypted communications, and automated check-ins).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <FileCheck size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Verified Driver Licensing</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Car size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Vehicle Roadworthiness Check</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <MapPin size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Real-Time Route Telemetry</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Lock size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Protected Student Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Safety Pillars */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">CORE PILLARS</span>
            <h2>How We Keep Every Journey Secure</h2>
            <p>Our four pillars of safety create a reliable safety net from the moment your child steps out your front door.</p>
          </div>

          <div className="grid-2" style={{ gap: '2rem' }}>
            {/* Pillar 1 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem' }}>
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
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                  1. Operator & Driver Vetting
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}>
                  No operator can list a route without passing our manual compliance verification. We inspect government-issued commercial driver licenses, background clearances, and driving record histories.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Valid Commercial Driver's License (CDL)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Criminal and background clearance checks
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Mandatory annual safety re-certification
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem' }}>
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
                  flexShrink: 0,
                }}
              >
                <Car size={28} />
              </div>
              <div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                  2. Vehicle Safety Standards
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Every vehicle registered on SchoolSafe must comply with strict school transit standards, including working seatbelts, functional emergency exits, and valid commercial roadworthiness certificates.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-accent)' }} /> Certified mechanical roadworthiness inspection
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-accent)' }} /> Working seatbelts for all designated passenger seats
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-accent)' }} /> Onboard first aid kit and functional fire extinguisher
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={28} />
              </div>
              <div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                  3. Live Route Monitoring & Telemetry
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Parents have live visibility into vehicle location throughout the trip. Automated notifications trigger when the bus is approaching your pickup stop, minimizing outdoor waiting time.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: '#B45309' }} /> Live GPS tracking during morning & afternoon transit
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#B45309' }}>
                    <CheckCircle2 size={16} style={{ color: '#B45309' }} /> Departure & approach geofence alerts
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#B45309' }}>
                    <CheckCircle2 size={16} style={{ color: '#B45309' }} /> Transparent route adherence monitoring
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                  4. Instant Emergency Escalation & Hotline
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}>
                  In the rare event of traffic delays, mechanical issues, or unexpected route diversions, our rapid incident escalation system immediately alerts parents and administrators.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-danger)' }} /> One-tap emergency broadcast for drivers
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-danger)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-danger)' }} /> 24/7 dedicated SchoolSafe safety dispatch line
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-danger)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-danger)' }} /> Complete auditable event logs for schools & families
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Banner */}
      <section className="section">
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.5rem',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PhoneCall size={26} />
              </div>
              <div>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>
                  24/7 Dedicated Transit Support & Hotline
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                  Direct line: <strong>+251 11 662 4890</strong> • Monitored actively during all operating school transit windows.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={onNavigateContact}>
                Contact Safety Desk
              </button>
              <button className="btn btn-ghost" onClick={onNavigatePrivacy}>
                Privacy & Data Safeguards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.25rem', marginBottom: '1rem' }}>
            Give Your Family the Safety It Deserves
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Find trusted, verified school transportation providers servicing your neighborhood today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onOpenRegister('PARENT')}>
              Find Transportation Now <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onOpenRegister('TRANSPORT_PROVIDER')}>
              Apply as Verified Driver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
