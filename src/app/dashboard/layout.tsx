'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { NOTIFICATIONS } from '@/lib/mockData';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/lib/LanguageContext';
import { IndiaFlag } from '@/components/IndiaFlag';
import { StatPathLogo } from '@/components/StatPathLogo';
import { getCurrentUser, logoutUser, UserProfile } from '@/lib/authStorage';

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Overview' },
  { href: '/dashboard/profile', icon: '👤', label: 'My Profile' },
  { href: '/dashboard/competency', icon: '📊', label: 'Competency Map' },
  { href: '/dashboard/learn', icon: '📚', label: 'Learning Path' },
  { href: '/dashboard/daily', icon: '⚡', label: 'Daily Learning' },
  { href: '/dashboard/assess', icon: '📝', label: 'Assessments' },
  { href: '/dashboard/career', icon: '🎯', label: 'Career Simulator' },
  { href: '/dashboard/studio', icon: '🤖', label: 'AI Knowledge Studio' },
  { href: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
];

const MOBILE_BOTTOM_NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/dashboard/learn', icon: '📚', label: 'Learn' },
  { href: '/dashboard/competency', icon: '📊', label: 'Skills' },
  { href: '/dashboard/assess', icon: '📝', label: 'Assess' },
  { href: '/dashboard/profile', icon: '👤', label: 'Profile' },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PS';

  return (
    <div className={styles.layout}>
      {/* Sidebar (Desktop) */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}>
        <div className={styles.sidebarHeader}>
          {sidebarOpen && (
            <Link href="/dashboard" className={styles.sidebarLogo}>
              <StatPathLogo size={36} />
              <div>
                <div className={styles.logoName}>StatPath AI</div>
                <div className={styles.logoDept}>Official Statistical System • MoSPI</div>
              </div>
            </Link>
          )}
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`${styles.navItem} ${active ? styles.navActive : ''}`}>
                <span className={styles.navIcon}>{item.icon}</span>
                {sidebarOpen && (
                  <span className={styles.navLabel}>
                    {item.label}
                    {item.href === '/dashboard/notifications' && unread > 0 && (
                      <span className={styles.badge}>{unread}</span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userCard}>
              <div className={styles.avatar}>{userInitials}</div>
              <div>
                <div className={styles.userName}>{currentUser?.name || 'Priya Sharma'}</div>
                <div className={styles.userRole}>{currentUser?.designation || 'Statistical Officer'}</div>
              </div>
            </div>
          )}
          <Link href="/" className={styles.logoutBtn} onClick={() => logoutUser()}>
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.breadcrumb}>
              <span>Official Statistical System (MoSPI)</span>
              <span className={styles.sep}>/</span>
              <span style={{ fontWeight: 600, color: 'var(--gov-primary)' }}>Official Portal</span>
            </div>
          </div>
          <div className={styles.topBarRight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px' }}>🌐</span>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                style={{
                  background: '#0F172A',
                  color: '#FF9933',
                  border: '1px solid #FF9933',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Select Language"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.govFlag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IndiaFlag width={20} height={13} />
              <span>MoSPI • SIH Initiative</span>
            </div>
            <Link href="/dashboard/notifications" className={styles.notifBtn}>
              🔔
              {unread > 0 && <span className={styles.notifDot}>{unread}</span>}
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>

        {/* Dedicated Mobile Bottom Navigation (Requirement #30) */}
        <nav className={styles.mobileBottomNav}>
          {MOBILE_BOTTOM_NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.mobileNavItem} ${active ? styles.mobileNavActive : ''}`}
              >
                <span className={styles.mobileNavIcon}>{item.icon}</span>
                <span className={styles.mobileNavLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
