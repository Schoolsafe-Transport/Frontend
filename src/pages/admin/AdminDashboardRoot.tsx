import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  AdminLayout,
  AdminRoutePath,
} from '../../components/admin/AdminLayout';
import { AdminOverviewPage } from './AdminOverviewPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminProvidersPage } from './AdminProvidersPage';
import { AdminVehiclesPage } from './AdminVehiclesPage';
import { AdminTripsRoutesPage } from './AdminTripsRoutesPage';
import { AdminIncidentsPage } from './AdminIncidentsPage';
import { AdminBusinessesPage } from './AdminBusinessesPage';
import { AdminAdvertisementsPage } from './AdminAdvertisementsPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { getAdminStatsApi, AdminPlatformStats } from '../../services/api';

const routeConfig: Record<
  AdminRoutePath,
  { title: string; subtitle: string }
> = {
  '/admin': {
    title: 'Platform Overview',
    subtitle: 'High-level platform metrics, pending approval queues, and recent activity',
  },
  '/admin/users': {
    title: 'User Management',
    subtitle: 'System user accounts, role-based access, and lifecycle statuses',
  },
  '/admin/providers': {
    title: 'Provider Applications & Approvals',
    subtitle: 'Transport operator registrations, driver licenses, and verification credentials',
  },
  '/admin/vehicles': {
    title: 'Vehicle Fleet Verification',
    subtitle: 'Fleet asset inspection, roadworthiness documents, and transit eligibility',
  },
  '/admin/trips': {
    title: 'Trips & Route Corridors',
    subtitle: 'Real-time monitoring of school transit corridors and dispatch operations',
  },
  '/admin/incidents': {
    title: 'Safety Incident Command',
    subtitle: 'Immediate safety alerts, route deviations, and administrative resolutions',
  },
  '/admin/businesses': {
    title: 'Business Accounts',
    subtitle: 'Corporate advertiser accounts, commercial verification, and tax credentials',
  },
  '/admin/advertisements': {
    title: 'Ad Campaign Approvals',
    subtitle: 'Review commercial creative banners, destination targets, and active placements',
  },
  '/admin/payments': {
    title: 'Payment Reviews & Ledger',
    subtitle: 'Verify uploaded bank transfer receipts and approve student transit fees',
  },
  '/admin/audit-logs': {
    title: 'Security & Audit Logs',
    subtitle: 'Tamper-evident chronological audit trail of all administrative decisions',
  },
};

export const AdminDashboardRoot: FC = () => {
  // Resolve initial admin route from URL pathname
  const resolveCurrentPath = (): AdminRoutePath => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/admin';
      if (path in routeConfig) {
        return path as AdminRoutePath;
      }
      if (path.startsWith('/admin')) {
        // match closest
        const found = (Object.keys(routeConfig) as AdminRoutePath[]).find((k) =>
          path === k || path.startsWith(k + '/')
        );
        if (found) return found;
      }
    }
    return '/admin';
  };

  const [currentPath, setCurrentPath] = useState<AdminRoutePath>(resolveCurrentPath);
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatsCounts = async () => {
    try {
      setIsRefreshing(true);
      const data = await getAdminStatsApi();
      setStats(data);
    } catch (err) {
      console.error('[AdminDashboardRoot] Error fetching stats counts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatsCounts();
  }, []);

  // Listen to browser popstate (Back/Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const matched = resolveCurrentPath();
      setCurrentPath(matched);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate handler updating browser URL history
  const handleNavigate = (path: AdminRoutePath) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({ adminPath: path }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive badge numbers from real DB stats
  const pendingApprovals = stats?.pendingApprovals;
  const metrics = stats?.metrics;

  const pendingCounts = {
    providers: pendingApprovals?.providers ?? metrics?.pendingProviders ?? 0,
    vehicles: pendingApprovals?.vehicles ?? metrics?.pendingVehicles ?? 0,
    businesses: pendingApprovals?.businesses ?? metrics?.pendingBusinesses ?? 0,
    campaigns: pendingApprovals?.campaigns ?? metrics?.pendingCampaigns ?? 0,
    payments: pendingApprovals?.payments ?? metrics?.pendingPayments ?? 0,
    incidents: metrics?.openIncidents ?? 0,
  };

  const pageMeta = routeConfig[currentPath] || routeConfig['/admin'];

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      pendingCounts={pendingCounts}
      pageTitle={pageMeta.title}
      pageSubtitle={pageMeta.subtitle}
      onRefresh={fetchStatsCounts}
      isRefreshing={isRefreshing}
    >
      {currentPath === '/admin' && (
        <AdminOverviewPage
          onNavigate={handleNavigate}
          onStatsLoaded={(loaded) => setStats(loaded)}
        />
      )}
      {currentPath === '/admin/users' && <AdminUsersPage />}
      {currentPath === '/admin/providers' && (
        <AdminProvidersPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/vehicles' && (
        <AdminVehiclesPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/trips' && <AdminTripsRoutesPage />}
      {currentPath === '/admin/incidents' && (
        <AdminIncidentsPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/businesses' && (
        <AdminBusinessesPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/advertisements' && (
        <AdminAdvertisementsPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/payments' && (
        <AdminPaymentsPage onRefreshStats={fetchStatsCounts} />
      )}
      {currentPath === '/admin/audit-logs' && <AdminAuditLogsPage />}
    </AdminLayout>
  );
};
