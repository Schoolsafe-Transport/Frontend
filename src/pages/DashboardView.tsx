import { useState, FC } from 'react';
import { useAuth } from '../context/AuthContext';
import { normalizeToMVPActor, getActorDisplayName, MVPActor } from '../types/auth';
import {
  Shield,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Bus,
  Car,
  CreditCard,
  Bell,
  Building2,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Plus,
  CheckCircle2,
  Phone,
  Eye,
  MousePointer,
  DollarSign,
  UserCheck,
  FileCheck,
  History,
} from 'lucide-react';

export const DashboardView: FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const actorType: MVPActor = normalizeToMVPActor(user.role);
  const actorDisplayName = getActorDisplayName(user.role);

  return (
    <div className="dashboard-layout">
      {/* Universal Top Header Strip */}
      <div className="dashboard-nav-strip">
        <div className="dashboard-nav-inner" style={{ height: '76px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/logo-shield.png"
              alt="SchoolSafe"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                marginRight: '0.25rem',
              }}
            />
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                  {actorType === 'PARENT' ? `Good morning, ${user.firstName}` : `Welcome back, ${user.firstName}`}
                </h3>
                <span className="role-pill">
                  {actorDisplayName}
                </span>
                {user.isVerified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-success)',
                      backgroundColor: 'var(--color-success-light)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {user.email} • ID: #{user.id.slice(0, 8)}
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Role-Specific Dashboard Renderer */}
      {actorType === 'PARENT' && <ParentDashboardView user={user} />}
      {actorType === 'TRANSPORT_PROVIDER_DRIVER' && <ProviderDashboardView user={user} />}
      {actorType === 'BUSINESS' && <BusinessDashboardView user={user} />}
      {actorType === 'ADMIN' && <AdminDashboardView user={user} />}
      {actorType === 'STUDENT' && <StudentDashboardView user={user} />}
    </div>
  );
};

/* =========================================================================
   1. PARENT DASHBOARD
   Navigation: Dashboard | My Children | Transportation | Trips | Notifications | Payments | Safety | Profile
   ========================================================================= */
