'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/lib/LanguageContext';
import { IndiaFlag } from '@/components/IndiaFlag';
import { StatPathLogo } from '@/components/StatPathLogo';
import { getCurrentUser, logoutUser, UserProfile } from '@/lib/authStorage';
import { getNotifications, AppNotification } from '@/lib/notificationStorage';
import { Home, User, BarChart3, BookOpen, Zap, FileText, Target, Bell, LogOut, Globe } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: <Home size={18} />, label: 'Overview' },
  { href: '/dashboard/profile', icon: <User size={18} />, label: 'My Profile' },
  { href: '/dashboard/competency', icon: <BarChart3 size={18} />, label: 'Competency Map' },
  { href: '/dashboard/learn', icon: <BookOpen size={18} />, label: 'Learning Path' },
  { href: '/dashboard/daily', icon: <Zap size={18} />, label: 'Daily Learning' },
  { href: '/dashboard/assess', icon: <FileText size={18} />, label: 'Assessments' },
  { href: '/dashboard/career', icon: <Target size={18} />, label: 'Career Simulator' },
  { href: '/dashboard/notifications', icon: <Bell size={18} />, label: 'Notifications' },
];

const MOBILE_BOTTOM_NAV = [
  { href: '/dashboard', icon: <Home size={20} />, label: 'Home' },
  { href: '/dashboard/learn', icon: <BookOpen size={20} />, label: 'Learn' },
  { href: '/dashboard/competency', icon: <BarChart3 size={20} />, label: 'Skills' },
  { href: '/dashboard/assess', icon: <FileText size={20} />, label: 'Assess' },
  { href: '/dashboard/profile', icon: <User size={20} />, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    const loadNotifs = () => setNotifications(getNotifications());
    loadNotifs();

    window.addEventListener('statpath_notifications_updated', loadNotifs);
    return () => window.removeEventListener('statpath_notifications_updated', loadNotifs);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

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
          <button 
            className={styles.toggleBtn} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
                {item.href === '/dashboard/notifications' && unread > 0 && sidebarOpen && (
                  <span className={styles.badge}>{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userProfile}>
              <div className={styles.userAvatar}>{userInitials}</div>
              <div>
                <div className={styles.userName}>{currentUser?.name || 'Registered Officer'}</div>
                <div className={styles.userRole}>{currentUser?.designation || 'Statistical Official'}</div>
              </div>
            </div>
          )}
          <Link href="/" className={styles.logoutBtn} onClick={() => logoutUser()}>
            <LogOut size={16} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="#FF9933" />
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
              <Bell size={16} />
              {unread > 0 && <span className={styles.notifDot}>{unread}</span>}
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
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
