import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  Car,
  MapPin,
  Bus,
  AlertTriangle,
  Megaphone,
  CreditCard,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  History,
} from 'lucide-react';
import {
  getAdminStatsApi,
  listAuditLogsApi,
  AdminPlatformStats,
  AuditLog,
} from '../../services/api';
import { AdminRoutePath } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface AdminOverviewPageProps {
  onNavigate: (path: AdminRoutePath) => void;
  onStatsLoaded?: (stats: AdminPlatformStats) => void;
}

export const AdminOverviewPage: FC<AdminOverviewPageProps> = ({
  onNavigate,
  onStatsLoaded,
}) => {
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData] = await Promise.all([
        getAdminStatsApi(),
        listAuditLogsApi({ limit: 8 }),
      ]);
      setStats(statsData);
      setRecentLogs(logsData || []);
      setLastRefreshedAt(new Date());
      if (onStatsLoaded) {
        onStatsLoaded(statsData);
      }
    } catch (err: any) {
      console.error('[AdminOverview] Error loading data:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to retrieve system administrator metrics from the database. Please verify backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Safe metric resolution derived strictly from backend PostgreSQL response
  const metrics = stats?.metrics;
  const pending = stats?.pendingApprovals;

  const totalUsers = metrics?.totalUsers ?? stats?.users?.total ?? 0;
  const parentsCount = metrics?.parents ?? stats?.users?.byRole?.['PARENT'] ?? 0;
  const pendingProviders = metrics?.pendingProviders ?? pending?.providers ?? 0;
  const approvedProviders = metrics?.approvedProviders ?? stats?.users?.byRole?.['TRANSPORT_PROVIDER'] ?? 0;
  const pendingVehicles = metrics?.pendingVehicles ?? pending?.vehicles ?? 0;
  const approvedVehicles = metrics?.approvedVehicles ?? 0;
  const totalVehicles = metrics?.totalVehicles ?? stats?.transportation?.totalVehicles ?? 0;
  const activeRoutes = metrics?.activeRoutes ?? stats?.transportation?.activeRoutes ?? 0;
  const activeTrips = metrics?.activeTrips ?? stats?.transportation?.activeTrips ?? 0;
  const openIncidents = metrics?.openIncidents ?? (stats?.safety?.incidents?.['OPEN'] || 0) + (stats?.safety?.incidents?.['UNDER_REVIEW'] || 0);
  const pendingPayments = metrics?.pendingPayments ?? pending?.payments ?? 0;
  const pendingCampaigns = metrics?.pendingCampaigns ?? pending?.campaigns ?? 0;
  const activeCampaigns = metrics?.activeCampaigns ?? stats?.advertising?.activeCampaigns ?? 0;
  const pendingBusinesses = metrics?.pendingBusinesses ?? pending?.businesses ?? 0;
  const totalPaidVolume = metrics?.totalPaidVolumeETB ?? stats?.financials?.totalPaidVolumeETB ?? 0;

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
          Loading Platform Metrics...
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Aggregating platform users, approval queues, fleet verifications, and financial ledger
        </p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-card" style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <AlertCircle size={24} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: '#991B1B', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>
              Database Connection or Query Error
            </h3>
            <p style={{ color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={fetchOverviewData}>
              <RefreshCw size={14} /> Retry Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Overview Refresh Sub-Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          <Clock size={15} />
          <span>Last updated: {lastRefreshedAt.toLocaleTimeString()}</span>
        </div>
        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={fetchOverviewData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* PROMINENT PENDING APPROVALS QUEUE (TASK 2) */}
      <section className="pending-approvals-card">
        <div className="pending-approvals-header">
          <div className="pending-approvals-title">
            <AlertTriangle size={22} style={{ color: '#FCD34D' }} />
            <span>Pending Approvals & Verification Queue</span>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
            }}
          >
            {pending?.total ?? (pendingProviders + pendingVehicles + pendingBusinesses + pendingCampaigns + pendingPayments)} Awaiting Review
          </span>
        </div>

        <div className="pending-items-grid">
          {/* 1. Provider Applications */}
          <div className="pending-item-box">
            <div className="pending-item-top">
              <span className="pending-item-count">{pendingProviders}</span>
              <UserCheck size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div className="pending-item-label">Provider & Driver Applications</div>
            <button
              className="pending-item-btn"
              onClick={() => onNavigate('/admin/providers')}
            >
              <span>Review Providers</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 2. Vehicle Verifications */}
          <div className="pending-item-box">
            <div className="pending-item-top">
              <span className="pending-item-count">{pendingVehicles}</span>
              <Car size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div className="pending-item-label">Vehicles Awaiting Verification</div>
            <button
              className="pending-item-btn"
              onClick={() => onNavigate('/admin/vehicles')}
            >
              <span>Review Vehicles</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 3. Business Applications */}
          <div className="pending-item-box">
            <div className="pending-item-top">
              <span className="pending-item-count">{pendingBusinesses}</span>
              <Building2 size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div className="pending-item-label">Business Account Applications</div>
            <button
              className="pending-item-btn"
              onClick={() => onNavigate('/admin/businesses')}
            >
              <span>Review Businesses</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 4. Advertisement Campaigns */}
          <div className="pending-item-box">
            <div className="pending-item-top">
              <span className="pending-item-count">{pendingCampaigns}</span>
              <Megaphone size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div className="pending-item-label">Ad Campaigns Pending Review</div>
            <button
              className="pending-item-btn"
              onClick={() => onNavigate('/admin/advertisements')}
            >
              <span>Review Campaigns</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 5. Payment Receipts */}
          <div className="pending-item-box">
            <div className="pending-item-top">
              <span className="pending-item-count">{pendingPayments}</span>
              <CreditCard size={20} style={{ color: '#93C5FD' }} />
            </div>
            <div className="pending-item-label">Payment Receipts Awaiting Review</div>
            <button
              className="pending-item-btn"
              onClick={() => onNavigate('/admin/payments')}
            >
              <span>Review Receipts</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM SUMMARY METRIC CARDS (TASK 2) */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        Platform Summary Metrics
      </h2>

      <div className="admin-stats-grid">
        {/* Total Registered Users */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Total Users</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-blue">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{totalUsers}</div>
          <div className="admin-stat-subtext">Registered across all roles</div>
        </div>

        {/* Parents & Guardians */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Parents & Guardians</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-purple">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{parentsCount}</div>
          <div className="admin-stat-subtext">Child accounts & route bookings</div>
        </div>

        {/* Approved Transport Providers */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Approved Providers</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-green">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{approvedProviders}</div>
          <div className="admin-stat-subtext">{pendingProviders} pending review</div>
        </div>

        {/* Approved & Eligible Vehicles */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Eligible Vehicles</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-green">
              <Car size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{approvedVehicles}</div>
          <div className="admin-stat-subtext">{totalVehicles} registered in fleet</div>
        </div>

        {/* Active Routes */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Active Routes</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-blue">
              <MapPin size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{activeRoutes}</div>
          <div className="admin-stat-subtext">Published school transit corridors</div>
        </div>

        {/* Active Trips In Progress */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Active Trips</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-amber">
              <Bus size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{activeTrips}</div>
          <div className="admin-stat-subtext">Live transit dispatches</div>
        </div>

        {/* Open Safety Incidents */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Open Incidents</div>
            <div className={`admin-stat-icon-wrapper ${openIncidents > 0 ? 'admin-stat-icon-red' : 'admin-stat-icon-green'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="admin-stat-value" style={{ color: openIncidents > 0 ? '#DC2626' : '#059669' }}>
            {openIncidents}
          </div>
          <div className="admin-stat-subtext">
            {openIncidents === 0 ? 'All routes operational' : 'Safety desk review required'}
          </div>
        </div>

        {/* Active Advertisement Campaigns */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <div className="admin-stat-label">Active Campaigns</div>
            <div className="admin-stat-icon-wrapper admin-stat-icon-purple">
              <Megaphone size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{activeCampaigns}</div>
          <div className="admin-stat-subtext">{pendingCampaigns} awaiting ad review</div>
        </div>
      </div>

      {/* PLATFORM OPERATIONS & FINANCIALS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Verified Ledger Collections */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <DollarSign size={18} style={{ color: '#059669' }} />
                Platform Ledger Collections
              </h3>
              <p className="admin-card-desc">Verified and approved parent transit payments</p>
            </div>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onNavigate('/admin/payments')}>
              View Ledger
            </button>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>
              ETB {totalPaidVolume.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.4rem' }}>
              Confirmed transactions processed across SchoolSafe transportation agreements.
            </p>
          </div>
        </div>

        {/* Security & Audit Overview */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <ShieldCheck size={18} style={{ color: '#2563EB' }} />
                Security & Audit Trail
              </h3>
              <p className="admin-card-desc">Immutable administrative action logging</p>
            </div>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onNavigate('/admin/audit-logs')}>
              Full Audit Logs
            </button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#059669', fontWeight: 700, marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Tamper-evident audit logging is active</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              All administrative approvals, rejections, status toggles, and document reviews are permanently captured with timestamp and administrator identity.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ADMINISTRATIVE ACTIVITY FEED (TASK 2) */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">
              <History size={18} style={{ color: '#2563EB' }} />
              Recent Administrative Activity
            </h3>
            <p className="admin-card-desc">Chronological log of recent approvals, rejections, and reviews</p>
          </div>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onNavigate('/admin/audit-logs')}>
            View All ({recentLogs.length})
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <History size={26} />
            </div>
            <h4>No Administrative Actions Recorded Yet</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Actions performed by administrators (such as approvals, rejections, and status updates) will appear in this audit log.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Administrator</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Details & Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong>
                        {log.admin?.firstName ? `${log.admin.firstName} ${log.admin.lastName}` : 'System Admin'}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{log.admin?.email}</div>
                    </td>
                    <td>
                      <StatusBadge status={log.action} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>
                        {log.entityType}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.details || <span style={{ color: '#94A3B8' }}>No extra notes recorded</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
