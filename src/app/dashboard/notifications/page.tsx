'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotifications, markAllNotificationsRead, markNotificationRead, AppNotification } from '@/lib/notificationStorage';
import styles from './notifications.module.css';

const ICON_MAP: Record<string, string> = { new_course: '📚', revision: '🔁', career: '🎯', achievement: '🏆', assessment: '📝' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifs(getNotifications());
    
    // Auto mark all notifications as read when viewing the notifications page!
    const timer = setTimeout(() => {
      const updated = markAllNotificationsRead();
      setNotifs(updated);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const markAll = () => {
    const updated = markAllNotificationsRead();
    setNotifs(updated);
  };

  const markOne = (id: string) => {
    const updated = markNotificationRead(id);
    setNotifs(updated);
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🔔 Notifications & Alerts</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Official system notifications — intelligent alerts for baseline intake, learning pathways, and career milestones.
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAll}>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifs.map(n => (
          <div 
            key={n.id} 
            className={`card ${styles.notifCard} ${!n.read ? styles.unread : ''}`} 
            onClick={() => markOne(n.id)}
            style={{ cursor: n.actionUrl ? 'pointer' : 'default' }}
          >
            <div className={styles.notifIcon}>{ICON_MAP[n.type] || '🔔'}</div>
            <div className={styles.notifContent}>
              <div className={styles.notifTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{n.title}</span>
                {!n.read && <span className="badge badge-primary" style={{ fontSize: 10 }}>New</span>}
              </div>
              <div className={styles.notifMsg}>{n.message}</div>
              <div className={styles.notifTime} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span>{new Date(n.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                {n.actionUrl && (
                  <Link href={n.actionUrl} style={{ color: '#003087', fontWeight: 600, fontSize: 12 }}>
                    Open Action →
                  </Link>
                )}
              </div>
            </div>
            {!n.read && <div className={styles.unreadDot} />}
          </div>
        ))}
      </div>
    </div>
  );
}
