'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { COMPETENCY_SCORES, NOTIFICATIONS, DAILY_BYTE, CAREER_PATH, IGOT_COURSES } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import styles from './overview.module.css';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const topGaps = COMPETENCY_SCORES.filter(c => c.gap === 'high' || c.gap === 'medium').sort((a, b) => (b.required - b.current) - (a.required - a.current)).slice(0, 4);
  const strengths = COMPETENCY_SCORES.filter(c => c.gap === 'none' || c.current >= c.required - 0.3);

  const radarData = COMPETENCY_SCORES.slice(0, 6).map(c => ({
    subject: c.name.split(' ')[0],
    current: (c.current / 5) * 100,
    required: (c.required / 5) * 100,
  }));

  const progressCourses = [
    { name: 'Statistical Literacy', progress: 68, mode: 'AI Guided' },
    { name: 'Design Thinking', progress: 32, mode: 'iGOT Direct' },
  ];

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>WELCOME, {(user?.name || 'Priya Sharma').toUpperCase()} 👋</h1>
          <p className={styles.welcomeSub}>{user?.designation || 'Statistical Officer'} • {user?.dept || 'Economics Statistics Division (ESD)'} • {user?.empId || 'MOS/2019/1842'}</p>
        </div>
        <div className={styles.welcomeMeta}>
          <span className="badge badge-success">● Active Learner</span>
          <span className={styles.lastLogin}>Last assessment: 3 days ago</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          { label: t('competencyScore') || 'Overall Competency', value: '3.4 / 5.0', sub: '+0.6 this quarter', color: '#003087', icon: '📊' },
          { label: t('skillReadiness') || 'Career Readiness', value: `${CAREER_PATH.readiness}%`, sub: 'for Sr. Stat. Officer', color: '#16a34a', icon: '🎯' },
          { label: t('learningProgress') || 'Courses In Progress', value: '2', sub: '1 AI Guided, 1 iGOT', color: '#7c3aed', icon: '📚' },
          { label: t('learningTime') || 'Learning Streak', value: '12 days', sub: '47 min avg daily', color: '#FF6B00', icon: '🔥' },
        ].map(k => (
          <div key={k.label} className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiIcon} style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
            <div>
              <div className={styles.kpiVal} style={{ color: k.color }}>{k.value}</div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          {/* Competency Radar */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div>
                <div className="section-title">Competency Overview</div>
                <div className="section-subtitle">Current vs. Required for your role</div>
              </div>
              <Link href="/dashboard/competency" className="btn btn-secondary btn-sm">Full Map →</Link>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar name="Required" dataKey="required" stroke="#e2e8f0" fill="#f1f5f9" fillOpacity={0.8} />
                  <Radar name="Current" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.radarLegend}>
              <span className={styles.legendDot} style={{ background: '#003087' }} />Current
              <span className={styles.legendDot} style={{ background: '#e2e8f0', marginLeft: 16 }} />Required
            </div>
          </div>

          {/* Priority Gaps */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div>
                <div className="section-title">Priority Skill Gaps</div>
                <div className="section-subtitle">Recommended for immediate focus</div>
              </div>
            </div>
            {topGaps.map(c => (
              <div key={c.id} className={styles.gapRow}>
                <div className={styles.gapInfo}>
                  <span className={styles.gapName}>{c.name}</span>
                  <span className={`badge ${c.gap === 'high' ? 'badge-error' : 'badge-warning'}`}>
                    {c.gap === 'high' ? 'High Priority' : 'Medium Priority'}
                  </span>
                </div>
                <div className={styles.gapBar}>
                  <div className={styles.gapBarInner}>
                    <div className={styles.gapCurrent} style={{ width: `${(c.current / 5) * 100}%` }} />
                    <div className={styles.gapRequired} style={{ left: `${(c.required / 5) * 100}%` }} />
                  </div>
                  <div className={styles.gapVals}>
                    <span>Current: {c.current}</span>
                    <span>Required: {c.required}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/dashboard/learn" className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
              View Personalised Learning Path →
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          {/* Daily Byte */}
          <div className={`card ${styles.section} ${styles.dailyByte}`}>
            <div className={styles.byteHeader}>
              <span>⚡ Today's Skill Byte</span>
              <span className={styles.byteDate}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className={styles.byteConcept}>{DAILY_BYTE.concept}</div>
            <p className={styles.byteExp}>{DAILY_BYTE.shortExplanation}</p>
            <Link href="/dashboard/daily" className="btn btn-accent btn-sm" style={{ marginTop: 12 }}>
              Start Today's Learning →
            </Link>
          </div>

          {/* In Progress */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div className="section-title">In Progress</div>
              <Link href="/dashboard/learn" className="btn btn-secondary btn-sm">All Courses</Link>
            </div>
            {progressCourses.map(p => (
              <div key={p.name} className={styles.progressCourse}>
                <div className={styles.pcHeader}>
                  <span className={styles.pcName}>{p.name}</span>
                  <span className={`badge ${p.mode === 'AI Guided' ? 'badge-primary' : 'badge-gray'}`}>{p.mode}</span>
                </div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <div className={styles.pcPct}>{p.progress}% complete</div>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div className="section-title">Recent Alerts</div>
              <Link href="/dashboard/notifications" className="btn btn-secondary btn-sm">All</Link>
            </div>
            {NOTIFICATIONS.slice(0, 3).map(n => (
              <div key={n.id} className={`${styles.notifRow} ${!n.read ? styles.notifUnread : ''}`}>
                <span className={styles.notifIcon}>
                  {n.type === 'new_course' ? '📚' : n.type === 'revision' ? '🔁' : n.type === 'career' ? '🎯' : '📝'}
                </span>
                <div>
                  <div className={styles.notifTitle}>{n.title}</div>
                  <div className={styles.notifMsg}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Career Card */}
          <div className={`card ${styles.section} ${styles.careerCard}`}>
            <div className={styles.careerHeader}>
              <span className={styles.careerTitle}>Career Readiness</span>
              <span className={styles.careerTarget}>→ {CAREER_PATH.target}</span>
            </div>
            <div className={styles.readinessPct}>{CAREER_PATH.readiness}%</div>
            <div className="progress-bar" style={{ margin: '8px 0' }}>
              <div className="progress-fill" style={{ width: `${CAREER_PATH.readiness}%`, background: '#16a34a' }} />
            </div>
            <div className={styles.careerEst}>Est. {CAREER_PATH.estimatedMonths} months with current pace</div>
            <Link href="/dashboard/career" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
              Explore Career Path →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
