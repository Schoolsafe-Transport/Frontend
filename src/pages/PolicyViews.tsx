import { useState, FC } from 'react';
import { Lock, FileText, HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface PolicyViewProps {
  onNavigateHome: () => void;
}

export const PrivacyPolicyView: FC<PolicyViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '850px' }}>
      <button className="btn btn-ghost btn-sm" onClick={onNavigateHome} style={{ marginBottom: '1.5rem', display: 'inline-flex', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          <Lock size={24} />
        </div>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.25rem' }}>SchoolSafe Privacy Policy</h1>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Last Revised: October 2026 • Effective for all SchoolSafe parents, students, and providers
      </p>

      <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.7 }}>
        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>1. Student Data Protection & Minimal Data Collection</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            At SchoolSafe, the privacy and security of children are our highest priority. Student accounts are never created independently; they are exclusively linked to and managed by verified Parents or Legal Guardians. We only collect the minimal personal data necessary to facilitate safe transportation: student name, grade, designated school, and verified pickup/drop-off stops.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>2. Live Transit Telemetry & GPS Tracking</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Real-time GPS vehicle location data is collected exclusively during active morning and afternoon school runs. Location telemetry is strictly restricted to authorized parents whose children are onboard the active vehicle, the designated driver, and authorized system administrators. Location tracking is immediately disabled once the trip is completed.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>3. Zero Third-Party Data Selling</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            We strictly enforce a zero-sale policy: SchoolSafe will never sell, lease, or monetize student or parent personal information to data brokers, third-party advertisers, or marketing firms. Any advertising displayed on the platform is delivered on anonymized, high-level route categories without tracking individual children.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>4. Data Encryption & Security Safeguards</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            All network communication is encrypted using TLS 1.3 in transit. Passwords are cryptographically hashed using bcrypt with salt rounds (cost 12), and authentication uses short-lived JSON Web Tokens (JWT) paired with rotating refresh tokens to prevent unauthorized session interception.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsOfServiceView: FC<PolicyViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '850px' }}>
      <button className="btn btn-ghost btn-sm" onClick={onNavigateHome} style={{ marginBottom: '1.5rem', display: 'inline-flex', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          <FileText size={24} />
        </div>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.25rem' }}>Terms of Service</h1>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Last Revised: October 2026 • Platform Terms & Conditions
      </p>

      <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.7 }}>
        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>1. Platform Agreement</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            By registering an account with SchoolSafe as a Parent, Transport Provider / Driver, or Business Advertiser, you agree to comply with all safety regulations, code of conduct requirements, and verification mandates established by the platform.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>2. Transport Provider Obligations</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            All Transport Providers and Drivers warrant that they hold valid commercial driver licensing, maintain current vehicle roadworthiness inspection certificates, maintain active passenger transit insurance, and adhere to national road safety laws at all times while transporting students.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>3. Parent & Guardian Responsibilities</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Parents agree to ensure their child is present at designated pickup points on schedule, promptly report any absences through the parent portal, and maintain current authorized pickup contact information for drop-off verifications.
          </p>
        </section>

        <section>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>4. Safety Compliance & Termination</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            SchoolSafe reserves the right to immediately suspend or permanently terminate any provider or user account that fails background checks, violates transit safety policies, or jeopardizes child welfare.
          </p>
        </section>
      </div>
    </div>
  );
};

export const HelpCenterView: FC<PolicyViewProps> = ({ onNavigateHome }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does SchoolSafe verify drivers and transport providers?',
      a: 'Every provider submits their government commercial driving license, vehicle mechanical inspection certification from an authorized bureau, and clean criminal background clearance before their account is approved by System Administrators.',
    },
    {
      q: 'How do parents track their child during morning and afternoon trips?',
      a: 'Parents log in to the SchoolSafe Parent Dashboard or mobile app to view the live GPS position of the vehicle along the assigned school route, as well as exact boarding and drop-off timestamps.',
    },
    {
      q: 'Can another family member or relative pick up my child?',
      a: 'Yes. Parents can specify "Authorized Pickup Contacts" in their Parent Dashboard under the Safety tab. Drivers are instructed to only release students to pre-registered individuals.',
    },
    {
      q: 'How do transport providers manage seat bookings and payments?',
      a: 'Providers register their vehicles with maximum seating capacity, define morning and afternoon routes, and set monthly pricing. Parents submit seat requests which the provider can accept or decline directly in their console.',
    },
    {
      q: 'What should I do if a vehicle is delayed or an emergency occurs?',
      a: 'If a route encounters traffic or unexpected delays, drivers log a status update that notifies all parents on that route instantly. Parents also have a one-click direct phone link to their assigned driver.',
    },
  ];

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '850px' }}>
      <button className="btn btn-ghost btn-sm" onClick={onNavigateHome} style={{ marginBottom: '1.5rem', display: 'inline-flex', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
          <HelpCircle size={28} />
        </div>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Help Center & FAQs
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Find answers to common questions about SchoolSafe accounts, tracking, and safety standards.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="card"
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {faq.q}
                </h3>
                {isOpen ? <ChevronUp size={20} color="var(--color-accent)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
              </div>
              {isOpen && (
                <p style={{ marginTop: '0.85rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button className="btn btn-ghost" onClick={onNavigateHome}>
          ← Return to Home Page
        </button>
      </div>
    </div>
  );
};
