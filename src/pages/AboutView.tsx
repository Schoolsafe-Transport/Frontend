import { FC } from 'react';
import {
  Shield,
  ShieldCheck,
  MapPin,
  Users,
  Bus,
  Building2,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface AboutViewProps {
  onNavigateHome: () => void;
  onOpenRegister: (role: UserRole) => void;
}

export const AboutView: FC<AboutViewProps> = ({ onNavigateHome, onOpenRegister }) => {
  return (
    <div className="about-page-wrapper">
      {/* Hero Header */}
      <section className="about-hero-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div
              className="section-tag"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
            >
              <Sparkles size={14} /> Our Mission & Community
            </div>
            <h1 style={{ fontSize: '2.75rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              Building the Future of Safe School Transportation
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              SchoolSafe was founded with a singular purpose: to give every parent peace of mind by
              ensuring every child’s school journey is safe, verified, and transparent.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Story Banner with Photo */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-media">
              <img
                src="/actors/schoolB.jpg"
                alt="Children boarding safe school bus"
                className="about-story-img"
              />
              <div className="about-story-badge">
                <ShieldCheck size={24} style={{ color: 'var(--color-success)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>100% Vetted Operators</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Verified backgrounds & vehicles</div>
                </div>
              </div>
            </div>

            <div className="about-story-content">
              <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                WHY SCHOOLSAFE EXISTS
              </span>
              <h2 style={{ color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '1.25rem', fontSize: '2rem' }}>
                Every Morning Should Begin With Absolute Peace of Mind
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
                For millions of working parents, arranging daily school transportation is stressful. Fragmented
                van services, lack of route transparency, and unverified drivers leave families constantly worried
                until their children return home.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                SchoolSafe brings digital accountability, live tracking telemetry, and strict safety credentialing
                together into one easy-to-use platform. We empower local transport providers with professional fleet tools
                while ensuring parents stay connected to every step of the journey.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Commercial vehicle inspections</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Real-time GPS route tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Boarding & drop-off check-ins</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Direct emergency communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">OUR CORE PRINCIPLES</span>
            <h2>What Drives SchoolSafe Forward</h2>
            <p>Our safety framework is built on four fundamental pillars that guide every decision we make.</p>
          </div>

          <div className="grid-4">
            <div className="card-feature">
              <div className="card-icon-box success">
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Child Safety First</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Every feature, from background check requirements to check-in alerts, is built to protect children.
              </p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box">
                <MapPin size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Radical Transparency</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Parents deserve to know where the vehicle is, who is behind the wheel, and the exact ETA at school.
              </p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <Award size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Provider Empowerment</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                We equip honest, hardworking drivers and fleet operators with modern tools to grow trusted businesses.
              </p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box navy">
                <HeartHandshake size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Community Trust</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Uniting schools, parents, drivers, and local sponsors in an ecosystem built on accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Canonical Actors Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">OUR ECOSYSTEM</span>
            <h2>Designed for the 5 Key Stakeholders</h2>
            <p>SchoolSafe harmonizes every participant in the school transit journey through dedicated experiences.</p>
          </div>

          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card-feature" style={{ borderTop: '4px solid #2563EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <Users size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Parent / Guardian</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Searches for verified routes, books monthly transportation seats, tracks live journeys, and manages emergency pickup contacts.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenRegister('PARENT')}>
                Join as Parent
              </button>
            </div>

            <div className="card-feature" style={{ borderTop: '4px solid #16A34A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                  <Award size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Student</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                The safe transit recipient. Students are safely linked to their parent account with digital boarding passes and confirmed seat assignments.
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>* Managed via Parent Dashboard</span>
            </div>

            <div className="card-feature" style={{ borderTop: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706' }}>
                  <Bus size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Transport Provider / Driver</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Registers vehicles, plans daily school routes, manages available seats, checks in student passengers, and receives recurring payments.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenRegister('TRANSPORT_PROVIDER')}>
                Join as Provider
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="card-feature" style={{ borderTop: '4px solid #8B5CF6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                  <Building2 size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Business / Advertiser</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Connects automotive repair, tire supply, insurance, and family maintenance services to verified fleets and parents.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenRegister('BUSINESS')}>
                Advertise With Us
              </button>
            </div>

            <div className="card-feature" style={{ borderTop: '4px solid #173B6C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#E2E8F0', color: '#173B6C' }}>
                  <Shield size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>System Administrator</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Reviews driver background filings, certifies mechanical roadworthiness, monitors live incident alerts, and guarantees compliance.
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>* Provisioned internally</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Verification Standards Banner */}
      <section className="section section-alt">
        <div className="container">
          <div className="banner-card" style={{ backgroundColor: '#173B6C', color: '#FFFFFF', border: 'none' }}>
            <div style={{ maxWidth: '750px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#93C5FD',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                RIGOROUS VERIFICATION
              </span>
              <h2 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '2rem' }}>
                Our 3-Tier Safety Verification Standard
              </h2>
              <p style={{ color: '#E2E8F0', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Before any transport provider or vehicle can accept a single student booking, they must pass our
                rigorous 3-tier inspection protocol:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>Driver Identity & Criminal Background Clearance</strong>
                    <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                      Certified government driver license review, clean driving history verification, and comprehensive background investigation.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>Mechanical Roadworthiness & Safety Equipment</strong>
                    <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                      Brake, tire, emergency exit, and seatbelt roadworthiness documentation confirmed by certified transport inspection bureaus.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>Commercial Passenger Insurance Coverage</strong>
                    <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                      Active commercial transit insurance policy guaranteeing passenger protection throughout morning and afternoon runs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Ready to Experience Safer School Transportation?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            Join thousands of parents and verified transport providers who make school transit reliable every day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onOpenRegister('PARENT')}>
              Find Transportation <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onNavigateHome}>
              Return to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
