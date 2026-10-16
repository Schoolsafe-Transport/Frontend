import { useState, FC, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

interface ContactViewProps {
  onNavigateHome: () => void;
}

export const ContactView: FC<ContactViewProps> = ({ onNavigateHome }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Parent Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="section-tag" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          GET IN TOUCH
        </span>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Contact the SchoolSafe Team
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
          Have a question about provider verification, route availability, or student safety? We're here to help.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '3rem' }}>
        {/* Contact Information & Channels */}
        <div>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '1.25rem', fontSize: '1.35rem' }}>
            Direct Support Channels
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Our dedicated dispatch and support desks operate continuously during active morning and afternoon school runs.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text-main)' }}>Phone & Emergency Dispatch</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>+251 11 662 4890 • Toll-Free Safety Hotline</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text-main)' }}>Support & Verification Email</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>support@schoolsafe.org • verifications@schoolsafe.org</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text-main)' }}>Headquarters & Verification Center</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>Bole Sub-City, Next to British Academy, Addis Ababa</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#E2E8F0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text-main)' }}>Operating Hours</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>Monday – Friday: 06:00 AM – 07:00 PM (Active Transit Hours)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{ padding: '2rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Message Dispatched!</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Thank you, <strong>{name}</strong>. A SchoolSafe support coordinator will respond to <strong>{email}</strong> within 2 business hours.
              </p>
              <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Send Us a Message</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Fill out the form below and our team will get back to you promptly.
              </p>

              <div className="form-group">
                <label htmlFor="contact-name">Your Full Name</label>
                <input
                  id="contact-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Rahel Bekele"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  className="form-input"
                  type="email"
                  placeholder="e.g. rahel@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-category">Inquiry Topic</label>
                <select
                  id="contact-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Parent Support">Parent / Child Transit Support</option>
                  <option value="Provider Partnership">Transport Provider / Driver Onboarding</option>
                  <option value="School Partnership">School Administration & Coordination</option>
                  <option value="Business Advertising">Advertising & Sponsorship Inquiry</option>
                  <option value="Safety Incident">Safety Verification & Incident Follow-Up</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message Details</label>
                <textarea
                  id="contact-message"
                  className="form-input"
                  rows={4}
                  placeholder="Tell us how we can assist you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                Send Inquiry <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button className="btn btn-ghost" onClick={onNavigateHome}>
          ← Return to Home Page
        </button>
      </div>
    </div>
  );
};
