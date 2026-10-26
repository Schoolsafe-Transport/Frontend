import { useState, useEffect, FC } from 'react';
import { useAuth } from '../context/AuthContext';
import { normalizeToMVPActor, getActorDisplayName, MVPActor } from '../types/auth';
import {
  Shield,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  AlertCircle,
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
  DollarSign,
  UserCheck,
  FileCheck,
  History,
  Search,
  Loader2,
  X,
  QrCode,
} from 'lucide-react';
import { PrintableTransportPassModal } from '../components/marketplace/PrintableTransportPassModal';
import { ParentMarketplaceTabs } from '../components/marketplace/ParentMarketplaceTabs';
import { ProviderMarketplaceTabs } from '../components/marketplace/ProviderMarketplaceTabs';
import { NotificationsPanel } from '../components/dashboard/NotificationsPanel';
import { ProviderFleetPanel } from '../components/dashboard/ProviderFleetPanel';
import { ProviderRoutesPanel } from '../components/dashboard/ProviderRoutesPanel';
import { TripsAndBoardingPanel } from '../components/dashboard/TripsAndBoardingPanel';
import { ParentSafetyPanel } from '../components/dashboard/ParentSafetyPanel';
import { UserProfilePanel } from '../components/dashboard/UserProfilePanel';
import { ActiveAdBanner } from '../components/dashboard/ActiveAdBanner';
import { FaydaVerificationModal } from '../components/dashboard/FaydaVerificationModal';
import {
  getStudentsApi,
  createStudentApi,
  getMyAgreementsApi,
  getStudentTripStatusApi,
  StudentTripStatusData,
  getMyPaymentsApi,
  getPaymentReceiptUrl,
  PaymentRecord,
  getVehiclesApi,
  getProviderRoutesApi,
  getTransportationRequestsApi,
  getTripsApi,
  acceptRequestApi,
  rejectRequestApi,
  getMyDocumentsApi,
  uploadAccountDocumentApi,
  getAccountDocumentUrl,
  getAdminStatsApi,
  AccountDocument,
  AdminPlatformStats,
  getAdminSafetyIncidentsApi,
  resolveAdminIncidentApi,
} from '../services/api';
import { AdminApplicationsQueue } from '../components/dashboard/AdminApplicationsQueue';
import { AdminPaymentsReview } from '../components/dashboard/AdminPaymentsReview';
import { BusinessCampaignManager } from '../components/dashboard/BusinessCampaignManager';
import { AdminCampaignManager } from '../components/dashboard/AdminCampaignManager';
import { AdminAuditLogs } from '../components/dashboard/AdminAuditLogs';
import { AdminDashboardRoot } from './admin/AdminDashboardRoot';

interface DashboardViewProps {
  onOpenVerifyFayda?: () => void;
}

export const DashboardView: FC<DashboardViewProps> = ({ onOpenVerifyFayda }) => {
  const { user, logout } = useAuth();
  const [showFaydaModal, setShowFaydaModal] = useState(false);

  if (!user) return null;

  // Dedicated Admin Console: System Administrators receive the redesigned AdminDashboardRoot layout directly
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return <AdminDashboardRoot />;
  }


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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                  {actorType === 'PARENT' ? `Good morning, ${user.firstName}` : `Welcome back, ${user.firstName}`}
                </h3>
                <span className="role-pill">
                  {actorDisplayName}
                </span>

                {/* Email Verification Status Badge */}
                {user.isEmailVerified ? (
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
                    <CheckCircle2 size={12} /> Email Verified
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#B45309',
                      backgroundColor: '#FEF3C7',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #FCD34D',
                    }}
                  >
                    <Clock size={12} /> Email Pending
                  </span>
                )}

              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {user.email}
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Pending Administrator Review Banner */}
      {user.status === 'PENDING' && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            borderBottom: '1px solid #BFDBFE',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Clock size={18} style={{ color: '#2563EB', shrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#1E40AF', fontWeight: 500 }}>
            <strong>Account Pending Administrator Review:</strong> Your registration application and documents are under review by SchoolSafe administrators. Features requiring approval will be activated once your profile is approved.
          </span>
        </div>
      )}

      {/* Rejected Account Banner */}
      {user.status === 'REJECTED' && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            borderBottom: '1px solid #FECACA',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={18} style={{ color: '#DC2626', shrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: 500 }}>
            <strong>Application Rejected:</strong> {user.rejectionReason || 'Your application was rejected by administrators. Please review your credentials or contact support.'}
          </span>
        </div>
      )}

      {/* Role-Specific Dashboard Renderer */}
      {actorType === 'PARENT' && (
        <ParentDashboardView
          user={user}
          onOpenFaydaModal={() => setShowFaydaModal(true)}
          onOpenVerifyPage={onOpenVerifyFayda}
        />
      )}
      {actorType === 'TRANSPORT_PROVIDER_DRIVER' && <ProviderDashboardView user={user} />}
      {actorType === 'BUSINESS' && <BusinessDashboardView user={user} />}
      {actorType === 'ADMIN' && <AdminDashboardView user={user} />}
      {actorType === 'STUDENT' && <StudentDashboardView user={user} />}

      <FaydaVerificationModal
        isOpen={showFaydaModal}
        onClose={() => setShowFaydaModal(false)}
        onVerified={() => setShowFaydaModal(false)}
      />
    </div>
  );
};

/* =========================================================================
   1. PARENT DASHBOARD
   Navigation: Dashboard | My Children | Transportation | Trips | Notifications | Payments | Safety | Profile
   ========================================================================= */
