'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { DEMO_USER } from '@/lib/mockData';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/lib/LanguageContext';
import { IndiaFlag } from '@/components/IndiaFlag';
import { StatPathLogo } from '@/components/StatPathLogo';
import { getCurrentUser, logoutUser, UserProfile } from '@/lib/authStorage';
import { getNotifications, AppNotification } from '@/lib/notificationStorage';
import { Home, User, BarChart3, BookOpen, Zap, FileText, Target, Bell, LogOut, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: <Home size={18} />, label: 'Overview' },
  { href: '/dashboard/profile', icon: <User size={18} />, label: 'My Profile' },
  { href: '/dashboard/competency', icon: <BarChart3 size={18} />, label: 'Competency Map' },
  { href: '/dashboard/learn', icon: <BookOpen size={18} />, label: 'Learning Resources' },
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (typeof window !== 'undefined') {
      try {
        const storedOb = localStorage.getItem('statpath_onboarding_data');
        if (storedOb) setOnboardingData(JSON.parse(storedOb));
      } catch (e) {
        console.error(e);
      }
    }

    if (typeof window !== 'undefined' && user && user.empId !== DEMO_USER.employeeId) {
      const hasAssessed = localStorage.getItem('statpath_assessment_results');
      if (!hasAssessed) {
        router.replace('/onboarding/assessment');
        return;
      }
    }

    const loadNotifs = () => setNotifications(getNotifications());
    loadNotifs();

    window.addEventListener('statpath_notifications_updated', loadNotifs);
    return () => window.removeEventListener('statpath_notifications_updated', loadNotifs);
  }, [router]);

  const unread = notifications.filter(n => !n.read).length;
  const userInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  // Dynamic User Domain and Section Title for Top Navbar Breadcrumb
  const userDomain = onboardingData?.careerGoal || onboardingData?.completedCourses?.split(',')[0]?.trim() || currentUser?.dept || currentUser?.designation || 'Domain Competency';

  const getSectionTitle = (path: string) => {
    if (path === '/dashboard') return 'Overview';
    if (path.startsWith('/dashboard/learn')) return 'Learning Resources';
    if (path.startsWith('/dashboard/competency')) return 'Competency Map';
    if (path.startsWith('/dashboard/daily')) return 'Daily Learning';
    if (path.startsWith('/dashboard/assess')) return 'Assessments';
    if (path.startsWith('/dashboard/career')) return 'Career Simulator';
    if (path.startsWith('/dashboard/profile')) return 'My Profile';
    if (path.startsWith('/dashboard/notifications')) return 'Notifications';
    return 'Dashboard';
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}>
        <div className={styles.sidebarHeader}>
          {sidebarOpen && (
            <Link href="/dashboard" className={styles.sidebarLogo}>
              <StatPathLogo size={36} />
              <div>
                <div className={styles.logoName}>SkillPath AI</div>
                <div className={styles.logoDept}>Official iGOT Skill Intelligence Platform</div>
              </div>
            </Link>
          )}
          <button 
            className={styles.toggleBtn} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
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
                <div className={styles.userRole}>{currentUser?.designation || 'Domain Specialist'}</div>
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
            {/* DYNAMIC USER-DOMAIN BREADCRUMB */}
            <div className={styles.breadcrumb}>
              <span style={{ fontWeight: 600, color: '#475569' }}>{userDomain}</span>
              <span className={styles.sep}>/</span>
              <span style={{ fontWeight: 700, color: '#003087' }}>{getSectionTitle(pathname)}</span>
            </div>
          </div>
          <div className={styles.topBarRight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="#FF9933" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className={styles.langSelect}
                aria-label="Language Selector"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <Link href="/dashboard/notifications" className={styles.iconBtn} title="Notifications">
              <Bell size={18} />
              {unread > 0 && <span className={styles.notifDot} />}
            </Link>

            <Link href="/dashboard/profile" className={styles.profileBtn}>
              <div className={styles.userAvatarSm}>{userInitials}</div>
              <span className={styles.profileName}>{currentUser?.name || 'User'}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>

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
  );
}
