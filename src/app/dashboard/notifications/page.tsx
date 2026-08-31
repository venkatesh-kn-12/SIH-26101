'use client';
import { useState } from 'react';
import { NOTIFICATIONS } from '@/lib/mockData';
import styles from './notifications.module.css';

const ICON_MAP: Record<string, string> = { new_course: '📚', revision: '🔁', career: '🎯', achievement: '🏆', assessment: '📝' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const markAll = () => setNotifs(notifs.map(n => ({...n, read: true})));
  const markOne = (id: string) => setNotifs(notifs.map(n => n.id === id ? {...n, read: true} : n));

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Intelligent alerts — not generic reminders</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAll}>Mark all as read</button>
      </div>
      <div className={styles.list}>
        {notifs.map(n => (
          <div key={n.id} className={`card ${styles.notifCard} ${!n.read ? styles.unread : ''}`} onClick={() => markOne(n.id)}>
            <div className={styles.notifIcon}>{ICON_MAP[n.type]}</div>
            <div className={styles.notifContent}>
              <div className={styles.notifTitle}>{n.title}</div>
              <div className={styles.notifMsg}>{n.message}</div>
              <div className={styles.notifTime}>{new Date(n.timestamp).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            {!n.read && <div className={styles.unreadDot} />}
          </div>
        ))}
      </div>
    </div>
  );
}