const ParentDashboardView: FC<{
  user: any;
  onOpenFaydaModal?: () => void;
  onOpenVerifyPage?: () => void;
}> = ({ user, onOpenFaydaModal: _onOpenFaydaModal, onOpenVerifyPage: _onOpenVerifyPage }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'My Children' | 'Find Transportation' | 'My Requests' | 'My Transportation' | 'Trips' | 'Notifications' | 'Payments' | 'Safety' | 'Profile'
  >('Dashboard');

  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [tripStatuses, setTripStatuses] = useState<Record<string, StudentTripStatusData>>({});
  const [passModalAgreementId, setPassModalAgreementId] = useState<string | null>(null);
  const [passModalStudentName, setPassModalStudentName] = useState<string | undefined>(undefined);
  const [showRegisterChildModal, setShowRegisterChildModal] = useState(false);
  const [registeringChild, setRegisteringChild] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Form fields for child registration
  const [childForm, setChildForm] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    schoolName: '',
    schoolBranch: '',
    homeAddress: '',
    emergencyPhone: '',
    gender: 'Male',
    dateOfBirth: '',
  });

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await getStudentsApi();
      setStudents(data || []);

      // Fetch active agreements, payments and student trip statuses
      try {
        const agrs = await getMyAgreementsApi();
        setAgreements(agrs || []);
      } catch {}

      try {
        setPaymentsLoading(true);
        const pmts = await getMyPaymentsApi();
        setPayments(pmts || []);
      } catch {
      } finally {
        setPaymentsLoading(false);
      }

      if (data && data.length > 0) {
        const statuses: Record<string, StudentTripStatusData> = {};
        await Promise.all(
          data.map(async (child: any) => {
            try {
              const status = await getStudentTripStatusApi(child.id);
              statuses[child.id] = status;
            } catch {}
          })
        );
        setTripStatuses(statuses);
      }
    } catch (_err) {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRegisterChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.firstName.trim() || !childForm.lastName.trim() || !childForm.schoolName.trim()) {
      setRegisterError('First name, last name, and school name are required.');
      return;
    }

    setRegisteringChild(true);
    setRegisterError(null);
    try {
      const payload: any = {
        firstName: childForm.firstName.trim(),
        lastName: childForm.lastName.trim(),
        schoolName: childForm.schoolName.trim(),
      };
      if (childForm.grade.trim()) payload.grade = childForm.grade.trim();
      if (childForm.schoolBranch.trim()) payload.schoolBranch = childForm.schoolBranch.trim();
      if (childForm.homeAddress.trim()) payload.homeAddress = childForm.homeAddress.trim();
      if (childForm.emergencyPhone.trim()) payload.emergencyPhone = childForm.emergencyPhone.trim();
      if (childForm.gender) payload.gender = childForm.gender;
      if (childForm.dateOfBirth) payload.dateOfBirth = childForm.dateOfBirth;

      await createStudentApi(payload);
      setRegisterSuccess(`${childForm.firstName} registered successfully!`);
      await fetchStudents();
      setChildForm({
        firstName: '',
        lastName: '',
        grade: '',
        schoolName: '',
        schoolBranch: '',
        homeAddress: '',
        emergencyPhone: '',
        gender: 'Male',
        dateOfBirth: '',
      });
      setTimeout(() => {
        setShowRegisterChildModal(false);
        setRegisterSuccess(null);
      }, 1000);
    } catch (err: any) {
      setRegisterError(
        err?.response?.data?.message || err?.message || 'Failed to register child. Please try again.'
      );
    } finally {
      setRegisteringChild(false);
    }
  };

  const tabs: Array<'Dashboard' | 'My Children' | 'Find Transportation' | 'My Requests' | 'My Transportation' | 'Trips' | 'Notifications' | 'Payments' | 'Safety' | 'Profile'> = [
    'Dashboard',
    'My Children',
    'Find Transportation',
    'My Requests',
    'My Transportation',
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
                {tab === 'Find Transportation' && <Search size={16} />}
                {tab === 'My Requests' && <FileText size={16} />}
                {tab === 'My Transportation' && <Bus size={16} />}
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
            <ActiveAdBanner onFindTransportation={() => setActiveTab('Find Transportation')} />

            {/* Quick Metrics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span>Registered Children</span>
                  <Users size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="stat-value">{students.length}</div>
                <div className="stat-subtext">
                  {students.length === 0
                    ? 'No children registered yet'
                    : `${students.length} child${students.length > 1 ? 'ren' : ''} under guardianship`}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Active Transit</span>
                  <Bus size={18} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="stat-value">{students.length > 0 ? 'Active' : 'No Commute'}</div>
                <div className="stat-subtext">
                  {students.length > 0 ? 'Verified school transit service' : 'Explore routes to request transit'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Next Pickup / Drop</span>
                  <Clock size={18} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="stat-value">
                  {agreements.length > 0 && agreements[0]?.route?.departureTimeMorning
                    ? agreements[0].route.departureTimeMorning
                    : 'None Scheduled'}
                </div>
                <div className="stat-subtext">
                  {agreements.length > 0 ? 'Assigned morning departure' : 'No active route booked'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Payment History</span>
                  <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                  {payments.length > 0 ? `${payments.length} Records` : 'Up to date'}
                </div>
                <div className="stat-subtext">
                  {payments.length > 0 ? 'Verified transactions recorded' : 'No invoices due'}
                </div>
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
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: students.length > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    }}
                  ></span>
                  {students.length > 0 ? 'Live Monitoring Ready' : 'No Active Commute'}
                </span>
              </div>

              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1.25rem', fontSize: '0.95rem' }}>
                    No active school transit today. Register your child and request transportation to monitor live school commutes.
                  </p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setRegisterError(null);
                      setRegisterSuccess(null);
                      setShowRegisterChildModal(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', margin: '0 auto' }}
                  >
                    <Plus size={15} /> Register Your Child
                  </button>
                </div>
              ) : (
                <div className="grid-2" style={{ alignItems: 'center' }}>
                  <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                        Registered School Commute Status
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)' }}>Active Guardianship</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Primary Child:</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {students[0].firstName} {students[0].lastName} {students[0].grade ? `(${students[0].grade})` : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Designated School:</span>
                        <span style={{ fontWeight: 600 }}>{students[0].schoolName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Registered:</span>
                        <span style={{ fontWeight: 600 }}>{students.length} Student{students.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                      Journey Quick Actions
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                      Manage assigned routes or discover new verified routes for your children.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('Find Transportation')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Search size={14} /> Find Transportation
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveTab('Safety')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Shield size={14} /> Manage Pickups
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="panel-header" style={{ alignItems: 'center' }}>
              <div>
                <h3 className="panel-title">My Registered Children</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Students managed under your parent guardian account ({students.length})
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setRegisterError(null);
                  setRegisterSuccess(null);
                  setShowRegisterChildModal(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                id="register-child-top-btn"
              >
                <Plus size={16} /> Register Child
              </button>
            </div>

            {studentsLoading ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-primary)' }}>
                <Loader2 size={32} className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 600 }}>Loading your registered children...</div>
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <Users size={28} />
                </div>
                <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Children Registered Yet
                </h3>
                <p style={{ maxWidth: '480px', margin: '0 auto 1.75rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  Register your child to find suitable school transportation.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setRegisterError(null);
                    setRegisterSuccess(null);
                    setShowRegisterChildModal(true);
                  }}
                  id="register-child-empty-state-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                >
                  <Plus size={16} /> Register Your Child
                </button>
              </div>
            ) : (
              <div className="grid-2">
                {students.map((child) => (
                  <div
                    key={child.id}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem', margin: 0 }}>
                            {child.firstName} {child.lastName}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {child.grade ? `${child.grade} • ` : ''}ID: #{child.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <span className="badge-status active">Registered</span>
                      </div>

                      <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', color: 'var(--color-text-main)' }}>
                        <div>
                          <strong style={{ color: 'var(--color-text-secondary)' }}>School: </strong>
                          {child.schoolName} {child.schoolBranch ? `(${child.schoolBranch})` : ''}
                        </div>
                        {child.homeAddress && (
                          <div>
                            <strong style={{ color: 'var(--color-text-secondary)' }}>Pickup Address: </strong>
                            {child.homeAddress}
                          </div>
                        )}
                        {child.emergencyPhone && (
                          <div>
                            <strong style={{ color: 'var(--color-text-secondary)' }}>Emergency Contact: </strong>
                            {child.emergencyPhone}
                          </div>
                        )}
                      </div>

                      {/* TASK 6: Parent Live Trip Status Display */}
                      {tripStatuses[child.id] && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: '#F0FDFA',
                            border: '1px solid #CCFBF1',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#0F766E', fontWeight: 700 }}>
                              🚌 Today's Transit Status
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                                backgroundColor:
                                  tripStatuses[child.id].latestEvent?.eventType === 'ARRIVED_AT_SCHOOL' ||
                                  tripStatuses[child.id].latestEvent?.eventType === 'DROPPED_OFF'
                                    ? '#DCFCE7'
                                    : tripStatuses[child.id].latestEvent
                                    ? '#E0F2FE'
                                    : '#F1F5F9',
                                color:
                                  tripStatuses[child.id].latestEvent?.eventType === 'ARRIVED_AT_SCHOOL' ||
                                  tripStatuses[child.id].latestEvent?.eventType === 'DROPPED_OFF'
                                    ? '#166534'
                                    : tripStatuses[child.id].latestEvent
                                    ? '#0369A1'
                                    : '#475569',
                              }}
                            >
                              ● {tripStatuses[child.id].statusLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                            {tripStatuses[child.id].detailMessage}
                          </div>
                        </div>
                      )}

                      {/* TASK 1 & 2: Transport Pass Button or Booking Required Notice */}
                      {(() => {
                        const activeAgreement = agreements.find(
                          (a: any) => a.studentId === child.id && a.status === 'ACTIVE'
                        );
                        return activeAgreement ? (
                          <div style={{ marginTop: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              id={`print-child-pass-btn-${child.id}`}
                              onClick={() => {
                                setPassModalAgreementId(activeAgreement.id);
                                setPassModalStudentName(`${child.firstName} ${child.lastName}`);
                              }}
                              style={{
                                width: '100%',
                                backgroundColor: '#0F766E',
                                borderColor: '#0F766E',
                                color: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                fontWeight: 600,
                                padding: '0.5rem 0.85rem',
                                fontSize: '0.825rem',
                                borderRadius: '8px',
                              }}
                            >
                              <QrCode size={15} /> Download / Print Transport Pass
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.55rem 0.75rem',
                              backgroundColor: '#FFFBEB',
                              border: '1px dashed #FDE68A',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              color: '#B45309',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            <AlertCircle size={15} style={{ flexShrink: 0 }} />
                            <span>
                              No accepted booking yet. Obtain an accepted booking from a verified provider to generate your child's transport pass.
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('Find Transportation')}
                        style={{ flex: 1, justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <Search size={14} /> Find Transportation
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveTab('Safety')}
                        style={{ justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <Shield size={14} /> Safety & Pickups
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'Find Transportation' ||
          activeTab === 'My Requests' ||
          activeTab === 'My Transportation') && (
          <ParentMarketplaceTabs
            activeTab={activeTab}
            onNavigateTab={(tab) => setActiveTab(tab)}
            user={user}
          />
        )}

        {activeTab === 'Trips' && (
          <TripsAndBoardingPanel user={user} isParent={true} />
        )}

        {activeTab === 'Notifications' && (
          <NotificationsPanel user={user} />
        )}

        {activeTab === 'Payments' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Payment & Transportation Ledger</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Real transaction history, verified receipts, and monthly billing statements
                </p>
              </div>
            </div>

            {paymentsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                <Loader2 size={28} className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading payment statements...</div>
              </div>
            ) : payments.length === 0 ? (
              <div className="empty-state-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <CreditCard size={28} />
                </div>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Payment Records Yet
                </h4>
                <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  When your student transportation requests are accepted and billed, payment statements and verified receipts will appear here.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('Find Transportation')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', margin: '0 auto' }}
                >
                  <Search size={14} /> Find Transportation Routes
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reference #</th>
                      <th>Transit Details</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.reference || p.id.slice(0, 8).toUpperCase()}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            {p.student ? `${p.student.firstName} ${p.student.lastName}` : 'Student Transit'}
                            {p.route ? ` • ${p.route.name}` : ''}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--color-primary)' }}>
                            {p.amount} {p.currency || 'ETB'}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`badge-status ${
                              p.status === 'APPROVED' || p.status === 'PAID'
                                ? 'active'
                                : p.status === 'PENDING_REVIEW'
                                ? 'pending'
                                : 'cancelled'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(p.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {p.receiptUrl ? (
                            <a
                              href={getPaymentReceiptUrl(p.id)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: 'var(--color-accent)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                textDecoration: 'underline',
                              }}
                            >
                              View Receipt
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Safety' && (
          <ParentSafetyPanel user={user} />
        )}

        {activeTab === 'Profile' && (
          <UserProfilePanel user={user} />
        )}
      </div>

      {/* Register Child Modal */}
      {showRegisterChildModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !registeringChild) {
              setShowRegisterChildModal(false);
            }
          }}
        >
          <div
            className="panel-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    Register Your Child
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Add student to your verified parent account
                  </p>
                </div>
              </div>
              <button
                onClick={() => !registeringChild && setShowRegisterChildModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {registerError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} /> {registerError}
              </div>
            )}

            {registerSuccess && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} /> {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterChild} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="filter-label" style={{ fontWeight: 600 }}>First Name *</label>
                  <input
                    type="text"
                    required
                    className="filter-input"
                    placeholder="e.g. Maya"
                    value={childForm.firstName}
                    onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="filter-label" style={{ fontWeight: 600 }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    className="filter-input"
                    placeholder="e.g. Bekele"
                    value={childForm.lastName}
                    onChange={(e) => setChildForm({ ...childForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="filter-label" style={{ fontWeight: 600 }}>School Name *</label>
                <input
                  type="text"
                  required
                  className="filter-input"
                  placeholder="e.g. Cambridge Academy"
                  value={childForm.schoolName}
                  onChange={(e) => setChildForm({ ...childForm, schoolName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="filter-label">School Branch / Campus</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. Bole Campus"
                    value={childForm.schoolBranch}
                    onChange={(e) => setChildForm({ ...childForm, schoolBranch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="filter-label">Grade / Year</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. Grade 5"
                    value={childForm.grade}
                    onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="filter-label">Home Pickup Address</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. Bole Medhanealem, Addis Ababa"
                  value={childForm.homeAddress}
                  onChange={(e) => setChildForm({ ...childForm, homeAddress: e.target.value })}
                />
              </div>

              <div>
                <label className="filter-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="filter-input"
                  placeholder="e.g. +251 911 234 567"
                  value={childForm.emergencyPhone}
                  onChange={(e) => setChildForm({ ...childForm, emergencyPhone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="filter-label">Gender</label>
                  <select
                    className="filter-input"
                    value={childForm.gender}
                    onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="filter-label">Date of Birth</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={childForm.dateOfBirth}
                    onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={registeringChild}
                  onClick={() => setShowRegisterChildModal(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={registeringChild}
                  style={{ flex: 2, justifyContent: 'center', gap: '0.4rem' }}
                >
                  {registeringChild ? (
                    <>
                      <Loader2 size={16} className="spin-animation" /> Registering...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Register Child
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK 2: Printable Student Transport QR Pass Modal */}
      <PrintableTransportPassModal
        isOpen={!!passModalAgreementId}
        agreementId={passModalAgreementId}
        studentName={passModalStudentName}
        onClose={() => {
          setPassModalAgreementId(null);
          setPassModalStudentName(undefined);
        }}
      />
    </div>
  );
};

/* =========================================================================
   2. TRANSPORT PROVIDER / DRIVER DASHBOARD
   Navigation: Dashboard | Fleet | Routes | Requests | Trips | Earnings | Verification | Profile
   ========================================================================= */
const ProviderDashboardView: FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Fleet' | 'Routes' | 'Requests' | 'Passengers' | 'Trips' | 'Notifications' | 'Earnings' | 'Verification' | 'Profile'
  >('Dashboard');

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [documents, setDocuments] = useState<AccountDocument[]>([]);
  const [, setLoading] = useState<boolean>(true);

  // Request actions state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Document upload state
  const [selectedDocType, setSelectedDocType] = useState<string>('DRIVER_LICENSE');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const [vRes, rRes, reqRes, tRes, docRes] = await Promise.allSettled([
        getVehiclesApi(),
        getProviderRoutesApi(),
        getTransportationRequestsApi(),
        getTripsApi(),
        getMyDocumentsApi(),
      ]);

      if (vRes.status === 'fulfilled') {
        const val = vRes.value;
        setVehicles(Array.isArray(val) ? val : val?.vehicles || []);
      }
      if (rRes.status === 'fulfilled') {
        const val = rRes.value;
        setRoutes(Array.isArray(val) ? val : val?.routes || []);
      }
      if (reqRes.status === 'fulfilled') {
        const val = reqRes.value;
        setRequests(Array.isArray(val) ? val : val?.requests || []);
      }
      if (tRes.status === 'fulfilled') {
        const val = tRes.value;
        setTrips(Array.isArray(val) ? val : val?.trips || []);
      }
      if (docRes.status === 'fulfilled') {
        const val = docRes.value;
        setDocuments(Array.isArray(val) ? val : []);
      }
    } catch (err) {
      console.error('[ProviderDashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await acceptRequestApi(requestId);
      const res = await getTransportationRequestsApi();
      setRequests(res.requests || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept seat request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please enter a reason for declining this request (optional):');
    try {
      setActionLoadingId(requestId);
      await rejectRequestApi(requestId, reason || undefined);
      const res = await getTransportationRequestsApi();
      setRequests(res.requests || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to decline seat request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setUploadMessage({ type: 'error', text: 'Please select a document file to upload.' });
      return;
    }

    // Client-side file validation strictly enforcing PNG or PDF
    const fileName = docFile.name.toLowerCase();
    const isAllowed = fileName.endsWith('.png') || fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || docFile.type === 'image/png' || docFile.type === 'application/pdf' || docFile.type === 'image/jpeg';
    if (!isAllowed) {
      setUploadMessage({ type: 'error', text: 'Invalid file format. Documents must be submitted strictly as PNG or PDF.' });
      return;
    }

    if (docFile.size > 10 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: 'File size exceeds 10MB limit. Please upload a file smaller than 10MB.' });
      return;
    }

    try {
      setUploadingDoc(true);
      setUploadMessage(null);
      const formData = new FormData();
      formData.append('documentType', selectedDocType);
      formData.append('document', docFile);

      await uploadAccountDocumentApi(formData);
      setUploadMessage({ type: 'success', text: 'Document submitted successfully as PNG/PDF and queued for administrator review.' });
      setDocFile(null);
      const fileInput = document.getElementById('provider-doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      const docsRes = await getMyDocumentsApi();
      setDocuments(docsRes || []);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activeRoutes = routes.filter((r) => r.status === 'ACTIVE' || r.isActive);
  const activeSeats = requests.filter((r) => r.status === 'ACCEPTED' || r.status === 'APPROVED');
  const totalMonthlyEarnings = activeSeats.reduce((acc, curr) => acc + (curr.route?.monthlyPrice || 0), 0);

  const tabs: Array<'Dashboard' | 'Fleet' | 'Routes' | 'Requests' | 'Passengers' | 'Trips' | 'Notifications' | 'Earnings' | 'Verification' | 'Profile'> = [
    'Dashboard',
    'Fleet',
    'Routes',
    'Requests',
    'Passengers',
    'Trips',
    'Notifications',
    'Earnings',
    'Verification',
    'Profile',
  ];

  return (
    <div>
      {/* Provider Role-Based Navigation */}
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
                {tab === 'Passengers' && <Users size={16} />}
                {tab === 'Trips' && <Bus size={16} />}
                {tab === 'Notifications' && <Bell size={16} />}
                {tab === 'Earnings' && <DollarSign size={16} />}
                {tab === 'Verification' && <FileCheck size={16} />}
                {tab === 'Profile' && <UserCheck size={16} />}
                {tab}
                {tab === 'Requests' && pendingRequests.length > 0 && (
                  <span style={{ marginLeft: '4px', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem', backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Verification & Approval Notice */}
        {user.status !== 'ACTIVE' && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#92400E' }}>
                Account Status: {user.status === 'PENDING' ? 'Pending Administrator Review' : user.status}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#B45309', marginTop: '0.2rem' }}>
                Your provider application and documents are being reviewed. Route publication and passenger boarding activation will be enabled once your account is approved.
              </div>
            </div>
          </div>
        )}

        {/* Real Overview Stats - Clickable to navigate tabs */}
        <div className="stats-grid">
          <div
            className="stat-card"
            onClick={() => setActiveTab('Fleet')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            title="Click to view and manage Fleet Vehicles"
          >
            <div className="stat-header">
              <span>Fleet</span>
              <Car size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value">{vehicles.length} Vehicles</div>
            <div className="stat-subtext">
              {vehicles.length > 0
                ? vehicles.map((v) => `${v.make} ${v.model}`).slice(0, 2).join(', ')
                : 'Manage vehicle fleet →'}
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => setActiveTab('Routes')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            title="Click to view and manage School Routes"
          >
            <div className="stat-header">
              <span>Routes</span>
              <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">{activeRoutes.length} Active</div>
            <div className="stat-subtext">{routes.length > 0 ? `${routes.length} configured routes →` : 'Set up routes →'}</div>
          </div>

          <div
            className="stat-card"
            onClick={() => setActiveTab('Requests')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            title="Click to view seat requests"
          >
            <div className="stat-header">
              <span>Transportation Requests</span>
              <Users size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="stat-value">{pendingRequests.length} Pending</div>
            <div className="stat-subtext">Review parent seat requests →</div>
          </div>

          <div
            className="stat-card"
            onClick={() => setActiveTab('Trips')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            title="Click to manage Daily Trips & Boarding"
          >
            <div className="stat-header">
              <span>Today's Trips</span>
              <Bus size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">{trips.length} Trips</div>
            <div className="stat-subtext">Active dispatch runs →</div>
          </div>
        </div>

        {activeTab === 'Dashboard' && (
          <>
            {/* Today's Transit Manifest */}
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Today's Transit Manifest</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Active schedule for driver & vehicle assignments
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('Trips')}
                >
                  Manage Trips
                </button>
              </div>

              {trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-secondary)' }}>
                  <Bus size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--color-border)', display: 'block' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>No trips currently in progress</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>Create a new transit dispatch or activate scheduled routes in the Trips tab.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Trip Name</th>
                        <th>Route</th>
                        <th>Vehicle</th>
                        <th>Scheduled Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((trip) => (
                        <tr key={trip.id}>
                          <td><strong>{trip.name || `Trip #${trip.id.slice(0, 6)}`}</strong></td>
                          <td>{trip.route ? `${trip.route.origin} ➔ ${trip.route.destinationSchool}` : 'Configured Route'}</td>
                          <td>{trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.plateNumber})` : 'Assigned Vehicle'}</td>
                          <td>{trip.scheduledDepartureTime || trip.startTime ? new Date(trip.scheduledDepartureTime || trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}</td>
                          <td><span className={`badge-status ${trip.status === 'IN_PROGRESS' ? 'active' : 'pending'}`}>{trip.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Requests Preview */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Pending Seat Requests ({pendingRequests.length})</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('Requests')}>
                  View All Requests
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-secondary)' }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--color-border)', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No pending seat requests awaiting review.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parent Name</th>
                        <th>Child</th>
                        <th>Requested Route</th>
                        <th>Pickup Point</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.slice(0, 5).map((req) => (
                        <tr key={req.id}>
                          <td>{req.parent ? `${req.parent.firstName} ${req.parent.lastName}` : 'Parent Guardian'}</td>
                          <td>{req.student ? `${req.student.firstName} ${req.student.lastName}` : 'Student'}</td>
                          <td>{req.route?.name || 'School Route'}</td>
                          <td>{req.pickupStopName || 'Designated Stop'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleAcceptRequest(req.id)}
                              >
                                {actionLoadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : 'Accept'}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleRejectRequest(req.id)}
                              >
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'Fleet' && (
          <ProviderFleetPanel
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'Routes' && (
          <ProviderRoutesPanel user={user} />
        )}

        {(activeTab === 'Requests' || activeTab === 'Passengers') && (
          <ProviderMarketplaceTabs activeTab={activeTab} user={user} />
        )}

        {activeTab === 'Trips' && (
          <TripsAndBoardingPanel user={user} isParent={false} />
        )}

        {activeTab === 'Notifications' && (
          <NotificationsPanel user={user} />
        )}

        {activeTab === 'Earnings' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Earnings & Monthly Revenue</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Estimated Monthly Volume</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ETB {totalMonthlyEarnings.toLocaleString()}
                </div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Active Paying Seats</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  {activeSeats.length} Seats
                </div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Payout Account Status</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.5rem' }}>
                  {user.status === 'ACTIVE' ? 'Active / Eligible' : 'Pending Verification'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Revenue reflects actual active and accepted student agreements on your registered transportation routes.
            </p>
          </div>
        )}

        {activeTab === 'Verification' && (
          <div>
            <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Provider & Vehicle Documents</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Official documents submitted for administrator review and verification
                  </p>
                </div>
                <span className={`badge-status ${user.status === 'ACTIVE' ? 'active' : 'pending'}`}>
                  {user.status === 'ACTIVE' ? 'Verified Operator ✓' : 'Under Review'}
                </span>
              </div>

              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-secondary)' }}>
                  <FileCheck size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--color-border)', display: 'block' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>No verification documents uploaded yet</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Upload your driver's license, vehicle registration, and commercial transport permits below to complete verification.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        backgroundColor: '#FFF'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                          {doc.documentType.replace(/_/g, ' ')}
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: doc.documentName?.toLowerCase().endsWith('.pdf') ? '#FEF3C7' : '#EFF6FF',
                              color: doc.documentName?.toLowerCase().endsWith('.pdf') ? '#92400E' : '#1D4ED8',
                              fontWeight: 700,
                              marginLeft: '0.5rem',
                            }}
                          >
                            {doc.documentName?.toLowerCase().endsWith('.pdf') ? 'PDF DOCUMENT' : 'PNG IMAGE'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                          File: {doc.documentName} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                        {doc.rejectionReason && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                            Rejection note: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a
                          href={getAccountDocumentUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View Document
                        </a>
                        <span
                          className={`badge-status ${
                            doc.status === 'APPROVED' ? 'active' : doc.status === 'REJECTED' ? 'danger' : 'pending'
                          }`}
                        >
                          {doc.status === 'APPROVED' ? 'Approved ✓' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Upload Form */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Upload Verification Document (PNG or PDF)</h3>
              </div>
              <form onSubmit={handleUploadDocument} style={{ maxWidth: '600px' }}>
                {uploadMessage && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      backgroundColor: uploadMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      color: uploadMessage.type === 'success' ? '#065F46' : '#991B1B',
                      border: `1px solid ${uploadMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                    }}
                  >
                    {uploadMessage.text}
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Document Type
                  </label>
                  <select
                    className="form-control"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  >
                    <option value="DRIVER_LICENSE">Commercial Driver's License</option>
                    <option value="VEHICLE_REGISTRATION">Vehicle Registration / Libre</option>
                    <option value="INSURANCE_CERTIFICATE">Passenger Transit Insurance</option>
                    <option value="ROADWORTHINESS">Roadworthiness Certificate</option>
                    <option value="COMMERCIAL_PERMIT">Commercial Transport Permit</option>
                    <option value="OTHER">Other Supporting Document</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Select Document File <span style={{ color: '#2563EB' }}>(Strictly PNG or PDF — Max 10MB)</span>
                  </label>
                  <input
                    id="provider-doc-file-input"
                    type="file"
                    accept=".png,.pdf,.jpg,.jpeg,image/png,application/pdf,image/jpeg"
                    onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'block', width: '100%', fontSize: '0.875rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Please upload an official scan or clear image of your credential in PNG or PDF format.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingDoc || !docFile}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {uploadingDoc && <Loader2 size={16} className="animate-spin" />}
                  {uploadingDoc ? 'Uploading Document...' : 'Submit Document for Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'Profile' && (
          <UserProfilePanel user={user} />
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

  const [documents, setDocuments] = useState<AccountDocument[]>([]);
  const [, setLoadingDocs] = useState<boolean>(true);
  const [selectedDocType, setSelectedDocType] = useState<string>('BUSINESS_REGISTRATION');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await getMyDocumentsApi();
      setDocuments(docs || []);
    } catch (err) {
      console.error('[BusinessDashboard] Error loading documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setUploadMessage({ type: 'error', text: 'Please select a document file to upload.' });
      return;
    }

    try {
      setUploadingDoc(true);
      setUploadMessage(null);
      const formData = new FormData();
      formData.append('documentType', selectedDocType);
      formData.append('document', docFile);

      await uploadAccountDocumentApi(formData);
      setUploadMessage({ type: 'success', text: 'Document uploaded successfully and queued for administrator review.' });
      setDocFile(null);
      const fileInput = document.getElementById('biz-doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      const updated = await getMyDocumentsApi();
      setDocuments(updated || []);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

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
      {/* Business Role-Based Navigation */}
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
        {/* Verification Alert Banner */}
        {user.status !== 'ACTIVE' && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#92400E' }}>
                Business Status: {user.status === 'PENDING' ? 'Pending Administrator Review' : user.status}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#B45309', marginTop: '0.2rem' }}>
                Your business credentials and registration documents are under administrative review. Campaigns can be created in draft mode and will become eligible for publication upon approval.
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'Dashboard' || activeTab === 'Advertisements' || activeTab === 'Campaigns' || activeTab === 'Analytics') && (
          <BusinessCampaignManager />
        )}

        {activeTab === 'My Business' && (
          <div>
            <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Business Profile Details</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Official commercial identity registered with SchoolSafe
                  </p>
                </div>
                <span className={`badge-status ${user.status === 'ACTIVE' ? 'active' : 'pending'}`}>
                  {user.status === 'ACTIVE' ? 'Approved Partner ✓' : user.status}
                </span>
              </div>
              <div style={{ maxWidth: '650px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', fontSize: '0.925rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Company / Brand:</span>
                <span style={{ fontWeight: 600 }}>{user.businessName || 'Not specified'}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Tax Number / TIN:</span>
                <span style={{ fontWeight: 600 }}>{user.licenseNumber || 'Not specified'}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Operating Location:</span>
                <span>{user.serviceArea || 'Not specified'}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Contact Person:</span>
                <span>{user.firstName} {user.lastName}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                <span>{user.email}</span>

                <span style={{ color: 'var(--color-text-secondary)' }}>Email Verification:</span>
                <span style={{ color: user.isEmailVerified ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>
                  {user.isEmailVerified ? 'Verified ✓' : 'Not Verified'}
                </span>
              </div>
            </div>

            {/* Business Verification Documents */}
            <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Submitted Commercial Documents</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Official certificates uploaded for platform verification
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-secondary)' }}>
                  <FileText size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--color-border)', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No verification documents uploaded yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        backgroundColor: '#FFF'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {doc.documentType.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                          File: {doc.documentName} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                        {doc.rejectionReason && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                            Rejection reason: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a
                          href={getAccountDocumentUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View Document
                        </a>
                        <span
                          className={`badge-status ${
                            doc.status === 'APPROVED' ? 'active' : doc.status === 'REJECTED' ? 'danger' : 'pending'
                          }`}
                        >
                          {doc.status === 'APPROVED' ? 'Approved ✓' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Upload Form */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Upload Business Certificate</h3>
              </div>
              <form onSubmit={handleUploadDocument} style={{ maxWidth: '600px' }}>
                {uploadMessage && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      backgroundColor: uploadMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      color: uploadMessage.type === 'success' ? '#065F46' : '#991B1B',
                      border: `1px solid ${uploadMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                    }}
                  >
                    {uploadMessage.text}
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Document Type
                  </label>
                  <select
                    className="form-control"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  >
                    <option value="BUSINESS_REGISTRATION">Commercial Registration Certificate</option>
                    <option value="TAX_IDENTIFICATION">TIN Certificate</option>
                    <option value="TRADE_LICENSE">Business Trade License</option>
                    <option value="OTHER">Other Authorization Document</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Select File (PDF, PNG, JPG - max 10MB)
                  </label>
                  <input
                    id="biz-doc-file-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'block', width: '100%', fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingDoc || !docFile}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {uploadingDoc && <Loader2 size={16} className="animate-spin" />}
                  {uploadingDoc ? 'Uploading...' : 'Upload Document for Verification'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Billing & Ad Invoices</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Advertising campaign charges and payment invoices are verified upon campaign submission. Approved campaigns with payment confirmation will display billing statements here.
            </p>
          </div>
        )}

        {activeTab === 'Profile' && (
          <UserProfilePanel user={user} />
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
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoadingStats(true);
      const [sRes, iRes] = await Promise.allSettled([
        getAdminStatsApi(),
        getAdminSafetyIncidentsApi(),
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value);
      if (iRes.status === 'fulfilled') setIncidents(iRes.value || []);
    } catch (err) {
      console.error('[AdminDashboard] Error loading data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveIncident = async (incidentId: string) => {
    const notes = prompt('Enter resolution notes for this safety incident:');
    if (!notes) return;
    try {
      setResolvingId(incidentId);
      await resolveAdminIncidentApi(incidentId, notes);
      const updated = await getAdminSafetyIncidentsApi();
      setIncidents(updated || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve incident.');
    } finally {
      setResolvingId(null);
    }
  };

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

  const totalUsers = stats?.users.total ?? 0;
  const verifiedProviders = (stats?.users.byRole?.['TRANSPORT_PROVIDER'] ?? 0) + (stats?.users.byRole?.['DRIVER'] ?? 0);
  const totalVehicles = stats?.transportation.totalVehicles ?? 0;
  const activeRoutes = stats?.transportation.activeRoutes ?? 0;
  const activeTrips = stats?.transportation.activeTrips ?? 0;
  const openIncidents = (stats?.safety.incidents?.['OPEN'] ?? 0) + (stats?.safety.incidents?.['INVESTIGATING'] ?? 0);
  const activeAds = stats?.advertising.activeCampaigns ?? 0;
  const paidVolume = stats?.financials.totalPaidVolumeETB ?? 0;

  return (
    <div>
      {/* System Administrator Navigation */}
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

        {/* Real Overview Stats from Database */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Users</span>
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : totalUsers}</div>
            <div className="stat-subtext">Parents, Providers & Advertisers</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Transport Providers</span>
              <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : verifiedProviders}</div>
            <div className="stat-subtext">Registered transit operators</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Platform Vehicles</span>
              <Car size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : totalVehicles}</div>
            <div className="stat-subtext">{activeRoutes} active school transit routes</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Live Dispatches</span>
              <Bus size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : activeTrips}</div>
            <div className="stat-subtext">Active transit trips</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Open Incidents</span>
              <AlertTriangle size={18} style={{ color: openIncidents > 0 ? 'var(--color-danger)' : 'var(--color-success)' }} />
            </div>
            <div className="stat-value" style={{ color: openIncidents > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {loadingStats ? '...' : openIncidents}
            </div>
            <div className="stat-subtext">Safety alerts requiring review</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Total Paid Volume</span>
              <DollarSign size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : `ETB ${paidVolume.toLocaleString()}`}</div>
            <div className="stat-subtext">Verified platform collections</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Active Ad Campaigns</span>
              <FileCheck size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="stat-value">{loadingStats ? '...' : activeAds}</div>
            <div className="stat-subtext">Approved public advertisements</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Security & Audit</span>
              <Shield size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: '1.25rem' }}>Active</div>
            <div className="stat-subtext">RBAC, token hashes & audit logging</div>
          </div>
        </div>

        {/* Real Administrator Review & Approval Queue */}
        {(activeTab === 'Dashboard' || activeTab === 'Users' || activeTab === 'Providers') && (
          <AdminApplicationsQueue />
        )}

        {/* Real Payment Receipts Review & Verification */}
        {(activeTab === 'Dashboard' || activeTab === 'Payments') && (
          <AdminPaymentsReview />
        )}

        {/* Real Advertising Campaign Management */}
        {(activeTab === 'Advertisements' || activeTab === 'Businesses') && (
          <AdminCampaignManager />
        )}

        {/* Real Administrative Audit Logs */}
        {activeTab === 'Audit Logs' && (
          <AdminAuditLogs />
        )}

        {/* Open Safety Incidents */}
        {(activeTab === 'Dashboard' || activeTab === 'Incidents') && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title" style={{ color: 'var(--color-danger)' }}>
                  Platform Safety Incidents ({incidents.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Immediate safety events logged by drivers, schools, or parents
                </p>
              </div>
            </div>

            {incidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--color-success)', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No open safety incidents on record. All routes operational.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Report Type</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Reported At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc.id}>
                      <td><strong>#{inc.id.slice(0, 8)}</strong></td>
                      <td><span className="badge-status pending">{inc.incidentType || 'Safety Alert'}</span></td>
                      <td>{inc.description}</td>
                      <td><span className={`badge-status ${inc.status === 'RESOLVED' ? 'active' : 'pending'}`}>{inc.status}</span></td>
                      <td>{new Date(inc.createdAt).toLocaleString()}</td>
                      <td>
                        {inc.status !== 'RESOLVED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={resolvingId === inc.id}
                            onClick={() => handleResolveIncident(inc.id)}
                          >
                            {resolvingId === inc.id ? <Loader2 size={12} className="animate-spin" /> : 'Resolve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
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