const ParentDashboardView: FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'My Children' | 'Transportation' | 'Trips' | 'Notifications' | 'Payments' | 'Safety' | 'Profile'
  >('Dashboard');

  const tabs: Array<'Dashboard' | 'My Children' | 'Transportation' | 'Trips' | 'Notifications' | 'Payments' | 'Safety' | 'Profile'> = [
    'Dashboard',
    'My Children',
    'Transportation',
    'Trips',
    'Notifications',
    'Payments',
    'Safety',
    'Profile',
  ];

  return (
    <div>
      {/* 16. Parent Role-Based Navigation */}
      <div className="dashboard-nav-strip" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="dashboard-nav-inner">
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Dashboard' && <BarChart3 size={16} />}
                {tab === 'My Children' && <Users size={16} />}
                {tab === 'Transportation' && <Bus size={16} />}
                {tab === 'Trips' && <MapPin size={16} />}
                {tab === 'Notifications' && <Bell size={16} />}
                {tab === 'Payments' && <CreditCard size={16} />}
                {tab === 'Safety' && <Shield size={16} />}
                {tab === 'Profile' && <UserCheck size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {activeTab === 'Dashboard' && (
          <>
            {/* Quick Metrics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span>Registered Children</span>
                  <Users size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="stat-value">2</div>
                <div className="stat-subtext">Both safely assigned to morning routes</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Active Transit</span>
                  <Bus size={18} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="stat-value">In Transit</div>
                <div className="stat-subtext">Route #04 • Cambridge Academy</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Next Pickup / Drop</span>
                  <Clock size={18} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="stat-value">07:45 AM</div>
                <div className="stat-subtext">Estimated drop-off at school (On Time)</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Monthly Payment</span>
                  <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                  Paid
                </div>
                <div className="stat-subtext">Next billing cycle: Nov 1, 2026</div>
              </div>
            </div>

            {/* Active Transportation & Today's Journey */}
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Active Transportation • Today's Journey</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Live status for active school transit journey
                  </p>
                </div>
                <span className="badge-status active" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
                  Live Transit Active
                </span>
              </div>

              <div className="grid-2" style={{ alignItems: 'center' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                      Route #04: Bole Medhanealem ➔ Cambridge Academy
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)' }}>Morning Run</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Verified Driver:</span>
                      <span style={{ fontWeight: 600 }}>Dawit Abebe (ID: #DRV-849)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Vehicle Plate:</span>
                      <span style={{ fontWeight: 600 }}>Toyota HiAce • 3-A2849</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Student Passenger:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Maya Bekele (Grade 5)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Boarding Status:</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Boarded at 07:18 AM</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                    Journey Progress Timeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-success)', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Trip Started by Driver</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>07:05 AM • Bole Terminal Hub</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-success)', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Student Boarded Successfully</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>07:18 AM • Bole Medhanealem Stop</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <Clock size={18} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)' }}>In Transit to School</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>ETA: 07:45 AM • Cambridge Academy Gate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications & Safety Alerts */}
            <div className="grid-2">
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title">Recent Notifications</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('Notifications')}>
                    View All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <Bell size={18} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Maya checked in on Route #04</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>12 minutes ago • Boarding confirmed</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-success)', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Driver Dawit Abebe verified for 2026/27</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Yesterday • Annual safety documents verified</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title">Safety & Quick Contacts</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('Safety')}>
                    Emergency Details
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Assigned Driver: Dawit</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>Toyota HiAce • 3-A2849</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <Phone size={14} /> Call Driver
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Cambridge Academy Transit Desk</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>Transport coordinator on duty</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <Phone size={14} /> School Office
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'My Children' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">My Registered Children</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Students managed under your parent guardian account
                </p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: '0.35rem' }}>
                <Plus size={16} /> Add Child
              </button>
            </div>

            <div className="grid-2">
              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Maya Bekele</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Grade 5 • Age 10 • ID: #STD-1092</span>
                  </div>
                  <span className="badge-status active">Active Route</span>
                </div>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                  <div><strong>School:</strong> Cambridge Academy (Bole Campus)</div>
                  <div><strong>Assigned Route:</strong> Route #04 (Morning & Afternoon)</div>
                  <div><strong>Provider:</strong> Dawit Abebe (Verified Provider)</div>
                  <div><strong>Pickup Location:</strong> Bole Medhanealem (07:15 AM)</div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Noah Bekele</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Grade 2 • Age 7 • ID: #STD-1093</span>
                  </div>
                  <span className="badge-status active">Active Route</span>
                </div>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                  <div><strong>School:</strong> Cambridge Academy (Bole Campus)</div>
                  <div><strong>Assigned Route:</strong> Route #04 (Morning & Afternoon)</div>
                  <div><strong>Provider:</strong> Dawit Abebe (Verified Provider)</div>
                  <div><strong>Pickup Location:</strong> Bole Medhanealem (07:15 AM)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Transportation' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Transportation Provider & Route Details</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Destination School</th>
                  <th>Operator / Driver</th>
                  <th>Vehicle</th>
                  <th>Monthly Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Route #04 (Bole Area)</td>
                  <td>Cambridge Academy</td>
                  <td>Dawit Abebe</td>
                  <td>Toyota HiAce (3-A2849)</td>
                  <td>$75 / month</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
                <tr>
                  <td>Route #12 (Kazanchis Run)</td>
                  <td>Sandford International</td>
                  <td>Yonas Tesfaye</td>
                  <td>Toyota Coaster (3-B9912)</td>
                  <td>$85 / month</td>
                  <td><span className="badge-status pending">Seat Inquired</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Trips' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Daily Trip Schedule & History</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trip Type</th>
                  <th>Passenger</th>
                  <th>Pickup Time</th>
                  <th>Drop-Off Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Today (Morning)</td>
                  <td>Morning Pickup</td>
                  <td>Maya & Noah</td>
                  <td>07:18 AM</td>
                  <td>07:45 AM (Est)</td>
                  <td><span className="badge-status active">In Transit</span></td>
                </tr>
                <tr>
                  <td>Yesterday (Afternoon)</td>
                  <td>School Return</td>
                  <td>Maya & Noah</td>
                  <td>15:35 PM</td>
                  <td>16:10 PM</td>
                  <td><span className="badge-status active">Completed</span></td>
                </tr>
                <tr>
                  <td>Yesterday (Morning)</td>
                  <td>Morning Pickup</td>
                  <td>Maya & Noah</td>
                  <td>07:16 AM</td>
                  <td>07:42 AM</td>
                  <td><span className="badge-status active">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Notifications Feed</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600 }}>Boarding Alert: Maya Bekele</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Student successfully scanned in at Bole Medhanealem stop by driver Dawit.
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Today at 07:18 AM</div>
              </div>
              <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600 }}>Trip Departure Notice</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Route #04 morning transit has departed the primary terminal on schedule.
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Today at 07:05 AM</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Payment & Transportation Fees</h3>
              <button className="btn btn-secondary btn-sm">Download Statements</button>
            </div>
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Current Billing Cycle:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.25rem 0' }}>$150.00 / Month</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>Paid for October 2026 • 2 Children (Maya & Noah)</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Date Paid</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INV-2026-10</td>
                  <td>October 2026</td>
                  <td>$150.00</td>
                  <td>Oct 01, 2026</td>
                  <td><span style={{ color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}>View PDF</span></td>
                </tr>
                <tr>
                  <td>INV-2026-09</td>
                  <td>September 2026</td>
                  <td>$150.00</td>
                  <td>Sep 01, 2026</td>
                  <td><span style={{ color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}>View PDF</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Safety' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Child Safety & Emergency Protocol</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Immediate safety reporting, verified driver records, and authorized pickup delegates
                </p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--color-danger)' }}>
                Report Safety Concern
              </button>
            </div>
            <div className="grid-2">
              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Authorized Pickup Contacts</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Only authorized adults recorded here are permitted to receive children at designated drop-off stops.
                </p>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                    <strong>Rahel Bekele (Parent)</strong> • +251 91 123 4567
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                    <strong>Yared Bekele (Guardian)</strong> • +251 91 765 4321
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Provider Verification Status</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                    <ShieldCheck size={18} /> Driver Background Investigation Cleared
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                    <ShieldCheck size={18} /> Commercial Vehicle Safety Inspection Valid
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                    <ShieldCheck size={18} /> Passenger Transit Insurance Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Parent / Guardian Profile</h3>
            </div>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', fontSize: '0.925rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Full Name:</span>
                <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Account Role:</span>
                <span style={{ fontWeight: 600 }}>Parent / Guardian</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                <span>{user.email}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Phone:</span>
                <span>{user.phone || 'Not provided'}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Registered On:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   2. TRANSPORT PROVIDER / DRIVER DASHBOARD
   Navigation: Dashboard | Fleet | Routes | Requests | Trips | Earnings | Verification | Profile
   ========================================================================= */
const ProviderDashboardView: FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Fleet' | 'Routes' | 'Requests' | 'Trips' | 'Earnings' | 'Verification' | 'Profile'
  >('Dashboard');

  const tabs: Array<'Dashboard' | 'Fleet' | 'Routes' | 'Requests' | 'Trips' | 'Earnings' | 'Verification' | 'Profile'> = [
    'Dashboard',
    'Fleet',
    'Routes',
    'Requests',
    'Trips',
    'Earnings',
    'Verification',
    'Profile',
  ];

  return (
    <div>
      {/* 16. Transport Provider / Driver Navigation */}
      <div className="dashboard-nav-strip" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="dashboard-nav-inner">
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Dashboard' && <BarChart3 size={16} />}
                {tab === 'Fleet' && <Car size={16} />}
                {tab === 'Routes' && <MapPin size={16} />}
                {tab === 'Requests' && <Users size={16} />}
                {tab === 'Trips' && <Bus size={16} />}
                {tab === 'Earnings' && <DollarSign size={16} />}
                {tab === 'Verification' && <FileCheck size={16} />}
                {tab === 'Profile' && <UserCheck size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Overview Stats (Requirements: Fleet: 2 Vehicles, Routes: 4, Requests: 6 Pending, Today's Trips: 3) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Fleet</span>
              <Car size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value">2 Vehicles</div>
            <div className="stat-subtext">Toyota HiAce & Toyota Coaster</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Routes</span>
              <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">4 Active</div>
            <div className="stat-subtext">Covering 3 School Districts</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Transportation Requests</span>
              <Users size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="stat-value">6 Pending</div>
            <div className="stat-subtext">Parents awaiting seat approval</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Today's Trips</span>
              <Bus size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">3 Trips</div>
            <div className="stat-subtext">Morning Run, Midday, Afternoon Return</div>
          </div>
        </div>

        {activeTab === 'Dashboard' && (
          <>
            {/* Today's Trips Manifest */}
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Today's Transit Manifest</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Active schedule for driver & vehicle assignments
                  </p>
                </div>
                <button className="btn btn-primary btn-sm">
                  Start New Trip
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trip Name</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Scheduled Time</th>
                    <th>Passengers</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Morning Run #01</strong></td>
                    <td>Bole ➔ Cambridge Academy</td>
                    <td>Toyota HiAce (3-A2849)</td>
                    <td>07:00 AM - 07:50 AM</td>
                    <td>18 / 18 Checked In</td>
                    <td><span className="badge-status active">In Transit</span></td>
                  </tr>
                  <tr>
                    <td><strong>Morning Run #02</strong></td>
                    <td>Kazanchis ➔ Sandford International</td>
                    <td>Toyota Coaster (3-B9912)</td>
                    <td>07:15 AM - 08:05 AM</td>
                    <td>24 / 26 Boarded</td>
                    <td><span className="badge-status active">In Transit</span></td>
                  </tr>
                  <tr>
                    <td><strong>Afternoon Return #01</strong></td>
                    <td>Cambridge Academy ➔ Bole</td>
                    <td>Toyota HiAce (3-A2849)</td>
                    <td>15:30 PM - 16:25 PM</td>
                    <td>18 Passengers</td>
                    <td><span className="badge-status pending">Scheduled</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pending Requests Preview */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Pending Seat Requests (6)</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('Requests')}>
                  View All Requests
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parent Name</th>
                    <th>Child</th>
                    <th>School</th>
                    <th>Requested Route</th>
                    <th>Pickup Point</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Abebech Tadesse</td>
                    <td>Samuel Tadesse (Grade 4)</td>
                    <td>Cambridge Academy</td>
                    <td>Route #04 (Bole)</td>
                    <td>Atlas Junction</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm">Accept</button>
                        <button className="btn btn-secondary btn-sm">Decline</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Daniel Mekonnen</td>
                    <td>Lydia Mekonnen (Grade 6)</td>
                    <td>Sandford International</td>
                    <td>Route #12 (Kazanchis)</td>
                    <td>Bambis Supermarket</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm">Accept</button>
                        <button className="btn btn-secondary btn-sm">Decline</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Fleet' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Vehicle Fleet Management</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Manage registered vehicles, seating capacities, and annual inspection records
                </p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: '0.35rem' }}>
                <Plus size={16} /> Register New Vehicle
              </button>
            </div>

            <div className="grid-2">
              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: 'var(--color-primary)' }}>Toyota HiAce Minibus</h4>
                  <span className="badge-status active">Active & Verified</span>
                </div>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>License Plate:</strong> Code 3-A2849</div>
                  <div><strong>Capacity:</strong> 18 Passenger Seats (18 Booked)</div>
                  <div><strong>Assigned Driver:</strong> Dawit Abebe</div>
                  <div><strong>Safety Inspection:</strong> Valid until August 2027</div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: 'var(--color-primary)' }}>Toyota Coaster Bus</h4>
                  <span className="badge-status active">Active & Verified</span>
                </div>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>License Plate:</strong> Code 3-B9912</div>
                  <div><strong>Capacity:</strong> 30 Passenger Seats (26 Booked, 4 Available)</div>
                  <div><strong>Assigned Driver:</strong> Yonas Tesfaye</div>
                  <div><strong>Safety Inspection:</strong> Valid until November 2027</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Routes' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Defined School Transportation Routes</h3>
              <button className="btn btn-primary btn-sm">
                <Plus size={16} /> Create New Route
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Destination School</th>
                  <th>Service Timing</th>
                  <th>Available Seats</th>
                  <th>Monthly Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Route #04 (Bole ➔ Cambridge)</td>
                  <td>Cambridge Academy</td>
                  <td>Morning (07:00) / Afternoon (15:30)</td>
                  <td>0 Available (Full)</td>
                  <td>$75 / seat</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
                <tr>
                  <td>Route #12 (Kazanchis ➔ Sandford)</td>
                  <td>Sandford International</td>
                  <td>Morning (07:15) / Afternoon (15:45)</td>
                  <td>4 Seats Available</td>
                  <td>$85 / seat</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Requests' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Seat Requests from Parents</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Route</th>
                  <th>Pickup Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Abebech Tadesse</td>
                  <td>Samuel Tadesse</td>
                  <td>Grade 4</td>
                  <td>Route #04 (Bole)</td>
                  <td>Atlas Junction, House 42</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm">Approve</button>
                      <button className="btn btn-secondary btn-sm">Decline</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Trips' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Daily Trip Control & Student Boarding</h3>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Record student check-ins and drop-offs during active transport runs.
            </p>
            <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--color-primary)' }}>Active Trip: Route #04 Morning Run</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>18 Students assigned • 18 Checked In</div>
                </div>
                <button className="btn btn-primary btn-sm">Complete Trip at Cambridge Academy</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Earnings' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Earnings & Monthly Revenue</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Current Month Earnings</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>$3,560.00</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Active Paying Seats</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)' }}>44 Seats</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Payout Status</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>Cleared</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Verification' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Provider & Driver Verification Records</h3>
              <span className="badge-status active">Fully Verified Operator</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Commercial Driving License (Grade 4)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Issued by Transport Authority • Verified</div>
                </div>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>Approved ✓</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Vehicle Roadworthiness Certificate</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Annual mechanical inspection report • Verified</div>
                </div>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>Approved ✓</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Transport Provider / Driver Profile</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', fontSize: '0.925rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Operator Name:</span>
              <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Role:</span>
              <span style={{ fontWeight: 600 }}>Transport Provider / Driver</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
              <span>{user.email}</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Phone:</span>
              <span>{user.phone || 'Not provided'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   3. BUSINESS / ADVERTISER DASHBOARD
   Navigation: Dashboard | My Business | Advertisements | Campaigns | Payments | Analytics | Profile
   ========================================================================= */
const BusinessDashboardView: FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'My Business' | 'Advertisements' | 'Campaigns' | 'Payments' | 'Analytics' | 'Profile'
  >('Dashboard');

  const tabs: Array<'Dashboard' | 'My Business' | 'Advertisements' | 'Campaigns' | 'Payments' | 'Analytics' | 'Profile'> = [
    'Dashboard',
    'My Business',
    'Advertisements',
    'Campaigns',
    'Payments',
    'Analytics',
    'Profile',
  ];

  return (
    <div>
      {/* 16. Business Role-Based Navigation */}
      <div className="dashboard-nav-strip" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="dashboard-nav-inner">
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Dashboard' && <BarChart3 size={16} />}
                {tab === 'My Business' && <Building2 size={16} />}
                {tab === 'Advertisements' && <FileText size={16} />}
                {tab === 'Campaigns' && <TrendingUp size={16} />}
                {tab === 'Payments' && <CreditCard size={16} />}
                {tab === 'Analytics' && <Eye size={16} />}
                {tab === 'Profile' && <UserCheck size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Overview Stats (Requirements: Active Ads, Pending Ads, Views, Clicks, Spend, Campaign Status) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Active Ads</span>
              <FileText size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">3 Active</div>
            <div className="stat-subtext">1 Ad Pending Review</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Advertisement Views</span>
              <Eye size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value">14,250</div>
            <div className="stat-subtext">Across Parent & Provider Portals</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Clicks (Engagement)</span>
              <MousePointer size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">842</div>
            <div className="stat-subtext">5.91% Click-Through Rate</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Advertising Spend</span>
              <DollarSign size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="stat-value">$420.00</div>
            <div className="stat-subtext">Campaign Status: Running</div>
          </div>
        </div>

        {activeTab === 'Dashboard' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Active Advertising Campaigns</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Targeted advertising to families, transport providers, and school communities
                </p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: '0.35rem' }}>
                <Plus size={16} /> Create Campaign
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Title</th>
                  <th>Category</th>
                  <th>Audience Target</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SafeTire Fleet Discount (15% Off)</strong></td>
                  <td>Tire shops & Fleet Service</td>
                  <td>Transport Providers / Drivers</td>
                  <td>6,840</td>
                  <td>412</td>
                  <td>$180 / mo</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Family Van Safety Tune-up Special</strong></td>
                  <td>Automotive Services</td>
                  <td>Parents & Guardians</td>
                  <td>5,410</td>
                  <td>320</td>
                  <td>$150 / mo</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Commercial Bus Insurance Package</strong></td>
                  <td>Insurance</td>
                  <td>Fleet Owners & Providers</td>
                  <td>2,000</td>
                  <td>110</td>
                  <td>$90 / mo</td>
                  <td><span className="badge-status active">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Genuine Spare Parts - School Buses</strong></td>
                  <td>Spare Parts</td>
                  <td>Transport Providers</td>
                  <td>—</td>
                  <td>—</td>
                  <td>$100 / mo</td>
                  <td><span className="badge-status pending">Pending Review</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'My Business' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Business Profile & Verification</h3>
            </div>
            <div style={{ maxWidth: '600px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', fontSize: '0.925rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Company Name:</span>
              <span style={{ fontWeight: 600 }}>SafeTire Automotive Hub</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Industry:</span>
              <span>Automotive Services & Tire Distribution</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Business License:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Verified Commercial License ✓</span>
            </div>
          </div>
        )}

        {(activeTab === 'Advertisements' || activeTab === 'Campaigns') && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Campaign Placements</h3>
              <button className="btn btn-primary btn-sm">New Placement</button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Your advertisements appear as trusted sponsor spotlights across the parent transit tracker and driver navigation consoles.
            </p>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Billing & Ad Invoices</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Monthly invoice statements and payment receipt history for marketing campaigns.
            </p>
          </div>
        )}

        {activeTab === 'Analytics' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Reach & Engagement Analytics</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Total reach: 14,250 unique impressions across 8 school routes.
            </p>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Account Representative</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', fontSize: '0.925rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Representative:</span>
              <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Account Email:</span>
              <span>{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. SYSTEM ADMINISTRATOR DASHBOARD
   Navigation: Dashboard | Users | Providers | Vehicles | Trips | Incidents | Businesses | Advertisements | Payments | Reports | Audit Logs | Settings
   ========================================================================= */
const AdminDashboardView: FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const tabs = [
    'Dashboard',
    'Users',
    'Providers',
    'Vehicles',
    'Trips',
    'Incidents',
    'Businesses',
    'Advertisements',
    'Payments',
    'Reports',
    'Audit Logs',
    'Settings',
  ];

  return (
    <div>
      {/* 16. System Administrator Navigation */}
      <div className="dashboard-nav-strip" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="dashboard-nav-inner">
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Dashboard' && <BarChart3 size={16} />}
                {tab === 'Users' && <Users size={16} />}
                {tab === 'Providers' && <UserCheck size={16} />}
                {tab === 'Vehicles' && <Car size={16} />}
                {tab === 'Trips' && <Bus size={16} />}
                {tab === 'Incidents' && <AlertTriangle size={16} />}
                {tab === 'Businesses' && <Building2 size={16} />}
                {tab === 'Advertisements' && <FileText size={16} />}
                {tab === 'Payments' && <CreditCard size={16} />}
                {tab === 'Reports' && <TrendingUp size={16} />}
                {tab === 'Audit Logs' && <History size={16} />}
                {tab === 'Settings' && <Settings size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Active System Administrator: <strong>{user.firstName} {user.lastName}</strong> ({user.email})
        </div>
        {/* Overview Stats (Requirements: Total Users: 1,280; Verified Providers: 84; Active Vehicles: 112; Active Trips: 38; Open Incidents: 2; Advertising Revenue: $8,450; Pending Verifications: 5) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Users</span>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value">1,280</div>
            <div className="stat-subtext">Parents, Providers & Advertisers</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Verified Providers</span>
              <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">84</div>
            <div className="stat-subtext">5 Pending Document Review</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Active Vehicles</span>
              <Car size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">112</div>
            <div className="stat-subtext">Inspected & cleared for student transit</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Active Trips</span>
              <Bus size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">38</div>
            <div className="stat-subtext">Live morning transportation routes</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Open Incidents</span>
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>2</div>
            <div className="stat-subtext">Safety alerts requiring review</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Advertising Revenue</span>
              <DollarSign size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">$8,450</div>
            <div className="stat-subtext">Current month platform ad fees</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Pending Verifications</span>
              <FileCheck size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="stat-value">5</div>
            <div className="stat-subtext">Driver licenses & vehicle checks</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>System Security</span>
              <Shield size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: '1.25rem' }}>Protected</div>
            <div className="stat-subtext">RBAC, token rotation & SSL active</div>
          </div>
        </div>

        {/* Pending Provider Verifications Queue */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Pending Provider Verifications (5)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Review driver licenses, commercial vehicle certificates, and background reports
              </p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Role Category</th>
                <th>Vehicle / Plate</th>
                <th>Documents Submitted</th>
                <th>Submission Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Getachew Alemu</strong></td>
                <td>Transport Provider / Driver</td>
                <td>Toyota Coaster (3-C4012)</td>
                <td>License, Inspection, Insurance</td>
                <td>Today at 09:20 AM</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm">Approve</button>
                    <button className="btn btn-secondary btn-sm">Inspect</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Tsegaye Haile</strong></td>
                <td>Transport Provider / Driver</td>
                <td>Toyota HiAce (3-A9932)</td>
                <td>License, Vehicle Permit</td>
                <td>Yesterday</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm">Approve</button>
                    <button className="btn btn-secondary btn-sm">Inspect</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Open Safety Incidents */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title" style={{ color: 'var(--color-danger)' }}>
                Open Safety Incidents (2)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Immediate safety events logged by drivers, schools, or parents
              </p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Route</th>
                <th>Report Type</th>
                <th>Details</th>
                <th>Reported At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>#INC-1082</strong></td>
                <td>Route #04 (Bole)</td>
                <td><span className="badge-status pending">Traffic Detour</span></td>
                <td>Minor road construction detour causing 10-minute delay. Parents notified automatically.</td>
                <td>07:22 AM</td>
                <td><button className="btn btn-secondary btn-sm">Resolve</button></td>
              </tr>
              <tr>
                <td><strong>#INC-1079</strong></td>
                <td>Route #09 (Sarbet)</td>
                <td><span className="badge-status pending">Unscheduled Stop</span></td>
                <td>Vehicle paused for tire pressure check. Re-engaged safely.</td>
                <td>Yesterday</td>
                <td><button className="btn btn-secondary btn-sm">Resolve</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   5. STUDENT VIEW (Dependent Entity)
   ========================================================================= */
const StudentDashboardView: FC<{ user: any }> = ({ user }) => {
  return (
    <div className="dashboard-main">
      <div className="panel-card" style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Student Portal • {user.firstName} {user.lastName}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Dependent account safely linked to parent guardian
            </p>
          </div>
          <span className="badge-status active">Student Recipient</span>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Your daily school transportation, route schedule, and boarding check-ins are managed and monitored by your Parent/Guardian.
        </p>
        <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Morning Transit Active</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Boarding pass verified for Route #04 • Cambridge Academy
          </div>
        </div>
      </div>
    </div>
  );
};
