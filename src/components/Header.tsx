'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../lib/LanguageContext';
import { IndiaFlag } from './IndiaFlag';
import { StatPathLogo } from './StatPathLogo';
import styles from './Header.module.css';

interface HeaderProps {
  user?: {
    name: string;
    role: string;
    designation?: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const pathname = usePathname();
  const { language, setLanguage, highContrast, toggleHighContrast, fontSize, setFontSize, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  return (
    <header className={styles.headerContainer}>
      {/* Top MoSPI Gov Bar */}
      <div className={styles.topGovBar}>
        <div className="container">
          <div className={styles.topBarContent}>
            <div className={styles.govIdentity}>
              <IndiaFlag width={22} height={14} />
              <span className={styles.govTitleText}>
                {t('govTitle')} • {t('govSubtitle')}
              </span>
            </div>
            
            <div className={styles.accessibilityBar}>
              <button 
                onClick={cycleFontSize} 
                className={styles.accBtn} 
                title="Adjust Text Size"
                aria-label="Adjust Text Size"
              >
                Text Size: {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
              </button>
              
              <button 
                onClick={toggleHighContrast} 
                className={`${styles.accBtn} ${highContrast ? styles.activeAcc : ''}`} 
                title="Toggle High Contrast"
                aria-label="Toggle High Contrast"
              >
                Contrast {highContrast ? 'ON' : 'OFF'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '13px' }}>🌐</span>
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value as Language)}
                  className={styles.langBtn}
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
                  aria-label="Select Language"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation */}
      <nav className={styles.mainNav}>
        <div className="container">
          <div className={styles.navRow}>
            {/* Logo & Tagline */}
            <Link href="/" className={styles.logoGroup}>
              <StatPathLogo size={42} />
              <div className={styles.logoTextGroup}>
                <div className={styles.brandTitleRow}>
                  <span className={styles.brandTitle}>{t('platformName')}</span>
                  <span className={styles.govTag}>GovTech</span>
                </div>
                <span className={styles.brandTagline}>{t('platformTagline')}</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className={styles.desktopNav}>
              <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
                {t('navHome')}
              </Link>
              <Link href="/about" className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}>
                {t('navAbout')}
              </Link>
              <Link href="/how-it-works" className={`${styles.navLink} ${pathname === '/how-it-works' ? styles.active : ''}`}>
                {t('navHowItWorks')}
              </Link>
              <Link href="/ecosystem" className={`${styles.navLink} ${pathname === '/ecosystem' ? styles.active : ''}`}>
                {t('navEcosystem')}
              </Link>
              <Link href="/competencies" className={`${styles.navLink} ${pathname === '/competencies' ? styles.active : ''}`}>
                {t('navCompetencies')}
              </Link>
              <Link href="/security" className={`${styles.navLink} ${pathname === '/security' ? styles.active : ''}`}>
                {t('navSecurity')}
              </Link>
              <Link href="/faq" className={`${styles.navLink} ${pathname === '/faq' ? styles.active : ''}`}>
                {t('navFaq')}
              </Link>
            </div>

            {/* Actions / Profile */}
            <div className={styles.navActions}>
              {user ? (
                <div className={styles.userSection}>
                  <Link href="/dashboard/notifications" className={styles.iconBtn} title="Notifications">
                    🔔 <span className={styles.notifBadge}>3</span>
                  </Link>
                  <Link href={user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/dashboard'} className={styles.userProfileBtn}>
                    <div className={styles.avatar}>{user.name.charAt(0)}</div>
                    <div className={styles.userInfoHideMobile}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userRole}>{user.designation || user.role}</span>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/auth/login" className="btn btn-secondary btn-sm">
                    {t('navLogin')}
                  </Link>
                  <Link href="/auth/signup" className="btn btn-karnataka btn-sm">
                    {t('navRegister')}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button 
                className={styles.hamburgerBtn}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navHome')}</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navAbout')}</Link>
            <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navHowItWorks')}</Link>
            <Link href="/ecosystem" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navEcosystem')}</Link>
            <Link href="/competencies" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navCompetencies')}</Link>
            <Link href="/security" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navSecurity')}</Link>
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className={styles.mobileLink}>{t('navFaq')}</Link>
            
            <div className={styles.mobileAuthRow}>
              <Link href="/auth/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                {t('navLogin')}
              </Link>
              <Link href="/auth/signup" className="btn btn-karnataka btn-sm" style={{ width: '100%' }}>
                {t('navRegister')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
