import { useState, FC } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Bell,
  Smartphone,
  Bus,
  Users,
  CalendarCheck,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface HowItWorksViewProps {
  onNavigateHome: () => void;
  onOpenRegister: (role: UserRole) => void;
  onNavigateContact: () => void;
}

export const HowItWorksView: FC<HowItWorksViewProps> = ({
  onNavigateHome,
  onOpenRegister,
  onNavigateContact,
}) => {
  const [activeTab, setActiveTab] = useState<'parents' | 'providers'>('parents');

  return (
    <div className="how-it-works-page">
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
              <Sparkles size={14} /> Clear & Connected Student Transit
            </div>
            <h1 style={{ fontSize: '2.75rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              How SchoolSafe Works
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Whether you are a parent looking for safe daily rides for your child or a driver
              organizing your school transit service, SchoolSafe makes the entire journey transparent and reliable.
            </p>

            {/* Audience Switcher Tabs */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'white',
                padding: '6px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                marginTop: '2rem',
                gap: '8px',
              }}
            >
              <button
                className={`btn ${activeTab === 'parents' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.65rem 1.75rem', borderRadius: '8px' }}
                onClick={() => setActiveTab('parents')}
              >
                <Users size={18} style={{ marginRight: '6px' }} /> For Parents & Students
              </button>
              <button
                className={`btn ${activeTab === 'providers' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.65rem 1.75rem', borderRadius: '8px' }}
                onClick={() => setActiveTab('providers')}
              >
                <Bus size={18} style={{ marginRight: '6px' }} /> For Transport Providers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PARENTS WORKFLOW */}
      {activeTab === 'parents' && (
        <section className="section" style={{ paddingTop: '2.5rem' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                PARENT EXPERIENCE
              </span>
              <h2 style={{ color: 'var(--color-primary)', fontSize: '2.25rem', marginTop: '0.5rem' }}>
                4 Simple Steps to Stress-Free School Mornings
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '650px', margin: '0.5rem auto 0' }}>
                From matching with a verified driver to real-time arrival notifications, we keep you informed every minute.
              </p>
            </div>

            <div className="grid-2" style={{ gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-accent)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-accent-light)',
                          color: 'var(--color-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        1
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                          Search by School & Neighborhood
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          Enter your child's school and home neighborhood. Instantly view active routes, vehicle types, verified operator credentials, and transparent per-term or monthly pricing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-success)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-success-light)',
                          color: 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        2
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                          Book Seat & Connect With Operator
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          Reserve an available seat for your student. Specify pickup points and emergency instructions. Direct messaging lets you communicate with the driver anytime.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        3
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                          Real-Time Live Trip Tracking
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          Open your dashboard on any device to see the bus on its route in real time. Know precisely when the vehicle approaches your stop so your child never waits outside in bad weather.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        4
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                          Instant Boarding & School Drop-Off Alerts
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          Get an immediate check-in notification when your child steps onto the vehicle, and an instant confirmation when safely dropped off at the school entrance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Showcase */}
              <div>
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    position: 'relative',
                  }}
                >
                  <img
                    src="/actors/STDB.jpg"
                    alt="Students safely boarding transportation"
                    style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      right: '20px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(8px)',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success-light)',
                        color: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                        Instant SMS & App Notifications
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        “Ethan was safely checked in at St. Mary’s School gate at 08:02 AM.”
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src="/actors/PRStu.jpg"
                    alt="Happy parent and child"
                    style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                      Loved by Over 500+ Local Families
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      99.4% on-time morning arrival rate across verified network routes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PROVIDERS WORKFLOW */}
      {activeTab === 'providers' && (
        <section className="section" style={{ paddingTop: '2.5rem' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                OPERATOR PLATFORM
              </span>
              <h2 style={{ color: 'var(--color-primary)', fontSize: '2.25rem', marginTop: '0.5rem' }}>
                How Transport Providers Run Their Business With SchoolSafe
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '650px', margin: '0.5rem auto 0' }}>
                We empower independent drivers and transport companies with the tools needed to fill seats, verify routes, and get paid predictably.
              </p>
            </div>

            <div className="grid-2" style={{ gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
              {/* Photo Showcase */}
              <div>
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    position: 'relative',
                  }}
                >
                  <img
                    src="/actors/DriverB.jpg"
                    alt="Professional transport driver with school van"
                    style={{ width: '100%', height: '440px', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      backgroundColor: 'white',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '30px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--color-success)',
                    }}
                  >
                    <CheckCircle2 size={18} /> Verified Fleet Partner
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-accent-light)',
                          color: 'var(--color-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                          1. Register Vehicle & Submit Credentials
                        </h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
                          Create your profile, enter vehicle plate and capacity, and upload driver license and mechanical inspection documentation for fast review.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-success-light)',
                          color: 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={22} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                          2. Set Up Your Routes & Pricing
                        </h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
                          Define which schools and residential zones you service, choose your pickup stops, set your seat capacity, and establish your monthly fare rates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CalendarCheck size={22} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                          3. Accept Rider Requests & Manage Manifests
                        </h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
                          Review incoming booking requests from parents in your area. Approve riders with one tap and let the system automatically manage your roster.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Smartphone size={22} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                          4. Execute Daily Trips With Confidence
                        </h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
                          Start and end trips directly from your operator dashboard. Live route telemetry keeps parents reassured while you stay focused on safe driving.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Highlights Grid */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WHY IT MATTERS</span>
            <h2>Built for Accountability & Peace of Mind</h2>
            <p>Every feature in the SchoolSafe workflow is designed to prevent stress and ensure student safety.</p>
          </div>

          <div className="grid-3">
            <div className="card-feature">
              <div className="card-icon-box success">
                <ShieldCheck size={24} />
              </div>
              <h3>No Unverified Drivers</h3>
              <p>Every operator undergoes document verification, background checks, and vehicle safety inspections before accepting riders.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box">
                <Clock size={24} />
              </div>
              <h3>Punctual Morning Schedules</h3>
              <p>Real-time vehicle tracking helps drivers optimize their route timing so students arrive comfortably before morning bell.</p>
            </div>

            <div className="card-feature">
              <div className="card-icon-box">
                <MessageSquare size={24} />
              </div>
              <h3>Direct Two-Way Communication</h3>
              <p>Parents and operators can easily coordinate pickup schedule changes or emergency updates without third-party delays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="section">
        <div className="container">
          <div
            className="banner-card"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              textAlign: 'center',
              padding: '3.5rem 2rem',
            }}
          >
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <h2 style={{ color: 'white', fontSize: '2.25rem', marginBottom: '1rem' }}>
                Ready to Experience Stress-Free School Transit?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Join hundreds of families and verified operators who make everyday school commutes safer.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => onOpenRegister('PARENT')}
                >
                  Register as Parent <ArrowRight size={18} />
                </button>
                <button
                  className="btn btn-ghost btn-lg"
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
                  onClick={() => onOpenRegister('TRANSPORT_PROVIDER')}
                >
                  Join as Transport Provider
                </button>
                <button
                  className="btn btn-ghost btn-lg"
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
                  onClick={onNavigateContact}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
