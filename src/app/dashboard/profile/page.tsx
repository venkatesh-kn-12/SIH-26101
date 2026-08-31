'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { COMPETENCY_SCORES, CAREER_PATH } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<{ experience?: string; education?: string; completedCourses?: string; careerGoal?: string }>({});

  useEffect(() => {
    setUser(getCurrentUser());
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_onboarding_data');
        if (stored) setOnboarding(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const strengths = COMPETENCY_SCORES.filter(c => c.gap === 'none');
  const highGaps = COMPETENCY_SCORES.filter(c => c.gap === 'high');

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PS';

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>👤 {t('screenReader') ? 'Official Profile' : 'My Profile'}</h1>
      <div className={styles.layout}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{userInitials}</div>
          <div className={styles.name}>{user?.name || 'Priya Sharma'}</div>
          <div className={styles.designation}>{user?.designation || 'Statistical Officer'}</div>
          <div className={styles.empId}>{user?.empId || 'MOS/2019/1842'}</div>
          <div className={styles.orgBadge}>{user?.organisation || 'Ministry of Statistics & Programme Implementation'}</div>
          <div className={styles.infoGrid}>
            {[
              { label: 'Department', value: user?.dept || 'Economics Statistics Division (ESD)' },
              { label: 'Rank', value: user?.rank || 'Group A' },
              { label: 'Email', value: user?.email || 'priya.sharma@mospi.gov.in' },
              { label: 'Experience', value: onboarding.experience || '5–10 years' },
              { label: 'Education', value: onboarding.education || 'M.Sc. Statistics' },
              { label: 'Career Goal', value: onboarding.careerGoal || CAREER_PATH.target },
            ].map(i => (
              <div key={i.label} className={styles.infoItem}>
                <div className={styles.infoLabel}>{i.label}</div>
                <div className={styles.infoValue}>{i.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 16 }}>Competency Summary</div>
            <div className={styles.compSummary}>
              <div className={styles.sumItem}><span style={{ color: '#22c55e', fontSize: 28, fontWeight: 900 }}>{strengths.length}</span><span>Strengths</span></div>
              <div className={styles.sumItem}><span style={{ color: '#f97316', fontSize: 28, fontWeight: 900 }}>{COMPETENCY_SCORES.filter(c=>c.gap==='medium').length}</span><span>Medium Gaps</span></div>
              <div className={styles.sumItem}><span style={{ color: '#ef4444', fontSize: 28, fontWeight: 900 }}>{highGaps.length}</span><span>High Priority</span></div>
              <div className={styles.sumItem}><span style={{ color: '#003087', fontSize: 28, fontWeight: 900 }}>3.4</span><span>Avg. Score</span></div>
            </div>
          </div>
          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Strengths</div>
            <div className={styles.tagCloud}>{strengths.map(s => <span key={s.id} className={styles.strengthTag}>{s.name}</span>)}</div>
          </div>
          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Priority Development Areas</div>
            <div className={styles.tagCloud}>{highGaps.map(s => <span key={s.id} className={styles.gapTag}>{s.name}</span>)}</div>
          </div>
          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Learning History</div>
            {[{name:'Statistical Literacy',source:'IIM Bangalore',status:'Completed',date:'Mar 2024'},{name:'Design Thinking for Public Service',source:'Brhat',status:'In Progress',date:'Jul 2024'},{name:'Introduction to 3 New Criminal Laws',source:'Karmayogi Bharat',status:'Completed',date:'Feb 2024'}].map(c => (
              <div key={c.name} className={styles.historyRow}>
                <div className={styles.historyInfo}>
                  <div className={styles.historyName}>{c.name}</div>
                  <div className={styles.historyMeta}>{c.source} • {c.date}</div>
                </div>
                <span className={`badge ${c.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
