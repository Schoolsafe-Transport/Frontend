import { useState, useEffect, FC } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  CreditCard,
  Bus,
  FileText,
  Clock,
} from 'lucide-react';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../../services/api';
import { getSocket } from '../../services/socket';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationsPanel: FC<{ user: any }> = ({ user }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi(100);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (_err) {
      // Fallback or error handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for live socket notifications
    try {
      const socket = getSocket();
      if (!socket.connected) {
        socket.connect();
      }

      const token = localStorage.getItem('schoolsafe_access_token');
      socket.emit('join_user', { userId: user.id, token });

      const handleLiveNotification = () => {
        setActionMessage('New live update received!');
        setTimeout(() => setActionMessage(null), 3000);
        fetchNotifications();
      };

      socket.on('notification', handleLiveNotification);
      socket.on(`notify:${user.id}`, handleLiveNotification);
      socket.on('student:boarding_event', handleLiveNotification);

      return () => {
        socket.off('notification', handleLiveNotification);
        socket.off(`notify:${user.id}`, handleLiveNotification);
        socket.off('student:boarding_event', handleLiveNotification);
      };
    } catch (_err) {
      // Silent catch
    }
  }, [user.id]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_err) {
      // Catch
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_err) {
      // Catch
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'STUDENT_BOARDED':
      case 'STUDENT_DROPPED_OFF':
        return <Bus size={18} style={{ color: 'var(--color-success)' }} />;
      case 'PAYMENT_SUCCESSFUL':
        return <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />;
      case 'SAFETY_ALERT':
      case 'INCIDENT_REPORTED':
        return <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />;
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_SUBMITTED':
        return <FileText size={18} style={{ color: 'var(--color-accent)' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'ALL' ? true : !n.isRead
  );

  return (
    <div className="panel-card">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Notifications Feed
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-danger)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Real-time platform activity, student boarding updates, and verification alerts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setFilter('ALL')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: 'none',
                backgroundColor: filter === 'ALL' ? 'var(--color-primary)' : '#FFF',
                color: filter === 'ALL' ? '#FFF' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: 'none',
                backgroundColor: filter === 'UNREAD' ? 'var(--color-primary)' : '#FFF',
                color: filter === 'UNREAD' ? '#FFF' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Bell size={40} style={{ color: 'var(--color-border)', margin: '0 auto 1rem', display: 'block' }} />
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.25rem' }}>No notifications found</h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            {filter === 'UNREAD' ? "You're all caught up! No unread notifications." : 'You do not have any notifications yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: notif.isRead ? '#FFFFFF' : '#F0F9FF',
                cursor: notif.isRead ? 'default' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: notif.isRead ? '#F1F5F9' : '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-primary)' }}>
                    {notif.title}
                  </div>
                  {!notif.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {notif.message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <Clock size={12} />
                  <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
