'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { COMPETENCY_SCORES, CAREER_PATH, DEMO_USER } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<{ experience?: string; education?: string; completedCourses?: string; careerGoal?: string }>({});
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (typeof window !== 'undefined') {
      try {
        const storedOnboarding = localStorage.getItem('statpath_onboarding_data');
        if (storedOnboarding) setOnboarding(JSON.parse(storedOnboarding));

        const storedAssessment = localStorage.getItem('statpath_assessment_results');
        if (storedAssessment) setAssessment(JSON.parse(storedAssessment));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isDemo = !user || user.empId === DEMO_USER.employeeId;

  // Strengths and Gaps calculation
  const strengthsList = isDemo 
    ? COMPETENCY_SCORES.filter(c => c.gap === 'none').map(c => c.name)
    : (assessment?.strongTopics || []);

  const gapsList = isDemo
    ? COMPETENCY_SCORES.filter(c => c.gap === 'high').map(c => c.name)
    : (assessment?.weakTopics || []);

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>👤 {t('screenReader') ? 'Official Profile' : 'My Profile'}</h1>
      <div className={styles.layout}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{userInitials}</div>
          <div className={styles.name}>{user?.name || 'Registered Officer'}</div>
          <div className={styles.designation}>{user?.designation || 'Statistical Official'}</div>
          <div className={styles.empId}>{user?.empId || 'MOS/OFFICIAL'}</div>
          <div className={styles.orgBadge}>{user?.organisation || 'Ministry of Statistics & Programme Implementation'}</div>
          
          <div className={styles.infoGrid}>
            {[
              { label: 'Department / Division', value: user?.dept || 'Not Specified' },
              { label: 'Official Email', value: user?.email || 'Not Provided' },
              { label: 'Experience', value: onboarding.experience || (isDemo ? '5–10 years' : 'Pending Intake') },
              { label: 'Education', value: onboarding.education || (isDemo ? 'M.Sc. Statistics' : 'Pending Intake') },
              { label: 'Career Goal Target', value: onboarding.careerGoal || (isDemo ? CAREER_PATH.target : 'Pending Selection') },
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
              <div className={styles.sumItem}>
                <span style={{ color: '#22c55e', fontSize: 28, fontWeight: 900 }}>
                  {isDemo ? 3 : (assessment ? assessment.correctCount : 0)}
                </span>
                <span>{assessment ? 'Verified Strengths' : 'Strengths'}</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#f97316', fontSize: 28, fontWeight: 900 }}>
                  {isDemo ? 3 : (assessment ? assessment.unansweredCount : 0)}
                </span>
                <span>Unanswered</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#ef4444', fontSize: 28, fontWeight: 900 }}>
                  {isDemo ? 2 : (assessment ? assessment.incorrectCount : 0)}
                </span>
                <span>Priority Gaps</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#003087', fontSize: 24, fontWeight: 900 }}>
                  {isDemo ? '3.4' : (assessment ? assessment.scoreFormatted : 'Pending')}
                </span>
                <span>Avg. Score</span>
              </div>
            </div>
          </div>

          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Strengths</div>
            {strengthsList.length > 0 ? (
              <div className={styles.tagCloud}>
                {strengthsList.map((s: string) => <span key={s} className={styles.strengthTag}>{s}</span>)}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                {assessment ? 'No strong topics verified in baseline assessment.' : 'Complete your Baseline Assessment to reveal verified competency strengths.'}
              </p>
            )}
          </div>

          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Priority Development Areas</div>
            {gapsList.length > 0 ? (
              <div className={styles.tagCloud}>
                {gapsList.map((s: string) => <span key={s} className={styles.gapTag}>{s}</span>)}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                {assessment ? 'No critical gaps identified.' : 'Complete your Baseline Assessment to identify skill development areas.'}
              </p>
            )}
          </div>

          <div className={`card ${styles.section}`}>
            <div className="section-title" style={{ marginBottom: 12 }}>Prior Training & Online Courses</div>
            {onboarding.completedCourses ? (
              <div className={styles.historyRow}>
                <div className={styles.historyInfo}>
                  <div className={styles.historyName}>{onboarding.completedCourses}</div>
                  <div className={styles.historyMeta}>Self-Reported Training</div>
                </div>
                <span className="badge badge-success">Completed</span>
              </div>
            ) : isDemo ? (
              [{name:'Statistical Literacy',source:'IIM Bangalore',status:'Completed',date:'Mar 2024'},{name:'Design Thinking for Public Service',source:'Brhat',status:'In Progress',date:'Jul 2024'}].map(c => (
                <div key={c.name} className={styles.historyRow}>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyName}>{c.name}</div>
                    <div className={styles.historyMeta}>{c.source} • {c.date}</div>
                  </div>
                  <span className={`badge ${c.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>{c.status}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic' }}>
                No prior training reported during intake. Explore your <Link href="/dashboard/learn" style={{ color: '#003087', fontWeight: 600 }}>Learning Path</Link> to enroll.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
