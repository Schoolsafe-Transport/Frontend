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
  resendVerificationEmailApi,
  getStudentsApi,
  createStudentApi,
  getMyAgreementsApi,
  getStudentTripStatusApi,
  StudentTripStatusData,
} from '../services/api';
import { AdminApplicationsQueue } from '../components/dashboard/AdminApplicationsQueue';
import { AdminPaymentsReview } from '../components/dashboard/AdminPaymentsReview';
import { BusinessCampaignManager } from '../components/dashboard/BusinessCampaignManager';
import { AdminCampaignManager } from '../components/dashboard/AdminCampaignManager';

interface DashboardViewProps {
  onOpenVerifyFayda?: () => void;
}

export const DashboardView: FC<DashboardViewProps> = ({ onOpenVerifyFayda }) => {
  const { user, logout } = useAuth();
  const [showFaydaModal, setShowFaydaModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendNotice, setResendNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      setResendNotice(null);
      const res = await resendVerificationEmailApi(user.email);
      if (res.delivered === false || res.success === false) {
        setResendNotice({
          type: 'error',
          text: res.message || 'Could not deliver verification email. Outbound SMTP delivery failed.',
        });
      } else {
        setResendNotice({
          type: 'success',
          text: res.message || 'A fresh email verification link has been dispatched to your inbox.',
        });
      }
    } catch (err: any) {
      setResendNotice({
        type: 'error',
        text: err.response?.data?.message || 'Could not send verification email. Please wait a moment and try again.',
      });
    } finally {
      setResendingEmail(false);
    }
  };

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

                {/* Fayda Identity Verification Status Badge */}
                {user.isVerified ? (
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
                    <ShieldCheck size={12} /> Fayda Verified{user.faydaId ? ` (${user.faydaId})` : ''}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowFaydaModal(true)}
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
                      cursor: 'pointer',
                    }}
                  >
                    <ShieldCheck size={12} /> Verify Fayda ID
                  </button>
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

      {/* Unverified Email Warning Banner */}
      {!user.isEmailVerified && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            borderBottom: '1px solid #FCD34D',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: '#D97706', shrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}>
              <strong>Email Verification Required:</strong> Your email address ({user.email}) has not been confirmed.
              Certain actions like booking student transportation, publishing routes, or creating campaigns require verified email.
            </span>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resendingEmail}
            className="btn btn-secondary btn-sm"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#F59E0B',
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            {resendingEmail ? 'Sending...' : 'Resend Verification Link'}
          </button>
        </div>
      )}

      {/* Resend Notice Feedback */}
      {resendNotice && (
        <div
          style={{
            backgroundColor: resendNotice.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            borderBottom: `1px solid ${resendNotice.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            padding: '0.6rem 1.5rem',
            fontSize: '0.8125rem',
            color: resendNotice.type === 'success' ? '#065F46' : '#991B1B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{resendNotice.text}</span>
          <button
            onClick={() => setResendNotice(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

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
}> = ({ user, onOpenFaydaModal, onOpenVerifyPage }) => {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'My Children' | 'Find Transportation' | 'My Requests' | 'My Transportation' | 'Trips' | 'Notifications' | 'Payments' | 'Safety' | 'Profile'
  >('Dashboard');

  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [agreements, setAgreements] = useState<any[]>([]);
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

      // Fetch active agreements and student trip statuses
      try {
        const agrs = await getMyAgreementsApi();
        setAgreements(agrs || []);
      } catch {}

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
        {!user.isVerified && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FDE68A',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
                  Fayda Identity Verification Required for Seat Requests
                </div>
                <div style={{ fontSize: '0.825rem', color: '#B45309' }}>
                  Your parent account is unverified. You can explore available routes, but verified identity is required to request transportation for children.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onOpenVerifyPage && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenVerifyPage}
                  style={{ gap: '0.35rem', borderColor: '#B45309', color: '#92400E' }}
                >
                  Verification Guide
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenFaydaModal}
                style={{ gap: '0.35rem', backgroundColor: '#B45309', borderColor: '#B45309', color: '#FFFFFF' }}
              >
                <ShieldCheck size={14} /> Verify Fayda ID Now
              </button>
            </div>
          </div>
        )}

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
                <div className="stat-value">07:45 AM</div>
                <div className="stat-subtext">Estimated drop-off at school (On Time)</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Monthly Payment</span>
                  <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                  Current
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
            onOpenFaydaModal={onOpenFaydaModal}
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
              <h3 className="panel-title">Payment & Transportation Fees</h3>
              <button className="btn btn-secondary btn-sm">Download Statements</button>
            </div>
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Current Billing Cycle:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.25rem 0' }}>$150.00 / Month</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                {students.length > 0
                  ? `Active Account • ${students.length} Child${students.length > 1 ? 'ren' : ''} (${students.map((s) => s.firstName).join(' & ')})`
                  : 'No registered children'}
              </div>
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
                {tab === 'Passengers' && <Users size={16} />}
                {tab === 'Trips' && <Bus size={16} />}
                {tab === 'Notifications' && <Bell size={16} />}
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
          <ProviderFleetPanel user={user} />
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
        {(activeTab === 'Dashboard' || activeTab === 'Advertisements' || activeTab === 'Campaigns' || activeTab === 'Analytics') && (
          <BusinessCampaignManager />
        )}

        {activeTab === 'My Business' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Business Profile & Verification</h3>
            </div>
            <div style={{ maxWidth: '600px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', fontSize: '0.925rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account Name:</span>
              <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
              <span>{user.email}</span>

              <span style={{ color: 'var(--color-text-secondary)' }}>Email Verified:</span>
              <span style={{ color: user.isEmailVerified ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>
                {user.isEmailVerified ? 'Verified ✓' : 'Not Verified'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Billing & Ad Invoices</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Advertising payments are currently in development simulation mode. When Telebirr or CBE Birr integration is activated, invoice statements and payment receipt history will appear here.
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
