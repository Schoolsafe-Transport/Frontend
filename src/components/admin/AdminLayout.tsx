import type { FC } from 'react';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Car,
  MapPin,
  AlertTriangle,
  Building2,
  Megaphone,
  CreditCard,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationsPanel } from '../dashboard/NotificationsPanel';

export type AdminRoutePath =
  | '/admin'
  | '/admin/users'
  | '/admin/providers'
  | '/admin/vehicles'
  | '/admin/trips'
  | '/admin/incidents'
  | '/admin/businesses'
  | '/admin/advertisements'
  | '/admin/payments'
  | '/admin/audit-logs';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: AdminRoutePath) => void;
  pendingCounts?: {
    providers?: number;
    vehicles?: number;
    businesses?: number;
    campaigns?: number;
    payments?: number;
    incidents?: number;
  };
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminLayout: FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  pendingCounts = {},
  children,
  pageTitle,
  pageSubtitle,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems: Array<{
    path: AdminRoutePath;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeType?: 'warning' | 'danger';
    category?: string;
  }> = [
    {
      path: '/admin',
      label: 'Overview',
      icon: <LayoutDashboard size={18} />,
    },
    {
      category: 'User & Asset Management',
      path: '/admin/users',
      label: 'User Management',
      icon: <Users size={18} />,
    },
    {
      path: '/admin/providers',
      label: 'Provider Approvals',
      icon: <UserCheck size={18} />,
      badgeCount: pendingCounts.providers,
      badgeType: 'warning',
    },
    {
      path: '/admin/vehicles',
      label: 'Vehicle Fleet',
      icon: <Car size={18} />,
      badgeCount: pendingCounts.vehicles,
      badgeType: 'warning',
    },
    {
      path: '/admin/trips',
      label: 'Trips & Routes',
      icon: <MapPin size={18} />,
    },
    {
      path: '/admin/incidents',
      label: 'Safety Incidents',
      icon: <AlertTriangle size={18} />,
      badgeCount: pendingCounts.incidents,
      badgeType: 'danger',
    },
    {
      category: 'Commerce & Operations',
      path: '/admin/businesses',
      label: 'Business Accounts',
      icon: <Building2 size={18} />,
      badgeCount: pendingCounts.businesses,
      badgeType: 'warning',
    },
    {
      path: '/admin/advertisements',
      label: 'Ad Campaigns',
      icon: <Megaphone size={18} />,
      badgeCount: pendingCounts.campaigns,
      badgeType: 'warning',
    },
    {
      path: '/admin/payments',
      label: 'Payment Reviews',
      icon: <CreditCard size={18} />,
      badgeCount: pendingCounts.payments,
      badgeType: 'warning',
    },
    {
      category: 'Security & Governance',
      path: '/admin/audit-logs',
      label: 'Security & Audit Logs',
      icon: <Shield size={18} />,
    },
  ];

  const handleNavClick = (path: AdminRoutePath) => {
    onNavigate(path);
    setMobileSidebarOpen(false);
  };

  const totalPendingBadges =
    (pendingCounts.providers || 0) +
    (pendingCounts.vehicles || 0) +
    (pendingCounts.businesses || 0) +
    (pendingCounts.campaigns || 0) +
    (pendingCounts.payments || 0) +
    (pendingCounts.incidents || 0);

  return (
    <div className="admin-wrapper">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <img src="/logo-shield.png" alt="SchoolSafe Logo" />
          <div className="admin-brand-title">
            <span>SchoolSafe</span>
            <span className="admin-brand-badge">ADMIN</span>
          </div>
          <button
            className="admin-mobile-toggle"
            style={{ marginLeft: 'auto', color: '#94A3B8' }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <div key={item.path} style={{ display: 'contents' }}>
              {item.category && (
                <div className="admin-nav-category">{item.category}</div>
              )}
              <button
                type="button"
                className={`admin-nav-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                title={item.label}
              >
                <div className="admin-nav-item-content">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badgeCount && item.badgeCount > 0) && (
                  <span
                    className={`admin-nav-badge ${item.badgeType === 'danger' ? 'danger' : ''}`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Admin Profile */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.firstName?.[0] || 'A'}
              {user?.lastName?.[0] || 'S'}
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="admin-user-role">
                {user?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Platform Administrator'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={logout}
            title="Sign Out of Admin Console"
            style={{
              padding: '0.45rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#CBD5E1',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="admin-header-title">{pageTitle}</h1>
              {pageSubtitle && (
                <div className="admin-header-subtitle">{pageSubtitle}</div>
              )}
            </div>
          </div>

          <div className="admin-header-actions">
            {onRefresh && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh platform data"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden-sm">Refresh</span>
              </button>
            )}

            {/* Notifications Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Platform Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={16} />
                {totalPendingBadges > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      borderRadius: '9999px',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalPendingBadges > 9 ? '9+' : totalPendingBadges}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Sign Out */}
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden-sm">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Notifications Slideover / Panel */}
        {showNotifications && (
          <div
            style={{
              position: 'fixed',
              top: '72px',
              right: '20px',
              zIndex: 999,
              width: '420px',
              maxWidth: '92vw',
            }}
          >
            <div
              className="admin-card"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
                border: '1px solid #CBD5E1',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '0.5rem',
                }}
              >
                <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                  Platform Notifications
                </strong>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <NotificationsPanel user={user} />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
